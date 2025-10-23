"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User_1.default.findOne({ where: { email: profile.emails[0].value } });
        if (existingUser) {
            return done(null, existingUser);
        }
        const newUser = await User_1.default.create({
            id: (0, uuid_1.v4)(),
            username: profile.displayName,
            email: profile.emails?.[0].value || '',
            googleId: profile.id
        });
        done(null, newUser);
    }
    catch (err) {
        console.error(err);
        done(err, false);
    }
}));
exports.default = passport_1.default;
