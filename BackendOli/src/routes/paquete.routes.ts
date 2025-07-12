import { Router, Request, Response } from 'express';
import {
    getPaquetes,
    getPaqueteById,
    createPaquete,
    updatePaquete,
    deletePaquete
} from '../controllers/paquete.controllers';

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Express } from 'express';

const router = Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });
interface MulterRequest extends Request {
  file: Express.Multer.File;
}
router.post('/upload', upload.single('imagen'), (req: Request, res: Response) => {
    const reqWithFile = req as MulterRequest;

    if (!reqWithFile.file) {
         res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    const url = `/uploads/${reqWithFile.file.filename}`;
     res.status(201).json({ url });
});
router.get('/', (req, res) => { getPaquetes(req, res); });
router.get('/:id', (req, res) => { getPaqueteById(req, res); });
router.post('/', (req, res) => { createPaquete(req, res); });
router.put('/:id', (req, res) => { updatePaquete(req, res); });
router.delete('/:id', (req, res) => { deletePaquete(req, res); });

export default router;
