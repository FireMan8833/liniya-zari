'use strict';
// ===== игровой слой: текстурированная геометрия, механизмы, враги, героиня =====
const PAT={};
// Оптимизация: тайл заранее уменьшен до нужного масштаба (без setTransform у паттерна) — в разы быстрее на слабых GPU/софт-рендере
function pat(name,scale=0.36,tint){ const k=name+scale; if(PAT[k])return PAT[k]; const img=IMG[name]; if(!img)return '#444';
  const n=Math.max(16,Math.round(img.width*scale)), m=Math.max(16,Math.round(img.height*scale)); const c=mkCanvas(n,m), g=c.getContext('2d'); g.imageSmoothingQuality='high'; g.drawImage(img,0,0,n,m);
  PAT[k]=ctx.createPattern(c,'repeat'); return PAT[k]; }
let VIS={x0:0,x1:0};
function camApply(cam,shx=0,shy=0){ const z=cam.z; ctx.setTransform(RS*z,0,0,RS*z,RS*(VW/2-cam.x*z+shx),RS*(VH/2-cam.y*z+shy)); VIS.x0=cam.x-VW/2/z-240; VIS.x1=cam.x+VW/2/z+240; VIS.y0=cam.y-VH/2/z-200; VIS.y1=cam.y+VH/2/z+200; }
const inVis=(x,w)=>x+w>VIS.x0&&x<VIS.x1;
function shadeRect(x,y,w,h,top,bottom){ const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,top); g.addColorStop(1,bottom); ctx.fillStyle=g; ctx.fillRect(x,y,w,h); }
function rimTop(x,y,w,col,th=2){ ctx.fillStyle=col; ctx.fillRect(x,y,w,th); }
function drawSolid(s,L){ const pal=L.pal; const t=W.time; const bot=Math.min(s.y+s.h,VIS.y1+200); const h=bot-s.y;
  switch(s.k){
  case 'wagon': { const x=s.x,y=s.y,w=s.w;
    ctx.fillStyle=pat(L.tex,0.34); ctx.fillRect(x,y,w,h);
    shadeRect(x,y,w,h,'rgba(0,0,0,0.05)','rgba(10,4,2,0.75)');
    // боковые рёбра и окна
    ctx.fillStyle='rgba(0,0,0,.35)'; for(let xx=x+40;xx<x+w-20;xx+=120)ctx.fillRect(xx,y+14,6,h);
    if(s.win){ for(let xx=x+70;xx<x+w-60;xx+=120){ const fl=0.75+0.25*Math.sin(t*3+xx); ctx.fillStyle=`rgba(255,${170+(xx%40)|0},90,${0.75*fl})`; ctx.fillRect(xx,y+60,28,20); ctx.fillStyle='rgba(30,12,6,.9)'; ctx.fillRect(xx+13,y+60,2,20); ctx.fillRect(xx,y+69,28,2); } }
    if(s.loco){ ctx.fillStyle='rgba(0,0,0,.4)'; ctx.fillRect(x+w-160,y-90,110,90); ctx.fillStyle=pat(L.tex,0.34); ctx.fillRect(x+w-156,y-86,102,86); shadeRect(x+w-156,y-86,102,86,'rgba(0,0,0,0)','rgba(0,0,0,.5)'); ctx.fillStyle='rgba(255,200,120,.85)'; ctx.fillRect(x+w-140,y-70,30,26); ctx.fillRect(x+w-96,y-70,30,26);
      for(let i=0;i<3;i++){ ctx.fillStyle='#2a1610'; ctx.fillRect(x+120+i*160,y-70-i*10,26,70+i*10); ctx.fillStyle='#3a2216'; ctx.fillRect(x+116+i*160,y-76-i*10,34,8); } }
    // кромка крыши с ограждением
    rimTop(x,y,w,'rgba(40,18,10,1)',6); rimTop(x,y,w,pal.rim,1.5);
    ctx.strokeStyle='rgba(30,14,8,.9)'; ctx.lineWidth=2; ctx.beginPath(); for(let xx=x+6;xx<x+w;xx+=36){ctx.moveTo(xx,y);ctx.lineTo(xx,y-12);} ctx.moveTo(x+6,y-12); ctx.lineTo(x+w-6,y-12); ctx.stroke();
    // тележки и колёса
    if(L.train){ const wy=860; ctx.fillStyle='#1a0d08'; ctx.fillRect(x+20,wy-46,w-40,24); for(let xx=x+60;xx<x+w-40;xx+=90){ ctx.save(); ctx.translate(xx,wy-10); ctx.rotate(-t*2.2); ctx.fillStyle='#140a06'; ctx.beginPath(); ctx.arc(0,0,30,0,7); ctx.fill(); ctx.strokeStyle='rgba(255,150,80,.35)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,27,0,7); ctx.stroke(); ctx.beginPath(); for(let k=0;k<4;k++){ctx.moveTo(0,0);ctx.lineTo(Math.cos(k*1.57)*26,Math.sin(k*1.57)*26);} ctx.stroke(); ctx.restore(); } }
    break; }
  case 'crate': case 'tank': case 'tower': case 'girderblk': case 'wall': {
    ctx.fillStyle=pat(L.tex,0.3); ctx.fillRect(s.x,s.y,s.w,s.h); shadeRect(s.x,s.y,s.w,s.h,'rgba(255,255,255,.04)','rgba(0,0,0,.55)');
    if(s.k==='crate'){ ctx.strokeStyle='rgba(0,0,0,.5)'; ctx.lineWidth=3; ctx.strokeRect(s.x+3,s.y+3,s.w-6,s.h-6); ctx.beginPath(); ctx.moveTo(s.x+4,s.y+4); ctx.lineTo(s.x+s.w-4,s.y+s.h-4); ctx.stroke(); }
    if(s.k==='tank'){ const g=ctx.createLinearGradient(s.x,0,s.x+s.w,0); g.addColorStop(0,'rgba(0,0,0,.5)'); g.addColorStop(.35,'rgba(255,220,180,.12)'); g.addColorStop(1,'rgba(0,0,0,.6)'); ctx.fillStyle=g; ctx.fillRect(s.x,s.y,s.w,s.h);
      ctx.fillStyle='rgba(0,0,0,.45)'; for(let yy=s.y+20;yy<s.y+s.h;yy+=34)ctx.fillRect(s.x,yy,s.w,4); ctx.fillStyle='#24120a'; ctx.fillRect(s.x+10,s.y+s.h,8,500-(s.y+s.h)); ctx.fillRect(s.x+s.w-18,s.y+s.h,8,500-(s.y+s.h)); }
    if(s.k==='wall'){ ctx.fillStyle='rgba(225,240,255,.85)'; ctx.beginPath(); ctx.moveTo(s.x-3,s.y+4); for(let xx=0;xx<=s.w+6;xx+=8)ctx.lineTo(s.x-3+xx,s.y-3-Math.sin(xx*0.4+s.x)*2); ctx.lineTo(s.x+s.w+3,s.y+6); ctx.fill(); }
    rimTop(s.x,s.y,s.w,pal.rim,1.5); break; }
  case 'stone': case 'ruin': { ctx.fillStyle=pat(L.tex,0.42); ctx.fillRect(s.x,s.y,s.w,h); ctx.fillStyle=L.id===3?'rgba(10,20,34,.55)':'rgba(30,20,40,.55)'; ctx.fillRect(s.x,s.y,s.w,h);
    shadeRect(s.x,s.y,s.w,Math.min(h,400),'rgba(0,0,0,0)','rgba(0,0,0,.6)');
    if(L.id===3){ ctx.fillStyle='rgba(230,244,255,.92)'; ctx.beginPath(); ctx.moveTo(s.x-2,s.y+8); for(let xx=0;xx<=s.w+4;xx+=10)ctx.lineTo(s.x-2+xx,s.y-4-Math.abs(Math.sin(xx*0.13+s.x))*4); ctx.lineTo(s.x+s.w+2,s.y+10); ctx.fill(); }
    else rimTop(s.x,s.y,s.w,pal.rim,2); break; }
  case 'deck': { const x=s.x,y=s.y,w=s.w; // ферма моста
    ctx.strokeStyle='#1d1626'; ctx.lineWidth=5; ctx.beginPath(); for(let xx=x;xx<x+w;xx+=60){ ctx.moveTo(xx,y+20); ctx.lineTo(xx+30,y+90); ctx.lineTo(xx+60,y+20); } ctx.stroke(); ctx.fillStyle='#1d1626'; ctx.fillRect(x,y+86,w,8);
    ctx.fillStyle=pat(L.tex,0.22); ctx.fillRect(x,y,w,s.h); shadeRect(x,y,w,s.h,'rgba(255,255,255,.06)','rgba(0,0,0,.6)'); rimTop(x,y,w,pal.rim,2);
    ctx.fillStyle='#120c18'; for(let xx=x+10;xx<x+w;xx+=24)ctx.fillRect(xx,y-4,10,4); break; }
  case 'pillar': { ctx.fillStyle=pat(L.tex,0.3); ctx.fillRect(s.x,s.y,s.w,h); shadeRect(s.x,s.y,s.w,h,'rgba(255,255,255,.05)','rgba(0,0,0,.75)');
    ctx.strokeStyle='rgba(0,0,0,.5)'; ctx.lineWidth=3; for(let yy=s.y;yy<bot;yy+=s.w){ ctx.beginPath(); ctx.moveTo(s.x,yy); ctx.lineTo(s.x+s.w,yy+s.w); ctx.moveTo(s.x+s.w,yy); ctx.lineTo(s.x,yy+s.w); ctx.stroke(); } rimTop(s.x,s.y,s.w,pal.rim,2); break; }
  case 'beam': case 'boom': case 'slab': case 'arch': {
    if(s.k==='slab'){ ctx.fillStyle='#120c18'; ctx.fillRect(s.x+8,s.y,8,560-s.y); ctx.fillRect(s.x+s.w-16,s.y,8,560-s.y); }
    if(s.k==='arch'){ ctx.fillStyle=pat(L.tex,0.3); ctx.fillRect(s.x,s.y,s.w,s.h); ctx.fillStyle='rgba(10,20,34,.5)'; ctx.fillRect(s.x,s.y,s.w,s.h); ctx.fillStyle='rgba(230,244,255,.9)'; ctx.fillRect(s.x-2,s.y-4,s.w+4,6);
      ctx.fillStyle='#0d1824'; ctx.fillRect(s.x,s.y+s.h,18,(L.id===3?600:560)-(s.y+s.h)); ctx.fillRect(s.x+s.w-18,s.y+s.h,18,600-(s.y+s.h)); break; }
    ctx.fillStyle=pat(L.tex,0.25); ctx.fillRect(s.x,s.y,s.w,s.h); shadeRect(s.x,s.y,s.w,s.h,'rgba(255,255,255,.08)','rgba(0,0,0,.6)'); rimTop(s.x,s.y,s.w,pal.rim,1.5);
    if(s.k==='boom'){ ctx.strokeStyle='#2a140c'; ctx.lineWidth=3; ctx.beginPath(); for(let xx=s.x;xx<s.x+s.w;xx+=40){ctx.moveTo(xx,s.y+s.h);ctx.lineTo(xx+20,s.y+40);ctx.lineTo(xx+40,s.y+s.h);} ctx.stroke(); ctx.fillStyle='#2a140c'; ctx.fillRect(s.x,s.y+38,s.w,4); ctx.fillRect(s.x+s.w-20,s.y,10,520-s.y); }
    break; }
  case 'snow': case 'ice': { ctx.fillStyle=pat(L.tex,0.4); ctx.fillRect(s.x,s.y,s.w,h); ctx.fillStyle=s.k==='ice'?'rgba(20,60,90,.25)':'rgba(8,18,30,.45)'; ctx.fillRect(s.x,s.y,s.w,h);
    shadeRect(s.x,s.y,s.w,Math.min(h,300),'rgba(0,0,0,0)','rgba(0,5,15,.7)');
    if(s.k==='snow'){ ctx.fillStyle='rgba(232,245,255,.95)'; ctx.beginPath(); ctx.moveTo(s.x,s.y+10); for(let xx=0;xx<=s.w;xx+=14)ctx.lineTo(s.x+xx,s.y-3-Math.abs(Math.sin(xx*0.07+s.x*0.01))*5); ctx.lineTo(s.x+s.w,s.y+12); ctx.fill(); ctx.fillStyle='rgba(150,200,255,.25)'; ctx.fillRect(s.x,s.y+8,s.w,4); }
    else { const g=ctx.createLinearGradient(s.x,0,s.x+s.w,0); for(let i=0;i<=6;i++)g.addColorStop(i/6,i%2?'rgba(200,240,255,.5)':'rgba(200,240,255,.05)'); ctx.fillStyle=g; ctx.fillRect(s.x,s.y,s.w,5); ctx.fillStyle='rgba(255,255,255,.7)'; ctx.fillRect(s.x+((t*40)%s.w),s.y,30,2); }
    break; }
  case 'bound': break;
  case 'salt': case 'dune': case 'rock': case 'mtower': drawSolid4(s,L,h); break;
  default: ctx.fillStyle=pat(L.tex,0.3); ctx.fillRect(s.x,s.y,s.w,h); } }
function drawCrumble(c,L){ if(c.st>=2)return; let ox=0,oy=0; if(c.st===1){ ox=rnd(-1.5,1.5); oy=c.t*6; } ctx.save(); ctx.translate(ox,oy); ctx.fillStyle=pat(L.tex,0.3); ctx.fillRect(c.x+1,c.y,c.w-2,c.h); ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(c.x+1,c.y,c.w-2,c.h);
  ctx.strokeStyle='rgba(255,170,90,.55)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(c.x+8,c.y); ctx.lineTo(c.x+c.w*0.4,c.y+c.h*0.6); ctx.lineTo(c.x+c.w*0.7,c.y+c.h*0.3); ctx.lineTo(c.x+c.w-6,c.y+c.h); ctx.stroke(); rimTop(c.x+1,c.y,c.w-2,L.pal.rim,1.2); ctx.restore(); }
function drawMover(m,L){ ctx.strokeStyle='#120c18'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(m.x+12,m.y); ctx.lineTo(m.x+m.w/2,m.y-180); ctx.lineTo(m.x+m.w-12,m.y); ctx.stroke(); ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(m.x+m.w/2,m.y-180); ctx.lineTo(m.x+m.w/2,m.y-600); ctx.stroke();
  ctx.fillStyle=pat(L.tex,0.25); ctx.fillRect(m.x,m.y,m.w,m.h); shadeRect(m.x,m.y,m.w,m.h,'rgba(255,255,255,.1)','rgba(0,0,0,.6)'); rimTop(m.x,m.y,m.w,L.pal.rim,1.5); }
function drawFloe(f,L){ ctx.save(); const bob=Math.sin(W.time*2+f.x)*1.5; ctx.translate(0,bob); ctx.fillStyle='rgba(180,225,250,.92)'; ctx.beginPath(); ctx.moveTo(f.x,f.y); ctx.lineTo(f.x+f.w,f.y); ctx.lineTo(f.x+f.w-8,f.y+f.h); ctx.lineTo(f.x+6,f.y+f.h+4); ctx.closePath(); ctx.fill();
  ctx.fillStyle=pat(L.tex,0.35); ctx.globalAlpha=0.5; ctx.fill(); ctx.globalAlpha=1; ctx.fillStyle='rgba(255,255,255,.9)'; ctx.fillRect(f.x+2,f.y,f.w-4,3); if(f.sink>0){ ctx.fillStyle=`rgba(255,255,255,${clamp(f.sink/40,0,.6)})`; ctx.fillRect(f.x+20,f.y+4,2,f.h-6); ctx.fillRect(f.x+60,f.y+2,2,f.h-4); } ctx.restore(); }
function drawWater(w){ const t=W.time; const g=ctx.createLinearGradient(0,w.y,0,w.y+260); g.addColorStop(0,'rgba(30,70,100,.95)'); g.addColorStop(1,'rgba(4,10,20,1)'); ctx.fillStyle=g; ctx.fillRect(w.x1,w.y,w.x2-w.x1,300);
  ctx.strokeStyle='rgba(170,220,255,.35)'; ctx.lineWidth=1.5; for(let i=0;i<4;i++){ ctx.beginPath(); for(let x=w.x1;x<=w.x2;x+=20)ctx.lineTo(x,w.y+4+i*10+Math.sin(x*0.03+t*(1.5+i*0.3))*2); ctx.stroke(); } }
function drawGear(wh,L){ const t=W.time; const ang=t/wh.per*Math.PI*2; const R=wh.r+40;
  if(!wh._spr){ const S=Math.ceil(R*2+8); const c=mkCanvas(S,S), g=c.getContext('2d'); g.translate(S/2,S/2); const n=18;
    g.fillStyle='#0c1824'; g.beginPath(); for(let i=0;i<n*2;i++){ const a=i/(n*2)*Math.PI*2; const rr=i%2?R:R-22; g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } g.closePath(); g.fill();
    g.fillStyle='#16283a'; g.beginPath(); g.arc(0,0,R-36,0,7); g.fill(); g.fillStyle='#0c1824'; for(let i=0;i<wh.n;i++){ g.save(); g.rotate(i/wh.n*Math.PI*2); g.fillRect(0,-10,wh.r,20); g.restore(); }
    g.beginPath(); g.arc(0,0,34,0,7); g.fill(); g.strokeStyle='rgba(160,220,255,.35)'; g.lineWidth=3; g.beginPath(); g.arc(0,0,R-30,Math.PI*1.1,Math.PI*1.6); g.stroke();
    g.fillStyle='rgba(220,240,255,.8)'; g.beginPath(); g.arc(0,0,R-1,Math.PI*1.25,Math.PI*1.75); g.arc(0,0,R-6,Math.PI*1.75,Math.PI*1.25,true); g.fill(); wh._spr=c; }
  if(!inVis(wh.cx-R,R*2))return; const S=wh._spr.width; ctx.save(); ctx.translate(wh.cx,wh.cy); ctx.rotate(ang*0.999); ctx.drawImage(wh._spr,-S/2,-S/2); ctx.restore(); }
function drawGearPl(p,L){ ctx.strokeStyle='#0c1824'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(p.x+p.w/2,p.y); ctx.lineTo(p.x+p.w/2,p.y-16); ctx.stroke(); ctx.fillStyle=pat(L.tex,0.3); ctx.fillRect(p.x,p.y,p.w,p.h); shadeRect(p.x,p.y,p.w,p.h,'rgba(255,255,255,.1)','rgba(0,0,0,.6)'); ctx.fillStyle='rgba(230,245,255,.9)'; ctx.fillRect(p.x,p.y-2,p.w,4); }
function drawAnchor(a,L,target){ const t=W.time; ctx.strokeStyle='rgba(20,12,8,.9)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(a.x,a.y-10); ctx.lineTo(a.x,a.y-(a.per?40:400)); ctx.stroke();
  if(a.per){ ctx.fillStyle='#120c18'; ctx.fillRect(a.mx-60,a.y-52,a.mx2-a.mx+120,10); ctx.fillStyle='#2a2036'; ctx.fillRect(a.x-14,a.y-48,28,14); }
  ctx.fillStyle='#2a1d14'; ctx.fillRect(a.x-4,a.y-14,8,6);
  ctx.strokeStyle=target?'#ffd08a':'#8a7058'; ctx.lineWidth=3.2; ctx.beginPath(); ctx.arc(a.x,a.y,8,0,7); ctx.stroke(); ctx.strokeStyle='rgba(255,230,190,.6)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(a.x,a.y,8,Math.PI*1.1,Math.PI*1.6); ctx.stroke();
  if(target){ const p=0.6+0.4*Math.sin(t*8); ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,a.x,a.y,34,0.5*p); ctx.restore(); ctx.strokeStyle=`rgba(255,200,120,${0.7*p})`; ctx.lineWidth=1.5; const r=16+3*Math.sin(t*8); for(let i=0;i<4;i++){ const an=i*Math.PI/2+t*1.5; ctx.beginPath(); ctx.arc(a.x,a.y,r,an,an+0.7); ctx.stroke(); } } }
function zipPt(z,s){ return [z.x1+(z.x2-z.x1)*s, z.y1+(z.y2-z.y1)*s+Math.sin(s*Math.PI)*30]; }
function drawZip(z){ ctx.strokeStyle='#120c18'; ctx.lineWidth=2.4; ctx.beginPath(); for(let i=0;i<=24;i++){ const [x,y]=zipPt(z,i/24); i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.stroke();
  ctx.strokeStyle='rgba(255,180,140,.35)'; ctx.lineWidth=0.8; ctx.beginPath(); for(let i=0;i<=24;i++){ const [x,y]=zipPt(z,i/24); i?ctx.lineTo(x,y-1):ctx.moveTo(x,y-1);} ctx.stroke();
  for(const [x,y] of [[z.x1,z.y1],[z.x2,z.y2]]){ ctx.fillStyle='#120c18'; ctx.beginPath(); ctx.arc(x,y,7,0,7); ctx.fill(); ctx.fillRect(x-3,y,6,300); } }
function drawVent(v,L){ const t=W.time; const ph=(t+v.ph)%v.per; const warn=!v.active&&ph>v.per-0.6;
  ctx.fillStyle='#1c0e08'; ctx.fillRect(v.x-14,v.y-14,28,14); ctx.fillStyle='#3a2014'; ctx.fillRect(v.x-18,v.y-18,36,6);
  if(v.launch){ ctx.fillStyle='rgba(255,200,90,.9)'; for(let i=0;i<3;i++){ ctx.beginPath(); ctx.moveTo(v.x-8,v.y-26-i*9); ctx.lineTo(v.x,v.y-34-i*9); ctx.lineTo(v.x+8,v.y-26-i*9); ctx.lineTo(v.x+8,v.y-23-i*9); ctx.lineTo(v.x,v.y-31-i*9); ctx.lineTo(v.x-8,v.y-23-i*9); ctx.fill(); ctx.globalAlpha=0.5+0.5*Math.sin(t*6-i); } ctx.globalAlpha=1; }
  if(warn){ ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.hot,v.x,v.y-10,30,0.6+0.4*Math.sin(t*30)); ctx.restore(); }
  if(v.active){ const h=v.launch?260:200; const g=ctx.createLinearGradient(0,v.y-h,0,v.y); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(1,'rgba(255,250,240,.75)'); ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(v.x-10,v.y-16); ctx.lineTo(v.x-28+Math.sin(t*20)*3,v.y-h); ctx.lineTo(v.x+28+Math.cos(t*17)*3,v.y-h); ctx.lineTo(v.x+10,v.y-16); ctx.fill();
    if(Math.random()<0.6)addP({x:v.x+rnd(-6,6),y:v.y-16,vx:rnd(-40,40),vy:rnd(-520,-300),life:rnd(.35,.6),size:rnd(6,12),type:'steam'}); } }
function drawBrazier(b,L){ const t=W.time; ctx.fillStyle='#1a120c'; ctx.beginPath(); ctx.moveTo(b.x-18,b.y-34); ctx.lineTo(b.x+18,b.y-34); ctx.lineTo(b.x+10,b.y-14); ctx.lineTo(b.x-10,b.y-14); ctx.fill(); ctx.fillRect(b.x-2,b.y-14,4,14); ctx.fillRect(b.x-12,b.y-3,24,3);
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<5;i++){ const ph=t*7+i*1.7; const fx=b.x+Math.sin(ph)*5+(i-2)*4, fy=b.y-36-Math.abs(Math.sin(ph*0.7))*10; ctx.fillStyle=i%2?'rgba(255,140,40,.8)':'rgba(255,210,110,.75)'; ctx.beginPath(); ctx.moveTo(fx-6,b.y-34); ctx.quadraticCurveTo(fx-4,fy+6,fx,fy-10); ctx.quadraticCurveTo(fx+4,fy+6,fx+6,b.y-34); ctx.fill(); }
  glow(GLOW.hot,b.x,b.y-44,90,0.5+0.1*Math.sin(t*9)); ctx.restore(); if(Math.random()<0.3)addP({x:b.x+rnd(-8,8),y:b.y-50,vx:rnd(-20,20),vy:rnd(-120,-50),life:rnd(.6,1.2),size:rnd(1,2),type:'ember'}); }
function beamFan(x,y,ang,half,len,n=22){ const pts=[]; for(let i=0;i<=n;i++){ const a=ang-half+half*2*i/n; const ex=x+Math.cos(a)*len, ey=y+Math.sin(a)*len; let best=1;
    for(const s of LV.colStatic){ if(s.k==='bound')continue; if(s.x>Math.max(x,ex)+5||s.x+s.w<Math.min(x,ex)-5)continue; const tt=segT(x,y,ex,ey,s); if(tt<best)best=tt; } pts.push([x+(ex-x)*best,y+(ey-y)*best]); } return pts; }
function segT(x1,y1,x2,y2,b){ let t0=0,t1=1; const dx=x2-x1,dy=y2-y1; const p=[-dx,dx,-dy,dy], q=[x1-b.x,b.x+b.w-x1,y1-b.y,b.y+b.h-y1];
  for(let i=0;i<4;i++){ if(p[i]===0){ if(q[i]<0)return 1; } else { const r=q[i]/p[i]; if(p[i]<0){ if(r>t1)return 1; if(r>t0)t0=r; } else { if(r<t0)return 1; if(r<t1)t1=r; } } } return t0<=t1&&t0>0.01?t0:1; }
function drawBeam(pts,x,y,col,alert){ ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y,0,x,y,600); g.addColorStop(0,alert?'rgba(255,120,90,.55)':col); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g;
  ctx.beginPath(); ctx.moveTo(x,y); for(const p of pts)ctx.lineTo(p[0],p[1]); ctx.closePath(); ctx.fill(); ctx.globalAlpha=0.5; ctx.fill(); ctx.restore(); }
