const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/error');
const User = require('../models/User.model');
const {strIncludes} = require('../utils/string');
const sendEmail = require('../utils/sendEmail');

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
});
/**
 * @desc    Get a single users
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});
/**
 * @desc    Register
 * @route   POST /api/v1/users/
 * @access  Private
 */
exports.register = asyncHandler(async (req, res, next) => {
    const {firstName, lastName, password, phoneCode, phoneNumber, email, address, zipcode} = req.body;

    if(!strIncludes(phoneCode, '+')){
        return next(new ErrorResponse('Phonecode must include \'+\' sign'));
    };

    // format phone number
    let phoneStr;
    if(strIncludes(phoneCode, '-')){
        phoneStr = phoneCode.substring(3)
    }else {
        phoneStr = phoneCode.substring(1)
    }

    const phoneExist = await User.findOne({phoneNumber: phoneStr + phoneNumber.substring(1)});

    if(phoneExist){
        return next(new ErrorResponse('Phone number already exists'))
    }

    const user = await User.create({
        firstName,
        lastName,
        password,
        email,
        address,
        zipcode,
        phoneCode,
        phoneNumber: phoneStr + phoneNumber.substring(1)
    });


    const message = `You have successfully registered on devLizzy's shop`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Register Email',
            message
        });
        res.status(200).json({success: true, message: 'Email sent', data: user});
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse('Email could not be sent', 500));
    }
   
});
/**
 * @desc    login
 * @route   GET /api/v1/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password){
        return next(new ErrorResponse('Please, provide a valid email and password', 400));
    }

    // Find the user with email
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // check if password matches
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});
/**
 * @desc    logout
 * @route   GET /api/v1/auth/logout
 * @access  Public
 */
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        date: {}
    });
});
/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */  
exports.getMe = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        data: user
    });
});
/**
 * @desc    Update user information
 * @route   PUT /api/v1/auth/updatedetails
 * @access  Private
 */ 
exports.updateDetails = asyncHandler(async (req, res, next) => {
    let {firstName, lastName, phoneNumber, phoneCode, email} = req.body;

    const user = await User.findById(req.user.id);
    if(phoneNumber && !phoneCode){
        phoneCode = user.phoneCode;
        if(!strIncludes(phoneCode, '+')){
            return next(new ErrorResponse('Phonecode must include \'+\' sign'));
        };
    
        // format phone number
        let phoneStr;
        if(strIncludes(phoneCode, '-')){
            phoneStr = phoneCode.substring(3)
        }else {
            phoneStr = phoneCode.substring(1)
        }
    
        const phoneExist = await User.findOne({phoneNumber: phoneStr + phoneNumber.substring(1)});
    
        if(phoneExist){
            return next(new ErrorResponse('Phone number already exists'))
        }

        phoneNumber = phoneStr + phoneNumber.substring(1)
    };

    user.firstName = firstName ? firstName : user.firstName;
    user.lastName = lastName ? lastName : user.lastName;
    user.phoneNumber = phoneNumber ? phoneNumber : user.phoneNumber;
    user.email = email ? email : user.email;

    await user.save();

    res.status(200).json({
        success: true,
        data: user
    });
});
/**
 * @desc    Forgot password
 * @route   PUT /api/v1/auth/forgotPassword
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user){
        return next(new ErrorResponse('There is no user with the email', 404));
    }
    
    // Get reset token
    const resetToken = user.getResetPasswordToken();

    // save modified resetToken and expire
    await user.save({validateBeforeSave: false});

    // create resetUrl
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;
    const message =
    `You are receiving this text because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Reset Password',
            message
        });
        res.status(200).json({success: true, message: 'Email sent', data:user});
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined,
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave: false});

        return next(new ErrorResponse('Email could not be sent', 500));
    }

    // res.status(200).json({
    //     success: true,
    //     data: user
    // });
});
/**
 * @desc    Reset password
 * @route   PUT /api/v1/auth/resetPassword
 * @access  Private
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {

    const {password} = req.body
    // Get hashed token
    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');
    
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    });

    if(!user){
        return next(new ErrorResponse('Invalid Token', 400));
    }

    // set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
});
// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 100),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
        success: true,
        token
    });
};
