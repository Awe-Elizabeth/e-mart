const mongoose = require('mongoose');


const ShippingSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    country: {
        type: String,
        required: [true, 'country is required']
    },
    address: {
        type: String,
        required: [true, 'shipping address is required']
    },
    apartment: {
        type: String
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    state: {
        type: String,
        required: [true, 'State is required']
    },
    postalCode: {
        type: String,
        required: [true, 'Postal code is required']
    },
    countyCode: {

    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required']
    }
});

module.exports = mongoose.model('Shipping', ShippingSchema);