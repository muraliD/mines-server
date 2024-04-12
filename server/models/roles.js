const mongoose = require("mongoose");

/**********************************************************************************************************************************************
   * 2.Schema declaration 
**********************************************************************************************************************************************/

let schema = new mongoose.Schema({
    roleId: String,
    roleName: String,
}, { timestamps: { createdAt: 'createdon', updatedAt: 'updatedon' }, strict: true });


var rolesModel = mongoose.model("roles", schema, "roles");


run();
async function run() {

    const count = await rolesModel.estimatedDocumentCount();
    console.log(count);
    if (count <= 0) {

        var data = [{
            "roleName": "Admin",
            "roleId": "FGT0002"
        }, {

            "roleName": "Super Admin",
            "roleId": "FGT0001"
        }, {

            "roleName": "User",
            "roleId": "FGT0003"
        }, {

            "roleName": "SalvoUser",
            "roleId": "FGT0004"
        }]


        try {
            const count = await rolesModel.insertMany(data);

        } catch (err) {

            console.log("not inserted properly")

        }






    }

}


module.exports = rolesModel;