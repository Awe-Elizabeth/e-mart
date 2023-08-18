const asyncHandler = require('../middleware/async');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const Cart = require('../models/Cart.model');
const Shipping = require('../models/Shipping.model');
const ErrorResponse = require('../utils/error');
const advancedResults = require('../middleware/advanced');
const {strIncludes, generate} = require('../utils/string');
const uploadImage = require('../utils/cloudinary');

/**
 * @desc    Get all products
 * @route   GET /api/v1/products
 * @access  Public
 */
exports.getProducts = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
});

/**
 * @desc    Get one product
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
exports.getProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorResponse(`Product with the id of ${req.params.id} not found`, 404))
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

/**
 * @desc    Create products
 * @route   POST /api/v1/products
 * @access  Private
 */
exports.addProducts = asyncHandler(async (req, res, next) => {
    const {name, description, price, image} = req.body;
    const user = await User.findById(req.user._id);

    if(user.role !== 'admin'){
        return next(new ErrorResponse(`User with the role ${user.role} is not authorized to access this route`, 403));
    }

    const product = await Product.create({
        name,
        description,
        price,
        user: user._id
    });

    if(image){
        let image_name = `${product.name}_${generate(5)}`;
        let result =  await uploadImage(`data:image/jpeg;base64,${image}`, image_name);
        product.images.push(result.url);
        
    }

    await product.save();

    res.status(200).json({
        success: true,
        data: product
    });

});

/**
 * @desc    Update a product
 * @route   PUT /api/v1/products/:id
 * @access  Private
 */
exports.updateProducts = asyncHandler(async (req, res, next) => {
    const {name, description, price, image} = req.body;
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorResponse(`Product with the id of ${req.params.id} not found`, 404))
    }

   product.name = name ? name : product.name;
   product.description = description ? description : product.description;
   product.price = price ? price : product.price;
   
   if(image){
    let image_name = `${product.name}_${generate(5)}`;
    let result =  await uploadImage(`data:image/jpeg;base64,${image}`, image_name);
    product.images.push(result.url);
    
    }

    await product.save()

    res.status(200).json({
        success: true,
        data: product
    });
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/v1/products/:id
 * @access  Private
 */
exports.deleteProducts = asyncHandler(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorResponse(`Product with the id of ${req.params.id} not found`, 404))
    }

    await Product.deleteOne(product._id);
   

    res.status(200).json({
        success: true,
        data: []
    });
});
/**
 * @desc    Add products to cart
 * @route   POST /api/v1/products/addtocart
 * @access  private
 */
exports.addProductToCart = asyncHandler(async (req, res, next) => {
    const items = req.body.items

    const user = await User.findById(req.user._id);

    if(!user){
        return next(new ErrorResponse('User not found', 404));
    }

    if(!user.cart){
        const cart = await Cart.create({
            totalPrice: 0
        }) 
        user.cart = cart._id;
        await user.save();
    }

    const cart = await Cart.findById(user.cart);
    if(!cart){
        return next(new ErrorResponse('cart not found', 404));
    }
    
   
    for(const item of items){
        const product = await Product.findById(item.product)
        if(!product){
            return next(new ErrorResponse('Product not found', 404));
        }

        const index = cart.items.findIndex((itm) => itm.product.toString() === item.product.toString());

        if(index > -1){
            cart.items[index].qty = item.qty;
        }else {
            cart.items.push(item);
        }
    }

    let totalPrice = 0;
    for(const item of cart.items){
        const product = await Product.findById(item.product)
        if(!product){
            return next(new ErrorResponse('Product not found', 404));
        }

        totalPrice += (product.price * item.qty)   
    }

    cart.totalPrice = totalPrice;

    await cart.save()
   
    res.status(200).json({
        success: true,
        data: cart
    });
});


/**
 * @desc   Remove products from cart
 * @route   POST /api/v1/products/removefromcart
 * @access  private
 */
exports.removeProductFromCart = asyncHandler(async (req, res, next) => {
    const {item} = req.body

    const user = await User.findById(req.user._id);

    const cart = await Cart.findById(user.cart);

    if(!cart){
        return next(new ErrorResponse('cart is not found', 404));
    }
    const product = await Product.findById(item.product);

    if(!product){
        return next(new ErrorResponse('Product does not exist', 404));
    }

    const index = cart.items.findIndex((item) => item.product.toString() === product._id.toString());

    if(index === -1){
        return next(new ErrorResponse('Item does not exist in cart', 404))
    }

    let items = cart.items
    cart.totalPrice -= (product.price * items[index].qty)

    cart.items.splice(index, 1);
    cart.save()

    res.status(200).json({
        success: true,
        data: cart
    });
});

/**
 * @desc   Remove products from cart
 * @route   POST /api/v1/products/removefromcart
 * @access  private
 */exports.buyProduct = asyncHandler(async (req, res, next) => {

 })