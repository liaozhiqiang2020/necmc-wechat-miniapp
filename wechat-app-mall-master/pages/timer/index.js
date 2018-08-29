const util = require('../../utils/utilTimer.js')
const defaultLogName = {
  work: '按摩',
  rest: '暂停'
}
const actionName = {
  stop: '停止',
  start: '开始'
}

const initDeg = {
  left: 45,
  right: -45,
}

Page({
  data: {
    remainTimeText: '',
    timerType: 'work',
    log: {},
    completed: false,
    isRuning: false,
    leftDeg: initDeg.left,
    rightDeg: initDeg.right
  },
  onLoad:function(options){
    console.log(options.strength);
    this.setData({
      orderId: options.orderId,
      strength: options.strength
    })
  },
  onShow: function () {
    var that=this;
    if (this.data.isRuning) return
    var orderId = this.data.orderId;//订单Id
    if (orderId != undefined){
      var openid = wx.getStorageSync("openid");
      //查询设备code
      wx.request({
        url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/getMcCode',
        data: {
          orderId: orderId
        },
        success: function (res) {
          // console.log(res.data);
          that.setData({
            chairId: res.data.chairId
          })
        }
      })

      //查询剩余时间
      wx.request({
        url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/getMcRemainingTime',
        data: {
          orderId: orderId
        },
        success: function (res) {
          var workTime =res.data;   //获取剩余秒数
          let M = Math.floor(workTime/60);
          let S = Math.floor(workTime%60*60/60);

          that.setData({
            workTime: workTime,
            remainTimeText: (M ? M : '00') + ":" + S
          })

          that.startTimer();
        }
      })
    }
  },

  startTimer: function (e) {
    let startTime = Date.now()
    let isRuning = this.data.isRuning
    let timerType = 'work';
    let showTime = this.data[timerType + 'Time']
    
    let keepTime = showTime * 1000
    let logName = this.logName || defaultLogName[timerType]

    if (!isRuning) {
      this.timer = setInterval((function () {
        this.updateTimer()
        this.startNameAnimation()
      }).bind(this), 1000)
    } else {
      this.stopTimer()
    }

    let M = Math.floor(showTime / 60);
    let S = Math.floor(showTime % 60 * 60/60);

    this.setData({
      isRuning: !isRuning,
      completed: false,
      timerType: timerType,
      remainTimeText: (M ? M : '00') +":" + S,
      taskName: logName
    })

    this.data.log = {
      name: logName,
      startTime: Date.now(),
      keepTime: keepTime,
      endTime: keepTime + startTime,
      action: actionName[isRuning ? 'stop' : 'start'],
      type: timerType
    }
  },
  stopTimer: function () {
    // reset circle progress
    this.setData({
      leftDeg: initDeg.left,
      rightDeg: initDeg.right
    })

    var orderId = this.data.orderId;//订单Id

    var chairId = this.data.chairId;//按摩椅Id
    wx.request({
      url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/sendEndChairMsg',
      data: {
        chairId: chairId
      },
      success: function () {
        console.log("停止");
      }
    });

    //修改订单状态
    wx.request({
      url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/updatePaidOrderById',
      data: {
        orderId: orderId,
        state:2
      },
      success: (res) => {
        console.log("timer-index：修改订单状态成功");
      }
    })

    // clear timer
    this.timer && clearInterval(this.timer)
  },

  startNameAnimation: function () {
    let animation = wx.createAnimation({
      duration: 450
    })
    animation.opacity(0.2).step()
    animation.opacity(1).step()
    this.setData({
      nameAnimation: animation.export()
    })
  },

  stopCm: function (e) {//暂停按摩椅
    var chairId = this.data.chairId;//按摩椅Id
    let isRuning = this.data.isRuning;
    var mcStatus = this.data.mcStatus;
    var complate = this.data.completed;
    if (complate){
      wx.showModal({
          title: '按摩时间已到！',
          showCancel: false,
          success:function(res){
            wx.switchTab({
              url: "/pages/index/index"
            })
          }
      })
    }else{
      this.setData({
        taskName: "暂停"
      })

      wx.request({
        url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/sendEndChairMsg',
        data: {
          chairId: chairId
        },
        success: function () {
          console.log("已停止");
        }
      });

    }  
  },
  openCm:function(e){//启动按摩椅
    var chairId = this.data.chairId;//按摩椅Id
    let isRuning = this.data.isRuning
    var complate = this.data.completed;
    if (complate) {
      wx.showModal({
        title: '按摩时间已到！',
        showCancel: false,
        success: function (res) {
          wx.switchTab({
            url: "/pages/index/index"
          })
        }
      })
    } else {
      this.setData({
        taskName: "按摩"
      })

      wx.request({
        url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/sendStartChairMsg',
        data: {
          chairId: chairId,
          mcTime: 60
        },
        success: function () {
          console.log("已启动");
        }
      });
    }    
  },
  beginCm: function (e) {//继续按摩椅
    var chairId = this.data.chairId;//按摩椅Id
    let isRuning = this.data.isRuning
    var complate = this.data.completed;
    if (complate) {
      wx.showModal({
        title: '按摩时间已到！',
        showCancel: false,
        success: function (res) {
          wx.switchTab({
            url: "/pages/index/index"
          })
        }
      })
    } else {
      this.setData({
        taskName: "按摩"
      })

      wx.request({
        url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/sendContinueChairMsg',
        data: {
          chairId: chairId,
          continueType:1
        },
        success: function () {
          console.log("已继续");
        }
      });
    }
  },
  endCm: function (e) {//暂停按摩椅
    var chairId = this.data.chairId;//按摩椅Id
    let isRuning = this.data.isRuning
    var complate = this.data.completed;
    if (complate) {
      wx.showModal({
        title: '按摩时间已到！',
        showCancel: false,
        success: function (res) {
          wx.switchTab({
            url: "/pages/index/index"
          })
        }
      })
    } else {
      this.setData({
        taskName: "按摩"
      })

      wx.request({
        url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/sendContinueChairMsg',
        data: {
          chairId: chairId,
          continueType: 0
        },
        success: function () {
          console.log("已暂停");
        }
      });
    }
  },
  updateTimer: function () {
    let log = this.data.log
    let now = Date.now()
    let remainingTime = Math.round((log.endTime - now) / 1000)
    let M = util.formatTime(Math.floor(remainingTime / (60)) % 60, 'MM')
    let S = util.formatTime(Math.floor(remainingTime) % 60, 'SS')
    let halfTime

    if (remainingTime > 0) {
      let remainTimeText = M + ":" + S
      this.setData({
        remainTimeText: remainTimeText
      })
    } else {
      // console.log(remainingTime);
      this.setData({
        completed: true
      })
      this.stopTimer()
      return
    }

    // update circle progress
    halfTime = log.keepTime / 2
    if ((remainingTime * 1000) > halfTime) {
      this.setData({
        leftDeg: initDeg.left - (180 * (now - log.startTime) / halfTime)
      })
    } else {
      this.setData({
        leftDeg: -135
      })
      this.setData({
        rightDeg: initDeg.right - (180 * (now - (log.startTime + halfTime)) / halfTime)
      })
    }
  },
  listenRadioGroup:function(e){
    var chairId = this.data.chairId;
    var strength = e.detail.value;
    //发送控制按摩椅强度指令
      wx.request({
        url: 'https://sv-wechat-dev.natapp4.cc/mc/weixin/sendStrengthChairMsg',
        data: {
          chairId: chairId,
          strength: strength
        },
        success: function (res) {
          console.log("按摩强度设置成功！");
        }
      });
    console.log("按摩强度设置成功！");
  }
})
