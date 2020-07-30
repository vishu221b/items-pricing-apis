const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const items = require('./db/items');

app.use(bodyParser.json());

app.get('/', items.getAllItems);


app.listen(9999, () => {
    console.log('Express Rest APIs fired at port 9999.');
});
