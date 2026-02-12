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
const port = Number(process.env.PORT) || 10000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', 
  credentials: true
}));
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/chat', mlRoutes);

// Connect to database and start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    
    // Verify mailer but don't block server startup
    verifyMailer().catch(err => {
      console.error('Mailer verification failed (non-blocking):', err);
      console.log('Server will continue, but emails may not work');
    });
    
    // Start server on 0.0.0.0 to accept external connections
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit if database fails
  });