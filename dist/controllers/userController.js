"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByID = exports.loginUser = exports.getUsers = exports.createUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const sequelize_1 = require("sequelize");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const createUser = async (req, res) => {
    const { username, email, password } = req.body;
    const id = (0, uuid_1.v4)();
    const salt = await bcrypt_1.default.genSalt(10);
    const hashedPassword = await bcrypt_1.default.hash(password, salt);
    try {
        const user = await User_1.default.create({
            id, username, email, password: hashedPassword
        });
        console.log(user);
        res.status(201).json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating user', error: err });
    }
};
exports.createUser = createUser;
const getUsers = async (req, res) => {
    try {
        const users = await User_1.default.findAll();
        console.log(users);
        res.status(200).json(users);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching users', error: err });
    }
};
exports.getUsers = getUsers;
const loginUser = async (req, res) => {
    const { emailorusername, password } = req.body;
    try {
        const user = await User_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { email: emailorusername },
                    { username: emailorusername }
                ]
            }
        });
        if (!user) {
            return console.log("User not found");
        }
        const userData = user.get();
        if (!userData.password) {
            return console.log("NO Password set");
        }
        const isMatch = await bcrypt_1.default.compare(password, userData.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
        }
        const { password: _, ...safeUser } = userData;
        const token = jsonwebtoken_1.default.sign({ userData }, JWT_SECRET, { expiresIn: '1h' });
        console.log('User logged in:', safeUser, token);
        res.status(200).json({ user: safeUser, token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging in', error: err });
    }
};
exports.loginUser = loginUser;
const getUserByID = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User_1.default.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            return console.log("User not found");
        }
        console.log("User", user);
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Error fetching User", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};
exports.getUserByID = getUserByID;
