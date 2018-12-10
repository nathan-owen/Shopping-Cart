const db = require('../dbConfig');

function createItem(itemName,aisle,store,callback) {
    console.log(`Item Name ${itemName}; Aisle: ${aisle}; Store: ${store}`);

    var sql = "INSERT INTO items (name,aisle,store) VALUES ($1::text,$2::text,$3::text) RETURNING id";
    var params = [itemName,aisle,store];
    console.log(`Create Item Params: ${params}`);
    db.pool.query(sql, params, function(err, results) {
        if(err) {
            console.log(`Error inserting item into database. ${err}`);
            callback(err, null);
        } else {
            console.log(`Item ${itemName} has been inserted into database. The ID is ${results.rows[0].id}`);
            callback(null, results.rows[0]);
        }

    });
}

function updateItem(itemID,itemName,aisle,store,callback) {
    var sql = "UPDATE items SET name = $1::text, aisle = $2::text, store = $3::text WHERE id = $4::int";
    var params = [itemName,aisle,store,itemID];

    console.log(params);
    db.pool.query(sql, params, function(err) {
        if(err) {
            console.log(`Error updating item ${itemID}. ${err}`);
            callback(err);
        } else {
            console.log(`Item ${itemID} has been updated in the database.`);
            callback(null);
        }

    });
}

module.exports = {
    createItem: createItem,
    updateItem: updateItem
}