import Category from "../models/Category.js";

export const addCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getCategories = async (req, res) => {
  try {
    const data = await Category.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
};
