"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("../routes/userRoutes"));
const db_1 = __importDefault(require("../database/db"));
const authRoutes_1 = __importDefault(require("../routes/authRoutes"));
const passport_1 = __importDefault(require("../utils/passport"));
const mlRoutes_1 = __importDefault(require("../routes/mlRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(passport_1.default.initialize());
app.use('/users', userRoutes_1.default);
app.use('/auth', authRoutes_1.default);
app.use('/api/ml', mlRoutes_1.default);
db_1.default.authenticate()
    .then(() => {
    console.log('Database connection has been established successfully.');
})
    .then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})
    .catch((err) => {
    console.error('Unable to connect to the database:', err);
});
