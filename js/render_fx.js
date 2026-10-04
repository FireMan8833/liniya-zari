'use strict';
// ===== камера, частицы, свет, погода, дисторсия, грейдинг и HUD =====
const LIGHT=mkCanvas(640,360), LX=LIGHT.getContext('2d');
const FROST=(()=>{ const c=mkCanvas(640,360), g=c.getContext('2d'); const R=seeded(5); g.strokeStyle='rgba(220,240,255,.5)';
  for(let i=0;i<260;i++){ const edge=R(); let x,y; if(edge<0.25){x=R()*640;y=R()*50;} else if(edge<0.5){x=R()*640;y=360-R()*50;} else if(edge<0.75){x=R()*70;y=R()*360;} else {x=640-R()*70;y=R()*360;}
    let a=R()*7, l=8+R()*30; g.lineWidth=0.5+R(); g.beginPath(); g.moveTo(x,y); for(let k=0;k<4;k++){ x+=Math.cos(a)*l; y+=Math.sin(a)*l; g.lineTo(x,y); a+=R()-0.5; l*=0.7; } g.stroke(); }
  const gr=g.createRadialGradient(320,180,120,320,180,380); gr.addColorStop(0,'rgba(200,230,255,0)'); gr.addColorStop(1,'rgba(200,230,255,.55)'); g.fillStyle=gr; g.fillRect(0,0,640,360); return c; })();
function updateCamera(dt){ const P=W.P, c=W.cam, L=LV; const look=P.rope?P.vx*0.35:P.zip?220*P.face:P.face*110+P.vx*0.3;
  c.lx=lerp(c.lx||look,look,1-Math.exp(-dt*2.2)); const tx=P.x+c.lx; let ty=P.y-95+(P.vy>400?P.vy*0.12:0);
  c.x=lerp(c.x,tx,1-Math.exp(-dt*(P.dashT>0?9:5))); c.y=lerp(c.y,ty,1-Math.exp(-dt*(Math.abs(c.y-ty)>120?6:3)));
  let tz=1.62; if(P.rope||P.zip)tz=1.38; if(W.wall.active)tz=1.2; if(W.finished)tz=1.65; c.z=lerp(c.z,tz,1-Math.exp(-dt*1.6));
  const halfH=VH/2/c.z; c.y=Math.min(c.y,(L.killY+(L.train?140:60))-halfH); c.x=clamp(c.x,VW/2/c.z-40,L.length-VW/2/c.z+40); }
const PCOL={dust:null,steam:'#f4f0ea',smoke:'#1a1210',snowp:'#eaf6ff',frost:'#d8f0ff',debris:'#2a1a12',breath:'#dfeefa'};
function drawParticles(addPass){ for(const p of W.parts){ const u=p.t/p.max; const a=1-u;
    const add=p.type==='spark'||p.type==='ember'||p.type==='glint'||p.type==='heat'; if(add!==addPass)continue;
    if(p.type==='spark'){ ctx.strokeStyle=`rgba(255,${200-u*80|0},${120-u*80|0},${a})`; ctx.lineWidth=p.size*0.8; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-p.vx*0.025,p.y-p.vy*0.025); ctx.stroke(); }
    else if(p.type==='ember'){ ctx.fillStyle=`rgba(255,${170-u*90|0},60,${a})`; ctx.fillRect(p.x,p.y,p.size,p.size); if(p.size>2)glow(GLOW.hot,p.x,p.y,p.size*4,a*0.25); }
    else if(p.type==='glint'){ ctx.fillStyle=`rgba(190,255,245,${a})`; ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size); }
    else if(p.type==='heat'){ glow(GLOW.warm,p.x,p.y,p.size*3,a*0.3); }
    else if(p.type==='dust'){ const c=LV.id===1?'#9a6a48':LV.id===2?'#6a5878':LV.id===4?'#e0b884':'#c8d8e8'; ctx.globalAlpha=a*0.45; ctx.fillStyle=c; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,7); ctx.fill(); }
    else if(p.type==='steam'||p.type==='smoke'||p.type==='breath'){ ctx.globalAlpha=a*(p.type==='smoke'?0.5:p.type==='breath'?0.25:0.4); const s=SOFT[p.type==='smoke'?'smoke':'steam']; ctx.drawImage(s,p.x-p.size,p.y-p.size,p.size*2,p.size*2); }
    else { ctx.globalAlpha=a; ctx.fillStyle=PCOL[p.type]||'#fff'; ctx.fillRect(p.x,p.y,p.size,p.size); } } ctx.globalAlpha=1; }
