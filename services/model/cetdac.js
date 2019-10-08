const Types = require('mongolass').Types
const mongolass = require('../module/mongo')

const required = true

const CETDac = mongolass.model('cetdac', {
  name: { type: 'string', required },
  content: { type: 'string', required },
  time: { type: Types.Number, required },
})

module.exports = CETDac