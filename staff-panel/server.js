import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Get all tasks that need verification
app.get('/api/staff/quests-pending', async (req, res) => {
  try {
    const quests = await prisma.quest.findMany({
      where: {
        status: { in: ['PENDING_VERIFICATION', 'SUBMITTED'] }
      },
      include: {
        requester: { select: { name: true, email: true } },
        scout: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific quest with full details
app.get('/api/staff/quests/:id', async (req, res) => {
  try {
    const quest = await prisma.quest.findUnique({
      where: { id: req.params.id },
      include: {
        requester: { select: { name: true, email: true } },
        scout: { select: { name: true, email: true } }
      }
    });
    if (!quest) return res.status(404).json({ error: 'Quest not found' });
    res.json(quest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify/approve quest completion
app.post('/api/staff/quests/:id/approve', async (req, res) => {
  try {
    const { verifiedBy } = req.body;
    const quest = await prisma.quest.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        verifiedAt: new Date(),
        verifiedBy
      }
    });

    // Send push notification to scout
    if (quest.scoutId) {
      // TODO: Send push notification via Expo
    }

    res.json({ success: true, quest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject quest with reason
app.post('/api/staff/quests/:id/reject', async (req, res) => {
  try {
    const { reason, rejectedBy } = req.body;
    const quest = await prisma.quest.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        rejectedAt: new Date(),
        rejectedBy
      }
    });

    res.json({ success: true, quest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get staff dashboard stats
app.get('/api/staff/stats', async (req, res) => {
  try {
    const pending = await prisma.quest.count({
      where: { status: { in: ['PENDING_VERIFICATION', 'SUBMITTED'] } }
    });
    const approved = await prisma.quest.count({
      where: { status: 'COMPLETED' }
    });
    const rejected = await prisma.quest.count({
      where: { status: 'REJECTED' }
    });

    res.json({ pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Staff panel server running on port 3001');
});
