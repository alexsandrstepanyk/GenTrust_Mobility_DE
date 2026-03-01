import axios from 'axios';
import prisma from './prisma';

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

export async function sendExpoPush(
    pushToken: string,
    title: string,
    body: string,
    data: Record<string, any> = {}
) {
    if (!pushToken) return false;
    try {
        await axios.post(EXPO_PUSH_API, {
            to: pushToken,
            sound: 'default',
            title,
            body,
            data
        });
        return true;
    } catch (error) {
        console.error('[PUSH] sendExpoPush error:', error);
        return false;
    }
}

export async function sendPushToUser(
    userId: string,
    title: string,
    body: string,
    data: Record<string, any> = {}
) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pushToken: true }
    });

    if (!user?.pushToken) return false;
    return sendExpoPush(user.pushToken, title, body, data);
}

export async function sendPushToUsers(
    userIds: string[],
    title: string,
    body: string,
    data: Record<string, any> = {}
) {
    const unique = Array.from(new Set(userIds.filter(Boolean)));
    const users = await prisma.user.findMany({
        where: { id: { in: unique } },
        select: { id: true, pushToken: true }
    });

    await Promise.all(
        users
            .filter((u) => !!u.pushToken)
            .map((u) => sendExpoPush(u.pushToken!, title, body, data))
    );
}
