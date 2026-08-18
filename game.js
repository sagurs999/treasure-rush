/* TREASURE RUSH PRO
   Replace AD_ZONE_ID with your Monetag MAIN zone ID.
   Keep the exact Monetag SDK script from your dashboard in index.html.
*/

const AD_ZONE_ID = "YOUR_ZONE_ID";
const COINS_PER_REWARDED_AD = 20;
const LEVEL_TIME = 45;
const SAVE_KEY = "treasure_rush_pro_v1";

const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
const stats = {
  coins:Number(saved.coins||0),
  gems:Number(saved.gems||0),
  best:Number(saved.best||0),
  level:Math.max(1,Number(saved.level||1)),
  totalGames:Number(saved.totalGames||0),
  adRewards:Number(saved.adRewards||0)
};
function saveStats(){localStorage.setItem(SAVE_KEY,JSON.stringify(stats));}

try{
  if(window.Telegram?.WebApp){
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    Telegram.WebApp.setHeaderColor("#07131b");
    Telegram.WebApp.setBackgroundColor("#07131b");
  }
}catch(e){}

let adBusy=false;
function getAdFunction(){
  if(!AD_ZONE_ID || AD_ZONE_ID==="YOUR_ZONE_ID") return null;
  return window["show_"+AD_ZONE_ID];
}
async function showRewardedAd(reason="reward"){
  if(adBusy) return false;
  const fn=getAdFunction();
  if(typeof fn!=="function"){
    alert("Monetag is not connected yet. Paste your Monetag SDK tag in index.html and set AD_ZONE_ID in game.js.");
    return false;
  }
  adBusy=true;
  try{
    await fn({type:"end",ymid:String(Date.now()),requestVar:reason});
    return true;
  }catch(e){
    console.warn("Rewarded ad failed:",e);
    return false;
  }finally{adBusy=false;}
}

const MAPS=[
 {name:"Emerald Valley",sky:"#0b3550",ground:"#247743",road:"#174f39",edge:"#3aa36a",accent:"#ffd447",accent2:"#56d8ff",fog:"#2b8c61",tree:"#0f5a3d",rock:"#426a58"},
 {name:"Golden Desert",sky:"#4c2d24",ground:"#b36d32",road:"#7b492d",edge:"#e1a34b",accent:"#ffe17a",accent2:"#6fd7ff",fog:"#d3944b",tree:"#795333",rock:"#72503a"},
 {name:"Moonlit Ruins",sky:"#10183e",ground:"#26355c",road:"#1b2547",edge:"#5b70c9",accent:"#7ee8ff",accent2:"#b76cff",fog:"#3b4b8b",tree:"#18234c",rock:"#59617e"},
 {name:"Volcano Pass",sky:"#351315",ground:"#6d2a1f",road:"#431d1a",edge:"#d44a2e",accent:"#ffcc44",accent2:"#ff6b35",fog:"#9a3a27",tree:"#48251e",rock:"#3c3030"},
 {name:"Sky Temple",sky:"#1b3e62",ground:"#5a7f91",road:"#31566d",edge:"#a8e7ff",accent:"#ffe36e",accent2:"#d8b3ff",fog:"#7baec4",tree:"#3c6472",rock:"#738b99"}
];

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hex=c=>Phaser.Display.Color.HexStringToColor(c).color;
function txt(s,t,x,y,size=24,color="#fff",origin=.5){
  return s.add.text(x,y,t,{fontFamily:"Arial",fontSize:size+"px",fontStyle:"bold",color,stroke:"#000",strokeThickness:size>=24?2:1}).setOrigin(origin);
}
function panel(s,x,y,w,h,fill,alpha=1,stroke=null){
  const g=s.add.graphics();
  g.fillStyle(fill,alpha);g.fillRoundedRect(x-w/2,y-h/2,w,h,Math.min(24,h/3));
  if(stroke!==null){g.lineStyle(2,stroke,.45);g.strokeRoundedRect(x-w/2,y-h/2,w,h,Math.min(24,h/3));}
  return g;
}

