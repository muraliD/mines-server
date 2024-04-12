/**********************************************************************************************************************************************
   * Developer : Murali Dadi
**********************************************************************************************************************************************/
var utils = require("../utils/utils");
var users = require("../models/users");
var roles = require("../models/roles");
const ObjectID = require('mongoose').Types.ObjectId;
var bcrypt = require('bcryptjs');
var serverConfigs = require("../configs/serverConfigs");
// const { ObjectId } = require('mongodb');
var jwtConfig = require("../configs/jtwtoken");
exports.users = async function (req, res) {

    try {

        var data = req.body;
        var queryObject = {};
        if ('status' in data) {
            queryObject["status"] = data["status"]
        }
        var condition = {
            $query: queryObject,
            $orderby: { displayOrder: -1 }
        };

        try{

            var result = await users
            .find(queryObject, { password: 0 })
            .sort({displayOrder:-1})
            .lean()
            .exec();
            utils.sendResponseForAPI(null, req, res, result);

        }catch(err){
            utils.sendResponseForAPI(err, req, res, null);
        }

        
        // users
        //     .find(queryObject, { password: 0 })
        //     .sort({displayOrder:-1})
        //     .lean()
        //     .exec(function (err, result) {
        //         if (err) {
        //             utils.sendResponseForAPI(err, req, res, null);
        //         } else {
        //             utils.sendResponseForAPI(null, req, res, result);
        //         }
        //     });

    } catch (err) {
        error.message = "Enter Valid Data";
        utils.sendResponseForAPI(error, req, res, null);

    }


};
exports.updateUser = async function (req, res) {
    try {

        var data = req.body
        var objectid = data._id || data.id;
        var type = data.reqType || ""
        var error = {
            code: 500,
            message: ""
        };
        let query = {
            
            _id: new ObjectID(data._id)
        };
        let postdata = {
            status: data["status"],
            roleId: data["roleId"]
        };

        delete data._id;

        try{

            
            var result  = await users.updateOne(query, { $set: postdata });
            utils.sendResponseForAPI(null, req, res, result);
        }catch(err){
            var error = {
                StatusCode: 500,
               StatusMessage: err
            };
            utils.sendResponseForAPI(error, req, res, null);
        }

        // users.update(query, { $set: postdata }, function (err) {
        //     console.log(data);
        //     if (err) {
        //         // create and send error
        //         var error = {
        //             amplifindStatusCode: 500,
        //             amplifindStatusMessage: err
        //         };
        //         utils.sendResponseForAPI(error, req, res, null);
        //     } else {
        //         utils.sendResponseForAPI(null, req, res, data);
        //     }
        // });

    } catch (err) {
        error.message = "Enter Valid Data";
        utils.sendResponseForAPI(error, req, res, null);

    }

}
exports.deleteOrDeactiveUser = async function (req, res) {
    try {

        var data = req.body
        var objectid = data._id || data.id;
        var type = data.reqType || ""
        var error = {
            code: 500,
            message: ""
        };
        let query = {
            _id: new ObjectID(data._id)
        };

        delete data._id;


        if (type == "delete") {
            delete data.type;

            try{
                var data =  await users.deleteOne(query);
                utils.sendResponseForAPI(null, req, res, data);
            }catch(err){
                var error = {
                    amplifindStatusCode: 500,
                    amplifindStatusMessage: err
                };
                utils.sendResponseForAPI(error, req, res, null);
            }
            // users.deleteOne(query, function (err) {
            //     if (err) {

            //         var error = {
            //             amplifindStatusCode: 500,
            //             amplifindStatusMessage: err
            //         };
            //         utils.sendResponseForAPI(error, req, res, null);
            //     } else {
            //         utils.sendResponseForAPI(null, req, res, data);
            //     }
            // });


        } else if (type == "status") {


            try{
                var data =  users.updateOne(query, { $set: { "status": data.status } })
                utils.sendResponseForAPI(null, req, res, data);
            }catch(err){
                var error = {
                    amplifindStatusCode: 500,
                    amplifindStatusMessage: err
                };
                utils.sendResponseForAPI(error, req, res, null);
            }

            // users.update(query, { $set: { "status": data.status } }, function (err) {

            //     if (err) {
            //         // create and send error
            //         var error = {
            //             amplifindStatusCode: 500,
            //             amplifindStatusMessage: err
            //         };
            //         utils.sendResponseForAPI(error, req, res, null);
            //     } else {
            //         utils.sendResponseForAPI(null, req, res, data);
            //     }
            // });


        }

    } catch (err) {
        error.message = "Enter Valid Data";
        utils.sendResponseForAPI(error, req, res, null);

    }

}
exports.createUser = async function (req, res) {

    console.log(req.body);
    var data = req.body;
   
    try {
        
        var error = {
            code: 500,
            message: ""
        };
        if (data["username"].length > 0 && data["password"].length > 0) {



try{
    console.log("username");
    console.log(data["username"]);
    var result = await users.findOne( {
        "username": data["username"],
    })
       .sort({displayOrder:-1})
        .lean()
        .exec();

        console.log(result);

        if(result){
            
            error.message = "Username Already Exist";
            utils.sendResponseForAPI(error, req, res, null);

        }else{
            console.log("******************************56666")
            bcrypt.genSalt(serverConfigs.BCRYPTSALT, function (err, salt) {
                if (err) {
                    error.message = err.message;
                    utils.sendResponseForAPI(error, req, res, null);
                } else {
                    console.log("******************************2222")
                    bcrypt.hash(data["password"], salt, async function (err, hash) {
                        if (err) {
                            error.message = err.message;
                            utils.sendResponseForAPI(error, req, res, null);
                        } else {
                            var data = req.body
                            console.log(req.body)
                            console.log("******************************333")
                            data["password"] = hash;

                            data["status"] = true;
                            console.log("******************************65677")
                            if ('roleId' in data) {
                                if (data["roleId"].length <= 0) {
                                    data["roleId"] = "FGT0003"
                                }
                            } else {
                                data["roleId"] = data["roleId"]

                            }

                            try{

                                console.log("******************************11111")

                                var data = await  users.create(data);
                                delete data.password
                                utils.sendResponseForAPI(null, req, res, data);

                            }catch(err){
                                error.message = err.message;
                                utils.sendResponseForAPI(error, req, res, null);
                            }

                            // users.create(data, function (err) {
                            //     if (err) {
                            //         error.message = err.message;
                            //         utils.sendResponseForAPI(error, req, res, null);
                            //     } else {
                            //         delete data.password
                            //         utils.sendResponseForAPI(null, req, res, data);
                            //     }
                            // });
                        }
                    })
                }
            })

        }

}catch(err){
    error.message = err.message;
    utils.sendResponseForAPI(error, req, res, null);

}


          
            // users.findOne( {
            //     "username": data["username"],
            // })
            //    .sort({displayOrder:-1})
            //     .lean()
            //     .exec(function (err, result) {

            //         if (err) {
            //             error.message = err.message;
            //             utils.sendResponseForAPI(error, req, res, null);

            //         } else {
            //             if (result) {

            //                 error.message = "Username Already Exist";
            //                 utils.sendResponseForAPI(error, req, res, null);

            //             } else {
            //                 bcrypt.genSalt(serverConfigs.BCRYPTSALT, function (err, salt) {
            //                     if (err) {
            //                         error.message = err.message;
            //                         utils.sendResponseForAPI(error, req, res, null);
            //                     } else {

            //                         bcrypt.hash(data["password"], salt, function (err, hash) {
            //                             if (err) {
            //                                 error.message = err.message;
            //                                 utils.sendResponseForAPI(error, req, res, null);
            //                             } else {

            //                                 data["password"] = hash;

            //                                 data["status"] = true;

            //                                 if ('roleId' in data) {
            //                                     if (data["roleId"].length <= 0) {
            //                                         data["roleId"] = "FGT0003"
            //                                     }
            //                                 } else {
            //                                     data["roleId"] = data["roleId"]

            //                                 }

            //                                 users.create(data, function (err) {
            //                                     if (err) {
            //                                         error.message = err.message;
            //                                         utils.sendResponseForAPI(error, req, res, null);
            //                                     } else {
            //                                         delete data.password
            //                                         utils.sendResponseForAPI(null, req, res, data);
            //                                     }
            //                                 });
            //                             }
            //                         })
            //                     }
            //                 })


            //             }



            //         }



            //     })

        } else {
            error.message = "Invalid Data"
            utils.sendResponseForAPI(error, req, res, null);
        }
    } catch (err) {
        error.message = "Enter Valid Data";
        utils.sendResponseForAPI(error, req, res, null);

    }

};
exports.loginUser = async function (req, res) {

    var data = req.body;
    var error = {
        code: 500,
        message: ""
    };
    try {
        if (data["username"].length > 0 && data["password"].length > 0) {

            // var condition = {
            //     $query: {
            //         "username": data["username"],
            //     },
            //     $orderby: { displayOrder: -1 }

            // };



            try{
                var user = await users.findOne( {
                    "username": data["username"],
                }) .sort({displayOrder:-1})
                .lean()
                .exec()

                if(user){

                    bcrypt.compare(data["password"], user.password, async function (err, isMatch) {

                        if (err) {
                            error.message = err.message;
                            utils.sendResponseForAPI(error, req, res, null);
                        } else if (!isMatch) {
                            error.message = "Password Mismatched";
                            utils.sendResponseForAPI(error, req, res, null)
                        } else {
                            const token = jwtConfig.getJwtoken(user)




                            try{

                                var role =  await roles.findOne({
                                   
                                        "roleId": user["roleId"],
                                    
                                })
                                    .lean()
                                    .exec();

                                    delete user.password;
                                        var data = {
                                            user: user,
                                            role: role,
                                            AuthToken: token
                                        }
                                        utils.sendResponseForAPI(null, req, res, data);

                            }catch(err){
                                error.message = "Role Not Assigned";
                                utils.sendResponseForAPI(error, req, res, null)
                            }



                            // roles.findOne({
                            //     $query: {
                            //         "roleId": user["roleId"],
                            //     }
                            // })
                            //     .lean()
                            //     .exec(function (err, role) {
                            //         if (err) {
                            //             error.message = "Role Not Assigned";
                            //             utils.sendResponseForAPI(error, req, res, null)
                            //         } else {
                            //             delete user.password;
                            //             var data = {
                            //                 user: user,
                            //                 role: role,
                            //                 AuthToken: token
                            //             }
                            //             utils.sendResponseForAPI(null, req, res, data);

                            //         }
                            //     });

                        }

                    });

                }else{
                    error.message = "Enter Valid Username";
                    utils.sendResponseForAPI(error, req, res, null);
                }

            }catch(err){
                error.message = err.message;
                utils.sendResponseForAPI(error, req, res, null);
            }


            // users.findOne(condition)
            // .sort({displayOrder:-1})
            //     .lean()
            //     .exec(function (err, user) {
            //         if (err) {
            //             error.message = err.message;
            //             utils.sendResponseForAPI(error, req, res, null);
            //         } else {
            //             if (user) {
            //                 bcrypt.compare(data["password"], user.password, function (err, isMatch) {

            //                     if (err) {
            //                         error.message = err.message;
            //                         utils.sendResponseForAPI(error, req, res, null);
            //                     } else if (!isMatch) {
            //                         error.message = "Password Mismatched";
            //                         utils.sendResponseForAPI(error, req, res, null)
            //                     } else {
            //                         const token = jwtConfig.getJwtoken(user)
            //                         roles.findOne({
            //                             $query: {
            //                                 "roleId": user["roleId"],
            //                             }
            //                         })
            //                             .lean()
            //                             .exec(function (err, role) {
            //                                 if (err) {
            //                                     error.message = "Role Not Assigned";
            //                                     utils.sendResponseForAPI(error, req, res, null)
            //                                 } else {
            //                                     delete user.password;
            //                                     var data = {
            //                                         user: user,
            //                                         role: role,
            //                                         AuthToken: token
            //                                     }
            //                                     utils.sendResponseForAPI(null, req, res, data);

            //                                 }
            //                             });

            //                     }

            //                 });
            //             } else {
            //                 error.message = "Enter Valid Username";
            //                 utils.sendResponseForAPI(error, req, res, null);

            //             }

            //         }


            //     });


        }

    } catch (err) {
        error.message = "Enter Required Fields";
        utils.sendResponseForAPI(error, req, res, null);

    }

}
exports.getroles = async function (req, res) {
    try {
       var result = await  roles
            .find()
            .lean()
            .exec() 
            utils.sendResponseForAPI(null, req, res, result);
    } catch (err) {
        error.message = "Enter Valid Data";
        utils.sendResponseForAPI(error, req, res, null);

    }

}
exports.updateRole = function (req, res) {
    try {
        var error = {
            code: 500,
            message: ""
        };

        var data = req.body
        var objectid = data.userId;
        var type = data.reqType || ""
        var error = {
            code: 500,
            message: ""
        };
        let query = {
            _id: new ObjectID(data.userId)
        };

        delete data.userId;

        roles
            .find()
            .lean()
            .exec(function (err, result) {
                if (err) {
                    error.message = err.message;
                    utils.sendResponseForAPI(error, req, res, null);

                } else {

                    if (result) {

                        if (result.some(role => role.roleId === data.roleId)) {
                            users.update(query, { $set: { "roleId": data.roleId } }, function (err) {

                                if (err) {
                                    // create and send error
                                    error.message = "role updation failed";
                                    utils.sendResponseForAPI(error, req, res, null);
                                } else {
                                    utils.sendResponseForAPI(null, req, res, data);
                                }
                            });
                        } else {
                            error.message = "Enter Valid  Role";
                            utils.sendResponseForAPI(error, req, res, null);
                        }


                    } else {
                        error.message = "No Roles Found";
                        utils.sendResponseForAPI(error, req, res, null);

                    }



                }
            });

    } catch (err) {
        error.message = "Enter Valid Data";
        utils.sendResponseForAPI(error, req, res, null);
    }





}
exports.addRole = async function (req, res) {
    try {
        var error = {
            code: 500,
            message: ""
        };

        var data = req.body
        
        var error = {
            code: 500,
            message: ""
        };
        
try{
    var datas = await roles.insertMany(data);
    delete data.password
    utils.sendResponseForAPI(null, req, res, data);

}catch(err){
    error.message = err.message;
    utils.sendResponseForAPI(error, req, res, null);
}
       
        // roles.insertMany(data, function (err) {
        //     if (err) {
        //         error.message = err.message;
        //         utils.sendResponseForAPI(error, req, res, null);
        //     } else {
        //         delete data.password
        //         utils.sendResponseForAPI(null, req, res, data);
        //     }
        // });

       

    } catch (err) {
        error.message = "Enter Valid Data";
        utils.sendResponseForAPI(error, req, res, null);
    }





}
