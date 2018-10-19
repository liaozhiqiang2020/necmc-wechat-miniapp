const app = getApp()

Page({
  data: {
    balance: 0,
    freeze: 0,
    score: 0,
    score_sign_continuous: 0
  },
  onLoad() {

  },
  onShow() {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo')
    let userMobile = wx.getStorageSync("phoneNumber"); //手机号
    // console.log(userInfo);
    if (!userInfo) {
      wx.navigateTo({
        url: "/pages/authorize/index"
      })
    } else {
      that.setData({
        userInfo: userInfo,
        version: app.globalData.version,
        userMobile: userMobile
      })
    }
    // this.getUserApiInfo();
    // this.getUserAmount();
    // this.checkScoreSign();
  },
  aboutUs: function() {
    wx.showModal({
      title: '北京无限热点科技有限公司',
      content: '公司是集研发、设计、营销、技术于一体的互联网企业，现致力于在共享按摩椅领域开疆扩土，坚持专业化，深耕产业链；坚持“细心，用心，专心，有心，恒心”的五星级服务；让消费者更安心，更舒心；让合作方更放心，更开心；并且在做好，做精共享按摩椅是事业，积极开拓和发展衍生品业务；立志为共享经济的蓬勃前景贡献全部绵薄之力，永续经营；且打造成为共享经济中最专业，最具社会责任感，最强大的企业，让无限热点成为人们共享快乐出行，共享健康生活的一部分',
      showCancel: false
    })
  },
  coupon: function() {
    wx.showModal({
      title: '感谢使用',
      content: '优惠券功能暂未开放，敬请期待后续开发，我们会继续努力哦~',
      showCancel: false
    })
  },
  serviceTelephone: function() {
    wx.makePhoneCall({
      phoneNumber: '4000600917'
    })
  },
  getPhoneNumber: function(e) {
    var that = this;
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showModal({
        title: '提示',
        content: '无法获取手机号码',
        showCancel: false
      })
      return;
    }
    var code = wx.getStorageSync("code");
    var openid = wx.getStorageSync("openid");
    var sessionKey = wx.getStorageSync("sessionKey");
    var userInfo = wx.getStorageSync('userInfo')
    console.log(userInfo);
    // console.log(sessionKey);
    // console.log(e.detail.encryptedData);
    // console.log(e.detail.iv);
    wx.request({
      url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/getUserInfo',
      data: {
        sessionkey: sessionKey,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        openid: openid,
        userInfos: userInfo
      },
      success: function(res) {
        // console.log(res);
        if (res.data.phoneNumber != "") {
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 2000
          });
          that.setData({
            userMobile: res.data.phoneNumber
          })

          // that.getUserApiInfo();
        } else {
          wx.showModal({
            title: '提示',
            content: '绑定失败',
            showCancel: false
          })
        }
      }
    })
  },
  relogin: function() {
    wx.navigateTo({
      url: "/pages/authorize/index"
    })
  },
  recharge: function() {
    wx.showModal({
      title: '感谢使用',
      content: '充值功能暂未开放，敬请期待后续开发，我们会继续努力哦~',
      showCancel: false
    })
  },
  withdraw: function() {
    wx.showModal({
      title: '感谢使用',
      content: '提现功能暂未开放，敬请期待后续开发，我们会继续努力哦~',
      showCancel: false
    })
  }
})