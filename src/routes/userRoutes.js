import express from 'express';
import multer from 'multer';
import { registerUser, loginUser, getMyDetails, getUserDetailsAdmin, updateUserQuestionsAdmin, getAllUsersAdmin } from '../../src/controllers/userController.js';
import { uploadImageToCloudinary } from "../../src/controllers/image.controller.js";
import { authenticateToken, authenticateAdmin } from '../middleware/userMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
// Registro y Login
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/upload-image', upload.single('image'), uploadImageToCloudinary);

// Ruta para que el usuario vea su propia información
router.get('/me', authenticateToken, getMyDetails);

// Ruta protegida para el administrador para actualizar preguntas
router.patch('/admin/users/:userId/questions', authenticateAdmin, updateUserQuestionsAdmin);

// Ruta para que el administrador obtenga todos los usuarios
router.get('/admin/users', authenticateAdmin, getAllUsersAdmin);

// Ruta para que el administrador vea la información de un usuario específico
router.get('/admin/users/:userId', authenticateAdmin, getUserDetailsAdmin);

export default router;
