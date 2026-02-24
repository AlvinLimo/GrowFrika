// Load environment variables first
import './config.js';

import express from 'express';
import cors from 'cors';
import userRoutes from '../routes/userRoutes.js';
import sequelize from '../database/db.js';
import authRoutes from '../routes/authRoutes.js';
import passport from '../utils/passport.js';
import mlRoutes from '../routes/mlRoutes.js';
import { verifyMailer } from '../utils/mailer.js';

const app = express();
const port = Number(process.env.PORT) || 10000;

const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

app.use(cors({
  origin: clientUrl, 
  credentials: true
}));
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

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