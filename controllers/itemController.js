const itemModel = require('../models/itemModel');
function createItem(req,res) {
    let itemName = req.body.name;
    let aisle = req.body.aisle || '';
    let store = req.body.store || '';

    console.log(`Item Name ${itemName}; Aisle: ${aisle}; Store: ${store}`);

    itemModel.createItem(itemName,aisle,store,function(err,result) {
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
}

function updateItem(req,res) {
    let itemName = req.body.name || '';
    let aisle = req.body.aisle || '';
    let store = req.body.store || '';
    let itemID = req.body.itemID;

    itemModel.updateItem(itemID,itemName,aisle,store,function(err) {
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
}

module.exports = {
    createItem: createItem,
    updateItem: updateItem
}