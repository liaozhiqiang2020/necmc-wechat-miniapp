// pages/authorize/index.js
const WXBizDataCrypt = require('../../utils/WXBizDataCrypt.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var openId = options.openId;
    this.setData({
      openId: openId
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  bindGetUserInfo: function (e) {
    if (!e.detail.userInfo){
      return;
    }


    wx.setStorageSync('userInfo', e.detail.userInfo)
    this.login();
  },
  getUserInfo: function (e) {//获取用户信息
    wx.getUserInfo({
      lang: "zh_CN",
      success: function (res) {
        var userInfo = res.userInfo
        wx.setStorageSync('userInfo', userInfo);
      }
    })
    
    this.login();

    var openId = this.data.openId;
    var userInfos = wx.getStorageSync('userInfo');
    wx.request({
      url: 'https://www.infhp.cn/mc/weixin/saveUserInfo',
      data: {
        openId: openId,
        userInfo: userInfos
      },
      method: 'GET',
      success: function (rest) {
        console.log("success");
      }
    })
  },
  login: function () {
    wx.login({
      success: function (res) {
        var service_url = 'https://www.infhp.cn/mc/weixin/';
        wx.setStorageSync("code", res.code);//将获取的code存到缓存中
        wx.request({
          url: service_url + 'login?code=' + res.code,
          data: {},
          method: 'GET',
          success: function (res) {
            if (res.data != null && res.data != undefined && res.data != '') {
              wx.setStorageSync("openid", res.data.openid);//将获取的openid存到缓存中(用户唯一id信息)
              wx.setStorageSync("sessionKey", res.data.sessionKey);
              if (res.data.phoneNumber != null && res.data.phoneNumber != undefined && res.data.phoneNumber != ''){
                 wx.setStorageSync("phoneNumber", res.data.phoneNumber);//手机号
              }            

              wx.navigateBack();
            }
          }
        });
      }
    });
  }
})