function drawSentinel(s,L){ ctx.fillStyle='#08121c'; ctx.fillRect(s.x-6,s.y,12,600-s.y); ctx.fillRect(s.x-20,s.y-6,40,10); ctx.beginPath(); ctx.moveTo(s.x-30,600); ctx.lineTo(s.x,s.y+120); ctx.lineTo(s.x+30,600); ctx.strokeStyle='#08121c'; ctx.lineWidth=4; ctx.stroke();
  const pts=beamFan(s.x,s.y+4,s.ang,0.17,720); drawBeam(pts,s.x,s.y+4,'rgba(210,235,255,.35)',W.seen);
  ctx.save(); ctx.translate(s.x,s.y+4); ctx.rotate(s.ang); ctx.fillStyle='#1a2a3a'; ctx.fillRect(-10,-9,26,18); ctx.fillStyle='#eaf6ff'; ctx.fillRect(14,-7,4,14); ctx.restore(); ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.cold,s.x+Math.cos(s.ang)*16,s.y+4+Math.sin(s.ang)*16,40,0.8); ctx.restore(); }
function drawDrone(d,L){ const t=W.time; const pts=beamFan(d.x,d.yy+12,Math.PI/2,0.34,470,18); drawBeam(pts,d.x,d.yy+12,'rgba(255,220,170,.32)',W.seen);
  ctx.save(); ctx.translate(d.x,d.yy); ctx.rotate(Math.sin(t*1.7)*0.06); ctx.fillStyle='#120c18'; ctx.beginPath(); ctx.ellipse(0,0,26,11,0,0,7); ctx.fill(); ctx.fillRect(-40,-4,80,4);
  for(const sx of [-40,40]){ ctx.fillStyle='rgba(200,180,220,.25)'; ctx.beginPath(); ctx.ellipse(sx,-8,18,3,0,0,7); ctx.fill(); ctx.strokeStyle='rgba(40,30,60,.9)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(sx-16*Math.cos(t*40),-8); ctx.lineTo(sx+16*Math.cos(t*40),-8); ctx.stroke(); }
  ctx.fillStyle=W.seen?'#ff5a3a':'#ffd9a0'; ctx.beginPath(); ctx.arc(0,8,5,0,7); ctx.fill(); ctx.restore(); ctx.save(); ctx.globalCompositeOperation='lighter'; glow(W.seen?GLOW.red:GLOW.warm,d.x,d.yy+10,46,0.9); ctx.restore(); }
function drawIcicle(ic){ if(ic.st===3)return; const ox=ic.st===1?rnd(-1.2,1.2):0; ctx.fillStyle='rgba(200,235,255,.9)'; ctx.beginPath(); ctx.moveTo(ic.x-9+ox,ic.y); ctx.lineTo(ic.x+9+ox,ic.y); ctx.lineTo(ic.x+ox,ic.y+46); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.9)'; ctx.beginPath(); ctx.moveTo(ic.x-5+ox,ic.y); ctx.lineTo(ic.x-1+ox,ic.y); ctx.lineTo(ic.x+ox,ic.y+36); ctx.fill(); }
function drawShard(s){ if(s.taken)return; const t=W.time; const y=s.y+Math.sin(t*2+s.x)*5; ctx.save(); ctx.translate(s.x,y); ctx.rotate(Math.sin(t*1.3)*0.2); ctx.globalCompositeOperation='lighter'; glow(GLOW.teal,0,0,46,0.6+0.2*Math.sin(t*4));
  ctx.fillStyle='rgba(170,255,240,.95)'; ctx.beginPath(); ctx.moveTo(0,-13); ctx.lineTo(7,0); ctx.lineTo(0,13); ctx.lineTo(-7,0); ctx.closePath(); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.9)'; ctx.beginPath(); ctx.moveTo(0,-13); ctx.lineTo(2,0); ctx.lineTo(0,13); ctx.lineTo(-3,0); ctx.fill();
  for(let i=0;i<3;i++){ const a=t*2+i*2.1; ctx.fillStyle='rgba(200,255,250,.8)'; ctx.fillRect(Math.cos(a)*18-1,Math.sin(a)*10-1,2,2);} ctx.restore(); }
