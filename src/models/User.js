import mongoose, { MongooseError } from  "mongoose";
import argon2 from "argon2";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    profileImage: {
        type: String,
        default: ""
    }
},{timestamps: true}
);


// Hash password before saving user to DB
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        this.password = await argon2.hash(this.password);
        next();
    } catch (err) {
        next(err);
    }
});

//compare  password function
userSchema.methods.comparePassword = async function (userPassword) {

    return await argon2.verify(this.password, userPassword);

}

const User = mongoose.model("User", userSchema);

export default User;
