const db = require('../dbConfig');

function addToCart(listContentID, callback) {
    var sql = "UPDATE listcontents SET incart = true WHERE id = $1::int";
    var params = [listContentID];

    db.pool.query(sql, params, function(err) {
        if(err) {
            console.log(`Error adding listcontentsitem ${listContentID} to cart. ${err}`);
            callback(err);
        } else {
            console.log(`List Content Item ${listContentID} has been added to the cart.`);
            callback(null);
        }
    });
}

function removeFromCart(listContentID, callback) {
    var sql = "UPDATE listcontents SET incart = false WHERE id = $1::int";
    var params = [listContentID];

    db.pool.query(sql, params, function(err) {
        if(err) {
            console.log(`Error removing listcontentsitem ${listContentID} to cart. ${err}`);
            callback(err);
        } else {
            console.log(`List Content Item ${listContentID} has been removed from the cart.`);
            callback(null);
        }
    });
}

module.exports = {
    addToCart: addToCart,
    removeFromCart: removeFromCart
}