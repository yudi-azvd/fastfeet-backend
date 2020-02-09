import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';

const router = new Router();
const upload = new multer(multerConfig);

router.post('/users', UserController.store);

router.post('/sessions', SessionController.store);

router.use(authMiddleware);

router.put('/users', UserController.update);

router.post('/deliverymen', DeliverymanController.store);

router.get('/deliverymen', DeliverymanController.index);

router.put('/deliverymen/:id', DeliverymanController.update);

router.delete('/deliverymen/:id', DeliverymanController.delete);

router.post('/files', upload.single('file'), FileController.store);

export default router;
