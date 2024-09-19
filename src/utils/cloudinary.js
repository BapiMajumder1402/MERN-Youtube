import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: "dbzkvqj6x",
    api_key: "347412221635865",
    api_secret: "FsX7M-LoE9i1GT4bLYrNh5gNgtY"
    //   cloud_name: process.env.CLOUD_NAME, 
    //   api_key: process.env.CLOUD_API_KEY, 
    //   api_secret: process.env.CLOUD_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        console.log(response);
        return response;

    } catch (error) {
        console.log(error);
        fs.unlinkSync(localFilePath)
        return null;
    }
}



export { uploadOnCloudinary }
