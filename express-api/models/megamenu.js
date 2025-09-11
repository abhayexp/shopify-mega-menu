import mongoose from "mongoose";

const { Schema } = mongoose;

const ImageSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  isVisible: { type: Boolean, default: true },
});

// Recursive schema for menu items
const ItemSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  linkType: { type: String, required: true },
  heading: { type: String, default: "" },
  isSliderVisible: { type: Boolean, default: true },
  images: [ImageSchema],
  children: [],
});
  
ItemSchema.add({
  children: [ItemSchema],
});

// Main menu schema
const MenuSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    items: [ItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Menu", MenuSchema);