class Boot extends Phaser.Scene{
  constructor(){super("Boot")}
  create(){
    this.cameras.main.setBackgroundColor("#07131b");
    txt(this,"💎",450,260,72,"#7ee8ff");
    txt(this,"TREASURE RUSH",450,340,38,"#ffe05a");
    txt(this,"loading...",450,385,17,"#b8c9d3");
    this.time.delayedCall(300,()=>this.scene.start("Menu"));
  }
}

class Menu extends Phaser.Scene{
  constructor(){super("Menu")}
  create(){
    const m=MAPS[Math.min(stats.level-1,MAPS.length-1)];
    this.cameras.main.setBackgroundColor(m.sky);
    for(let i=0;i<20;i++)this.add.circle(Phaser.Math.Between(0,900),Phaser.Math.Between(60,700),Phaser.Math.Between(25,70),hex(m.fog),.10);

    txt(this,"💎",450,72,54,m.accent2);
    txt(this,"TREASURE",450,140,54,m.accent);
    txt(this,"RUSH",450,205,66,m.accent2);

    panel(this,450,295,650,105,0x071b16,.78,hex(m.edge));
    txt(this,"COINS",310,274,15,"#a8bdb5");txt(this,String(stats.coins),310,316,30,m.accent);
    txt(this,"GEMS",450,274,15,"#a8bdb5");txt(this,String(stats.gems),450,316,30,m.accent2);
    txt(this,"BEST",590,274,15,"#a8bdb5");txt(this,String(stats.best),590,316,30,"#fff");

    panel(this,450,405,650,78,0x24b957,.96,0x7dff9a);
    txt(this,`▶  PLAY LEVEL ${stats.level}`,450,405,30);
    this.add.rectangle(450,405,650,78,0,0).setInteractive().on("pointerdown",()=>this.scene.start("Runner",{level:stats.level}));

    [["🎯","MISSIONS",230],["🏆","LEADERBOARD",450],["👤","PROFILE",670]].forEach(([i,l,x])=>{
      panel(this,x,500,190,70,0x0c3327,.9,hex(m.edge));
      txt(this,i,x,486,28);txt(this,l,x,523,14,"#d7e5df");
      this.add.rectangle(x,500,190,70,0,0).setInteractive().on("pointerdown",()=>this.scene.start(l==="MISSIONS"?"Missions":l==="LEADERBOARD"?"Leaderboard":"Profile"));
    });

    panel(this,450,585,300,48,0x7b2d2d,.92);
    txt(this,"💸  WITHDRAW",450,585,18);
    this.add.rectangle(450,585,300,48,0,0).setInteractive().on("pointerdown",()=>this.scene.start("Withdraw"));
    txt(this,"20,000 coins = $1  •  minimum withdrawal $100",450,635,15,"#a8bdb5");
    txt(this,`Next map: ${MAPS[Math.min(stats.level,MAPS.length-1)].name}`,450,670,14,m.accent2);
  }
}

