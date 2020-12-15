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
    sql = "SELECT COUNT(*) FROM customer";
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


//insert customers
const insertCustomer = (customer) => {
    
    if (customer instanceof Array) {
        params = customer;
    } else {
        params = Object.values(customer);
    };

    const sql = `INSERT INTO customer (cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev)
                 VALUES ($1, $2, $3, $4, $5, $6)`;

    return pool.query(sql, params)
        .then(res => {
            return {
                trans: "success", 
                msg: `customer id ${params[0]} successfully inserted`
            };
        })
        .catch(err => {
            return {
                trans: "fail", 
                msg: `Error on insert of customer id ${params[0]}.  ${err.message}`
            };
        });
};

//Customers ordered by last name
const reportCustomer = () => {

 
    const sql = "SELECT * FROM customer ORDER BY cuslname asc";

    return pool.query(sql)
    .then(report => {
        return {
            trans: "success",  
            repCus: report.rows  
    }
    })
    .catch(err =>{
        return{
            trans: "fail",
            msg: `${err.message}`
        }
    })

};

//Sales ordered by descending
const reportSales = () => {

 
    const sql = "SELECT * FROM customer ORDER BY cussalesytd desc";

    return pool.query(sql)
    .then(report => {
        return {
            trans: "success",  
            repSal: report.rows  
    }
    })
    .catch(err =>{
        return{
            trans: "fail",
            msg: `${err.message}`
        }
    })

};


//Random
const reportRandom = () => {

    const sql = "SELECT * FROM customer ORDER BY RANDOM() LIMIT 3";

    return pool.query(sql)
    .then(report => {
        return {
            trans: "success",
            repRan: report.rows
        }

    })
    .catch(err =>{
        return {
            trans:"fail",
            msg: `${err.message}`
        }
    })
};


//Import
const importCustomer = (params) => {

    const sql = "INSERT INTO customer(cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev) VALUES ($1, $2, $3, $4, $5, $6)";
   
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

//Find
const findCustomer = (customer) => {
    

    var i = 1;
    params = [];
    sql = "SELECT * FROM customer WHERE true";


    if (customer.cusid !== "") {
        params.push(parseInt(customer.cusid));
        sql += ` AND cusid = $${i}`;
        i++;
    };
    if (customer.cusfname !== "") {
        params.push(`${customer.cusfname}%`);
        sql += ` AND UPPER(cusfname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cuslname !== "") {
        params.push(`${customer.cuslname}%`);
        sql += ` AND UPPER(cuslastname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusstate !== "") {
        params.push(`${customer.cusstate}%`);
        sql += ` AND UPPER(cusstate) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cussalesytd !== "") {
        params.push(parseFloat(customer.cussalesytd));
        sql += ` AND cussalesytd >= $${i}`;
        i++;
    };
    if (customer.cussalesprev !== "") {
        params.push(parseFloat(customer.cussalesprev));
        sql += ` AND cussalesprev >= $${i}`;
        i++;
    };

    sql += ` ORDER BY cusid`;

     console.log("sql: " + sql);
     console.log("params: " + params);

    return pool.query(sql, params)
        .then(result => {
            return { 
                trans: "success",
                result: result.rows
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};

module.exports.importCustomer = importCustomer;
module.exports.reportRandom = reportRandom;
module.exports.reportSales = reportSales;
module.exports.reportCustomer = reportCustomer;
module.exports.findCustomer = findCustomer;
module.exports.insertCustomer = insertCustomer;
module.exports.getTotalRecords = getTotalRecords;