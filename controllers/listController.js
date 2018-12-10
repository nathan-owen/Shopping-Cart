const listModel = require('../models/listModel.js');
function getList(req,res) {
    try {
        let url = req.query.list;
        console.log(`URL Received: ${url}`);
        //Do a SQL query and pull the list ID based on the list URL. Then pull all of the listContents relative to the ID
        listModel.getListID(url, function (err, result) {
            if (err || !result) {
                res.status(500).json({success: false, data: err});
            } else {

                let listID = result.id;
                listModel.getListContents(listID, function (err2, listItems) {
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
}

function removeFromList(req,res) {
    let  listContentsID = req.body.listContentsID;
    //Do A DELETE SQL query where the listContentID = listContents.id
    listModel.removeFromList(listContentsID,function(err,result) {
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
}

function addToList(req,res) {

    let itemID = req.body.itemID;
    let listID = req.body.listID;
    //Do an INSERT INTO listContents database listID and itemID will be added.
    listModel.insertIntoList(itemID,listID,function(err,result) {
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
}

function createList(req,res) {
    //Generate a random hex string which will be the "URL"
    let url = generateURL();
    listModel.insertURLIntoDatabase(url, function(err) {
        if(err) {
            res.status(500).json({success:false, data:error});
        } else {
            res.status(200).json({
                url: url
            });
            res.end();
        }
    });
}

function generateURL() {
    let crypto = require('crypto');
    let url = crypto.randomBytes(20).toString('hex');
    return url;
}

module.exports = {
    getList: getList,
    removeFromList: removeFromList,
    addToList: addToList,
    createList: createList
};