function drawEmber(e){ if(e.taken)return; const t=W.time; const y=e[1]+Math.sin(t*3+e[0])*4; ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.hot,e[0],y,26,0.8); ctx.fillStyle='#ffe0a0'; ctx.beginPath(); ctx.arc(e[0],y,3.5,0,7); ctx.fill(); ctx.restore(); }
function drawCheckpoint(cp,i,L){ if(i===0)return; let y=600; for(const s of LV.colStatic){ if(cp.x>=s.x&&cp.x<=s.x+s.w&&s.y<y+400&&s.k!=='bound'){ y=Math.min(y,s.y); } } const lit=W.cp>=i; const x=cp.x-30;
  ctx.fillStyle='#160c08'; ctx.fillRect(x-2,y-62,4,62); ctx.fillRect(x-8,y-66,16,6); ctx.fillStyle=lit?'#ffd08a':'#3a2a20'; ctx.fillRect(x-5,y-60,10,12);
  if(lit){ ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,x,y-54,46,0.38+0.06*Math.sin(W.time*6)); ctx.restore(); } }
function drawGoal(L){ const g=L.goal; if(!g||!inVis(g.x-100,200))return; let y=600; for(const s of LV.colStatic){ if(g.x>=s.x&&g.x<=s.x+s.w&&s.k!=='bound')y=Math.min(y,s.y); } const t=W.time; g.gy=y;
  if(g.kind==='door'){ ctx.fillStyle='#1a0c06'; ctx.fillRect(g.x+20,y-80,46,80); ctx.fillStyle=`rgba(255,200,120,${0.6+0.2*Math.sin(t*3)})`; ctx.fillRect(g.x+26,y-74,34,74*clamp(1-W.goalP,0.15,1)+0); ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,g.x+43,y-40,90,0.5); ctx.restore(); }
  if(g.kind==='lever'){ ctx.fillStyle='#120c18'; ctx.fillRect(g.x+40,y-260,30,260); ctx.fillRect(g.x+120,y-260,30,260); const open=W.finished?1:W.goalP; ctx.fillStyle='#2a2036'; ctx.fillRect(g.x+70,y-250+open*-160,50,250); ctx.strokeStyle='#5a4a6a'; ctx.lineWidth=2; for(let yy=0;yy<250;yy+=25){ctx.beginPath(); ctx.moveTo(g.x+70,y-250+yy-open*160); ctx.lineTo(g.x+120,y-225+yy-open*160); ctx.stroke();}
    ctx.save(); ctx.translate(g.x,y-20); ctx.fillStyle='#1a1424'; ctx.fillRect(-12,0,24,20); ctx.rotate(-0.7+1.4*W.goalP); ctx.fillStyle='#8a7a9a'; ctx.fillRect(-2,-36,4,36); ctx.fillStyle='#ff6a4a'; ctx.beginPath(); ctx.arc(0,-38,5,0,7); ctx.fill(); ctx.restore(); }
  if(g.sem){ ctx.fillStyle='#2a1a10'; ctx.fillRect(g.x-14,y-46,28,46); ctx.fillStyle=W.goalP>0?'#ffd070':'rgba(255,90,60,.9)'; ctx.fillRect(g.x-8,y-40,16,8); ctx.strokeStyle='#2a1a10'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(g.x+14,y-30); ctx.lineTo(g.x+80,y-30); ctx.stroke(); return; }
  if(g.kind==='repair'){ ctx.strokeStyle='#2a3a4a'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(g.x-160,y-4); ctx.lineTo(g.x-20,y-4); ctx.moveTo(g.x+30,y-4+(1-W.goalP)*6); ctx.lineTo(g.x+180,y-4); ctx.stroke();
    ctx.save(); ctx.globalCompositeOperation='lighter'; const a=0.4+0.4*Math.sin(t*5); glow(W.goalP>0?GLOW.warm:GLOW.cold,g.x+5,y-6,50,a); ctx.restore(); ctx.fillStyle='#0c1824'; ctx.fillRect(g.x-50,y-40,20,36); ctx.fillStyle='rgba(255,90,60,.9)'; ctx.fillRect(g.x-45,y-36,10,6); } }
