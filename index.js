const express = require("express");
const app = express();
const dblib = require("./dblib.js");
const path = require("path");
const multer = require("multer");
const upload = multer();
const { Pool } = require('pg');
const { response } = require("express");



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

require('dotenv').config()


app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.listen(process.env.PORT || 3000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });


  //Test to make sure the application works
//Home
//home
app.get("/home", async (req, res) => {
{
  res.render("index");
}
});


//Sum of series
app.get("/sum", (req, res) => {

  res.render("sum", {
    type: "get",
    num1: "",
    num2: "",
    incr: ""
  })
});

app.post("/sum", (req, res) => {
  
  let numbers = [];
  var num1= req.body.num1;
  var num2= req.body.num2;
  var incr= req.body.incr;
  var i= 0;
  var errorMessage= "Ending number must be less than starting number";
  const model= req.body;


  for ( i = num1; i <= num2; i++) {

      if(incr > 0) {


          numbers.push(+incr);



          var sum = numbers.reduce(function(a,b){

            return a + b;
          },0)

         

      } else if (num2 <= num1) {

        errorMessage = errorMessage;
        
          
      } else {

        numbers.push (i++);
        var sum = numbers.reduce(function(a,b){

          return a + b;

         
        },0)
        console.log(sum);

      }
      
      
  }


  res.render("sum", {
    type: "post",
    numbers: numbers,
    num1: num1,
    num2: num2,
    incr: incr,
    i: i,
    sum: sum,
    msg: errorMessage,
    model: model
    
  })
})


//import

app.get("/import", async (req, res) => {
  const totRecs = await dblib.getTotalRecords();
  const book = {

    book_id: "",
    title: "",
    total_pages: "",
    rating: "",
    isbn: "",
    published_date: ""

  };

  res.render("import", {
    type: "get",
    totRecs: totRecs.totRecords,
    book: book
  });
});

// POST /import
app.post("/import", upload.single('filename'), async (req, res) => {

  (async () => {
    var numInserted = 0;
    var numFailed = 0;
    var errorMessage = "";
    const buffer = req.file.buffer;
    const lines = buffer.toString().split(/\r?\n/);



    for (line of lines) {
      
      const book = line.split(",");
      console.log(book);
      
      console.log("Wait for Result")

      const result = await dblib.importBooks(book);

      if (result.trans === "success") {

        numInserted++;

      } else {

        numFailed++;

        errorMessage += `${result.msg} \r\n`;
      };
    };

    console.log("Import Summary");
    console.log(`Records processed: ${numInserted + numFailed}`);
    console.log(`Records successfully inserted: ${numInserted}`);
    console.log(`Records with insertion errors: ${numFailed}`);

    if (numFailed > 0) {

      console.log("Error Details:");

      console.log(errorMessage);
    };

    const totRecs = await dblib.getTotalRecords();

    res.render("import", {
      type: "POST",
      totRecs: totRecs.totRecords,
      numFailed: numFailed,
      numInserted: numInserted,
      errorMessage: errorMessage
    })

  })()

});