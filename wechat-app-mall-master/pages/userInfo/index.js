const app = getApp()

Page({
  data: {
   
  },
  onLoad() {

  },
  onShow() {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo')
    // console.log(userInfo);
    if (!userInfo) {
      wx.navigateTo({
        url: "/pages/authorize/index"
      })
    } else {
      var nickName = userInfo.nickName;
      var gender = userInfo.gender;
      var province = userInfo.province;
      var city = userInfo.city;
      if (gender==1){
        gender="男";
      } else if (gender == 2){
        gender = "女";
      }else{
        gender="未知";
      }
     
      that.setData({
        userInfo: userInfo,
        nickName: nickName,
        gender: gender,
        province: province,
        city: city
      })

    }
  }
})