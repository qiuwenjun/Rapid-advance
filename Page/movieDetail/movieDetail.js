import {link as url,links,ajaxRequest as request,getTimes} from "../../assets/common/common.js";
let res=require("../../assets/common/pinyinUtil.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src:"",
    movieMsg:{},
    flag:false,
    page:1,           //第几页
    size:5,             //一页显示几个
    source:[],         //匹配到的电影名称,
    sourcearr:[],         //匹配到的片源
    playSource:'',         //播放源
    commonts:{
      total:0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    options.title=options.title.replace(/\s+/g,'');
    this.setData(options);
    wx.setNavigationBarTitle({                //设置标题
      title:options.title,
    });
    Promise.all([this.requestSrc(),this.requestDetail(),this.requestMarker(),this.requestCommonts(),this.requestSource()]).then(res=>{});
    //设置剧照
    let json=""
    try{
      json=JSON.parse(wx.getStorageSync("still"))['attr'];
      json.forEach((res,index)=>{
       json[index]=res.match(/data-src="(.*)"/)[1];
      });
    }catch(e){
      json=[];
    };
    this.setData({
      still:json,
    });
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
                if(json.rating) json.rating.index=parseInt(json.rating.value/2);
                let info={};
                info.director=data.extra.info[0]?data.extra.info[0].filter((item,index)=>index)[0]:'未知';   //导演列表
                info.actor=data.extra.info[1]?data.extra.info[1].filter((item,index)=>index)[0].split("/").filter((item,index)=>index<3).join('/'):'未知';   //演员列表
                info.year=data.extra.year;
                json.info=info;
                json.synopsis=data.desc?data.desc.match(/<div class="content">([\W\w]*)<\/div>/):'';
                if( json.synopsis){
                  json.synopsis= json.synopsis[1];
                  json.synopsisP= json.synopsis.substr(0,60)+'...';
                  json.isHidden=false;
                }else{
                  json.isHidden=true;
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
  requestMarker(){                                      //获取影人相关信息                  
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
  requestCommonts(){                                  //获取评论信息
    return new Promise((resolve,reject)=>{
        request({
          url:url+"/rexxar/api/v2/movie/"+this.data.id+"/interests?count=4&order_by=hot&start=0&ck=&for_mobile=1&_="+new Date().getTime(),
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
  requestSource(){                 //获取播放视频源
    return new Promise((resolve,reject)=>{
       request({
        url:links+"/vod-search-wd-"+this.data.title+"-p-"+this.data.page+".html", 
        method:"get",
        success:(res)=>{
          if(res.statusCode==200){
            let data=res.data;
            let allPage=data.match(/<em>共(\d+)个<\/em>/);
            if(Object.prototype.toString.call(allPage)==="[object Array]"){
              allPage=Math.ceil(allPage[1]/this.data.size);
              let arr=[];
              data.replace(/<li><a\s+href="(\/.*\/)" title="(.*)"\s+/g,function($0,$1,$2){
                arr.push({
                  src:$1,
                  title:$2
                });
                return $0;
              });
              let index=arr.findIndex(res=>{
                let str=res.title.replace(/\s+/g,'');
                return str.startsWith(this.data.title)
              });
              if(index!=-1){
                 this.requestPlaypage(arr[index].src);
              }else{
                if(this.data.page==allPage){
                  this.setData({
                    sourcearr:[]
                  })      
                }else{
                  this.setData({
                    page:++this.data.page
                  });
                  this.requestSource()
                }
              }
            }else{
              this.setData({
                sourcearr:[]
              })               
            };
            resolve();
          }
        }
       })
    });
  },
  requestPlaypage(url){
    return new Promise((resolve,reject)=>{
       request({
         url:links+url,
         method:"get",
         success:(res)=>{
            if(res.statusCode==200){
              let data=res.data;
              let re=new RegExp('<a href="('+url+'.*html)"','mg');
              let sourcearr=[];
              data.replace(re,($0,$1)=>{
                sourcearr.push($1)
                  return $0
              });
              this.setData({
                sourcearr
              })
            }
         }
       })
    });
  },
  playMovie(ev){
    let data=ev.currentTarget.dataset.url;
    request({
      url:links+data,
      method:'get',
      success:(res)=>{
        if(res.statusCode==200){
          let data=res.data;
          let re=/<iframe\s+width="100%"\s+height="100%"\s+src="(.*)"\s+frameborder="0"/;
          data=data.match(re);
          if(Object.prototype.toString.call(data)==="[object Array]"){
            let playSource=data[1];
            this.setData({
              playSource
            });
          }else{
            wx.showToast({
                title: '播放出错啦!!!',
                icon: 'none',
                duration: 2000
            });
          }
        }else{
          wx.showToast({
              title: '播放出错啦!!!',
              icon: 'none',
              duration: 2000
          });
        }
      },
    })
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
    this.setData({
      movieMsg:{
        ...this.data.movieMsg,
        isHidden:true
      }
    })
  },
  playVideo(){
    this.setData({
      flag:!this.data.flag
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
    wx.removeStorageSync("still");
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