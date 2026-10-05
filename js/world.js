'use strict';
// ===== мир: физика, Клюв, враги, опасности, триггеры. Работает и без DOM (для автотестов). =====
const PHY={G:2000,JUMP:700,RUN:250,AIRRUN:300,ACC:2000,DEC:2800,AIR:1800,AIRDRAG:500,FALL:1150,COYOTE:0.1,BUF:0.13,WJX:340,WJY:640,WSLIDE:150,
  DASH:820,DASHT:0.17,ROPE:390,PUMP:1150,REEL:260,ROPEMIN:60,ROPEMAX:420,HOOKV:2600,PW:22,PH:56,LAUNCH:1260};
let W={}; let LV=null;
const sfx=(n,o)=>{ if(typeof AUD!=='undefined'&&AUD.ctx)AUD.play(n,o); };
const say=(ids)=>{ if(typeof VOICE!=='undefined')VOICE.say(ids); };
function shake(a){ W.trauma=Math.min(1,(W.trauma||0)+a*0.08); }
function addP(p){ const cap=(typeof SETTINGS!=='undefined'&&typeof PARTCAP!=='undefined'&&PARTCAP[SETTINGS.fx])||1400; if(W.parts&&W.parts.length<cap){ p.t=0; p.max=p.life; W.parts.push(p);} }
function buildWorld(li){ LV=JSON.parse(JSON.stringify(LEVELS[li])); LV.idx=li;
  W={L:LV,time:0,parts:[],trauma:0,deaths:W&&W.L&&W.L.idx===li?W.deaths||0:0,cp:0,tips:[],tip:null,tipT:0,firedTrig:{},shards:[],toast:null,
    cam:{x:LV.spawn[0],y:LV.spawn[1]-120,z:1.15},wall:{active:false,x:0,done:false},finished:false,goalP:0,expo:0,gust:0,gustWarn:0,shock:[],flash:0,slow:1,slowT:0,
    hook:null,ropeV:{pts:new Array(16).fill(0).map(()=>({x:0,y:0,px:0,py:0})),init:false},lastCharge:0,
    P:{x:0,y:0,vx:0,vy:0,face:1,onGround:false,ground:null,coyote:0,jbuf:0,wall:0,wallC:0,lock:0,dashT:0,dashCd:0,airDash:true,rope:null,zip:null,heat:0,cold:0,charge:0.5,dead:0,deathKind:'',action:null,warming:false,ax:0,anim:newAnim(),inv:0,landV:0,tow:null,cloak:null}};
  for(const c of LV.crumbles){c.st=0;c.t=0;} for(const f of LV.floes){f.y0=f.y;f.sink=0;f.on=0;}
  for(const ic of LV.icicles){ic.st=0;ic.t=0;ic.y0=ic.y;ic.vy=0;} for(const a of LV.anchors){a.x0=a.x;}
  for(const m of LV.movers){m.x0=m.x;m.y0=m.y;m.vx=0;m.vy=0;}
  LV.wheelPl=[]; for(const wh of LV.wheels){ for(let i=0;i<wh.n;i++)LV.wheelPl.push({wh,i,x:0,y:0,w:wh.pw,h:16,vx:0,vy:0,k:'gearpl'}); }
  for(const c of LV.crates){ c.x0=c.x; c.y0=c.y; c.pvx=0; c.pvy=0; c.vx=0; c.vy=0; c.k='box'; c.crate=1; c.onG=false; }
  for(const g of LV.gates){ g.open=0; g.latch=false; } for(const r of LV.receivers){ r.ch=0; r.done=false; } for(const p of LV.pulls){ p.done=false; } for(const pl of LV.plates){ pl.on=false; }
  W.worm={st:'idle',tr:0,t:0,x:0,sy:0}; W.sola=null; W.choice=null; W.beam=null;
  LV.colStatic=LV.solids.filter(s=>!s.hollow); LV.colStatic.push({x:-60,y:-2000,w:60,h:4000,k:'bound',slip:1},{x:LV.length,y:-2000,w:60,h:4000,k:'bound',slip:1});
  updateDynamics(0); }
function respawn(ci){ const P=W.P; const cp=LV.cps[clamp(ci,0,LV.cps.length-1)]; W.cp=ci;
  const x=cp.x; let y=LV.spawn[1]; let best=1e9; for(const s of LV.colStatic){ if(x>=s.x&&x<=s.x+s.w&&s.y<best){best=s.y;} } y=best<1e9?best:y;
  Object.assign(P,{x,y,vx:0,vy:0,face:1,onGround:true,dead:0,rope:null,zip:null,heat:0,cold:0,dashT:0,lock:0,action:null,inv:0.5,wall:0,tow:null,cloak:null}); P.charge=Math.max(P.charge,0.5);
  P.anim=newAnim(); W.hook=null; W.expo=0; W.goalP=0;
  for(const c of LV.crumbles){c.st=0;c.t=0;} for(const f of LV.floes){f.sink=0;f.on=0;} for(const ic of LV.icicles){ic.st=0;ic.t=0;ic.y=ic.y0;ic.vy=0;}
  for(const c of LV.crates){ if(c.x0>=x-250||c.y>LV.killY){ c.x=c.x0; c.y=c.y0; c.pvx=c.pvy=c.vx=c.vy=0; } } for(const r of LV.receivers) if(!r.done)r.ch=0;
  W.worm={st:'idle',tr:0,t:0,x:0,sy:0}; W.beam=null; if(W.choice&&!W.choice.done)W.choice=null;
  W.wall={active:false,x:0,done:W.wall&&W.wall.done&&LV.chase&&x>LV.chase.to};
  if(LV.chase&&x<LV.chase.trig){ W.firedTrig[LV.trig.findIndex(t=>t.x===LV.chase.trig)]=false; }
  // респаун внутри погони: стена сразу активна (иначе погоня «терялась»)
  else if(LV.chase&&!W.wall.done&&x<LV.chase.to){ W.firedTrig[LV.trig.findIndex(t=>t.x===LV.chase.trig)]=true; W.wall.active=true; W.wall.x=x-LV.chase.back; if(typeof onChase==='function')onChase(true); }
  W.cam.x=x+120; W.cam.y=y-120; W.ropeV.init=false; }
// ---------- динамика объектов
function easeCos(t,per){ return 0.5-0.5*Math.cos(t/per*Math.PI*2); }
function updateDynamics(dt){ const t=W.time;
  for(const m of LV.movers){ const u=easeCos(t,m.per); const nx=lerp(m.x0,m.x2,u), ny=lerp(m.y0,m.y2,u); m.vx=dt?(nx-m.x)/dt:0; m.vy=dt?(ny-m.y)/dt:0; m.x=nx; m.y=ny; }
  for(const a of LV.anchors){ if(a.per){ const u=easeCos(t,a.per); const nx=lerp(a.mx,a.mx2,u); a.vx=dt?(nx-a.x)/dt:0; a.x=nx; } }
  for(const p of LV.wheelPl){ const wh=p.wh; const ang=t/wh.per*Math.PI*2+p.i/wh.n*Math.PI*2; const cx=wh.cx+Math.cos(ang)*wh.r, cy=wh.cy+Math.sin(ang)*wh.r;
    const nx=cx-p.w/2, ny=cy; p.vx=dt?(nx-p.x)/dt:0; p.vy=dt?(ny-p.y)/dt:0; p.x=nx; p.y=ny; }
  for(const f of LV.floes){ const ny=f.y0+f.sink; f.vy=dt?(ny-f.y)/dt:0; f.vx=0; f.y=ny; }
  for(const d of LV.drones){ const u=easeCos(t,d.per); const nx=lerp(d.x1,d.x2,u); d.dir=nx>=(d.x??nx)?1:-1; d.x=nx; d.yy=d.y+Math.sin(t*2.1)*8; }
}
function colliders(){ const out=LV.colStatic.slice();
  for(const c of LV.crumbles) if(c.st<2) out.push(c);
  for(const m of LV.movers) out.push(m); for(const f of LV.floes) out.push(f); for(const p of LV.wheelPl) out.push(Object.assign(p,{oneWay:1}));
  for(const g of LV.gates){ const c=gateCol(g); if(c)out.push(c); } for(const c of LV.crates) out.push(c);
  return out; }
