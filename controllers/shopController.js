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
