'use strict';
// ===== Глава IV «Зеркальный лес»: соль, дюны, зеркальные башни, механизмы, луч плаща, черви, Сола =====
function drawSolid4(s,L,h){ const t=W.time;
  if(s.k==='salt'){ ctx.fillStyle=pat(L.tex,0.42); ctx.fillRect(s.x,s.y,s.w,h); ctx.fillStyle='rgba(150,92,52,.42)'; ctx.fillRect(s.x,s.y,s.w,h); shadeRect(s.x,s.y,s.w,Math.min(h,300),'rgba(60,30,14,.05)','rgba(40,18,8,.82)');
    ctx.fillStyle='rgba(255,250,236,.9)'; ctx.fillRect(s.x,s.y-2,s.w,4); ctx.fillStyle='rgba(255,255,255,.35)'; for(let xx=s.x+((s.x*13)%37);xx<s.x+s.w-20;xx+=53)ctx.fillRect(xx,s.y+5,18,1.5);
    if(s.nowall){ ctx.fillStyle='rgba(255,250,240,.18)'; ctx.fillRect(s.x,s.y,6,h); ctx.fillRect(s.x+s.w-6,s.y,6,h); } return; }
  if(s.k==='dune'){ ctx.fillStyle=pat(L.tex,0.5); ctx.fillRect(s.x,s.y,s.w,h); ctx.fillStyle='rgba(205,140,70,.32)'; ctx.fillRect(s.x,s.y,s.w,h); shadeRect(s.x,s.y,s.w,Math.min(h,320),'rgba(255,220,160,.12)','rgba(60,30,12,.7)');
    ctx.fillStyle='rgba(250,214,150,.95)'; ctx.beginPath(); ctx.moveTo(s.x,s.y+8); for(let xx=0;xx<=s.w;xx+=16)ctx.lineTo(s.x+xx,s.y-2-Math.sin(xx*0.035+s.x)*2.5-Math.sin(xx*0.11+t*0.6)*0.8); ctx.lineTo(s.x+s.w,s.y+8); ctx.fill();
    ctx.strokeStyle='rgba(120,70,30,.25)'; ctx.lineWidth=1; for(let i=0;i<3;i++){ ctx.beginPath(); for(let xx=0;xx<=s.w;xx+=20)ctx.lineTo(s.x+xx,s.y+14+i*12+Math.sin(xx*0.04+i*2+s.x)*3); ctx.stroke(); } return; }
  if(s.k==='rock'){ ctx.fillStyle=pat(L.tex,0.3); ctx.fillRect(s.x,s.y,s.w,h); ctx.fillStyle='rgba(60,40,30,.5)'; ctx.fillRect(s.x,s.y,s.w,h); shadeRect(s.x,s.y,s.w,Math.min(h,300),'rgba(255,230,200,.08)','rgba(20,10,6,.7)');
    ctx.fillStyle='rgba(255,236,200,.8)'; ctx.fillRect(s.x+3,s.y-1,s.w-6,3); ctx.fillStyle='rgba(40,24,16,.9)'; ctx.beginPath(); ctx.moveTo(s.x-8,s.y+4); ctx.lineTo(s.x+s.w*0.3,s.y-34); ctx.lineTo(s.x+s.w*0.62,s.y-26); ctx.lineTo(s.x+s.w+10,s.y-60); ctx.lineTo(s.x+s.w+14,s.y-52); ctx.lineTo(s.x+s.w*0.7,s.y-14); ctx.lineTo(s.x+s.w+2,s.y+4); ctx.fill(); return; }
  if(s.k==='mtower'){ ctx.fillStyle='#4a3424'; ctx.fillRect(s.x,s.y,s.w,s.h); ctx.fillStyle='rgba(255,232,190,.9)'; ctx.fillRect(s.x,s.y,s.w,2.5); ctx.strokeStyle='#2c1c12'; ctx.lineWidth=2; ctx.beginPath(); for(let xx=s.x;xx<s.x+s.w;xx+=24){ ctx.moveTo(xx,s.y+s.h); ctx.lineTo(xx+12,s.y+s.h+16); ctx.lineTo(xx+24,s.y+s.h); } ctx.stroke(); return; } }
