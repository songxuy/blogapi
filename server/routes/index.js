const express = require('express')
const router = express.Router()
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()
const UPYUN = require('upyun')
const sha1 = require('sha1')
const backendArticle = require('../api/backend-article')
const backendCategory = require('../api/backend-category')
const backendUser = require('../api/backend-user')
const frontendArticle = require('../api/frontend-article')
const frontendComment = require('../api/frontend-comment')
const frontendLike = require('../api/frontend-like')
const frontendUser = require('../api/frontend-user')
const isAdmin = require('./is-admin')
const isUser = require('./is-user')
const util = require('./util')
var request = require('request');
// 添加管理员
router.get('/backend', (req, res) => {
    res.render('admin-add.html', { title: '添加管理员', message: '' })
})
router.post('/backend/admin/insert', multipartMiddleware, backendUser.insert)

// API
// ================ 后台 ================
// ------- 文章 -------
// 管理时, 获取文章列表
router.get('/backend/article/list', isAdmin, backendArticle.getList)
// 管理时, 获取单篇文章
router.get('/backend/article/item', isAdmin, backendArticle.getItem)
// 管理时, 发布文章
router.post('/backend/article/insert', isAdmin, multipartMiddleware, backendArticle.insert)
// 管理时, 删除文章
router.post('/backend/article/delete', isAdmin, backendArticle.deletes)
// 管理时, 恢复文章
router.get('/backend/article/recover', isAdmin, backendArticle.recover)
// 管理时, 编辑文章
router.post('/backend/article/modify', isAdmin, multipartMiddleware, backendArticle.modify)
// ------- 分类 -------
// 管理时, 获取分类列表
router.get('/backend/category/list', backendCategory.getList)
// 管理时, 获取单个分类
router.get('/backend/category/item', backendCategory.getItem)
// 管理时, 添加分类
router.post('/backend/category/insert', multipartMiddleware, isAdmin, backendCategory.insert)
// 管理时, 删除分类
router.post('/backend/category/delete', isAdmin, backendCategory.deletes)
// 管理时, 恢复分类
router.get('/backend/category/recover', isAdmin, backendCategory.recover)
// 管理时, 编辑分类
router.post('/backend/category/modify', isAdmin, multipartMiddleware, backendCategory.modify)
// 管理时, 查找分类
router.post('/backend/category/search', isAdmin, multipartMiddleware, backendCategory.search)
// 管理时, 查找用户
router.post('/backend/user/search', isAdmin, multipartMiddleware, frontendUser.searchUser)
// ------- 管理 -------
// 后台登录
router.post('/backend/admin/login', multipartMiddleware, backendUser.login)
// 后台退出登录
router.post('/backend/admin/logout', multipartMiddleware, backendUser.logout)
// 管理列表
router.get('/backend/admin/list', isAdmin, backendUser.getList)
// 文章编辑
router.post('/backend/artical/modify', isAdmin, multipartMiddleware, backendUser.articalmodify)
// 编辑用户
router.post('/backend/user/usermodify', isAdmin, multipartMiddleware, backendUser.usermodify)
// 修改广告图
router.post('/backend/adver/img', isAdmin, multipartMiddleware, backendUser.updateImg)
// 获取广告图
router.post('/backend/adver/getimg', isAdmin, multipartMiddleware, backendUser.getImg)
// 文章列表
router.get('/backend/admin/articallist', isAdmin, backendUser.getArticalList)
// 用户列表
router.get('/backend/admin/userlist', isAdmin, backendUser.getUserList)
// 获取管理员
router.get('/backend/admin/getitem', isAdmin, backendUser.getAdmin)
// 获取单个管理员
router.get('/backend/admin/item', isAdmin, backendUser.getItem)
// 编辑管理员
router.post('/backend/admin/modify', isAdmin, multipartMiddleware, backendUser.modify)
// 删除管理员
router.post('/backend/admin/delete', isAdmin, backendUser.deletes)
// 恢复管理员
router.get('/backend/admin/recover', isAdmin, backendUser.recover)

