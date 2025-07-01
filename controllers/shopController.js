import Medicine from "../models/shop.model.js";

// Add new medicine
export const addMedicine = async (req, res) => {
  try {
    const newMed = new Medicine({
      ...req.body,
      createdBy: req.user?._id || null, // optional: set from auth middleware
    });

    await newMed.save();
    res.status(201).json({ message: "Medicine added successfully", medicine: newMed });
  } catch (err) {
    console.error("Error adding medicine:", err);
    res.status(500).json({ message: "Server error while adding medicine" });
  }
};

// Get all medicines
export const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    res.status(200).json(medicines);
  } catch (err) {
    console.error("Error fetching medicines:", err);
    res.status(500).json({ message: "Server error while fetching medicines" });
  }
};

// Optional: Get single medicine by ID
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    res.status(200).json(medicine);
  } catch (err) {
    console.error("Error getting medicine:", err);
    res.status(500).json({ message: "Server error" });
  }
};



import Cart from '../models/cart.model.js';

// Add or update a medicine in cart
export const addToCart = async (req, res) => {
  const userId = req.user.id;
  const { medicineId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ medicineId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.medicineId.toString() === medicineId
      );

      if (itemIndex >= 0) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ medicineId, quantity });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update cart', error: err });
  }
};

// Remove medicine from cart
export const removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const { medicineId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      (item) => item.medicineId.toString() !== medicineId
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove item', error: err });
  }
};



export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId }).populate('items.medicineId');

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ items: [], total: 0 });
    }

    const formattedItems = cart.items.map(item => ({
      _id: item.medicineId._id,
      name: item.medicineId.name,
      description: item.medicineId.description,
      price: item.medicineId.price,
      imageUrl: item.medicineId.imageUrl,
      quantity: item.quantity,
    }));

    const total = formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.status(200).json({ items: formattedItems, total });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Failed to fetch cart', error: err });
  }
};