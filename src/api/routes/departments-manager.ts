import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getDepartmentPrisma } from '../../utils/departmentDatabaseManager';

const router = express.Router();
const prisma = new PrismaClient();
const execAsync = promisify(exec);

const PROJECT_DIR = '/Users/apple/Desktop/GenTrust_Mobility_DE';
const DEPARTMENTS_DIR = path.join(PROJECT_DIR, 'departments');
const DATABASES_DIR = path.join(PROJECT_DIR, 'databases');
const DEPARTMENT_SCHEMA_TEMPLATE = path.join(PROJECT_DIR, 'prisma', 'schema_departments.prisma');

// ========================================
// ОТРИМАТИ ВСІ ДЕПАРТАМЕНТИ
// ========================================
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { role: true }
        });

        if (user?.role !== 'CITY_HALL' && user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Тільки City Hall може керувати департаментами' });
        }

        const departments = await prisma.department.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        employees: true,
                        reports: true
                    }
                }
            }
        });

        const transformed = departments.map((dept: any) => ({
            ...dept,
            _count: {
                users: dept?._count?.employees || 0,
                reports: dept?._count?.reports || 0
            }
        }));

        res.json(transformed);
    } catch (error: any) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// ОТРИМАТИ ДЕТАЛІ ДЕПАРТАМЕНТУ
