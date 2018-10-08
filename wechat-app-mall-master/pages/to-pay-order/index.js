// pages/pay/pay.js
var app = getApp();

Page({
	/**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      money: options.money,
      time:options.time,
      paidOrderId: options.paidOrderId
      // // chairCode: options.chairCode,
      // strength: options.strength
    })
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    this.setData({
      timeStamp: timestamp
    })
  },

  formSubmit: function (event) {
    var that = this;
    var mcTime = that.data.time;  //按摩时间
    // var timeStamp = that.data.timeStamp;
    var money = that.data.money;  //订单金额
    var paidOrderId = that.data.paidOrderId;  //已支付订单code 
    var openid = wx.getStorageSync("openid");
    // var deviceCode = that.data.chairCode; //按摩椅编号
    var promoCode = "dsadsafas";   //优惠码编号
    // var strength = that.data.strength; //按摩椅强度
    // console.log(openid);
    var service_url = 'https://sv-wechat-dev.natapp4.cc/mc/weixin/';

    console.log(paidOrderId);
    // //查询服务中订单
        wx.request({
          url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/findPaidOrderList',
          data: {
            openCode: openid,
            state: 1,
            mcTime: mcTime
          },
          success: function (res) {
            if (res.data != "") {
              wx.showToast({
                title: '已有服务中订单！',
                icon: 'none',
                duration: 200,
                complete: function (res) {
                  console.log(888);
                  //跳转到订单页
                  wx.switchTab({
                    url: "/pages/order-list/index"
                  });
                }
              });
            }else{
              wx.request({
                url: service_url + 'wxPay?openid=' + openid + "&paidOrderId=" + paidOrderId + "&money=" + money,
                data: {},
                method: 'GET',
                success: function (res1) {
                  console.log(res1.data);
                  that.doWxPay(res1.data, paidOrderId, mcTime);
                },
                fail: function (res) {
                  console.log("支付失败")
                  console.log(error)
                }
              });
            }
          }
        })


    
  },

  doWxPay(param, paidOrderId, mcTime) {
    //小程序发起微信支付
    wx.requestPayment({
      timeStamp: param.data.timeStamp,//记住，这边的timeStamp一定要是字符串类型的，不然会报错，我这边在java后端包装成了字符串类型了
      nonceStr: param.data.nonceStr,
      package: param.data.package,
      signType: 'MD5',
      paySign: param.data.paySign,
      success: function (res) {
        // success   
        console.log(res);

        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000
        });

        if(res.errMsg == "requestPayment:ok"){  // 调用支付成功
          //修改订单信息
          wx.request({
            url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/updateOrderDetail',
            data: {
              orderId: paidOrderId,
              state: 1,
              mcTime: mcTime
            },
            success: function (res) {
              //查询设备code
              wx.request({
                url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/getMcCode',
                data: {
                  orderId: paidOrderId
                },
                success: function (res) {
                  //发送开启按摩椅指令
                  wx.request({
                    url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/sendStartChairMsg',
                    data: {
                      chairId: res.data.chairId,
                      mcTime: mcTime
                    },
                    success: function () {
                      //跳转到计时页面
                      wx.navigateTo({
                        url: "/pages/timer/index?orderId=" + paidOrderId + "&strength=1"
                      });
                    }
                  });
                }
              })
            }
          })
          
        }else if(res.errMsg == 'requestPayment:cancel'){
        　　　　　　// 用户取消支付的操作
        } 
      },
      fail: function (error) {
        // fail   
        console.log("支付失败")
        console.log(error)
      },
      complete: function () {
        // complete   
        console.log("pay complete")
      }
    });
  }




  
})