const mongoose = require('../mongoose')
const Schema = mongoose.Schema
const Promise = require('bluebird')

const CommentSchema = new Schema({
    article_id: String,
    userid: String,
    username: String,
    email: String,
    zanNum: { type: Number, default: 0 },
    isZan: { type: Boolean, default: false},
    zanList: { type: Array, default: [] },
    list: { type: Array, default: [] },
    avatar: String,
    content: String,
    creat_date: String,
    is_delete: Number,
    timestamp: Number
})

const Comment = mongoose.model('Comment', CommentSchema)
Promise.promisifyAll(Comment)
Promise.promisifyAll(Comment.prototype)

module.exports = Comment
