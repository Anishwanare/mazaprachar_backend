import mongoose from "mongoose";

export const databaseConnection = () => {
    mongoose.connect(process.env.MONGODB_URI, {
        dbName: "Maza_prachar"
    }).then(() => {
        console.log("Connected to database");
    }).catch((err) => {
        console.log("Connection error for database", err);
    });
};
