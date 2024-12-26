import cookieParser from "cookie-parser";
import { config } from "dotenv";
import express, { urlencoded } from "express";
import fileUpload from "express-fileupload";
import { databaseConnection } from "./db/databaseConnection.js";
import { errorMiddleware } from "./middlewarer/ErrorHandler.js";
import userRouter from "./router/userRouter.js";
import cors from "cors";

export const app = express();

config({ path: ".env" });

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './tmp/',
    limits: { fileSize: 1 * 1024 * 1024 } 
}));


app.use(cors());

app.use("/api/user", userRouter);

databaseConnection();

app.use(errorMiddleware);
