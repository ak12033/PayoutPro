import mongoose from "mongoose";
import Account from "../models/Account.js";

// Get User Balance
export const getBalance = async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId,
    });

    res.json({
        balance: account.balance,
    });
}

// Transfer Money
export const Transfer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const { amount, to } = req.body;

    // Don't allow transfer to oneself
    if (to === req.userId) {
        await session.abortTransaction();
        return res.json({ message: "Cannot Transfer to yourself!" });
    }

    // Fetch the accounts within transaction
    const account = await Account.findOne({
        userId: req.userId,
    }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        return res.json({
            message: "Insufficient balance",
        });
    }

    // Fetch the accounts within transaction
    const toAccount = await Account.findOne({
        userId: to,
    }).session(session);

    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account",
        });
    }

    // Perform the transfer within transaction
    await Account.updateOne(
        { userId: req.userId },
        { $inc: { balance: -amount } }
    ).session(session);
    await Account.updateOne(
        { userId: to },
        { $inc: { balance: amount } }
    ).session(session);

    // Commit Transaction
    await session.commitTransaction();

    res.json({
        message: "Transfer successful",
    });
}