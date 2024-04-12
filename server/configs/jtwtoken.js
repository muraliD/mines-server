// const jwt = require("jsonwebtoken");
const jwt = require('njwt')
var serverConfigs = require("./serverConfigs");
const getJwtoken = (newUser) => {
    const token = jwt.create(newUser, serverConfigs.JWTKey)
    token.setExpiration(new Date().getTime() + 60 * 60000) // session for 1hr
    // token.setExpiration(new Date().getTime() + 10080 * 60000) // session for 7days
    return token.compact();
}

module.exports = { getJwtoken}