/**
 * German Compliance API - JArbSchG Working Hours Tracker
 * Jugendarbeitsschutzgesetz Compliance for users aged 14-17
 * 
 * @link https://www.gesetze-im-internet.de/jarbschg/
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { auth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// ============================================
// TYPES & INTERFACES
// ============================================

interface JArbSchGLimits {
  maxHoursPerDay: number;      // Max 2 hours for 14-15, 3 hours for 16-17
  maxHoursPerWeek: number;     // Max 5 days per week
  maxHoursPerWeekTotal: number; // Max 7 hours per week (14-15), 8 hours (16-17)
  breakAfterMinutes: number;   // Break required after 45 minutes
  minBreakMinutes: number;     // Min 30 minutes break
  noWorkSunday: boolean;       // No work on Sunday
  noWorkHoliday: boolean;      // No work on public holidays
  noWorkAfter20h: boolean;     // No work after 20:00
  noWorkBefore8h: boolean;     // No work before 08:00
}

// ============================================
// CONSTANTS
// ============================================

const LIMITS_14_15: JArbSchGLimits = {
  maxHoursPerDay: 2,
  maxHoursPerWeek: 5,
  maxHoursPerWeekTotal: 7,
  breakAfterMinutes: 45,
  minBreakMinutes: 30,
  noWorkSunday: true,
  noWorkHoliday: true,
  noWorkAfter20h: true,
  noWorkBefore8h: true,
};

const LIMITS_16_17: JArbSchGLimits = {
  maxHoursPerDay: 3,
  maxHoursPerWeek: 5,
  maxHoursPerWeekTotal: 8,
  breakAfterMinutes: 60,
  minBreakMinutes: 30,
  noWorkSunday: true,
  noWorkHoliday: true,
  noWorkAfter20h: true,
  noWorkBefore8h: true,
};

// German public holidays 2026 (Bayern/Würzburg)
const PUBLIC_HOLIDAYS_2026 = [
  '2026-01-01', // Neujahr
  '2026-01-06', // Heilige Drei Könige (Bayern)
  '2026-04-03', // Karfreitag
  '2026-04-06', // Ostermontag
  '2026-05-01', // Tag der Arbeit
  '2026-05-14', // Christi Himmelfahrt
  '2026-05-25', // Pfingstmontag
  '2026-06-04', // Fronleichnam (Bayern)
  '2026-08-15', // Mariä Himmelfahrt (Bayern, teilweise)
  '2026-10-03', // Tag der Deutschen Einheit
  '2026-11-01', // Allerheiligen (Bayern)
  '2026-12-25', // 1. Weihnachtstag
  '2026-12-26', // 2. Weihnachtstag
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get age from birth date
 */
function getAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get applicable JArbSchG limits based on age
 */
function getLimitsForAge(age: number): JArbSchGLimits {
  if (age >= 14 && age <= 15) {
    return LIMITS_14_15;
  } else if (age >= 16 && age <= 17) {
    return LIMITS_16_17;
  }
  throw new Error('User age not in JArbSchG range (14-17)');
}

/**
 * Check if date is a Sunday or public holiday
 */
function isNonWorkDay(date: Date): { isNonWork: boolean; reason: string } {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const dateStr = date.toISOString().split('T')[0];
  
  if (dayOfWeek === 0) {
    return { isNonWork: true, reason: 'Sunday' };
  }
  
  if (PUBLIC_HOLIDAYS_2026.includes(dateStr)) {
    return { isNonWork: true, reason: 'Public Holiday' };
  }
  
  return { isNonWork: false, reason: '' };
}

/**
 * Calculate working hours between two timestamps
 */
function calculateWorkingHours(startTime: Date, endTime: Date): {
  totalHours: number;
  breakHours: number;
  netHours: number;
} {
  const totalMs = endTime.getTime() - startTime.getTime();
  const totalHours = totalMs / (1000 * 60 * 60);
  
  // Automatic break deduction: 30 min after 4.5 hours
  let breakHours = 0;
  if (totalHours > 4.5) {
    breakHours = 0.5;
  } else if (totalHours > 6) {
    breakHours = 1.0;
  }
  
  const netHours = totalHours - breakHours;
  
  return { totalHours, breakHours, netHours };
}

/**
 * Validate working hours against JArbSchG limits
 */
