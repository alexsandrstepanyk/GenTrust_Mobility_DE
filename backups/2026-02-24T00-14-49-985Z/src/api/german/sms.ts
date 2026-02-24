/**
 * SMS Verification API for Parent Verification (German Compliance)
 * Sends 6-digit codes via SMS for parent identity verification
 * 
 * @link https://www.twilio.com/docs/sms
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { auth } from '../middleware/auth';
import { z } from 'zod';
import crypto from 'crypto';

const router = Router();

// ============================================
// CONFIGURATION
// ============================================

// Use Twilio in production, mock in development
const USE_TWILIO = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;

// Mock SMS storage for development
const mockSmsCodes: Map<string, { code: string; expiresAt: Date; purpose: string }> = new Map();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate 6-digit verification code
 */
function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Send SMS via Twilio (production) or console (development)
 */
async function sendSMS(phoneNumber: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const message = `Ihr GenTrust Verifizierungscode: ${code}. Gültig für 10 Minuten. Teilen Sie diesen Code nicht mit anderen.`;
  
  if (USE_TWILIO) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  } else {
    // Development mode - log to console
    console.log('📱 MOCK SMS:', phoneNumber, message);
    mockSmsCodes.set(phoneNumber, {
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      purpose: 'PARENT_VERIFY'
    });
    return { success: true, messageId: 'mock-' + Date.now() };
  }
}

/**
 * Validate phone number format (German numbers)
 */
