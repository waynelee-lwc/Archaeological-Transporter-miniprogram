let app = getApp();


Page({
  data:{
    canvas:null,
    ctx:null,
    onshade:false,
    currpage:"selecting",
    onselect:false,
    pages:[{
      name:'选车',
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
    queue:{
      curr:15,
      total:15
    },
    scheduling:{
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
    pitswidth:90,
    pitsinterval:150,
    pitspositions:[{x:5,y:0},{x:6,y:0},
      {x:5,y:1},{x:6,y:1},
      {x:5,y:2},{x:6,y:2},
      {x:3,y:3},{x:4,y:3},{x:5,y:3},{x:6,y:3},
      {x:1,y:4},{x:2,y:4},{x:3,y:4},{x:4,y:4},{x:5,y:4},{x:6,y:4},
      {x:1,y:5},{x:2,y:5},{x:3,y:5},{x:4,y:5},{x:5,y:5},{x:6,y:5},
      {x:1,y:6},{x:2,y:6},{x:3,y:6},{x:4,y:6},{x:5,y:6},
      {x:0,y:7},{x:1,y:7},{x:2,y:7},{x:3,y:7},{x:4,y:7},{x:5,y:7},
      {x:0,y:8},{x:1,y:8},{x:2,y:8},{x:3,y:8},{x:4,y:8},],
    offsetx:0,
    offsety:0,
    offsetxmax:400,
    offsetymax:400,
    touchx:0,
    touchy:0,
    sizerate:0.75,
    sizeratemax:2,
    sizeraetmin:0.75,
    tcpConnection:{
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
      targetIP:'127.0.0.0',
      targetPort:0,
      isSelecting:false
    }
  },
  onLoad:function(){

    console.log(wx.canIUse('createTCPSocket'));
    wx.createSelectorQuery().select('#canvas').node().exec((res)=>{
      // this.data.canvas = res[0].node;
      // this.data.ctx = this.data.canvas.getContext('2d');

      // wx.getSystemInfo({
      //   success: (result) => {
      //     this.data.canvas.height = result.windowHeight;
      //     this.data.canvas.width = result.windowWidth;
      //   },
      // })

    })
  },
  hideshade:function(){
    this.setData({
      onshade:false
    })

  },
  showshade:function(type){
    this.setData({
      onshade:true,
      shadepage:type
    })
  },
  hideselectform:function(){
    this.setData({
      onselect:false
    })
  },
  showselectfomr:function(){
    this.setData({
      onshade:false,
      onselect:true,
      shadepage:'selecting'
    })
  },
  tapshort:function(e){
    let type = e.target.dataset.value;
    console.log(e);
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
  pickSoil:function(e){
    let index = e.detail.value;
    this.setData({
      soilIndex:index
    })
  },
  touchmove:function(e){
    let dx = e.touches[0].clientX;
    let dy = e.touches[0].clientY;
    let x = Math.max(Math.min(this.data.touchx - dx + this.data.offsetx,this.data.offsetxmax * this.data.sizerate),0);
    let y = Math.max(Math.min(this.data.touchy - dy + this.data.offsety,this.data.offsetymax * this.data.sizerate),0);
    this.setData({
      offsetx:x,
      offsety:y,
      touchx:dx,
      touchy:dy
    })
    console.log(this.data.offsetx,this.data.offsety);
  },
  touchstart:function(e){
    // console.log(e);
    let x = e.touches[0].clientX;
    let y = e.touches[0].clientY;
    this.setData({
      touchx:x,
      touchy:y
    })
  },
  touchend:function(e){
    this.setData({
      touchx:0,
      touchy:0
    })
  },
  addsizerate:function(){

    let sizerate = Math.min(this.data.sizeratemax,this.data.sizerate + 0.25);
    this.setData({
      sizerate:sizerate,
      offsetx:0,
      offsety:0
    })
  },
  subsizerate:function(){
    let sizerate = Math.max(this.data.sizeraetmin,this.data.sizerate - 0.25);
    this.setData({
      sizerate:sizerate,
      offsetx:0,
      offsety:0
    })
  },
  tcpConnect:function(){

    // wx.request({
    //   url: 'http://192.168.0.12:3000',
    //   success:(res)=>{
    //     console.log(res.data);
    //     this.setData({
    //       'tcpConnection.note':res.data
    //     })
    //   }
    // })




    let socket = wx.createTCPSocket();
    console.log(socket);

    console.log(this.data.tcpConnection.targetIP,this.data.tcpConnection.targetPort);
    socket.connect({
      address:this.data.tcpConnection.targetIP,
      port:this.data.tcpConnection.targetPort
    })

    this.setData({
      'tcpConnection.tipColor':this.data.tcpConnection.connResults.connecting.tipColor,
      'tcpConnection.note':this.data.tcpConnection.connResults.connecting.note
    })

    setTimeout(() => {
      if(!socket || this.data.tcpConnection.tipColor == 'yellow'){
        this.setData({
          'tcpConnection.tipColor':this.data.tcpConnection.connResults.unconnected.tipColor,
          'tcpConnection.note':this.data.tcpConnection.connResults.unconnected.note
        })
      }
    }, 10000);

    socket.onConnect(()=>{
      this.setData({
        'tcpConnection.tipColor':this.data.tcpConnection.connResults.success.tipColor,
        'tcpConnection.note':this.data.tcpConnection.connResults.success.note
      })
      setInterval(() => {
        socket.write('hello');
      },2000);
    })

    socket.onError(()=>{
      this.setData({
        'tcpConnection.tipColor':this.data.tcpConnection.connResults.unconnected.tipColor,
        'tcpConnection.note':this.data.tcpConnection.connResults.unconnected.note
      })
    })

    console.log('连接中...');

    this.tcpCancel();
  },
  tcpCancel:function(){
    this.setData({
      'tcpConnection.isSelecting':false
    })
  },
  tcpSetData:function(){
    if(this.data.tcpConnection.tipColor == 'yellow'){
      return;
    }
    this.setData({
      'tcpConnection.isSelecting':true
    })
  },
  tcpTargetIpInput:function(e){
    let value = e.detail.value;
    this.setData({
      'tcpConnection.targetIP':value
    })
  },
  tcpTargetPortInput:function(e){
    let value = e.detail.value;
    this.setData({
      'tcpConnection.targetPort':value
    })
  }
})