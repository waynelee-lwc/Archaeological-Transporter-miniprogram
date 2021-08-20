let app = getApp();


Page({
  data:{
    debugging:false,
    canvas:null,
    ctx:null,
    onshade:false,              //是否展示遮罩层
    currpage:"selecting",       //当前工作页面
    onselect:false,              //是否展示呼叫框
    pages:[{                    //工作页面信息
      name:'定位呼叫',
      value:'selecting',
      class:'short-selecting'
    },{
      name:'排队中..',
      value:'queuing',
      class:'short-queuing'
    },{
      name:'调度中..',
      value:'scheduling',
      class:'short-scheduling'
    },{
      name:'工作中..',
      value:'working',
      class:'short-working'
    }],
    positionResult:{
      options:['一号坑','二号坑','三号坑','四号坑','五号坑'],
      values:[1,2,3,4,5]
    },
    soilResult:{
      options:['土壤一','土壤二','土壤三','土壤四','土壤五'],
      values:[1,2,3,4,5]
    },
    queue:{             //排队信息
      curr:15,
      total:15
    },
    scheduling:{        //调度信息
      curr:0
    },
    intervalId:null,    
    positionIndex:0,
    soilIndex:0,
    legends:[{
      img:'../imgs/legend-scheduling.png',
      name:'调度'
    },{
      img:'../imgs/legend-working.png',
      name:'工作'
    },{
      img:'../imgs/legend-unloading.png',
      name:'送土'
    }],
    pitswidth:64,         //土坑宽度
    pitsinterval:80,      //土坑间隔
    mapwidth:600,         //可视地图宽度
    mapheight:900,        //可视地图高度
    windowWidth:0,        //窗口宽度
    windowHeight:0,       //窗口高度
    pitspositions:[{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0},
                  {x:0,y:1},{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:4,y:1},
                  {x:0,y:2},{x:1,y:2},{x:2,y:2},{x:3,y:2},{x:4,y:2},
                  {x:0,y:3},{x:1,y:3},{x:2,y:3},{x:3,y:3},{x:4,y:3},
                  {x:0,y:4},{x:1,y:4},{x:2,y:4},{x:3,y:4},{x:4,y:4},],
    basex:80,             //点阵水平偏移量
    basey:150,            //点阵垂直偏移量
    offsetx:0,            //滑动水平偏移量
    offsety:0,            //滑动垂直偏移量
    flagPitIntervalx:40,    //标尺土块间隔
    flagPitIntervaly:40,    //标尺土块间隔
    targetPoint:{ //小车目标点
      x:0,          //图中x
      y:0,          //图中y
      use:false,
      realx:0,      //全局x
      realy:0       //全局y
    },
    offsetxmax:50,
    offsetymax:50,
    touchx:0,
    touchy:0,
    sizerate:0.75,      //地图缩放比例
    sizeratemax:3,      //最大缩放比例
    sizeraetmin:0.5,   //最小缩放比例
    vehicle:{ //载具信息
      position:{
        x:0,
        y:0
      }
    },
    tcpConnection:{     //tcp连接
      connResults:{
        success:{
          tipColor:'green',
          note:'已连接'
        },
        connecting:{
          tipColor:'yellow',
          note:'连接中'
        },
        unconnected:{
          tipColor:'red',
          note:'未连接'
        },
      },
      tipColor:'red',
      note:'未连接',
      targetIP:'192.168.43.42',
      targetPort:3000,
      isSelecting:false,
      socket:null,         //tcpsocket对象
      tempinfo:'123412'
    }
  },
  onLoad:function(){

    this.log('hello','world',123);

    wx.getSystemInfo({//获取屏幕宽度信息，用于地图展示计算
      success: (result) => {
        this.setData({
          windowWidth:result.windowWidth,
          windowHeight:result.windowHeight
        })
      },
    })

  },
  log:function(){//调试信息打印
    if(!this.data.debugging){
      return;
    }
    let result = '';
    let len = arguments.length;

    for(let i = 0;i < len;i++){
      result += arguments[i] + ' ';
    }

    console.log(result);
  },
  hideshade:function(){   //隐藏遮罩层
    this.setData({
      onshade:false
    })

  },
  showshade:function(type){ //显示遮罩层
    this.setData({
      onshade:true,
      shadepage:type
    })
  },
  hideselectform:function(){  //隐藏选择框
    this.setData({
      onselect:false
    })
  },
  showselectfomr:function(){  //展示选择框
    this.setData({
      onshade:false,
      onselect:true,
      shadepage:'selecting'
    })
  },
  tapshort:function(e){ //点击工作页面缩略图
    let type = e.target.dataset.value;
    this.log(e);
    if(type == 'selecting'){
      this.showselectfomr();
    }else{
      this.showshade(type);
    }
  },
  unload:function(){//倒土
    this.setData({
      onshade : false,
      onselect:true,
      currpage:'selecting'
    })
  },
  queue:function(){//排队
      this.setData({
        onshade:true,
        onselect:false,
        currpage:'queuing',
        queue:{
          total:16,
          curr:16
        }
      })

      let id = setInterval(() => {
        this.setData({
          queue:{
            total:16,
            curr:this.data.queue.curr - 1
          }
          
        })
        if(this.data.queue.curr < 0){
          clearInterval(id);
          this.scheduling();
        }
      }, 200);
      this.setData({
        intervalId:id
      })
      
  },
  scheduling:function(){//调度
    this.setData({
      scheduling:{
        curr:0
      },
      currpage:'scheduling',
      onshade:true,
      onselect:false
    })

    let id = setInterval(() => {
      this.setData({
        scheduling:{
          curr : this.data.scheduling.curr + 1
        }
      })
      if(this.data.scheduling.curr > 100){
        clearInterval(id);
        this.work();
      }
    }, 50);
  },
  work:function(){//工作
    this.setData({
      onshade :true,
      onselect:false,
      currpage:'working'
    })
  },
  cancelQueue:function(){//取消排队
    this.setData({
      onshade :false,
      onselect:true,
      currpage:'selecting'
    })
    clearInterval(this.data.intervalId);
  },
  pickPosition:function(e){
    let index = e.detail.value;
    this.setData({
      positionIndex:index
    })
  },
  pickSoil:function(e){ //选择土壤分类
    let index = e.detail.value;
    this.setData({
      soilIndex:index
    })
  },
  touchmove:function(e){//触摸移动地图

    //移动后触摸位置
    let x = e.touches[0].clientX;
    let y = e.touches[0].clientY;

    //上次触摸移动位置
    let tx = this.data.touchx;
    let ty = this.data.touchy;

    //本次触摸移动偏移量
    let dx = tx - x;
    let dy = ty - y;

    //触摸移动后的新偏移量
    let ofx = Math.max(Math.min(dx + this.data.offsetx,this.data.mapwidth * this.data.sizerate - this.data.windowWidth),0);
    let ofy = Math.max(Math.min(dy + this.data.offsety,this.data.mapheight * this.data.sizerate - this.data.windowHeight),0);
    this.setData({
      offsetx:ofx,
      offsety:ofy,
      touchx:x,
      touchy:y
    })
    this.log(this.data.offsetx,this.data.offsety);
  },
  touchstart:function(e){//触摸移动开始
    // this.log('touch start',e);
    let x = e.touches[0].clientX;
    let y = e.touches[0].clientY;
    this.setData({
      touchx:x,
      touchy:y
    })
  },
  touchend:function(e){//触摸移动停止
    this.log('touch end');
    this.log('offset',this.data.offsetx,this.data.offsety);
    this.log('base',this.data.basex * this.data.sizerate,this.data.basey * this.data.sizerate);
    this.setData({
      touchx:0,
      touchy:0
    })
  },
  setTarget:function(e){  //点击选取地点
    let x = e.touches[0].pageX;
    let y = e.touches[0].pageY;

    this.log('tap',x,y);

    // this.log('tap',x.toFixed(2),y);

    let rx = ((x + this.data.offsetx - this.data.basex * this.data.sizerate) / this.data.sizerate).toFixed(2);
    let ry = ((y + this.data.offsety - this.data.basey * this.data.sizerate) / this.data.sizerate).toFixed(2);
    
    rx = Math.min(this.data.flagPitIntervalx * 2 + this.data.pitsinterval * 5,Math.max(0,rx));
    ry = Math.min(this.data.flagPitIntervaly * 2 + this.data.pitsinterval * 5,Math.max(0,ry));

    this.setData({
      'targetPoint.x':x,
      'targetPoint.y':y,
      'targetPoint.realx':rx,
      'targetPoint.realy':ry,
    })

  },
  changeTarget(e){  //输入框更改定位信息
    // console.log(e);
    let id = e.target.id;
    let value = Number(e.detail.value);
    
    if(id == 'target-x'){
      value = Math.min(this.data.flagPitIntervalx * 2 + this.data.pitsinterval * 5,Math.max(0,value));
      this.setData({
        'targetPoint.realx':value
      })
    }else{
      value = Math.min(this.data.flagPitIntervaly * 2 + this.data.pitsinterval * 5,Math.max(0,value));
      this.setData({
        'targetPoint.realy':value
      })
    }
  },
  addsizerate:function(){ //增加地图缩放比例

    let sizerate = Math.min(this.data.sizeratemax,this.data.sizerate + 0.25);
    this.setData({
      sizerate:sizerate,
      offsetx:0,
      offsety:0
    })
  },
  subsizerate:function(){ //减小地图缩放比例
    let sizerate = Math.max(this.data.sizeraetmin,this.data.sizerate - 0.25);

    let rate = sizerate / this.data.sizerate;;

    this.setData({
      sizerate:sizerate,
      offsetx:0,
      offsety:0
    })
  },
  tcpConnect:function(){ //建立tcp连接
    let socket = wx.createTCPSocket();
    this.log(socket);

    this.log(this.data.tcpConnection.targetIP,this.data.tcpConnection.targetPort);
    socket.connect({
      address:this.data.tcpConnection.targetIP,
      port:this.data.tcpConnection.targetPort
    })

    this.setData({
      'tcpConnection.tipColor':this.data.tcpConnection.connResults.connecting.tipColor,
      'tcpConnection.note':this.data.tcpConnection.connResults.connecting.note
    })

    //10秒后校验连接情况，无反应则置为未连接
    setTimeout(() => {
      if(!socket || this.data.tcpConnection.tipColor == 'yellow'){
        this.setData({
          'tcpConnection.tipColor':this.data.tcpConnection.connResults.unconnected.tipColor,
          'tcpConnection.note':this.data.tcpConnection.connResults.unconnected.note
        })
      }
    }, 10000);

    //socket连接上
    socket.onConnect(()=>{

      wx.showToast({
        title: '连接成功',
      })

      this.setData({
        'tcpConnection.tipColor':this.data.tcpConnection.connResults.success.tipColor,
        'tcpConnection.note':this.data.tcpConnection.connResults.success.note,
        'tcpConnection.socket':socket
      })
    })

    socket.onError(()=>{
      this.setData({
        'tcpConnection.tipColor':this.data.tcpConnection.connResults.unconnected.tipColor,
        'tcpConnection.note':this.data.tcpConnection.connResults.unconnected.note
      })
    })

    //接受服务端传递信息
    socket.onMessage((res)=>{
      console.log(res.message);
      let buffer = res.message
      var dataview = new DataView(buffer);
      var ints = new Uint8Array(buffer.byteLength);
      var str = '';
      for (var i = 0; i < ints.length; i++) {
        str += String.fromCharCode(dataview.getUint8(i));
      }

      // wx.showToast({
      //   title: str,
      // })

      let args = str.split(';');

      //6：更新载具位置
      //x,y
      if(args[0] == 6){
        this.setVehiclePosition(args[1],args[2]);
      }
    })

    this.log('连接中...');

    this.tcpCancel();
  },
  tcpCancel:function(){ //最小化tcp连接页面
    this.setData({
      'tcpConnection.isSelecting':false
    })
  },
  tcpSetData:function(){  //更新tcp连接状态
    if(this.data.tcpConnection.tipColor == 'yellow'){
      return;
    }
    this.setData({
      'tcpConnection.isSelecting':true
    })
  },
  tcpTargetIpInput:function(e){ //设置服务端ip
    let value = e.detail.value;
    this.setData({
      'tcpConnection.targetIP':value
    })
  },
  tcpTargetPortInput:function(e){//设置服务端接口
    let value = e.detail.value;
    this.setData({
      'tcpConnection.targetPort':value
    })
  },
  isTcpConnected(){       //询问tcp是否已连接
    return this.data.tcpConnection.note == '已连接'
  },
  setVehiclePosition(x,y){//更新地图中载具位置
    this.setData({
      'vehicle.position':{
        x:x,
        y:y
      }
    })
  }
})