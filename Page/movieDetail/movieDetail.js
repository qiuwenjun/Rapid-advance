import {link as url,ajaxRequest as request,getTimes} from "../../assets/common/common.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src:"",
    movieMsg:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData(options);
    wx.setNavigationBarTitle({
      title:options.title,
    })
    Promise.all([this.requestSrc(),this.requestDetail(),this.requestMarker(),this.requestCommonts()]).then(res=>{

    });
    ;                 
  },
  requestSrc(){                         //请求视频播放源
    return new Promise((resolve,reject)=>{
      request({
        url:url+this.data.href,
        method:"get",
        success:(res)=>{
           if(res.statusCode==200){
              let data=res.data.match(/<source\s+src="(.*\.mp4)"/);
              if(data){    //拿到播放源
                data=data[1];
                resolve();
                this.setData({
                  src:data
                });
                return 
              }
           }
            resolve();
        }
      });
    });
  },
  requestDetail(){                    //请求电影详情
    return new Promise((resolve,reject)=>{
        request({
          url:url+"/rexxar/api/v2/elessar/subject/"+this.data.id,
          method:"get",
          success:(res)=>{
            if(res.statusCode==200){
                let data=res.data;
                let json={};
                json.url=data.cover.normal.url;
                json.title=data.title;
                json.rating=data.extra.rating_group.rating;
                if(json.rating) json.rating.index=parseInt(json.rating.value/2)-1;
                let info={};
                info.director=data.extra.info[0]?data.extra.info[0].filter((item,index)=>index)[0]:'未知';   //导演列表
                info.actor=data.extra.info[1]?data.extra.info[1].filter((item,index)=>index)[0].split("/").filter((item,index)=>index<3).join('/'):'未知';   //演员列表
                info.year=data.extra.year;
                json.info=info;
                json.synopsis=data.desc?data.desc.match(/<div class="content">(\W*)<\/div>/):'';
                if( json.synopsis){
                  json.synopsis= json.synopsis[1];
                  json.synopsisP= json.synopsis.substr(0,60)+'...';
                  json.isHidden=false;
                }else{
                  json.synopsis="暂无剧情介绍!!!";
                }
                this.setData( {
                  movieMsg:json
                });
            }
            resolve();
          },
        });
    });
  },
  requestMarker(){
     return new Promise((resolve,reject)=>{
          request({
            url:url+'/rexxar/api/v2/movie/'+this.data.id+'/credits',
            method:"get",
            success:(res)=>{
              if(res.statusCode==200){
                  let json=[];
                  let data=res.data.credits;
                  for(let i=0;i<data.length;i++){
                    data[i].celebrities.forEach(res=>res.title=data[i].title);
                    json=[...json,...data[i].celebrities];
                  }
                  this.setData({
                    filmmaker:json.splice(0,10)
                  });
              }
              resolve();
            }
          });
     });
  },
  requestCommonts(){
    return new Promise((resolve,reject)=>{
        request({
          url:url+"/rexxar/api/v2/movie/"+this.data.id+"/interests?count=4&order_by=hot&start=0&ck=&for_mobile=1",
          method:"get",
          success:(res)=>{
              if(res.statusCode==200){
                    let arr=[];
                    let data=res.data.interests;
                    for(let i=0;i<data.length;i++){
                      data[i].date=getTimes(data[i].create_time);
                      arr.push(data[i]);
                    };
                    this.setData({
                      commonts:{
                        interests:arr,
                        total:res.data.total
                      }
                    })
              }
              resolve();
          }
        })
    });
  },
  Video_error(){                  //视频播放出错
    wx.showToast({
        title: '视频播放错误,开始播放默认视频!!!',
        icon: 'none',
        duration: 2000
    })
    this.setData({
       src:"http://dev.webf10.com/play/img/A.mp4",
    });
  },
  thean(){                             //展开剧情介绍
    console.log(1)
    this.setData({
      movieMsg:{
        ...this.data.movieMsg,
        isHidden:true
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