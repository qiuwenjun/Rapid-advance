export const link = "https://m.douban.com";         //豆瓣接口
export const links="https://m.kankanwu.com";    //片源接口

export function ajaxRequest(json){
    if(!json.url){
        wx.showToast({
            title: '接口地址没有传哦!!!',
            icon: 'none',
            duration: 1000
        });
        return ""
    };
    json.method=json.method||'get';             //传参方式
    json.data=json.data||{};                             //参数

    wx.request({
        url:json.url,
        method:json.method.toUpperCase(),
        data:json.data,
        success(res){
            json.success&&json.success(res);
        },
        fail(res){
            wx.showToast({
                title: '网络出错了!!!',
                icon: 'none',
                duration: 2000
            })
            json.fail&& json.fail(res);
        },
        complete(res){
            json.complete&&json.complete(res);
        }
    })
};
export function getTimes(time){                    //将时间转换成日子
     let str="";
     let date=new Date().getTime();
     let oldDate=new Date(time).getTime();
     let times=date-oldDate;
     let timearr=[1000,60*1000,60*1000*60,60*60*1000*24,60*60*1000*24*7,60*60*1000*24*30,60*60*1000*24*365];    //计算条件
     let strarr=['秒前','分钟前','小时前',"天前",'周前','月前','年前'];
     for(let i=0;i<timearr.length;i++){
        let strs=parseInt(times/timearr[i]);
        if(strs){
            str=strs+strarr[i];
        }else{
            break
        }
    };
    return str;
};