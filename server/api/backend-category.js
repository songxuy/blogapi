const moment = require('moment')
const mongoose = require('../mongoose')
const Category = mongoose.model('Category')
const general = require('./general')

const { item, modify, deletes, recover } = general

/**
 * 管理时, 获取分类列表
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getList = (req, res) => {
    Category.find({is_delete: 0})
        .sort('-cate_order')
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

exports.getItem = (req, res) => {
    item(req, res, Category)
}

exports.insert = (req, res) => {
    const { cate_name, cate_order, uploadList } = req.body
    if (!cate_name || !cate_order || !uploadList) {
        res.json({
            code: -200,
            message: '请填写分类名称和图标'
        })
    } else {
        return Category.createAsync({
            cate_name,
            icon: uploadList[0],
            cate_order,
            creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            is_delete: 0,
            timestamp: moment().format('X')
        }).then(result => {
            res.json({
                code: 200,
                message: '添加成功',
                data: result._id
            })
        })
    }
}

exports.deletes = (req, res) => {
    deletes(req, res, Category)
}

exports.recover = (req, res) => {
    recover(req, res, Category)
}

exports.modify = (req, res) => {
    const { _id, cate_name, cate_order, icon, cate_num, cate_peo } = req.body
    modify(res, Category, _id, {
        cate_name,
        cate_order,
        icon,
        cate_num,
        cate_peo,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss')
    })
}

exports.search = (req, res) => {
    const { cate_name } = req.body
    if(cate_name){
        Category.findOneAsync({
            cate_name: cate_name,
            is_delete: 0
        })
        .then(result => {
            if (result) {
                json = {
                    code: 200,
                    data: result
                }
            } else {
                json = {
                    code: -200,
                    message: '该标签不存在'
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
    }else{
        Category.find()
        .sort('-cate_order')
        .exec()
        .then(result => {
            const json = {
                code: 200,
                data: result
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
}
