const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const items = require('./db/items');

app.use(bodyParser.json());

app.put('/item/:id', items.updateExistingItem);
app.post('/item', items.createNewItem);
app.get('/item/:id', items.getSingleItem);
app.get('/', items.getAllItems);


app.listen(9999, () => {
    console.log('Express Rest APIs fired at port 9999.');
});
