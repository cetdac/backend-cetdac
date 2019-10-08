const connection = require("../services/module/connection")
schema = require('../services/module/schema')

connection.sync({force:true})