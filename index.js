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
app.get("/sum")

//import

app.get("/import", async (req, res) => {
  const totRecs = await dblib.getTotalRecords();
  const customers = {

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
    customer: customers
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