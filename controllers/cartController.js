const cartModel = require('../models/cartModel.js');

function addItemToCart(req,res) {
    let listContentsID = req.body.listContentsID;
    cartModel.addToCart(listContentsID,function(err){
        if(err){
            res.status(500).json({
                success:false,
                data:err
            });
        } else {
            res.status(200).json({
                success:true
            })
        }
    });
}

function removeItemFromCart(req,res) {
    let listContentsID = req.body.listContentsID;
    cartModel.removeFromCart(listContentsID,function(err){
        if(err){
            res.status(500).json({
                success:false,
                data:err
            });
        } else {
            res.status(200).json({
                success:true
            })
        }
    });
}

module.exports = {
    addItemToCart: addItemToCart,
    removeItemFromCart: removeItemFromCart
}