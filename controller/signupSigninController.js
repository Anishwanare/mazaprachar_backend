import { catchAsyncErrors } from "../middlewarer/catchAsyncError.js";
import ErrorHandler from "../middlewarer/ErrorHandler.js";
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken"
import { userModel } from "../model/userSigninSignupModel.js";

export const register = catchAsyncErrors(async (req, res, next) => {
    try {

        console.log(req.files)
        if (!req.files || Object.keys(req.files).length === 0) {
            return next(new ErrorHandler("Profile Image is Required", 400));
        }

        const { profileImage } = req.files;
        

        const allowedImageFormat = ["image/jpg", "image/jpeg", "image/png"];
        if (!allowedImageFormat.includes(profileImage.mimetype)) {
            return next(new ErrorHandler("Unsupported image format", 415));
        }

        const { name, phone, designation, password} = req.body;

        if (!name || !phone || !designation || !password) {
            return next(new ErrorHandler("Please fill full form", 400));
        }

        const isRegistered = await userModel.findOne({ phone: phone });
        if (isRegistered) {
            return next(new ErrorHandler("User Already Exist.", 409));
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // upload image to cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(profileImage.tempFilePath, { folder: "maza_prachar_users_images" });

        if (!cloudinaryResponse || !cloudinaryResponse.secure_url || !cloudinaryResponse.public_id) {
            console.error("Cloudinary error: ", cloudinaryResponse.error || "Upload failed");
            return next(new ErrorHandler("Failed to upload image, try again!", 500));
        }

        const user = new userModel({
            name,
            phone,
            role:"user",
            designation,
            password: hashPassword,
            profileImage: {
                publicId: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url
            }
        });

        await user.save();

        // generate token for user
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
        return res
            .status(200)
            .cookie(
                user?.role === "user" ? "user_token" : "admin_token",
                token,
                {
                    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
                    httpOnly: true,
                }
            )
            .json({
                success: true,
                message: "Registration Successfull",
                user,
                token,
            });

    } catch (error) {
        console.error("Error during registration: ", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});




export const login = catchAsyncErrors(async (req, res, next) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return next(new ErrorHandler("Please fill full form", 400))
        }

        const user = await userModel.findOne({ phone })

        if (!user) {
            return next(new ErrorHandler("Invalid phone or password!", 404))
        }

        // 
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return next(new ErrorHandler("Invalid phone or password!", 404))
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
        return res
            .status(200)
            .cookie(
                user?.role === "user" ? "user_token" : "admin_token",
                token,
                {
                    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
                    httpOnly: true,
                }
            )
            .json({
                success: true,
                message: "Login Successfull",
                user,
                token,
            });

    } catch (error) {
        return next(new ErrorHandler("Internal server error, try again later!!", 500))
    }

})