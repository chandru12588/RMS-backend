import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import sharp from "sharp";
import fs from "fs";

// ================= ADD PRODUCT (MULTIPLE IMAGES CLOUDINARY) =================
export const addProduct = async (req, res) => {
  try {
    const { name, price, unit, categoryId, description } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: "Name, price & category required" });
    }

    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const compressedPath = `uploads/${Date.now()}-${file.originalname}.jpeg`;

        await sharp(file.path).jpeg({ quality: 80 }).toFile(compressedPath);

        const result = await cloudinary.uploader.upload(compressedPath, {
          folder: "rms_products",
        });

        uploadedImages.push(result.secure_url);

        fs.unlinkSync(file.path);
        fs.unlinkSync(compressedPath);
      }
    }

    const product = await Product.create({
      name,
      price,
      unit,
      categoryId,
      description,
      images: uploadedImages,
    });

    res.status(201).json({ message: "Product Added Successfully 🎉", product });

  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};


// ================= GET ALL PRODUCTS =================
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("categoryId");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Cannot fetch products", error });
  }
};


// ================= GET SINGLE PRODUCT BY ID (NEW) =================
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error });
  }
};


// ================= UPDATE PRODUCT =================
export const updateProduct = async (req, res) => {
  try {
    const { name, price, unit, categoryId, description } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let newImages = [];

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const compressedPath = `uploads/${Date.now()}-${file.originalname}.jpeg`;

        await sharp(file.path).jpeg({ quality: 80 }).toFile(compressedPath);

        const result = await cloudinary.uploader.upload(compressedPath, {
          folder: "rms_products",
        });

        newImages.push(result.secure_url);

        fs.unlinkSync(file.path);
        fs.unlinkSync(compressedPath);
      }
    }

    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.unit = unit ?? product.unit;
    product.categoryId = categoryId ?? product.categoryId;
    product.description = description ?? product.description;
    product.images = [...product.images, ...newImages]; // keep old + new

    await product.save();

    res.json({ message: "Product Updated Successfully", product });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Update failed", error });
  }
};


// ================= TOGGLE AVAILABILITY =================
export const toggleAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.available = !product.available;
    await product.save();

    res.json({ message: "Availability Changed", product });

  } catch (error) {
    res.status(500).json({ message: "Toggle failed", error });
  }
};


// ================= DELETE PRODUCT =================
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error });
  }
};