function validateWorkingHours(
  userId: string,
  date: Date,
  startTime: Date,
  endTime: Date,
  limits: JArbSchGLimits
): {
  isCompliant: boolean;
  violations: string[];
  warnings: string[];
} {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  // Check non-work day
  const nonWorkCheck = isNonWorkDay(date);
  if (nonWorkCheck.isNonWork) {
    violations.push(`Work on ${nonWorkCheck.reason} is prohibited`);
  }
  
  // Check time of day
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  
  if (limits.noWorkBefore8h && startHour < 8) {
    violations.push(`Work before 08:00 is prohibited (started at ${startHour}:00)`);
  }
  
  if (limits.noWorkAfter20h && endHour > 20) {
    violations.push(`Work after 20:00 is prohibited (ended at ${endHour}:00)`);
  }
  
  // Calculate hours
  const { totalHours, netHours } = calculateWorkingHours(startTime, endTime);
  
  // Check daily limit
  if (netHours > limits.maxHoursPerDay) {
    violations.push(
      `Daily limit exceeded: ${netHours.toFixed(2)}h > ${limits.maxHoursPerDay}h`
    );
  }
  
  // Check break requirement
  if (netHours > limits.breakAfterMinutes / 60) {
    // Break should be taken, check if recorded
    warnings.push(`Break required after ${limits.breakAfterMinutes} minutes of work`);
  }
  
  return {
    isCompliant: violations.length === 0,
    violations,
    warnings,
  };
}

/**
 * Get weekly working hours for a user
 */