function drawCanopy(d){ ctx.fillStyle='#24120a'; ctx.fillRect(d.x,d.y,d.w,10); ctx.fillStyle='rgba(60,28,16,.95)'; ctx.beginPath(); ctx.moveTo(d.x-10,d.y); ctx.lineTo(d.x+d.w+10,d.y); ctx.lineTo(d.x+d.w,d.y-16); ctx.lineTo(d.x,d.y-16); ctx.fill();
  ctx.fillRect(d.x+6,d.y,6,(d.y<500?560:600)-d.y); ctx.fillRect(d.x+d.w-12,d.y,6,(560)-d.y);
  const g=ctx.createLinearGradient(0,d.y,0,d.y+140); g.addColorStop(0,'rgba(20,6,2,.4)'); g.addColorStop(1,'rgba(20,6,2,0)'); ctx.fillStyle=g; ctx.fillRect(d.x,d.y+10,d.w,140); }
function drawShelter(s,L){ const x=s.x,y=s.y; ctx.fillStyle=L.id===3?'#0c1824':'#150f1e'; if(L.id===3){ ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+4,y-s.h); ctx.lineTo(x+s.w*0.6,y-s.h+18); ctx.lineTo(x+s.w,y-s.h*0.6); ctx.lineTo(x+s.w,y); ctx.fill(); ctx.fillStyle='rgba(230,245,255,.85)'; ctx.fillRect(x+2,y-s.h-2,s.w*0.55,4); }
  else { ctx.strokeStyle='#150f1e'; ctx.lineWidth=5; ctx.strokeRect(x,y-s.h,s.w,s.h); ctx.lineWidth=3; for(let yy=y-s.h;yy<y;yy+=30){ctx.beginPath(); ctx.moveTo(x,yy); ctx.lineTo(x+s.w,yy+30); ctx.moveTo(x+s.w,yy); ctx.lineTo(x,yy+30); ctx.stroke();} ctx.fillRect(x-6,y-s.h-8,s.w+12,10); ctx.fillStyle=pat(L.tex,0.25); ctx.fillRect(x+8,y-s.h+4,s.w-16,s.h-4); ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(x+8,y-s.h+4,s.w-16,s.h-4); } }
