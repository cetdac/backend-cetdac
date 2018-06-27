const connection = require("../services/db/connection")
schema = require('../services/db/schema')

connection.sync({force:true})