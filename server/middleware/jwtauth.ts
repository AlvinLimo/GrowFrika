import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    const token = authHeader?.split(' ')[1]
    if(!token) return res.status(401).json({message: 'No token provided'})

    try{
        if (!JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRET is not defined' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded
        next()
    }catch(err){
        return res.status(403).json({message: 'Invalid Token'})
    }
}