function mtowerDecor(d){ const x=d.x, y=d.y, h=d.h, t=W.time; ctx.fillStyle='#3a2618'; ctx.fillRect(x-7,y-h,14,h); ctx.strokeStyle='#3a2618'; ctx.lineWidth=2.5; ctx.beginPath();
  for(let yy=y;yy>y-h+30;yy-=46){ ctx.moveTo(x-22,yy); ctx.lineTo(x+22,yy-46); ctx.moveTo(x+22,yy); ctx.lineTo(x-22,yy-46); } ctx.moveTo(x-26,y); ctx.lineTo(x-7,y-h*0.6); ctx.moveTo(x+26,y); ctx.lineTo(x+7,y-h*0.6); ctx.stroke();
  const ty=y-h; if(d.broken){ ctx.fillStyle='#2a1a10'; ctx.beginPath(); ctx.moveTo(x-30,ty+20); ctx.lineTo(x+40,ty-8); ctx.lineTo(x+36,ty+4); ctx.lineTo(x-26,ty+30); ctx.fill(); return; }
  const a=Math.sin(t*0.4+x)*0.25; ctx.save(); ctx.translate(x,ty); ctx.rotate(a); ctx.fillStyle='#2a1a10'; ctx.fillRect(-60,-6,120,12); const g=ctx.createLinearGradient(-56,0,56,0); g.addColorStop(0,'rgba(255,255,255,.55)'); g.addColorStop(.5,'rgba(255,248,225,1)'); g.addColorStop(1,'rgba(200,190,170,.6)');
  ctx.fillStyle=g; ctx.fillRect(-56,-12,112,7); ctx.restore(); ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.white,x+Math.sin(t*0.9+x)*30,ty-8,60,0.35+0.15*Math.sin(t*2+x)); ctx.restore(); }
function awningDecor(d){ const t=W.time; ctx.fillStyle='#3a2416'; const y=d.y; for(const px of [d.x+6,d.x+d.w-12].concat(d.camp?[d.x+d.w/2-3]:[]))ctx.fillRect(px,y,6,560-y);
  ctx.fillStyle='rgba(206,176,138,.97)'; ctx.beginPath(); ctx.moveTo(d.x-14,y+6); for(let xx=0;xx<=d.w+28;xx+=20)ctx.lineTo(d.x-14+xx,y-14-Math.sin(xx/(d.w+28)*Math.PI)*16+Math.sin(t*1.6+xx*0.08)*2); ctx.lineTo(d.x+d.w+14,y+6);
  for(let xx=d.w+28;xx>=0;xx-=20)ctx.lineTo(d.x-14+xx,y+6+Math.sin(t*2+xx*0.1)*2+(xx%40?3:0)); ctx.fill(); ctx.fillStyle='rgba(120,60,30,.5)'; ctx.fillRect(d.x-14,y+2,d.w+28,3);
  if(d.camp){ ctx.fillStyle='#2a1a10'; ctx.fillRect(d.x+120,500,70,60); ctx.fillRect(d.x+640,520,50,40); ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.hot,d.x+300,548,70,0.55+0.1*Math.sin(t*7)); ctx.restore(); ctx.fillStyle='#1c120a'; ctx.fillRect(d.x+286,540,28,20);
    ctx.strokeStyle='rgba(255,240,210,.7)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(d.x+40,y+10); ctx.quadraticCurveTo(d.x+200,y+40,d.x+360,y+12); ctx.stroke(); for(let i=0;i<7;i++){ ctx.fillStyle=i%2?'#e8c070':'#c86a3a'; ctx.fillRect(d.x+60+i*44,y+16+Math.sin(i*1.2)*6,8,12); } } }
function semaphoreDecor(d){ const g=LV.goal; const p=W.finished?1:W.goalP; const x=d.x, y=d.y; ctx.fillStyle='#2a1a10'; ctx.fillRect(x-6,y-330,12,330); ctx.fillRect(x-30,y-10,60,10);
  ctx.save(); ctx.translate(x,y-300); ctx.rotate(-0.9+p*1.2); ctx.fillStyle='#3a2416'; ctx.fillRect(0,-7,120,14); ctx.fillStyle='rgba(255,90,60,.9)'; ctx.fillRect(96,-6,20,12); ctx.restore();
  ctx.fillStyle='#3a2416'; ctx.fillRect(x-18,y-260,36,36); const on=p>0.02; ctx.fillStyle=on?'#fff0c0':'#5a4030'; ctx.beginPath(); ctx.arc(x,y-242,10,0,7); ctx.fill();
  if(on){ ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,x,y-242,60+120*p,0.4+0.5*p); ctx.restore(); } }
