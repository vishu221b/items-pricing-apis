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
        console.log(+ new Date());
        response.status(200).json({response: finalResult});
    });
};

module.exports = {
    getAllItems
}
