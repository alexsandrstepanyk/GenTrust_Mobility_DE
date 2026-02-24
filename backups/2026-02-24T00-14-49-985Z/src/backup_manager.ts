
import fs from 'fs-extra';
import path from 'path';

const SRC_DIR = path.join(__dirname, '../src');
const ENV_FILE = path.join(__dirname, '../.env');
const BACKUP_ROOT = path.join(__dirname, '../backups');

export async function runBackup() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(BACKUP_ROOT, timestamp);

        await fs.ensureDir(backupDir);

        // Копіюємо src
        if (await fs.pathExists(SRC_DIR)) {
            await fs.copy(SRC_DIR, path.join(backupDir, 'src'));
        }

        // Копіюємо .env
        if (await fs.pathExists(ENV_FILE)) {
            await fs.copy(ENV_FILE, path.join(backupDir, '.env'));
        }

        console.log(`[Backup] Резервна копія створена: ${timestamp}`);

        // Очистка старих бекапів (залишаємо останні 10)
        const backups = await fs.readdir(BACKUP_ROOT);
        if (backups.length > 10) {
            const sorted = backups.sort();
            const toDelete = sorted.slice(0, backups.length - 10);
            for (const dir of toDelete) {
                await fs.remove(path.join(BACKUP_ROOT, dir));
            }
        }
    } catch (error) {
        console.error('[Backup] Помилка резервного копіювання:', error);
    }
}

// Запуск кожні 30 секунд
if (require.main === module) {
    console.log('[Backup] Менеджер бекапів запущено (30с)');
    setInterval(runBackup, 30000);
}
