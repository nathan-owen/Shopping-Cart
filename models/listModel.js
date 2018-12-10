const db = require('../dbConfig');


function getListContents(listID, callback) {
    try {
        //Get List Contents based on listID
        let sql = "SELECT listcontents.id, items.name, items.aisle, items.store,items.id AS itemID, incart FROM listcontents\n" +
            "INNER JOIN items ON items.id = listcontents.itemid\n" +
            "WHERE listid = $1::int ORDER BY incart";

        //    let sql = "SELECT * FROM listcontents WHERE listid = $1::int";
        let params = [listID];

        db.pool.query(sql, params, function (err, results) {
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

        db.pool.query(sql, params, function (err, results) {
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

function removeFromList(listContentsID,callback) {
    var sql = "DELETE FROM listcontents WHERE id = $1::int";
    var params = [listContentsID];

    db.pool.query(sql, params,function(err,res){
        if(err) {
            console.log(`There was an issue deleting listcontentsID ${listContentsID}. Error Message: ${err}`);
            callback(err,null);
        } else {
            callback(null,res);
        }
    });
}

function insertIntoList(itemId,listId,callback) {
    var sql = "INSERT INTO listcontents (itemid,listid) VALUES ($1::int,$2::int) RETURNING id";
    var params = [itemId,listId];

    db.pool.query(sql, params,function(err, res) {
        if(err) {
            console.log(`There was an issue adding itemID ${itemId} to list ${listId}. Error Message: ${err}`);
            callback(err,null);
        } else {
            console.log(`Item ${itemId} has been inserted into list ${listId}.`);
            callback(null,res.rows[0]);
        }
    });
}

function insertURLIntoDatabase(url, callback) {
    console.log(`Insert URL ${ url } into database.`);

    var sql = "INSERT INTO lists (listurl) VALUES ($1::text) RETURNING id";
    var params = [url];

    db.pool.query(sql, params, function(err, results) {
        if(err) {
            console.log(`Error inserting list into database. ${err}`);
            callback(err, null);
        } else {
            console.log(`URL ${url} has been inserted into database. The ID is ${results.rows[0].id}`);
            callback(null, results.rows[0]);
        }

    });
}

module.exports = {
    getListContents:getListContents,
    getListID: getListID,
    removeFromList:removeFromList,
    insertIntoList: insertIntoList,
    insertURLIntoDatabase: insertURLIntoDatabase
};