// sample ś
/*ś
 routeName: 'home', name of the route
 routśeUrl: '/', parameterized URL
 routeMethod: 'get', method
 routeController: 'index',  server side controller file for the route
 routeHandler: null, // handler function in the controller, if null , method is the function name
 accessTo: '*', // array of user types that have access to this route
 isSecured: false, // is it a public route or secured
 isArray: false, // is the returned data in an array , needed for angular resource
 cache : false, // should it be cached in the client, needed for angular resource
 data : null, // format of the data for POST and PUT (needed for angular resource. the key for the posted data should be the same as routeName
 param : {} // parameters in the URL e.g. {registrationKey: '@registrationKey'} refer to angular resource API for more about this
 constraints : {} //  data constraints for validation retrieved from the constraints configs for each route
 */
 var _ = require("lodash");
 var constraints = require("../configs/constraints");
 
 module.exports = {
   routesList: [
     {
       routeName: "getacollection",
       routeUrl: "/api/search/:collection",
       routeMethod: "get",
       routeController: "crud",
       routeHandler: "getacollection",
       accessTo: "*",
       isSecured: false,
       isArray: false,
       cache: false,
       data: null,
       params: {},
       constraints: constraints["home"]
     },
 
     {
       routeName: "createacollection",
       routeUrl: "/api/create",
       routeMethod: "post",
       routeController: "crud",
       routeHandler: "createacollection",
       accessTo: "*",
       isSecured: true,
       isArray: false,
       cache: false,
       data: { data: "@data" },
       params: {},
       constraints: constraints["home"]
     },
 
    
     {
       routeName: "getindex",
       routeUrl: "/",
       routeMethod: "get",
       routeController: "crud",
       routeHandler: "getindex",
       accessTo: "*",
       isSecured: false,
       isArray: false,
       cache: false,
       data: null,
       params: {},
       constraints: constraints["home"]
     },
     {
      routeName: "createMedia",
      routeUrl: "/api/createMedia",
      routeMethod: "post",
      routeController: "media",
      routeHandler: "createMedia",
      accessTo: "*",
      isSecured: true,
      isArray: false,
      cache: false,
      data: { data: "@data" },
      params: {},
      constraints: constraints["home"]
    },
     
     {
       routeName: "users",
       routeUrl: "/api/users",
       routeMethod: "post",
       routeController: "users",
       routeHandler: "users",
       accessTo: "*",
       isSecured: false,
       isArray: false,
       cache: false,
       data: null,
       params: {},
       constraints: constraints["home"]
     },
     {
       routeName: "createUser",
       routeUrl: "/api/createUser",
       routeMethod: "post",
       routeController: "users",
       routeHandler: "createUser",
       accessTo: "*",
       isSecured: true,
       isArray: false,
       cache: false,
       data: { data: "@data" },
       params: {},
       constraints: constraints["home"]
     },
      {
       routeName: "deleteOrDeactiveUser",
       routeUrl: "/api/deleteOrDeactiveUser",
       routeMethod: "post",
       routeController: "users",
       routeHandler: "deleteOrDeactiveUser",
       accessTo: "*",
       isSecured: true,
       isArray: false,
       cache: false,
       data: { data: "@data" },
       params: {},
       constraints: constraints["home"]
     },
     {
       routeName: "users",
       routeUrl: "/api/users",
       routeMethod: "post",
       routeController: "users",
       routeHandler: "users",
       accessTo: "*",
       isSecured: false,
       isArray: false,
       cache: false,
       data: null,
       params: {},
       constraints: constraints["home"]
     },
     {
      routeName: "updateUser",
      routeUrl: "/api/updateUser",
      routeMethod: "post",
      routeController: "users",
      routeHandler: "updateUser",
      accessTo: "*",
      isSecured: true,
      isArray: false,
      cache: false,
      data: { data: "@data" },
      params: {},
      constraints: constraints["home"]
    },
     {
       routeName: "loginUser",
       routeUrl: "/api/loginUser",
       routeMethod: "post",
       routeController: "users",
       routeHandler: "loginUser",
       accessTo: "*",
       isSecured: false,
       isArray: false,
       cache: false,
       data: null,
       params: {},
       constraints: constraints["home"]
     },
     {
      routeName: "addRole",
      routeUrl: "/api/addRole",
      routeMethod: "post",
      routeController: "users",
      routeHandler: "addRole",
      accessTo: "*",
      isSecured: false,
      isArray: false,
      cache: false,
      data: null,
      params: {},
      constraints: constraints["home"]
    },
     {
       routeName: "getroles",
       routeUrl: "/api/getroles",
       routeMethod: "get",
       routeController: "users",
       routeHandler: "getroles",
       accessTo: "*",
       isSecured: false,
       isArray: false,
       cache: false,
       data: null,
       params: {},
       constraints: constraints["home"]
     },
     {
       routeName: "updateRole",
       routeUrl: "/api/updateRole",
       routeMethod: "post",
       routeController: "users",
       routeHandler: "updateRole",
       accessTo: "*",
       isSecured: false,
       isArray: false,
       cache: false,
       data: null,
       params: {},
       constraints: constraints["home"]
     }
    
 
   ],
 
   getResources: function () {
     var resourceDict = {};
     _.each(module.exports.routesList, function (route) {
       var constraints = {};
       constraints[route.routeName] = route.constraints;
       resourceDict[route.routeName] = {
         url: route.routeUrl,
         method: route.routeMethod.toUpperCase(),
         isArray: route.isArray,
         cache: route.cache,
         data: route.data,
         params: route.params,
         constraints: constraints
       };
     });
     return resourceDict;
   }
 };
 