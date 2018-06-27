const Sequelize = require("sequelize")
let host = process.env.DB_ENV === "api-dev" ? "47.52.206.244" : "47.52.206.244",
    logging = process.env.NODE_ENV === "api-dev" ? console.log : false,
    port = process.env.DB_ENV === "production" ? 3306 : 33066

var connection = new Sequelize("approles", "approles_admin", "R@NzDu0#uy0m", 
{
    host: host,
    port: port,
    operatorsAliases: false,
    timestamps: false,
    dialect: "mysql",
    logging: logging
});

//测试环境
//var connection = new Sequelize("yiqituyadb", "root", "Siemenlon123", {host: "58.96.185.53", port: 3306,timestamps: false});

module.exports = connection;