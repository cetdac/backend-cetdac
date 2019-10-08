const Sequelize = require("sequelize"),
  connection = require("../module/connection")

const Account = connection.define("User", {
    id: {
      primaryKey: true,
      type:Sequelize.STRING(60),
      allowNull:false,
      unique:true
    },
    id_in_app:{
      type: Sequelize.STRING(45),
      allowNull: true
    },
    short_name:{
      type: Sequelize.STRING(20),
      allowNull: true
    },
    first_name: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    last_name: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    birthday:{
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    gender: {
      type: Sequelize.STRING(5),
      allowNull: true
    },
    avatar:{
      type: Sequelize.STRING(255),
      allowNull: true
    },
    provider:{
      type: Sequelize.STRING(10),
      allowNull: true
    },
    emails:{
      type: Sequelize.STRING(255),
      allowNull: true
    },
    mobile:{
      type: Sequelize.STRING(50),
      allowNull: true
    },
    create_time:{
      type: Sequelize.DATE,
      allowNull: false
    },
    update_time:{
      type: Sequelize.DATE,
      allowNull: false
    },
    from:{
      //chrome, ios, android
      type: Sequelize.STRING(10),
      allowNull:false
    },
    status:{
      //available, freezed, disabled
      type: Sequelize.STRING(10),
      allowNull:false
    }
  },{
    indexes: [{
      unique: true,
      fields: ['id']
    }],
    timestamps: false,
    charset: "utf8"
  })

// Account.hasMany(Promise_, {foreignKey: "account_id", sourceKey: "id"})
// Promise_.belongsTo(Account, {foreignKey: "account_id", sourceKey: "id"})

module.exports = {
  Account: Account
}