import express from 'express';
import MegaMenu from '../models/megamenu.js';
import { AddMenu, deleteMenu, getAllMenu, getCollection,
   getMenuById  , publishMenu, getPublishMenu, addSliderImage,
   getSliderImage,
   hideSlider,
   subscription,
   getsubscriptionDetails
  } from '../controller/MenuController.js';
import multer from 'multer';


const router = express.Router();


// Shopify Configuration 
const shop = process.env.SHOP_URL;
const version = process.env.API_VERSION;
const ADMIN_API_TOKEN = process.env.ADMIN_TOKEN;


// Simple Test Route
router.get('/menu', (req, res) => {
  res.json({ message: 'Hello from the Add Menu API!' });
});


const storage = multer.memoryStorage(); // or diskStorage

// Increase file size limit to 10MB (per file) and total request limit
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    fieldSize: 20 * 1024 * 1024, 
    files:9
  }
});
 
   
router.get('/collection', getCollection);

router.get('/menus',getAllMenu);
router.get('/menu',getMenuById);

// Add menu accept upto 3 images
router.post('/add-menu',upload.any(), AddMenu);


// delete menu
router.delete('/deletemenu',deleteMenu);


router.post('/publishmenu/:menuId', publishMenu);
router.get('/menu/active',getPublishMenu);

router.post('/add-slider-images', addSliderImage);
router.post('/hideslider', hideSlider);

//subscription
router.post('/appsubscription', subscription);
router.get('/appsubscription/:shop', getsubscriptionDetails);

router.get('/file/:filename', getSliderImage);


export default router;
