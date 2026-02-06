// backend/routes/userRoutes.ts
import express from 'express';
import {createUser, verifyEmail, loginUser, getUserByID, updateUser, setPassword, getUsers} from '../controllers/userController';
import { authenticateToken } from '../middleware/jwtauth'; // You'll need this

const router = express.Router();

// Public routes
router.post('/register', createUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);

// Protected routes (require authentication)
router.get('/getbyID/:id', authenticateToken, getUserByID);
router.patch('/update/:id', authenticateToken, updateUser);
router.post('/set-password/:id', authenticateToken, setPassword);
router.get('/all', authenticateToken, getUsers); // Admin only ideally

export default router;