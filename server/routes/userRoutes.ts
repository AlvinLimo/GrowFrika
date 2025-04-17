import express from 'express';
import { createUser, getUsers } from '../controllers/userController';

const router = express.Router();

router.post('/create', createUser);
router.get('/get', getUsers);

export default router;