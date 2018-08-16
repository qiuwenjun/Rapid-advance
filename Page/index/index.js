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
    pageFlag:false,   //判断是否到最后一页
    i:0,
    left:0,
    margin:0,
    classList:[
        {title: "影院热映", src: "movie_showing"},
        {title: "经典", src: "filter_movie_classic_hot"},
        {title: "冷门佳片", src: "filter_movie_unpopular_hot"},
        {title: "豆瓣高分", src: "filter_movie_score_hot"},
        {title: "动作", src: "filter_movie_action_hot"},
        {title: "喜剧", src: "filter_movie_comedy_hot"},
        {title: "爱情", src: "filter_movie_love_hot"},
        {title: "悬疑", src: "filter_movie_mystery_hot"},
        {title: "恐怖", src: "filter_movie_horror_hot"},
        {title: "科幻", src: "filter_movie_sci-fi_hot"},
        {title: "治愈", src: "filter_movie_cure_hot"},
        {title: "文艺", src: "filter_movie_literature_hot"},
        {title: "成长", src: "filter_movie_growth_hot"},
        {title: "动画", src: "filter_movie_cartoon_hot"},
        {title: "华语", src: "filter_movie_chinese_hot"},
        {title: "欧美", src: "filter_movie_occident_hot"},
        {title: "韩国", src: "filter_movie_korea_hot"},
        {title: "日本", src: "filter_movie_japanese_hot"},
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let query=wx.createSelectorQuery();
    let iScroll=query.select("#scroll");
    let aText=query.selectAll("#scroll .class"); 
    aText.boundingClientRect().exec((...rest)=>{
        let res=rest[0][0];
        this.setData({
          margin:res[0].left,
          iScroll,
          aText
        })
    })
    this.load();
  },
  scrollLoad(ev) {
    this.load();              
  },
  tab(e){
    let index=e.currentTarget.dataset.index;
    let query=wx.createSelectorQuery();
    let iScroll=query.select("#scroll");
    let aText=query.selectAll("#scroll .class"); 
    let left=0;
    iScroll.boundingClientRect().exec();
    aText.boundingClientRect().exec((...rest)=>{
        let iWidth=rest[0][0].width;
        let res=rest[0][1];
        let indexs=index;
        if(indexs>=res.length-3) indexs=res.length-3;
        if(indexs>2){
          for(let i=0;i<indexs;i++){
            left+=this.data.margin*2+res[i].width;
          };
          left-=(iWidth-res[indexs].width+(this.data.margin*2))/2
      };
      this.setData({
        i:index,
        left,
        pageFlag:false,
        num:0,
        nowSize:0,
        movieList:[]
      },callBack=>{
        this.load();
      });
    });             
  },
  load(){
    if (!this.data.flagLoad||this.data.pageFlag){
      if(this.data.pageFlag){
        wx.showToast({
          title: '到底啦!!!',
          icon: 'none',
          duration: 2000
        });
      }
       return ""
    }
      this.setData({
        num:this.data.num+1,
        flagLoad:false,
      },()=>{
          request({
            url: `${url}/rexxar/api/v2/subject_collection/${this.data.classList[this.data.i].src}/items?os=ios&for_mobile=1&callback=jsonp${this.data.num}&start=${this.data.nowSize}&count=${this.data.size}&loc_id=108288&_=${new Date().getTime()}`,
            method: 'get',
            success: (res) => {
              if(res.statusCode==200){
                let text=res.data;
                let re=/;(\w+\()({.*})(\);)/;
                let data=text.replace(re,($0,$1,$2,$3)=>{
                    return $2
                });
                data=JSON.parse(data);
                data= data.subject_collection_items;
                if(!data.length){
                  this.setData({
                    pageFlag:true
                  },call=>{
                    wx.showToast({
                      title: '到底啦!!!',
                      icon: 'none',
                      duration: 2000
                    });
                  });
                }else{
                  data.forEach(res=>{
                      if(res.rating){
                        res.rating.index=parseInt(res.rating.value/2)-1;
                      }
                  });
                  this.setData({
                    movieList:this.data.movieList.concat(data),
                    nowSize:this.data.nowSize+this.data.size
                  });       
                }
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
          wx.setStorageSync("still",JSON.stringify({attr:Image}));
          wx.navigateTo({
            url:'../movieDetail/movieDetail?'+movie+"&id="+data.id+'&title='+data.title,
          })
        }
      }
    })
  },
  search(){
      wx.navigateTo({
          url:'../search/search'
      });
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