// ---- погода в экранных координатах
let SNOW=null;
function drawWeather(L,cam,dt){ const t=W.time;
  if(L.id===4){ if(!L._sand){ L._sand=Array.from({length:SETTINGS.fx==='min'?50:120},()=>({x:Math.random()*VW,y:Math.random()*VH,z:Math.random(),p:Math.random()*6})); }
    for(const s of L._sand){ s.x-=(40+s.z*160)*dt; s.y+=Math.sin(t*0.8+s.p)*0.4+(8+s.z*10)*dt; if(s.x<-10){s.x=VW+10;s.y=Math.random()*VH;} if(s.y>VH+10)s.y=-10;
      ctx.globalAlpha=0.25+s.z*0.45; ctx.fillStyle=s.z>0.6?'#fff0cc':'#c89060'; const sz=0.8+s.z*1.8; ctx.fillRect(s.x,s.y,sz*(1+s.z*2),sz*0.8); } ctx.globalAlpha=1; }
  if(L.id===3||L.id===1){ if(!SNOW){ SNOW=Array.from({length:220},()=>({x:Math.random()*VW,y:Math.random()*VH,z:Math.random(),p:Math.random()*6})); }
    const g=W.gust; for(const s of SNOW){ const sp=L.id===3?(40+s.z*90):(20+s.z*30); s.y+=(L.id===3?sp:-sp*0.6)*dt; s.x+=((L.id===3?-30:-20)-g*900*(0.4+s.z))*dt+Math.sin(t+s.p)*0.3; if(s.y>VH+10)s.y=-10; if(s.y<-10)s.y=VH+10; if(s.x<-10)s.x=VW+10; if(s.x>VW+10)s.x=-10;
      const sz=0.8+s.z*(L.id===3?2.6:1.6); ctx.globalAlpha=Math.min(1,(0.3+s.z*0.6)*(L.id===3?(FX.lit?1.9:1):0.6)); ctx.fillStyle=L.id===3?'#eef8ff':(s.z>0.6?'#ffb35a':'#2a1a14'); if(g>0.1&&L.id===3){ ctx.fillRect(s.x,s.y,sz*(1+g*6),sz*0.8);} else ctx.fillRect(s.x,s.y,sz,sz); } ctx.globalAlpha=1; }
  if(L.wind&&(W.gust>0||W.gustWarn)){ const a=W.gust*0.5+W.gustWarn*0.12; ctx.strokeStyle=`rgba(255,240,255,${a*0.5})`; ctx.lineWidth=1.2; for(let i=0;i<40;i++){ const y=((i*97+t*30)%VH), x=VW-((t*(1400+i*30)+i*233)%(VW+400)); ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+60+i%5*20,y+Math.sin(i)*2); ctx.stroke(); } } }
