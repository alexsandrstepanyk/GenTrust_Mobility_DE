import { Router } from 'express';
import prisma from '../../services/prisma';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        const top = await prisma.user.findMany({
            orderBy: { dignityScore: 'desc' },
            take: 20,
            select: {
                id: true,
                firstName: true,
                username: true,
                dignityScore: true,
                city: true
            }
        });
        res.json(top);
    } catch (error) {
        next(error);
    }
});

export default router;
