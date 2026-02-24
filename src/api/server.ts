import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import reportRoutes from './routes/reports';
import questRoutes from './routes/quests';
import leaderboardRoutes from './routes/leaderboard';
import taskOrderRoutes from './routes/task_orders';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
// import germanComplianceRoutes from './german/compliance';
// import germanSmsRoutes from './german/sms';
import morgan from 'morgan';
import { errorHandler } from './middleware/error';
// import exceptionManager from '../services/exception_manager';

dotenv.config();

const app = express();
app.use(morgan('dev'));
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/task-orders', taskOrderRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/german', germanComplianceRoutes);
// app.use('/api/german', germanSmsRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
    // exceptionManager.info("API", `GenTrust API Server running on port ${PORT}`);
    console.log(`🚀 GenTrust API Server running on port ${PORT}`);
});

export default app;
