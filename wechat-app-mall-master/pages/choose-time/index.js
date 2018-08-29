//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
   
  },
  onLoad: function (options) {
    wx.showLoading();
    var that = this;
    
    console.log(options);
    if (options.q !== undefined) {
      var scan_url = decodeURIComponent(options.q);
      var chairId = scan_url.substring(scan_url.length - 8, scan_url.length);
      
      //发送查询设备状态指令
      wx.request({
        url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/sendFindChairStatus',
        data: {
          chairId: chairId
        },
        success: (res) => {
          console.log("发送查询设备状态指令成功");
        }
      })
    } else {
      var chairId = options.QRcode;

      //发送查询设备状态指令
      wx.request({
        url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/sendFindChairStatus',
        data: {
          chairId: chairId
        },
        success: (res) => {
          console.log("发送查询设备状态指令成功");
        },
        error:function(res){
            console.log(res);
        }
      })

      console.log(999);
    }

    this.setData({
      chairId: chairId
    })

    //查询价格列表
    wx.request({
      url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/devicePrice',
      data: {
        deviceCode: chairId
      },
      success: (res) => {
        console.log(res);
        wx.hideLoading();
        that.setData({
          priceList: res.data
        });
      }
    })
  },
  formSubmit: function (e) {
    var that = this;

    var money_time = e.currentTarget.dataset.value;
    var money = money_time.split("_")[1];
    var time = money_time.split("_")[0];

    var openid = wx.getStorageSync("openid");//用户唯一id
    var chairCode = this.data.chairId;//设备code

    //查询服务中订单
    wx.request({
      url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/findPaidOrderList',
      data: {
        openCode: openid,
        state: 1
      },
      success: function (res) {    
        if (res.data != "") {
          var orderId = res.data[0].id;
          wx.showToast({
            title: '已有服务中订单！',
            icon: 'none',
            duration: 2000,
            complete: (res) => {
              //跳转到计时页面
              wx.navigateTo({
                url: "/pages/timer/index?orderId=" + orderId + "&strength=1"
              });
            }
          });
        }else{
          //查询设备状态
          wx.request({
            url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/findChairStatus',
            data: {
              chairId: chairCode
            },
            success: (res) => {
              console.log("设备状态：");
              if(res.data==4){//未响应
                // wx.showToast({
                //   title: '座椅故障请更换座椅扫码按摩',
                //   icon: 'none',
                //   duration: 20,
                //   complete: function (res) {
                //     console.log(888);
                //     //跳转到首页
                //     wx.switchTab({
                //       url: '/pages/index/index'
                //     });
                //   }
                // });
                wx.showModal({
                  title: '座椅故障请更换座椅扫码按摩',
                  showCancel:true,
                  cancelText:"重试一次",
                  cancelColor:"skyblue",
                  confirmText: "返回首页",//默认是“确定”
                  confirmColor: '#642B8D',//确定文字的颜色
                  success: function (res) {
                    if (res.cancel) {
                      //点击取消,默认隐藏弹框
                    } else {//点击确定   
                      //跳转到首页
                      wx.switchTab({
                        url: '/pages/index/index'
                      });
                    }
                  },
                  fail: function (res) { },//接口调用失败的回调函数
                  complete: function (res) { },//接口调用结束的回调函数（调用成功、失败都会执行）
                })  
              }else if(res.data==2){//运行中
                wx.showModal({
                  title: '按摩椅正在运行中请您更换座椅扫码按摩',
                  confirmText: "返回首页",//默认是“确定”
                  confirmColor: 'skyblue',//确定文字的颜色
                  success: function (res) {
                    if (res.cancel) {
                      //点击取消,默认隐藏弹框
                    } else {//点击确定   
                      //跳转到首页
                      wx.switchTab({
                        url: '/pages/index/index'
                      });
                    }
                  },
                  fail: function (res) { },//接口调用失败的回调函数
                  complete: function (res) { },//接口调用结束的回调函数（调用成功、失败都会执行）
                }) 
              }else if(res.data==1){//空闲中
                wx.showToast({
                  title: '支付中......',
                  icon: 'loading',
                  success: function (res) {
                    //创建未支付订单
                    wx.request({
                      url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/createPaidOrder',
                      data: {
                        openid: openid,
                        state: 0,
                        deviceCode: chairCode,
                        promoCode: "",
                        money: money,
                        mcTime: time,
                        strength: 1
                      },
                      success: (res) => {
                        that.toPayOrder(time, res.data, money, chairCode); //发起微信支付
                      }
                    })
                  }
                })             
              }
            }
          })   
        }
      }
    })  
  },
  formReset: function () {
    // console.log('form发生了reset事件')
  },
  toPayOrder(time, paidOrderId, money, chairCode) {
    var that = this;
    var mcTime = time;  //按摩时间
    var money = money;  //订单金额
    var paidOrderId = paidOrderId;  //已支付订单code 
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
        } else {        
          wx.request({
            url: service_url + 'wxPay?openid=' + openid + "&paidOrderId=" + paidOrderId + "&money=" + money,
            data: {},
            method: 'GET',
            success: function (res1) {
              that.doWxPay(res1.data, paidOrderId, mcTime, chairCode);//调用微信支付接口
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
  doWxPay(param, paidOrderId, mcTime, chairCode) {
    //小程序发起微信支付
    wx.requestPayment({
      timeStamp: param.data.timeStamp,//记住，这边的timeStamp一定要是字符串类型的，不然会报错，我这边在java后端包装成了字符串类型了
      nonceStr: param.data.nonceStr,
      package: param.data.package,
      signType: 'MD5',
      paySign: param.data.paySign,
      success: function (res) {
        wx.showToast({  
          title: '支付成功',
          icon: 'success',
          duration: 2000
        });  

        if (res.errMsg == "requestPayment:ok") {  // 调用支付成功
          wx.showToast({
            title: '启动中......',
            icon: 'loading',
            duration: 30000,
            success:function(res){
              //发送开启按摩椅指令
              wx.request({
                url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/sendStartChairMsg',
                data: {
                  chairId: chairCode,
                  mcTime: mcTime
                },
                success: function () {
                  var timeout = setInterval(function () {
                    //查询设备是否开启成功
                    wx.request({
                      url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/findChairRuning',
                      data: {
                        chairId: chairCode,
                        mcTime: mcTime
                      },
                      success: function (res) {
                        console.log(res.data);
                        if (res.data == 1) {
                          clearInterval(timeout);
                          wx.hideToast();
                          //修改订单信息
                          wx.request({
                            url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/updateOrderDetail',
                            data: {
                              orderId: paidOrderId,
                              state: 1,
                              mcTime: mcTime
                            },
                            success: function (res) {
                              //跳转到计时页面
                              wx.navigateTo({
                                url: "/pages/timer/index?orderId=" + paidOrderId + "&strength=1"
                              });
                            }
                          })
                        }
                      }
                    })
                  }, 500);   
                }
              })
            }
          })

          

        } else if (res.errMsg == 'requestPayment:cancel') {
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
  },
  onClickContract: function (e) {//用户协议
    var that = this;

    wx.navigateTo({
      url: "/pages/user-service/index"
    })
  },
})
