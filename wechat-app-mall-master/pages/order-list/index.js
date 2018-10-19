var wxpay = require('../../utils/pay.js')
var time = require('../../utils/util2.js');
const util = require('../../utils/function1.js')
var app = getApp()
Page({
  data: {
    cancelResource: "",
    orderId: "",
    hiddenmodalput: true, //可以通过hidden是否掩藏弹出框的属性，来指定那个弹出框
    statusType: ["待付款", "服务中", "已完成", "已取消"],
    currentType: 0,
    tabClass: ["", "", "", ""]
  },
  statusTap: function(e) {
    var curType = e.currentTarget.dataset.index;
    this.data.currentType = curType;
    this.setData({
      currentType: curType
    });
    this.onShow();
  },
  orderDetail: function(e) {
    var orderId = e.currentTarget.dataset.id;
    var status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId + "&status=" + status
    })
  },
  cancelOrderTap: function(e) { //取消订单
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    // console.log(orderId);

    this.setData({
      orderId: orderId,
      hiddenmodalput: !this.data.hiddenmodalput
    })
  },
  toTimerDetail: function(e) { //查询服务中的订单
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    // var strength = e.currentTarget.dataset.strength;

    //跳转到计时页面
    wx.navigateTo({
      url: "/pages/timer/index?orderId=" + orderId + "&strength=1"
    });
  },
  onLoad: function(options) {
    // 生命周期函数--监听页面加载

  },
  onReady: function() {
    // 生命周期函数--监听页面初次渲染完成

  },
  onShow: function() { //tab页加载
    // 获取订单列表
    wx.showLoading();
    var that = this;
    var page = that.data.currentType;
    var url = "https://sv-wechat-dev.natapp4.cc/mc/weixin/findPaidOrderList";

    var data;
    var openid = wx.getStorageSync("openid");
    if (page == 0) { //代付款
      data = {
        openCode: openid,
        state: 0
      }
    } else if (page == 1) { //服务中
      data = {
        openCode: openid,
        state: 1
      }
    } else if (page == 2) { //已完成
      data = {
        openCode: openid,
        state: 2
      }
    } else if (page == 3) { //已取消
      data = {
        openCode: openid,
        state: 3
      }
    }

    wx.request({
      url: url,
      data: data,
      success: (res) => {
        wx.hideLoading();
        if (res.data != "") { //如果有数据就显示
          for (var i = 0; i < res.data.length; i++) {
            var createDateTime = res.data[i].createDateTime.time;
            res.data[i].createDateTime = time.formatTime(createDateTime, 'Y/M/D h:m:s')
            that.setData({
              orderList: res.data,
              page: page
            });
          }
        } else { //没有数据不显示
          that.setData({
            orderList: ""
          });
        }
      }
    })

  },
  onHide: function() {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function() {
    // 生命周期函数--监听页面卸载

  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作

  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数

  },
  //取消按钮
  cancel: function(e) {
    this.setData({
      hiddenmodalput: true
    });
  },
  //确认
  confirm: function(e) {
    var orderId = this.data.orderId;
    console.log(orderId);
    var cancelResource = this.data.cancelResource;
    console.log(cancelResource);

    wx.request({
      url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/updatePaidOrderById',
      data: {
        orderId: orderId,
        state: 3,
        description: cancelResource
      },
      success: (res) => {
        this.setData({
          hiddenmodalput: true
        })
        wx.hideLoading();
        this.onShow();
      }
    })


  },
  bindinput: function(e) {
    this.setData({
      cancelResource: e.detail.value
    });
  },
  serviceTelephone: function() {
    wx.makePhoneCall({
      phoneNumber: '4000600917'
    })
  },
  toPayTap: util.throttle(function(e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    var mcTime = e.currentTarget.dataset.time;
    var deviceId = e.currentTarget.dataset.deviceId;
    var openid = wx.getStorageSync("openid");
    var promoCode = "dsadsafas"; //优惠码编号

    var service_url = 'https://sv-wechat-dev.natapp4.cc/mc/weixin/';
    // var strength=1;

    // 获取按摩椅编号
    wx.request({
      url: service_url + 'getChairIdByOrderId',
      data: {
        orderId: orderId
      },
      success: function(res) {
        console.log(res.data);
        if (res.data != "") {
          var chairCode = res.data

          // //查询服务中订单
          wx.request({
            url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/findPaidOrderList',
            data: {
              openCode: openid,
              state: 1,
              mcTime: mcTime
            },
            success: function(res2) {
              if (res2.data != "") {
                wx.showToast({
                  title: '已有服务中订单！',
                  icon: 'none',
                  duration: 200,
                  complete: function(res) {
                    console.log(888);
                  }
                });
              } else {
                wx.request({
                  url: service_url + 'wxPay?openid=' + openid + "&paidOrderId=" + orderId + "&money=" + money,
                  data: {},
                  method: 'GET',
                  success: function(res1) {
                    that.doWxPay(res1.data, orderId, mcTime, chairCode); //调用微信支付接口
                  },
                  fail: function(res) {
                    console.log("支付失败1")
                    console.log(error)
                  }
                });
              }
            }
          })

        }
      }
    })

    // //跳转到付款页面
    // wx.navigateTo({
    //   url: "/pages/to-pay-order/index?paidOrderId=" + orderId + "&time=" + mcTime + "&money=" + money + "&strength=1"
    // });
  }, 1500),
  doWxPay(param, paidOrderId, mcTime, chairCode) {
    //小程序发起微信支付
    wx.requestPayment({
      timeStamp: param.data.timeStamp, //记住，这边的timeStamp一定要是字符串类型的，不然会报错，我这边在java后端包装成了字符串类型了
      nonceStr: param.data.nonceStr,
      package: param.data.package,
      signType: 'MD5',
      paySign: param.data.paySign,
      success: function(res) {
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000
        });

        if (res.errMsg == "requestPayment:ok") { // 调用支付成功
          wx.showToast({
            title: '启动中......',
            icon: 'loading',
            duration: 30000,
            success: function(res) {
              //发送开启按摩椅指令
              wx.request({
                url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/sendStartChairMsg',
                data: {
                  chairId: chairCode,
                  mcTime: mcTime
                },
                success: function() {
                  var timeout = setInterval(function() {
                    //查询设备是否开启成功
                    wx.request({
                      url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/findChairRuning',
                      data: {
                        chairId: chairCode,
                        mcTime: mcTime
                      },
                      success: function(res) {
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
                            success: function(res) {
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

        }
      },
      fail: function(error) {
        console.log("支付失败2")
        console.log(error)

        wx.showToast({
          title: '您已取消支付，请重新扫码！',
          icon: 'none',
          duration: 500,
          success: function(res) {
            //跳转到首页
            wx.switchTab({
              url: '/pages/index/index'
            });
            wx.hideToast();
          }
        })

        // wx.showModal({
        //   title: '您已取消支付，请重新扫码！',
        //   showCancel:false,
        //   confirmText: "确定",//默认是“确定”
        //   confirmColor: '#642B8D',//确定文字的颜色
        //   success: function (res) {
        //     if (res.cancel) {
        //       //点击取消,默认隐藏弹框
        //     } else {//点击确定   
        //       //跳转到首页
        //       wx.switchTab({
        //         url: '/pages/index/index'
        //       });
        //     }
        //   },
        //   fail: function (res) { },//接口调用失败的回调函数
        //   complete: function (res) { },//接口调用结束的回调函数（调用成功、失败都会执行）
        // }) 
      },
      complete: function() {
        // complete   
        console.log("pay complete")
      }
    });
  },

})