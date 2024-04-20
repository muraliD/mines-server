
const mongoose = require('mongoose');
var serverConfigs = require("../configs/serverConfigs");
const connectDB = async () => {
  try {
    var credentials  = serverConfigs.dbConfig.dev.mongodb;

    var username  = credentials.username;
    var password  = (credentials.password).replace("@","%40");
    var dbname  = credentials.name;
    var host = (credentials.hosts)[0].replace("localhost","127.0.0.1");

   
   
    
    // var local = 'mongodb://localhost:27017/mydb'
    // var prod = ""
    console.log(local);
    var local = 'mongodb://'+username+':'+password+'@'+host+'/'+dbname+'?authMechanism=DEFAULT'
   

    // var local = 'mongodb://salvoadmin:Salvob%40kerAdmin027@127.0.0.1:27777/salvodb?authMechanism=DEFAULT'
    var prod =  'mongodb://admin:mines@13.232.30.108:27017/?authSource=mydb&authMechanism=DEFAULT'

   

    const conn = await mongoose.connect(prod, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected with host`+conn.connection.host);
  } catch (error) {
    console.error(error.message+"MongoDB Connected with host not connectedddddddd");
    process.exit(1);
  }
}


module.exports = connectDB;