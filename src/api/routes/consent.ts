/**
 * Digital Consent Routes (DSGVO/JArbSchG Compliance)
 * 
 * Endpoints для управління цифровими згодами батьків
 */

import { Router } from 'express';
import prisma from '../../services/prisma';
import { authenticateToken } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

// ============================================================================
// CONSENT TEMPLATES
// ============================================================================

const CONSENT_TEMPLATES: Record<string, string> = {
  de: `Ich, [PARENT_NAME], erlaube meinem Kind [CHILD_NAME] (geb. [CHILD_DOB]), an der GenTrust Mobility Plattform der Stadt Würzburg teilzunehmen. Ich verstehe die Risiken und akzeptiere die Nutzungsbedingungen. Ich bin berechtigt, Entscheidungen für mein Kind zu treffen.`,
  
  uk: `Я, [PARENT_NAME], дозволяю моїй дитині [CHILD_NAME] (нар. [CHILD_DOB]), брати участь у платформі GenTrust Mobility міста Вюрцбург. Я розумію ризики та приймаю умови використання. Я маю право приймати рішення за мою дитину.`,
  
  en: `I, [PARENT_NAME], give permission to my child [CHILD_NAME] (born [CHILD_DOB]), to participate in the GenTrust Mobility platform of Würzburg. I understand the risks and accept the terms of use. I am authorized to make decisions for my child.`
};

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/consent/templates
 * Отримати шаблони згоди мовами
 */
router.get('/templates', (req, res) => {
  try {
    res.json({
      templates: CONSENT_TEMPLATES,
      version: '1.0.0',
      languages: ['de', 'uk', 'en']
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

/**
 * GET /api/consent/my
 * Отримати мої згоди (для батька)
 */
router.get('/my', authenticateToken, async (req: any, res, next) => {
  try {
    const parentId = req.user.userId;

    const consents = await prisma.digitalConsent.findMany({
      where: { parentId },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            birthDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ consents });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/consent/child/:childId
 * Отримати згоду для конкретної дитини
 */
router.get('/child/:childId', authenticateToken, async (req: any, res, next) => {
  try {
    const parentId = req.user.userId;
    const childId = req.params.childId;

    const consent = await prisma.digitalConsent.findFirst({
      where: {
        parentId,
        childId,
        status: 'ACTIVE'
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            birthDate: true
          }
        }
      }
    });

    if (!consent) {
      return res.status(404).json({ error: 'Consent not found' });
    }

    res.json({ consent });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/consent/create
 * Створити нову згоду (e-signature)
 */
router.post('/create', authenticateToken, async (req: any, res, next) => {
  try {
    const parentId = req.user.userId;
    const { childId, language = 'de', consentVersion = '1.0.0' } = req.body;

    // Validate child relationship
    const relationship = await prisma.parentChild.findFirst({
      where: {
        parentId,
        childId,
        status: 'APPROVED'
      }
    });

    if (!relationship) {
      return res.status(400).json({ 
        error: 'Parent-child relationship not found or not approved' 
      });
    }

    // Get child details
    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: {
        firstName: true,
        lastName: true,
        birthDate: true
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Get parent details
    const parent = await prisma.user.findUnique({
      where: { id: parentId },
      select: {
        firstName: true,
        lastName: true
      }
    });

    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // Prepare consent text
    const template = CONSENT_TEMPLATES[language] || CONSENT_TEMPLATES.de;
    const consentText = template
      .replace('[PARENT_NAME]', `${parent.firstName} ${parent.lastName}`)
      .replace('[CHILD_NAME]', `${child.firstName} ${child.lastName}`)
      .replace('[CHILD_DOB]', child.birthDate || 'N/A');

    // Create signature hash (e-signature)
    const signatureData = {
      parentId,
      childId,
      timestamp: new Date().toISOString(),
      consentVersion,
      language
    };
    const signatureHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(signatureData))
      .digest('hex');

    // Get IP and User Agent
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Check if consent already exists
    const existingConsent = await prisma.digitalConsent.findFirst({
      where: {
        parentId,
        childId,
        status: 'ACTIVE'
      }
    });

    if (existingConsent) {
      return res.status(400).json({ 
        error: 'Consent already exists. Revoke it first if you want to create a new one.',
        consentId: existingConsent.id
      });
    }

    // Create consent
    const consent = await prisma.digitalConsent.create({
      data: {
        parentId,
        childId,
        consentText,
        consentVersion,
        language,
        signatureHash,
        ipAddress,
        userAgent,
        status: 'ACTIVE'
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Update child status to ACTIVE (if was PENDING)
    await prisma.user.update({
      where: { id: childId },
      data: {
        status: 'ACTIVE'
      }
    });

    res.status(201).json({
      message: 'Consent created successfully',
      consent: {
        id: consent.id,
        status: consent.status,
        signedAt: consent.signedAt,
        version: consent.consentVersion,
        language: consent.language
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/consent/:id/revoke
 * Відкликати згоду
 */
router.post('/:id/revoke', authenticateToken, async (req: any, res, next) => {
  try {
    const parentId = req.user.userId;
    const consentId = req.params.id;
    const { reason } = req.body;

    // Find consent
    const consent = await prisma.digitalConsent.findFirst({
      where: {
        id: consentId,
        parentId
      }
    });

    if (!consent) {
      return res.status(404).json({ error: 'Consent not found' });
    }

    if (consent.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Consent is not active' });
    }

    // Revoke consent
    await prisma.digitalConsent.update({
      where: { id: consentId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedBy: parentId,
        revokeReason: reason || 'No reason provided'
      }
    });

    // Update child status to PENDING (can't participate without consent)
    await prisma.user.update({
      where: { id: consent.childId },
      data: {
        status: 'PENDING'
      }
    });

    res.json({
      message: 'Consent revoked successfully',
      consentId,
      revokedAt: new Date()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/consent/verify/:childId
 * Перевірити чи є активна згода для дитини
 */
router.get('/verify/:childId', authenticateToken, async (req: any, res, next) => {
  try {
    const childId = req.params.childId;

    const consent = await prisma.digitalConsent.findFirst({
      where: {
        childId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        status: true,
        signedAt: true,
        consentVersion: true,
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      hasConsent: !!consent,
      consent: consent ? {
        id: consent.id,
        status: consent.status,
        signedAt: consent.signedAt,
        version: consent.consentVersion,
        parentName: `${consent.parent.firstName} ${consent.parent.lastName}`
      } : null
    });
  } catch (error) {
    next(error);
  }
});

export default router;
