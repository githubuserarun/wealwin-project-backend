const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const subcategorySchema = new Schema({
    categoryId: { type: Schema.Types.ObjectId, required: true, ref: 'categoryCollection' },
    subcategory: { type: String, required: true }
});

module.exports = mongoose.model('subcategoryCollection', subcategorySchema);