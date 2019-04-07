const mongoose = require('../mongoose')
const Schema = mongoose.Schema
const Promise = require('bluebird')

const UserSchema = new Schema({
    username: String,
    uid: String,
    email: String,
    icon: { type: String, default: '' },
    sex: { type: String, default: '' },
    des: { type: String, default: '' },
    git: { type: String, default: '' },
    articalNum: { type: Number, default: 0 },
    starNum: { type: Number, default: 0 },
    totalRead: { type: Number, default: 0 },
    commentNum: { type: Number, default: 0 },
    followeeNum: { type: Number, default: 0 },
    followerNum: { type: Number, default: 0 },
    followeelist: { type: Array, default: [] },
    followerlist: { type: Array, default: [] },
    zanlist: { type: Array, default: [] },
    tag: { type: Array, default: [] },
    tagid: { type: Array, default: [] },
    mysave: { type: Array, default: [] },
    password: String,
    creat_date: String,
    update_date: String,
    is_delete: Number,
    timestamp: Number,
    wx_avatar: String,
    wx_signature: String
})

const User = mongoose.model('User', UserSchema)
Promise.promisifyAll(User)
Promise.promisifyAll(User.prototype)

module.exports = User
