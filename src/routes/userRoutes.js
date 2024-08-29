import express from 'express';
import { registerUser, loginUser, getMyDetails, getUserDetailsAdmin, updateUserQuestionsAdmin } from '../../src/controllers/userController.js';
import { authenticateToken, authenticateAdmin } from '../middleware/userMiddleware.js';

const router = express.Router();

// Registro y Login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Ruta para que el usuario vea su propia información
router.get('/me', authenticateToken, getMyDetails);

// Ruta protegida para el administrador para actualizar preguntas
router.patch('/admin/users/:userId/questions', authenticateAdmin, updateUserQuestionsAdmin);

// Ruta para que el administrador vea la información de un usuario específico
router.get('/admin/users/:userId', authenticateAdmin, getUserDetailsAdmin);

export default router;
