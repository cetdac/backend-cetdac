const Axios = require('axios')

const axios = Axios.create()

axios.interceptors.response.use(function (res) {
  return res.data ? res.data : Promise.reject(res)
}, function (err) {
  return Promise.reject(err)
})

module.exports = axios
