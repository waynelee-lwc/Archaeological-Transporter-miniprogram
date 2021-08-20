let app = getApp();


Page({
  data:{
    
  },
  navToReal(){
    wx.navigateTo({
      url: '../realPage/realPage',
    })
  },
  navToTest(){
    wx.navigateTo({
      url: '../testPage/testPage',
    })
  },
  onLoad:function(){
    // this.navToTest();
  }
})