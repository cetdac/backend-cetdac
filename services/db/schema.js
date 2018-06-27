const Sequelize = require("sequelize"),
  connection = require("../db/connection")

const _Promise = connection.define("_Promise", {
    id: {
      primaryKey: true,
      type:Sequelize.STRING(64), 
      allowNull:false,
      unique:true
    },
    psid_a:{
      type: Sequelize.STRING(45),
      allowNull: false
    },
    psid_b:{
      type: Sequelize.STRING(45),
      allowNull: true
    },
    parta: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    partb: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    paymentId:{
      type: Sequelize.STRING(50),
      allowNull: true
    },
    details: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    sign:{
      type: Sequelize.STRING(35),
      allowNull: true
    },
    transactions:{
      type: Sequelize.TEXT,
      allowNull: true
    },
    realip:{
      type: Sequelize.STRING(50),
      allowNull: true
    },
    price:{
      type: Sequelize.DECIMAL(4,2),
      allowNull: false
    },
    status:{
      //draft, payed, promised
      type: Sequelize.STRING(10),
      allowNull: false
    },
    platform:{
      type: Sequelize.STRING(10),
      allowNull: false
    },
    deleted:{
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    create_time:{
      type: Sequelize.DATE,
      allowNull:false
    },
    checkout_time:{
      type: Sequelize.DATE,
      allowNull:true
    },
    agree_time:{
      type: Sequelize.DATE,
      allowNull:true
    }
  },{
    indexes: [{
      unique: true,
      fields: ['id', 'deleted', 'status']
    }],
    timestamps: false,
    charset: "utf8"
  })

// Account.hasMany(Promise_, {foreignKey: "account_id", sourceKey: "id"})
// Promise_.belongsTo(Account, {foreignKey: "account_id", sourceKey: "id"})

module.exports = {
  _Promise: _Promise
}