// тени: читаемые полосы на земле
function shadeBand(x0,x1,y){ for(let i=0;i<6;i++){ ctx.fillStyle=`rgba(34,18,48,${0.05+i*0.055})`; ctx.fillRect(x0,y-150+i*25,x1-x0,25); }
  ctx.fillStyle='rgba(26,12,36,.62)'; ctx.fillRect(x0,y-1,x1-x0,40); ctx.fillStyle='rgba(26,12,36,.3)'; ctx.fillRect(x0-6,y-1,6,40); ctx.fillRect(x1,y-1,6,40); }
function groundY(x){ let y=900; for(const s of LV.colStatic){ if(x>=s.x&&x<=s.x+s.w&&s.k!=='bound'&&!s.oneWay&&s.y<y)y=s.y; } return y; }
function drawShades4(L){ for(const s of L.shade){ if(!inVis(s[0],s[1]-s[0]))continue; shadeBand(s[0],s[1],groundY((s[0]+s[1])/2)); }
  for(const m of L.shadeMov){ const cx=m.cx!==undefined?m.cx:m.x; if(!inVis(cx,m.w))continue; shadeBand(cx,cx+m.w,groundY(cx+m.w/2)); }
  for(const c of L.crates){ if(!c.onG||c.y<c.y0-1&&false||!inVis(c.x-c.h,c.w+c.h))continue; const y=c.y+c.h; if(groundY(c.x-c.h*0.5)>y+2)continue; ctx.fillStyle='rgba(40,20,40,.38)'; ctx.beginPath(); ctx.moveTo(c.x+4,y); ctx.lineTo(c.x+4,c.y+10); ctx.lineTo(c.x-c.h*0.85,y-6); ctx.lineTo(c.x-c.h*0.85,y+4); ctx.fill(); }
  for(const s of L.sunz){ if(!inVis(s[0],s[1]-s[0]))continue; ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createLinearGradient(0,0,0,600); g.addColorStop(0,'rgba(255,250,220,0)'); g.addColorStop(1,`rgba(255,240,190,${0.22+0.06*Math.sin(W.time*3)})`); ctx.fillStyle=g; ctx.fillRect(s[0],0,s[1]-s[0],600); ctx.restore(); } }
function drawCrate(c,target){ const x=c.x,y=c.y,w=c.w,h=c.h; ctx.fillStyle='#6a4a30'; ctx.fillRect(x,y,w,h); ctx.fillStyle=pat(LV.tex,0.3); ctx.globalAlpha=0.35; ctx.fillRect(x,y,w,h); ctx.globalAlpha=1; shadeRect(x,y,w,h,'rgba(255,230,190,.12)','rgba(20,10,4,.5)');
  ctx.strokeStyle='#2a1a0e'; ctx.lineWidth=4; ctx.strokeRect(x+2,y+2,w-4,h-4); ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x+4,y+4); ctx.lineTo(x+w-4,y+h-4); ctx.moveTo(x+w-4,y+4); ctx.lineTo(x+4,y+h-4); ctx.stroke();
  ctx.fillStyle='rgba(255,240,210,.85)'; ctx.fillRect(x,y,w,2);
  for(const sx of [x+5,x+w-5]){ ctx.strokeStyle=target?'#ffd08a':'#9a8068'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(sx,y+h*0.36,6,0,7); ctx.stroke(); }
  if(target){ const p=0.6+0.4*Math.sin(W.time*8); const [hx,hy]=grabPt(c,W.P); ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,hx,hy,30,0.5*p); ctx.restore(); } }