async function getWeeklyHours(
  userId: string,
  weekStart: Date
): Promise<number> {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  const logs = await prisma.workingHoursLog.findMany({
    where: {
      userId,
      date: {
        gte: weekStart,
        lt: weekEnd,
      },
    },
  });
  
  return logs.reduce((sum, log) => sum + log.netHours, 0);
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const StartWorkSchema = z.object({
  questId: z.string().optional(),
  activityType: z.enum(['QUEST', 'REPORT', 'VOLUNTEER']),
});

const EndWorkSchema = z.object({
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
});

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /api/german/working-hours/check
 * Check if user can start working right now (JArbSchG compliance)
 */
router.get('/working-hours/check', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { birthDate: true, age: true },
    });
    
    if (!user || !user.birthDate) {
      return res.status(400).json({ error: 'Birth date not found' });
    }
    
    const age = getAge(user.birthDate);
    
    // Only apply JArbSchG for 14-17
    if (age < 14 || age > 17) {
      return res.json({
        requiresCompliance: false,
        message: 'User not in JArbSchG age range',
      });
    }
    
    const limits = getLimitsForAge(age);
    const now = new Date();
    
    // Check if today is a non-work day
    const nonWorkCheck = isNonWorkDay(now);
    if (nonWorkCheck.isNonWork) {
      return res.json({
        canWork: false,
        reason: `Today is ${nonWorkCheck.reason} - work prohibited for minors`,
        limits,
      });
    }
    
    // Check current time
    const currentHour = now.getHours();
    if (currentHour < 8 || currentHour >= 20) {
      return res.json({
        canWork: false,
        reason: 'Work only allowed between 08:00 and 20:00',
        limits,
      });
    }
    
    // Check if already working today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const existingLog = await prisma.workingHoursLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });
    
    if (existingLog && existingLog.startTime && !existingLog.endTime) {
      return res.json({
        canWork: false,
        reason: 'Already working today - end current session first',
        currentSession: existingLog,
      });
    }
    
    // Calculate today's hours
    const todayHours = existingLog?.netHours || 0;
    if (todayHours >= limits.maxHoursPerDay) {
      return res.json({
        canWork: false,
        reason: `Daily limit reached: ${todayHours.toFixed(2)}h / ${limits.maxHoursPerDay}h`,
        limits,
      });
    }
    
    // Check weekly limit
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    const weeklyHours = await getWeeklyHours(userId, weekStart);
    
    if (weeklyHours >= limits.maxHoursPerWeekTotal) {
      return res.json({
        canWork: false,
        reason: `Weekly limit reached: ${weeklyHours.toFixed(2)}h / ${limits.maxHoursPerWeekTotal}h`,
        limits,
      });
    }
    
    // All checks passed
    const remainingToday = limits.maxHoursPerDay - todayHours;
    const remainingWeek = limits.maxHoursPerWeekTotal - weeklyHours;
    
    return res.json({
      canWork: true,
      limits,
      todayHours: todayHours.toFixed(2),
      weeklyHours: weeklyHours.toFixed(2),
      remainingToday: remainingToday.toFixed(2),
      remainingWeek: remainingWeek.toFixed(2),
    });
  } catch (error) {
    console.error('Working hours check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/german/working-hours/start
 * Start a work session (log start time)
 */
router.post('/working-hours/start', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const body = StartWorkSchema.parse(req.body);
    
    // First check if user can work
    const checkRes = await fetch(`http://localhost:3000/api/german/working-hours/check`, {
      headers: { Authorization: req.headers.authorization! },
    });
    const checkData = await checkRes.json();
    
    if (!checkData.canWork) {
      return res.status(403).json({
        error: 'JArbSchG violation',
        reason: checkData.reason,
      });
    }
    
    // Create or update working hours log
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const log = await prisma.workingHoursLog.upsert({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        },
      },
      update: {
        startTime: today,
        activityType: body.activityType,
        questId: body.questId,
      },
      create: {
        userId,
        date: dateOnly,
        startTime: today,
        activityType: body.activityType,
        questId: body.questId,
        totalHours: 0,
        breakHours: 0,
        netHours: 0,
      },
    });
    
    res.json({
      success: true,
      message: 'Work session started',
      session: log,
      limits: checkData.limits,
    });
  } catch (error) {
    console.error('Start work session error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/german/working-hours/end
 * End a work session (log end time, calculate hours)
 */
router.post('/working-hours/end', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const body = EndWorkSchema.parse(req.body);
    
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Get existing log
    const log = await prisma.workingHoursLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        },
      },
    });
    
    if (!log || !log.startTime) {
      return res.status(400).json({ error: 'No active work session found' });
    }
    
    // Calculate hours
    const { totalHours, breakHours, netHours } = calculateWorkingHours(
      new Date(log.startTime),
      today
    );
    
    // Get user age for limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { birthDate: true },
    });
    
    let isCompliant = true;
    let violations: string[] = [];
    
    if (user?.birthDate) {
      const age = getAge(user.birthDate);
      if (age >= 14 && age <= 17) {
        const limits = getLimitsForAge(age);
        const validation = validateWorkingHours(
          userId,
          dateOnly,
          new Date(log.startTime),
          today,
          limits
        );
        isCompliant = validation.isCompliant;
        violations = validation.violations;
      }
    }
    
    // Update log
    const updatedLog = await prisma.workingHoursLog.update({
      where: { id: log.id },
      data: {
        endTime: today,
        breakStart: body.breakStart ? new Date(body.breakStart) : null,
        breakEnd: body.breakEnd ? new Date(body.breakEnd) : null,
        totalHours,
        breakHours,
        netHours,
        isCompliant,
        violations: violations.length > 0 ? JSON.stringify(violations) : null,
      },
    });
    
    res.json({
      success: true,
      message: 'Work session ended',
      session: updatedLog,
      summary: {
        totalHours: totalHours.toFixed(2),
        netHours: netHours.toFixed(2),
        isCompliant,
        violations,
      },
    });
  } catch (error) {
    console.error('End work session error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/german/working-hours/history
 * Get working hours history for a user
 */
router.get('/working-hours/history', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { days = '30' } = req.query;
    const numDays = parseInt(days as string);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays);
    
    const logs = await prisma.workingHoursLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'desc' },
      include: {
        quest: {
          select: {
            title: true,
            type: true,
          },
        },
      },
    });
    
    // Calculate summary
    const totalHours = logs.reduce((sum, log) => sum + log.netHours, 0);
    const compliantDays = logs.filter((log) => log.isCompliant).length;
    const violationDays = logs.filter((log) => !log.isCompliant).length;
    
    res.json({
      logs,
      summary: {
        totalDays: logs.length,
        totalHours: totalHours.toFixed(2),
        compliantDays,
        violationDays,
        complianceRate: ((compliantDays / logs.length) * 100).toFixed(1) + '%',
      },
    });
  } catch (error) {
    console.error('Working hours history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/german/working-hours/weekly-report
 * Get weekly report for parent/youth office
 */
router.get('/working-hours/weekly-report', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get current week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const logs = await prisma.workingHoursLog.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      include: {
        quest: {
          select: {
            title: true,
            type: true,
            reward: true,
          },
        },
      },
    });
    
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        birthDate: true,
        balance: true,
      },
    });
    
    const totalHours = logs.reduce((sum, log) => sum + log.netHours, 0);
    const totalEarnings = logs.reduce((sum, log) => sum + (log.quest?.reward || 0), 0);
    
    res.json({
      period: {
        start: weekStart.toISOString().split('T')[0],
        end: weekEnd.toISOString().split('T')[0],
      },
      user: {
        name: `${user?.firstName} ${user?.lastName}`,
        age: user?.birthDate ? getAge(user.birthDate) : null,
      },
      summary: {
        totalDays: logs.length,
        totalHours: totalHours.toFixed(2),
        totalEarnings: totalEarnings.toFixed(2),
        currentBalance: user?.balance?.toFixed(2) || '0.00',
      },
      activities: logs.map((log) => ({
        date: log.date.toISOString().split('T')[0],
        activityType: log.activityType,
        questTitle: log.quest?.title || null,
        hours: log.netHours.toFixed(2),
        earnings: log.quest?.reward?.toFixed(2) || '0.00',
        compliant: log.isCompliant,
      })),
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
