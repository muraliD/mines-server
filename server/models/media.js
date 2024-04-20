/**********************************************************************************************************************************************
   * 1.Import required node modules , functionality and variables and  related files
   * Create By :Murali Dadi(07.11.23)
**********************************************************************************************************************************************/
const mongoose = require("mongoose");

/**********************************************************************************************************************************************
   * 2.Schema declaration 
**********************************************************************************************************************************************/
const Schema = mongoose.Schema;
let schema = new Schema({
   filepath: String,
   name: String,
   fileid: String,
   status: Boolean
}, { timestamps: { createdAt: 'createdon', updatedAt: 'updatedon' }, strict: true });

const mediaModel = mongoose.model("media", schema);

module.exports = mediaModel;