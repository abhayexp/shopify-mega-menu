import mongoose from 'mongoose';

const UploadedImageSchema = new mongoose.Schema({
  menuItemId: {
    type: String,
    required: true,
  },
  imgIndex: {
    type: Number,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// This will create a collection named 'uploadedimages'
const UploadedImage = mongoose.model('UploadedImage', UploadedImageSchema);

export default UploadedImage;
