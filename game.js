const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const KEY="treasureRushProV2";
const defaults={coins:0,gems:0,cash:0,runs:0,best:0,level:1,referrals:0,refCash:0,ads:0,spinClaimed:0};
let S={...defaults,...(JSON.parse(localStorage.getItem(KEY)||"null")||{})};
let pendingReward=null, adBusy=false;
function save(){localStorage.setItem(KEY,JSON.stringify(S));updateUI()}
function coinCash(){return S.coins/20000}
function totalCash(){return coinCash()+S.cash+S.refCash}
function money(n=S.cash){return Number(n).toFixed(3)}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>e.classList.remove("show"),2200)}
function updateUI(){
 ["coinTop","homeCoins","pCoins"].forEach(id=>$("#"+id).textContent=S.coins);
 ["gemTop","homeGems","pGems"].forEach(id=>$("#"+id).textContent=S.gems);
 $("#cashTop").textContent="$"+money(totalCash());$("#withdrawCash").textContent=money(totalCash());
 $("#coinValue").textContent=money(coinCash());$("#cashValue").textContent=money(S.cash+S.refCash);$("#pCash").textContent="$"+money(totalCash());
 $("#homeBest").textContent=S.best;$("#leaderBest").textContent=S.best;$("#pBest").textContent=S.best;$("#pRuns").textContent=S.runs;$("#pRefs").textContent=S.referrals;$("#refCount").textContent=S.referrals;$("#refCash").textContent=S.refCash.toFixed(3);
 $("#nextMap").textContent=MAPS[S.level%MAPS.length].name;$("#playBtn").textContent="▶ PLAY LEVEL "+S.level;
 $("#refCode").textContent=getRefCode();
}
function hashCode(x){let h=2166136261;for(let i=0;i<x.length;i++)h=Math.imul(h^x.charCodeAt(i),16777619);return (h>>>0).toString(36).toUpperCase()}
function getRefCode(){let c=localStorage.getItem("treasureRefCode");if(!c){c="TR-"+hashCode(cryptoRandom());localStorage.setItem("treasureRefCode",c)}return c}
function cryptoRandom(){return String(Date.now())+Math.random()+navigator.userAgent}
function showScreen(id){$$('.screen').forEach(x=>x.classList.remove('active'));$("#"+id).classList.add('active');updateUI()}
$$('[data-screen]').forEach(b=>b.onclick=()=>showScreen(b.dataset.screen));
$("#playBtn").onclick=startRun;$("#homeAfterRun").onclick=()=>showScreen('home');

