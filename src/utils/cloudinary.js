import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error('Cloudinary upload: localFilePath is required');
            return null;
        }

        const absolutePath = path.resolve(localFilePath);
        const response = await cloudinary.uploader.upload(absolutePath, {
            resource_type: 'auto',
        });

        const url = response.secure_url || response.url;
        console.log('file is uploaded on cloudinary', url);

        try {
            fs.unlinkSync(localFilePath);
        } catch {
        }

        return url;
    } catch (error) {
        try {
            if (localFilePath) fs.unlinkSync(localFilePath);
        } catch { }
        console.error('Cloudinary upload error:', error?.message || error);
        return null;
    }
};
export { uploadOnCloudinary };

