import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';


// console.log("here is the cloudinary secrets",{
//   cloudName: process.env.CLOUDINARY_CLOUD_NAME,
//   apiKey: process.env.CLOUDINARY_API_KEY,
//   secretExists: !!process.env.CLOUDINARY_API_SECRET,
// });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export class CloudinaryService {
  async uploadImage(filePath: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'vehicle-rental/vehicles',
        resource_type: 'image',
      });

      return result.secure_url;
    } finally {
      // Always remove the local file
      try {
        await fs.unlink(filePath);
      } catch {
        // File may already be removed
      }
    }
  }

  async deleteImage(photoUrl: string): Promise<void> {
    const uploadIndex = photoUrl.indexOf('/upload/');

    if (uploadIndex === -1) {
      return;
    }

    let publicId = photoUrl.substring(uploadIndex + '/upload/'.length);
  
    publicId = publicId.replace(/^v\d+\//, '')
    publicId = publicId.replace(/\.[^/.]+$/, '');

    if (!publicId) {
      return;
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
  }
}