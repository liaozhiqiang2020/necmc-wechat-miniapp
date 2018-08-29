var wxpay = require('../../utils/pay.js')
var time = require('../../utils/util2.js');
var app = getApp()
Page({
  data:{
    cancelResource:"",
    orderId:"",
    hiddenmodalput: true,//可以通过hidden是否掩藏弹出框的属性，来指定那个弹出框
    statusType: ["待付款", "服务中", "已完成","已取消"],
    currentType:0,
    tabClass: ["", "", "",""]
  },
  statusTap:function(e){
     var curType =  e.currentTarget.dataset.index;
     this.data.currentType = curType;
     this.setData({
       currentType:curType
     });
     this.onShow();
  },
  orderDetail : function (e) {
    var orderId = e.currentTarget.dataset.id;
    var status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId + "&status=" + status
    })
  },
  cancelOrderTap:function(e){//取消订单
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    // console.log(orderId);

    this.setData({
      orderId: orderId,
      hiddenmodalput: !this.data.hiddenmodalput
    })
  },
  toTimerDetail:function(e){//查询服务中的订单
      var that = this;
      var orderId = e.currentTarget.dataset.id;
      // var strength = e.currentTarget.dataset.strength;

      //跳转到计时页面
      wx.navigateTo({
        url: "/pages/timer/index?orderId=" + orderId + "&strength=1"
      });
  },
  toPayTap:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    var mcTime = e.currentTarget.dataset.time;
    var strength=1;

    //跳转到付款页面
    wx.navigateTo({
      url: "/pages/to-pay-order/index?paidOrderId=" + orderId + "&time=" + mcTime + "&money=" + money + "&strength=1"
    });
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
   
  },
  onReady:function(){
    // 生命周期函数--监听页面初次渲染完成
 
  },
  onShow:function(){  //tab页加载
    // 获取订单列表
    wx.showLoading();
    var that = this;
    var page = that.data.currentType;
    var url = "https://sv-wechat-dev.natapp4.cc/mc/weixin/findPaidOrderList";

    var data;
    var openid = wx.getStorageSync("openid");
    if (page==0){  //代付款
      data = {
        openCode: openid,
        state:0
      }
    }else if(page==1){  //服务中
      data = {
        openCode: openid,
        state:1
      }
    }else if (page==2){  //已完成
      data = {
        openCode: openid,
        state: 2
      }
    } else if (page == 3) {  //已取消
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
        if (res.data!=""){//如果有数据就显示
          for (var i = 0; i < res.data.length; i++) {
            var createDateTime = res.data[i].createDateTime.time;
            res.data[i].createDateTime = time.formatTime(createDateTime, 'Y/M/D h:m:s')
            that.setData({
              orderList: res.data,
              page: page
            });
          }   
        }else{//没有数据不显示
          that.setData({
            orderList: ""
          });
        } 
      }
    })
    
  },
  onHide:function(){
    // 生命周期函数--监听页面隐藏
 
  },
  onUnload:function(){
    // 生命周期函数--监听页面卸载
 
  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作
   
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
  
  },
  //取消按钮
  cancel: function (e) {
    this.setData({
      hiddenmodalput: true
    });
  },
  //确认
  confirm: function (e) {
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
  bindinput: function (e) {
    this.setData({
      cancelResource: e.detail.value
    });
  }
 
})