function gateCol(g){ const c=g._c||(g._c={k:g.dir==='bridge'?'gatebr':'gate',gate:g,nowall:1}); if(g.dir==='bridge'){ const w=g.w*g.open; if(w<6)return null; Object.assign(c,{x:g.x,y:g.y,w,h:g.h}); } else { const h=g.h*(1-g.open); if(h<4)return null; Object.assign(c,{x:g.x,y:g.y,w:g.w,h}); } return c; }
const ov=(ax,ay,aw,ah,b)=>ax<b.x+b.w&&ax+aw>b.x&&ay<b.y+b.h&&ay+ah>b.y;
function moveCollide(P,dx,dy,cols){ const hw=PHY.PW/2, H=PHY.PH; let hitX=0, landed=null, hitHead=false;
  P.x+=dx; for(const c of cols){ if(c.oneWay)continue; if(ov(P.x-hw,P.y-H,PHY.PW,H-0.5,c)){ if(dx>0){P.x=c.x-hw-0.01;hitX=1;} else if(dx<0){P.x=c.x+c.w+hw+0.01;hitX=-1;} else { const mid=c.x+c.w/2; if(P.x<mid){P.x=c.x-hw-0.01;hitX=1;} else {P.x=c.x+c.w+hw+0.01;hitX=-1;} } if(hitX&&c.h>=40&&!c.slip&&!c.nowall)P.wallC=hitX; } }
  const prevB=P.y; P.y+=dy;
  for(const c of cols){ if(c.oneWay){ if(dy>=0&&prevB<=c.y+1&&P.y>=c.y&&P.x+hw>c.x&&P.x-hw<c.x+c.w&&!P.dropT){ P.y=c.y; landed=c; } continue; }
    if(ov(P.x-hw,P.y-H,PHY.PW,H,c)){ if(dy>0){P.y=c.y;landed=c;} else if(dy<0){ // коррекция углов: задели край потолка головой (≤7px) — соскальзываем вбок
        const oL=(P.x+hw)-c.x, oR=(c.x+c.w)-(P.x-hw); let ok=false; if(oL<=7||oR<=7){ const ox=P.x; P.x=oL<=7?c.x-hw-0.02:c.x+c.w+hw+0.02; ok=!cols.some(o=>!o.oneWay&&ov(P.x-hw,P.y-H,PHY.PW,H,o)); if(!ok)P.x=ox; }
        if(!ok){P.y=c.y+c.h+H;hitHead=true;} } } }
  return {hitX,landed,hitHead}; }
function groundProbe(P,cols){ const hw=PHY.PW/2; for(const c of cols){ if(P.x+hw>c.x&&P.x-hw<c.x+c.w&&Math.abs(P.y-c.y)<1.5)return c; } return null; }
function wallProbe(P,cols){ const hw=PHY.PW/2,H=PHY.PH; for(const c of cols){ if(c.oneWay||c.h<40||c.slip||c.nowall)continue; if(P.y-8>c.y&&P.y-H+6<c.y+c.h){ if(Math.abs((P.x+hw)-c.x)<2)return 1; if(Math.abs((P.x-hw)-(c.x+c.w))<2)return -1; } } return 0; }
// ---------- луч: пересечение отрезка с AABB
function segHits(x1,y1,x2,y2,b){ let t0=0,t1=1; const dx=x2-x1,dy=y2-y1;
  const p=[-dx,dx,-dy,dy], q=[x1-b.x,b.x+b.w-x1,y1-b.y,b.y+b.h-y1];
  for(let i=0;i<4;i++){ if(p[i]===0){ if(q[i]<0)return false; } else { const r=q[i]/p[i]; if(p[i]<0){ if(r>t1)return false; if(r>t0)t0=r; } else { if(r<t0)return false; if(r<t1)t1=r; } } } return t0<=t1&&t1>0.02&&t0<0.98; }
function occluded(x1,y1,x2,y2){ for(const s of LV.colStatic){ if(segHits(x1,y1,x2,y2,s))return true; } return false; }
// ---------- ввод (игра или бот)
function inp(){ return W.ctrl||INPUT; }
// ---------- Клюв
function gripPt(P){ return [P.x+P.face*3,P.y-60]; }
function findAnchor(P){ const [gx,gy]=gripPt(P); let best=null,bs=1e9;
  for(const a of LV.anchors){ const dx=a.x-gx, dy=a.y-gy; const d=Math.hypot(dx,dy); if(d>PHY.ROPE||dy>-20)continue; const s=d-(dx*P.face>0?120:0)+(Math.abs(dx)<30?0:0); if(s<bs){bs=s;best=a;} } return best; }
// Клюв 2.0: ящики (буксир) и рычаги-кольца
function grabPt(o,P){ if(o.crate){ const left=P?P.x<o.x+o.w/2:true; return [left?o.x+5:o.x+o.w-5,o.y+o.h*0.36]; } return [o.x,o.y]; }
function findGrab(P){ if(!LV.crates.length&&!LV.pulls.length)return null; const [gx,gy]=gripPt(P); let best=null,bs=1e9;
  const test=o=>{ const [x,y]=grabPt(o,P); const dx=x-gx, dy=y-gy, d=Math.hypot(dx,dy); if(d>PHY.ROPE||d<34)return; if(dx*P.face<-24)return; if(occluded(gx,gy,x,y))return; const s=d-(dx*P.face>0?80:0); if(s<bs){bs=s;best=o;} };
  for(const c of LV.crates) if(P.ground!==c)test(c); for(const p of LV.pulls) if(!p.done)test(p); return best; }
function fireGrab(P,o){ const [gx,gy]=gripPt(P); W.hook={x:gx,y:gy,a:{x:0,y:0},grab:o,miss:false,t:0}; sfx('s_grapple_fire',{vol:.7,rate:1.08}); W.ropeV.init=false; }
function fireLink(id){ if(!id)return; for(const g of LV.gates) if(g.id===id&&!g.latch){ g.latch=true; sfx('s_gate',{vol:.8}); shake(2); }
  for(const m of LV.mirrors) if(m.id===id&&m.alt&&m.t!==m.alt){ m.t=m.alt; m.flip=0.5; sfx('s_gate',{vol:.6,rate:1.3}); } }
function fireHook(P){ const a=findAnchor(P); const [gx,gy]=gripPt(P);
  if(a){ W.hook={x:gx,y:gy,a,miss:false,t:0}; sfx('s_grapple_fire',{vol:.7}); }
  else { const ang=-Math.PI/2+P.face*0.75; W.hook={x:gx,y:gy,tx:gx+Math.cos(ang)*PHY.ROPE*0.8,ty:gy+Math.sin(ang)*PHY.ROPE*0.8,miss:true,t:0,back:false}; sfx('s_grapple_fire',{vol:.5,rate:1.2}); }
  W.ropeV.init=false; }
