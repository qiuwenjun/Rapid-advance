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
     history:[],           //历史记录
     page:1,               //page页面
     size:5,                 //显示5条数据
     allNum:0,          //总数量
     allPage:0,          //总页数
     movieArr:[]      //片源
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
    if(e.type=="input"){    //键盘事件
      let detail=e.detail;
      this.setData({
        searchText:detail.value,
      });
      clearTimeout(this.timer);
      this.timer=setTimeout(res=>{
        this.isRequest&&this.isRequest.abort();     //取消之前的请求,防止重复请求
        this.setData({
          page:1
        });
        this.queryMovie(true);
      },2000);
    }else{         //回车事件
      this.setData({
        page:1
      });
      this.isRequest&&this.isRequest.abort();     //取消之前的请求,防止重复请求
      this.queryMovie(true);
    }
  },
  queryMovie(flag){
     this.isRequest=wx.request({
        url:links+`/vod-search-wd-${this.data.searchText}-p-${this.data.page}.html`,
        methods:"get",
        success:(res)=>{
          if(res.statusCode==200){
              let data=res.data;
              let re=/<a\s+href="(.*)"\s+title="(.*)"\s+target="_self"/g;        //获取片源
              if(flag){                        //第一次请求
                 let re=/<em>共(\d*)个<\/em>/;
                  num=data.match(re)[1];
                if(num){
                  this.setData({
                     allNum:num,
                     allPage:Math.ceil(num/this.data.size)
                  });
                }else{
                  this.setData({
                    allNum:0,
                    allPage:0
                 });
                }
              }
              let movieArr=[];                //存储片源
              data.replace(re,function($0,$1,$2){
                movieArr.push({
                  title:$2,
                  url:$1
                });
                return $0
              });
              this.setData({
                movieArr
             });
          }else{
            wx.showToast({
              title: '请求超时',
              icon: 'none',
              duration: 2000
            });
          }
        }
     })
  },
  getStorage(){
    let iStorage=wx.getStorageSync("history");
    let history=[];
    if(iStorage instanceof Array) history=iStorage;
    this.setData({
      history
    })
  },
  setHistory(str){
    if(!str) return
    let history=this.data.history;
    let index=history.findIndex(res=>res===str);
    let re=null;
    if(index==-1){      //没找到添加历史记录
     re=str;
    }else{                   //找到了更改历史记录的位置
     re=history.splice(index,1)[0];
    };
    history.unshift(re);
    this.setData({
      history
    });
    wx.setStorageSync("history",history)
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