function drawChaseWall(L){ const wx=W.wall.x; if(!W.wall.active)return; const t=W.time; ctx.save(); const g=ctx.createLinearGradient(wx-600,0,wx+120,0); const s4=L.id===4; g.addColorStop(0,s4?'rgba(255,255,245,1)':'rgba(255,240,200,1)'); g.addColorStop(.6,s4?'rgba(255,228,150,.95)':'rgba(255,140,40,.95)'); g.addColorStop(1,s4?'rgba(255,200,90,0)':'rgba(255,60,10,0)'); ctx.fillStyle=g; ctx.fillRect(wx-1200,0,1320,1200);
  ctx.globalCompositeOperation='lighter'; for(let i=0;i<14;i++){ const yy=200+i*50+Math.sin(t*3+i)*20; const len=80+60*Math.sin(t*5+i*1.3); ctx.fillStyle=`rgba(255,${150+i*5},60,.5)`; ctx.beginPath(); ctx.moveTo(wx-40,yy-20); ctx.quadraticCurveTo(wx+len,yy+Math.sin(t*9+i)*10,wx-40,yy+20); ctx.fill(); }
  glow(GLOW.hot,wx,500,420,0.6); ctx.restore(); for(let i=0;i<3;i++)addP({x:wx+rnd(-30,30),y:rnd(250,800),vx:rnd(100,400),vy:rnd(-200,0),life:rnd(.4,1),size:rnd(1.5,3.5),type:'ember'}); if(Math.random()<0.3)addP({x:wx-rnd(0,40),y:rnd(400,700),vx:rnd(50,150),vy:rnd(-150,-40),life:rnd(1,2),size:rnd(14,30),type:'smoke'}); }
