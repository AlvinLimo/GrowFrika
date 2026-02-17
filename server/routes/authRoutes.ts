import express from 'express';
import passport  from '../utils/passport'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

router.get('/google/callback', passport.authenticate('google', { session:false}),(req, res) => {
    const user = req.user as any
    const token = jwt.sign({ userData: user}, process.env.JWT_SECRET!, { expiresIn: '1h' })
    res.redirect(`${process.env.CLIENT_URL}/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
})

export default router