const mongoose = require('../mongoose')
const Schema = mongoose.Schema
const Promise = require('bluebird')

const DynamicSchema = new Schema({
    type: { type: String, default: '' },
    articalid: { type: String, default: '' },
    autherid: { type: String, default: '' },
    userid: { type: String, default: '' },
    creat_date: String,
    update_date: String,
    is_delete: Number,
    timestamp: Number
})

const Dynamic = mongoose.model('Dynamic', DynamicSchema)
Promise.promisifyAll(Dynamic)
Promise.promisifyAll(Dynamic.prototype)

module.exports = Dynamic
