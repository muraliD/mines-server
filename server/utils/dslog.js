/**********************************************************************************************************************************************
   * 1.Import required node modules , functionality and variables and  related files
**********************************************************************************************************************************************/
var serverConfigs = require('../configs/serverConfigs')
var log4js = require('log4js');
 var logAppenders = serverConfigs.logAppenders;
if (global.env) {
    var logFilePath = serverConfigs.runTimeConfig[global.env].logFilePath;
} else { // default to dev
    var logFilePath = serverConfigs.runTimeConfig['dev'].logFilePath;
}

logAppenders.appenders.forEach(function(k,i) {
    if (k.filename) {
        k.filename = logFilePath + k.filename;
    }
}); 

log4js.configure(
    logAppenders
);
function logger(req) {
    return log4js.getLogger('common');
}
function getSiteLogger(siteName) {
    return log4js.getLogger(siteName);
}
/**********************************************************************************************************************************************
   * 2.Get Logger , Get Site Logger,Trace,Debug,Info,warn,error and fatal
**********************************************************************************************************************************************/

module.exports = {
    'getLogger' : function (req) {
        return logger(req);
    },
    'getSiteLogger' : function (siteName) {
        return getSiteLogger(siteName);
    },
    'trace':function(req,message){
        if (arguments.length >1) {
            logger(req).trace(message);
        } else {
            logger().trace(req);
        }
    },
    'debug':function(req,message){
        if (arguments.length >1) {
            logger(req).debug(message);
        } else {
            logger().debug(req);
        }
    },
    'info':function(req,message){
        if (arguments.length >1) {
            logger(req).info(message);
        } else {
            logger().info(req);
        }
    },
    'warn':function(req,message){
        if (arguments.length >1) {
            logger(req).warn(message);
        } else {
            logger().warn(req);
        }
    },
    'error':function(req,message){
        if (arguments.length >1) {
            logger(req).error(message);
        } else {
            logger().error(req);
        }
    },
    'fatal':function(req,message){
        if (arguments.length >1) {
            logger(req).fatal(message);
        } else {
            logger().fatal(req);
        }
    }
};
