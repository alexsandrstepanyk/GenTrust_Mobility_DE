import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../services/prisma';
import { messengerHub } from '../../services/messenger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Register
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, city, country, district, language, birthDate, school, grade } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        console.log(`[Auth] Registering user: "${normalizedEmail}" (password length: ${password?.length})`);

        const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                passwordHash,
                firstName,
                lastName,
                city,
                district,
                birthDate,
                school,
                grade,
                language: language || 'uk',
                country: country || 'DE',
                status: 'PENDING',
                role: 'CLIENT'
            }
        });

        const adminChatId = process.env.ADMIN_CHAT_ID;
        if (adminChatId) {
            const msg = `🆕 **Нова реєстрація клієнта**\n\n` +
                `👤 Імʼя: ${user.firstName || '—'} ${user.lastName || ''}\n` +
                `📧 Email: ${user.email || '—'}\n` +
                `🏙️ Місто: ${user.city || '—'}\n` +
                `🏠 Район: ${user.district || '—'}\n` +
                `🆔 User ID: ${user.id}`;

            await messengerHub.sendToMaster(Number(adminChatId), msg, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '✅ Підтвердити', callback_data: `approve_user_${user.id}` }],
                        [{ text: '❌ Відхилити', callback_data: `reject_user_${user.id}` }]
                    ]
                }
            });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user, token });
    } catch (error) {
        next(error);
    }
});

// Login
router.post('/login', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const loginIdentifier = (username || email)?.trim().toLowerCase();

        console.log(`[Auth] Login attempt for: "${loginIdentifier}"`);

        const user = await prisma.user.findFirst({ 
            where: { 
                OR: [
                    { email: loginIdentifier },
                    { username: loginIdentifier }
                ]
            } 
        });
        if (!user) {
            console.log(`[Auth] User not found: "${loginIdentifier}"`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.passwordHash) {
            console.log(`[Auth] User has no password hash: "${loginIdentifier}"`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            console.log(`[Auth] Password mismatch for: "${loginIdentifier}"`);
            console.log(`[Auth] Input password length: ${password?.length}`);
            console.log(`[Auth] Input password starts with: ${password?.substring(0, 2)}...`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`[Auth] Login successful: "${loginIdentifier}"`);
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ user, token });
    } catch (error) {
        next(error);
    }
});

export default router;
