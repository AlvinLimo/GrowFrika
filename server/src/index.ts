// src/index.ts
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello, Commander General Sir!');
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
