const Product = require('../models/Product.model');
const Cart = require('../models/Cart.model');

exports.strIncludes = (str, inc) => {
    return str.includes(inc)
}

exports.generate = (num) => {
    gen = ''
    for(let i = 0; i < num; i++){
       gen += (Math.floor(Math.random() * 10))
   }
   return gen;
}

// exports.createItems = (pro, qty) => {

// }