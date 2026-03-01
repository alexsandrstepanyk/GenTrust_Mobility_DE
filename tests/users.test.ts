import request from 'supertest';
import { app } from '../src/api/server';
import { prisma } from './setup';
import bcrypt from 'bcrypt';

describe('Users API', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'STUDENT',
        phone: '+49123456789',
        address: 'Test Street 1, Berlin'
      }
    });
    userId = user.id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!'
      });
    authToken = loginResponse.body.token;
  });

  describe('GET /api/users/me', () => {
    it('should return current user profile', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test User');
      expect(response.body.phone).toBe('+49123456789');
      expect(response.body.address).toBe('Test Street 1, Berlin');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/users/me')
        .expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update user profile', async () => {
      const updates = {
        name: 'Updated Name',
        phone: '+49987654321',
        address: 'New Street 2, Munich'
      };

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.name).toBe(updates.name);
      expect(response.body.phone).toBe(updates.phone);
      expect(response.body.address).toBe(updates.address);

      // Verify in database
      const dbUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      expect(dbUser?.name).toBe(updates.name);
      expect(dbUser?.phone).toBe(updates.phone);
    });

    it('should update partial fields', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Only Name Changed' })
        .expect(200);

      expect(response.body.name).toBe('Only Name Changed');
      expect(response.body.phone).toBe('+49123456789'); // Unchanged
    });

    it('should not allow updating email directly', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'hacker@example.com' })
        .expect(400);

      expect(response.body.error).toMatch(/email cannot be updated/i);
    });

    it('should not allow updating role', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: 'ADMIN' })
        .expect(400);

      expect(response.body.error).toMatch(/role cannot be updated/i);
    });

    it('should validate phone number format', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ phone: 'invalid-phone' })
        .expect(400);

      expect(response.body.error).toMatch(/invalid phone/i);
    });
  });

  describe('GET /api/users/:id/stats', () => {
    beforeEach(async () => {
      // Create some completed tasks
      await prisma.taskCompletion.createMany({
        data: [
          {
            taskId: 'quest-1',
            userId: userId,
            status: 'COMPLETED',
            earnedAmount: 50
          },
          {
            taskId: 'quest-2',
            userId: userId,
            status: 'COMPLETED',
            earnedAmount: 30
          },
          {
            taskId: 'quest-3',
            userId: userId,
            status: 'PENDING',
            earnedAmount: 20
          }
        ]
      });
    });

    it('should return user statistics', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalCompleted');
      expect(response.body).toHaveProperty('totalEarned');
      expect(response.body).toHaveProperty('averageRating');
      expect(response.body.totalCompleted).toBe(2);
      expect(response.body.totalEarned).toBe(80);
    });

    it('should allow other users to view public stats', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          password: await bcrypt.hash('Password123!', 10),
          name: 'Other User',
          role: 'STUDENT'
        }
      });

      const otherLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'Password123!'
        });
      const otherToken = otherLoginResponse.body.token;

      const response = await request(app)
        .get(`/api/users/${userId}/stats`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      expect(response.body.totalCompleted).toBeDefined();
      // Should not expose sensitive data
      expect(response.body).not.toHaveProperty('phone');
      expect(response.body).not.toHaveProperty('address');
    });
  });

  describe('POST /api/users/change-password', () => {
    it('should change password with correct old password', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'TestPassword123!',
          newPassword: 'NewSecurePass456!'
        })
        .expect(200);

      expect(response.body.message).toMatch(/password changed/i);

      // Try to login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'NewSecurePass456!'
        })
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();
    });

    it('should fail with incorrect old password', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'WrongOldPassword!',
          newPassword: 'NewSecurePass456!'
        })
        .expect(401);

      expect(response.body.error).toMatch(/incorrect.*password/i);
    });

    it('should fail with weak new password', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'TestPassword123!',
          newPassword: 'weak'
        })
        .expect(400);

      expect(response.body.error).toMatch(/password.*weak|requirements/i);
    });
  });
});
