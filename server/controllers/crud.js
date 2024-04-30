/**********************************************************************************************************************************************
   * 1.Import required node modules , functionality and variables and  related files
**********************************************************************************************************************************************/
var _ = require("lodash");
// var ObjectID = require("mongodb").ObjectID;
const ObjectID = require('mongoose').Types.ObjectId;
var utils = require("../utils/utils");
const path = require('path');
// let theme = "scrapmanager/client/dist/scrapmanager";

exports.getindex = function(req, res) {
 // res.sendFile('./server/index.html');
  //res.sendFile('./client/index.html', { root: __dirname });
  // res.sendFile(path.resolve(__dirname, '..', theme, 'index.html'))
}
/**********************************************************************************************************************************************
   * 2 To get collection details 
**********************************************************************************************************************************************/

exports.getacollection = async function(req, res) {
  var COLLECTION = req.params.collection || "Defaults";
  //console.log(req);
  console.log(req.params.collection);
  const obj = require("../models/" + COLLECTION);


try{
  var result = await obj
  .find()
  .lean()
  .exec();
  utils.sendResponseForAPI(null, req, res, result);
}catch(err){
  utils.sendResponseForAPI(err, req, res, null);
}

  // obj
  //   .find()
  //   .lean()
  //   .exec(function(err, result) {
  //     if (err) {
  //       utils.sendResponseForAPI(err, req, res, null);
  //     } else {
      

  //       utils.sendResponseForAPI(null, req, res, result);
  //     }
  //   });
};
/**********************************************************************************************************************************************
   * 3 To create collection
**********************************************************************************************************************************************/

exports.createacollection = async function(req, res) {
  console.log(req.body);
  
  var objectid = req.body._id||req.body.id;
  // var isdelete = req.body.isdelete;
  var COLLECTION = req.body.collectionname;
  const obj = require("../models/" + COLLECTION);
  var data = req.body;
  if (objectid != null) {
    
    let query = {
      _id:  new ObjectID(data._id)
    };
    delete data._id;
    console.log("update  data...." + objectid);

    try{
      var data1 = await obj.updateOne(query, data);
      utils.sendResponseForAPI(null, req, res, data);
    }catch(err){
      var error = {
        amplifindStatusCode: 500,
        amplifindStatusMessage: err
      };
      utils.sendResponseForAPI(error, req, res, null);
    }


    // obj.updateOne(query, data, function (err) {
    //   //if (!err) console.log("Success!");
    //   if (err) {
    //     // create and send error
    //     var error = {
    //       amplifindStatusCode: 500,
    //       amplifindStatusMessage: err
    //     };
    //     utils.sendResponseForAPI(error, req, res, null);
    //   } else {
    //     utils.sendResponseForAPI(null, req, res, data);
    //   }
    // });



  } else {
    console.log("create  data....");


    try{

      var data1 = await obj.create(data);
      utils.sendResponseForAPI(null, req, res, data);
    }catch(err){
      var error = {
        amplifindStatusCode: 500,
        amplifindStatusMessage: err
      };
      utils.sendResponseForAPI(error, req, res, null);
    }

    // obj.create(data, function(err) {
    //   //if (!err) console.log("Success!");
    //   if (err) {
    //     // create and send error
    //     var error = {
    //       amplifindStatusCode: 500,
    //       amplifindStatusMessage: err
    //     };
    //     utils.sendResponseForAPI(error, req, res, null);
    //   } else {
    //     utils.sendResponseForAPI(null, req, res, data);
    //   }
    // });
  }
};

exports.createatest = async function(req, res) {
  console.log(req.body);
  const obj = require("../models/" + COLLECTION);

try{

  var data = await  obj.create(req.body);
  utils.sendResponseForAPI(null, req, res, data);
}catch(err){
  if (err) {
    // create and send error
    var error = {
      salvoStatusCode: 500,
      salvoStatusMessage: err
    };
    utils.sendResponseForAPI(error, req, res, null);
}

  // test.create(req.body, function(err, data) {
  //   //if (!err) console.log("Success!");
  //   if (err) {
  //     // create and send error
  //     var error = {
  //       salvoStatusCode: 500,
  //       salvoStatusMessage: err
  //     };
  //     utils.sendResponseForAPI(error, req, res, null);
  //   } else {
  //     utils.sendResponseForAPI(null, req, res, data);
  //   }
  // });
};

}