// 用户列表
router.get('/backend/user/list', isAdmin, frontendUser.getList)
// 获取单个用户
router.get('/backend/user/item', isAdmin, frontendUser.getItem)
// 编辑用户
router.post('/backend/user/modify', isAdmin, multipartMiddleware, frontendUser.modify)
// 删除用户
router.post('/backend/user/delete', isAdmin, backendUser.userdeletes)
// 恢复用户
router.get('/backend/user/recover', isAdmin, frontendUser.recover)
// ------ 评论 ------
// 删除评论
router.get('/frontend/comment/delete', isAdmin, frontendComment.deletes)
// 恢复评论
router.get('/frontend/comment/recover', isAdmin, frontendComment.recover)
// 评论点赞
router.post('/frontend/comment/zan', isUser, frontendComment.zan)
// 评论取消点赞
router.post('/frontend/comment/unzan', isUser, frontendComment.unzan)
// ================= 前台 =================
// ------ 文章 ------
//关注标签
router.post('/frontend/category/gz', isUser, frontendUser.gzTag)
//取消关注标签
router.post('/frontend/category/ungz', isUser, frontendUser.ungzTag)
// 前台添加文章
router.post('/frontend/article/insert', isUser, frontendArticle.insert)
// 前台关注用户
router.post('/frontend/user/add', isUser, frontendUser.addfriend)
// 前台获取关注列表
router.post('/frontend/user/list', isUser, frontendUser.getGzlist)
// 前台获取被关注列表
router.post('/frontend/user/ulist', isUser, frontendUser.getGzelist)
// 前台获取点赞文章列表
router.post('/frontend/user/zanlist', isUser, frontendUser.getzanlist)
// 前台获取动态列表
router.post('/frontend/user/dnalist', isUser, frontendUser.getDnalist)
// 前台取消关注用户
router.post('/frontend/user/deladd', isUser, frontendUser.delfriend)
// 前台浏览时, 获取文章列表
router.get('/frontend/article/list', frontendArticle.getList)
// 前台浏览时, 增加总浏览数
router.post('/frontend/article/read', frontendArticle.addReadnum)
// 前台浏览时, 获取单篇文章
router.get('/frontend/article/item', frontendArticle.getItem)
// 前台浏览时, 热门文章
router.get('/frontend/trending', frontendArticle.getTrending)
// ------ 评论 ------
// 发布评论
router.post('/frontend/comment/insert', isUser, multipartMiddleware, frontendComment.insert)
// 读取评论列表
router.get('/frontend/comment/list', frontendComment.getList)
// ------ 用户 ------
// 前台注册
router.post('/frontend/user/insert', multipartMiddleware, frontendUser.insert)
// 前台登录
router.post('/frontend/user/login', multipartMiddleware, frontendUser.login)
// 前台获取广告图片
router.post('/frontend/user/adver', multipartMiddleware, frontendUser.getAdver)
// 微信登录
router.post('/frontend/user/wxLogin', multipartMiddleware, frontendUser.wxLogin)
router.post('/frontend/user/jscode2session', multipartMiddleware, frontendUser.jscode2session)
// 前台退出
router.post('/frontend/user/logout', isUser, frontendUser.logout)
// 前台账号读取
router.get('/frontend/user/account', isUser, frontendUser.getItem)
// 前台查询用户信息
router.post('/frontend/user/search', frontendUser.getinfo)
// 前台账号修改
router.post('/frontend/user/account', isUser, multipartMiddleware, frontendUser.modify)
// 前台密码修改
router.post('/frontend/user/password', isUser, multipartMiddleware, frontendUser.password)
// ------ 喜欢 ------
// 喜欢
router.get('/frontend/like', isUser, frontendLike.like)
// 取消喜欢
router.get('/frontend/unlike', isUser, frontendLike.unlike)
// 重置喜欢
router.get('/frontend/reset/like', isUser, frontendLike.resetLike)

