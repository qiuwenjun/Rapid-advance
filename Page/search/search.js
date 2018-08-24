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
     movieArr:[],      //片源
     height:'auto',      //元素高度 
     isRequest:true,  //隐藏元素
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setHeight();
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
        isFocus:Number(e.currentTarget.dataset.flag),
        isSearch:false
      });
      if(Number(e.currentTarget.dataset.flag)){
        this.getStorage();
      }else{
        this.setData({
          searchText:''
        });
      }
  },  
  keyup(e){
    clearTimeout(this.timer);
    if(e.type=="input"){    //键盘事件
      let detail=e.detail;
      this.setData({
        searchText:detail.value,
      });
      this.timer=setTimeout(res=>{
        this.isRequest&&this.isRequest.abort();     //取消之前的请求,防止重复请求
        this.setData({
          page:1,
          movieArr:[]
        });
        this.queryMovie(true);
      },2000);
    }else{         //回车事件
      this.isRequest&&this.isRequest.abort();     //取消之前的请求,防止重复请求
      this.setData({
        page:1,
        movieArr:[]
      });
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
              let re=/<li><a\s+href="(.*)"\s+title="(.*)"\s+target="_self">\n*\s+<div\s+class="picsize">\n*\s+<img\s+class="loading"\s+src="(.*)"\s+alt="/g;        //获取片源
              if(flag){                        //第一次请求
                 let re=/<em>共(\d*)个<\/em>/;
                 let num=data.match(re)[1];
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
              data.replace(re,function($0,$1,$2,$3){
                movieArr.push({
                  title:$2,
                  url:$1,
                  src:links+$3
                });
                return $0
              });
              this.setData({
                movieArr:this.data.movieArr.concat(movieArr),
                isSearch:true,
                isRequest:true
             });
             this.setHistory(this.data.searchText);
             this.setHeight();
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
  setHeight(){            //设置高度
    let window=wx.getSystemInfoSync();
    let allHeight=window.windowHeight;
    let query = wx.createSelectorQuery();
    let height;
    query.select('#search_input').boundingClientRect().exec(res=>{});
    query.select('.search_title').boundingClientRect().exec(res=>{});
    query.select(".showData").boundingClientRect().exec(res=>{
      if(res[1]&&res[2]){
          height=allHeight-res[0].height-res[1].height+'px';
          this.setData({height})     
      }
    })
  },
  lower(e){      
    if(this.data.isRequest&&this.data.page<this.data.allPage){
      this.setData({
        page:++this.data.page,
        isRequest:false
      },res=>{
        this.queryMovie();     
      });
    }else if(this.data.page>=this.data.allPage){
        wx.showToast({
          title: '到底啦',
          icon: 'none',
          duration: 2000
        })
    }
  },
  clearStorage(e){     ///清除历史记录
    let history;
    if(Object.prototype.toString.call(e)=="[object Object]"){       
        if(e.target.id=="clear_index"){        //单个删除
          history=this.data.history.filter(res=>res!=e.currentTarget.dataset.index);
        }else if(e.target.id=="clear_all"){     //全部清除
          history=[]
        }else if(e.target.id=="search_text"){    //单个请求历史记录
          clearTimeout(this.timer);
          this.isRequest&&this.isRequest.abort();     //取消之前的请求,防止重复请求
          this.setData({
            searchText:e.currentTarget.dataset.index
          },res=>{
              this.queryMovie(true);
          });
        
          return
        }
    }else{     //指定清除历史记录
      history=this.data.history.filter(res=>res!=e);
    };
    this.setData({
      history
    });
    wx.setStorageSync("history",history)
  },
  getStorage(){      //获取历史记录
    let iStorage=wx.getStorageSync("history");
    let history=[];
    if(iStorage instanceof Array) history=iStorage;
    this.setData({
      history
    })
  },
  setHistory(str){   //设置历史记录
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
  imgError(e){         //图片加载失败时
    let item=this.data.movieArr[e.currentTarget.dataset.index];
    item.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHUAAABcCAMAAABneQpwAAAAPFBMVEX////e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7////39/fv7+/m5ube3t7m7ZQJAAAAD3RSTlMAESIzRFVmd4iZqrvM3e5GKvWZAAAChElEQVR42u3a23qbMAwAYEMoS9KEWNL7v+v2LRxsJMtefcjF7Lu2VD9GWFYgxmhjojrDdPX/VbHcSFfxVW5gV7va1Urq/Al1WD6gDk9qro63rVa3Uw+zneqardTp7u+GXIX3PyMUU6fv8x58VsH5GxRRPROtpCJlXH5JnZ9+PEll7UimejZFFSmWgH9SuSmpIPRekKEuQhiuii1fhnoVTp2pIKrwc3UQIjAVRRUz7qYbv1pMDXTVGerIz7uBau4sQgt1YoltoZrvc4gm6hxdOeXv4b1StFyvR3cGr+K1Cf58iISAej9fsEJ1GI4wXP21hbFh9Qd7jnWPY+qFxymxvwJp6rDwQAV6CSRVfS9W37HZfROSql7XjKI7WZvbIwKp6l4NrTsFm9kPA6nqO6nO74uolnT1cUQHZ7KZKurq1V2mzm2cpyKp6pdXG+D4KUu1pKrj4q8BtR92olqrqqSrD3FjUdV16WhrB3WVd2n7QQEVEoqTJVWd/YLvLR5RtZiy55CqXpZQhQdZtUm9BOjq17J9ahQma0PNapQlXd0m613krSxy1VJS5wQx1QwPnp91slzFQJcI0amyKnFjZ7yWxcRuLXA7RtT1PnbjB54QKG8QXrFz49WfJXed7ElFRcWk3Pv7K0vu+0CpjYqxQMkqSy4Is8DIaxqQaoiu7o0pnlOICVlNGIF+ePKSi8mXLk81o5dcplId1QxucpGCmS6resm1JxXrqW5yMXR7lVfNZU8ueCpUVc2wPR72VaqrOo/Z2IPMmuq+1bPDq6pHcvfDqYF6JLep6ia3pWrm5ROquTw/oW5bfWPVff/a1dpq/pdRoL/N7+rfrqLY6N8g62pbdbzWGb8BajFcm9Ofks8AAAAASUVORK5CYII=";
    this.setData({
      movieArr:this.data.movieArr
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