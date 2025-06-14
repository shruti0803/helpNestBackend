import { instance } from "../index.js"; // or wherever you placed the Razorpay setup
import Bill from "../models/bill.model.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const bill = await Bill.findOne({ bookingId });
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    const options = {
      amount: bill.totalAmountPaid * 100, // ₹ -> paise
      currency: "INR",
      receipt: `receipt_order_${bill._id}`,
    };

    const order = await instance.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
      bill,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Payment initiation failed" });
  }
};


export const updatePaymentStatus = async (req, res) => {
  const { bookingId, paymentId } = req.body;

  const bill = await Bill.findOne({ bookingId });
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  bill.paymentId = paymentId;
  bill.paymentStatus = "Paid";
  await bill.save();

  res.status(200).json({ success: true, bill });
};

