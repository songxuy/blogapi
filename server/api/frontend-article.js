const mongoose = require('../mongoose')
const Article = mongoose.model('Article')
const Category = mongoose.model('Category')
const marked = require('marked')
const moment = require('moment')
const User = mongoose.model('User')
/**
 * 前台浏览时, 获取文章列表
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getList = (req, res) => {
    const { by, id, key } = req.query
    let { limit, page } = req.query
    page = parseInt(page, 10)
    limit = parseInt(limit, 10)
    if (!page) page = 1
    if (!limit) limit = 10
    const data = {
            is_delete: 0
        },
        skip = (page - 1) * limit
    if (id) {
        data.category = id
    }
    if (key) {
        const reg = new RegExp(key, 'i')
        data.title = { $regex: reg }
    }
    let sort = '-update_date'
    if (by) {
        sort = '-' + by
    }

    const filds =
        'title content category category_name username auther_id img visit like likes comment_count creat_date update_date is_delete timestamp'

    Promise.all([
        Article.find(data, filds)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec(),
        Article.countDocumentsAsync(data)
    ])
        .then(([data, total]) => {
            const totalPage = Math.ceil(total / limit)
            const user_id = req.cookies.userid || req.headers.userid
            const json = {
                code: 200,
                data: {
                    total,
                    hasNext: totalPage > page ? 1 : 0,
                    hasPrev: page > 1
                }
            }
            if (user_id) {
                data = data.map(item => {
                    item._doc.like_status = item.likes && item.likes.indexOf(user_id) > -1
                    item.content = item.content.substring(0, 500) + '...'
                    item.likes = []
                    return item
                })
                json.data.list = data
                res.json(json)
            } else {
                data = data.map(item => {
                    item._doc.like_status = false
                    item.content = item.content.substring(0, 500) + '...'
                    item.likes = []
                    return item
                })
                json.data.list = data
                res.json(json)
            }
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}


exports.addReadnum = (req, res) => {
   const { auther_id } = req.body
   if (!auther_id) {
    res.json({
        code: -200,
        message: '参数错误'
    })
   }
   User.updateOneAsync({
      _id: auther_id
    }, { $inc: { totalRead: 1 }})
    .then(() => {
            json = {
                code: 200
            }
        res.json(json)
    })
    .catch(err => {
        res.json({
            code: -200,
            message: err.toString()
        })
    })


}
/**
 * 前台浏览时, 获取单篇文章
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */

exports.getItem = (req, res) => {
    const _id = req.query.id
    const user_id = req.cookies.userid || req.headers.userid
    if (!_id) {
        res.json({
            code: -200,
            message: '参数错误'
        })
    }
    Promise.all([Article.findOneAsync({ _id, is_delete: 0 }), Article.updateOneAsync({ _id }, { $inc: { visit: 1 } })])
        .then(value => {
            var json
            if (!value[0]) {
                json = {
                    code: -200,
                    message: '没有找到该文章'
                }
                res.json(json)
            } else {
                if (user_id) value[0]._doc.like_status = value[0].likes && value[0].likes.indexOf(user_id) > -1
                else value[0]._doc.like_status = false
                value[0].likes = []
                if(user_id){
                    User.findOneAsync({ _id: user_id})
                   .then(result => {
                    value[0]._doc.isGz = result.followeelist && result.followeelist.indexOf(value[0].auther_id)
                    json = {
                        code: 200,
                        data: value[0]
                    }
                    res.json(json)
                   })
                }else{
                    json = {
                        code: 200,
                        data: value[0]
                    }
                    res.json(json)
                }
            }
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}

exports.getTrending = (req, res) => {
    const limit = 5
    const data = { is_delete: 0 }
    const filds = 'title visit like comment_count'
    Article.find(data, filds)
        .sort('-visit')
        .limit(limit)
        .exec()
        .then(result => {
            const json = {
                code: 200,
                data: {
                    list: result
                }
            }
            res.json(json)
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}

exports.insert = (req, res) => {
    const { category, content, title, img, username, usericon } = req.body
    const auther_id = req.cookies.userid || req.headers.userid
    if(!category || !content || !title || !auther_id || !username || !usericon){
        return res.json({
            code: 200,
            message: '参数不完整'
        })
    }
    if(!auther_id){
        return res.json({
            code: 200,
            message: '请先登录！'
        })
    }
    const html = marked(content)
    console.log(category)
    const arr_category = category.split('|')
    const data = {
        title,
        category: arr_category[0],
        category_name: arr_category[1],
        content,
        html,
        username,
        usericon,
        img,
        auther_id,
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
            Category.updateOneAsync({ _id: arr_category[0] }, { $inc: { cate_num: 1 } }).then(() => {
                User.updateOneAsync({ _id: auther_id }, { $inc: { articalNum: 1 } }).then(() => {
                return res.json({
                    code: 200,
                    message: '发布成功',
                    data: result
                })
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