// ---- карта освещения (мультипликативно): глава II полумрак, глава III ночь
function lightPass(L,cam){ if(!L.dark&&L.id!==2)return; const z=cam.z, k=640/VW;
  LX.setTransform(1,0,0,1,0,0); LX.globalCompositeOperation='source-over'; LX.fillStyle=L.id===3?'#5a6e98':'#b4a0c8'; LX.fillRect(0,0,640,360);
  LX.globalCompositeOperation='lighter'; const sx=x=>((x-cam.x)*z+VW/2)*k, sy=y=>((y-cam.y)*z+VH/2)*k;
  const L1=(x,y,r,spr,a)=>{ LX.globalAlpha=a; LX.drawImage(spr,sx(x)-r*z*k,sy(y)-r*z*k,r*2*z*k,r*2*z*k); };
  for(const b of L.braziers)L1(b.x,b.y-40,260,GLOW.hot,0.9);
  L.cps.forEach((c,i)=>{ if(W.cp>=i&&i)L1(c.x-30,560,160,GLOW.warm,0.6); });
  const P=W.P; L1(P.x,P.y-34,110+P.charge*90,GLOW.warm,0.55+P.charge*0.3); if(P.warming)L1(P.x,P.y-30,200,GLOW.warm,0.6);
  for(const s of L.sentinels){ L1(s.x+Math.cos(s.ang)*300,s.y+Math.sin(s.ang)*300,300,GLOW.cold,0.5); L1(s.x,s.y,90,GLOW.cold,0.8); }
  for(const d of L.drones){ L1(d.x,d.yy+220,240,GLOW.warm,0.5); }
  for(const s of L.shards) if(!s.taken)L1(s.x,s.y,120,GLOW.teal,0.6);
  if(L.goal&&L.goal.gy)L1(L.goal.x,L.goal.gy-30,200,W.goalP>0?GLOW.warm:GLOW.cold,0.6);
  LX.globalAlpha=1; if(POST.ok){ FX.lit=1; return; } ctx.save(); ctx.setTransform(RS,0,0,RS,0,0); ctx.globalCompositeOperation='multiply'; ctx.drawImage(LIGHT,0,0,VW,VH); ctx.restore(); }
// ---- карта дисторсии и параметры постобработки
function distPass(L,cam){ distBegin(); const z=cam.z; const sx=x=>(x-cam.x)*z+VW/2, sy=y=>(y-cam.y)*z+VH/2; const P=W.P;
  for(const v of L.vents) if(v.active)distHeat(sx(v.x),sy(v.y-120),40*z,140*z,0.9);
  for(const b of L.braziers)distHeat(sx(b.x),sy(b.y-80),40*z,70*z,0.8);
  if(W.wall.active)distHeat(sx(W.wall.x),VH/2,300*z,VH,1);
  if(L.heat){ for(const s of L.sunz)distHeatRect(sx(s[0]),0,(s[1]-s[0])*z,VH,0.8); }
  if(P.dashT>0)distLens(sx(P.x),sy(P.y-30),60*z,0.7);
  for(const s of W.shock){ const u=s.t/0.6; distRing(sx(s.x),sy(s.y),s.r*z*(0.3+u*1.2),(1-u)*0.9); } }
const GRADE={1:{lift:[0.02,0.0,-0.02],gamma:[0.9,0.88,0.86],gain:[1.04,0.96,0.86],sat:1.12,exp:0.92,bloom:0.34,thr:0.85,rays:0.25,sunCol:[1,0.82,0.55],sh:[0.02,0,-0.02],hi:[0.03,0.01,-0.03]},
  2:{lift:[0.02,0.0,0.04],gamma:[1,0.98,1.04],gain:[1.04,0.96,1.04],sat:1.05,bloom:0.55,thr:0.72,rays:0.25,sunCol:[1,0.6,0.5],sh:[0.0,-0.01,0.04],hi:[0.03,0.0,0.0]},
  4:{lift:[0.03,0.015,-0.01],gamma:[0.92,0.92,0.94],gain:[0.98,0.93,0.86],sat:1.06,exp:0.84,bloom:0.24,thr:0.9,rays:0.12,sunCol:[1,0.92,0.75],sh:[0.03,0.0,0.02],hi:[0.02,0.01,-0.02]},
  3:{lift:[-0.01,0.01,0.04],gamma:[0.98,1,1.05],gain:[1.02,1.06,1.14],sat:1.0,bloom:0.6,thr:0.68,rays:0,sunCol:[0.7,0.9,1],sh:[-0.01,0.01,0.05],hi:[0.02,0.01,0.0]}};
