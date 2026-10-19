'use strict';
// ===== Глава V «Сангра»: железо мёртвого города, лампы Гильдии, лифты, предохранители, Мара =====
function rivets(x,y,w,step){ ctx.fillStyle='rgba(0,0,0,.45)'; for(let xx=x+8;xx<x+w-4;xx+=step)ctx.fillRect(xx,y,3,3); ctx.fillStyle='rgba(170,240,230,.18)'; for(let xx=x+8;xx<x+w-4;xx+=step)ctx.fillRect(xx,y,2,1); }
function drawSolid5(s,L,h){ const t=W.time;
  if(s.k==='hull'){ ctx.fillStyle=pat(L.tex,0.38); ctx.fillRect(s.x,s.y,s.w,h); ctx.fillStyle='rgba(30,22,46,.5)'; ctx.fillRect(s.x,s.y,s.w,h);
    shadeRect(s.x,s.y,s.w,Math.min(h,320),'rgba(120,200,190,.06)','rgba(6,4,14,.85)');
    ctx.fillStyle='rgba(0,0,0,.35)'; for(let xx=s.x+((s.x*7)%90)+60;xx<s.x+s.w-20;xx+=150)ctx.fillRect(xx,s.y+10,4,h);
    for(let yy=s.y+26;yy<s.y+Math.min(h,260);yy+=58)rivets(s.x,yy,s.w,22);
    if(s.w>300&&h>200){ for(let xx=s.x+110;xx<s.x+s.w-80;xx+=260){ const fl=0.6+0.4*Math.sin(t*2.3+xx); ctx.fillStyle=`rgba(255,${150+(xx%60)|0},80,${0.35*fl})`; ctx.fillRect(xx,s.y+70,22,14); ctx.fillStyle='rgba(10,6,16,.9)'; ctx.fillRect(xx+10,s.y+70,2,14); } }
    ctx.fillStyle='#16101e'; ctx.fillRect(s.x,s.y,s.w,6); rimTop(s.x,s.y,s.w,L.pal.rim,1.5);
    if(s.nowall){ ctx.fillStyle='rgba(150,230,220,.12)'; ctx.fillRect(s.x,s.y,5,h); } return; }
  if(s.k==='cover5'){ ctx.fillStyle=pat(L.tex,0.3); ctx.fillRect(s.x,s.y,s.w,s.h); shadeRect(s.x,s.y,s.w,s.h,'rgba(255,255,255,.05)','rgba(0,0,0,.6)'); ctx.strokeStyle='rgba(0,0,0,.5)'; ctx.lineWidth=3; ctx.strokeRect(s.x+4,s.y+4,s.w-8,s.h-8); rimTop(s.x,s.y,s.w,L.pal.rim,1.5); return; }
  if(s.k==='grate'){ ctx.strokeStyle='#120c18'; ctx.lineWidth=3; ctx.beginPath(); for(let xx=s.x;xx<s.x+s.w-10;xx+=40){ ctx.moveTo(xx,s.y+s.h); ctx.lineTo(xx+20,s.y+44); ctx.lineTo(xx+40,s.y+s.h); } ctx.stroke(); ctx.fillStyle='#120c18'; ctx.fillRect(s.x,s.y+42,s.w,4);
    ctx.fillStyle='#2a2234'; ctx.fillRect(s.x,s.y,s.w,s.h); ctx.fillStyle='rgba(0,0,0,.5)'; for(let xx=s.x+4;xx<s.x+s.w;xx+=10)ctx.fillRect(xx,s.y+3,5,s.h-6); rimTop(s.x,s.y,s.w,L.pal.rim,1.5); return; }
  ctx.fillStyle=pat(L.tex,0.3); ctx.fillRect(s.x,s.y,s.w,h); }
// ---- декор
function glampDraw(d){ const t=W.time; const on=!d.off; ctx.fillStyle='#120c18'; ctx.fillRect(d.x-3,d.y-150,6,150); ctx.fillRect(d.x-16,d.y-150,32,5); ctx.fillStyle='#1c1426'; ctx.fillRect(d.x-10,d.y-176,20,26);
  ctx.fillStyle=on?'rgba(150,255,235,.95)':'rgba(60,80,80,.8)'; ctx.fillRect(d.x-6,d.y-171,12,16); if(on){ ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.teal,d.x,d.y-163,70,0.35+0.08*Math.sin(t*3+d.x)); ctx.restore(); } }
function chimneyDraw(d){ const t=W.time, h=d.h||300; ctx.fillStyle='#17111f'; ctx.fillRect(d.x-18,d.y-h,36,h); ctx.fillStyle='#231a2e'; ctx.fillRect(d.x-24,d.y-h,48,10); ctx.fillStyle='rgba(0,0,0,.4)'; for(let y=d.y-h+30;y<d.y;y+=40)ctx.fillRect(d.x-18,y,36,3);
  if(Math.random()<0.25)addP({x:d.x+rnd(-8,8),y:d.y-h-4,vx:rnd(-10,25),vy:rnd(-70,-30),life:rnd(1.5,2.6),size:rnd(10,20),type:'steam'}); }