class Runner extends Phaser.Scene{
  constructor(){super("Runner")}
  init(data){
    this.level=clamp(Number(data.level||1),1,MAPS.length);
    this.map=MAPS[this.level-1];
    this.lane=1;this.coins=0;this.gems=0;this.score=0;this.left=LEVEL_TIME;
    this.speed=.85+this.level*.08;this.spawnClock=0;this.elapsed=0;this.objects=[];this.finished=false;this.pointerStartX=null;
  }
  create(){
    this.cameras.main.setBackgroundColor(this.map.sky);
    this.sky=this.add.graphics();this.distant=this.add.graphics();this.road=this.add.graphics();
    this.decor=[];
    for(let i=0;i<14;i++)this.decor.push({side:i%2?-1:1,z:Phaser.Math.FloatBetween(.05,1),kind:i%3});
    this.playerShadow=this.add.ellipse(450,555,72,24,0x000000,.28);
    this.player=this.add.container(450,525);
    this.player.add(this.add.ellipse(0,20,46,15,0x000000,.35));
    const body=this.add.circle(0,-8,25,0xffa64d);body.setStrokeStyle(4,0xffffff,.9);
    this.player.add([body,this.add.circle(-8,-13,4,0x18212b),this.add.circle(8,-13,4,0x18212b),this.add.rectangle(0,10,42,7,hex(this.map.accent2))]);
    this.runTween=this.tweens.add({targets:this.player,y:"-=7",duration:300,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

    this.input.on("pointerdown",p=>this.pointerStartX=p.x);
    this.input.on("pointerup",p=>{if(this.pointerStartX!==null){const dx=p.x-this.pointerStartX;if(Math.abs(dx)>35)this.changeLane(dx>0?1:-1);this.pointerStartX=null;}});

    panel(this,450,42,820,55,0x061a14,.84,hex(this.map.edge));
    txt(this,`LEVEL ${this.level}`,75,42,17,this.map.accent,0);
    this.timerTxt=txt(this,`⏱ ${this.left}`,275,42,18);
    this.coinTxt=txt(this,"🪙 0",455,42,18,this.map.accent);
    this.gemTxt=txt(this,"💎 0",585,42,18,this.map.accent2);
    this.scoreTxt=txt(this,"⭐ 0",710,42,18);
    panel(this,450,90,480,40,0x061a14,.62,hex(this.map.edge));
    txt(this,this.map.name,450,90,15,"#d6e7df");

    panel(this,92,550,118,70,0x0a1d18,.72,0xffffff);
    txt(this,"◀",65,550,34);txt(this,"▶",119,550,34);
    this.add.rectangle(92,550,118,70,0,0).setInteractive().on("pointerdown",p=>this.changeLane(p.x<92?-1:1));
    txt(this,"SWIPE  ◀   ▶",450,620,14,"#b7c9c1");

    this.timerEvent=this.time.addEvent({delay:1000,loop:true,callback:()=>{if(this.finished)return;this.left--;this.timerTxt.setText(`⏱ ${this.left}`);if(this.left<=0)this.finishLevel();}});
  }
  changeLane(d){if(!this.finished)this.lane=clamp(this.lane+d,0,2)}
  laneX(l,z){return 450+(l-1)*(360*(.16+z*.84))}
  projectY(z){return 165+Math.pow(clamp(z,0,1),1.45)*(560-165)}
  spawnObject(){
    const r=Math.random(),type=r<.58?"coin":r<.72?"gem":r<.88?"obstacle":"chest";
    this.objects.push({lane:Phaser.Math.Between(0,2),z:.02,type,hit:false});
  }
  drawSky(){
    this.sky.clear();this.sky.fillStyle(hex(this.map.sky),1);this.sky.fillRect(0,0,900,720);
    this.sky.fillStyle(hex(this.map.accent),.22);this.sky.fillCircle(740,125,72);
    this.sky.fillStyle(hex(this.map.accent),.86);this.sky.fillCircle(740,125,34);
    this.distant.clear();this.distant.fillStyle(hex(this.map.tree),1);this.distant.beginPath();this.distant.moveTo(0,265);
    for(let x=0;x<=900;x+=90){this.distant.lineTo(x,230+((x/90)%3)*20);this.distant.lineTo(x+45,265);}
    this.distant.lineTo(900,350);this.distant.lineTo(0,350);this.distant.closePath();this.distant.fillPath();
  }
  drawRoad(){
    const g=this.road;g.clear();
    g.fillStyle(hex(this.map.ground),1);g.fillRect(0,260,900,460);
    g.fillStyle(hex(this.map.road),1);g.beginPath();g.moveTo(385,165);g.lineTo(515,165);g.lineTo(835,720);g.lineTo(65,720);g.closePath();g.fillPath();
    g.lineStyle(6,hex(this.map.edge),.75);g.beginPath();g.moveTo(385,165);g.lineTo(65,720);g.moveTo(515,165);g.lineTo(835,720);g.strokePath();
    g.lineStyle(4,hex(this.map.edge),.38);
    for(let lane=1;lane<3;lane++){const tx=450+(lane-1.5)*43,bx=450+(lane-1.5)*230;g.beginPath();g.moveTo(tx,165);g.lineTo(bx,720);g.strokePath();}
    for(let i=0;i<9;i++){const z=((this.elapsed*.001*this.speed)+i/9)%1,y=this.projectY(z);g.fillStyle(hex(this.map.edge),.18);g.fillRect(300,y,300,3+z*10);}
  }
  drawObject(o){
    const x=this.laneX(o.lane,o.z),y=this.projectY(o.z),s=.22+o.z*1.05;
    if(!o.view)o.view=this.add.container(x,y).setDepth(10);
    o.view.setPosition(x,y).setScale(s);
    if(!o.view.list.length){
      if(o.type==="coin"){const c=this.add.circle(0,0,22,hex(this.map.accent));c.setStrokeStyle(4,0xffffff,.75);o.view.add([c,this.add.rectangle(0,0,4,28,0xffffff,.5)]);}
      else if(o.type==="gem"){const d=this.add.polygon(0,0,[0,-26,22,0,0,26,-22,0],hex(this.map.accent2));d.setStrokeStyle(3,0xffffff,.7);o.view.add(d);}
      else if(o.type==="chest"){const b=this.add.rectangle(0,5,50,34,0x9a5a25);b.setStrokeStyle(4,hex(this.map.accent),.8);o.view.add([b,this.add.rectangle(0,5,9,13,hex(this.map.accent))]);}
      else{o.view.add(this.add.polygon(0,0,[0,-28,25,22,-25,22],hex(this.map.accent2)).setStrokeStyle(4,0xffffff,.35));}
    }
  }
  collect(o){
    o.hit=true;o.view?.destroy(true);
    if(o.type==="coin"){this.coins++;this.score+=10}
    if(o.type==="gem"){this.gems++;this.score+=50}
    if(o.type==="chest"){this.coins+=15;this.score+=150}
    this.hud();
  }
  obstacle(o){
    o.hit=true;o.view?.destroy(true);this.score=Math.max(0,this.score-100);this.cameras.main.shake(180,.008);this.hud();
  }
  hud(){this.coinTxt.setText(`🪙 ${this.coins}`);this.gemTxt.setText(`💎 ${this.gems}`);this.scoreTxt.setText(`⭐ ${this.score}`);}
  update(time,delta){
    if(this.finished)return;
    this.elapsed+=delta;this.drawSky();this.drawRoad();
    const target=[300,450,600][this.lane];this.player.x=Phaser.Math.Linear(this.player.x,target,.14);this.playerShadow.x=this.player.x;
    this.spawnClock+=delta;
    if(this.spawnClock>Math.max(430,820-this.level*55)){this.spawnClock=0;this.spawnObject();if(Math.random()<.18)this.spawnObject();}
    for(const o of this.objects){
      if(o.hit)continue;o.z+=.00048*delta*this.speed*(1+this.level*.04);this.drawObject(o);
      if(o.z>.86&&o.z<1.02&&o.lane===this.lane){if(o.type==="obstacle")this.obstacle(o);else this.collect(o);}
      if(o.z>1.12){o.hit=true;o.view?.destroy(true);}
    }
    this.objects=this.objects.filter(o=>!o.hit);
  }
  finishLevel(){
    if(this.finished)return;this.finished=true;this.timerEvent?.remove(false);this.runTween?.pause();
    stats.totalGames++;stats.best=Math.max(stats.best,this.score);stats.coins+=this.coins;stats.gems+=this.gems;saveStats();
    this.scene.pause();this.scene.launch("LevelResult",{level:this.level,coins:this.coins,gems:this.gems,score:this.score});
  }
}

class LevelResult extends Phaser.Scene{
  constructor(){super("LevelResult")}
  init(d){this.d=d;this.map=MAPS[d.level-1]}
  create(){
    const d=this.d,m=this.map;this.cameras.main.setBackgroundColor("#07131b");
    panel(this,450,330,760,500,0x0c211a,.98,hex(m.edge));
    txt(this,"LEVEL COMPLETE!",450,155,40,m.accent);
    txt(this,`LEVEL ${d.level} • ${m.name}`,450,195,18,"#b7c9c1");
    txt(this,`🪙 +${d.coins}`,450,255,28,m.accent);txt(this,`💎 +${d.gems}`,450,300,25,m.accent2);txt(this,`⭐ ${d.score}`,450,345,28);
    if(d.level<MAPS.length){
      txt(this,`NEXT MAP: ${MAPS[d.level].name}`,450,395,18,"#d9e8e1");
      panel(this,450,470,510,65,0x24b957,.96,0x7dff9a);
      txt(this,"▶  WATCH AD & NEXT LEVEL",450,470,20);
      const next=this.add.rectangle(450,470,510,65,0,0).setInteractive();
      next.on("pointerdown",async()=>{
        next.disableInteractive();
        const ok=await showRewardedAd("level_complete");
        if(!ok){next.setInteractive();return;}
        stats.level=Math.min(MAPS.length,d.level+1);saveStats();
        this.scene.stop("Runner");this.scene.start("Runner",{level:stats.level});
      });
      txt(this,"Rewarded ad appears at the natural level break.",450,520,13,"#93aaa0");
    }else{
      txt(this,"🏆 ALL MAPS CLEARED!",450,410,25,m.accent);
      panel(this,450,475,350,62,0x286090,.95);txt(this,"⌂  HOME",450,475,20);
      this.add.rectangle(450,475,350,62,0,0).setInteractive().on("pointerdown",()=>this.scene.start("Menu"));
    }
    panel(this,450,585,350,55,0x17342a,.95,hex(m.edge));
    txt(this,"💰 WATCH AD  +20 COINS",450,585,15,m.accent);
    this.add.rectangle(450,585,350,55,0,0).setInteractive().on("pointerdown",async()=>{
      const ok=await showRewardedAd("result_bonus");
      if(ok){stats.coins+=COINS_PER_REWARDED_AD;stats.adRewards++;saveStats();txt(this,"+20 COINS ADDED!",450,650,18,"#71e0a0");}
    });
  }
}

class Profile extends Phaser.Scene{
  constructor(){super("Profile")}
  create(){
    this.cameras.main.setBackgroundColor("#0b241b");txt(this,"👤 PROFILE",450,80,40,"#ffe05a");
    panel(this,450,310,650,430,0x0e3024,.95,0x4fa67b);
    [["TREASURE RUNNER",165,25,"#fff"],[`🪙 Coins: ${stats.coins}`,225,24,"#ffe05a"],[`💎 Gems: ${stats.gems}`,270,22,"#8de8ff"],[`🏆 Best Score: ${stats.best}`,315,22,"#fff"],[`🎮 Games: ${stats.totalGames}`,360,22,"#fff"],[`📺 Rewarded ads: ${stats.adRewards}`,405,22,"#9ee6b7"],[`🗺 Highest level: ${stats.level}`,450,22,"#fff"]].forEach(r=>txt(this,r[0],450,r[1],r[2],r[3]));
    panel(this,450,520,280,55,0x286090);txt(this,"← HOME",450,520,20);this.add.rectangle(450,520,280,55,0,0).setInteractive().on("pointerdown",()=>this.scene.start("Menu"));
  }
}

class Missions extends Phaser.Scene{
  constructor(){super("Missions")}
  create(){
    this.cameras.main.setBackgroundColor("#0b241b");txt(this,"🎯 MISSIONS",450,75,40,"#ffe05a");
    panel(this,450,320,680,500,0x0e3024,.95,0x4fa67b);
    [["Collect 100 coins","+500 coins"],["Finish a level","+1,000 coins"],["Find a treasure chest","+250 coins"],["Watch a rewarded ad","+20 coins"]].forEach((r,i)=>{
      const y=175+i*82;panel(this,450,y,560,62,0x123b2d,.95,0x3f8566);txt(this,r[0],195,y,18,"#fff",0);txt(this,r[1],700,y,17,"#ffe05a",1);
    });
    panel(this,450,560,280,52,0x286090);txt(this,"← HOME",450,560,19);this.add.rectangle(450,560,280,52,0,0).setInteractive().on("pointerdown",()=>this.scene.start("Menu"));
  }
}

class Leaderboard extends Phaser.Scene{
  constructor(){super("Leaderboard")}
  create(){
    this.cameras.main.setBackgroundColor("#0b241b");txt(this,"🏆 LEADERBOARD",450,75,40,"#ffe05a");
    panel(this,450,330,680,520,0x0e3024,.95,0x4fa67b);
    [["1","Alex","25,000"],["2","Emma","22,500"],["3","John","21,700"],["4","You",String(stats.best)]].forEach((r,i)=>{
      const y=175+i*78;panel(this,450,y,560,60,i===3?0x153e2f:0x12352a,.95);txt(this,`${r[0]}. ${r[1]}`,210,y,19,i===3?"#71e0a0":"#fff",0);txt(this,r[2],690,y,18,"#ffe05a",1);
    });
    txt(this,"Demo leaderboard — connect your database later.",450,505,13,"#839c91");
    panel(this,450,560,280,52,0x286090);txt(this,"← HOME",450,560,19);this.add.rectangle(450,560,280,52,0,0).setInteractive().on("pointerdown",()=>this.scene.start("Menu"));
  }
}

class Withdraw extends Phaser.Scene{
  constructor(){super("Withdraw")}
  create(){
    this.cameras.main.setBackgroundColor("#0b241b");txt(this,"💸 WITHDRAW",450,75,40,"#ffe05a");
    panel(this,450,280,650,430,0x0e3024,.95,0x4fa67b);
    txt(this,"AVAILABLE BALANCE",450,160,16,"#9fb8ae");txt(this,`🪙 ${stats.coins}`,450,205,32,"#ffe05a");
    txt(this,`$${(stats.coins/20000).toFixed(2)}`,450,250,38,"#71e0a0");txt(this,"Minimum withdrawal: $100",450,295,17,"#ffb6b6");
    ["PayPal","Crypto","Other"].forEach((m,i)=>{const x=280+i*170;panel(this,x,370,145,52,0x286090);txt(this,m,x,370,16);this.add.rectangle(x,370,145,52,0,0).setInteractive().on("pointerdown",()=>this.notice(m+" selected"));});
    panel(this,450,455,320,55,0x7b2d2d);txt(this,"REQUEST WITHDRAW",450,455,17);this.add.rectangle(450,455,320,55,0,0).setInteractive().on("pointerdown",()=>this.notice(stats.coins>=2000000?"Request submitted":"Need 2,000,000 coins"));
    panel(this,450,555,250,50,0x286090);txt(this,"← HOME",450,555,18);this.add.rectangle(450,555,250,50,0,0).setInteractive().on("pointerdown",()=>this.scene.start("Menu"));
  }
  notice(msg){if(this.n)this.n.destroy();this.n=txt(this,msg,450,635,16);this.time.delayedCall(1800,()=>this.n?.destroy())}
}

new Phaser.Game({
  type:Phaser.AUTO,parent:"game-container",width:900,height:720,backgroundColor:"#07131b",
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  render:{antialias:true,pixelArt:false,roundPixels:true},
  input:{activePointers:3},
  scene:[Boot,Menu,Runner,LevelResult,Profile,Missions,Leaderboard,Withdraw]
});
