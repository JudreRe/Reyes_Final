require("dotenv").config();

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});


//total record
const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM book";
    return pool.query(sql)
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};




//Import
const importBooks = (params) => {

    const sql = "INSERT INTO book(book_id, title, total_pages, rating, isbn, published_date) VALUES ($1, $2, $3, $4, $5, NULLIF($6,NULL::date))";
   
    return pool.query(sql, params)

        .then(res => {
            return {
                trans: "success", 
                result: res.rows
            };
        })
        .catch(err => {
            return {
                trans: "fail", 
                msg: `${err.message}`
            };
        });
}



module.exports.importBooks = importBooks;
module.exports.getTotalRecords = getTotalRecords;