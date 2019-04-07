const mongoose = require('../mongoose')
const Schema = mongoose.Schema
const Promise = require('bluebird')

const ArticleSchema = new Schema({
    title: String,
    content: String,
    html: String,
    img: { type: String, default: '' },
    usericon: { type: String, default: '' },
    auther_id: { type: String, default: '' },
    username: { type: String, default: '' },
    category: String,
    category_name: String,
    visit: Number,
    like: Number,
    comment_count: Number,
    creat_date: String,
    update_date: String,
    is_delete: Number,
    timestamp: Number,
    likes: [String]
})

const Article = mongoose.model('Article', ArticleSchema)
Promise.promisifyAll(Article)
Promise.promisifyAll(Article.prototype)

module.exports = Article
