import express from 'express';
import cors from 'cors';
import menuRoutes from './routes/menuRoutes.js'; // adjust path if needed
import connectDB from './db/db.js';

const app = express();
const PORT = 5000;


// app.use(cors());
// app.use(express.json());

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


connectDB();


// Mount the router here
app.use('/api', menuRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
