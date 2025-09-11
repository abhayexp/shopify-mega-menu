// models/JsonData.js
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const JsonDataSchema = new mongoose.Schema(
  {
     publishId: {
      type: String,
      unique: true,
      required: true,
      default: uuidv4
    },
    menuId: {
      type: String,
      unique: true,
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  }
  },  
  { timestamps: true }
);

const PublishMenu = mongoose.model('PublishMenu', JsonDataSchema);

export default PublishMenu;
