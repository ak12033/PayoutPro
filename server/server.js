import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import userRouter from './routes/userRoutes.js';
import accountRouter from './routes/accountRoutes.js';
import connectDB from './config/db.js';

const app = express();

await connectDB()

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.get("/", (req, res) => res.send("Server is up and running"));
app.use("/api/v1/user", userRouter);
app.use("/api/v1/account", accountRouter);


const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server listening at http://localhost:${PORT}`));