const MAPS=[
 {name:"Emerald Valley",sky:["#062f43","#0c5360"],ground:"#17633e",road:"#0c3b30",accent:"#41e6a0",hazard:"#b53e51",fog:"#8affcf"},
 {name:"Golden Desert",sky:["#391b31","#b85d28"],ground:"#c17a2c",road:"#71411f",accent:"#ffd45c",hazard:"#8f3547",fog:"#ffe4a0"},
 {name:"Crystal City",sky:["#08184b","#174e9c"],ground:"#203d78",road:"#102a52",accent:"#58e8ff",hazard:"#dc3e78",fog:"#8adfff"},
 {name:"Frozen Kingdom",sky:["#071d37","#7cb6d3"],ground:"#5f99ad",road:"#294f66",accent:"#d9ffff",hazard:"#8d3c75",fog:"#dffbff"},
 {name:"Volcano Escape",sky:["#18060e","#9c2419"],ground:"#67251b",road:"#321519",accent:"#ffad42",hazard:"#ff3c3c",fog:"#ffae66"},
 {name:"Moon Temple",sky:["#09051f","#243b80"],ground:"#273c5b",road:"#17253d",accent:"#b89cff",hazard:"#e64b9b",fog:"#c8b7ff"}
];
let G=null,raf=0;const canvas=$("#gameCanvas"),ctx=canvas.getContext("2d");
function resize(){const d=devicePixelRatio||1;canvas.width=Math.max(1,Math.floor(canvas.clientWidth*d));canvas.height=Math.max(1,Math.floor(canvas.clientHeight*d));ctx.setTransform(d,0,0,d,0,0)}
addEventListener('resize',resize);resize();
function startRun(){showScreen('game');resize();const m=MAPS[(S.level-1)%MAPS.length];$("#mapName").textContent=m.name;G={map:m,time:60,health:3,lane:1,targetLane:1,jump:0,coins:0,gems:0,score:0,speed:4,spawn:.25,items:[],obstacles:[],last:performance.now(),paused:false,inv:0};$("#levelHud").textContent=S.level;cancelAnimationFrame(raf);loop()}
function laneX(l){return canvas.clientWidth*(.5+(l-1)*.25)}
function playerY(){return canvas.clientHeight-90-(G.jump>0?Math.sin(G.jump*Math.PI)*75:0)}
function spawnItem(){const lane=Math.floor(Math.random()*3),r=Math.random();G.items.push({lane,z:0,type:r<.72?'coin':r<.91?'gem':'boost'})}
function spawnObstacle(){G.obstacles.push({lane:Math.floor(Math.random()*3),z:0,type:Math.random()<.2?'rock':'barrier'})}
function drawRunner(x,y){ctx.save();ctx.translate(x,y);const run=Math.sin(performance.now()/85)*7;ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(0,27,25,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6b3c22';ctx.roundRect(-18,-25,11,29,4);ctx.fill();ctx.strokeStyle='#17202a';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-7,12);ctx.lineTo(-15+run,39);ctx.moveTo(7,12);ctx.lineTo(15-run,39);ctx.stroke();ctx.strokeStyle='#f3f7fa';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-18+run,39);ctx.lineTo(-29+run,39);ctx.moveTo(18-run,39);ctx.lineTo(29-run,39);ctx.stroke();ctx.fillStyle='#2fd18b';ctx.beginPath();ctx.roundRect(-15,-36,30,50,10);ctx.fill();ctx.fillStyle='#ffc18c';ctx.strokeStyle='#ffc18c';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-12,-25);ctx.lineTo(-25-run/2,-5);ctx.moveTo(12,-25);ctx.lineTo(25+run/2,-8);ctx.stroke();ctx.beginPath();ctx.arc(0,-53,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1f2634';ctx.beginPath();ctx.arc(0,-58,16,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='8px Arial';ctx.textAlign='center';ctx.fillText('R',0,-49);ctx.restore()}
function drawPursuer(x,y){ctx.save();ctx.translate(x,y);const bob=Math.sin(performance.now()/100)*3;ctx.fillStyle='#69152f';ctx.beginPath();ctx.roundRect(-24,-54+bob,48,72,18);ctx.fill();ctx.fillStyle='#25111e';ctx.beginPath();ctx.arc(0,-60+bob,20,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff3c5a';ctx.beginPath();ctx.arc(-7,-62+bob,3.5,0,Math.PI*2);ctx.arc(7,-62+bob,3.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f14b5b';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-18,10);ctx.lineTo(-31,31);ctx.moveTo(18,10);ctx.lineTo(31,31);ctx.stroke();ctx.restore()}
function drawWorld(){const w=canvas.clientWidth,h=canvas.clientHeight,m=G.map;ctx.clearRect(0,0,w,h);const grd=ctx.createLinearGradient(0,0,0,h);grd.addColorStop(0,m.sky[0]);grd.addColorStop(.55,m.sky[1]);grd.addColorStop(.56,m.ground);grd.addColorStop(1,m.ground);ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);
 ctx.fillStyle=m.fog+'35';for(let i=0;i<11;i++){const bx=i*w/10;ctx.beginPath();ctx.moveTo(bx,h*.58);ctx.lineTo(bx+45,h*.43-(i%3)*18);ctx.lineTo(bx+100,h*.58);ctx.fill()}
 if(m.name==='Golden Desert'){ctx.fillStyle='#ffd85a';ctx.beginPath();ctx.arc(w*.78,h*.18,30,0,Math.PI*2);ctx.fill()} if(m.name==='Frozen Kingdom'){ctx.strokeStyle='#e9ffff55';ctx.lineWidth=3;for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(i*w/8,h*.15);ctx.lineTo(i*w/8+20,h*.38);ctx.stroke()}}
 const cx=w/2,top=h*.23,bottom=h+25;ctx.fillStyle=m.road;ctx.beginPath();ctx.moveTo(cx-62,top);ctx.lineTo(cx+62,top);ctx.lineTo(w*.94,bottom);ctx.lineTo(w*.06,bottom);ctx.closePath();ctx.fill();ctx.strokeStyle=m.accent+'99';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx-62,top);ctx.lineTo(w*.06,bottom);ctx.moveTo(cx+62,top);ctx.lineTo(w*.94,bottom);ctx.stroke();
 for(let i=0;i<12;i++){const t=i/12,y=top+(bottom-top)*t*t,half=62+(w*.44)*t;ctx.strokeStyle=m.accent+'32';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx-half/3,y);ctx.lineTo(cx+half/3,y);ctx.stroke()}
 [...G.items,...G.obstacles].sort((a,b)=>a.z-b.z).forEach(o=>{const z=o.z,y=top+(bottom-top)*z*z,half=62+(w*.44)*z,x=cx+(o.lane-1)*half/3,size=10+30*z;if(o.type==='coin'){ctx.fillStyle='#ffd447';ctx.beginPath();ctx.arc(x,y,size*.55,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff1a0';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#9d7115';ctx.font=size*.65+'px Arial';ctx.textAlign='center';ctx.fillText('₵',x,y+size*.22)}else if(o.type==='gem'){ctx.fillStyle='#7d62ff';ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x+size*.65,y);ctx.lineTo(x,y+size);ctx.lineTo(x-size*.65,y);ctx.closePath();ctx.fill()}else if(o.type==='boost'){ctx.fillStyle='#ff8c31';ctx.beginPath();ctx.arc(x,y,size*.65,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font=size+'px Arial';ctx.fillText('⚡',x,y+size*.35)}else if(o.type==='barrier'){ctx.fillStyle=m.hazard;ctx.fillRect(x-size,y-size*.55,size*2,size*1.1);ctx.fillStyle='#ffd84a';ctx.fillRect(x-size*.8,y-size*.15,size*1.6,size*.16)}else{ctx.fillStyle='#3b3438';ctx.beginPath();ctx.arc(x,y,size*.8,Math.PI,0);ctx.lineTo(x-size*.8,y);ctx.fill()}});
 drawPursuer(laneX(G.lane),playerY()+68+(3-G.health)*13);drawRunner(laneX(G.lane),playerY());
 // health bar
 const hpw=Math.min(170,w-40),x=20,y=72;ctx.fillStyle='#06131dcc';ctx.roundRect(x,y,hpw,14,7);ctx.fill();ctx.fillStyle='#e94b55';ctx.roundRect(x,y,hpw*(G.health/3),14,7);ctx.fill();ctx.fillStyle='#fff';ctx.font='9px Arial';ctx.fillText('HEALTH',x+6,y+10)
}
function collect(){const hit=.94;G.items=G.items.filter(o=>{if(o.z>hit&&o.lane===G.lane){if(o.type==='coin'){G.coins+=5;G.score+=10}else if(o.type==='gem'){G.gems++;G.score+=50}else{G.speed=Math.min(8,G.speed+.7);G.score+=80;toast('⚡ SPEED BOOST!')}return false}return true});G.obstacles=G.obstacles.filter(o=>{if(o.z>hit&&o.lane===G.lane&&G.jump<.25&&G.inv<=0){G.health--;G.score=Math.max(0,G.score-25);G.inv=1.2;toast('💥 HIT! HEALTH -1');return false}return true});if(G.health<=0)finish('The pursuer caught you!')}
function update(dt){if(!G||G.paused)return;G.time-=dt;G.spawn-=dt;G.inv=Math.max(0,G.inv-dt);G.jump=Math.max(0,G.jump-dt*1.9);if(G.spawn<=0){spawnItem();if(Math.random()<.44)spawnObstacle();G.spawn=.4/Math.min(G.speed/4,1.8)}[...G.items,...G.obstacles].forEach(o=>o.z+=dt*G.speed*.12);G.items=G.items.filter(o=>o.z<1.08);G.obstacles=G.obstacles.filter(o=>o.z<1.08);G.lane+=(G.targetLane-G.lane)*Math.min(1,dt*12);if(Math.abs(G.targetLane-G.lane)<.02)G.lane=G.targetLane;collect();if(G.time<=0)finish('You escaped the chase!')}
function loop(now=performance.now()){if(!G)return;const dt=Math.min(.05,(now-G.last)/1000);G.last=now;update(dt);drawWorld();$("#healthHud").textContent=G.health;$("#timeHud").textContent=Math.max(0,Math.ceil(G.time));$("#runCoins").textContent=G.coins;$("#runGems").textContent=G.gems;$("#runScore").textContent=G.score;raf=requestAnimationFrame(loop)}
function move(dir){if(G)G.targetLane=Math.max(0,Math.min(2,G.targetLane+dir))}function jump(){if(G&&G.jump<=0)G.jump=1}
$("#leftBtn").onclick=()=>move(-1);$("#rightBtn").onclick=()=>move(1);$("#jumpBtn").onclick=jump;$("#pauseBtn").onclick=()=>{if(G){G.paused=!G.paused;toast(G.paused?'Paused':'Resume')}};
let sx=0,sy=0;canvas.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});canvas.addEventListener('touchend',e=>{const x=e.changedTouches[0].clientX,y=e.changedTouches[0].clientY,dx=x-sx,dy=y-sy;if(Math.abs(dx)>35)move(dx>0?1:-1);else if(dy<-35)jump()},{passive:true});addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')move(-1);if(e.key==='ArrowRight'||e.key==='d')move(1);if(e.key==='ArrowUp'||e.key==='w'||e.key===' ')jump()});
function finish(reason){if(!G)return;cancelAnimationFrame(raf);S.coins+=G.coins;S.gems+=G.gems;S.runs++;S.best=Math.max(S.best,G.score);save();$("#resultReason").textContent=reason;$("#resultCoins").textContent=G.coins;$("#resultGems").textContent=G.gems;$("#resultScore").textContent=G.score;$("#adGate").classList.remove('hidden');$("#levelAdBtn").disabled=false;$("#levelAdBtn").textContent='▶ WATCH AD';pendingReward='level';showScreen('result');G=null}
// Monetag Rewarded Interstitial adapter.
// Put your exact Monetag generated SDK tag in index.html. It creates window.show_XXXX.
const MONETAG_AD_FUNCTION = ''; // Example: 'show_123456' — replace with YOUR real function name.
function runAd(button,onComplete,placement='reward'){
  if(adBusy)return;
  const fnName=MONETAG_AD_FUNCTION.trim();
  const adFn=fnName && typeof window[fnName]==='function' ? window[fnName] : null;
  if(!adFn){toast('⚠️ Rewarded ad is not configured yet. Add your Monetag SDK tag + function name.');return;}
  adBusy=true; button.disabled=true; const old=button.textContent; button.textContent='📺 LOADING AD…';
  const ymid='tr-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
  Promise.resolve(adFn({type:'end',ymid,requestVar:placement}))
    .then(()=>{ onComplete(); toast('✅ Ad completed — reward added'); })
    .catch(()=>toast('Ad was not completed. No reward was added.'))
    .finally(()=>{adBusy=false;button.disabled=false;button.textContent=old;});
}
$("#levelAdBtn").onclick=()=>runAd($("#levelAdBtn"),()=>{S.level++;pendingReward=null;save();showScreen('home');toast('🎉 LEVEL '+S.level+' UNLOCKED!')});
$("#watchCoinAd").onclick=()=>runAd($("#watchCoinAd"),()=>{S.coins+=20;S.ads++;save();$("#adStatus").textContent='✓ Ad completed — +20 Coins';$("#adStatus").classList.remove('hidden');toast('🪙 +20 Coins');});
let spinIndex=0,spinRot=0;$("#spinBtn").onclick=()=>{if(pendingReward!==null||adBusy)return;spinIndex=Math.floor(Math.random()*7);spinRot+=1440+(360-spinIndex*360/7);$("#wheel").style.transform=`rotate(${spinRot}deg)`;pendingReward=spinIndex;setTimeout(()=>{const rewards=['20 Coins','50 Coins','100 Coins','10 Diamonds','30 Diamonds','50 Diamonds','$0.020'];$("#spinResult").textContent='🎉 You won '+rewards[spinIndex];$("#spinResult").classList.remove('hidden');$("#claimSpinBtn").classList.remove('hidden');$("#spinBtn").disabled=true},3600)};
$("#claimSpinBtn").onclick=()=>runAd($("#claimSpinBtn"),claimSpin);
function claimSpin(){const i=pendingReward;if(i===0)S.coins+=20;if(i===1)S.coins+=50;if(i===2)S.coins+=100;if(i===3)S.gems+=10;if(i===4)S.gems+=30;if(i===5)S.gems+=50;if(i===6)S.cash+=.020;S.spinClaimed++;pendingReward=null;$("#claimSpinBtn").classList.add('hidden');$("#spinResult").classList.add('hidden');$("#spinBtn").disabled=false;save();toast('🎁 Reward claimed!')}
$("#copyRef").onclick=async()=>{const link=location.origin+location.pathname+'?ref='+getRefCode();try{await navigator.clipboard.writeText(link);toast('Referral link copied!')}catch{toast(link)}};
function processReferral(){const ref=new URLSearchParams(location.search).get('ref');if(!ref||localStorage.getItem('refProcessed')||ref===getRefCode())return;localStorage.setItem('refProcessed','1');localStorage.setItem('referrer',ref);S.referrals++;S.refCash+=.050;save();toast('🎁 Referral registered: $0.050')}
$("#withdrawBtn").onclick=()=>{const available=totalCash();if(available<25){toast('Minimum withdrawal is $25.00');return}toast('Withdrawal request created (demo). Backend required for real payout.');};
processReferral();updateUI();