function drawRails(L){ if(!L.train)return; const t=W.time; const y=880; ctx.fillStyle='#1a0b06'; ctx.fillRect(VIS.x0,y,VIS.x1-VIS.x0,400); ctx.fillStyle='#3a1a0c'; const off=(t*140)%60; for(let x=Math.floor(VIS.x0/60)*60-off;x<VIS.x1;x+=60)ctx.fillRect(x,y-6,34,10); ctx.fillStyle='#7a4a30'; ctx.fillRect(VIS.x0,y-12,VIS.x1-VIS.x0,5); ctx.fillStyle='rgba(255,160,90,.6)'; ctx.fillRect(VIS.x0,y-12,VIS.x1-VIS.x0,1.5);
  // раскалённая земля
  ctx.fillStyle='rgba(255,110,40,.25)'; for(let x=Math.floor(VIS.x0/200)*200;x<VIS.x1;x+=200){ ctx.fillRect(x+((x*7)%90),y+30,60,2); } }
// ---- героиня целиком (с тросом/крюком/шлейфом)
function drawPlayer(L){ const P=W.P; if(P.dead&&P.dead>0.12&&P.deathKind!=='freeze')return; const A=P.anim; const rim=L.pal.rim; const rdx=L.pal.lightDir[0], rdy=L.pal.lightDir[1];
  // шлейф рывка
  for(const g of A.ghosts){ ctx.save(); ctx.globalAlpha=g.a*0.6; ctx.globalCompositeOperation='lighter'; const fake={x:g.x,y:g.y,face:g.face,vx:P.vx,vy:0,charge:P.charge}; const FA=Object.assign({},A,{lean:g.lean,sq:g.sq,ph:g.ph,pose:'dash'}); drawHeroRig(ctx,fake,FA,{ghost:L.id===3?'#6fd8ff':'#ff9a4a'}); ctx.restore(); }
  const [gx,gy]=gripPt(P);
  // трос
  if(W.hook||P.rope){ const hx=P.rope?P.rope.a.x:W.hook.x, hy=P.rope?P.rope.a.y:W.hook.y; const len=P.rope?P.rope.L:Math.hypot(hx-gx,hy-gy); ropeUpdate(W.ropeV,gx,gy,hx,hy,P.rope?len:len*1.02,1/60,P.rope?300:900); ropeDraw(ctx,W.ropeV); drawHook(ctx,hx,hy,Math.atan2(hy-gy,hx-gx),P.rope?0.6:1); }
  if(P.tow)drawTow(P);
  ctx.save(); if(P.dead&&P.deathKind==='freeze'){ ctx.globalAlpha=1; }
  if(P.rope&&P.rope.att){ if(!HPART.ok)drawScarf(ctx,A); drawHeroHang(ctx,P,A,{ang:P.rope.ang,gx,gy,vt:P.rope.vt,rim}); }
  else if(P.zip){ const [cx,cy]=[P.x,P.y-60]; if(!HPART.ok)drawScarf(ctx,A); drawHeroHang(ctx,P,A,{ang:-Math.PI/2+P.face*0.15,gx:cx,gy:cy,vt:P.zip.v*P.face*0.3,rim}); drawHook(ctx,cx,cy-4,-Math.PI/2,0.5); }
  else { if(!HPART.ok)drawScarf(ctx,A); drawHeroRig(ctx,P,A,{rim,rdx,rdy}); }
  if(P.dead&&P.deathKind==='freeze'){ ctx.globalCompositeOperation='source-atop'; } ctx.restore(); if(P.cloak&&!P.dead)drawCloak(P);
  // свечение Печки
  ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.hot,P.x-P.face*12,P.y-44,16+P.charge*16,0.08+P.charge*0.16); ctx.restore();
  if(P.warming){ ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,P.x,P.y-30,80,0.5); ctx.restore(); }
  // дыхание на холоде
  if(L.cold&&!P.dead&&Math.random()<0.04)addP({x:P.x+P.face*8,y:P.y-50,vx:P.face*30+P.vx*0.3,vy:-10,life:1,size:3,type:'breath'}); }
