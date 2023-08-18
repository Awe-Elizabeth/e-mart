const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password cannot be less than 8 characters'],
        select: false
    },
    phoneCode: {
        type: String,
        required: [true, 'Country code is required']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true
    },
    address: {
        type: String
    },
    zipcode: {
        type: String
    },
    role: {
        type: String,
        default: 'user'
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required']
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt:{
        type: Date,
        default: Date.now
    },
    cart: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cart',
        // required: true
    },
    shippings: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Shipping',
        }
    ] 
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function (){
    return jwt.sign({id: this.id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    });
};

// Match user entered password to hashed password in the database
UserSchema.methods.matchPassword = async function(enteredPassword){
    return bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash reset password token
UserSchema.methods.getResetPasswordToken = function (){
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to reset password field
    this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    // reset password expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model('User', UserSchema);
