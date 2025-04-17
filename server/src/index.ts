import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from '../routes/userRoutes';
import sequelize from '../database/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);

// app.get('/', (_req, res) => {
//   res.send('Hello, Commander General Sir!');
// });

sequelize.authenticate()
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