function attachRope(P,a){ const [gx,gy]=gripPt(P); P.rope={a,att:true,L:clamp(Math.hypot(a.x-gx,a.y-gy),PHY.ROPEMIN,PHY.ROPEMAX)}; P.airDash=true;
  sfx('s_grapple_hit',{vol:.8}); shake(1.5); W.slowT=0.06; for(let i=0;i<10;i++)addP({x:a.x,y:a.y,vx:rnd(-200,200),vy:rnd(-200,120),life:rnd(.2,.5),size:rnd(1,2.2),type:'spark'}); }
function releaseRope(P,boost){ if(!P.rope)return; P.rope=null; W.hook=null; if(boost){ P.vy=Math.min(P.vy-260,-420); P.vx*=1.1; sfx('s_jump',{vol:.6,rate:1.15}); W.slowT=0.08; } P.lock=0; }
// ---------- основной шаг
function stepWorld(dt){ W.time+=dt; const P=W.P; const I=inp(); updateDynamics(dt); updateMech(dt,I); const cols=colliders();
  if(W.finished){ P.vx*=0.9; return; }
  if(P.dead){ P.dead+=dt; if(P.dead>0.85){ respawn(W.cp); } return; }
  P.inv=Math.max(0,P.inv-dt); P.lock=Math.max(0,P.lock-dt); P.dashCd=Math.max(0,P.dashCd-dt); P.dropT=Math.max(0,(P.dropT||0)-dt);
  let ax=I.ax; if(P.lock>0)ax=0; P.action=null;
  if(I.hit('jump'))P.jbuf=PHY.BUF; else P.jbuf=Math.max(0,P.jbuf-dt);
  if(W.choice&&!W.choice.done){ ax=0; P.jbuf=0; choiceStep(I,dt); }
  // плащ: только стоя на земле; A/D — поворот, W — луч выше
  P.cloak=null; if(LV.cloak&&I.held('warm')&&P.onGround&&!P.rope&&!P.zip&&!P.tow&&P.dashT<=0&&!(W.choice&&!W.choice.done)){ P.cloak={up:I.held('up'),lit:false}; if(ax)P.face=ax>0?1:-1; ax=0; P.jbuf=0; }
  P.ax=ax;
  const L=LV;
  // ветер
  let windF=0; if(L.wind&&P.x>L.wind.from&&P.x<L.wind.to){ const ph=(W.time%L.wind.per); const gustStart=L.wind.per-L.wind.dur; W.gustWarn=ph>gustStart-L.wind.warn&&ph<gustStart?1:0; W.gust=ph>=gustStart?Math.min(1,(ph-gustStart)/0.3):0;
    let shel=false; for(const s of L.shelters){ if(P.x>s.x-110&&P.x<s.x+s.w+4&&P.y>s.y-s.h-30)shel=true; } P.sheltered=shel; if(W.gust&&!shel)windF=-L.wind.force*W.gust; } else { W.gust=0; W.gustWarn=0; }
  W.windF=windF;
  // --- канатка
  if(P.zip){ const z=P.zip.z; const dx=z.x2-z.x1, dy=z.y2-z.y1, len=Math.hypot(dx,dy); const sinA=dy/len;
    P.zip.v=Math.min(P.zip.v+PHY.G*0.55*sinA*dt+(windF*0.2)*dt,900); P.zip.s+=P.zip.v*dt/len; const s=P.zip.s;
    const cx=z.x1+dx*s, cy=z.y1+dy*s+Math.sin(s*Math.PI)*30; P.vx=(cx-P.x)/dt; P.vy=(cy+60-P.y)/dt; P.x=cx; P.y=cy+60; P.face=dx>0?1:-1;
    if(Math.random()<dt*60)addP({x:cx,y:cy,vx:rnd(-80,-20)*P.face,vy:rnd(-60,60),life:rnd(.1,.3),size:rnd(1,2),type:'spark'});
    if(I.hit('jump')||s>=1){ const vx=P.zip.v*dx/len, vy=P.zip.v*dy/len; P.zip=null; P.vx=vx*0.8; P.vy=Math.min(vy*0.3,-300); sfx('s_jump',{vol:.6}); P.lock=0.05; }
    else return postStep(P,dt,cols); }
  // --- крюк в полёте
  const hk=W.hook;
  if(hk&&!P.rope){ hk.t+=dt; const [gx,gy]=gripPt(P);
    if(hk.grab){ const [x,y]=grabPt(hk.grab,P); hk.a.x=x; hk.a.y=y; }
    if(!hk.miss&&hk.grab&&Math.hypot(hk.a.x-hk.x,hk.a.y-hk.y)<=PHY.HOOKV*dt){ const o=hk.grab; sfx('s_grapple_hit',{vol:.7,rate:1.1}); shake(1);
      if(o.crate){ const [x,y]=grabPt(o,P); P.tow={c:o,L:clamp(Math.hypot(x-gx,y-gy),50,PHY.ROPE)}; W.hook=null; }
      else { o.done=true; fireLink(o.link); sfx('s_plate',{vol:.7}); for(let i=0;i<12;i++)addP({x:o.x,y:o.y,vx:rnd(-200,200),vy:rnd(-200,100),life:rnd(.2,.5),size:rnd(1,2.2),type:'spark'}); hk.miss=true; hk.back=true; hk.grab=null; } }
    else if(!hk.miss){ const tx=hk.a.x, ty=hk.a.y; const dx=tx-hk.x, dy=ty-hk.y, d=Math.hypot(dx,dy); const st=PHY.HOOKV*dt; if(d<=st){ hk.x=tx;hk.y=ty; attachRope(P,hk.a); } else { hk.x+=dx/d*st; hk.y+=dy/d*st; } if(!I.held('grapple')&&hk.t>0.25){W.hook=null;} }
    else { const tx=hk.back?gx:hk.tx, ty=hk.back?gy:hk.ty; const dx=tx-hk.x, dy=ty-hk.y, d=Math.hypot(dx,dy); const st=PHY.HOOKV*0.8*dt; if(d<=st){ if(hk.back)W.hook=null; else {hk.back=true; sfx('s_chain',{vol:.3});} } else { hk.x+=dx/d*st; hk.y+=dy/d*st; } } }
  let grabbed=false; if(!P.rope&&!W.hook&&!P.tow&&I.hit('grapple')&&!nearGoal(P)){ const o=findGrab(P); if(o&&(P.onGround||!findAnchor(P))){ fireGrab(P,o); grabbed=true; } }
  if(grabbed||P.tow){}
  else if(!P.rope&&!W.hook&&!P.onGround&&I.held('grapple')&&(I.hit('grapple')||findAnchor(P))){ if(findAnchor(P)||I.hit('grapple'))fireHook(P); }
  else if(!P.rope&&!W.hook&&P.onGround&&I.hit('grapple')&&!nearGoal(P)&&findAnchor(P)) fireHook(P);
  // захват канатки
  if(!P.zip&&!P.rope&&I.held('grapple')){ for(const z of L.zips){ const dx=z.x2-z.x1, dy=z.y2-z.y1, len2=dx*dx+dy*dy; const [gx,gy]=gripPt(P); let s=((gx-z.x1)*dx+(gy-z.y1)*dy)/len2; s=clamp(s,0,0.95);
      const cx=z.x1+dx*s, cy=z.y1+dy*s+Math.sin(s*Math.PI)*30; if(Math.hypot(gx-cx,gy-cy)<46){ P.zip={z,s,v:Math.max(150,Math.abs(P.vx))}; P.rope=null; W.hook=null; sfx('s_grapple_hit',{vol:.7,rate:1.3}); shake(1); return postStep(P,dt,cols); } } }
  // --- на тросе
  if(P.rope){ const R=P.rope, a=R.a; if(!I.held('grapple')){ releaseRope(P,false); } else if(P.jbuf>0){ P.jbuf=0; releaseRope(P,true); } }
  if(P.rope){ const R=P.rope, a=R.a;
    if(I.held('up'))R.L=Math.max(PHY.ROPEMIN,R.L-PHY.REEL*0.55*dt); if(I.held('down'))R.L=Math.min(PHY.ROPEMAX,R.L+PHY.REEL*dt);
    const [gx,gy]=gripPt(P); let rx=gx-a.x, ry=gy-a.y; let d=Math.hypot(rx,ry)||1; const nx=rx/d, ny=ry/d; const tx=-ny, ty=nx; // касательная
    P.vy+=PHY.G*dt; if(ax){ if(ny>-0.2){ let ux=tx,uy=ty; if(ux<0){ux=-ux;uy=-uy;} P.vx+=ux*ax*PHY.PUMP*dt; P.vy+=uy*ax*PHY.PUMP*dt; } P.face=ax>0?1:-1; }
    P.vx+=windF*0.6*dt; P.vx*=Math.exp(-dt*0.15); P.vy*=Math.exp(-dt*0.15);
    const sp=Math.hypot(P.vx,P.vy); if(sp>1250){P.vx*=1250/sp;P.vy*=1250/sp;}
    const r=moveCollide(P,P.vx*dt,P.vy*dt,cols); if(r.hitX)P.vx*=-0.25; if(r.landed){P.vy=0;} if(r.hitHead)P.vy=Math.max(0,P.vy);
    // ограничение длины (нерастяжимый трос)
    const [g2x,g2y]=gripPt(P); rx=g2x-a.x; ry=g2y-a.y; d=Math.hypot(rx,ry)||1;
    if(d>R.L){ const k=R.L/d; P.x=a.x+rx*k-P.face*3; P.y=a.y+ry*k+50; const nnx=rx/d, nny=ry/d; const vr=P.vx*nnx+P.vy*nny; if(vr>0){P.vx-=vr*nnx;P.vy-=vr*nny;}
      if(a.vx){ P.x+=a.vx*dt; } moveCollide(P,0,0,cols); }
    P.onGround=!!groundProbe(P,cols)&&P.vy>=0; R.ang=Math.atan2(a.y-g2y,a.x-g2x); R.vt=P.vx*(-ny)+P.vy*nx;
    P.anim.swingTuck=lerp(P.anim.swingTuck||0,ax?1:0,1-Math.exp(-dt*6));
    return postStep(P,dt,cols); }
  // --- буксир (ящик на Клюве)
  if(P.tow){ const T=P.tow, c=T.c; if(!I.held('grapple')){ P.tow=null; sfx('s_chain',{vol:.3}); } else { const [gx,gy]=gripPt(P); const [hx,hy]=grabPt(c,P); const dx=gx-hx, dy=gy-hy, d=Math.hypot(dx,dy)||1;
      if(I.held('down'))T.L=Math.max(50,T.L-200*dt); T.L=Math.min(T.L,Math.max(50,d)); T.taut=d>T.L+1;
      if(T.taut){ const nx=dx/d; c.pvx=clamp(c.pvx+nx*2600*dt,-270,270); c.towed=true; if(P.vx*nx<0)P.vx=clamp(P.vx,-PHY.RUN*0.8,PHY.RUN*0.8);
        if(d>T.L+40){ const k=(d-T.L-40)/d; P.x-=dx*k*0.5; } if(d>T.L+120){ P.tow=null; sfx('s_chain',{vol:.5,rate:1.4}); shake(1); } } } }
  // --- обычное движение
  const gr=P.onGround?P.ground:null; const slip=gr&&gr.slip;
  if(gr&&(gr.vx||gr.vy)){ P.x+=gr.vx*dt; if(gr.vy)P.y+=gr.vy*dt; }
  P.sneak=P.onGround&&I.held('down')&&!P.tow; let tgt=ax*(P.onGround?(P.sneak?95:PHY.RUN):PHY.AIRRUN); if(P.pushing)tgt=clamp(tgt,-PUSHV,PUSHV);
  if(P.dashT>0){ P.dashT-=dt; if(Math.random()<dt*90)addP({x:P.x-P.face*8,y:P.y-28+rnd(-14,14),vx:-P.vx*0.1,vy:rnd(-30,30),life:rnd(.2,.4),size:rnd(2,3.5),type:'ember'}); if(P.dashT<=0){ P.vx=clamp(P.vx,-PHY.RUN*1.15,PHY.RUN*1.15); P.vy*=0.35; } }
  else { let acc; if(P.onGround){ acc=(ax&&Math.sign(ax)===Math.sign(P.vx||ax))?PHY.ACC:PHY.DEC; if(slip)acc*=ax?0.22:0.08; } else acc=ax?PHY.AIR:PHY.AIRDRAG;
    if(P.vx<tgt)P.vx=Math.min(tgt,P.vx+acc*dt); else if(P.vx>tgt)P.vx=Math.max(tgt,P.vx-acc*dt);
    P.vx+=windF*(P.onGround?0.9:1.25)*dt*(P.onGround?1:1);
    let g=PHY.G; const jh=I.held('jump'); if(P.vy<0&&!jh)g*=2.3; else if(Math.abs(P.vy)<110&&jh)g*=0.55; else if(P.vy>0)g*=1.12;
    P.vy=Math.min(P.vy+g*dt,PHY.FALL); }
  if(ax)P.face=ax>0?1:-1;
  // стены
  P.wall=P.onGround?0:wallProbe(P,cols); if(P.wall){ P.wallC=0.1; P.wallDir=P.wall; } else P.wallC=Math.max(0,(P.wallC||0)-dt);
  if(P.wall&&P.vy>PHY.WSLIDE&&ax===P.wall){ P.vy=PHY.WSLIDE; if(Math.random()<dt*25)addP({x:P.x+P.wall*11,y:P.y-30,vx:-P.wall*30,vy:-20,life:.4,size:2,type:'dust'}); }
  if(P.wall&&ax===P.wall)P.face=P.wall;
  // прыжки
  if(P.jbuf>0){ if(P.onGround||P.coyote>0){ P.vy=-PHY.JUMP+(gr&&gr.vy<0?gr.vy*0.5:0); P.onGround=false; P.coyote=0; P.jbuf=0; P.anim.landT=0; sfx('s_jump',{vol:.55,rate:rnd(.95,1.05)}); for(let i=0;i<6;i++)addP({x:P.x+rnd(-8,8),y:P.y,vx:rnd(-80,80),vy:rnd(-60,-10),life:rnd(.3,.6),size:rnd(2,4),type:'dust'}); P.dropT=0; }
    else if(P.wallC>0&&P.wallDir){ const wd=P.wallDir; P.vx=-wd*PHY.WJX; P.vy=-PHY.WJY; P.face=-wd; P.lock=0.13; P.jbuf=0; P.wallC=0; P.airDash=true; sfx('s_jump',{vol:.55,rate:1.12}); for(let i=0;i<6;i++)addP({x:P.x+wd*11,y:P.y-20,vx:-wd*rnd(40,120),vy:rnd(-60,40),life:rnd(.3,.5),size:rnd(2,3),type:'dust'}); } }
  // рывок
  if(I.hit('dash')&&P.dashT<=0&&P.dashCd<=0&&P.charge>=0.25&&(P.onGround||P.airDash)){ const up=I.held('up')?-0.55:0; const dir=ax||P.face; const n=Math.hypot(dir,up); P.vx=dir/n*PHY.DASH; P.vy=up/n*PHY.DASH; P.dashT=PHY.DASHT; P.dashCd=0.32; P.charge-=0.25; if(!P.onGround)P.airDash=false; P.face=dir>0?1:-1;
    sfx('s_dash',{vol:.75}); shake(2); W.shock.push({x:P.x,y:P.y-28,t:0,r:120}); W.flashCA=0.6; }
  // перемещение и столкновения
  const wasG=P.onGround, vyPrev=P.vy; const r=moveCollide(P,P.vx*dt,P.vy*dt,cols);
  if(r.hitX){ if(P.dashT>0){P.dashT=0;} P.vx=0; }
  if(r.hitHead)P.vy=Math.max(0,P.vy);
  let g2=r.landed||(P.vy>=0?groundProbe(P,cols):null);
  if(g2){ if(!wasG&&vyPrev>200){ landFx(P,vyPrev); if(g2.k==='dune')P.landSand=0.16+clamp((vyPrev-380)/700,0,0.2); } P.onGround=true; P.ground=g2; P.vy=0; P.coyote=PHY.COYOTE; P.airDash=true; } else { if(P.onGround)P.coyote=PHY.COYOTE; P.onGround=false; P.ground=null; P.coyote=Math.max(0,P.coyote-dt); }
  // тепло/холод/обогрев
  P.warming=false;
  if(I.held('warm')&&P.onGround&&Math.abs(P.vx)<40&&P.charge>0.02&&(L.cold)){ P.warming=true; P.charge=Math.max(0,P.charge-0.16*dt); P.cold=Math.max(0,P.cold-0.4*dt); if(Math.random()<dt*20)addP({x:P.x+P.face*6+rnd(-6,6),y:P.y-36,vx:rnd(-10,10),vy:rnd(-60,-30),life:rnd(.4,.8),size:rnd(3,5),type:'heat'}); }
  return postStep(P,dt,cols); }