/* router.get('/upai/sign', function(req, res) {
    // var upyun = new UPYUN(upaiyun.bucket, upaiyun.username, upaiyun.password, 'v0', 'legacy'),
    const bucket = new UPYUNV2.Service(upaiyun.bucket, upaiyun.username, upaiyun.password)
    const query = url.parse(req.url, true).query
    if(!query["save-key"] || !query["service"]) {
      return util.resJson(res, '参数错误')
    }
    let sign = UPYUNV2.sign.getPolicyAndAuthorization(bucket, query)
    return util.resJson(res, null, sign)
    // util.resJson(res, err, rst)
    // res.json(JSON.stringify(sign))
}) */

router.post('/upload/dataurl',function(req, res) {
  var imgData = req.body.data || '';
  var imgType = req.body.type || '';
  if(imgData === '' && imgType === '') {
    return resJson(res, "参数缺失");
  }

  imgData = imgData.replace('data:' + imgType + ';base64,', '');
  var files = new Buffer(imgData, "base64");
  var upyun = new UPYUN('activity-codoon', 'activity', 'actp0o9i8u7', 'v0', 'legacy'),
    remoteName = '/image/' + sha1(imgData),
    url = "";
  upyun.uploadFile(
    remoteName,
    files,
    imgType,
    true, function(err) {
      url = "https://activity-codoon.b0.upaiyun.com" + remoteName;
      resJson(res, err, url)
    });
});

router.get('/outside-img',[(req,res)=>{
  if(!req.query.url) {
    return util.resJson(res, "参数错误")
  }
  request.get({url: req.query.url, encoding:null}, function (err, response, body) {
    if(err) {
      return util.resJson(res, "获取图片错误" + err)
    }
    console.log(body)
    var type = response.headers["content-type"];
    console.log(type)
    res.writeHead(200,{"Content-Type":type});
    res.write(body);
    res.end();
    })
}])
router.get('*', (req, res) => {
    res.json({
        code: -200,
        message: '没有找到该页面'
    })
})


function resJson (res, err, result) {

    var data = result;
    // 修复userInfo里头像问题
    if (result && result.userInfo && !result.userInfo.portrait && result.userInfo.get_icon_large) {
      data = _.assign(result, {});
      data.userInfo = _.assign(data.userInfo, {portrait: data.userInfo.get_icon_large});
    }
  
    var json = {
      status: true,
      data: data
    };
  
    // 违禁词替换
    var jsonString = JSON.stringify(json);
    json = JSON.parse(jsonString);
  
    if (err) {
      json.status = false;
      if (err.toString() === '[object Object]') {
        json['description'] = JSON.stringify(err);
      } else {
        //这里处理ignore的情况
        if (typeof err === 'string'){
          var errMessage = err.trim();
          var reg = /[：:]/
          var messageArray = errMessage.split(reg);
          if (typeof errMessage === 'string' && messageArray[0] === 'ig') {
            json['description'] = errMessage.substring(3);
          }else{
            json['description'] = err;
          }
        }else{
          // json['description'] = err;
          json['description'] = err.toString();
        }
      }
    }
  
  
    // 打印日志
    /* if (res.CDTranceObject && res.CDTranceObject.id) {
      res.CDTranceObject.end_time = Number(nano.toString());
      if (!res.CDTranceObject.id.trace) {
        res.CDTranceObject.id.trace = (String(new Date().getTime()) + String(Math.floor(Math.random() * 423938)) + String(Math.floor(Math.random() * 423938)));
      }
      // 解决js不能直接输出Int64数值的问题，先输出字符串，然后 JSON.stringify以后再去掉双引号
      var parentReg = new RegExp('"parent":"([\\d]*)"');
      var traceString = JSON.stringify(res.CDTranceObject);
      traceString = traceString.replace(parentReg, '"parent":$1');
  
      console.log(`[CDTrace] ${res.CDTranceObject.id.trace} ${traceString}`);
    } */
  
    res.json(json);
  }
module.exports = router
