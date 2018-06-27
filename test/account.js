var test = require("unit.js"),
    request = require("request"),
    config = require("./config")

describe("Account", function() {
  it("createAccountByEmail", function(done) {
    // let rqPromise = function() {
    //   return new Promise(function(resolve, reject) {
    //     return request(
    //       {
    //             method: "GET",
    //             uri: config.protocal + "://" + config.host + "/v1/auth/email/create_account?email=ggddll123%40qq.com",
    //             gzip: true
    //       },
    //       function(error, response, body) {
    //         if (error) {
    //             reject(error)
    //         } else {
    //             resolve(JSON.parse(body))
    //         }
    //       }
    //     )
    //   })
    // }

    let crPromise = async function() {
      return new Promise(function(resolve, reject) {
        return request(
          {
                method: "POST",
                uri: config.protocal + "://" + config.host + "/v1/account",
                body: {
                  "email": "ggddll123@qq.com",
                  "encrypted_master_seed": "test demo"
                },
                json: true,
                gzip: true
          },
          function(error, response, body) {
            if (error) {
                reject(error)
            } else {
                resolve(body)
            }
          }
        )
      })
    }

    test
    .promise
    .given(crPromise)
    .then("创建账户成功",body=>{
      test.object(body.data).contains("guid")
      createdGUID = body.data.guid
    })
    .catch(function(e){
      test.fail(e.message)
    })
    .finally(done)
    .done()
  })
  it("getAccount", function(done){
    const guid = "c18ce61d-739d-b510-37f8-46236feb7a80"
    let rqPromise = async function(){
     return new Promise(function(resolve, reject){
        return request({
            method:"GET",
            uri: config.protocal+"://"+config.host+"/v1/account/"+guid,
            gzip: true,
            json: true
        },function(error, response, body){
            if(error){
              reject(error)
            }
            else{
              resolve(body)
            }
        })
      })
    }
    test.promise
    .given(rqPromise)
    .then("获取账户成功",body=>{
      test.object(body.data).contains({guid:guid})
    })
    .catch(function(e){
      test.fail(e.message)
    })
    .finally(done)
    .done()
  })
})