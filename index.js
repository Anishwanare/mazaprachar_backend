import { app } from "./app.js"
import { v2 as cloudinary } from "cloudinary"


const PORT = 2540;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET
})


app.get("/", (req, res) => {
    res.send("Backend is working")
})

app.listen(PORT, () => {
    console.log(`server is running at port: ${PORT}`)
})