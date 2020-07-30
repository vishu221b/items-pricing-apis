const Pool = require('pg').Pool
const constants = require('../constants');
const pool = new Pool({
    user: constants.DB_USER,
    host: constants.DB_HOST,
    password: constants.DB_PASS,
    database: constants.DB_NAME,
    port: constants.DB_PORT
});


let checkIfItemExistsForId = (itemId, callback)=>{
    pool.query('Select * from items where id=$1 and is_active=true', [itemId], (error, result)=>{
        if(error){
            throw error;
        }else if (result.rows.length > 0){
            callback({error: false, result: result.rows});
        }else{
            callback({error: true, result: `No item found with id ${itemId}`});
        }
    });
};

let checkIfItemNameAndModelExists = (nameModel, callback)=>{
    if (nameModel.length !== 2){
        callback({error:true, result: "Both item name and model are required."});
    }
    else{
        pool.query('select * from items where name=$1 and model=$2',nameModel ,(error, result) => {
            if (error){
                throw error;
            }
            else{
                if (result.rowCount >= 1 ){
                    callback({error: true, result: "Cannot create item as an item with same name and model already exists."});
                }
                else if (result.rowCount === 0){
                    callback({error: false});
                }
            }
        });
    }
};

let getAllItems = (request, response) =>{
    pool.query('Select * from items where is_active=true', (error, result) => {
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
    checkIfItemExistsForId(itemId, (result)=>{
        if (result.error){
            response.status(404).json({response: result.result});
        }
        else{
            response.status(200).json({response: result.result});
        }
    });
};

let createNewItem = (request, response) => {
    let { name, model, price } = request.body;
    checkIfItemNameAndModelExists([name, model], (res) => {
        if (res.error){
            response.status(400).json({response: res.result});
        }
        else{
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
        }
    });
};

let deleteItem = (request, response)=> {
    itemId = request.params.id;
    pool.query('update items set is_active=false and last_updated_at=$2 where id=$1', [itemId, new Date()], (error, result)=>{
        if(error){
            throw error;
        }
        else{
            response.status(200).json({response: 'Item successfully removed.'});
        }
    });
};
let updateExistingItem = (request, response) => {
    let itemId = request.params.id;
    checkIfItemExistsForId(itemId, (res) => {
        if(res.error){
            response.status(404).json({response: res.result});
        }
        else{
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
        }
    });
};

let restoreItem = (request, response)=>{
    let itemId = request.params.id;
    checkIfItemExistsForId(itemId, (res) => {
        if (!res.error){
            console.log(res.result);
            response.status(400).json({response: 'Item is already active.'});
        }else{
            pool.query('update items set is_active=true, last_updated_at=$2 where id=$1', [itemId, new Date()], (error, result)=>{
                if (error){
                    throw error;
                }
                else {
                    response.status(200).json({response: 'Item restored successfully.'});
                }
            });
        }
    });
};
module.exports = {
    getAllItems,
    createNewItem,
    updateExistingItem,
    getSingleItem,
    deleteItem,
    restoreItem
}
