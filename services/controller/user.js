const util = require('../util/util')

module.exports = {
  //post
  create: async function(ctx, next) {
    if (!await util.preProcess(ctx, next)) {
      return;
    }
    ctx.params = ctx.params || {};

    if (config.platforms.indexOf(ctx.request.headers["platform"]) === -1) {
      ctx.status = 400;
      ctx.body = util.jsonResponse(ctx.request, undefined, "PLATFORM_ERROR");
      return;
    }

    if (!ctx.request.body.encrypted_master_seed) {
      ctx.status = 400;
      ctx.body = util.jsonResponse(
        ctx.request,
        undefined,
        "ENCRYPTED_MASTER_SEED_ERROR"
      );
      return;
    }

    if (ctx.request.body.mobile && ctx.request.body.country_key) {
      //手机验证时校验验证码
      let res = auth.verifyToken(
        ctx.request,
        ctx.query.token,
        "create_account",
        false,
        ctx.request.body.country_key + ctx.request.body.mobile
      );
      if (!res.approve) {
        ctx.status = 401;
        ctx.body = util.jsonResponse(
          ctx.request,
          undefined,
          "TOKEN_ERROR",
          res.reason
        );
        return;
      }else{
        //手机号注册，检查重复
        // let account = await schema.Account.findOne({
        //     attributes:["id"],
        //     where:{
        //         $or:[{
        //             mobile : ctx.request.body.mobile,
        //             country_key: ctx.request.body.country_key
        //         }]
        //     }
        // })
        // if(account){
        //     //重复注册
        //     ctx.body = util.jsonResponse(ctx.request, undefined, "ACCOUNT_EXISTS_ERROR")
        //     return
        // }
      }
    }

    const redis = require("redis"),
      client = redis.createClient();
    client.on("error", function(err) {
      console.error("Error " + err);
    });

    const realip = ctx.request.headers["x-real-ip"] || ctx.ip;
    let keychain = await auth.generateToken(
      (ctx.request.body.mobile || ctx.request.body.email) + realip,
      "keychain"
    ),
    key = await auth.generateToken(
      (ctx.request.body.mobile || ctx.request.body.email) + realip,
      "key"
    );
    return new Promise(function(resolve, reject) {
      return connection
        .sync()
        .then(() => {
          let createPromiseArr = [];
          createPromiseArr.push(
            schema.Account.create(
              {
                country_key: ctx.request.body.country_key,
                mobile: ctx.request.body.mobile,
                email: ctx.request.body.email,
                email_verified: 0,
                keychain: keychain,
                guid: Guid.create().value,
                key:key, 
                encrypted_master_seed: util.cipher(config.encryptAlgorithm, key, ctx.request.body.encrypted_master_seed),
                Wallets: [
                  {
                    name: util.getWords(
                      ctx.request.headers["accept-language"],
                      "account.main_wallet"
                    ),
                    uuid: Uuid.create().value,
                    currency: config.defaultCurrency,
                    Coinlists: config.coinList.map(coin => {
                      return {
                        coin_id: coin.id,
                        unit: coin.defaultUnit
                      };
                    })
                  }
                ]
              },
              {
                include: [
                  {
                    model: schema.Wallet,
                    include: [
                      {
                        model: schema.Coinlist,
                        include: [schema.Coin]
                      }
                    ]
                  }
                ]
              }
            )
          );
          //查询ip归属地
          createPromiseArr.push(
            new Promise((resolve, reject) => {
              request(
                {
                  method: "GET",
                  uri: config.ip138.url,
                  headers: {
                    token: config.ip138.token
                  },
                  json: true,
                  gzip: true,
                  timeout: 3000
                },
                function(error, response, body) {
                  if (error) {
                    console.error(error);
                    resolve();
                  } else {
                    resolve(body);
                  }
                }
              );
            })
          );
          //ua查询
          createPromiseArr.push(
            new Promise((resolve, reject) => {
              request(
                {
                  method: "GET",
                  uri:
                    config.ua.url +
                    encodeURIComponent(ctx.request.headers["user-agent"]),
                  json: true,
                  gzip: true,
                  timeout: 3000
                },
                function(error, response, body) {
                  if (error) {
                    console.error(error);
                    resolve();
                  } else {
                    resolve(body);
                  }
                }
              );
            })
          );
          Promise.all(createPromiseArr)
            .then(res => {
              let account = res[0],
                location = res[1],
                ua = res[2];
              let arr = [
                account.reload({
                  attributes: [
                    "id",
                    "guid",
                    "country_key",
                    "mobile",
                    "email",
                    "email_verified",
                    "encrypted_master_seed"
                  ],
                  include: [
                    {
                      model: schema.Wallet,
                      attributes: ["name", "uuid", "currency"],
                      include: [
                        {
                          attributes: ["unit"],
                          model: schema.Coinlist,
                          include: [
                            {
                              attributes: [
                                "id",
                                "name",
                                "shortname",
                                "confirmations",
                                "sign"
                              ],
                              model: schema.Coin
                            },
                            {
                              attributes: ["string"],
                              model: schema.Unit
                            }
                          ]
                        }
                      ]
                    }
                  ]
                })
              ];
              if (account.email) {
                arr.push(
                  auth.sendEmail(
                    "create_account",
                    account.email,
                    ctx.request,
                    account
                  )
                );
              }
              //debugger
              arr.push(
                schema.Record.create({
                  ip: location ? location.ip : "",
                  time: +new Date(),
                  device: ua ? JSON.stringify(ua.data) : "",
                  location: location ? location.data.join(",") : "",
                  is_success: true,
                  account_id: account.id
                })
              );
              Promise.all(arr)
                .then(res => {
                  let account = res[0];
                  //直接取出来是加密后的数据
                  account.encrypted_master_seed = ctx.request.body.encrypted_master_seed
                  account.setAttributes({"key":undefined})
                  auth
                    .generateAuth((account.mobile || account.email) + realip)
                    .then(token => {
                      //用户登录态存redis
                      client.set(
                        account.guid + "|" + ctx.request.headers["platform"],
                        JSON.stringify({
                          token: token,
                          ip: realip,
                          timestamp: +new Date()
                        }),
                        function(err, reply) {
                          ctx.body = util.jsonResponse(ctx.request, {
                            token: token,
                            account: account
                          });
                          resolve();
                        }
                      );
                    })
                    .catch(e => {
                      //发送邮件或者account.reload失败
                      console.error(e);
                      ctx.body = util.jsonResponse(
                        ctx.request,
                        undefined,
                        "CREATE_ACCOUNT_ERROR"
                      );
                      reject();
                    });
                })
                .catch(e => {
                  //发送邮件或者account.reload失败
                  console.error(e);
                  ctx.body = util.jsonResponse(
                    ctx.request,
                    undefined,
                    "CREATE_ACCOUNT_ERROR"
                  );
                  reject();
                });
            })
            .catch(e => {
              //创建账户失败
              console.error(e);
              ctx.body = util.jsonResponse(
                ctx.request,
                undefined,
                "CREATE_ACCOUNT_ERROR"
              );
              reject();
            });
          //}
        })
        .catch(e => {
          //查找account失败
          console.error(e);
          ctx.body = util.jsonResponse(
            ctx.request,
            undefined,
            "CREATE_ACCOUNT_ERROR",
            e
          );
          reject();
        });
    });
    //})
  },

  update: async function(ctx, next) {
    if (!await util.preProcess(ctx, next)) {
      return;
    }
    ctx.params = ctx.params || {};

    if (config.platforms.indexOf(ctx.request.headers["platform"]) === -1) {
      ctx.status = 400;
      ctx.body = util.jsonResponse(ctx.request, undefined, "PLATFORM_ERROR");
      return;
    }

    if (ctx.request.body.mobile && ctx.request.body.country_key) {
      //手机验证时校验验证码
      let res = auth.verifyToken(
        ctx.request,
        ctx.query.token,
        "update_account",
        false,
        ctx.request.body.country_key + ctx.request.body.mobile
      );
      if (!res.approve) {
        ctx.status = 401;
        ctx.body = util.jsonResponse(
          ctx.request,
          undefined,
          "TOKEN_ERROR",
          res.reason
        );
        return;
      }else{
        //手机号注册，检查重复
        let account = await schema.Account.findOne({
            attributes:["id"],
            where:{
                $or:[{
                    mobile : ctx.request.body.mobile,
                    country_key: ctx.request.body.country_key
                }]
            }
        })
        if(account){
            //重复注册
            ctx.body = util.jsonResponse(ctx.request, undefined, "ACCOUNT_EXISTS_ERROR")
            return
        }
      }
    }

    return new Promise(function(resolve, reject) {
      return connection.sync().then(() => {
        schema.Account
          .update(
            {
              country_key: ctx.request.body.country_key,
              mobile: ctx.request.body.mobile,
              email: ctx.request.body.email,
              encrypted_master_seed : ctx.request.body.encrypted_master_seed
            },
            {
              where: {
                guid: ctx.request.headers["guid"]
              }
            }
          )
          .then(account => {
            ctx.body = util.jsonResponse(ctx.request);
            resolve();
          })
          .catch(e => {
            //查找account失败
            console.error(e);
            ctx.body = util.jsonResponse(
              ctx.request,
              undefined,
              "UPDATE_ACCOUNT_ERROR"
            );
            reject();
          });
      });
    });
  }
}