function isValidGermanPhoneNumber(phone: string): boolean {
  // German phone number regex
  const regex = /^(\+49|0049|0)[1-9]\d{8,14}$/;
  return regex.test(phone.replace(/[\s\-\/]/g, ''));
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const SendCodeSchema = z.object({
  phone: z.string().min(10).max(20),
  purpose: z.enum(['PARENT_VERIFY', 'PHONE_CHANGE', 'SECURITY']).default('PARENT_VERIFY'),
  parentEmail: z.string().email().optional(),
});

const VerifyCodeSchema = z.object({
  phone: z.string().min(10).max(20),
  code: z.string().length(6),
});

// ============================================
// API ENDPOINTS
// ============================================

/**
 * POST /api/german/sms/send-code
 * Send verification code to phone number
 */
router.post('/sms/send-code', async (req: Request, res: Response) => {
  try {
    const { phone, purpose, parentEmail } = SendCodeSchema.parse(req.body);
    
    // Validate phone number format
    if (!isValidGermanPhoneNumber(phone)) {
      return res.status(400).json({ 
        error: 'Invalid phone number format',
        message: 'Please provide a valid German phone number (e.g., +49 123 456789)'
      });
    }
    
    // Check if phone already verified
    if (purpose === 'PARENT_VERIFY') {
      const existingParent = await prisma.parent.findFirst({
        where: { phone, smsVerified: true }
      });
      
      if (existingParent) {
        return res.status(400).json({
          error: 'Phone already verified',
          message: 'This phone number is already verified for another parent account.'
        });
      }
    }
    
    // Check rate limiting (max 3 codes per hour per phone)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentVerifications = await prisma.sMSVerification.findMany({
      where: {
        phone,
        createdAt: { gte: oneHourAgo }
      }
    });
    
    if (recentVerifications.length >= 3) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many verification attempts. Please try again in 1 hour.',
        retryAfter: 3600
      });
    }
    
    // Generate code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store verification record
    await prisma.sMSVerification.create({
      data: {
        phone,
        code,
        purpose,
        expiresAt,
        attempts: 0,
        maxAttempts: 3
      }
    });
    
    // Send SMS
    const result = await sendSMS(phone, code);
    
    if (!result.success) {
      return res.status(500).json({
        error: 'Failed to send SMS',
        message: result.error
      });
    }
    
    res.json({
      success: true,
      message: 'Verification code sent',
      phone: phone.substring(0, 4) + '***' + phone.substring(phone.length - 3),
      expiresInSeconds: 600,
      messageId: result.messageId
    });
    
  } catch (error) {
    console.error('Send code error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/german/sms/verify-code
 * Verify the code entered by user
 */
router.post('/sms/verify-code', async (req: Request, res: Response) => {
  try {
    const { phone, code } = VerifyCodeSchema.parse(req.body);
    
    // Find latest unverified code for this phone
    const verification = await prisma.sMSVerification.findFirst({
      where: {
        phone,
        verified: false,
        expiresAt: { gt: new Date() } // Not expired
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!verification) {
      return res.status(400).json({
        error: 'No valid verification code found',
        message: 'The code has expired or was already used. Please request a new one.'
      });
    }
    
    // Check attempts
    if (verification.attempts >= verification.maxAttempts) {
      return res.status(400).json({
        error: 'Max attempts exceeded',
        message: 'Too many incorrect attempts. Please request a new code.'
      });
    }
    
    // Verify code
    if (verification.code !== code) {
      // Increment attempts
      await prisma.sMSVerification.update({
        where: { id: verification.id },
        data: { attempts: verification.attempts + 1 }
      });
      
      const remainingAttempts = verification.maxAttempts - verification.attempts - 1;
      
      return res.status(400).json({
        error: 'Invalid code',
        message: `The code you entered is incorrect. ${remainingAttempts} attempts remaining.`
      });
    }
    
    // Code is correct - mark as verified
    await prisma.sMSVerification.update({
      where: { id: verification.id },
      data: {
        verified: true,
        verifiedAt: new Date()
      }
    });
    
    // If this is for parent verification, update parent record
    if (verification.purpose === 'PARENT_VERIFY') {
      const parent = await prisma.parent.findFirst({
        where: { phone }
      });
      
      if (parent) {
        await prisma.parent.update({
          where: { id: parent.id },
          data: { smsVerified: true }
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Phone number verified successfully',
      phone: phone.substring(0, 4) + '***' + phone.substring(phone.length - 3)
    });
    
  } catch (error) {
    console.error('Verify code error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/german/sms/status
 * Check verification status for a phone number
 */
router.get('/sms/status/:phone', async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    
    // Check if parent exists and is verified
    const parent = await prisma.parent.findFirst({
      where: { phone },
      select: {
        id: true,
        smsVerified: true,
        emailVerified: true,
        createdAt: true
      }
    });
    
    // Check for pending verifications
    const pendingVerification = await prisma.sMSVerification.findFirst({
      where: {
        phone,
        verified: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      phone: phone.substring(0, 4) + '***' + phone.substring(phone.length - 3),
      parent: parent ? {
        exists: true,
        smsVerified: parent.smsVerified,
        emailVerified: parent.emailVerified,
        createdAt: parent.createdAt
      } : {
        exists: false
      },
      pendingVerification: pendingVerification ? {
        expiresAt: pendingVerification.expiresAt,
        attempts: pendingVerification.attempts,
        maxAttempts: pendingVerification.maxAttempts
      } : null
    });
    
  } catch (error) {
    console.error('SMS status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/german/sms/resend
 * Resend verification code (after cooldown)
 */
router.post('/sms/resend', async (req: Request, res: Response) => {
  try {
    const { phone, purpose } = z.object({
      phone: z.string().min(10).max(20),
      purpose: z.enum(['PARENT_VERIFY', 'PHONE_CHANGE', 'SECURITY']).default('PARENT_VERIFY')
    }).parse(req.body);
    
    // Check cooldown (2 minutes between resends)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const recentVerification = await prisma.sMSVerification.findFirst({
      where: {
        phone,
        createdAt: { gte: twoMinutesAgo }
      }
    });
    
    if (recentVerification) {
      const cooldownSeconds = Math.ceil((recentVerification.createdAt.getTime() + 2 * 60 * 1000 - Date.now()) / 1000);
      return res.status(429).json({
        error: 'Cooldown active',
        message: `Please wait ${cooldownSeconds} seconds before requesting a new code.`,
        retryAfter: cooldownSeconds
      });
    }
    
    // Generate and send new code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await prisma.sMSVerification.create({
      data: {
        phone,
        code,
        purpose,
        expiresAt,
        attempts: 0,
        maxAttempts: 3
      }
    });
    
    const result = await sendSMS(phone, code);
    
    if (!result.success) {
      return res.status(500).json({
        error: 'Failed to send SMS',
        message: result.error
      });
    }
    
    res.json({
      success: true,
      message: 'New verification code sent',
      phone: phone.substring(0, 4) + '***' + phone.substring(phone.length - 3),
      expiresInSeconds: 600
    });
    
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
