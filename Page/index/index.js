import {link as url,ajaxRequest as request} from "../../assets/common/common.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:0,                //请求的页数
    size:18,               //一次请求的数量
    nowSize:0,         //请求数据到哪里了
    movieList:[],      //存储数据
    flagLoad:true,    //判断是否正在请求
    pageFlag:false   //判断是否到最后一页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.load();
  },
  scrollLoad(ev) {
    this.load();
  },
  load(){
    if (!this.data.flagLoad||this.data.pageFlag){
      wx.showToast({
        title: '到底啦!!!',
        icon: 'none',
        duration: 2000
      });
       return ""
    }
      this.setData({
        num:this.data.num+1,
        flagLoad:false,
      },()=>{
          request({
            url: `${url}/rexxar/api/v2/subject_collection/movie_showing/items?os=ios&for_mobile=1&callback=jsonp${this.data.num}&start=${this.data.nowSize}&count=${this.data.size}&loc_id=108288&_=0`,
            method: 'get',
            success: (res) => {
              if(res.statusCode==200){
                let text=res.data;
                let re=/;(\w+\()({.*})(\);)/;
                let data=text.replace(re,($0,$1,$2,$3)=>{
                    return $2
                });
                data=JSON.parse(data);
                data.subject_collection_items.forEach(res=>{
                    if(res.rating){
                          res.rating.index=parseInt(res.rating.value/2)-1;
                        }
                });
                  this.setData({
                    movieList:this.data.movieList.concat(data.subject_collection_items),
                    nowSize:this.data.nowSize+this.data.size
                  },()=>{
                    if(this.data.nowSize>=data.total){
                      this.setData({
                        pageFlag:true
                      })
                    }
                  });                
              }else{
                wx.showToast({
                  title:res.errMsg,
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            complete:(res)=>{
              this.setData({
                flagLoad:true
              })
            }
          })
      })

  },
  targetUrl(ev){
    let index=ev.currentTarget.dataset.index;
    let data=this.data.movieList[index];
    request({
      url:data.url,
      method: 'get',
      success(res){
        if(res.statusCode==200){
          let text=res.data;
          let Index=text.indexOf("<ul class=\"wx-preview\">");
          text=text.substring(Index,text.indexOf("</ul>",Index));
          let Image=text.match(/data-src="(.*\.jpg)(\?\d*)*"/g);
          let movie=text.match(/ href="\/movie\/trailer\/(\d+)"/);
          if(movie){
            movie=movie[0].replace(/"|\s+/g,'');
          }else{
            movie="href=0";    //没有匹配到的话
          };
          wx.navigateTo({
            url:'../movieDetail/movieDetail?'+movie+"&id="+data.id+'&title='+data.title,
          })
        }
      }
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
    console.log(1)
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

  imgError(ev){
  },
  imgSuccess(ev){
  },  
})