function landFx(P,v){ const k=clamp((v-200)/900,0,1); P.anim.landT=0.4+k*0.6; sfx('s_land',{vol:.35+k*.5,rate:rnd(.9,1.05)}); if(k>0.45){shake(2+k*3); W.shock.push({x:P.x,y:P.y,t:0,r:90+k*60});}
  const ice=LV.cold; for(let i=0;i<8+k*12;i++)addP({x:P.x+rnd(-10,10),y:P.y-2,vx:rnd(-160,160)*(0.5+k),vy:rnd(-120,-20),life:rnd(.3,.7),size:rnd(2,4.5),type:ice?'snowp':'dust'}); }
function nearGoal(P){ const g=LV.goal; return g&&Math.abs(P.x-g.x)<70&&P.onGround; }
function kill(kind){ const P=W.P; if(P.dead||P.inv>0)return; if(W.god&&kind!=='fall')return; P.dead=0.001; P.deathKind=kind; P.rope=null; P.zip=null; W.hook=null; W.deaths++; shake(6); W.flash=kind==='burn'?0.5:0.3;
  sfx(kind==='freeze'?'s_death_freeze':kind==='fall'||kind==='worm'?'s_collapse':'s_death_burn',{vol:.8}); P.tow=null; P.cloak=null;
  try{ if(typeof localStorage!=='undefined'){ const T=JSON.parse(localStorage.getItem('lz_tele')||'{}'); const k=LV.id+':'+Math.round(P.x/200)*200+':'+kind; T[k]=(T[k]||0)+1; localStorage.setItem('lz_tele',JSON.stringify(T)); } }catch(e){}
  for(let i=0;i<40;i++)addP({x:P.x+rnd(-10,10),y:P.y-rnd(0,56),vx:rnd(-160,160),vy:rnd(-260,40),life:rnd(.5,1.2),size:rnd(2,4),type:kind==='freeze'?'frost':kind==='fall'||kind==='worm'?'dust':'ember'});
  if(Math.random()<0.35&&typeof VOICE!=='undefined'&&!VOICE.busy())say([Math.random()<0.5?'d1':'d2']); }
