const router = require('express').Router();
const {
    getUsers,
    getUser,
    register,
    updateDetails,
    login,
    logout,
    forgotPassword,
    getMe,
    resetPassword
} = require('../controllers/auth.controllers');
const User = require('../models/User.model');
const {protect, authorize} = require('../middleware/auth')
const advancedResults = require('../middleware/advanced')

router.get('/', advancedResults(User), getUsers);
router.get('/me', protect, getMe);
router.post('/register', register)
router.put('/updateDetails', protect, updateDetails);
router.post('/login', login);
router.post('/logout', protect, logout);
router.put('/forgotPassword', forgotPassword);
router.put('/resetPassword', resetPassword);
router.get('/:id', protect, getUser);

module.exports = router;