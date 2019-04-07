
var resJson = function(res, err, result) {

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