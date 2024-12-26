import mongoose from "mongoose";
import validator from "validator"

export const userModel = new mongoose.Schema({
    name: { type: String, required: true },
    phone: {
        type: String, required: true,
        validate: {
            validator: function (value) {
                return validator.isMobilePhone(value, 'en-IN')
            },
            message: (props) => `${props.value} is not valid Indian number`
        }
    },
    password: { type: String, required: true },
    designation: { type: String, required: true },
    profileImage: { publicId: { type: String, required: true }, url: { type: String, required: true } },
    role: { type: String, required: false, enum: ["admin", "user"], default: "user" }
}, { timestamps: true })


