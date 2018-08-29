//app.js
App({
  onLaunch: function () {
    var that = this;   

    wx.getUserInfo({
      lang: "zh_CN",
      success: function (res) {
        var userInfo = res.userInfo
        wx.setStorageSync('userInfo', userInfo);
      }
    }) 

    wx.login({
      success: function (res) {
        var service_url = 'https://sv-wechat-dev.natapp4.cc/mc/weixin/';
        wx.setStorageSync("code", res.code);//将获取的code存到缓存中
        // console.log(res.code);
        wx.request({
          url: service_url + 'login?code=' + res.code,
          data: {},
          method: 'GET',
          success: function (res) {
            if (res.data != null && res.data != undefined && res.data != '') {
              wx.setStorageSync("openid", res.data.openid);//将获取的openid存到缓存中(用户唯一id信息)
              
              wx.request({
                url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/findWxUserInfoByOpenId?openId=' + res.data.openid,
                method: 'GET',
                success:function(rest){
                  console.log(rest);
                  if(rest.data==""){
                    that.goLoginPageTimeOut(res.data.openid)
                      return
                  }
                }
              })

              wx.setStorageSync("sessionKey", res.data.sessionKey);
              // console.log(res.data.sessionKey);
              if (res.data.phoneNumber != null && res.data.phoneNumber != undefined && res.data.phoneNumber != '') {
                wx.setStorageSync("phoneNumber", res.data.phoneNumber);//手机号
              }
            }
          }
        });
      }
    });
  },
  sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString){
    var that = this;
  },
  sendTempleMsgImmediately: function (template_id, form_id, page, postJsonString) {
    var that = this;
  },  
  goLoginPageTimeOut: function (openId) {
    setTimeout(function(){
      wx.navigateTo({
        url: "/pages/authorize/index?openId=" + openId
      })
    }, 1000)    
  },
  globalData:{
    userInfo:null,
    subDomain: "tz", // 如果你的域名是： https://api.it120.cc/abcd 那么这里只要填写 abcd
    version: "2.0",
    shareProfile: '百款精品商品，总有一款适合您' // 首页转发的时候话术
  }
  /*
  根据自己需要修改下单时候的模板消息内容设置，可增加关闭订单、收货时候模板消息提醒；
  1、/pages/to-pay-order/index.js 中已添加关闭订单、商家发货后提醒消费者；
  2、/pages/order-details/index.js 中已添加用户确认收货后提供用户参与评价；评价后提醒消费者好评奖励积分已到账；
  3、请自行修改上面几处的模板消息ID，参数为您自己的变量设置即可。  
   */
})
