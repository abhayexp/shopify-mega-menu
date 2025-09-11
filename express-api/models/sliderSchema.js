// models/categorySlider.model.js
import mongoose, { Mongoose } from "mongoose";

const sliderSchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true }, // ID from your mega menu
  menuId : { type: String, requred: true , unique : true},
  slides: [
    {
      imageUrl: { type: String, required: true },
      text: { type: String },
      linkUrl: { type: String }
    }
  ]
});

const MenuSliders = new mongoose.model('MenuSliders',sliderSchema);

export default MenuSliders;