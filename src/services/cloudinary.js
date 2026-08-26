export const CloudinaryService = {
  /**
   * Upload an image to Cloudinary using unsigned preset.
   * @param {File} file 
   * @returns {Promise<{url: string, publicId: string}>}
   */
  uploadImage: async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset || cloudName === 'your_cloud_name') {
      console.warn("Cloudinary not configured. Returning placeholder.");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
            publicId: "placeholder_" + Date.now()
          });
        }, 1000);
      });
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id
      };
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  }
};
