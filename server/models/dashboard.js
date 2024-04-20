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
    banners: Object,
    title1: Object,
    title2: Object,
    productinfo: Object,
    title3: Object,
    locations: Object,
    title4: Object,
    partnerImages: Object,
    status: Boolean
}, { timestamps: { createdAt: 'createdon', updatedAt: 'updatedon' }, strict: true });

const dashboardModel = mongoose.model("dashboard", schema);
run();
async function run() {

   const count = await dashboardModel.estimatedDocumentCount();
   console.log(count);
   if (count <= 0) {

      var data = {}

      data["banners"] = [];
      data["title1"] = {}
      data["title2"] = true;
      data["productinfo"] = {"bannerimage":"","products":[]}
      data["title3"] = {}
      data["locations"] = {}
      data["partnerImages"] = {"bannerimage":"","products":[]}
      data["status"] = true

      dashboardModel.create(data)
         .then(result => {
            console.log("inserted default user record")
         })


   }

}
module.exports = dashboardModel;