function gearDeco(x,y,r,a,col){ ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.fillStyle=col; ctx.beginPath(); for(let i=0;i<16;i++){ const an=i/16*Math.PI*2; const rr=i%2?r:r*0.84; ctx.lineTo(Math.cos(an)*rr,Math.sin(an)*rr); } ctx.fill(); ctx.fillStyle='rgba(0,0,0,.5)'; ctx.beginPath(); ctx.arc(0,0,r*0.3,0,7); ctx.fill(); ctx.restore(); }
function drawDecor5(L){ const t=W.time;
  for(const d of L.decor){ if(!inVis(d.x-200,400))continue;
    if(d.k==='glamp')glampDraw(d); else if(d.k==='chimney')chimneyDraw(d);
    else if(d.k==='sign'){ ctx.save(); ctx.font=`700 14px ${FONT_U}`; const sw=Math.min(500,Math.max(260,ctx.measureText(d.t).width+32));ctx.fillStyle='#17272d';ctx.fillRect(d.x-sw/2,d.y-22,sw,40);ctx.strokeStyle='rgba(150,230,220,.6)';ctx.lineWidth=1.5;ctx.strokeRect(d.x-sw/2+4,d.y-18,sw-8,32);fitFont(ctx,d.t,700,14,FONT_U,sw-24,12);ctx.textAlign='center';ctx.fillStyle='#d4e9de';ctx.fillText(d.t,d.x,d.y+3);ctx.restore(); }
    else if(d.k==='pipes'){ ctx.fillStyle='#1a1424'; ctx.fillRect(d.x,d.y-34,d.w,12); ctx.fillRect(d.x,d.y-60,d.w,8); ctx.fillStyle='rgba(150,230,220,.15)'; ctx.fillRect(d.x,d.y-34,d.w,2); }
    else if(d.k==='forge'){ ctx.fillStyle='#1a1018'; ctx.fillRect(d.x-50,d.y-90,100,90); ctx.fillStyle='#2a1a20'; ctx.fillRect(d.x-60,d.y-100,120,12); ctx.fillRect(d.x-10,d.y-200,24,100); const f=0.7+0.3*Math.sin(t*7)+0.1*Math.sin(t*23);
      ctx.fillStyle=`rgba(255,${140+f*60|0},60,${0.9})`; ctx.fillRect(d.x-30,d.y-60,60,36); ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.hot,d.x,d.y-42,140,0.35*f); ctx.restore();
      if(Math.random()<0.3)addP({x:d.x+rnd(-20,20),y:d.y-60,vx:rnd(-40,40),vy:rnd(-160,-60),life:rnd(.4,.9),size:rnd(1,2),type:'spark'}); }
    else if(d.k==='heart'){ const g=LV.goal, p=W.finished?1:W.goalP; const a=t*(0.2+p*2.5); gearDeco(d.x+40,d.y-260,150,a,'#1c1426'); gearDeco(d.x-120,d.y-140,80,-a*1.9,'#241a30');
      ctx.fillStyle='#120c18'; ctx.fillRect(d.x-40,d.y-120,140,120); const c=W.finished?1:p; ctx.fillStyle=`rgba(${120+c*135|0},${220-c*60|0},${210-c*140|0},.9)`; ctx.beginPath(); ctx.arc(d.x+30,d.y-70,26,0,7); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation='lighter'; glow(c>0.5?GLOW.warm:GLOW.teal,d.x+30,d.y-70,120+c*120,0.3+c*0.4); ctx.restore(); }
    else if(d.k==='fuse'){ const on=linkOn(d.id); ctx.fillStyle='#120c18'; ctx.fillRect(d.x-16,d.y-20,32,40); ctx.fillStyle=on?'rgba(255,214,120,1)':'rgba(70,40,40,.9)'; ctx.beginPath(); ctx.arc(d.x,d.y-2,9,0,7); ctx.fill();
      ctx.fillStyle='rgba(220,240,240,.85)'; ctx.font=`700 13px ${FONT_U}`; ctx.textAlign='center'; ctx.fillText(d.n,d.x,d.y+34); ctx.textAlign='left'; if(on){ ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,d.x,d.y-2,50,0.5); ctx.restore(); } } } }
// ---- столбы света (плащ работает только в них)
function drawShafts5(L){ const t=W.time; ctx.save(); ctx.globalCompositeOperation='lighter';
  for(const z of L.sunz){ if(!inVis(z[0]-60,z[1]-z[0]+120))continue; const w=z[1]-z[0], gy=groundY((z[0]+z[1])/2);
    const g=ctx.createLinearGradient(0,gy-560,0,gy); g.addColorStop(0,'rgba(255,220,160,0)'); g.addColorStop(1,`rgba(255,214,150,${0.22+0.05*Math.sin(t*1.3+z[0])})`); ctx.fillStyle=g;
    ctx.beginPath(); ctx.moveTo(z[0]+w*0.2,gy-560); ctx.lineTo(z[1]+w*0.35,gy-560); ctx.lineTo(z[1],gy); ctx.lineTo(z[0],gy); ctx.fill();
    ctx.fillStyle='rgba(255,220,160,.35)'; ctx.fillRect(z[0],gy-3,w,3);
    for(let i=0;i<5;i++){ const yy=gy-((t*30+i*110+z[0])%540); ctx.fillStyle='rgba(255,240,200,.5)'; ctx.fillRect(z[0]+((i*37+z[0])%w),yy,1.6,1.6); } }
  ctx.restore(); }
