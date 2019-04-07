const md5 = require('md5')
const fs = require('fs')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const marked = require('marked')
const mongoose = require('../mongoose')
const Admin = mongoose.model('Admin')
const User = mongoose.model('User')
const Artical = mongoose.model('Article')
const fsExistsSync = require('../utils').fsExistsSync
const config = require('../config')
const md5Pre = config.md5Pre
const secret = config.secretServer
const general = require('./general')
const { list, item, modify, deletes, recover } = general
const Adver = mongoose.model('Adver')


exports.articalmodify = (req, res) => {
    const { _id, category_name, category, content, title, username, visit, like, comment_count, creat_date } = req.body
    const html = marked(content)
    var data = {
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
    modify(res, Artical, _id, data)
}

exports.updateImg = (req, res) => {
    let { from, title, price, type, buynum, link, linkimg, arr} = req.body
    if(!type){
        return res.json({
            code: -200,
            message: '系统错误'
        })
    }
    if(type==1){
        Adver.findAsync()
        .then(result => {
            if (result.length==0) {
                Adver.createAsync({
                    type,
                    from,
                    title,
                    price,
                    buynum,
                    link,
                    linkimg,
                    creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    is_delete: 0,
                    timestamp: moment().format('X')
                }).then(() => {
                    res.json({
                        code: 200,
                        message: '添加成功',
                        data: ''
                    })
                })
            } else {
                Adver.updateOneAsync({ _id: result[0]._id }, { from, title, price, type, buynum, link, linkimg })
                .then(() => {
                    res.json({
                        code: 200,
                        message: '更新成功',
                        data: 'success'
                    })
                })
                .catch(err => {
                    res.json({
                        code: -200,
                        message: err.toString()
                    })
                })  
            }
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        }) 
    }else if(type==2){
        Adver.findAsync()
        .then(result => {
            if (result.length==0) {
                Adver.createAsync({
                    src: arr,
                    creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    is_delete: 0,
                    timestamp: moment().format('X')
                }).then(() => {
                    res.json({
                        code: 200,
                        message: '添加成功',
                        data: ''
                    })
                })
            } else {
                Adver.updateOneAsync({ _id: result[0]._id }, { src: arr })
                .then(() => {
                    res.json({
                        code: 200,
                        message: '更新成功',
                        data: 'success'
                    })
                })
                .catch(err => {
                    res.json({
                        code: -200,
                        message: err.toString()
                    })
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
}


exports.getImg = (req, res) => {
    Adver.findAsync()
    .then(result => {
        if (result.length==0) {
            res.json({
                code: 200,
                message: '获取成功',
                data: {}
            }) 
        } else {
            res.json({
                code: 200,
                message: '获取成功',
                data: result[0]
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



/**
 * 获取管理员列表
 * @method getList
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getList = (req, res) => {
    list(req, res, Admin)
}

exports.getUserList = (req, res) => {
    list(req, res, User)
}

//获取文章列表
exports.getArticalList = (req, res) => {
    list(req, res, Artical)
}

exports.getAdmin = (req, res) => {
    let json
    const userid =req.cookies.b_userid || req.headers.b_userid
    if(!userid){
        return res.json({
            code: -200,
            message: '请先登录~'
        }) 
    }
    Admin.findOneAsync({
        _id: userid,
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
                    message: '请先登录, 或者数据错误'
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
/**
 * 获取单个管理员
 * @method getItem
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getItem = (req, res) => {
    item(req, res, Admin)
}

/**
 * 管理员登录
 * @method loginAdmin
 * @param  {[type]}   req [description]
 * @param  {[type]}   res [description]
 * @return {[type]}       [description]
 */
exports.login = (req, res) => {
    let json = {}
    const { password, username } = req.body
    console.log(password)
    if (username === '' || password === '') {
        json = {
            code: -200,
            message: '请输入用户名和密码'
        }
        return res.json(json)
    }
    Admin.findOneAsync({
        username,
        password: md5(md5Pre + password),
        is_delete: 0
    })
        .then(result => {
            if (result) {
                const _username = encodeURI(username)
                const id = result._id
                const remember_me = 2592000000
                const token = jwt.sign({ id, username: _username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
                res.cookie('b_user', token, { maxAge: remember_me })
                res.cookie('b_userid', id, { maxAge: remember_me })
                res.cookie('b_username', _username, { maxAge: remember_me })
                return res.json({
                    code: 200,
                    message: '登录成功',
                    data: token
                })
            }
            return res.json({
                code: -200,
                message: '用户名或者密码错误'
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}

exports.logout = (req, res) => {
    res.cookie('b_user', '', { maxAge: -1 })
    res.cookie('b_userid', '', { maxAge: -1 })
    res.cookie('b_username', '', { maxAge: -1 })
    res.json({
        code: 200,
        message: '退出成功',
        data: ''
    })
}
/**
 * 初始化时添加管理员
 * @method insertAdmin
 * @param  {[type]}    req  [description]
 * @param  {[type]}    res  [description]
 * @param  {Function}  next [description]
 * @return {json}         [description]
 */
exports.insert = (req, res, next) => {
    const { email, password, username } = req.body
    if (fsExistsSync('./admin.lock')) {
        return res.render('admin-add.html', { message: '请先把 admin.lock 删除' })
    }
    if (!username || !password || !email) {
        return res.json({
            code: -200,
            message: '请将表单填写完整',
            data: ''
        })
    }
    Admin.findOneAsync({ username })
        .then(result => {
            if (result) {
                return res.json({
                    code: -200,
                    message: '该用户已经存在~',
                    data: ''
                })
            }
            return Admin.createAsync({
                username,
                password: md5(md5Pre + password),
                email,
                creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                is_delete: 0,
                timestamp: moment().format('X')
            }).then(() => {
                res.json({
                    code: 200,
                    message: '添加成功',
                    data: ''
                })
            })
        })
        /* .then(message => {
            res.render('admin-add.html', { message })
        }) */
        .catch(err => next(err))
}

/**
 * 管理员编辑
 * @method modifyAdmin
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.modify = (req, res) => {
    const { _id, email, password, username } = req.body
    var data = {
        email,
        username,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss')
    }
    if (password) data.password = md5(md5Pre + password)
    modify(res, Admin, _id, data)
}

exports.usermodify = (req, res) => {
    const { email, password, username, icon, des, git, sex, starNum, totalRead, commentNum, followeeNum, followerNum, _id } = req.body
    const data = {
        email,
        username,
        icon,
        des,
        git,
        sex,
        starNum,
        totalRead,
        commentNum,
        followeeNum,
        followerNum,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss')
    }
    if (password) data.password = md5(md5Pre + password)
    modify(res, User, _id, data)
}

/**
 * 管理员删除
 * @method deletes
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.deletes = (req, res) => {
    deletes(req, res, Admin)
}

exports.userdeletes = (req, res) => {
    deletes(req, res, User)
}


/**
 * 管理员恢复
 * @method recover
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.recover = (req, res) => {
    recover(req, res, Admin)
}
