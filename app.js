const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const { Pool } = require("pg");
const connectionString = process.env.DATABASE_URL || "postgres://postgres:1-1=Postgres@localhost:5432/shoppinglist";
const pool = new Pool({connectionString: connectionString});
app.use(express.static('public'));

app.get('/getList', function(req,res) {
    try {
        let url = req.query.list;
        console.log(`URL Received: ${url}`);
        //Do a SQL query and pull the list ID based on the list URL. Then pull all of the listContents relative to the ID
        getListID(url, function (err, result) {
            if (err || !result) {
                res.status(500).json({success: false, data: err});
            } else {

                let listID = result.id;
                getListContents(listID, function (err2, listItems) {
                    if (err2) {
                        res.status(500).json({success: false, data: err2});
                    } else {
                        res.status(200).json({listItems, listID: listID});
                    }
                });
            }
        });
    } catch(err) {
        console.log(err);
    }
});

app.delete('/removeFromList', function(req,res) {
    let  listContentsID = req.body.listContentsID;
    //Do A DELETE SQL query where the listContentID = listContents.id
    removeFromList(listContentsID,function(err,result) {
        if(err || result.rowCount === 0) {
            res.status(500).json({
                success:false,
                data: err || 'There was nothing to delete.'
            });
        } else {
            res.status(200).json({
                success:true
            });
        }
    });
});

app.post('/addToList', function(req,res) {

    let itemID = req.body.itemID;
    let listID = req.body.listID;
    //Do an INSERT INTO listContents database listID and itemID will be added.
    insertIntoList(itemID,listID,function(err,result) {
       if(err) {
           res.status(500).json({
               success:false,
               data:err
           });
       } else {
           res.status(200).json({
               success:true,
               listContentsID:result.id
           });
       }
    });
});

app.post('/createItem', function(req,res) {
    let itemName = req.body.name;
    let aisle = req.body.aisle || '';
    let store = req.body.store || '';

    console.log(`Item Name ${itemName}; Aisle: ${aisle}; Store: ${store}`);

    createItem(itemName,aisle,store,function(err,result) {
       if(err)
       {
           res.status(500).json({
               success:false,
               data:err
           });
       } else {
           res.status(200).json({
               itemID: result.id
           });
       }
    });
});

app.put('/updateItem', function(req,res) {
    let itemName = req.body.name || '';
    let aisle = req.body.aisle || '';
    let store = req.body.store || '';
    let itemID = req.body.itemID;

    updateItem(itemID,itemName,aisle,store,function(err) {
        if(err)
        {
            res.status(500).json({
                success:false,
                data:err
            });
        } else {
            res.status(200).json({
                success:true
            });
        }
    });
});

app.put('/addToCart', function(req,res) {
    let listContentsID = req.body.listContentsID;
    addToCart(listContentsID,function(err){
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
});

app.put('/removeFromCart', function(req,res) {
    let listContentsID = req.body.listContentsID;
    removeFromCart(listContentsID,function(err){
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
});

app.post('/createList', function(req,res) {
    //Generate a random hex string which will be the "URL"
    let url = generateURL();
    insertURLIntoDatabase(url, function(err) {
        if(err) {
            res.status(500).json({success:false, data:error});
        } else {
            res.status(200).json({
               url: url
            });
            res.end();
        }
    });
});


function insertIntoList(itemId,listId,callback) {
    var sql = "INSERT INTO listcontents (itemid,listid) VALUES ($1::int,$2::int) RETURNING id";
    var params = [itemId,listId];

    pool.query(sql, params,function(err, res) {
        if(err) {
            console.log(`There was an issue adding itemID ${itemId} to list ${listId}. Error Message: ${err}`);
            callback(err,null);
        } else {
            console.log(`Item ${itemId} has been inserted into list ${listId}.`);
            callback(null,res.rows[0]);
        }
    });
}

function removeFromList(listContentsID,callback) {
    var sql = "DELETE FROM listcontents WHERE id = $1::int";
    var params = [listContentsID];

    pool.query(sql, params,function(err,res){
       if(err) {
           console.log(`There was an issue deleting listcontentsID ${listContentsID}. Error Message: ${err}`);
           callback(err,null);
       } else {
           callback(null,res);
       }
    });
}

function addToCart(listContentID, callback) {
    var sql = "UPDATE listcontents SET incart = true WHERE id = $1::int";
    var params = [listContentID];

    pool.query(sql, params, function(err) {
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

    pool.query(sql, params, function(err) {
        if(err) {
            console.log(`Error removing listcontentsitem ${listContentID} to cart. ${err}`);
            callback(err);
        } else {
            console.log(`List Content Item ${listContentID} has been removed from the cart.`);
            callback(null);
        }
    });
}
function createItem(itemName,aisle,store,callback) {
    console.log(`Item Name ${itemName}; Aisle: ${aisle}; Store: ${store}`);

    var sql = "INSERT INTO items (name,aisle,store) VALUES ($1::text,$2::text,$3::text) RETURNING id";
    var params = [itemName,aisle,store];
    console.log(`Create Item Params: ${params}`);
    pool.query(sql, params, function(err, results) {
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
    pool.query(sql, params, function(err) {
        if(err) {
            console.log(`Error updating item ${itemID}. ${err}`);
            callback(err);
        } else {
            console.log(`Item ${itemID} has been updated in the database.`);
            callback(null);
        }

    });
}

 function getListContents(listID, callback) {
    try {
        //Get List Contents based on listID
        let sql = "SELECT listcontents.id, items.name, items.aisle, items.store,items.id AS itemID, incart FROM listcontents\n" +
            "INNER JOIN items ON items.id = listcontents.itemid\n" +
            "WHERE listid = $1::int";

        //    let sql = "SELECT * FROM listcontents WHERE listid = $1::int";
        let params = [listID];

        pool.query(sql, params, function (err, results) {
            if (err) {
                console.log(`Error Retrieving List Contents for ListID ${listID}. ${err}`);
                callback(err, null);
            } else {
                callback(null, results.rows);
            }
        });
    } catch (err) {
        console.log(err);
    }
}

function getListID(url,callback) {
    try {
        let sql = "SELECT id FROM lists WHERE listurl = $1::text";
        let params = [url];

        pool.query(sql, params, function (err, results) {
            if (err) {
                console.log(`There was an error getting the list using ${url} from the database. The error message is: ${err}`);
                callback(err, null);
            } else {
                callback(null, results.rows[0]);
            }
        })
    } catch (err) {
        console.log(err);
    }
}


function insertURLIntoDatabase(url, callback) {
    console.log(`Insert URL ${ url } into database.`);

    var sql = "INSERT INTO lists (listurl) VALUES ($1::text) RETURNING id";
    var params = [url];

    pool.query(sql, params, function(err, results) {
        if(err) {
            console.log(`Error inserting list into database. ${err}`);
            callback(err, null);
        } else {
            console.log(`URL ${url} has been inserted into database. The ID is ${results.rows[0].id}`);
            callback(null, results.rows[0]);
        }

    });
}


function generateURL() {
    let crypto = require('crypto');
    let url = crypto.randomBytes(20).toString('hex');
    return url;
}

app.listen(port, () => console.log(`Listening on port ${ port }`));