function postStep(P,dt,cols){ const L=LV; const t=W.time;
  // падение / вода
  if(P.y>L.killY)kill('fall');
  if(L.water)for(const w of L.water){ if(P.x>w.x1&&P.x<w.x2&&P.y>w.y+14)kill('freeze'); }
  // клапаны
  for(const v of L.vents){ const on=((t+v.ph)%v.per)<v.on; v.active=on; if(!on)continue;
    if(v.launch){ if(Math.abs(P.x-v.x)<30&&P.y<=v.y+2&&P.y>v.y-40&&P.vy>=-200){ P.vy=-PHY.LAUNCH; P.onGround=false; P.y-=2; sfx('s_steam',{vol:.8,rate:1.3}); shake(2); W.shock.push({x:v.x,y:v.y,t:0,r:100}); for(let i=0;i<16;i++)addP({x:v.x+rnd(-14,14),y:v.y,vx:rnd(-60,60),vy:rnd(-700,-300),life:rnd(.4,.9),size:rnd(6,12),type:'steam'}); } }
    else if(Math.abs(P.x-v.x)<24&&P.y>v.y-190&&P.y-PHY.PH<v.y)kill('burn'); }
  // жара (глава I)
  if(L.heat){ const inShade=shadeAt(P); W.inShade=inShade; let inSun=false; for(const s of L.sunz)if(P.x>s[0]&&P.x<s[1])inSun=true;
    let d=inShade?-0.3:inSun?0.42:(L.heatBase||0.035); if(P.cloak&&!inShade)d+=0.14; if(W.wall.active){ const gap=P.x-W.wall.x; d+=clamp(1-gap/320,0,1)*0.12; if(gap<20)kill('burn'); }
    if((P.rope||P.zip)&&!L.heatBase)d=Math.min(d,0.05); if(d>0&&assistOn())d*=0.55; P.heat=clamp(P.heat+d*dt,0,1); if(P.heat>=1)kill('burn'); if(!inShade)P.charge=Math.min(1,P.charge+(L.heatBase?0.08:0.05)*dt); }
  if(L.cloak)beamStep(P,dt);
  if(L.sand.length)wormStep(P,dt);
  // холод (глава III)
  if(L.cold){ let d=0.05+(W.gust&&!P.sheltered?0.07:0); for(const b of L.braziers){ if(Math.hypot(P.x-b.x,P.y-b.y)<130){ d=-0.55; P.charge=Math.min(1,P.charge+0.3*dt); } } if(P.warming)d=Math.min(d,-0.35);
    if(d>0&&assistOn())d*=0.55; P.cold=clamp(P.cold+d*dt,0,1); if(P.cold>=1)kill('freeze'); }
  // фонарщики (прожекторы) и дроны
  let seen=false; const pcx=P.x, pcy=P.y-30;
  for(const s of L.sentinels){ s.ang=s.base+s.amp*Math.sin(t/s.per*Math.PI*2+s.ph); const dx=pcx-s.x, dy=pcy-s.y, d=Math.hypot(dx,dy); if(d<720){ let da=Math.atan2(dy,dx)-s.ang; da=Math.atan2(Math.sin(da),Math.cos(da)); if(Math.abs(da)<0.17&&!occluded(s.x,s.y+20,pcx,pcy)&&!occluded(s.x,s.y+20,pcx,P.y-50))seen=true; } }
  for(const d of L.drones){ const dx=pcx-d.x, dy=pcy-d.yy; if(dy>0&&dy<460&&Math.abs(dx)<dy*0.36+10&&!occluded(d.x,d.yy+12,pcx,pcy)&&!occluded(d.x,d.yy+12,pcx,P.y-50))seen=true; }
  W.seen=seen; W.expo=seen?W.expo+dt/0.55:Math.max(0,W.expo-dt*1.5); if(seen&&!W.alarm){ sfx('s_alarm',{vol:.5}); } W.alarm=seen; if(W.expo>=1){ W.expo=0; kill('burn'); }
  // сосульки
  for(const ic of L.icicles){ if(ic.st===0&&Math.abs(P.x-ic.x)<80&&P.y>ic.y){ ic.st=1; ic.t=0; sfx('s_crumble',{vol:.5,rate:1.6}); }
    if(ic.st===1){ ic.t+=dt; if(ic.t>0.42){ic.st=2;} }
    if(ic.st===2){ ic.vy+=PHY.G*dt; ic.y+=ic.vy*dt; if(Math.abs(P.x-ic.x)<14&&ic.y+46>P.y-PHY.PH&&ic.y<P.y)kill('crush');
      for(const s of LV.colStatic){ if(!s.oneWay&&ic.x>s.x&&ic.x<s.x+s.w&&ic.y+46>s.y&&ic.y<s.y+10){ ic.st=3; sfx('s_crumble',{vol:.6,rate:1.4}); for(let i=0;i<14;i++)addP({x:ic.x,y:s.y-2,vx:rnd(-200,200),vy:rnd(-260,-40),life:rnd(.4,.8),size:rnd(1.5,3),type:'frost'}); shake(1.5); break; } } if(ic.y>L.killY)ic.st=3; } }
  // крошащиеся панели
  for(const c of L.crumbles){ if(c.st===0&&P.onGround&&P.ground===c){ c.st=1; c.t=0; sfx('s_crumble',{vol:.6}); }
    if(c.st===1){ c.t+=dt; if(c.t>0.42){ c.st=2; for(let i=0;i<10;i++)addP({x:c.x+rnd(0,c.w),y:c.y+rnd(0,c.h),vx:rnd(-60,60),vy:rnd(-40,120),life:rnd(.6,1.2),size:rnd(3,6),type:'debris'}); } } }
  // льдины
  for(const f of L.floes){ const on=P.onGround&&P.ground===f; if(on){ f.on+=dt; if(f.on>0.35)f.sink=Math.min(60,f.sink+38*dt); } else { f.on=0; f.sink=Math.max(0,f.sink-25*dt); } }
  // угольки
  for(const e of L.embers){ if(!e.taken&&Math.hypot(P.x-e[0],P.y-30-e[1])<34){ e.taken=true; P.charge=Math.min(1,P.charge+0.34); sfx('s_warm',{vol:.6,rate:1.4}); for(let i=0;i<12;i++)addP({x:e[0],y:e[1],vx:rnd(-120,120),vy:rnd(-120,120),life:rnd(.3,.6),size:rnd(1.5,3),type:'spark'}); } }
  // осколки памяти
  for(const s of L.shards){ if(!s.taken&&Math.hypot(P.x-s.x,P.y-30-s.y)<38){ s.taken=true; W.shards.push(s.id); sfx('s_checkpoint',{vol:.7,rate:1.25}); W.flash=0.25; W.toast={kind:'shard',id:s.id,t:0}; say([s.id]);
      if(typeof onShard==='function')onShard(s.id); for(let i=0;i<24;i++)addP({x:s.x,y:s.y,vx:rnd(-200,200),vy:rnd(-200,200),life:rnd(.5,1),size:rnd(1.5,3),type:'glint'}); } }
  // контрольные точки
  for(let i=W.cp+1;i<L.cps.length;i++){ if(P.x>=L.cps[i].x&&P.onGround){ W.cp=i; sfx('s_checkpoint',{vol:.5}); W.toast={kind:'cp',t:0}; if(typeof onCheckpoint==='function')onCheckpoint(i); } }
  // триггеры
  L.trig.forEach((tr,i)=>{ if(!W.firedTrig[i]&&P.x>=tr.x){ W.firedTrig[i]=true; if(tr.lines)say(tr.lines); if(tr.linesBy)say(tr.linesBy[W.sola==='take'?'take':'stay']); if(tr.choice&&!W.sola)W.choice={sel:0,t:0,done:false}; if(tr.tip){W.tip=tr.tip;W.tipT=0;} if(L.chase&&tr.x===L.chase.trig&&!W.wall.done){ W.wall.active=true; W.wall.x=P.x-L.chase.back; if(typeof onChase==='function')onChase(true);} } });
  if(W.wall.active){ W.wall.x+=L.chase.speed*dt; if(P.x>L.chase.to){ W.wall.active=false; W.wall.done=true; if(typeof onChase==='function')onChase(false);} if(Math.random()<dt*14)shake(0.4); }
  // цель главы
  W.canAct=false; const g=L.goal; if(g&&nearGoal(P)&&!P.rope){ W.canAct=true; const I=inp(); if(I.held('grapple')||g.kind==='door'){ W.goalP+=dt/g.hold; P.vx=0; P.action=g.kind==='repair'?'repair':g.kind==='lever'?'lever':null; P.face=g.x>P.x?1:-1;
      if(g.kind!=='door'&&Math.random()<dt*30)addP({x:g.x+rnd(-14,14),y:P.y-12,vx:rnd(-240,240),vy:rnd(-380,-100),life:rnd(.3,.7),size:rnd(1.2,2.6),type:'spark'});
      if((W.goalSnd=(W.goalSnd||0)-dt)<=0&&g.kind!=='door'){ sfx(g.kind==='repair'?'s_repair':'s_chain',{vol:.6,rate:rnd(.9,1.1)}); W.goalSnd=0.36; shake(1.5); }
      if(W.goalP>=1&&!W.finished){ W.finished=true; } } else W.goalP=Math.max(0,W.goalP-dt); }
  // шаги
  if(P.onGround&&Math.abs(P.vx)>60&&!P.dead){ const ph=P.anim.ph; const st=Math.floor(ph/Math.PI); if(st!==P.lastStep){ P.lastStep=st; sfx('s_step'+(Math.random()*3|0),{vol:.22,rate:rnd(.9,1.1)*(LV.cold?1.15:1)}); if(Math.random()<0.5)addP({x:P.x-P.face*6,y:P.y-1,vx:-P.vx*0.1+rnd(-20,20),vy:rnd(-40,-10),life:rnd(.25,.5),size:rnd(1.5,3),type:LV.cold?'snowp':'dust'}); } }
  updateHeroAnim(P,dt,{wind:W.gust,windBase:LV.wind?-80:0});
}

