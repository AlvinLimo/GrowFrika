import { Request, Response } from 'express';
import User from '../models/User';
import {v4 as uuidv4} from 'uuid'
import bcrypt from 'bcrypt'
import { Op } from 'sequelize';
import { UserAttributes } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET

export const createUser = async (req: Request, res: Response) => {
    const { username, email, password} = req.body;
    const id = uuidv4()
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    try{
        const user = await User.create({
            id, username, email, password: hashedPassword
        })
        console.log(user)
        res.status(201).json(user)
    }catch(err){
        console.error(err)
        res.status(500).json({message: 'Error creating user', error: err})
    }
}

export const getUsers = async (req: Request, res: Response) => {
    try{
        const users = await User.findAll()
        console.log(users)
        res.status(200).json(users)
    }catch(err){
        console.error(err)
        res.status(500).json({message: 'Error fetching users', error: err})
    }
}

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
            return console.log("User not found")
        }

        const userData = user.get() as UserAttributes;

        if (!userData.password) {
            return console.log("NO Password set")
            
        }
        const isMatch = await bcrypt.compare(password, userData.password);

        if (!isMatch) {
             res.status(401).json({ message: 'Invalid credentials' });
        }

        const { password: _, ...safeUser } = userData;

        const token = jwt.sign({ userData }, JWT_SECRET!, { expiresIn: '1h' });

        console.log('User logged in:', safeUser, token);
         res.status(200).json({ user: safeUser, token });
    } catch (err) {
        console.error(err);
         res.status(500).json({ message: 'Error logging in', error: err });
    }
};

export const getUserByID = async (req: Request, res: Response) => {
    const {id} = req.params

    try{
        const user = await User.findByPk(id,{
            attributes:{exclude:['password']}
        })

        if(!user){
            return console.log( "User not found")
        }

        console.log("User", user)
        res.status(200).json(user)
    }catch(error){
        console.error("Error fetching User", error)
        res.status(500).json({message:"Internal Server Error", error})
    }
}


