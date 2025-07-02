import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop', // or whatever your medicine model is called
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  priceAtPurchase: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // adjust if your user model name differs
    required: true,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  orderedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Placed', 'Shipped', 'Delivered'],
    default: 'Placed',
  },
  paymentStatus: {
  type: String,
  enum: ['Pending', 'Paid', 'Failed'],
  default: 'Pending',
},
paymentMode: {
  type: String,
  enum: ['Cash', 'Card', 'UPI', 'Razorpay'],
},
paymentId: {
  type: String, // from Razorpay or other gateway
},

});

const Order = mongoose.model('Order', orderSchema);
export default Order;
