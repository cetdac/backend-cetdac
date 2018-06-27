var test = require("unit.js"),
  request = require("request"),
  config = require("./config");
describe("Auth", function() {
  it("/auth/vercode/", function(done) {
    let rqPromise = async function() {
      return new Promise(function(resolve, reject) {
        return request(
          {
                method: "GET",
                uri: config.protocal + "://" + config.host + "/v1/auth/vercode/get_guid",
                gzip: true
          },
          function(error, response, body) {
            if (error) {
                reject(error)
            } else {
                resolve(response.headers)
            }
          }
        )
      })
    }
    test.promise
    .given(rqPromise)
    .then(function(headers){ 
      test.object(headers).contains({"content-type": "image/jpeg"})
    })
    .catch(function(e) {
      test.fail(e.message)
    })
    .finally(done)
    .done()
  });
  it("/auth/sms/", function(done) {
    let rqPromise = async function() {
        return new Promise(function(resolve, reject) {
          return request(
            {
              method: "GET",
              uri: config.protocal+"://" + config.host + "/v1/auth/sms/create_account?mobile=18520833073&country_key=86",
              gzip: true,
              json: true
            },
            function(error, response, body) {
              if (error) {
                reject(error);
              } else {
                resolve(body);
              }
            }
          );
        });
      }
      test.promise
      .given(rqPromise)
      .then(body => {
        test.object(body.data).contains({"Message":"OK"})
      })
      .catch(function(e) {
        test.fail(e.message);
      })
      .finally(done)
      .done();
  });
});