function drawPlate(pl){ const y=pl.y; ctx.fillStyle='#2a1a10'; ctx.fillRect(pl.x-4,y-6,pl.w+8,8); ctx.fillStyle=pl.on?'#ffcf70':'#8a6a48'; ctx.fillRect(pl.x,y-(pl.on?3:7),pl.w,5);
  if(pl.on){ ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,pl.x+pl.w/2,y-4,pl.w*0.7,0.4); ctx.restore(); } }
function drawGate(g){ const o=g.open; if(g.dir==='bridge'){ const w=g.w*o; ctx.fillStyle='#2a1a10'; ctx.fillRect(g.x-16,g.y-6,16,60); ctx.fillRect(g.x+g.w,g.y-6,16,60);
    if(w>2){ ctx.fillStyle='#5a3e28'; ctx.fillRect(g.x,g.y,w,g.h); ctx.fillStyle='rgba(255,236,200,.85)'; ctx.fillRect(g.x,g.y,w,2); ctx.strokeStyle='#2a1a10'; ctx.lineWidth=2; ctx.beginPath(); for(let xx=g.x;xx<g.x+w-10;xx+=25){ ctx.moveTo(xx,g.y+g.h); ctx.lineTo(xx+12,g.y+g.h+18); ctx.lineTo(xx+25,g.y+g.h);} ctx.stroke(); } return; }
  const h=g.h*(1-o); ctx.fillStyle='#24160c'; ctx.fillRect(g.x-8,g.y-24,g.w+16,24); ctx.fillRect(g.x-8,g.y-24,6,g.h+24); ctx.fillRect(g.x+g.w+2,g.y-24,6,g.h+24);
  if(h>1){ ctx.fillStyle='#6a4a30'; ctx.fillRect(g.x,g.y,g.w,h); ctx.fillStyle='rgba(0,0,0,.35)'; for(let yy=g.y+12;yy<g.y+h;yy+=24)ctx.fillRect(g.x,yy,g.w,3); ctx.fillStyle='rgba(255,200,120,.8)'; ctx.fillRect(g.x+g.w/2-3,g.y+h-14,6,6); } }
function drawPull(p,target){ const t=W.time; ctx.strokeStyle='#2a1a10'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(p.x,p.y-12); ctx.lineTo(p.x,p.y-80); ctx.lineTo(p.x+90,p.y-80); ctx.stroke(); ctx.fillStyle='#2a1a10'; ctx.fillRect(p.x+84,p.y-86,12,300);
  const ang=p.done?0.9:0; ctx.save(); ctx.translate(p.x,p.y-80); ctx.rotate(ang); ctx.restore();
  ctx.strokeStyle=p.done?'#6a5a48':target?'#ffd08a':'#c0a070'; ctx.lineWidth=3.4; ctx.beginPath(); ctx.arc(p.x,p.y+(p.done?20:0),9,0,7); ctx.stroke();
  if(!p.done){ ctx.fillStyle='rgba(255,90,60,.9)'; ctx.fillRect(p.x-3,p.y-30,6,6); }
  if(target){ const k=0.6+0.4*Math.sin(t*8); ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,p.x,p.y,34,0.5*k); ctx.restore(); } }
