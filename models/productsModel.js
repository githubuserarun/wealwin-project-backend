const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    productName: String,
    category: String,
    subcategory: String,
    description: String,
    quantity: Number,
    price : Number,
    image: String,
  });

  module.exports = mongoose.model('Product', productSchema);