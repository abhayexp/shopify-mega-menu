import { model } from "mongoose";
import MegaMenu from '../models/megamenu.js';

import sliderSchema from "../models/sliderSchema.js";
import PublishMenu from "../models/publish.js";
import CategorySlider from "../models/sliderSchema.js";
import MenuSliders from "../models/sliderSchema.js";
import { v4 as uuidv4 } from 'uuid';
import multer from "multer";
import Menu from "../models/megamenu.js";

import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import UploadedImage from "../models/images.js";
import dotenv from "dotenv";
dotenv.config();


let gfs;

mongoose.connection.once("open", () => {
  gfs = new GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads", // same bucket you used for upload
  });
});

//  Add Menu
export const AddMenu = async (req, res) => {
  try {

    const data = req.body;
    console.log(data);

    let menu = await Menu.findOne({id: data.id });  

    if (menu) { 
      menu = await Menu.findOneAndUpdate(
        { id: data.id },
        data,
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        message: "Mega menu updated successfully",
        menu,
      });
    } else {
      const newMenu = new Menu(data);
      await newMenu.save();

      return res.status(201).json({
        message: "New mega menu created successfully",
        menu: newMenu,
      });
    }
  } catch (error) {
    console.error("Create/Update Menu Error:", error);
    res.status(500).json({ message: error.message });
  }
};





// get All Menu 

export const getAllMenu = async (req, res) => {
  try {
    const menus = await Menu.find().lean(); 

    if (!menus || menus.length === 0) {
      return res.status(404).json({ message: "No menus found" });
    }

    res.status(200).json({
      message: "Menus fetched successfully",
      count: menus.length,
      menus,
    });
  } catch (error) {
    console.error("Get All Menus Error:", error);
    res.status(500).json({ message: error.message });
  }
};


//Get Menu ByID
export const getMenuById = async (req, res) => {

  try {
    const { menuId } = req.body;

    if (!menuId) {
      res.status(400).json({ message: "Menu Id Not  Found" });

    }
    const menuItem = await MegaMenu.findById({ menuId });

    if (!menuItem) {
      res.status(400).json({ message: " Menu Item  Not found" });
    }
    res.status(200).json({ message: 'Menu Fetched', menuItem });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });

  }
}

// Delete menu
export const deleteMenu = async (req, res) => {
  try {
    const { menuId } = req.body;
    console.log('Searching for menuId:', menuId);


    if (!menuId) {
      return res.status(400).json({ message: "Menu ID is required" });
    }

    const menu = await MegaMenu.findOne({ id: menuId });

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    await MegaMenu.findOneAndDelete({ id: menuId });
    res.status(200).json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Delete menu error:", error);
    res.status(500).json({ message: error.message });
  }
};



