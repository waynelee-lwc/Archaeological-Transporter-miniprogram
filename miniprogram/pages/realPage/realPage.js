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
    positionResult:{//坑位选择
      options:['1号坑','2号坑','3号坑','4号坑','5号坑',
      '6号坑','7号坑','8号坑','9号坑','10号坑',
      '11号坑','12号坑','13号坑','14号坑','15号坑',
      '16号坑','17号坑','18号坑','19号坑','20号坑',
      '21号坑','22号坑','23号坑','24号坑','25号坑',
      '26号坑','27号坑','28号坑','29号坑','30号坑',
      '31号坑','32号坑','33号坑','34号坑','35号坑',
      '36号坑','37号坑','38号坑'],
      values:[1,2,3,4,5,
      6,7,8,9,10,
      11,12,13,14,15,
      16,17,18,19,20,
      21,22,23,24,25,
      26,27,28,29,30,
      31,32,33,34,35,
      36,37,38]
    },
    soilResult:{//土壤类型选择
      options:['土壤一','土壤二','土壤三','土壤四','土壤五'],
      values:[1,2,3,4,5]
    },
    vehicleResult:{//载具选择
      options:['1号车'],
      values:[1]
    },
    queue:{             //排队信息
      curr:15,
      total:15
    },
    scheduling:{        //调度信息
      curr:0
    },
    intervalId:null,    
    positionIndex:0,    //位置选择下标
    soilIndex:0,        //土壤类型选择下标
    vehicleIndex:0,     //载具选择下标
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
    mapwidth:800,         //可视地图宽度
    mapheight:1000,        //可视地图高度
    windowWidth:0,        //窗口宽度
    windowHeight:0,       //窗口高度
    pitspositions:[{x:5,y:0},{x:6,y:0},
      {x:5,y:1},{x:6,y:1},
      {x:5,y:2},{x:6,y:2},
      {x:3,y:3},{x:4,y:3},{x:5,y:3},{x:6,y:3},
      {x:1,y:4},{x:2,y:4},{x:3,y:4},{x:4,y:4},{x:5,y:4},{x:6,y:4},
      {x:1,y:5},{x:2,y:5},{x:3,y:5},{x:4,y:5},{x:5,y:5},{x:6,y:5},
      {x:1,y:6},{x:2,y:6},{x:3,y:6},{x:4,y:6},{x:5,y:6},
      {x:0,y:7},{x:1,y:7},{x:2,y:7},{x:3,y:7},{x:4,y:7},{x:5,y:7},
      {x:0,y:8},{x:1,y:8},{x:2,y:8},{x:3,y:8},{x:4,y:8},],
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
    sizerate:0.5,      //地图缩放比例
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
      targetIP:'192.168.0.12',
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
  submitSelection:function(){//提交呼叫

    if(!this.isTcpConnected()){
      wx.showToast({
        title: '请先建立tcp连接！',
        icon:'error'
      })
      return;
    }

    let socket = this.data.tcpConnection.socket;

    /**目标坐标 */
    let x = this.data.targetPoint.realx;
    let y = this.data.targetPoint.realy;

    /**目标坑位 */
    let pit = this.data.positionResult.values[this.data.positionIndex];

    /**载具 */
    let vehicle = this.data.vehicleResult.values[this.data.vehicleIndex]

    /**土壤类型 */
    let soil = this.data.soilResult.values[this.data.soilIndex];

    console.log('submit selection',x,y);

    /**
     * 发送消息1
     * x;y;载具;坑位;土壤类型
     */
    socket.write('1;' + x + ';' + y + ';' + vehicle + ';' + pit + ';' + soil);

    wx.showToast({
      title: '发送成功',
    })

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

    //更新状态&页面
    this.setData({
      scheduling:{
        curr:0
      },
      currpage:'scheduling',
      onshade:true,
      onselect:false
    })

    // let id = setInterval(() => {
    //   this.setData({
    //     scheduling:{
    //       curr : this.data.scheduling.curr + 1
    //     }
    //   })
    //   if(this.data.scheduling.curr > 100){
    //     clearInterval(id);
    //     this.work();
    //   }
    // }, 50);
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
  pickPosition:function(e){ //选取目标坑位
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
  pickVehicle:function(e){//选取载具
    let index = e.detail.value;
    this.setData({
      vehicleIndex:index
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

    let rx = ((x + this.data.offsetx - this.data.basex * this.data.sizerate) / this.data.sizerate).toFixed(0);
    let ry = ((y + this.data.offsety - this.data.basey * this.data.sizerate) / this.data.sizerate).toFixed(0);
    
   let temp = this.checkTarget(rx,ry);
   rx = temp[0];
   ry = temp[1];
   

    this.setData({
      'targetPoint.x':x,
      'targetPoint.y':y,
      'targetPoint.realx':rx,
      'targetPoint.realy':ry,
    })

  },
  checkTarget:function(rx,ry){//校验目标坐标，不能超界且不能位于土坑内

    /**判断目标点是否在界限内 */
    rx = Math.max(0,rx);
    ry = Math.max(0,ry);
    rx = Math.min(this.data.flagPitIntervalx * 2 + this.data.pitsinterval * 7,rx);
    ry = Math.min(this.data.flagPitIntervaly * 2 + this.data.pitsinterval * 9,ry);

     /**
     * 判断目标点是否在土坑内
     * 是则需要纠正，转移到就近过道上
     */
    for(let i = 0,plx,ply,prx,pry;i < this.data.pitspositions.length;i++){
      plx = this.data.pitspositions[i].x;
      ply = this.data.pitspositions[i].y;

      /**分别计算该土坑的左上和右下顶点 */
      plx = this.data.flagPitIntervalx + this.data.pitsinterval * plx;
      ply = this.data.flagPitIntervaly + this.data.pitsinterval * ply;

      prx = plx + this.data.pitswidth;
      pry = ply + this.data.pitswidth;

      /**判断点是否在土坑内，是则修正到就近边*/
      if(rx > plx && rx < prx && ry > ply && ry < pry){
        let dx = Math.min(rx - plx,prx - rx);
        let dy = Math.min(ry - ply,pry - ry);

        if(dx < dy){
          rx = rx - plx < prx - rx ? plx : prx;
        }else{
          ry = ry - ply < pry - ry ? ply : pry;
        }

        rx = rx.toFixed(0);
        ry = ry.toFixed(0);
        break;
      }

    }

    return [rx,ry];
  },
  changeTarget(e){  //输入框更改定位信息
    // console.log(e);
    let id = e.target.id;
    let value = Number(e.detail.value);
    
    let rx = this.data.targetPoint.realx;
    let ry = this.data.targetPoint.realy;

    if(id == 'target-x'){
      value = Math.min(this.data.flagPitIntervalx * 2 + this.data.pitsinterval * 5,Math.max(0,value));
      rx = value;
    }else{
      value = Math.min(this.data.flagPitIntervaly * 2 + this.data.pitsinterval * 5,Math.max(0,value));
      ry = value;
    }

    let temp = this.checkTarget(rx,ry);
    rx = temp[0];
    ry = temp[1];

    this.setData({
      'targetPoint.realx':rx,
      'targetPoint.realy':ry
    })
  },
  addsizerate:function(){ //增加地图缩放比例

    let ofx = this.data.offsetx;
    let ofy = this.data.offsety;

    ofx /= this.data.sizerate;
    ofy /= this.data.sizerate;

    let sizerate = Math.min(this.data.sizeratemax,this.data.sizerate + 0.25);

    ofx *= sizerate;
    ofy *= sizerate;

    this.setData({
      sizerate:sizerate,
      offsetx:ofx,
      offsety:ofy
    })
  },
  subsizerate:function(){ //减小地图缩放比例

    let ofx = this.data.offsetx;
    let ofy = this.data.offsety;

    ofx /= this.data.sizerate;
    ofy /= this.data.sizerate;

    let sizerate = Math.min(this.data.sizeratemax,this.data.sizerate - 0.25);

    ofx *= sizerate;
    ofy *= sizerate;

    this.setData({
      sizerate:sizerate,
      offsetx:ofx,
      offsety:ofy
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
      let buffer = res.message
      var dataview = new DataView(buffer);
      var ints = new Uint8Array(buffer.byteLength);
      var str = '';
      for (var i = 0; i < ints.length; i++) {
        str += String.fromCharCode(dataview.getUint8(i));
      }

      console.log(str);
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
    return this.data.tcpConnection.note == '已连接' || this.data.tcpConnection == '连接中'
  },
  setVehiclePosition(x,y){//更新地图中载具位置

    x = Number(x).toFixed(0);
    y = Number(y).toFixed(0);
    this.setData({
      'vehicle.position':{
        x:x,
        y:y
      }
    })
  }
})