// ===================== Глава IV: механизмы (ящики, плиты, створки, зеркала, луч плаща, черви, выбор) =====================
const PUSHV=115;
function assistOn(){ return typeof SETTINGS!=='undefined'&&!!SETTINGS.assist; }
function shadeAt(P){ const L=LV, t=W.time; for(const s of L.shade)if(P.x>s[0]&&P.x<s[1])return true;
  for(const m of L.shadeMov){ const cx=m.x+m.amp*Math.sin(t/m.per*Math.PI*2+(m.ph||0)); m.cx=cx; if(P.x>cx&&P.x<cx+m.w)return true; }
  for(const c of L.crates){ if(P.x>c.x-c.h*0.85&&P.x<c.x+8&&P.y>=c.y+c.h-6&&P.y<c.y+c.h+40)return true; } // тень ящика падает влево (солнце справа-сверху)
  return false; }
function updateMech(dt,I){ const L=LV; if(!L.crates.length&&!L.gates.length)return; const P=W.P;
  // плиты: нажаты, пока на них стоит ящик
  for(const pl of L.plates){ const was=pl.on; pl.on=L.crates.some(c=>Math.abs(c.y+c.h-pl.y)<4&&Math.min(c.x+c.w,pl.x+pl.w)-Math.max(c.x,pl.x)>=30); if(pl.on!==was)sfx('s_plate',{vol:.7,rate:pl.on?1:0.8}); }
  // створки
  for(const g of L.gates){ const tgt=(g.latch||L.plates.some(pl=>pl.link===g.id&&pl.on))?1:0; const o=g.open; g.open=tgt>o?Math.min(1,o+1.5*dt):tgt<o?Math.max(0,o-1.5*dt):o;
    if(o!==g.open&&(g.open===1||g.open===0))sfx('s_gate',{vol:.5,rate:g.open?1.1:0.9}); if(o===0&&g.open>0||o===1&&g.open<1)sfx('s_gate',{vol:.6}); }
  for(const m of L.mirrors) if(m.flip)m.flip=Math.max(0,m.flip-dt);
  // ящики: физика, толкание, буксир
  P.pushing=null; if(!L.crates.length)return; const base=LV.colStatic.slice(); for(const g of L.gates){ const c=gateCol(g); if(c)base.push(c); }
  for(const s of L.solids) if(s.oneWay&&!base.includes(s))base.push(s);
  const hw=PHY.PW/2;
  for(const c of L.crates){ const ox=c.x, oy=c.y;
    if(!P.dead&&P.onGround&&P.ground!==c&&I.ax&&!P.tow&&!P.cloak&&c.onG){ const dir=Math.sign(I.ax); const edge=dir>0?c.x:c.x+c.w; const pe=P.x+dir*hw; if(Math.abs(pe-edge)<3.5&&P.y>c.y+6&&P.y-PHY.PH<c.y+c.h){ c.pvx=dir*PUSHV; P.pushing=c; c.pushT=0.12; } }
    c.pushT=Math.max(0,(c.pushT||0)-dt);
    if(c.onG&&!c.towed&&c.pushT<=0)c.pvx*=Math.exp(-dt*10); c.towed=false;
    c.pvy=Math.min(c.pvy+PHY.G*dt,PHY.FALL);
    const others=base.concat(L.crates.filter(o=>o!==c));
    if(!P.dead&&P.ground!==c)others.push({x:P.x-hw,y:P.y-PHY.PH,w:PHY.PW,h:PHY.PH,pl:1});
    c.x+=c.pvx*dt; for(const s of others){ if(s.oneWay)continue; if(ov(c.x,c.y,c.w,c.h-0.5,s)){ if(s.pl){ c.x=ox; c.pvx=0; break; } if(c.pvx>0)c.x=s.x-c.w-0.01; else if(c.pvx<0)c.x=s.x+s.w+0.01; c.pvx=0; } }
    const prevB=c.y+c.h; c.y+=c.pvy*dt; const wasG=c.onG; c.onG=false;
    for(const s of others){ if(s.pl)continue; if(s.oneWay){ if(c.pvy>=0&&prevB<=s.y+1&&c.y+c.h>=s.y&&c.x+c.w>s.x&&c.x<s.x+s.w){ c.y=s.y-c.h; c.pvy=0; c.onG=true; } continue; }
      if(ov(c.x,c.y,c.w,c.h,s)){ if(c.pvy>0){ c.y=s.y-c.h; c.onG=true; } else if(c.pvy<0){ c.y=s.y+s.h; } c.pvy=0; } }
    if(c.onG&&!wasG&&c.y-oy>1){ sfx('s_land',{vol:.7,rate:.7}); shake(1.5); for(let i=0;i<10;i++)addP({x:c.x+rnd(0,c.w),y:c.y+c.h-2,vx:rnd(-160,160),vy:rnd(-90,-10),life:rnd(.3,.7),size:rnd(2,4),type:'dust'}); }
    if(c.y>L.killY+150){ c.x=c.x0; c.y=c.y0; c.pvx=c.pvy=0; if(P.tow&&P.tow.c===c)P.tow=null; }
    c.vx=dt?(c.x-ox)/dt:0; c.vy=c.onG&&dt?Math.max(0,(c.y-oy)/dt)*0:0;
    if(Math.abs(c.x-ox)>0.3&&c.onG){ W.dragSnd=0.15; if(Math.random()<dt*20)addP({x:c.pvx>0?c.x:c.x+c.w,y:c.y+c.h-2,vx:-c.pvx*0.3+rnd(-20,20),vy:rnd(-40,-10),life:rnd(.3,.5),size:rnd(2,3),type:'dust'}); } }
  W.dragSnd=Math.max(0,(W.dragSnd||0)-dt); }