// get collection
export const getCollection = async (req, res) => {
  try {
    if (!process.env.ADMIN_TOKEN) {
      throw new Error("Missing Shopify Admin API token");
    }
    const TOKEN = process.env.ADMIN_TOKEN;
    const shop = process.env.SHOP_URL;
    const version = process.env.API_VERSION;

    const response = await fetch(`https://${shop}/admin/api/${version}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': TOKEN,
      },
      body: JSON.stringify({
        query: `
          query GetCollections {
            collections(first: 10) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
          }
        `
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Response(`Shopify API Error: ${error}`, { status: response.status });
    }

    const result = await response.json();
    console.log(result);
    const collections = result.data.collections.edges.map((edge) => edge.node);
    console.log(collections);
    return res.status(200).json({ message: " Collection Fetched Successfully" , collections})


  } catch (error) {
    console.error("Loader Error:", error);
    throw new Response("Internal Server Error", { status: 500 });
  }
};

// publish menu 
export const publishMenu = async (req, res) => {
  try {
    const { menuId } = req.params;
    console.log( "Menu Id ",menuId);

    if (!menuId) {
      return res.status(400).json({ error: "Menu ID not provided." });
    }

    const menu = await Menu.findOne({ id: menuId });
    if (!menu) {
      return res.status(404).json({ error: "Menu not found with the given ID." });
    }

    // Always have a unique non-null publishId
    const pId = menuId || uuidv4();

    let isPublished = await PublishMenu.findOne({ publishId: pId });

    if (!isPublished) {
      // Deactivate all existing before publishing new
      await PublishMenu.updateMany({}, { $set: { status: "inactive" } });

      const newPublished = await PublishMenu.create({
        // publishId: uuidv4(),
        menuId,
        data: menu,
        status: "active",
      });

      return res.status(201).json({
        message: "Menu published successfully.",
        data: newPublished,
      });
    }

    if (isPublished.status === "active") {
      return res.status(200).json({
        message: "Menu already published and active",
        data: isPublished,
      });
    }

    // If inactive → reactivate and deactivate others
    await PublishMenu.updateMany({}, { $set: { status: "inactive" } });
    isPublished.status = "active";
    await isPublished.save();

    return res.status(200).json({
      message: "Menu re-activated successfully",
      data: isPublished,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// export const publishMenu = async (req, res) => {

//   try {
//     const menuId = req.params.menuId;
//     if (!menuId) {
//       return res.status(400).json({ error: "Menu and publish Id not found." });
//     }

//     const menu = await MegaMenu.findOne({ menuId: menuId });

//     if (!menu) {
//       return res.status(404).json({ error: "Menu not found with the given Id." });
//     }
//     console.log("Menu", menu);

//     const pId = menuId;

//     // save new created menu


//     //check is already published
//     const isPublished = await PublishMenu.findOne({ publishId: pId });

//     if (isPublished == null) {
//       console.log(" Menu not created");
//       const newPublished = await PublishMenu.create({
//         publishId: pId || uuidv4(),
//         menuId,
//         data: menu,
//         status: 'active'
//       });
//       return res.status(201).json({
//         message: 'Menu published successfully.',
//         data: newPublished
//       });

//     }

//     if (isPublished && isPublished.status === 'active') {
//       return res.status(200).json({
//         message: 'Menu already published and active',
//         data: isPublished
//       });
//     }
//     // Case: Already published but inactive -> Reactivate it
//     if (isPublished.status === 'inactive') {
//       await PublishMenu.updateMany({}, { $set: { status: 'inactive' } });
//       isPublished.status = 'active';
//       await isPublished.save();
//       return res.status(200).json({
//         message: 'Menu re-activated successfully',
//         data: isPublished
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     // Handle unexpected errors
//     return res.status(500).json({ error: error.message || "Internal server error." });
//   }
// };


export const getPublishMenu = async (req, res) => {

  try {
    const menu = await PublishMenu.findOne({
      status: 'active'
    });

    if (!menu) {
      return res.status(400).json({ message: " Menu Not  Found" })
    }

    // const baseUrl = `${req.protocol}://${req.get("host")}/api/file/`;

    // Transform image filenames into CDN URLs
    // const updatedMenu = {
    //   ...menu.toObject(),
    //   data: {
    //     ...((typeof menu.data.toObject === 'function') ? menu.data.toObject() : menu.data),
    //     items: menu.data.items.map(item => ({
    //       ...item,
    //       // Make sure item.image is an array before mapping
    //       image: Array.isArray(item.image) ? item.image.map(img => ({
    //         ...img,
    //         url: `${baseUrl}${img.filename}` // Construct new CDN URL here
    //       })) : []
    //     }))
    //   }
    // };

    return res.status(200).json({ message: " Menu founded", menu })

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}


export const addSliderImage = async (req, res) => {
  try {
    const { categoryName, menuId, slides } = req.body;
    if (!menuId) {
      res.status(400), json({ message: "Menu Id Not Found" })
    }
    const menu = await MegaMenu.findOne({
      menuId
    });
    console.log(menu);
    if (!menu) {
      return res.status(404).json({ message: "Menu Not Found" });
    }
    await MenuSliders.create({
      menuId,
      categoryName,
      slides,
    })
    res.status(200).json({ success: true, message: "menu Slides Added SuccesFully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}



export const getSliderImage = async (req, res) => {
  try {
    if (!gfs) {
      return res.status(500).json({ error: "File system not initialized" });
    }

    const filename = req.params.filename;

    const downloadStream = gfs.openDownloadStreamByName(filename);

    downloadStream.on("error", (err) => {
      console.error("Error streaming file:", err.message);
      return res.status(404).json({ error: "File not found" });
    });

    // Ideally detect type dynamically, e.g., store `contentType` in file metadata
    res.set("Content-Type", "image/png");

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};



export const hideSlider = async (req, res) => {
  try {
    
    const { menuId, itemId, isSliderVisible } = req.body; // accept visibility status
    console.log(req.body);

    if (!menuId || !itemId) {
      return res.status(400).json({ message: "Id Not Found" });
    }

    const menu = await Menu.findOne({ 
      id:menuId
    });

    if (!menu) {
      return res.status(404).json({ message: "Menu Not Found" });
    }

    // recursive function to find and update item
    const updateVisibility = ( items) => {
      for (let item of items) {
        if (item.id === itemId) {
          item.isSliderVisible = isSliderVisible; // update value
          return true;
        }
        if (item.children && item.children.length > 0) {
          const found = updateVisibility(item.children);
          if (found) return true;
        }
      }
      return false;
    };

    const updated = updateVisibility(menu.items);

    if (!updated) {
      return res.status(404).json({ message: "Item Not Found" });
    }

    await menu.save();

    return res.status(200).json({
      message: "Menu Updated Successfully",
      menu,
    });
  } catch (error) {
    console.error("Error updating slider:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

