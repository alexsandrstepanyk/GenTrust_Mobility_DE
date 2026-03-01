import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadsDir = path.join(process.cwd(), 'uploads', 'completions');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname || '.jpg');
        const safeExt = ext || '.jpg';
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    }
});

const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image uploads are allowed'));
    }
};

export const completionUpload = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 8 * 1024 * 1024
    }
});
