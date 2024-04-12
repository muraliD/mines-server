/**********************************************************************************************************************************************
   * 1.Import required node modules , functionality and variables and  related files
   * Create By :Murali Dadi(07.11.23)
**********************************************************************************************************************************************/
const mongoose = require("mongoose");
var bcrypt = require('bcryptjs');
var serverConfigs = require("../configs/serverConfigs");
/**********************************************************************************************************************************************
   * 2.Schema declaration 
**********************************************************************************************************************************************/
const Schema = mongoose.Schema;
let schema = new Schema({
   username: String,
   password: String,
   roleId: String,
   authtoken: String,
   status: Boolean
}, { timestamps: { createdAt: 'createdon', updatedAt: 'updatedon' }, strict: true });

const userModel = mongoose.model("users", schema);
run();
async function run() {

   const count = await userModel.estimatedDocumentCount();
   console.log(count);
   if (count <= 0) {

      var data = {}

      const salt = bcrypt.genSaltSync(serverConfigs.BCRYPTSALT);
      data["password"] = bcrypt.hashSync(serverConfigs.superAdminPwd, salt);;
      data["username"] = serverConfigs.superAdminUser
      data["status"] = true;
      data["roleId"] = "FGT0001"

      userModel.create(data)
         .then(result => {
            console.log("inserted default user record")
         })


   }

}
module.exports = userModel;