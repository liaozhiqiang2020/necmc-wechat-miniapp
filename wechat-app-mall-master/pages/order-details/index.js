var time = require('../../utils/util2.js');
var app = getApp();
Page({
  data: {
    orderId: 0,
    goodsList: [],
    yunPrice: "0.00"
  },
  onLoad: function(e) {
    var orderId = e.id;
    var status = e.status;
    this.data.orderId = orderId;
    this.setData({
      orderId: orderId,
      status: status
    });
  },
  onShow: function() {
    var that = this;
    var orderId = that.data.orderId;
    var status = that.data.status;
    var url = "https://sv-wechat-dev.natapp4.cc/mc/weixin/findPaidOrderById";
    if (status == 0) { //未支付
      status = "待付款订单";
    } else if (status == 1) { //已支付(服务中)
      status = "服务中订单";
    } else if (status == 2) { //已支付(已完成)
      status = "已完成订单";
    } else if (status == 3) { //已取消
      status = "已取消订单";
    }

    wx.request({
      url: url,
      data: {
        orderId: orderId
      },
      success: (res) => {
        // console.log(res.data.createDateTime.time);
        wx.hideLoading();
        if (res.data != "") { //如果有数据就显示
          var createDateTime = res.data.createDateTime.time;
          res.data.createDateTime = time.formatTime(createDateTime, 'Y/M/D h:m:s');
          if (res.data.payDateTime != null) {
            var payDateTime = res.data.payDateTime.time;
            res.data.payDateTime = time.formatTime(payDateTime, 'Y/M/D h:m:s');
          } else {
            res.data.payDateTime = "";
          }
          that.setData({
            orderDetail: res.data
          });
        } else { //没有数据不显示
          that.setData({
            orderDetail: ""
          });
        }
      }
    })
  }
})