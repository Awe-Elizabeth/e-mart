const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is require']
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    price: {
        type: Number,
        required: [true, 'product price is required']
    },
    images: [
        {
            type: String
        }
    ],
    slug: {
        type: String
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// Create product slug
ProductSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lowercaser: true});
    next();
});

module.exports = mongoose.model('Product', ProductSchema);