// ---- лифт на цепях
function drawLift5(g){ const top=g.y-g.h*g.open, t=W.time; const ty=g.y-g.h-90;
  ctx.fillStyle='#120c18'; ctx.fillRect(g.x-10,ty,g.w+20,12); ctx.fillRect(g.x-6,ty,6,g.y-ty); ctx.fillRect(g.x+g.w,ty,6,g.y-ty);
  ctx.strokeStyle='rgba(30,24,40,1)'; ctx.lineWidth=2.5; ctx.setLineDash([5,3]); ctx.lineDashOffset=-top*0.5; ctx.beginPath(); ctx.moveTo(g.x+10,ty+12); ctx.lineTo(g.x+10,top); ctx.moveTo(g.x+g.w-10,ty+12); ctx.lineTo(g.x+g.w-10,top); ctx.stroke(); ctx.setLineDash([]);
  gearDeco(g.x+g.w/2,ty+6,14,top*0.05,'#2a2034');
  ctx.fillStyle='#3a2e44'; ctx.fillRect(g.x,top,g.w,18); ctx.fillStyle='rgba(0,0,0,.45)'; for(let xx=g.x+6;xx<g.x+g.w;xx+=14)ctx.fillRect(xx,top+4,7,10); rimTop(g.x,top,g.w,LV.pal.rim,1.5);
  const lit=g.load||g.open>0; ctx.fillStyle=lit?'rgba(255,214,120,1)':'rgba(150,240,230,.8)'; ctx.fillRect(g.x+g.w/2-4,top+5,8,8);
  if(g.cargo&&g.open===0&&!g.load){ ctx.fillStyle='rgba(190,250,240,.8)'; ctx.font=`700 11px ${FONT_U}`; ctx.textAlign='center'; ctx.fillText('ГРУЗ',g.x+g.w/2,top-8); ctx.textAlign='left'; } }
// ---- лампы предохранителей над воротами
function drawFuseLamps(g){ const t=W.time; g.all.forEach((id,i)=>{ const x=g.x+g.w/2+(i-1)*26, y=g.y-44, on=linkOn(id); ctx.fillStyle='#120c18'; ctx.fillRect(x-10,y-10,20,20);
  ctx.fillStyle=on?'rgba(255,214,120,1)':`rgba(120,40,30,${0.7+0.2*Math.sin(t*4+i)})`; ctx.beginPath(); ctx.arc(x,y,7,0,7); ctx.fill(); if(on){ ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,x,y,34,0.6); ctx.restore(); } }); }
// ---- пунктирная подсказка пути луча
function drawHints5(L){ const P=W.P; for(const h of L.hints){ if(P.x<h.x1||P.x>h.x2)continue; if(L.receivers.some(r=>r.link===h.done&&r.done))continue; const t=W.time;
  ctx.save(); ctx.setLineDash([8,10]); ctx.lineDashOffset=-t*30; ctx.strokeStyle=`rgba(255,226,160,${0.35+0.15*Math.sin(t*3)})`; ctx.lineWidth=2; ctx.beginPath(); h.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke(); ctx.restore(); } }
// ---- понтоны
function drawPontoon(f,L){ ctx.save(); const bob=Math.sin(W.time*2+f.x)*1.5; ctx.translate(0,bob); ctx.fillStyle='#2a2234'; ctx.fillRect(f.x,f.y,f.w,f.h); ctx.fillStyle='#1a1424'; ctx.beginPath(); ctx.ellipse(f.x+f.w/2,f.y+f.h,f.w/2,10,0,0,Math.PI); ctx.fill();
  rivets(f.x,f.y+8,f.w,16); rimTop(f.x,f.y,f.w,L.pal.rim,1.5); if(f.sink>0){ ctx.fillStyle=`rgba(255,120,80,${clamp(f.sink/40,0,.8)})`; ctx.fillRect(f.x+f.w/2-3,f.y+6,6,6); } ctx.restore(); }
// ---- Мара
function drawMara(n){ const t=W.time; const x=n.x, y=n.y; const P=W.P; const f=P.x>x?1:-1; const im=IMG.mara_full;
  ctx.fillStyle='rgba(10,6,16,.4)'; ctx.beginPath(); ctx.ellipse(x,y,15,3.5,0,0,7); ctx.fill(); if(!im)return;
  const H=60, Wd=H*im.width/im.height, br=Math.sin(t*2.3+x)*0.012; ctx.save(); ctx.translate(x,y); ctx.scale(f,1); ctx.drawImage(im,-Wd/2,-H*(1+br),Wd,H*(1+br)); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,x,y-30,40,0.1); ctx.restore(); }
