const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cartSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  cartQuantity: { type: Number, default: 1 },
  total: { type: Number },
  status: { type: Boolean, default: false },
});

module.exports = mongoose.model("cartCollection", cartSchema);
