import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getBalance, Transfer } from '../controller/accountController.js';

const accountRouter = express.Router();

accountRouter.get("/balance", authMiddleware, getBalance);
accountRouter.post("/transfer", authMiddleware, Transfer);

export default accountRouter
