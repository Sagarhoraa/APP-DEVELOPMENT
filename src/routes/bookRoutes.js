import express from "express";
import cloudinary  from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/", protectRoute,async (req , res) => {
    try{
        
        const { title, caption, rating, image }= req.body;
        if(!image || !title || !caption || !rating){
            return res.status(400).json({message: "please provide all fields."});
        }
        //upload the image to clouniary,
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageURL = uploadResponse.secure_url
        //and save to the database ,i.e mongoDB

        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageurl,
            user: req.user._id,
            
        });
        await newBook.save();
        res.status(201).json(newbook);

    } catch{error} {
        console.log("Error creating the book !",error);
        res.status(500).json({message: error.message});

    }
});



// pagination = infinite scroll 
router.get("/", protectRoute,async(req, res)=>{
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;


        const books = await Book.find()
           .sort({ createdAt: -1})//descending order
           .skip(skip)
           .limit(limit)
           .populate("user", "username profileImage");

           const totalBooks = await Book.countDocuments();

        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceilil(totalBooks / limit),
        });

    } catch (error) {
        console.log("Error in getting book route", error);
        res.status(500).json({message: "Internal server error" });      
    }
});



router.delete("/:id", protectRoute, async (req, res) => {

    try {
        const book = await Book.findOne(req.params.id);
        if(!book) return res.status(404).json({message: "Book not found"});

        //also checking if the user is the creator of the book or not
        if (book.user.toString() !== req.user._id.toString())
            return res.status(401).json({message: "Unauthorized" });

        //also delete image from cloudinary
        if(book.image && book.image.includes("cloudinary")){
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log("Error deleting image from cloudinary", deleteError);
            }
        }
        
        await book.deleteOne();
        
         res.json({message: "Book deleted successfully" });

    } catch (error) {
        console.log("Error deleting book ", error);
        res.status(500).json({message: "Internal server error" });
    }
});


router.get("/user", protectRoute, async(req, res) => {
    try {
        const books = await Book.find({user: req.user._id }).sort({createdAt: -1});
        res.json(books);
    } catch (error) {
        console.log("Get user books error:", error.message);
        res.status(500).json({ message: "oops ! server error"});
    }
});
export default router;