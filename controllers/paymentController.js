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






import Earning from "../models/earning.model.js";
import Salary from "../models/salary.model.js";


function getMonthString(date = new Date()) {
  return date.toISOString().slice(0, 7); // e.g., "2025-06"
}

export const updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId, paymentId } = req.body;
    //console.log("Updating payment for bookingId:", bookingId, "paymentId:", paymentId);

    if (!bookingId || !paymentId) {
      return res.status(400).json({ error: "Missing bookingId or paymentId" });
    }

    const bill = await Bill.findOne({ bookingId });
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    bill.paymentId = paymentId;
    bill.paymentStatus = "Paid";
    await bill.save();

    // 🔢 Helper share (95% of baseAmount)
    const helperId = bill.helperId;
    const helperShare = bill.baseAmount * 0.95;

    // ➕ Add/update Salary record
    const existingSalary = await Salary.findOne({ helperId });
    if (existingSalary) {
      existingSalary.pendingAmount += helperShare;
      await existingSalary.save();
    } else {
      await Salary.create({
        helperId,
        pendingAmount: helperShare,
        lastCredited: null
      });
    }

    // 📈 Update Earning for the month
   const createdAt = bill?.createdAt || new Date();
const month = getMonthString(new Date(createdAt));

    let earning = await Earning.findOne({ month });

    if (!earning) {
      earning = new Earning({
        month,
        totalRevenue: 0,
        totalSalaries: 0,
        profit: 0
      });
    }

    earning.totalRevenue += bill.totalAmountPaid; // what user paid
    earning.totalSalaries += helperShare; // what will eventually be paid
    earning.profit = earning.totalRevenue - earning.totalSalaries;

    await earning.save();

    return res.status(200).json({ success: true, bill });
  } catch (err) {
    console.error("Error updating payment:", err);
    return res.status(500).json({ error: "Server error" });
  }
};





export const getHelperSalary = async (req, res) => {
  try {
    const helperId = req.helper?.id;
    if (!helperId) {
      return res.status(401).json({ message: "Unauthorized: Helper ID missing" });
    }

    const salary = await Salary.findOne({ helperId });

    if (!salary) {
      return res.status(404).json({ message: "No salary record found" });
    }

    res.status(200).json({
      success: true,
      helperId,
      pendingAmount: salary.pendingAmount,
      lastCredited: salary.lastCredited
    });

  } catch (error) {
    console.error("Error fetching helper salary:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};