// ========================================
router.get('/:id', authenticateToken, async (req: any, res) => {
    try {
        const department = await prisma.department.findUnique({
            where: { id: req.params.id },
            include: {
                employees: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                },
                reports: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!department) {
            return res.status(404).json({ error: 'Департамент не знайдено' });
        }

        res.json(department);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// СТВОРИТИ НОВИЙ ДЕПАРТАМЕНТ
// ========================================
router.post('/create', authenticateToken, async (req: any, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { role: true }
        });

        if (user?.role !== 'CITY_HALL' && user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Тільки City Hall може створювати департаменти' });
        }

        const {
            nameUa,
            nameEn,
            color,
            icon,
            description,
            responsibilities,
            regions,
            contactEmail,
            contactPhone,
            budget,
            autoApproveReports,
            requiresPhotoForReports
        } = req.body;

        if (!nameUa || !description) {
            return res.status(400).json({ error: 'nameUa та description є обовʼязковими' });
        }

        const safeNameEn = (nameEn || nameUa || '').trim();
        const serializedResponsibilities = Array.isArray(responsibilities)
            ? JSON.stringify(responsibilities)
            : (typeof responsibilities === 'string' ? responsibilities : JSON.stringify([]));
        const serializedRegions = Array.isArray(regions)
            ? JSON.stringify(regions)
            : (typeof regions === 'string' ? regions : JSON.stringify([]));

        // Перевірка унікальності назви
        const existing = await prisma.department.findFirst({
            where: {
                OR: [
                    { nameUa: nameUa },
                    { nameEn: nameEn }
                ]
            }
        });

        if (existing) {
            return res.status(400).json({ 
                error: 'Департамент з такою назвою вже існує',
                field: existing.nameUa === nameUa ? 'nameUa' : 'nameEn'
            });
        }

        // Генерація ID та slug
        const slug = nameUa.toLowerCase()
            .replace(/[^а-яіїєґa-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const departmentId = `dept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Створення департаменту в БД
        const department = await prisma.department.create({
            data: {
                id: departmentId,
                slug,
                nameUa,
                nameEn: safeNameEn,
                color,
                icon,
                description,
                responsibilities: serializedResponsibilities,
                regions: serializedRegions,
                contactEmail,
                contactPhone,
                budget: budget || 0,
                autoApproveReports: autoApproveReports || false,
                requiresPhotoForReports: requiresPhotoForReports || true,
                status: 'ACTIVE'
            }
        });

        // Створення окремої БД департаменту + таблиць
        const departmentDbPath = await initializeDepartmentDatabase(slug);

        // Створення папки департаменту
        const deptDir = path.join(DEPARTMENTS_DIR, slug);
        
        if (!fs.existsSync(deptDir)) {
            fs.mkdirSync(deptDir, { recursive: true });
        }

        // Копіювання шаблону
        const templateDir = path.join(DEPARTMENTS_DIR, 'roads');
        await copyDirectory(templateDir, deptDir);

        // Оновлення package.json
        const packageJsonPath = path.join(deptDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            packageJson.name = `${slug}-department-dashboard`;
            packageJson.description = `${nameUa} (${nameEn}) - GenTrust Mobility`;
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        }

        // Оновлення index.html
        const indexHtmlPath = path.join(deptDir, 'index.html');
        if (fs.existsSync(indexHtmlPath)) {
            let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
            indexHtml = indexHtml.replace(/Roads Department/g, nameUa);
            indexHtml = indexHtml.replace(/Дороги/g, nameUa);
            fs.writeFileSync(indexHtmlPath, indexHtml);
        }

        // Додавання в загальний список департаментів
        await updateDepartmentsRegistry(slug, {
            id: departmentId,
            name: nameUa,
            nameEn: nameEn,
            slug,
            color,
            icon,
            port: 5180 + (await prisma.department.count()) // Автоматичний вибір порту
        });

        console.log(`✅ Департамент "${nameUa}" створено успішно!`);
        console.log(`📁 Папка: ${deptDir}`);
        console.log(`🔗 ID: ${departmentId}`);
        console.log(`🗄️ Department DB: ${departmentDbPath}`);

        res.json({
            success: true,
            message: `Департамент "${nameUa}" успішно створено!`,
            department: {
                ...department,
                folder: deptDir,
                database: departmentDbPath,
                nextStep: 'Запустіть: cd departments/' + slug + ' && npm install && npm run dev'
            }
        });

    } catch (error: any) {
        console.error('Error creating department:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack
        });
    }
});

// ========================================
// РЕДАГУВАТИ ДЕПАРТАМЕНТ
// ========================================
router.patch('/:id', authenticateToken, async (req: any, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { role: true }
        });

        if (user?.role !== 'CITY_HALL' && user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Тільки City Hall може редагувати департаменти' });
        }

        const { id } = req.params;
        const updates = req.body;

        if (Array.isArray(updates.responsibilities)) {
            updates.responsibilities = JSON.stringify(updates.responsibilities);
        }
        if (Array.isArray(updates.regions)) {
            updates.regions = JSON.stringify(updates.regions);
        }

        // Видалити неможливі для оновлення поля
        delete updates.id;
        delete updates.slug;
        delete updates.createdAt;

        const department = await prisma.department.update({
            where: { id },
            data: updates
        });

        res.json({
            success: true,
            department
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// ВИКЛЮЧИТИ/ВИДАЛИТИ ДЕПАРТАМЕНТ
// ========================================
router.post('/:id/deactivate', authenticateToken, async (req: any, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { role: true }
        });

        if (user?.role !== 'CITY_HALL' && user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Тільки City Hall може видаляти департаменти' });
        }

        const { id } = req.params;

        const department = await prisma.department.update({
            where: { id },
            data: { status: 'INACTIVE' }
        });

        res.json({
            success: true,
            message: `Департамент "${department.nameUa}" деактивовано`,
            department
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// ОТРИМАТИ СТАТИСТИКУ ДЕПАРТАМЕНТУ
// ========================================
router.get('/:id/stats', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;

        const department = await prisma.department.findUnique({
            where: { id },
            include: {
                employees: true,
                reports: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!department) {
            return res.status(404).json({ error: 'Департамент не знайдено' });
        }

        const stats = {
            totalUsers: department.employees.length,
            totalReports: department.reports.length,
            completedReports: department.reports.filter((r: any) => r.status === 'COMPLETED').length,
            pendingReports: department.reports.filter((r: any) => r.status === 'PENDING').length,
            totalRewards: 0,
            reportsByMonth: getReportsByMonth(department.reports)
        };

        res.json({
            department: {
                id: department.id,
                name: department.nameUa,
                status: department.status
            },
            stats
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// Helper Functions
// ========================================

async function copyDirectory(src: string, dest: string) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            if (entry.name !== 'node_modules' && entry.name !== 'dist') {
                fs.mkdirSync(destPath, { recursive: true });
                await copyDirectory(srcPath, destPath);
            }
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

async function initializeDepartmentDatabase(slug: string): Promise<string> {
    await fs.promises.mkdir(DATABASES_DIR, { recursive: true });

    const safeSlug = String(slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const dbPath = path.join(DATABASES_DIR, `${safeSlug}_dept.db`);

    if (!fs.existsSync(DEPARTMENT_SCHEMA_TEMPLATE)) {
        throw new Error(`Department schema template not found: ${DEPARTMENT_SCHEMA_TEMPLATE}`);
    }

    const template = await fs.promises.readFile(DEPARTMENT_SCHEMA_TEMPLATE, 'utf8');
    const schemaForDepartment = template.replace(
        /url\s*=\s*"file:\.\.\/databases\/TEMPLATE_dept\.db"/,
        `url      = "file:${dbPath}"`
    );

    const tempSchemaPath = path.join(PROJECT_DIR, 'prisma', `schema_departments_${safeSlug}_temp.prisma`);

    try {
        await fs.promises.writeFile(tempSchemaPath, schemaForDepartment, 'utf8');

        await execAsync(`npx prisma db push --schema=\"${tempSchemaPath}\" --accept-data-loss`);
        await execAsync(`npx prisma generate --schema=\"${tempSchemaPath}\"`);

        const deptPrisma = getDepartmentPrisma(safeSlug);
        await deptPrisma.departmentSettings.upsert({
            where: { id: 'settings' },
            update: {},
            create: {
                id: 'settings',
                autoApproveThreshold: 0.85,
                maxReportsPerDay: 100,
            },
        });
    } finally {
        if (fs.existsSync(tempSchemaPath)) {
            await fs.promises.unlink(tempSchemaPath);
        }
    }

    return dbPath;
}

async function updateDepartmentsRegistry(slug: string, config: any) {
    const registryPath = path.join(DEPARTMENTS_DIR, 'departments.registry.json');
    let registry: any[] = [];

    if (fs.existsSync(registryPath)) {
        registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    }

    const FIXED_DEPARTMENT_PORTS = [5180, 5181, 5182, 5183, 5184, 5185, 5186, 5187];
    const usedPorts = new Set<number>([
        ...FIXED_DEPARTMENT_PORTS,
        ...registry
            .map((item: any) => Number(item?.port))
            .filter((p: number) => Number.isFinite(p) && p >= 3000 && p <= 9000)
    ]);

    let assignedPort = Number(config?.port);
    if (!Number.isFinite(assignedPort) || assignedPort < 3000 || usedPorts.has(assignedPort)) {
        assignedPort = 5188;
        while (usedPorts.has(assignedPort)) {
            assignedPort += 1;
        }
    }

    const normalizedSlug = String(slug || '').trim().toLowerCase();
    const existingIndex = registry.findIndex((item: any) => String(item?.slug || '').trim().toLowerCase() === normalizedSlug);

    const normalizedConfig = {
        ...config,
        slug: normalizedSlug,
        port: assignedPort,
    };

    if (existingIndex >= 0) {
        registry[existingIndex] = {
            ...registry[existingIndex],
            ...normalizedConfig,
        };
    } else {
        registry.push(normalizedConfig);
    }

    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

function getReportsByMonth(reports: any[]) {
    const months: Record<string, number> = {};
    
    for (const report of reports) {
        const month = new Date(report.createdAt).toISOString().slice(0, 7);
        months[month] = (months[month] || 0) + 1;
    }

    return Object.entries(months).map(([month, count]) => ({ month, count }));
}

export default router;
