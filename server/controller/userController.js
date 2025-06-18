import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Account from "../models/Account.js";
import User from "../models/User.js";
import { z } from 'zod'


// USER SIGN UP

const signupBody = z.object({
    username: z.string().email({ message: "Invalid email format" }),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
export const userSignUp = async (req, res) => {
    try {
        const parsed = signupBody.safeParse(req.body);
        if (!parsed.success) {
            return res.status(411).json({
                message: parsed.error.errors[0].message,
            });
        }

        const existingUser = await User.findOne({
            username: req.body.username,
        });

        if (existingUser) {
            return res.status(411).json({
                message: "Email already taken",
            });
        }

        const { username, firstName, lastName, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            firstName,
            lastName,
            password: hashedPassword,
        });

        await Account.create({
            userId: newUser._id,
            balance: Math.floor(Math.random() * 10000),
        });

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "User created successfully",
            token,
        });

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
};

// USER SIGN IN

const signinBody = z.object({
    username: z.string().email(),
    password: z.string(),
});
export const userSignIn = async (req, res) => {
    try {
        const { success } = signinBody.safeParse(req.body);
        if (!success) {
            return res.status(411).json({
                message: "Incorrect inputs",
            });
        }

        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Wrong credentials!" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
        });

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
};

// FOR UPDATING USER INFO

const updateBody = z.object({
    password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});
export const userUpdate = async (req, res) => {
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Error while updating information",
        });
    }

    await User.updateOne({ _id: req.userId }, req.body);

    res.json({
        message: "Updated successfully",
    });
}

// FOR GETTING USERS WITH FILTER QUERY

export const giveName = async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                $regex: filter,
                $options: "i",
            },
        },
        {lastName: {
                $regex: filter,
                $options: "i",
            },
        }],
    });

    res.json({
        user: users.map((user) => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id,
        })),
    });
}

// FOR GETTING CURRENT USER INFO

export const getInfo = async (req, res) => {
    const user = await User.findOne({
        _id: req.userId,
    });
    res.json(user);
} 