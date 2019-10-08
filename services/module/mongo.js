const Mongolass = require('mongolass')
const config = require('config')

const mongolass = new Mongolass(config.mongodb.connectionStringURI)

console.log('connected to ' + config.mongodb.name)

module.exports = mongolass