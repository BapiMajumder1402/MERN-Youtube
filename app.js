import dotenv from 'dotenv';
import express, { urlencoded } from 'express';
import connectDB from './src/db/db.js';
import cookieParser from 'cookie-parser';
import cors from "cors";

dotenv.config({
    path:'.env'
})

const app = express();
app.use(cors({origin:process.env.CORS}));
app.use(cookieParser())
app.use(express.json({limit:"50kb"}))
app.use(express.urlencoded({extended:true, limit:"50kb"}));
app.use(express.static("public"))







app.get('/',(req,res)=>{
    res.send("Bapi")
})

connectDB().then(()=>{
    app.listen(process.env.PORT  || 8000,()=>{
        console.log(`Server listening on port ${process.env.PORT}` );
    })
}).catch((error)=>{
    console.log(`Server error: ${error}`);}
)