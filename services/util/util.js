const crypto = require('crypto')
const language = {
    zhcn:require("../locales/zh-cn.json"),
    enus:require("../locales/en-us.json"),
    zhhk:require("../locales/zh-hk.json")
}

var mOpbeat = null

var getWords = function(acceptLanguage, key){
    acceptLanguage = acceptLanguage || ""
    let lang = acceptLanguage.split(";")[0]
    let keys = key.split(".")

    let obj = language[lang]
    if(!obj){
        obj = language["zhcn"]
    }

    let value = obj
    keys.forEach((k) => {
      value = value[k] || ""
    })

    return value
}

module.exports = {
    jsonResponse:function(request, data, code, msg){
        return {
            code:code || "0",
            data:data?data:undefined,
            msg:msg || (code ? getWords(request["accept-language"], "system_busy") : "")
        }
    },

    //预处理
    preProcess:async function(ctx, next){
        await next()
        if(!(ctx.status === 200 || ctx.status === 404)){
            return false
        }
        return true
    },

    getWords:getWords,

    cipher:function(algorithm, key, buf){
        var encrypted = "";
        var cip = crypto.createCipher(algorithm, key);
        encrypted += cip.update(buf, "binary", "hex");
        encrypted += cip.final("hex");
        return encrypted
    },
    
    //解密
    decipher:function(algorithm, key, encrypted){
        var decrypted = "";
        var decipher = crypto.createDecipher(algorithm, key);
        decrypted += decipher.update(encrypted, "hex", "binary");
        decrypted += decipher.final("binary");
        return decrypted
    },

    getTimeText: function(localTimestamp, timezone, precision="second"){
        const time = new Date(localTimestamp)
        //默认东八区
        timezone = timezone*1 || 8
        let localOffset = time.getTimezoneOffset()*60000,
            utc = localTimestamp + localOffset
        let destTime = new Date(utc + (3600000*timezone))
        var timeText = ""
        switch(precision){
            case "second":
                timeText = (destTime.getSeconds()>9?destTime.getSeconds():"0"+destTime.getSeconds())
            case "minute":
                if(precision !== "minute"){
                    timeText = ":" + timeText
                }
                timeText = (destTime.getMinutes()>9?destTime.getMinutes():"0"+destTime.getMinutes()) + timeText
            case "hour":
                if(precision !== "hour"){
                    timeText = ":" + timeText
                }
                timeText = (destTime.getHours()>9?destTime.getHours():"0"+destTime.getHours()) + timeText
            case "day":
                if(precision !== "day"){
                    timeText = " " + timeText
                }
                timeText = (destTime.getDate()>9?destTime.getDate():"0"+destTime.getDate()) + timeText
            case "month":
                if(precision !== "month"){
                    timeText = "-" + timeText
                }
                timeText = ((destTime.getMonth()+1)>9?(destTime.getMonth()+1):"0"+(destTime.getMonth()+1)) + timeText
            case "year":
                if(precision !== "year"){
                    timeText = "-" + timeText
                }
                timeText = destTime.getFullYear() + timeText
                break
            default:
                break
        }
        return timeText
    }
}