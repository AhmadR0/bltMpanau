import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json())

const PORT = Number(process.env.PORT) || 8000;
app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server running on port ${PORT}`);
});