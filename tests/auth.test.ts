import request from 'supertest';
import { app } from '../src/api/server';
import { prisma } from './setup';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Authentication API', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'SecurePassword123!',
    name: 'Test User',
    role: 'STUDENT' as const
  };

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name,
        role: testUser.role
      }
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user).not.toHaveProperty('password');

      // Verify JWT token
      const decoded = jwt.verify(
        response.body.token,
        process.env.JWT_SECRET || 'test-secret'
      ) as any;
      expect(decoded.userId).toBeDefined();
      expect(decoded.email).toBe(testUser.email);
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/invalid/i);
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with missing credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: testUser.password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        email: 'new@example.com',
        password: 'NewPassword123!',
        name: 'New User',
        role: 'STUDENT'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user).not.toHaveProperty('password');

      // Verify user in database
      const dbUser = await prisma.user.findUnique({
        where: { email: newUser.email }
      });
      expect(dbUser).toBeDefined();
      expect(dbUser?.name).toBe(newUser.name);
    });

    it('should fail when registering duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email, // Already exists
          password: 'AnotherPassword123!',
          name: 'Another User',
          role: 'STUDENT'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/already exists/i);
    });

    it('should hash password before storing', async () => {
      const newUser = {
        email: 'secure@example.com',
        password: 'PlainTextPassword123!',
        name: 'Secure User',
        role: 'STUDENT'
      };

      await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      const dbUser = await prisma.user.findUnique({
        where: { email: newUser.email }
      });

      expect(dbUser?.password).not.toBe(newUser.password);
      expect(dbUser?.password).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify valid JWT token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should fail with invalid token', async () => {
      await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should fail without authorization header', async () => {
      await request(app)
        .get('/api/auth/verify')
        .expect(401);
    });
  });
});
