import request from 'supertest';
import { app } from '../src/api/server';
import { prisma } from './setup';
import bcrypt from 'bcrypt';
import path from 'path';

describe('Quests API', () => {
  let authToken: string;
  let userId: string;
  let questId: string;

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'student@example.com',
        password: hashedPassword,
        name: 'Test Student',
        role: 'STUDENT'
      }
    });
    userId = user.id;

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@example.com',
        password: 'TestPassword123!'
      });
    authToken = loginResponse.body.token;

    // Create test quest
    const quest = await prisma.quest.create({
      data: {
        title: 'Test Quest',
        description: 'This is a test quest',
        reward: 50,
        district: 'Test District',
        status: 'PUBLISHED',
        createdById: userId,
        assigneeId: userId
      }
    });
    questId = quest.id;
  });

  describe('GET /api/quests', () => {
    it('should return list of quests', async () => {
      const response = await request(app)
        .get('/api/quests')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('reward');
    });

    it('should filter quests by district', async () => {
      // Create quest in different district
      await prisma.quest.create({
        data: {
          title: 'Another Quest',
          description: 'Different district',
          reward: 30,
          district: 'Other District',
          status: 'PUBLISHED',
          createdById: userId
        }
      });

      const response = await request(app)
        .get('/api/quests?district=Test District')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.every((q: any) => q.district === 'Test District')).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/quests')
        .expect(401);
    });
  });

  describe('GET /api/quests/:id', () => {
    it('should return quest details', async () => {
      const response = await request(app)
        .get(`/api/quests/${questId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(questId);
      expect(response.body.title).toBe('Test Quest');
      expect(response.body.reward).toBe(50);
    });

    it('should return 404 for non-existent quest', async () => {
      await request(app)
        .get('/api/quests/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/quests/:id/accept', () => {
    beforeEach(async () => {
      // Reset quest to available state
      await prisma.quest.update({
        where: { id: questId },
        data: { assigneeId: null, status: 'PUBLISHED' }
      });
    });

    it('should accept an available quest', async () => {
      const response = await request(app)
        .post(`/api/quests/${questId}/accept`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.assigneeId).toBe(userId);
      expect(response.body.status).toBe('IN_PROGRESS');
    });

    it('should fail when quest already accepted', async () => {
      // Accept once
      await request(app)
        .post(`/api/quests/${questId}/accept`)
        .set('Authorization', `Bearer ${authToken}`);

      // Try to accept again
      await request(app)
        .post(`/api/quests/${questId}/accept`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('POST /api/quests/:id/complete', () => {
    beforeEach(async () => {
      // Set quest to IN_PROGRESS with current user
      await prisma.quest.update({
        where: { id: questId },
        data: { 
          assigneeId: userId,
          status: 'IN_PROGRESS'
        }
      });
    });

    it('should complete quest with photo upload', async () => {
      const testPhotoPath = path.join(__dirname, 'fixtures', 'test-photo.jpg');
      
      const response = await request(app)
        .post(`/api/quests/${questId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('deliveryCode', '12345')
        .attach('photo', testPhotoPath)
        .expect(200);

      expect(response.body.status).toBe('PENDING_VERIFICATION');
      expect(response.body.completionPhoto).toBeDefined();

      // Verify task completion record
      const completion = await prisma.taskCompletion.findFirst({
        where: { 
          taskId: questId,
          userId: userId
        }
      });
      expect(completion).toBeDefined();
      expect(completion?.status).toBe('COMPLETED');
    });

    it('should fail without photo', async () => {
      const response = await request(app)
        .post(`/api/quests/${questId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('deliveryCode', '12345')
        .expect(400);

      expect(response.body.error).toMatch(/photo required/i);
    });

    it('should fail without delivery code', async () => {
      const testPhotoPath = path.join(__dirname, 'fixtures', 'test-photo.jpg');
      
      const response = await request(app)
        .post(`/api/quests/${questId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testPhotoPath)
        .expect(400);

      expect(response.body.error).toMatch(/delivery code required/i);
    });

    it('should fail if quest not assigned to user', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          password: await bcrypt.hash('Password123!', 10),
          name: 'Other User',
          role: 'STUDENT'
        }
      });

      // Assign quest to other user
      await prisma.quest.update({
        where: { id: questId },
        data: { assigneeId: otherUser.id }
      });

      const testPhotoPath = path.join(__dirname, 'fixtures', 'test-photo.jpg');
      
      const response = await request(app)
        .post(`/api/quests/${questId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('deliveryCode', '12345')
        .attach('photo', testPhotoPath)
        .expect(403);

      expect(response.body.error).toMatch(/not assigned/i);
    });

    it('should fail if quest already completed', async () => {
      // Mark as completed
      await prisma.quest.update({
        where: { id: questId },
        data: { status: 'COMPLETED' }
      });

      const testPhotoPath = path.join(__dirname, 'fixtures', 'test-photo.jpg');
      
      const response = await request(app)
        .post(`/api/quests/${questId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('deliveryCode', '12345')
        .attach('photo', testPhotoPath)
        .expect(400);

      expect(response.body.error).toMatch(/already completed|invalid status/i);
    });
  });

  describe('POST /api/quests/:id/verify', () => {
    let adminToken: string;

    beforeEach(async () => {
      // Create admin user
      const admin = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: await bcrypt.hash('AdminPass123!', 10),
          name: 'Admin User',
          role: 'ADMIN'
        }
      });

      // Login as admin
      const adminLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'AdminPass123!'
        });
      adminToken = adminLoginResponse.body.token;

      // Set quest to PENDING_VERIFICATION
      await prisma.quest.update({
        where: { id: questId },
        data: { status: 'PENDING_VERIFICATION' }
      });
    });

    it('should verify quest as admin', async () => {
      const response = await request(app)
        .post(`/api/quests/${questId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approved: true })
        .expect(200);

      expect(response.body.status).toBe('COMPLETED');
    });

    it('should reject quest as admin', async () => {
      const response = await request(app)
        .post(`/api/quests/${questId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          approved: false,
          rejectionReason: 'Photo quality too low'
        })
        .expect(200);

      expect(response.body.status).toBe('IN_PROGRESS');
    });

    it('should fail when non-admin tries to verify', async () => {
      await request(app)
        .post(`/api/quests/${questId}/verify`)
        .set('Authorization', `Bearer ${authToken}`) // Student token
        .send({ approved: true })
        .expect(403);
    });
  });
});
