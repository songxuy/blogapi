const mongoose = require('../mongoose')
const Schema = mongoose.Schema
const Promise = require('bluebird')

const AdverSchema = new Schema({
    from: { type: String, default: ''},
    title: { type: String, default: ''},
    price: { type: String, default: ''},
    buynum: { type: Number, default: 0},
    link: { type: String, default: ''},
    linkimg: { type: String, default: ''},
    /* src1: { type: String, default: ''},
    src1img: { type: String, default: ''},
    src2: { type: String, default: ''},
    src2img: { type: String, default: ''},
    src3: { type: String, default: ''},
    src3img: { type: String, default: ''}, */
    src: { type: Array, default: []},
    type: { type: Number, default: 0},
    creat_date: String,
    update_date: String,
    is_delete: Number,
    timestamp: Number
})

const Adver = mongoose.model('Adver', AdverSchema)
Promise.promisifyAll(Adver)
Promise.promisifyAll(Adver.prototype)

module.exports = Adver
