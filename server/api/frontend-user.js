const md5 = require('md5')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const axios = require('axios')

const mongoose = require('../mongoose')
const User = mongoose.model('User')

const config = require('../config')
const md5Pre = config.md5Pre
const secret = config.secretClient
const mpappApiId = config.apiId
const mpappSecret = config.secret
const strlen = require('../utils').strlen
const general = require('./general')
const { list, modify, deletes, recover } = general
const number = require('./random')
const Dynamic = mongoose.model('Dynamic')
const Article = mongoose.model('Article')
const Adver = mongoose.model('Adver')
const Category = mongoose.model('Category')



exports.searchUser = (req, res) => {
    const userid = req.query.id || req.cookies.userid || req.headers.userid
    const { username, sex, starNum, articalNum, followeeNum, followerNum, commentNum } = req.body
    //const arr = ['username','sex','starNum','articalNum','followeeNum','followerNum','commentNum']
    if(!userid){
        res.json({
            code: -200,
            message: '用户未登录~',
        })  
    }
    sort = sort || '-_id'
    let { limit, page } = req.body
    page = parseInt(page, 10)
    limit = parseInt(limit, 10)
    if (!page) page = 1
    if (!limit) limit = 10
    const skip = (page - 1) * limit
    Promise.all([
        User.find({is_delete:0, $or : [ //多条件，数组
            {username : username || ''},
            {sex : sex},
            {starNum : starNum},
            {articalNum : articalNum},
            {followeeNum : followeeNum},
            {followerNum : followerNum},
            {commentNum : commentNum},
           ]})
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec(),
        User.count({$or : [ //多条件，数组
            {username : username || ''},
            {sex : sex},
            {starNum : starNum},
            {articalNum : articalNum},
            {followeeNum : followeeNum},
            {followerNum : followerNum},
            {commentNum : commentNum},
           ]})//barrierHelpModel.count({detailId: barrier.lastDetailId})
    ])
        .then(result => {
            console.log(result)
            res.json({
                code:200,
                message:'ok'
            })
            /* const total = result[1]
            const totalPage = Math.ceil(total / limit)
            const json = {
                code: 200,
                data: {
                    list: result[0],
                    total,
                    hasNext: totalPage > page ? 1 : 0,
                    hasPrev: page > 1 ? 1 : 0
                }
            }
            res.json(json) */
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}


exports.gzTag = (req, res) => {
    const userid = req.query.id || req.cookies.userid || req.headers.userid
    const { cate_name, _id } = req.body
    if(!userid){
        res.json({
            code: -200,
            message: '用户未登录~',
        })  
    }
    if(!cate_name || !_id){
        res.json({
            code: -200,
            message: '参数不完整~',
        }) 
    }
    User.updateOneAsync({ _id: userid }, { $push: { tag: cate_name, tagid: _id } })
    .then(() => {
        Category.updateOneAsync({ _id: _id }, { $inc: {cate_peo : 1} })
        .then(() => {
            res.json({
                code: 200,
                message: '关注成功',
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

}

exports.ungzTag = (req, res) => {
    const userid = req.query.id || req.cookies.userid || req.headers.userid
    const { cate_name, _id } = req.body
    if(!userid){
        res.json({
            code: -200,
            message: '用户未登录~',
        })  
    }
    if(!cate_name || !_id){
        res.json({
            code: -200,
            message: '参数不完整~',
        }) 
    }
    User.updateOneAsync({ _id: userid }, { $pull: { tag: cate_name, tagid: _id }})
    .then(() => {
        Category.updateOneAsync({ _id: _id }, { $inc: {cate_peo : -1} })
        .then(() => {
            res.json({
                code: 200,
                message: '取消关注成功',
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

}

exports.getAdver = (req, res) => {
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

exports.getList = (req, res) => {
    list(req, res, User)
}

/**
 * 用户登录
 * @method login
 * @param  {[type]}   req [description]
 * @param  {[type]}   res [description]
 * @return {[type]}       [description]
 */
exports.login = (req, res) => {
    let json = {}
    let { email } = req.body
    const { password } = req.body
    if (email === '' || password === '') {
        json = {
            code: -200,
            message: '请输入用户名和密码'
        }
        res.json(json)
    }
    User.findOneAsync({
        email,
        password: md5(md5Pre + password),
        is_delete: 0
    })
        .then(result => {
            if (result) {
                email = encodeURI(email)
                const id = result._id
                const remember_me = 2592000000
                const token = jwt.sign({ id, email }, secret, { expiresIn: 60 * 60 * 24 * 30 })
                res.cookie('user', token, { maxAge: remember_me })
                res.cookie('userid', id, { maxAge: remember_me })
                res.cookie('username', email, { maxAge: remember_me })
                json = {
                    code: 200,
                    message: '登录成功',
                    data: token
                }
            } else {
                json = {
                    code: -200,
                    message: '用户名或者密码错误'
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
 * 微信登录
 * @method jscode2session
 * @param  {[type]}   req [description]
 * @param  {[type]}   res [description]
 * @return {[type]}       [description]
 */
exports.jscode2session = async (req, res) => {
    const { js_code } = req.body
    const xhr = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
            appid: mpappApiId,
            secret: mpappSecret,
            js_code,
            grant_type: 'authorization_code'
        }
    })
    res.json({
        code: 200,
        message: '登录成功',
        data: xhr.data
    })
}
/**
 * 微信登录
 * @method login
 * @param  {[type]}   req [description]
 * @param  {[type]}   res [description]
 * @return {[type]}       [description]
 */
exports.wxLogin = (req, res) => {
    let json = {}
    let id, token, username
    const { nickName, wxSignature, avatar } = req.body
    if (!nickName || !wxSignature) {
        json = {
            code: -200,
            message: '参数有误, 微信登录失败'
        }
        res.json(json)
    } else {
        User.findOneAsync({
            username: nickName,
            wx_signature: wxSignature,
            is_delete: 0
        })
            .then(result => {
                if (result) {
                    id = result._id
                    username = encodeURI(nickName)
                    token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
                    json = {
                        code: 200,
                        message: '登录成功',
                        data: {
                            user: token,
                            userid: id,
                            username
                        }
                    }
                    res.json(json)
                } else {
                    User.createAsync({
                        username: nickName,
                        password: '',
                        email: '',
                        creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                        is_delete: 0,
                        timestamp: moment().format('X'),
                        wx_avatar: avatar,
                        wx_signature: wxSignature
                    })
                        .then(_result => {
                            id = _result._id
                            username = encodeURI(nickName)
                            token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
                            res.json({
                                code: 200,
                                message: '注册成功!',
                                data: {
                                    user: token,
                                    userid: id,
                                    username
                                }
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

/**
 * 用户退出
 * @method logout
 * @param  {[type]}   req [description]
 * @param  {[type]}   res [description]
 * @return {[type]}       [description]
 */
exports.logout = (req, res) => {
    res.cookie('user', '', { maxAge: -1 })
    res.cookie('userid', '', { maxAge: -1 })
    res.cookie('username', '', { maxAge: -1 })
    res.json({
        code: 200,
        message: '退出成功',
        data: ''
    })
}

/**
 * 用户注册
 * @method insert
 * @param  {[type]}    req  [description]
 * @param  {[type]}    res  [description]
 * @param  {Function}  next [description]
 * @return {json}         [description]
 */
exports.insert = (req, res) => {
    const { email, password, username } = req.body
    if (!username || !password || !email) {
        res.json({
            code: -200,
            message: '请将表单填写完整'
        })
    } else if (strlen(username) < 3) {
        res.json({
            code: -200,
            message: '用户长度至少 3 个中文或 3 个英文'
        })
    } else if (strlen(password) < 8) {
        res.json({
            code: -200,
            message: '密码长度至少 8 位'
        })
    } else {
        var random = Math.floor(Math.random() * number.numbers.length)
        var str = new Date(moment().format()).getTime().toString()
        var uid = number.numbers[random] + str
        uid = uid.slice(0,4) + '-' + uid.slice(4,10) + '-' + uid.slice(10)
        User.findOneAsync({ $or: [{username}, {email}] })
            .then(result => {
                if (result) {
                    res.json({
                        code: -200,
                        message: '该用户名或邮箱已经存在!'
                    })
                } else {
                    return User.createAsync({
                        username,
                        uid,
                        icon:'https://b-gold-cdn.xitu.io/v3/static/img/default-avatar.e30559a.svg',
                        password: md5(md5Pre + password),
                        email,
                        creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                        is_delete: 0,
                        timestamp: moment().format('X')
                    })
                        .then(() => {
                            res.json({
                                code: 200,
                                message: '注册成功!',
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

exports.getItem = (req, res) => {
    let json
    const userid = req.query.id || req.cookies.userid || req.headers.userid
    User.findOneAsync({
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
 * 用户编辑
 * @method modify
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.modify = (req, res) => {
    const { email, password, username, icon, des, git, sex } = req.body
    const userid = req.query.id || req.cookies.userid || req.headers.userid
    if(!userid){
        res.json({
            code: -200,
            message: '用户未登录！'
        }) 
    }
    const data = {
        email,
        username,
        icon,
        des,
        git,
        sex,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss')
    }
    if (password) data.password = md5(md5Pre + password)
    modify(res, User, userid, data)
}

/**
 * 账号编辑
 * @method account
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.account = (req, res) => {
    const { id, email } = req.body
    const user_id = req.cookies.userid || req.headers.userid
    const username = req.body.username || req.headers.username
    if (user_id === id) {
        User.updateOneAsync({ _id: id }, { $set: { email, username } })
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
    } else {
        res.json({
            code: -200,
            message: '当前没有权限'
        })
    }
}

exports.addfriend = (req, res) => {
    const { f_id } = req.body
    const user_id = req.cookies.userid || req.headers.userid
    if(!f_id){
        res.json({
            code: -200,
            message: '参数不能为空!'
        })  
    }
    if(!user_id){
        res.json({
            code: -200,
            message: '请先登录'
        }) 
    }
    User.updateOneAsync({ _id: user_id }, { $inc: { followeeNum: 1 }, $push: { followeelist: f_id } })
        .then(() => {
            User.updateOneAsync({ _id: f_id }, { $inc: { followerNum: 1 }, $push: { followerlist: user_id } })
              .then(() => {
                Dynamic.createAsync({
                    type: 1,
                    userid: user_id,
                    autherid: f_id,
                    creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    is_delete: 0,
                    timestamp: moment().format('X')
                })
                .then(() => {
                    res.json({
                        code: 200,
                        message: '关注成功',
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

exports.getGzlist = (req, res) => {
    const { list } = req.body
    const user_id = req.cookies.userid || req.headers.userid
    if(!user_id){
        res.json({
            code: -200,
            message: '请先登录'
        }) 
    }
    User.findAsync({
        _id: { $in : list },
    }).then(result => {
        if (result) {
            User.findOneAsync({ _id: user_id })
            .then(re=>{
                result = result.map(item=>{
                    item._doc.isGz = re.followerlist && re.followerlist.indexOf(item._id) > -1
                    return item
                })
                res.json({
                    code: 200,
                    message: '更新成功',
                    data: result
                })
            })
        } else {
            res.json({
                code: -200,
                message: '错误'
            })
        }
    })
}

exports.getGzelist = (req, res) => {
    const { list } = req.body
    const user_id = req.cookies.userid || req.headers.userid
    if(!user_id){
        res.json({
            code: -200,
            message: '请先登录'
        }) 
    }
    User.findAsync({
        _id: { $in : list },
    }).then(result => {
        if (result) {
            User.findOneAsync({ _id: user_id })
            .then(re=>{
                result = result.map(item=>{
                    item._doc.isGz = re.followeelist && re.followeelist.indexOf(item._id) > -1
                    return item
                })
                res.json({
                    code: 200,
                    message: '更新成功',
                    data: result
                })
            })
        } else {
            res.json({
                code: -200,
                message: '错误'
            })
        }
    })
}

exports.getTaglist = (req, res) => {
    const { list } = req.body
    const user_id = req.cookies.userid || req.headers.userid
    if(!user_id){
        res.json({
            code: -200,
            message: '请先登录'
        }) 
    }
    User.findAsync({
        _id: { $in : list },
    }).then(result => {
        if (result) {
            User.findOneAsync({ _id: user_id })
            .then(res=>{
                result = result.map(item=>{
                    item._doc.isGz = res.followerlist && res.followerlist.indexOf(item._id) > -1
                })
                res.json({
                    code: 200,
                    message: '更新成功',
                    data: result
                })
            })
        } else {
            res.json({
                code: -200,
                message: '错误'
            })
        }
    })
}

exports.getDnalist = (req, res) => {
    const { id } = req.body
    const user_id = req.cookies.userid || req.headers.userid
    if(!user_id){
        res.json({
            code: -200,
            message: '请先登录'
        }) 
    }
    Dynamic.findAsync({
        userid: id,
        is_delete: 0
    }).then(result => {
        if (result) {
            result = result.map((item,index)=>{
                if(item.type==1){
                   return  User.findOne({ _id: item.autherid })
                }else{
                   return Article.findOne({ _id: item.articalid })
                    
                }
            })
            Promise.all(result).then(function (posts) {
                User.findOneAsync({
                    _id: user_id,
                }).then(result => {
                    if (result) {
                        posts = posts.map(item => {
                            if(item.auther_id){
                               item._doc.isGz = result.followerlist && result.followerlist.indexOf(item.auther_id) > -1 
                            }
                            return item
                        })
                        res.json({
                            code: 200,
                            message: '更新成功',
                            data: posts
                        }) 
                    } else {
                        res.json({
                            code: -200,
                            message: '错误'
                        })
                    }
                })
            })
        } else {
            res.json({
                code: -200,
                message: '错误'
            })
        }
    })
}

exports.getzanlist = (req, res) => {
    const { list } = req.body
    const user_id = req.cookies.userid || req.headers.userid
    if(!user_id){
        res.json({
            code: -200,
            message: '请先登录'
        }) 
    }
    Article.findAsync({
        _id: { $in : list },
    }).then(result => {
        if (result) {
            result = result.map(item => {
                item._doc.like_status = item.likes && item.likes.indexOf(user_id) > -1
                item.likes = []
                return item
            })
            res.json({
                code: 200,
                message: '更新成功',
                data: result
            })
        } else {
            res.json({
                code: -200,
                message: '错误'
            })
        }
    })
}

exports.delfriend = (req, res) => {
    const { f_id } = req.body
    const user_id = req.cookies.userid || req.headers.userid
    if(!f_id){
        res.json({
            code: -200,
            message: '参数不能为空!'
        })  
    }
    if(!user_id){
        res.json({
            code: -200,
            message: '请先登录'
        }) 
    }
    User.updateOneAsync({ _id: user_id }, { $inc: { followeeNum: -1 }, $pull: { followeelist: f_id } })
        .then(() => {
            User.updateOneAsync({ _id: f_id }, { $inc: { followerNum: -1 }, $pull: { followerlist: user_id } })
                .then((result) => {
                    Dynamic.updateOneAsync({ userid: user_id, autherid: f_id, type: 1 }, { is_delete: 1 })
                    .then(() => {
                        res.json({
                            code: 200,
                            message: '取消关注成功',
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


/**
 * 密码编辑
 * @method password
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.password = (req, res) => {
    const { id, old_password, password } = req.body
    const user_id = req.cookies.userid || req.headers.userid
    if (user_id === id) {
        User.findOneAsync({
            _id: id,
            password: md5(md5Pre + old_password),
            is_delete: 0
        }).then(result => {
            if (result) {
                User.updateOneAsync({ _id: id }, { $set: { password: md5(md5Pre + password) } })
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
            } else {
                res.json({
                    code: -200,
                    message: '原始密码错误'
                })
            }
        })
    } else {
        res.json({
            code: -200,
            message: '当前没有权限'
        })
    }
}

/**
 * 用户删除
 * @method deletes
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.deletes = (req, res) => {
    deletes(req, res, User)
}

/**
 * 用户恢复
 * @method recover
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.recover = (req, res) => {
    recover(req, res, User)
}

exports.getinfo = (req, res) => {
  const { auther_id } = req.body
  const user_id = req.cookies.userid || req.headers.userid
  if (!auther_id) {
    res.json({
        code: -200,
        message: '参数不完整！'
    })  
  }
  if(user_id){
    User.findOneAsync({ _id: user_id })
            .then(result => {
                if (result) {
                    User.findOneAsync({ _id: auther_id })
                    .then(value => {
                        if (value) {
                          value._doc.isGz = result.followeelist && result.followeelist.indexOf(value._id)
                          var json = {
                                code: 200,
                                data: value
                           }
                           res.json(json)
                        } else {
                            res.json({
                                code: -200,
                                message: '用户信息不存在'
                            })
                        }
                            
                    })
                    .catch(err => {
                        res.json({
                            code: -200,
                            message: err.toString()
                        })
                    })
                } else {
                    res.json({
                        code: -200,
                        message: '用户信息不存在'
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
  else{
    User.findOneAsync({ _id: auther_id })
            .then(result => {
                if (result) {
                  var json = {
                        code: 200,
                        data: result
                   }
                   res.json(json)
                } else {
                    res.json({
                        code: -200,
                        message: '用户信息不存在'
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
