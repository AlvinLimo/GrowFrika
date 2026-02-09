// backend/controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import transporter from '../utils/mailer';
import sendEMail from '../utils/mailer';

const JWT_SECRET = process.env.JWT_SECRET!;
const FRONTEND_URL = process.env.FRONTEND_URL

// Create user with email verification
export const createUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const id = uuidv4();

    try {
        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }]
            }
        });

        if (existingUser) {
            res.status(400).json({ 
                message: 'User with this email or username already exists' 
            });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create verification token
        const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });

        const user = await User.create({
            user_id: id,
            username,
            email,
            password: hashedPassword,
            isVerified: false,
            isGoogleUser: false,
            hasPassword: true,
            verificationToken,
            profilePicture: ""
        });

        // Send verification email
        const verificationUrl = `${FRONTEND_URL}verify-email?token=${verificationToken}`;
        
        await transporter.sendEmail(
            email,
            'Verify Your GrowFrika Account',
            `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #16a34a;">Welcome to GrowFrika!</h2>
                    <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
                    <a href="${verificationUrl}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                        Verify Email
                    </a>
                    <p>Or copy this link: ${verificationUrl}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p style="color: #666; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
                </div>
            `,
            process.env.EMAIL_USER
        );

        const { password: _, verificationToken: __, ...safeUser } = user.get();

        res.status(201).json({
            message: 'User created successfully. Please check your email to verify your account.',
            user: safeUser
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating user', error: err });
    }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
        
        const user = await User.findOne({ where: { email: decoded.email } });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        await user.update({ 
            isVerified: true, 
            verificationToken: undefined 
        });

        res.status(200).json({ 
            message: 'Email verified successfully! You can now log in.' 
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ 
            message: 'Invalid or expired verification token' 
        });
    }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
    const { emailorusername, password } = req.body;

    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: emailorusername },
                    { username: emailorusername }
                ]
            }
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const userData = user.get();

        // Check if user is verified
        if (!userData.isVerified) {
            res.status(403).json({ 
                message: 'Please verify your email before logging in',
                reason: 'EMAIL_NOT_VERIFIED'
            });
            return;
        }

        // Check if account was created with Google and has no password
        if (userData.isGoogleUser && !userData.hasPassword) {
            res.status(403).json({ 
                message: 'This account was created with Google. Please sign in with Google first, then set a password in your profile.',
                reason: 'GOOGLE_ACCOUNT_NO_PASSWORD'
            });
            return;
        }

        // Check if password exists
        if (!userData.password) {
            res.status(400).json({ 
                message: 'No password set for this account',
                reason: 'NO_PASSWORD'
            });
            return;
        }

        const isMatch = await bcrypt.compare(password, userData.password);

        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const { password: _, verificationToken, ...safeUser } = userData;

        const token = jwt.sign({ user_id: userData.user_id }, JWT_SECRET, { expiresIn: '7d' });

        console.log('User logged in:', safeUser);
        res.status(200).json({ user: safeUser, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging in', error: err });
    }
};

// Get user by ID
export const getUserByID = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Ensure id is a string (not an array)
        const userId = Array.isArray(id) ? id[0] : id;
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password', 'verificationToken'] }
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching User", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

// Update user profile
export const updateUser = async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const { username, email, currentPassword, newPassword } = req.body;

    try {
        // Ensure user_id is a string (not an array)
        const userId = Array.isArray(user_id) ? user_id[0] : user_id;
        const user = await User.findByPk(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const userData = user.get();

        // If changing password, verify current password first (if they have one)
        if (newPassword) {
            if (userData.hasPassword && currentPassword) {
                const isMatch = await bcrypt.compare(currentPassword, userData.password!);
                if (!isMatch) {
                    res.status(401).json({ 
                        message: 'Current password is incorrect' 
                    });
                    return;
                }
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            
            await user.update({ 
                password: hashedPassword,
                hasPassword: true 
            });
        }

        // Update username if provided
        if (username && username !== userData.username) {
            // Check if username is taken
            // Ensure user_id is a string
            const userIdStr = Array.isArray(user_id) ? user_id[0] : user_id;
            const existingUser = await User.findOne({ 
                where: { 
                    username,
                    user_id: { [Op.ne]: userIdStr } // Exclude current user
                } 
            });

            if (existingUser) {
                res.status(400).json({ 
                    message: 'Username already taken' 
                });
                return;
            }

            await user.update({ username });
        }

        // Update email if provided (would require re-verification in production)
        if (email && email !== userData.email) {
            // Ensure user_id is a string
            const userIdStr = Array.isArray(user_id) ? user_id[0] : user_id;
            const existingUser = await User.findOne({ 
                where: { 
                    email,
                    user_id: { [Op.ne]: userIdStr }
                } 
            });

            if (existingUser) {
                res.status(400).json({ 
                    message: 'Email already taken' 
                });
                return;
            }

            // In production, you'd want to re-verify the email
            await user.update({ email });
        }

        // Fetch updated user without sensitive data
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password', 'verificationToken'] }
        });

        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: updatedUser 
        });
    } catch (error) {
        console.error("Error updating user", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

// Set password for Google users
export const setPassword = async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const { password } = req.body;

    try {
        // Ensure user_id is a string (not an array)
        const userId = Array.isArray(user_id) ? user_id[0] : user_id;
        const user = await User.findByPk(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const userData = user.get();

        // Check if user is a Google user
        if (!userData.isGoogleUser) {
            res.status(400).json({ 
                message: 'This endpoint is only for Google users setting their first password' 
            });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await user.update({ 
            password: hashedPassword,
            hasPassword: true 
        });

        res.status(200).json({ 
            message: 'Password set successfully! You can now log in with email and password.' 
        });
    } catch (error) {
        console.error("Error setting password", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

// Get all users (admin only - you'd want to add auth middleware)
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password', 'verificationToken'] }
        });
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching users', error: err });
    }
};