// ---- выбор у лагеря
function choiceStep(I,dt){ const C=W.choice; if(typeof VOICE!=='undefined'&&VOICE.busy()){ C.wait=true; return; } C.t+=dt; if(C.t<0.4)return;
  if(I.hit('left'))C.sel=0; if(I.hit('right'))C.sel=1;
  if(I.hit('grapple')||I.hit('jump')||I.hit('confirm')){ C.done=true; W.sola=C.sel===0?'take':'stay'; sfx('s_choice',{vol:.8}); say(W.sola==='take'?['l4_take_i','l4_take']:['l4_stay_i','l4_stay']);
    if(W.sola==='stay'){ W.P.charge=1; for(let i=0;i<24;i++)addP({x:W.P.x+rnd(-12,12),y:W.P.y-rnd(10,50),vx:rnd(-60,60),vy:rnd(-160,-40),life:rnd(.5,1),size:rnd(1.5,3),type:'ember'}); }
    if(typeof onChoice==='function')onChoice(W.sola); W.choice=null; } }
// ---- луч плаща: отражения от зеркал, приёмники, отпугивание червя
function segT0(x1,y1,x2,y2,b){ let t0=0,t1=1; const dx=x2-x1,dy=y2-y1; const p=[-dx,dx,-dy,dy], q=[x1-b.x,b.x+b.w-x1,y1-b.y,b.y+b.h-y1];
  for(let i=0;i<4;i++){ if(p[i]===0){ if(q[i]<0)return 1; } else { const r=q[i]/p[i]; if(p[i]<0){ if(r>t1)return 1; if(r>t0)t0=r; } else { if(r<t0)return 1; if(r<t1)t1=r; } } } return t0<=t1&&t0>0.001?t0:1; }
