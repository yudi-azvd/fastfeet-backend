import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

const router = new Router();
const upload = new multer(multerConfig);

router.post('/users', UserController.store);

router.post('/sessions', SessionController.store);

router.use(authMiddleware);

router.get('/users', UserController.index);

router.put('/users', UserController.update);

router.post('/deliverymen', DeliverymanController.store);

router.get('/deliverymen', DeliverymanController.index);

router.put('/deliverymen/:id', DeliverymanController.update);

router.delete('/deliverymen/:id', DeliverymanController.delete);

router.get('/deliverymen/:id/deliveries', DeliveryController.index);

router.post('/deliveries', DeliveryController.store);

router.get('/deliveries', DeliveryController.index);

router.put('/deliveries/:id', DeliveryController.update);

router.put('/deliveries/:id/withdrawal', DeliveryController.update);

// TEM QUE ACEITAR UM ARQUIVO AQUI
router.put('/deliveries/:id/delivered', DeliveryController.update);

router.delete('/deliveries/:id', DeliveryController.delete);

router.post('/delivery/:id/problems', DeliveryProblemController.store);

router.get('/delivery/:id/problems', DeliveryProblemController.index);

router.get('/delivery-problems', DeliveryProblemController.index);

router.delete('/problem/:id/cancel-delivery', DeliveryController.delete);

router.post('/files', upload.single('file'), FileController.store);

export default router;