function drawMirror(m){ const t=W.time; ctx.fillStyle='#2a1a10'; ctx.fillRect(m.x-4,m.y+18,8,Math.max(0,groundY(m.x)-m.y-18)); ctx.fillRect(m.x-14,m.y+14,28,8);
  ctx.save(); ctx.translate(m.x,m.y); const rot=(m.t==='/'?-Math.PI/4:Math.PI/4); const f=m.flip?Math.sin(m.flip/0.5*Math.PI)*0.6:0; ctx.strokeStyle='#2a1a10'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,22,0,7); ctx.stroke(); ctx.rotate(rot+f);
  ctx.fillStyle='#2a1a10'; ctx.fillRect(-32,-7,64,14); const g=ctx.createLinearGradient(0,-6,0,4); g.addColorStop(0,'#ffffff'); g.addColorStop(.5,'#dfe8ee'); g.addColorStop(1,'#8a9aa6'); ctx.fillStyle=g; ctx.fillRect(-29,-5,58,7); ctx.fillStyle='rgba(255,255,255,.9)'; ctx.fillRect(-29,-5,58,1.5); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.white,m.x,m.y,26,0.25+0.1*Math.sin(t*3+m.x)); ctx.restore(); }
function drawReceiver(r){ const t=W.time; const k=r.done?1:clamp(r.ch/r.need,0,1); ctx.fillStyle='#2a1a10'; ctx.fillRect(r.x-4,r.y+14,8,Math.max(0,groundY(r.x)-r.y-14));
  ctx.fillStyle='#3a2416'; ctx.beginPath(); ctx.arc(r.x,r.y,16,0,7); ctx.fill(); ctx.strokeStyle=r.done?'#ffe08a':'#c0a070'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(r.x,r.y,16,0,7); ctx.stroke();
  ctx.strokeStyle='#ffd070'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(r.x,r.y,11,-Math.PI/2,-Math.PI/2+Math.PI*2*k); ctx.stroke(); ctx.fillStyle=r.done?'#fff4c8':`rgba(255,${180+k*60|0},90,${0.4+k*0.6})`; ctx.beginPath(); ctx.arc(r.x,r.y,6,0,7); ctx.fill();
  if(k>0){ ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,r.x,r.y,30+k*30,0.3+k*0.4+(r.done?0.1*Math.sin(t*4):0)); ctx.restore(); } }
function drawBeam4(){ const B=W.beam; if(!B)return; const t=W.time; const path=()=>{ ctx.beginPath(); B.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); };
  ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='rgba(150,60,10,.45)'; ctx.lineWidth=9; path(); ctx.stroke(); ctx.strokeStyle='rgba(255,200,110,.9)'; ctx.lineWidth=5.5; path(); ctx.stroke(); ctx.strokeStyle='#fffdf0'; ctx.lineWidth=2.6+0.6*Math.sin(t*30); path(); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.lineCap='round';
  for(const [lw,a] of [[22,0.12],[10,0.25]]){ ctx.strokeStyle=`rgba(255,230,170,${a*(0.85+0.15*Math.sin(t*30))})`; ctx.lineWidth=lw; path(); ctx.stroke(); }
  const e=B.pts[B.pts.length-1]; glow(GLOW.white,e[0],e[1],40,0.7); for(let i=1;i<B.pts.length-1;i++)glow(GLOW.white,B.pts[i][0],B.pts[i][1],50,0.6); ctx.restore(); ctx.lineCap='butt';
  if(Math.random()<0.5)addP({x:e[0],y:e[1],vx:rnd(-90,90),vy:rnd(-120,30),life:rnd(.15,.35),size:rnd(1,2),type:'spark'}); }
function drawCloak(P){ if(!P.cloak)return; const t=W.time; const up=P.cloak.up; const x=P.x+P.face*10, y=P.y-44; ctx.save(); ctx.translate(x,y); ctx.scale(P.face,1); ctx.rotate(up?-0.55:0);
  ctx.fillStyle='#5a4030'; ctx.beginPath(); ctx.moveTo(-6,-26); ctx.quadraticCurveTo(14,-30,18,-6); ctx.quadraticCurveTo(20,14,8,30); ctx.lineTo(-4,28); ctx.closePath(); ctx.fill();
  const g=ctx.createLinearGradient(0,-26,10,28); g.addColorStop(0,'#ffffff'); g.addColorStop(.5,'#e8eef2'); g.addColorStop(1,'#b8c4cc'); ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(-2,-24); ctx.quadraticCurveTo(15,-26,17,-6); ctx.quadraticCurveTo(18,12,8,27); ctx.lineTo(4,26); ctx.quadraticCurveTo(12,8,10,-8); ctx.closePath(); ctx.fill(); ctx.restore();
  if(P.cloak.lit){ ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.white,x+P.face*14,y+4,48,0.5+0.15*Math.sin(t*20)); ctx.restore(); } }
