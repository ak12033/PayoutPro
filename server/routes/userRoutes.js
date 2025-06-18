import express from 'express'
import { getInfo, giveName, userSignIn, userSignUp, userUpdate } from '../controller/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post("/signup", userSignUp)
userRouter.post("/signin", userSignIn);
userRouter.put("/update", authMiddleware, userUpdate);
userRouter.get("/bulk", giveName);
userRouter.get("/getUser", authMiddleware, getInfo);

export default userRouter
