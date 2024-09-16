import dotenv from 'dotenv';
import express from 'express';
import connectDB from './src/db/db.js';

dotenv.config({
    path:'.env'
})

const app = express();
app.get('/',(req,res)=>{
    res.send("Bapi")
})

app.listen(3000,()=>{
    connectDB()
    console.log('Server listening');
})