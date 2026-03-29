import Order from "../models/Order.js";

const CLEANING_CATEGORY_KEYWORDS = [
  "fish",
  "seafood",
  "meat",
  "chicken",
  "mutton",
  "prawn",
  "crab",
];

const isCleaningCategory = (rawCategory = "") => {
  const category = rawCategory.toLowerCase().trim();
  return CLEANING_CATEGORY_KEYWORDS.some((keyword) => category.includes(keyword));
};

/* ============================================================
   📌 CREATE ORDER (Customer Checkout)
============================================================ */
export const createOrder = async (req, res) => {
  try {
    const { customerName, customerMobile, customerEmail, customerAddress, items, paymentMode } = req.body;

    if (!customerName || !customerMobile || !customerAddress || !items || items.length === 0) {
      return res.status(400).json({ message: "Order details missing!" });
    }

    // Convert cart products -> order items format
    const orderItems = items.map((i) => ({
      productId: i._id || i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity || i.qty || 1,
      total: (i.quantity || i.qty || 1) * i.price,
    }));

    const hasCleaningItem = items.some((i) => {
      const categoryName = i.categoryName || i.category || i.categoryId?.name || "";
      return isCleaningCategory(categoryName);
    });

    const subtotalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);
    const cleaningCharge = hasCleaningItem ? 20 : 0;
    const totalAmount = subtotalAmount + cleaningCharge;

    const order = await Order.create({
      customerName,
      customerMobile,
      customerEmail: customerEmail ? customerEmail.toLowerCase().trim() : "",
      customerAddress,
      items: orderItems,
      subtotalAmount,
      cleaningCharge,
      totalAmount,
      paymentMode: paymentMode || "COD",
    });

    return res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
    });

  } catch (error) {
    return res.status(500).json({ message: "Order creation failed", error });
  }
};


/* ============================================================
   📌 GET All Orders (Admin)
============================================================ */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders", error });
  }
};


/* ============================================================
   📌 GET Single Order by ID (Fixes 404 - Used for VIEW Page)
============================================================ */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch order", error });
  }
};


/* ============================================================
   📌 UPDATE ORDER STATUS (Admin)
============================================================ */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await Order.findByIdAndUpdate(req.params.id, { status });

    return res.json({ message: "Order status updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update status", error });
  }
};


/* ============================================================
   📌 STATS For Dashboard
============================================================ */
export const getStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
    const pendingOrders = await Order.countDocuments({ status: "Pending" });

    return res.json({
      totalOrders,
      deliveredOrders,
      pendingOrders,
    });

  } catch (err) {
    return res.status(500).json({ message: "Stats fetch error", err });
  }
};
