"use strict";
var _ = require("lodash");

const express = require('express');
 const connectDB = require('./server/database/db');


var dslog = require("./server/utils/dslog");
var utils = require("./server/utils/utils");
var serverConfigs = require("./server/configs/serverConfigs");
var cors = require("cors");
var session = require("express-session");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
;


const app = express();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//body parser
app.use(express.json());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//connect to database

 connectDB();

 app.use(
    session({
      secret: "salvo  Welcomes you",
      saveUninitialized: false, // don't create session until something stored
      resave: false //don't save session if unmodified
    })
  );




 
  app.use(function(req, res, next) {
    console.log("session information");
    console.dir(req.session.globals);
    console.log("session information");
    next();
  });
  
  function NotFound(msg) {
    console.dir(msg);
    this.name = "NotFound";
    Error.call(this, msg);
    //Error.captureStackTrace(this, arguments.callee);
  }
  
  // error handling
  app.use(function(err, req, res, next) {
    // if an error occurs Connect will pass it down
    // through these "error-handling" middleware
    // allowing you to respond however you like
    dslog.error(err);
    console.dir(err);
    if (err instanceof NotFound) {
      var error = {
        salvoStatusCode: 404,
        salvoStatusMessage: "Resource not found"
      };
      utils.sendResponseForAPI(error, req, res, null);
    } else {
      var error = {
        salvoStatusCode: 500,
        salvoStatusMessage: "An unexpected server error occurred"
      };
      utils.sendResponseForAPI(error, req, res, null);
    }
  });
  
  process.on("uncaughtException", function(err) {
    console.log(
      new Date() +
        "UNCAUGHT EXCEPTION **********************************************"
    );
    console.log(err);
    console.log(err.stack);
    dslog.error("Uncaught Exception");
    dslog.error(err);
    dslog.error(err.stack);
    
  });
  
  process.on("exit", function(code) {
    console.log("About to exit with code:", code);
    dslog.error("About to exit with code");
    dslog.error(code);
  });
  
// load routes


 require("./server/routes/routesConfigs").configureRoutes(app);

app.use(cors());



const PORT = process.env.PORT || 5000;

 app.listen(process.env.PORT || serverConfigs.runTimeConfig.dev.port, null);


dslog.info(
    "Running in " +
      process.env.NODE_ENV +
      " mode @ " +
      serverConfigs.runTimeConfig.dev.uri +
      ":" +
      serverConfigs.runTimeConfig.dev.port
  );
  console.log(
    "Running in " +
      process.env.NODE_ENV +
      " mode @ " +
      serverConfigs.runTimeConfig.dev.uri +
      ":" +
      serverConfigs.runTimeConfig.dev.port
  );
  