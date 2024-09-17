import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// CLOUDINARY_URL

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_SECRET
});

const uploadOnCloudinary = async (localFile)=>{
    try {
        if(!localFile){throw new Error(401,"File Required for upload")}
        const response = await cloudinary.uploader.upload(localFile,{
            resource_type:"auto"
        })
        console.log(response);
        return response
    } catch (error) {
        fs.unlinkSync(localFile)
        return null
    }
}


export {uploadOnCloudinary}