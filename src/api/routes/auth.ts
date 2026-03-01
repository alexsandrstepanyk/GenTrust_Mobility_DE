import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../services/prisma';
import { messengerHub } from '../../services/messenger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

function parseBirthDateToDate(birthDate?: string): Date | null {
    if (!birthDate) return null;

    // Supports DD.MM.YYYY and ISO-like values
    const dotFormat = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = birthDate.match(dotFormat);
    if (match) {
        const [, dd, mm, yyyy] = match;
        const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const parsed = new Date(birthDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getAgeYears(birth: Date): number {
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    const notHadBirthday = monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate());
    if (notHadBirthday) age -= 1;
    return age;
}

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

        const parsedBirthDate = parseBirthDateToDate(birthDate);
        const age = parsedBirthDate ? getAgeYears(parsedBirthDate) : null;

        // Adults (18+) -> City Hall moderation request (PENDING)
        // Minors (<18) -> Parent verification flow first (PENDING_PARENT)
        const initialStatus = age !== null && age < 18 ? 'PENDING_PARENT' : 'PENDING';

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
                status: initialStatus,
                role: 'CLIENT'
            }
        });

        const adminChatId = process.env.ADMIN_CHAT_ID;
        // Only adults are sent to City Hall moderation queue immediately
        if (adminChatId && initialStatus === 'PENDING') {
            const msg = `🆕 **Нова реєстрація клієнта**\n\n` +
                `👤 Імʼя: ${user.firstName || '—'} ${user.lastName || ''}\n` +
                `📧 Email: ${user.email || '—'}\n` +
                `🏙️ Місто: ${user.city || '—'}\n` +
                `🏠 Район: ${user.district || '—'}\n` +
                `🎂 Вік: ${age ?? '—'}\n` +
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
        res.status(201).json({
            user,
            token,
            moderation: {
                flow: initialStatus === 'PENDING' ? 'CITY_HALL' : 'PARENTAL',
                status: initialStatus
            }
        });
    } catch (error) {
        next(error);
    }
});

// Login
router.post('/login', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const loginIdentifier = (username || email)?.trim().toLowerCase();

        if (!loginIdentifier || !password) {
            return res.status(400).json({
                error: 'Email та пароль обовʼязкові',
                code: 'MISSING_CREDENTIALS'
            });
        }

        const emailLike = /.+@.+\..+/;
        if (!emailLike.test(loginIdentifier)) {
            return res.status(400).json({
                error: 'Email невірний',
                code: 'INVALID_EMAIL_FORMAT'
            });
        }

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
            return res.status(404).json({
                error: 'Такого користувача не існує',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.passwordHash) {
            console.log(`[Auth] User has no password hash: "${loginIdentifier}"`);
            return res.status(401).json({
                error: 'Для цього акаунта пароль не встановлено',
                code: 'PASSWORD_NOT_SET'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            console.log(`[Auth] Password mismatch for: "${loginIdentifier}"`);
            console.log(`[Auth] Input password length: ${password?.length}`);
            console.log(`[Auth] Input password starts with: ${password?.substring(0, 2)}...`);
            return res.status(401).json({
                error: 'Пароль невірний',
                code: 'INVALID_PASSWORD'
            });
        }

        if (user.status !== 'ACTIVE') {
            if (user.status === 'PENDING') {
                return res.status(403).json({
                    error: 'Account pending City Hall moderation',
                    code: 'PENDING_CITY_HALL'
                });
            }

            if (user.status === 'PENDING_PARENT') {
                return res.status(403).json({
                    error: 'Account pending parent approval',
                    code: 'PENDING_PARENT'
                });
            }

            if (user.status === 'REJECTED' || user.status === 'BANNED' || user.status === 'BLOCKED') {
                return res.status(403).json({
                    error: 'Account rejected or blocked',
                    code: 'ACCOUNT_RESTRICTED'
                });
            }

            return res.status(403).json({
                error: `Account status not allowed: ${user.status}`,
                code: 'ACCOUNT_NOT_ACTIVE'
            });
        }

        console.log(`[Auth] Login successful: "${loginIdentifier}"`);
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ user, token });
    } catch (error) {
        next(error);
    }
});

export default router;
