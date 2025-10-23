"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("../utils/passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email']
}));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), (req, res) => {
    const user = req.user;
    const token = jsonwebtoken_1.default.sign({ userData: user }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`http://localhost:5173/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
});
exports.default = router;
