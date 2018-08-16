import {link,links,ajaxRequest as request} from "../../assets/common/common.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
     hotData:[],        //热门搜索
     isFocus:false,    //是否获取到焦点
     isSearch:false,   //是否在查询
     searchText:'',
     history:[]           //历史记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getStorage();
    Promise.all([this.getHotdata()]).then(res=>{

    },res=>{

    })
  },
  getHotdata(){         //获取热门搜索
      return new Promise((resolve,reject)=>{
          request({
            url: `${link}/rexxar/api/v2/subject_collection/movie_showing/items?os=ios&for_mobile=1&callback=jsonp1&start=0&count=18&loc_id=108288&_=${new Date().getTime()}`,
            method: 'get',
            success: (res) => {
              if(res.statusCode){
                  let text=res.data;
                  let re=/;(\w+\()({.*})(\);)/;
                  let data=text.replace(re,($0,$1,$2,$3)=>{
                      return $2
                  });
                  data=JSON.parse(data);
                  data= data.subject_collection_items;
                  this.setData({
                    hotData:data.splice(Math.floor(Math.random()*data.length/2),Math.ceil(Math.random()*5+5))
                  });
              }else{
                wx.showToast({
                    title: '获取热门搜索失败!!!',
                    icon: 'none',
                    duration: 2000
                });
              }
            }
          })
      });
  },
  input(e){
      this.setData({
        isFocus:Number(e.currentTarget.dataset.flag)
      })
  },  
  keyup(e){
    let detail=e.detail;
    this.setData({
      searchText:detail.value,
    });
  },
  getStorage(){
    wx.setStorageSync({
      history:JSON.stringify({"history":[{"title":'西虹市首富','id':2587412}]})
    });
    let iStorage=wx.getStorageSync("history");
    let history=[];
    if(iStorage){
      let arr=JSON.parse(iStorage);
      console.log(arr)
    };
    this.setData({
      history
    })
  },
  setHistory(){
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
  
  }
})