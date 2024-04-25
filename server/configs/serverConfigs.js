/**********************************************************************************************************************************************
 * 1.Import required node modules , functionality and variables and  related files
 **********************************************************************************************************************************************/
"use strict";

var path = require("path");


module.exports = {

  JWTKey: "MinesJwt",
  BCRYPTSALT: 10,
  superAdminUser: "super_admin",
  superAdminPwd: "super@dm!n@22",
  sessionSecret: "logistics",
  salvoSecret: "mines",
  sessionSecret: "mines",
  fromEmailAddress: "",
  appurl: "",
  graphEmail:{
    config:{
      'grant_type': 'client_credentials',
      'client_id': '123',
      'client_secret': '345',
      'scope': 'https://graph.microsoft.com/.default',
  },
  accessTokenUrl:"https://login.microsoftonline.com/7ca7eb7e-b5cb-47bb-aea5-a64907214952/oauth2/v2.0/token",
  emailDataUrl:"https://graph.microsoft.com/v1.0/users/murali@mines.com/messages?$messages?$orderby=sentDateTime&$top=5"


  },
  graphEmailTimerConfig:{
    "1000000008":{
      timeInterval:30000,
      countOfIntervals:5
    } ,
    "1000000018":{
      timeInterval:30000,
      countOfIntervals:5
    } ,
    "1000000012":{
      timeInterval:30000,
      countOfIntervals:5
    } ,
    "1000000013":{
      timeInterval:30000,
      countOfIntervals:5
    } 
  },
 
  logAppenders: {
    appenders: [{
      category: "common",
      type: "file",
      filename: "ds-common.log",
      maxLogSize: 102400,
      backups: 30,
      pollInterval: 15
    }],
    levels: {
      common: "DEBUG"
    }
  },
  archiveEvery: 7,
  lineItemAttachments: [

  ],
  noSubmissionJobs: [],
  errorTypes: [
    'Login Failed',
    'Client Not Found',
    'Invoice Not Found',
    'Acuity website not loaded',
    'Selector Not Found',
    'Website Not Working',
    'JSON Not Found',
    'Submit Failed',
    'Select Valid Law Firm',
    'Select Valid Claimant',
    'Law firm Not Found',
    'Failed To Fetch Data',
    'Warning On Submit',
    'Error On Submit',
    'File Path Not Found',
    'Invalid JSON File',
    'Submission Failed',
    '2FA Screen displayed',
    'Password Reset Page Displayed',
    'Json file Not Found',
    'Invoice Locked',
    'Matter Number Not Found',
    'Location Not Found',
    'Start Date Not Found',
    'End Date Not Found',
    'Hard Copy Invoice Not Found',
    'Submitted Invoice Not Found',
    'Submit Failed Retry',
    'Ledes File Not Found',
    'Attachement Not Found'
  ],
  baseDir: "/",
  noStatusJobs: ["1000000040"],
  runJobsInServer: {
    production: 32,
    demo: 32,
    test: 32,
    dev: 50
  },
  runTimeConfig: {
    production: {
      uri: "https://salvo.com",
      port: 3000,
      baseDir: "",
      logFilePath: "./logs/"
    },
    demo: {
      uri: "http://demo.salvo.com",
      port: 3000,
      baseDir: "/var/salvo/app/salvo",
      logFilePath: "/var/salvo/app/salvo/logs/"
    },
    test: {
      uri: "http://localhost:80",
      port: 8000,
      baseDir: "",
      logFilePath: "./logs/"
    },
    dev: {
      uri: "http://localhost",
      port: 8000,
      httpsport:443,
      baseDir: path.join(__dirname, "../../"),
      logFilePath: "./logs/"
    }
  },
  sessionConfig: {
    production: {
      ttl: 14 * 24 * 60 * 60, // = 14 days. Default
      touchAfter: 24 * 3600 // time period in seconds
    },
    demo: {
      ttl: 14 * 24 * 60 * 60, // = 14 days. Default
      touchAfter: 24 * 3600 // time period in seconds
    },
    test: {
      ttl: 14 * 24 * 60 * 60, // = 14 days. Default
      touchAfter: 24 * 3600 // time period in seconds
    },
    dev: {
      ttl: 14 * 24 * 60 * 60, // = 14 days. Default
      touchAfter: 24 * 3600 // time period in seconds
    }
  },
  dbConfig: {
    production: {
      host: "mongodb://localhost:27017/salvo",
      dbOptions: {
        native_parser: true
      },
      serverOptions: {
        auto_reconnect: true,
        poolSize: 5
      }
    },
    demo: {
      host: "mongodb://localhost:27017/salvo",
      dbOptions: {
        native_parser: true
      },
      serverOptions: {
        auto_reconnect: true,
        poolSize: 5
      }
    },
    test: {
      host: "mongodb://localhost:27017/salvodev",
      dbOptions: {
        native_parser: true
      },
      mongodb: {
        hosts: ["localhost:27017"],
        name: "salvodev",
        migrations: {
          directory: "migrations",
          collection: "history"
        }
      },
      serverOptions: {
        auto_reconnect: true,
        poolSize: 5
      }
    },


    dev: {
      host: "mongodb://localhost:27017/minesdev",
      dbOptions: {
        native_parser: true
      },
      mongodb: {
        hosts: ["localhost:27017"],
        //  hosts: ["34.210.115.91:27495"],
        name: "mydb",
        username: "mines",
        password: "mines@1234",
        //  port: 27495,
        //  poolSize: 5,
        migrations: {
          directory: "migrations",
          collection: "history"
        }
      },

      serverOptions: {
        auto_reconnect: true,
        poolSize: 5
      }
    }
  },
  ieVendors: [],
  noMultipleRunningVendorsStatus: [{
    eBillVendorCode: "1000000006",
    eBillVendor: "Collaborati"
  }
  ],
  noMultipleRunningVendorsSubmission: [{
    eBillVendorCode: "1000000006",
    eBillVendor: "Collaborati"
  }
  ]

};