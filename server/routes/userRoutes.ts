import express from 'express';
import { createUser, getUsers, loginUser, getUserByID } from '../controllers/userController';

const router = express.Router();

router.post('/create', createUser);
router.get('/get', getUsers);
router.post('/login', loginUser);
router.get('/getbyID/:id', getUserByID)

export default router;