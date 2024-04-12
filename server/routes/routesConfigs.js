/**********************************************************************************************************************************************
   * 1.Import required node modules , functionality and variables and  related files
**********************************************************************************************************************************************/
// This file will have all the routes configured for this app
var routesList = require("./routesList").routesList;
var _ = require("lodash");
var utils = require("../utils/utils");
var validate = require("validate.js");
// const UserToken = require("../models/UserToken");
//const jwt = require("jsonwebtoken");
const promisify = require("es6-promisify");
const serverConfigs = require("../configs/serverConfigs");
const secret = serverConfigs.salvoSecret; //config.get("jwt.secret");

module.exports = {
  configureRoutes: function (app) {
    var authenticateRoute = function (isSecured) {
      return function (req, res, next) {
        if (isSecured === false) {
          next();
        } else if (
          isSecured === true
          //  &&  req.session.globals.loggedIn === true
        ) {
         // isAuthenticated(req, res, next);
          next();
        } else {
          var error = {
            salvoStatusCode: 401,
            salvoStatusMessage: "Not authorized"
          };
          utils.sendResponseForAPI(error, req, res, null);
        }
      };
    };

    var checkPermissions = function (accessTo) {
      return function (req, res, next) {
        var allowed = false;
        if (accessTo == "*") {
          next();
        } else {
          _.each(accessTo, function (customerType) {
            if (
              _.indexOf(
                req.session.globals.customer.customerType,
                customerType
              ) != -1
            ) {
              allowed = true;
            }
          });
          if (allowed) {
            next();
          } else {
            var error = {
              salvoStatusCode: 401,
              salvoStatusMessage: "Not authorized"
            };
            utils.sendResponseForAPI(error, req, res, null);
          }
        }
      };
    };
    // use routeName as the object key for data posted in the body for POST and PUT
    var checkConstraints = function (route) {
      return function (req, res, next) {
        var constraints = route.constraints;
        var routeName = route.routeName;
        
        var objToValidate;        
        switch (req.method) {
          case "GET":
          case "DELETE":
            objToValidate = req.params;
            break;
          case "POST":
            objToValidate = req.body;
            break;
          case "PUT":
            objToValidate = req.body[routeName];
            break;
        }        
        var msg = [];     
        if (objToValidate) {
          if (constraints) {
            _.each(constraints, function (value, key) {
              console.log("key = " + key);
              console.log("value = " + value);
              if (objToValidate[key]) {
                var valueObj = {};
                valueObj[key] = objToValidate[key];
                var validateObj = {};
                validateObj[key] = value;
                console.log("valueObj");
                console.dir(validateObj);
                console.log("validateObj");
                console.dir(validateObj);
                var validateMsg = validate(valueObj, validateObj);
                if (validateMsg) msg.push(validateMsg);
              } else {
                msg.push(key + " not found");
              }
            });
          } else {
            msg.push("constraints object not found in route configs");
          }
        } else {
          msg.push("data object not present");
        }

        if (msg.length == 0) {
          next();
        } else {
          var error = {
            salvoStatusCode: 400,
            salvoStatusMessage: JSON.stringify(msg)
          };
          utils.sendResponseForAPI(error, req, res, null);
        }
      };
    };

    console.log("configuring routes");
    _.each(routesList, function (route) {
      var handler = require("../controllers/" + route.routeController);
      var routeHandler;
      route.routeHandler
        ? (routeHandler = route.routeHandler)
        : (routeHandler = route.routeMethod);
    
      switch (route.routeMethod) {
   
        case "get":
          app.get(
            route.routeUrl,
            authenticateRoute(route.isSecured),
            checkPermissions(route.accessTo),
            checkConstraints(route),
            handler[routeHandler]
          );
          break;
        case "post":
          app.post(
            route.routeUrl,
            authenticateRoute(route.isSecured),
            checkPermissions(route.accessTo),
            checkConstraints(route),
            handler[routeHandler]
          );
          break;
        case "put":
          app.put(
            route.routeUrl,
            authenticateRoute(route.isSecured),
            checkPermissions(route.accessTo),
            handler[routeHandler]
          );
          break;
        case "delete":
          app.delete(
            route.routeUrl,
            authenticateRoute(route.isSecured),
            checkPermissions(route.accessTo),
            handler[routeHandler]
          );
          break;
      }
    });
  }
};


function validate(token) {
  let jwtVerify = promisify(jwt.verify);
  return jwtVerify(token, secret).then(
    claims => {
      console.log("claims:" + claims);
      return Promise.resolve(claims);
    },
    () => {
      return Promise.reject("accessToken has expired");
    }
  );
}
