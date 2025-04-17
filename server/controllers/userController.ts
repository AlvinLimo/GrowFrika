import { Request, Response } from 'express';
import User from '../models/User';
import {v4 as uuidv4} from 'uuid'
import bcrypt from 'bcrypt'

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


