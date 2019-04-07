const mongoose = require('../mongoose')
const Article = mongoose.model('Article')
const User = mongoose.model('User')
const Dynamic = mongoose.model('Dynamic')
const moment = require('moment')

exports.like = (req, res) => {
    const article_id = req.query.id
    const auther_id = req.query.auther_id
    const user_id = req.cookies.userid || req.headers.userid
    if(!article_id || !auther_id) {
        res.json({
            code: -200,
            message: '参数不全！',
        })
    }
    Article.updateOneAsync({ _id: article_id }, { $inc: { like: 1 }, $push: { likes: user_id } })
        .then(() => {
            User.updateOneAsync({ _id: auther_id }, { $inc: { starNum: 1 }, $push: { zanlist: article_id }})
            .then(() => {
                Dynamic.createAsync({
                    type: 2,
                    userid: user_id,
                    articalid: article_id,
                    autherid: auther_id,
                    creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    is_delete: 0,
                    timestamp: moment().format('X')
                })
                .then(() => {
                    res.json({
                        code: 200,
                        message: '操作成功',
                        data: 'success'
                    })
                })
                .catch(err => {
                    res.json({
                        code: -200,
                        message: err.toString()
                    })
                }) 
            })
            .catch(err => {
                res.json({
                    code: -200,
                    message: err.toString()
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

exports.unlike = (req, res) => {
    const article_id = req.query.id
    const auther_id = req.query.auther_id
    const user_id = req.cookies.userid || req.headers.userid
    if(!article_id || !auther_id) {
        res.json({
            code: -200,
            message: '参数不全！',
        })
    }
    Article.updateOneAsync({ _id: article_id }, { $inc: { like: -1 }, $pull: { likes: user_id } })
        .then(() => {
            User.updateOneAsync({ _id: auther_id }, { $inc: { starNum: -1 }, $pull: { zanlist: article_id }})
            .then(() => {
                Dynamic.updateOneAsync({ userid: user_id, autherid: auther_id, type: 2 }, { is_delete: 1 })
                    .then(() => {
                        res.json({
                            code: 200,
                            message: '操作成功',
                            data: 'success'
                        })
                    })
                    .catch(err => {
                        res.json({
                            code: -200,
                            message: err.toString()
                        })
                    }) 
            })
            .catch(err => {
                res.json({
                    code: -200,
                    message: err.toString()
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
exports.resetLike = (req, res) => {
    Article.find()
        .exec()
        .then(result => {
            result.forEach(item => {
                Article.findOneAndUpdateAsync({ _id: item._id }, { like: item.likes.length }, { new: true })
            })
            res.json({
                code: 200,
                message: '操作成功',
                data: 'success'
            })
        })
}