function setFxForLevel(L){ const g=GRADE[L.id]; const P=W.P; Object.assign(FX,{lift:g.lift,gamma:g.gamma,gain:g.gain,sat:g.sat,bloom:g.bloom,thr:g.thr,rays:g.rays,sunCol:g.sunCol,shadowTint:g.sh,hiTint:g.hi,vign:0.42,grain:0.045,dist:1,exposure:g.exp||1});
  if(L._sun){ FX.sun=[L._sun[0]/VW,L._sun[1]/VH]; }
  FX.heat=L.heat?0.18+P.heat*0.5+(W.wall.active?0.35:0):L.id===2?0.04:0;
  FX.ca=0.0012+(W.flashCA||0)*0.012+W.expo*0.006+(P.dead?0.008:0); FX.flash=W.flash*0.6; FX.exposure=1+(W.wall.active?0.08:0);
  if(P.dead){ FX.sat=g.sat*(1-clamp(P.dead/0.5,0,0.7)); FX.fade=clamp((P.dead-0.45)/0.3,0,1); } else FX.fade=0;
  if(SETTINGS.fx==='low'||SETTINGS.fx==='min'){ FX.rays=0; FX.dist=0; FX.heat=0; FX.ca=0; FX.grain=0; } }
// ---- главный рендер игры
function renderGame(dt=0){ const L=LV, cam=W.cam, P=W.P; const t=W.time;
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,scv.width,scv.height); ctx.setTransform(RS,0,0,RS,0,0); ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1;
  drawSky(L,cam); drawLayers(L,cam);
  const tr=SETTINGS.shake?W.trauma*W.trauma:0; const shx=(Math.sin(t*71)+Math.sin(t*43))*tr*9, shy=(Math.cos(t*67)+Math.sin(t*39))*tr*9;
  camApply(cam,shx,shy);
  drawRails(L);
  for(const d of L.decor) if(d.k==='canopy'&&inVis(d.x,d.w))drawCanopy(d);
  for(const s of L.shelters) if(inVis(s.x,s.w))drawShelter(s,L);
  const L4=L.id===4; if(L4)drawDecor4(L);
  for(const wh of L.wheels) drawGear(wh,L);
  if(L.water)for(const w of L.water) if(inVis(w.x1,w.x2-w.x1))drawWater(w);
  for(const z of L.zips)drawZip(z);
  for(const s of LV.colStatic) if(inVis(s.x,s.w)&&s.y<VIS.y1)drawSolid(s,L);
  for(const s of L.solids) if(s.hollow&&inVis(s.x,s.w)){ ctx.fillStyle='#120804'; ctx.fillRect(s.x,s.y,s.w,400); ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.hot,s.x+s.w/2,s.y+160,s.w,0.5+0.2*Math.sin(t*5)); ctx.restore(); }
  if(L4){ drawShades4(L); drawMechBack4(L); }
  for(const c of L.crumbles) if(inVis(c.x,c.w))drawCrumble(c,L);
  for(const m of L.movers)drawMover(m,L); for(const f of L.floes) if(inVis(f.x,f.w))drawFloe(f,L); for(const p of L.wheelPl)drawGearPl(p,L);
  const tgt=(!P.rope&&!W.hook)?findAnchor(P):null; for(const a of L.anchors) if(inVis(a.x-20,40))drawAnchor(a,L,a===tgt);
  if(L.crates.length||L.pulls.length){ const tg=(!P.rope&&!W.hook&&!P.tow)?findGrab(P):null; drawMechFront4(L,tg); } else if(L4)drawWorm4();
  for(const v of L.vents) if(inVis(v.x-40,80))drawVent(v,L);
  for(const b of L.braziers) if(inVis(b.x-40,80))drawBrazier(b,L);
  L.cps.forEach((c,i)=>{ if(inVis(c.x-60,60))drawCheckpoint(c,i,L); });
  drawGoal(L);
  for(const ic of L.icicles) if(inVis(ic.x-10,20))drawIcicle(ic);
  for(const e of L.embers) if(inVis(e[0]-20,40))drawEmber(e); for(const s of L.shards) if(inVis(s.x-30,60))drawShard(s);
  drawParticles(false);
  drawPlayer(L); if(W.beam)drawBeam4();
  for(const s of L.sentinels) if(inVis(s.x-700,1400))drawSentinel(s,L);
  for(const d of L.drones) if(inVis(d.x-200,400))drawDrone(d,L);
  drawChaseWall(L);
  ctx.save(); ctx.globalCompositeOperation='lighter'; drawParticles(true); ctx.restore();
  ctx.setTransform(RS,0,0,RS,0,0);
  lightPass(L,cam);
  drawWeather(L,cam,dt);
  // экранные эффекты состояния
  if(L.heat&&P.heat>0.05){ const a=P.heat*P.heat*0.7; const g=ctx.createRadialGradient(VW/2,VH/2,VH*0.3,VW/2,VH/2,VH*0.85); g.addColorStop(0,'rgba(255,80,20,0)'); g.addColorStop(1,`rgba(255,70,10,${a})`); ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH); }
  if(L.cold&&P.cold>0.05){ ctx.globalAlpha=clamp(P.cold*(FX.lit?1.8:1.2),0,1); ctx.drawImage(FROST,0,0,VW,VH); ctx.globalAlpha=1; }
  if(W.expo>0){ ctx.fillStyle=`rgba(255,60,40,${W.expo*0.25*(0.6+0.4*Math.sin(t*30))})`; ctx.fillRect(0,0,VW,VH); }
  if(W.wall.active){ const g=ctx.createLinearGradient(0,0,VW*0.5,0); g.addColorStop(0,'rgba(255,120,30,.45)'); g.addColorStop(1,'rgba(255,120,30,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH); }
  distPass(L,cam); setFxForLevel(L);
  W.lastFrameTarget=tgt; }
// ---- HUD (в UI-канвас)
function hudBar(g,x,y,w,h,f,c0,c1){ g.fillStyle='rgba(0,0,0,.5)'; chamferPath(g,x,y,w,h,3); g.fill(); if(f>0){ const gr=g.createLinearGradient(x,0,x+w,0); gr.addColorStop(0,c0); gr.addColorStop(1,c1); g.fillStyle=gr; chamferPath(g,x,y,Math.max(6,w*f),h,3); g.fill(); }
  g.strokeStyle='rgba(242,192,136,.35)'; g.lineWidth=1; chamferPath(g,x-.5,y-.5,w+1,h+1,3); g.stroke(); }
function hudLabel(g,t,x,y,col='rgba(244,237,227,.8)'){ setFont(g,700,11,FONT_U); g.letterSpacing='2px'; g.fillStyle=col; g.fillText(t,x,y); g.letterSpacing='0px'; }
function drawHUD(dt){ const g=U, P=W.P, L=LV; g.save(); g.textBaseline='alphabetic';
  // левая панель: температура + Печка
  const val=L.heat?P.heat:L.cold?P.cold:null; const px=28, py=22, pw=262, ph=val!==null?96:56;
  panel(g,px,py,pw,ph,{c:10,alpha:0.92});
  let yy=py+24;
  if(val!==null){ hudLabel(g,L.heat?'ПЕРЕГРЕВ КОСТЮМА':'ПЕРЕОХЛАЖДЕНИЕ',px+18,yy); const crit=val>0.7;
    hudBar(g,px+18,yy+8,pw-36,9,val,L.heat?'#ffcf7a':'#d8f2ff',L.heat?'#ff3b1f':'#5aa8ff');
    if(crit){ g.globalAlpha=0.5+0.5*Math.sin(W.time*14); g.strokeStyle=L.heat?'#ff5a2a':'#9fd8ff'; g.lineWidth=1.6; chamferPath(g,px+15,yy+5,pw-30,15,4); g.stroke(); g.globalAlpha=1; } yy+=40; }
  hudLabel(g,'ПЕЧКА',px+18,yy); const sw=(pw-36-18)/4;
  for(let i=0;i<4;i++){ const f=clamp(P.charge*4-i,0,1); const x=px+18+i*(sw+6); g.fillStyle='rgba(0,0,0,.5)'; chamferPath(g,x,yy+8,sw,9,3); g.fill();
    if(f>0){ g.fillStyle=`rgba(255,${150+f*60|0},70,${0.55+f*0.45})`; chamferPath(g,x,yy+8,sw*f,9,3); g.fill(); if(f>=1){ g.fillStyle='rgba(255,230,170,.55)'; g.fillRect(x+3,yy+9,sw-6,2); } }
    g.strokeStyle='rgba(242,192,136,.35)'; g.lineWidth=1; chamferPath(g,x-.5,yy+7.5,sw+1,10,3); g.stroke(); }
  // правая панель: осколки
  { const tot=L.shards.length, got=L.shards.filter(s=>s.taken).length; const w=196,h=56,x=VW-28-w,y=22; panel(g,x,y,w,h,{c:10,alpha:0.92,col:'#5fb8aa',rivetCol:'#9ff0e0'});
    const cx=x+30, cy=y+28; g.fillStyle='rgba(170,255,240,.95)'; g.beginPath(); g.moveTo(cx,cy-11); g.lineTo(cx+7,cy); g.lineTo(cx,cy+11); g.lineTo(cx-7,cy); g.closePath(); g.fill();
    g.fillStyle='rgba(255,255,255,.6)'; g.beginPath(); g.moveTo(cx,cy-11); g.lineTo(cx+3,cy-2); g.lineTo(cx,cy); g.closePath(); g.fill();
    setFont(g,700,20,FONT_T); g.fillStyle='#eafffb'; g.textAlign='left'; g.fillText(`${got} / ${tot}`,x+52,y+28); hudLabel(g,'ОСКОЛКИ ПАМЯТИ',x+52,y+44,'rgba(190,255,245,.6)'); }
  // глаз фонарщика
  if(W.expo>0.02){ const a=clamp(W.expo*1.5,0,1); g.save(); g.translate(VW/2,64); g.globalAlpha=a; g.fillStyle='rgba(20,6,4,.7)'; g.beginPath(); g.arc(0,0,40,0,7); g.fill(); g.strokeStyle='#ff6a4a'; g.lineWidth=2.5; g.beginPath(); g.ellipse(0,0,24,11,0,0,7); g.stroke(); g.fillStyle='#ff6a4a'; g.beginPath(); g.arc(0,0,4+W.expo*4,0,7); g.fill(); g.lineWidth=3; g.beginPath(); g.arc(0,0,34,-Math.PI/2,-Math.PI/2+Math.PI*2*W.expo); g.stroke(); g.restore(); }
  // название главы в начале
  const titleOn=W.time<3.2; let stackY=titleOn?192:92;
  if(titleOn){ const a=clamp(Math.min((W.time-0.3)/0.6,(3.2-W.time)/0.8),0,1); g.save(); g.globalAlpha=a; { const bg=g.createRadialGradient(VW/2,132,20,VW/2,132,330); bg.addColorStop(0,'rgba(10,6,4,.55)'); bg.addColorStop(1,'rgba(10,6,4,0)'); g.fillStyle=bg; g.fillRect(VW/2-340,60,680,150); } g.textAlign='center'; setFont(g,700,13,FONT_U); g.letterSpacing='5px'; g.fillStyle=UI.accent; g.fillText(L.sub.toUpperCase(),VW/2,104); g.letterSpacing='0px';
    fitFont(g,L.name,700,40,FONT_T,700,20); textShadowed(g,L.name,VW/2,150,'#fff3e4','rgba(0,0,0,.6)'); ornament(g,VW/2,170,360,UI.brass,1); g.restore(); }
  if(W.gustWarn&&!W.gust){ g.save(); g.globalAlpha=0.65+0.35*Math.sin(W.time*12); const t='ПОРЫВ ВЕТРА'; setFont(g,700,13,FONT_U); g.letterSpacing='3px'; const w=g.measureText(t).width+60; const y=stackY; stackY+=42;
    panel(g,VW/2-w/2,y,w,32,{c:8,col:'#b9a2e6',rivets:false}); g.textAlign='center'; g.fillStyle='#efe4ff'; g.fillText(t,VW/2,y+21); g.restore(); }
  // подсказка
  if(W.tip&&TIPS[W.tip]){ const [keys,text]=TIPS[W.tip]; const a=clamp(Math.min(W.tipT/0.4,(7-W.tipT)/0.6),0,1); g.save(); g.globalAlpha=a;
    let kw=0; for(const k of keys) kw+=keycapW(g,k)+8; const fs=fitFont(g,text,600,16,FONT_U,820-kw,12); const tw=Math.ceil(g.measureText(text).width);
    const w=36+kw+(keys.length?6:0)+tw, h=46, x0=Math.round(VW/2-w/2), y0=stackY; stackY+=h+12;
    panel(g,x0,y0,w,h,{c:10}); let x=x0+18; const by=y0+29; for(const k of keys){ x+=keycap(g,x,by,k)+8; } if(keys.length)x+=6;
    setFont(g,600,fs,FONT_U); g.textAlign='left'; g.fillStyle=W.tip==='run'?UI.accent:UI.ink; g.fillText(text,x,by-1); g.restore(); }
  // действие у цели
  if(W.canAct&&!W.finished&&L.goal.kind!=='door'){ const gx=(L.goal.x-W.cam.x)*W.cam.z+VW/2, gy=((L.goal.gy||600)-120-W.cam.y)*W.cam.z+VH/2; g.save();
    const t='удерживайте — '+L.goal.label; setFont(g,600,15,FONT_U); const w=36+30+keycapW(g,'E')+10+g.measureText(t).width, h=44; const x0=clamp(gx-w/2,20,VW-20-w), y0=clamp(gy-h/2,120,VH-200);
    panel(g,x0,y0,w,h,{c:10}); g.strokeStyle='rgba(0,0,0,.5)'; g.lineWidth=3; g.beginPath(); g.arc(x0+28,y0+22,9,0,7); g.stroke(); g.strokeStyle=UI.accent; g.beginPath(); g.arc(x0+28,y0+22,9,-Math.PI/2,-Math.PI/2+Math.PI*2*W.goalP); g.stroke();
    const kw=keycap(g,x0+46,y0+28,'E'); setFont(g,600,15,FONT_U); g.fillStyle=UI.ink; g.fillText(t,x0+46+kw+10,y0+27); g.restore(); }
  // тосты
  if(W.toast){ const T=W.toast; if(T.kind==='cp'){ const a=clamp(Math.min(T.t/0.3,(2.4-T.t)/0.5),0,1); g.save(); g.globalAlpha=a; const t='Контрольная точка'; setFont(g,600,16,FONT_U); const w=g.measureText(t).width+64, x=VW-28-w, y=90;
      panel(g,x,y,w,40,{c:9,rivets:false}); g.fillStyle=UI.accent; g.beginPath(); g.arc(x+22,y+20,5,0,7); g.fill(); g.globalAlpha=a*0.35; g.beginPath(); g.arc(x+22,y+20,10,0,7); g.fill(); g.globalAlpha=a; g.fillStyle='#ffe2bd'; g.fillText(t,x+40,y+26); g.restore(); }
    else { const a=clamp(Math.min(T.t/0.4,(6-T.t)/0.6),0,1); g.save(); g.globalAlpha=a; const name=SHARDS[T.id]||''; const fs=fitFont(g,name,700,26,FONT_T,620,16); const w=Math.max(360,g.measureText(name).width+80), h=62, x=VW/2-w/2, y=stackY+12;
      panel(g,x,y,w,h,{c:12,col:'#5fb8aa',rivetCol:'#9ff0e0',title:'НАЙДЕН ОСКОЛОК ПАМЯТИ',titleCol:'#9ff0e0'}); g.textAlign='center'; setFont(g,700,fs,FONT_T); textShadowed(g,name,VW/2,y+41,'#eafffb'); g.restore(); } }
  hud4(g,P,L);
  g.restore(); drawSubtitle(1,VH-70,true);
  if(SETTINGS.showFps)drawFps(); }
function hud4(g,P,L){ if(L.id!==4)return;
  // вибрация песка
  if(L.sand.length&&P.x>L.sand[0][0]-200&&P.x<L.sand[L.sand.length-1][1]+150){ const v=W.wormVib||0; const w=232,h=10,x=VW-28-18-w,y=176; const warn=W.worm.st==='warn';
    g.save(); panel(g,x-18,y-26,w+36,48,{c:8,rivets:false,alpha:0.85,col:warn?'#ff7a4a':undefined}); hudLabel(g,warn?'ЧЕРВЬ! НА КАМНИ!':'ВИБРАЦИЯ ПЕСКА',x,y-8,warn?'#ffb08a':'rgba(244,237,227,.8)');
    if(warn){ g.globalAlpha=0.6+0.4*Math.sin(W.time*24); } hudBar(g,x,y,w,h,v,'#f4d8a0','#ff5a2a'); g.restore(); }
  // плащ
  if(P.cloak){ const t=P.cloak.lit?'ПЛАЩ: ЛУЧ':'ПЛАЩ: НУЖЕН ПРЯМОЙ СВЕТ'; g.save(); setFont(g,700,12,FONT_U); g.letterSpacing='3px'; const w=g.measureText(t).width+44; panel(g,28,128,w,30,{c:7,rivets:false,alpha:0.85}); g.textAlign='center'; g.fillStyle=P.cloak.lit?'#fff4d0':'#d8c0a0'; g.fillText(t,28+w/2,148); g.restore(); }
  // выбор
  if(W.choice&&!W.choice.done&&!(typeof VOICE!=='undefined'&&VOICE.busy())){ const C=W.choice; const a=clamp(C.t/0.4,0,1); g.save(); g.globalAlpha=a; const w=640,h=150,x=VW/2-w/2,y=VH/2-h/2+10;
    panel(g,x,y,w,h,{c:14,sun:true,title:'СОЛА'}); g.textAlign='center'; setFont(g,500,18,FONT_U); g.fillStyle=UI.ink; g.fillText('Взять Солу с собой — или оставить в лагере?',VW/2,y+48);
    const opts=['Взять с собой','Оставить в лагере']; opts.forEach((o,i)=>{ const cx=VW/2+(i?150:-150), sel=C.sel===i; g.fillStyle=sel?'rgba(255,170,90,.28)':'rgba(0,0,0,.25)'; chamferPath(g,cx-130,y+70,260,44,8); g.fill(); if(sel){ g.strokeStyle=UI.accent; g.lineWidth=1.5; chamferPath(g,cx-130,y+70,260,44,8); g.stroke(); }
      setFont(g,700,18,FONT_T); g.fillStyle=sel?'#ffe6c4':'rgba(244,237,227,.7)'; g.fillText(o,cx,y+99); });
    setFont(g,500,13,FONT_U); g.fillStyle=UI.dim; g.fillText('A / D — выбор   ·   E / Пробел — решить',VW/2,y+h+26); g.restore(); } }
function drawFps(){ const g=U; g.save(); setFont(g,700,12,FONT_U); g.textAlign='right'; const t=`${Math.round(FPS)} FPS · ${scv.width}×${scv.height}`; g.fillStyle='rgba(0,0,0,.55)'; g.fillRect(VW-g.measureText(t).width-16,VH-24,g.measureText(t).width+12,18); g.fillStyle=FPS>=55?'#9ff0a0':FPS>=40?'#ffd27a':'#ff7a5a'; g.fillText(t,VW-10,VH-11); g.restore(); }