function drawTow(P){ if(!P.tow)return; const c=P.tow.c; const [gx,gy]=gripPt(P); const [hx,hy]=grabPt(c,P); const d=Math.hypot(hx-gx,hy-gy); const sag=P.tow.taut?2:clamp((P.tow.L-d)*0.5+10,4,60);
  ctx.strokeStyle='#1a100a'; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(gx,gy); ctx.quadraticCurveTo((gx+hx)/2,(gy+hy)/2+sag,hx,hy); ctx.stroke(); ctx.strokeStyle='rgba(255,220,170,.4)'; ctx.lineWidth=0.8; ctx.beginPath(); ctx.moveTo(gx,gy-1); ctx.quadraticCurveTo((gx+hx)/2,(gy+hy)/2+sag-1,hx,hy-1); ctx.stroke();
  drawHook(ctx,hx,hy,Math.atan2(hy-gy,hx-gx),0.6); }
function drawWorm4(){ const wm=W.worm; if(!wm||wm.st==='idle')return; const t=W.time; const x=wm.x, y=wm.sy;
  if(wm.st==='warn'||wm.st==='flee'){ const a=wm.st==='warn'?clamp(wm.t/0.4,0,1):clamp(1-wm.t/0.9,0,1); ctx.fillStyle=`rgba(170,110,60,${0.85*a})`; ctx.beginPath(); ctx.moveTo(x-90,y+2); for(let i=0;i<=18;i++){ const u=i/18; ctx.lineTo(x-90+u*180,y-Math.sin(u*Math.PI)*(16+6*Math.sin(t*20+u*9))*a); } ctx.fill();
    ctx.fillStyle=`rgba(250,214,150,${0.9*a})`; for(let i=0;i<6;i++){ const xx=x-60+i*24+Math.sin(t*14+i)*4; ctx.fillRect(xx,y-10-Math.abs(Math.sin(t*17+i*2))*12*a,3,3); } }
  if(wm.st==='burst'){ const u=clamp(wm.t/1.4,0,1); const up=Math.sin(Math.min(1,wm.t/0.5)*Math.PI/2)*(1-clamp((wm.t-0.8)/0.6,0,1)); const H=230*up; if(H<2)return;
    ctx.fillStyle='#5a3a26'; ctx.beginPath(); ctx.moveTo(x-38,y+4); ctx.quadraticCurveTo(x-48,y-H*0.6,x-20,y-H); ctx.lineTo(x+20,y-H); ctx.quadraticCurveTo(x+48,y-H*0.6,x+38,y+4); ctx.fill();
    ctx.strokeStyle='rgba(30,16,10,.6)'; ctx.lineWidth=3; for(let yy=y-20;yy>y-H+20;yy-=22){ ctx.beginPath(); ctx.moveTo(x-38,yy); ctx.quadraticCurveTo(x,yy+8,x+38,yy); ctx.stroke(); }
    ctx.fillStyle='#2a140c'; ctx.beginPath(); ctx.ellipse(x,y-H,24,10,0,0,7); ctx.fill(); ctx.fillStyle='#e8d0b0'; for(let i=0;i<9;i++){ const a=i/9*Math.PI*2; ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*22,y-H+Math.sin(a)*8); ctx.lineTo(x+Math.cos(a)*14,y-H+Math.sin(a)*5-8); ctx.lineTo(x+Math.cos(a+0.25)*20,y-H+Math.sin(a+0.25)*7); ctx.fill(); }
    ctx.fillStyle=`rgba(170,110,60,${1-u})`; ctx.beginPath(); ctx.ellipse(x,y,70+u*40,10,0,0,7); ctx.fill(); } }
