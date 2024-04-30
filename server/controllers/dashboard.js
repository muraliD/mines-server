/**********************************************************************************************************************************************
   * Developer : Murali Dadi
**********************************************************************************************************************************************/
var utils = require("../utils/utils");
var dashboard = require("../models/dashboard");

const ObjectID = require('mongoose').Types.ObjectId;

exports.getdashboardData = async function (req, res) {
    var error = {
        code: 500,
        message: ""
    };

    try {

        var data = req.body;
        var queryObject = {};
      

        try{

            var result = await dashboard
            .find()
            .exec();
            utils.sendResponseForAPI(null, req, res, result);

        }catch(err){
            utils.sendResponseForAPI(err, req, res, null);
        }

     
    } catch (err) {
        error.message = "Enter Valid Data";
        utils.sendResponseForAPI(error, req, res, null);

    }


};
exports.updatedashboardData = async function (req, res) {
    var error = {
        code: 500,
        message: ""
    };
    try {

        var data = req.body;

        if("_id" in data){

        

       
        let query = {
            
            _id: new ObjectID(data._id)
        };
      

        try{

            delete data._id;

            var result  = await dashboard.updateOne(query, { $set: data });
            utils.sendResponseForAPI(null, req, res, result);

            // var result = await dashboard
            // .find()
            // .exec();
            utils.sendResponseForAPI(null, req, res, result);

        }catch(err){
            utils.sendResponseForAPI(err, req, res, null);
        }
    }else{
        error.message = "Enter Valid id";
        utils.sendResponseForAPI(error, req, res, null);
    }

     
    } catch (err) {
        try{
            error.message = "Enter Valid Data";
            utils.sendResponseForAPI({
                code: 500,
                message: ""
            }, req, res, null);

        }catch(err){
            utils.sendResponseForAPI({
                code: 500,
                message: ""
            }, req, res, null);

        }
       

    }


};

