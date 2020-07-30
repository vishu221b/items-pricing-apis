const Pool = require('pg').Pool
const constants = require('../constants');
const pool = new Pool({
    user: constants.DB_USER,
    host: constants.DB_HOST,
    password: constants.DB_PASS,
    database: constants.DB_NAME,
    port: constants.DB_PORT
});


let getAllItems = (request, response) =>{
    pool.query('Select * from items', (error, result) => {
        if (error){
            throw error;
        }
        let finalResult = [];
        result.rows.forEach((item) => {
            item.price = '$'+ item.price;
            finalResult.push(item);
        });
        response.status(200).json({response: finalResult});
    });
};

let getSingleItem = (request, response) => {
    let itemId = request.params.id;
    pool.query('Select * from items where id=$1', [itemId], (error, result) => {
        if (error){
            throw error;
        }
        else{
            response.status(200).json({response: result.rows});
        }
    });
};

let createNewItem = (request, response) => {
    let { name, model, price } = request.body;
    if (!name){
        response.status(400).json({error: "Please specify the name of the item."});
    }
    else if (!model){
        response.status(400).json({error: "Please specify the model of the item."});
    }
    else if (!price){
        response.status(400).json({error: "Please specify the price of the item."});
    }
    else{
        let currentTimestamp = new Date();
        pool.query(`Insert into items (name, model, price, created_at, last_updated_at, is_active) values ($1, $2, $3, $4, $5, $6)`,
        [name, model, price, currentTimestamp, currentTimestamp, 1],
        (error, result)=>{
            if (error){
                throw error;
            }
            response.status(201).json({ response: "SUCCESS", message: `Created ${result.rowCount} items successfully.`});
        });
    }
};

let updateExistingItem = (request, response) => {
    let itemId = request.params.id;
    let { name, model, price } = request.body;
    if (!(name.length >= 3)){
        response.status(400).json({error: "Invalid item name length. Minimum length should be 3."});
    }
    else if (!(model.length >= 2)){
        response.status(400).json({error: "Invalid item model length. Minimum length should be 2."});
    }
    else if(!price){
        model.price = 100;
    }
    else{
        let currentTimestamp = new Date();
        console.log([name, model, itemId, price]);
        pool.query("UPDATE items set name=$1, model=$2, price=$4, last_updated_at=$5 where id=$3", [name, model, itemId, price, currentTimestamp], (error, result)=>{
            if(error){
                throw error;
            }
            else{
                response.status(200).json({response: "SUCCESS", message: "Item updated successfully."});
            }
        });
    }
};

module.exports = {
    getAllItems,
    createNewItem,
    updateExistingItem,
    getSingleItem
}