function drawSola(n){ const t=W.time; const x=n.x, y=n.y; const P=W.P; const f=P.x>x?1:-1; const bob=Math.sin(t*2.2+x)*1.2; ctx.save(); ctx.translate(x,y); ctx.scale(f,1);
  ctx.fillStyle='rgba(40,20,40,.3)'; ctx.beginPath(); ctx.ellipse(0,0,16,4,0,0,7); ctx.fill();
  ctx.fillStyle='#3a2a20'; ctx.fillRect(-6,-22,4,22); ctx.fillRect(2,-22,4,22);
  ctx.fillStyle='#d8c4a0'; ctx.beginPath(); ctx.moveTo(-12,-18+bob); ctx.quadraticCurveTo(-14,-40+bob,-6,-48+bob); ctx.lineTo(8,-48+bob); ctx.quadraticCurveTo(14,-36+bob,12,-18+bob); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#b89a70'; ctx.fillRect(-12,-24+bob,24,4);
  ctx.fillStyle='#e8d8b8'; ctx.beginPath(); ctx.arc(1,-56+bob,9,0,7); ctx.fill(); ctx.fillStyle='#c8a878'; ctx.beginPath(); ctx.arc(-1,-58+bob,11,Math.PI*0.9,Math.PI*2.05); ctx.lineTo(10,-50+bob); ctx.lineTo(-12,-48+bob); ctx.fill();
  ctx.fillStyle='#2a1a10'; ctx.fillRect(5,-58+bob,2,2);
  ctx.strokeStyle='rgba(255,236,200,.95)'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(-6,-48+bob); ctx.quadraticCurveTo(-18,-44+bob+Math.sin(t*3)*2,-24,-36+bob+Math.sin(t*3.4)*3); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,x,y-30,40,0.12); ctx.restore(); }
function drawMark(m){ const t=W.time; ctx.fillStyle='#2a1a10'; ctx.fillRect(m.x-5,m.y-90,10,90); ctx.fillStyle='rgba(120,220,210,.95)'; ctx.save(); ctx.translate(m.x,m.y-70); ctx.beginPath(); ctx.moveTo(-9,0); ctx.lineTo(0,-12); ctx.lineTo(9,0); ctx.lineTo(0,12); ctx.closePath(); ctx.lineWidth=2.5; ctx.strokeStyle='rgba(120,220,210,.95)'; ctx.stroke(); ctx.fillRect(-1,-6,2,12); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.teal,m.x,m.y-70,34,0.35+0.15*Math.sin(t*2)); ctx.restore(); }
function drawDecor4(L){ for(const d of L.decor){ if(d.k==='mtower'&&inVis(d.x-80,160))mtowerDecor(d); else if(d.k==='awning'&&inVis(d.x-20,d.w+40))awningDecor(d); else if(d.k==='semaphore'&&inVis(d.x-140,280))semaphoreDecor(d); } }
function drawMechBack4(L){ for(const pl of L.plates) if(inVis(pl.x,pl.w))drawPlate(pl); for(const g of L.gates) if(inVis(g.x-20,g.w+40))drawGate(g);
  for(const m of L.mirrors) if(inVis(m.x-40,80))drawMirror(m); for(const r of L.receivers) if(inVis(r.x-40,80))drawReceiver(r);
  for(const m of L.marks) if(inVis(m.x-30,60))drawMark(m);
  for(const n of L.npcs){ if(!inVis(n.x-40,80))continue; const show=n.when==='camp'?W.sola!=='take':W.sola==='take'; if(show)drawSola(n); } }
function drawMechFront4(L,tg){ for(const p of L.pulls) if(inVis(p.x-30,140))drawPull(p,tg===p); for(const c of L.crates) if(inVis(c.x,c.w))drawCrate(c,tg===c); drawWorm4(); }