function ptSegT(x1,y1,x2,y2,px,py,rad){ const dx=x2-x1, dy=y2-y1, l2=dx*dx+dy*dy; if(!l2)return 1; const t=((px-x1)*dx+(py-y1)*dy)/l2; if(t<=0.002||t>1)return 1; const cx=x1+dx*t, cy=y1+dy*t; return Math.hypot(px-cx,py-cy)<rad?t:1; }
function traceBeam(x,y,dx,dy){ const L=LV; const pts=[[x,y]]; const cols=LV.colStatic.filter(s=>s.k!=='bound'); for(const g of L.gates){ const c=gateCol(g); if(c)cols.push(c); } for(const c of L.crates)cols.push(c);
  let rec=null, worm=false, last=null; const wm=W.worm, wy=wm&&wm.st==='warn'?wm.sy-14:null;
  for(let k=0;k<7;k++){ const len=1500; const ex=x+dx*len, ey=y+dy*len; let best=1, hit=null, kind='';
    for(const s of cols){ if(s.x>Math.max(x,ex)+2||s.x+s.w<Math.min(x,ex)-2)continue; const t=segT0(x,y,ex,ey,s); if(t<best){best=t;hit=s;kind='s';} }
    for(const m of L.mirrors){ if(m===last)continue; const t=ptSegT(x,y,ex,ey,m.x,m.y,22); if(t<best){best=t;hit=m;kind='m';} }
    for(const r of L.receivers){ const t=ptSegT(x,y,ex,ey,r.x,r.y,24); if(t<best){best=t;hit=r;kind='r';} }
    if(wy!==null){ const t=ptSegT(x,y,ex,ey,wm.x,wy,70); if(t<best){best=t;hit=wm;kind='w';} }
    if(kind==='m'||kind==='r'){ pts.push([hit.x,hit.y]); } else pts.push([x+(ex-x)*best,y+(ey-y)*best]);
    if(kind==='m'){ x=hit.x; y=hit.y; const ndx=hit.t==='/'?-dy:dy, ndy=hit.t==='/'?-dx:dx; dx=ndx; dy=ndy; last=hit; continue; }
    if(kind==='r')rec=hit; if(kind==='w')worm=true; break; }
  return {pts,rec,worm}; }
function beamStep(P,dt){ W.beam=null; const L=LV;
  if(P.cloak&&!P.dead){ const lit=!W.inShade; P.cloak.lit=lit; if(lit){ const a=P.cloak.up?0.7:0; const dx=Math.cos(a)*P.face, dy=-Math.sin(a); W.beam=traceBeam(P.x+P.face*14,P.y-40,dx,dy);
      if((W.cloakSnd=(W.cloakSnd||0)-dt)<=0){ W.cloakSnd=0.9; sfx('s_cloak',{vol:.35}); } } }
  const hitR=W.beam&&W.beam.rec;
  for(const r of L.receivers){ if(r.done)continue; if(r===hitR){ r.ch+=dt; if(r.ch>=r.need){ r.done=true; fireLink(r.link); sfx('s_receiver',{vol:.85}); W.flash=0.15; for(let i=0;i<20;i++)addP({x:r.x,y:r.y,vx:rnd(-220,220),vy:rnd(-220,120),life:rnd(.3,.7),size:rnd(1.2,2.6),type:'spark'}); } }
    else r.ch=Math.max(0,r.ch-dt*0.6); }
  if(W.beam&&W.beam.worm&&W.worm.st==='warn'){ W.worm.st='flee'; W.worm.t=0; W.worm.tr=0.3; sfx('s_worm_rumble',{vol:.5,rate:1.4}); } }
// ---- черви: шум шагов и жар будят червя под песком
function sandRange(x){ for(const r of LV.sand) if(x>=r[0]&&x<=r[1])return r; return null; }
function wormStep(P,dt){ const wm=W.worm; const r=sandRange(P.x); const onSand=r&&P.onGround&&P.ground&&P.ground.k==='dune';
  if(wm.st==='idle'){ let d; if(P.dead)d=-0.5; else if(onSand){ const sp=Math.abs(P.vx); d=sp>120?0.5:sp>8?0.05:-0.3; if(d>0)d*=(0.55+P.heat*0.9); if(P.landSand){ wm.tr+=P.landSand; P.landSand=0; } } else if(r&&!P.onGround)d=0; else d=-0.35;
    if(d>0&&assistOn())d*=0.6; wm.tr=clamp(wm.tr+d*dt,0,1);
    if(wm.tr>=1&&r){ wm.st='warn'; wm.t=0; wm.r=r; wm.sy=r[2]; wm.x=clamp(P.x-P.face*230,r[0]+20,r[1]-20); sfx('s_worm_rumble',{vol:.9}); shake(2); } }
  else if(wm.st==='warn'){ wm.t+=dt; const rr=wm.r; const tx=clamp(P.x,rr[0]+10,rr[1]-10); const st=340*dt; wm.x+=clamp(tx-wm.x,-st,st); if(Math.random()<dt*30)shake(0.3);
    if(Math.random()<dt*40)addP({x:wm.x+rnd(-40,40),y:wm.sy-2,vx:rnd(-60,60),vy:rnd(-140,-30),life:rnd(.3,.6),size:rnd(2,4),type:'dust'});
    if(wm.t>=0.9){ wm.st='burst'; wm.t=0; sfx('s_worm_burst',{vol:1}); shake(6); W.shock.push({x:wm.x,y:wm.sy,t:0,r:160});
      for(let i=0;i<40;i++)addP({x:wm.x+rnd(-30,30),y:wm.sy,vx:rnd(-260,260),vy:rnd(-700,-200),life:rnd(.5,1.1),size:rnd(3,7),type:'dust'});
      if(!P.dead&&Math.abs(P.x-wm.x)<55&&P.y>wm.sy-95)kill('worm'); } }
  else if(wm.st==='burst'){ wm.t+=dt; if(wm.t>1.4){ wm.st='idle'; wm.tr=0.35; } }
  else if(wm.st==='flee'){ wm.t+=dt; wm.x+=(wm.x<P.x?-1:1)*420*dt; if(wm.t>0.9){ wm.st='idle'; } }
  W.wormVib=wm.st==='warn'?1:wm.tr; }
// ---------- обновление частиц/эффектов (раз за кадр)
function updateFx(dt){ for(const p of W.parts){ p.t+=dt; p.x+=p.vx*dt; p.y+=p.vy*dt;
    if(p.type==='spark'||p.type==='debris'||p.type==='frost'||p.type==='snowp'){ p.vy+=900*dt; } else if(p.type==='ember'||p.type==='heat'){ p.vy-=40*dt; p.vx*=0.98; } else if(p.type==='steam'||p.type==='smoke'){ p.vx*=0.96; p.vy*=0.96; p.size+=dt*14; } else if(p.type==='dust'){ p.vx*=0.94; p.vy*=0.94; p.size+=dt*4; } else if(p.type==='glint'){ p.vx*=0.92; p.vy*=0.92; } }
  W.parts=W.parts.filter(p=>p.t<p.max);
  for(const s of W.shock)s.t+=dt; W.shock=W.shock.filter(s=>s.t<0.6);
  W.trauma=Math.max(0,W.trauma-dt*1.4); W.flash=Math.max(0,W.flash-dt*2); W.flashCA=Math.max(0,(W.flashCA||0)-dt*3);
  if(W.toast){ W.toast.t+=dt; if(W.toast.t>(W.toast.kind==='shard'?6:2.4))W.toast=null; } if(W.tip){ W.tipT+=dt; if(W.tipT>7)W.tip=null; } }
if(typeof module!=='undefined')module.exports={PHY,get W(){return W},buildWorld,respawn,stepWorld,updateFx,get LV(){return LV},traceBeam,findGrab,shadeAt};
