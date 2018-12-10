const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const listController = require('./controllers/listController');
const itemController = require('./controllers/itemController');
const cartController = require('./controllers/cartController');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// List Routes
app.get('/getList', listController.getList);

app.delete('/removeFromList', listController.removeFromList);

app.post('/addToList', listController.addToList);

app.post('/createList', listController.createList);

//Item Routes
app.post('/createItem', itemController.createItem);

app.put('/updateItem', itemController.updateItem);

//Cart Routes
app.put('/addToCart', cartController.addItemToCart );

app.put('/removeFromCart', cartController.removeItemFromCart);

app.listen(port, () => console.log(`Listening on port ${ port }`));