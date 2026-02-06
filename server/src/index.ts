import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from '../routes/userRoutes';
import sequelize from '../database/db';
import authRoutes from '../routes/authRoutes';
import passport from '../utils/passport';
import mlRoutes from '../routes/mlRoutes';
import { verifyMailer } from '../utils/mailer';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/chat', mlRoutes);

sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .then(verifyMailer)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

