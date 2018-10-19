//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
    latitude: 23.099994,
    longitude: 113.324520,
    checker: 1,
    markers: [{
      id: 1,
      latitude: 23.099994,
      longitude: 113.324520,
      name: 'T.I.T 创意园'
    }],
    onload: function(options) {
      // console.log(options.sn);
      if (options.q !== undefined) {
        var scan_url = decodeURIComponent(options.q);
        alert(scan_url);
      } else {
        // console.log(123);
      }
    },
    covers: [{
      latitude: 23.099994,
      longitude: 113.344520,
      iconPath: '/images/location.png'
    }, {
      latitude: 23.099994,
      longitude: 113.304520,
      iconPath: '/images/location.png'
    }]
  },
  onReady: function(e) {
    this.mapCtx = wx.createMapContext('myMap')
  },
  getCenterLocation: function() {
    this.mapCtx.getCenterLocation({
      success: function(res) {
        // console.log(res.longitude)
        // console.log(res.latitude)
      }
    })
  },
  moveToLocation: function() {
    this.mapCtx.moveToLocation()
  },
  translateMarker: function() {
    this.mapCtx.translateMarker({
      markerId: 1,
      autoRotate: true,
      duration: 1000,
      destination: {
        latitude: 23.10229,
        longitude: 113.3345211,
      },
      animationEnd() {
        // console.log('animation end')
      }
    })
  },
  includePoints: function() {
    this.mapCtx.includePoints({
      padding: [10],
      points: [{
        latitude: 23.10229,
        longitude: 113.3345211,
      }, {
        latitude: 23.00229,
        longitude: 113.3345211,
      }]
    })
  },
  onClickSaoyisao: function(e) {
    var show = this;

    var checker = show.data.checker;
    if (checker == 0) {
      wx.showToast({
        mask: true,
        title: '请同意用户协议后再扫码！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    var show;
    wx.scanCode({
      success: (res) => {
        this.show = "结果:" + res.result + "\n二维码类型:" + res.scanType + "\n字符集:" + res.charSet + "\n路径:" + res.path;

        var userInfo = wx.getStorageSync('userInfo');
        var openId = wx.getStorageSync('openId');

        wx.showToast({
          mask: true,
          title: '成功',
          icon: 'success',
          duration: 2000
        });

        var scan_url = res.result;
        var chairId = scan_url.substring(scan_url.length - 8, scan_url.length);
        // console.log(scan_url);
        // console.log(chairId);

        //跳转到强度选择页面
        wx.navigateTo({
          url: "/pages/choose-time/index?QRcode=" + chairId
        })
      },
      fail: (res) => {

      },
      complete: (res) => {}
    })

  },
  regionchange(e) {
    // console.log(e.type)
  },
  markertap(e) {
    // console.log(e.markerId)
  },
  controltap(e) {
    // console.log(e.controlId)
  },
  onClickContract: function(e) { //用户协议
    var that = this;

    wx.navigateTo({
      url: "/pages/user-service/index"
    })
  },
  radioCancel: function(e) { //取消同意用户协议
    if (e.detail.value == "") {
      this.setData({
        checker: 0
      })
    } else {
      this.setData({
        checker: 1
      })
    }
  }
})