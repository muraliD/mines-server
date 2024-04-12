
const job = require('../models/jobs');
const ObjectID = require('mongoose').Types.ObjectId;
var website = require("../models/website");
const configs = require('../models/configs');
const archivejobs = require('../models/archivejobs');
//Jobs model Related Quaries

var jobData = async (filter,type,update,condition) => {
    var structureObj = { status: false }
    try {
        var result = {}
         if(type == "find"){
            result = await job
            .find(filter)
            .lean()
            .exec();
         }else if(type == "count"){
            result = await job
            .find(filter)
            .lean()
            .count()
            .exec()
         }else if(type == "create"){
            result = await  job.create(filter);
         }else if(type == "findupdate"){
           result =  await job.findOneAndUpdate({
            _id: new ObjectID(filter)
          }, update, condition);
         }else if(type == "delete"){
            result = await job.remove({
                _id: new ObjectID(filter)
              }).exec();
         }else if(type == "filterandfields"){
            result =  await job
            .find(filter, condition)
            .lean()
            .exec();
         }else if(type == "deleteMany"){
            result =  await job.deleteMany({
                _id: {
                    $in: filter
                }
            });
         }else if(type == "findandupdate"){
            result = await job.findOneAndUpdate({ _id: new ObjectID(filter) }, update)
         }else if(type == "findonebyStatus"){
            result = await job.findOne({
                _id: filter._id,
                status: filter.status
            })
         }
        
        structureObj.status = true
        structureObj.data = result
        return (structureObj);

    } catch (err) {
        structureObj.status = false
        structureObj.error = err
        return (structureObj);

    }


};

//Website model related quaries

var websitesData = async (filter,type) => {

    var structureObj = { status: false }

    try {
        var result = {}
        if(type == "find"){
         result = await website
            .find(filter)
            .sort({ displayOrder: -1 })
            .lean()
            .exec()
        }else if(type == "delete"){
            result = await website.remove({
                _id: new ObjectID(filter)
              }).exec();
         }
        structureObj.status = true
        structureObj.data = result
        return (structureObj);

    } catch (err) {
        structureObj.status = false
        structureObj.error = err
        return (structureObj);

    }


}
var configData = async (filter,type) => {

    var structureObj = { status: false }

    try {
        var result = {}
        if(type == "find"){
        
         result = await configs
            .find()
            .lean()
            .exec()
        }else if(type == "delete"){
            result = await configs.remove({
                _id: new ObjectID(filter)
              }).exec();
         }
        structureObj.status = true
        structureObj.data = result
        return (structureObj);

    } catch (err) {
        structureObj.status = false
        structureObj.error = err
        return (structureObj);

    }


}
var archiveData = async (filter,type) => {

    var structureObj = { status: false }

    try {
        var result = {}
        if(type == "insertMany"){
        
         result = await archivejobs.insertMany(filter)
        }
        structureObj.status = true
        structureObj.data = result
        return (structureObj);

    } catch (err) {
        structureObj.status = false
        structureObj.error = err
        return (structureObj);

    }


}

module.exports = { jobData, websitesData,archiveData,configData };