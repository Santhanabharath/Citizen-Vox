import { CloudinaryService } from './cloudinary';

export const taskEvidenceService = {
  /**
   * Uploads an evidence photo (Before or After) to Cloudinary
   * Returns a structured evidence object to store in Firestore.
   */
  uploadEvidence: async (file, workerId, type = 'before') => {
    try {
      const cloudinaryResult = await CloudinaryService.uploadImage(file);
      
      return {
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        type: type, // 'before' or 'after'
        uploadedBy: workerId,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error uploading ${type} evidence:`, error);
      throw new Error(`Failed to upload ${type} evidence photo.`);
    }
  }
};
