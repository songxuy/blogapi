const moment = require('moment')
const mongoose = require('../mongoose')
const Article = mongoose.model('Article')
const Category = mongoose.model('Category')
const general = require('./general')
const User = mongoose.model('User')
const list = general.list
const item = general.item

const marked = require('marked')
const hljs = require('highlight.js')
marked.setOptions({
    highlight(code) {
        return hljs.highlightAuto(code).value
    },
    breaks: true
})

/**
 * 管理时, 获取文章列表
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getList = (req, res) => {
    list(req, res, Article, '-update_date')
}

/**
 * 管理时, 获取单篇文章
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getItem = (req, res) => {
    item(req, res, Article)
}

/**
 * 发布文章
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.insert = (req, res) => {
    const { category, content, title } = req.body
    const html = marked(content)
    const arr_category = category.split('|')
    const data = {
        title,
        category: arr_category[0],
        category_name: arr_category[1],
        content,
        html,
        visit: 0,
        like: 0,
        comment_count: 0,
        creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        is_delete: 0,
        timestamp: moment().format('X')
    }
    Article.createAsync(data)
        .then(result => {
            return Category.updateOneAsync({ _id: arr_category[0] }, { $inc: { cate_num: 1 } }).then(() => {
                return res.json({
                    code: 200,
                    message: '发布成功',
                    data: result
                })
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}

/**
 * 管理时, 删除文章
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.deletes = (req, res) => {
    const _id = req.body.id
    Article.findOneAndUpdateAsync({ _id }, { is_delete: 1 })
        .then((result) => {
            
            /* return Category.updateOneAsync({ _id }, { $inc: { cate_num: -1 } }).then(result => {
                res.json({
                    code: 200,
                    message: '更新成功',
                    data: result
                })
            }) */
            Promise.all([
                Category.updateOneAsync({ _id: result.category }, { $inc: { cate_num: -1 } }),
                User.updateOneAsync({ _id: result.auther_id }, { $inc: { articalNum: -1 } })
            ]).then(function () {
                res.json({
                    code: 200,
                    message: '更新成功',
                    data: ''
                })
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}

/**
 * 管理时, 恢复文章
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.recover = (req, res) => {
    const _id = req.query.id
    Article.updateOneAsync({ _id }, { is_delete: 0 })
        .then(() => {
            return Category.updateOneAsync({ _id }, { $inc: { cate_num: 1 } }).then(() => {
                res.json({
                    code: 200,
                    message: '更新成功',
                    data: 'success'
                })
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}

/**
 * 管理时, 编辑文章
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.modify = (req, res) => {
    const { _id, category_name, category, content, category_old, title, username, visit, like, comment_count, creat_date } = req.body
    const html = marked(content)
    const data = {
        category_name,
        category,
        username,
        content,
        html,
        title,
        visit,
        like,
        comment_count,
        creat_date,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss')
    }
    Article.findOneAndUpdateAsync({ _id: _id }, data, { new: true })
        .then(result => {
            console.log(result)
            if (category !== category_old) {
                Promise.all([
                    Category.updateOneAsync({ _id: category }, { $inc: { cate_num: 1 } }),
                    Category.updateOneAsync({ _id: category_old }, { $inc: { cate_num: -1 } })
                ]).then(() => {
                    res.json({
                        code: 200,
                        message: '更新成功',
                        data: result
                    })
                })
            } else {
                res.json({
                    code: 200,
                    message: '更新成功',
                    data: result
                })
            }
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}
