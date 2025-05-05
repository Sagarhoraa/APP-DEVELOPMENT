import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) =>{
    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "15d"});
}

router.post("/register",async (req, res)=>{
    try {
        const {email, username, password } =req.body;
        if(!username || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }

        if(password.length <6){
            return res.status(400).json({message: "Password should be at least 6 character long"});
        }

        if(username.length <3){
            return res.status(400).json({message: "Username should be atleast 3 character long"});
        }
        

        //checking if the user already exists
        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({message: "Email already existed!"});
        }

        const existingUsername = await User.findOne({username});
        if(existingUsername){
            return res.status(400).json({message: "Username is already existed!"});
        }

        const profileImage =`https://api.dicebear.com/9.x/pixel-art/svg?seed=${username}`;

        const user = new User({
            email,
            username,
            password,
            profileImage,
        });
        
        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email:user.email,
                profileImage: user.profileImage,

            },
        });

    } catch (error) {
        console.log("error in registering route",error);
        res.status(500).json({message: "Internam server error" });
    }

});
router.post("/login", async (req, res)=>{
    res.send("login");
});
export default router;