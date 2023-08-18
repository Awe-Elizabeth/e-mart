const mongoose = require('mongoose');


const CartSchema = new mongoose.Schema({
    totalPrice: {
        type: Number,
        default: 0
    },
    items: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
            },
            qty: {
                type: Number,
                default: 1
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Cart', CartSchema);