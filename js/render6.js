'use strict';
// ===== Глава VI «Звёздный Зал»: прессы, латунь «Зари», таймеры ворот, Хронометр (остановка механизмов), Тео =====
function drawPress(p,L){ if(!inVis(p.x-20,p.w+40))return; const t=W.time, fr=W.frz>0; const cx=p.x+p.w/2;
  ctx.fillStyle='#14101c'; ctx.fillRect(cx-9,p.y-700,18,700); ctx.fillStyle='rgba(255,214,150,.18)'; ctx.fillRect(cx-9,p.y-700,3,700);
  ctx.fillStyle='#1e1828'; ctx.fillRect(cx-26,p.y-30,52,30);
  ctx.fillStyle=pat(L.tex,0.34); ctx.fillRect(p.x,p.y,p.w,p.h); shadeRect(p.x,p.y,p.w,p.h,'rgba(255,230,180,.16)','rgba(0,0,0,.65)');
  ctx.fillStyle='rgba(10,8,14,.75)'; for(let xx=p.x+6;xx<p.x+p.w-6;xx+=18){ ctx.beginPath(); ctx.moveTo(xx,p.y+p.h); ctx.lineTo(xx+9,p.y+p.h-10); ctx.lineTo(xx+18,p.y+p.h); ctx.fill(); }
  rimTop(p.x,p.y,p.w,L.pal.rim,1.5);
  const warn=p.warn&&!fr; ctx.fillStyle=warn?`rgba(255,${90+60*Math.sin(t*30)|0},50,1)`:'rgba(255,200,120,.5)'; ctx.fillRect(cx-4,p.y+p.h/2-4,8,8);
  if(warn){ ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.hot,cx,p.y+p.h+20,70,0.25); ctx.restore(); } }
function frozenTint(x,y,w,h){ if(!(W.frz>0))return; const a=clamp(W.frz/0.4,0,1)*0.55; ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.strokeStyle=`rgba(140,220,255,${a})`; ctx.lineWidth=2; ctx.strokeRect(x-3,y-3,w+6,h+6); ctx.restore(); }
function drawTimers6(L){ const t=W.time;
  for(const g of L.gates){ if(!g.tm||!inVis(g.x-40,g.w+80))continue; const st=W.flagT[g.id]; const left=st==null?0:clamp(1-(W.mt-st)/g.tm,0,1); const n=6, x0=g.dir==='lift'?g.x+g.w/2:g.x+g.w/2, y0=g.dir==='lift'?g.y-g.h-120:g.y-44;
    for(let i=0;i<n;i++){ const on=left*n>i; const x=x0+(i-(n-1)/2)*12; ctx.fillStyle='#120c18'; ctx.fillRect(x-5,y0-5,10,10); ctx.fillStyle=on?(W.frz>0?'rgba(150,230,255,1)':'rgba(255,214,120,1)'):'rgba(60,40,40,.9)'; ctx.fillRect(x-3,y0-3,6,6); }
    if(left>0){ ctx.save(); ctx.globalCompositeOperation='lighter'; glow(W.frz>0?GLOW.teal:GLOW.warm,x0,y0,40,0.3); ctx.restore(); } }
  if(W.frz>0){ for(const m of L.movers) if(inVis(m.x,m.w))frozenTint(m.x,m.y,m.w,m.h); for(const p of L.presses) if(inVis(p.x,p.w))frozenTint(p.x,p.y,p.w,p.h); for(const p of L.wheelPl) if(inVis(p.x,p.w))frozenTint(p.x,p.y,p.w,p.h);
    for(const m of L.mirrors) if(m.rot&&inVis(m.x-30,60))frozenTint(m.x-22,m.y-22,44,44); for(const a of L.anchors) if(a.per&&inVis(a.x-20,40))frozenTint(a.x-12,a.y-12,24,24); } }
function cacheDraw(d){ const t=W.time, open=W.chr; ctx.fillStyle='#1a1422'; ctx.fillRect(d.x-34,d.y-46,68,46); ctx.fillStyle='#2a2234'; ctx.fillRect(d.x-38,d.y-52,76,8); rivets(d.x-34,d.y-30,68,14);
  ctx.save(); ctx.translate(d.x,d.y-52); ctx.rotate(open?-1.1:0); ctx.fillStyle='#2e2638'; ctx.fillRect(0,-6,38,6); ctx.restore();
  if(!open){ ctx.fillStyle='rgba(120,220,210,.95)'; ctx.beginPath(); ctx.arc(d.x,d.y-26,6+Math.sin(t*3),0,7); ctx.fill(); ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.teal,d.x,d.y-26,50,0.4+0.15*Math.sin(t*3)); ctx.restore(); } }
function ribDraw(d){ ctx.save(); ctx.strokeStyle='#120e1a'; ctx.lineWidth=26; ctx.beginPath(); ctx.moveTo(d.x-260,d.y); ctx.quadraticCurveTo(d.x-200,d.y-560,d.x+60,d.y-640); ctx.stroke(); ctx.lineWidth=3; ctx.strokeStyle='rgba(255,214,150,.18)'; ctx.beginPath(); ctx.moveTo(d.x-248,d.y); ctx.quadraticCurveTo(d.x-188,d.y-552,d.x+60,d.y-628); ctx.stroke(); ctx.restore(); }
function orreryDraw(d){ const t=W.mt||0; const cx=d.x, cy=d.y-190; ctx.fillStyle='#14101c'; ctx.fillRect(cx-6,cy,12,190); ctx.fillRect(cx-40,d.y-12,80,12);
  ctx.save(); ctx.translate(cx,cy); ctx.strokeStyle='rgba(220,180,110,.75)'; ctx.lineWidth=2; for(let i=0;i<3;i++){ ctx.save(); ctx.rotate(t*(0.3+i*0.22)+i); ctx.scale(1,0.35+i*0.15); ctx.beginPath(); ctx.arc(0,0,40+i*24,0,7); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle='rgba(255,210,130,1)'; ctx.beginPath(); ctx.arc(0,0,10,0,7); ctx.fill(); for(let i=0;i<3;i++){ const a=t*(0.6+i*0.4)+i*2; ctx.fillStyle='rgba(180,220,255,.9)'; ctx.beginPath(); ctx.arc(Math.cos(a)*(40+i*24),Math.sin(a)*(40+i*24)*(0.35+i*0.15),4,0,7); ctx.fill(); }
  ctx.globalCompositeOperation='lighter'; glow(GLOW.warm,0,0,60,0.35); ctx.restore(); }
function scopeDraw(d){ const k=d.big?1.8:1; const cx=d.x, by=d.y; ctx.save(); ctx.translate(cx,by); ctx.scale(k,k); ctx.fillStyle='#14101c'; ctx.beginPath(); ctx.moveTo(-50,0); ctx.lineTo(-18,-120); ctx.lineTo(18,-120); ctx.lineTo(50,0); ctx.fill();
  ctx.translate(0,-125); ctx.rotate(-0.75); ctx.fillStyle='#2a2030'; ctx.fillRect(-30,-22,230,44); ctx.fillStyle='#3a2e3c'; ctx.fillRect(170,-30,46,60); ctx.fillStyle='rgba(255,214,150,.35)'; ctx.fillRect(-30,-22,230,3);
  if(d.big){ const p=W.finished?1:(W.goalP||0); ctx.fillStyle=`rgba(${150+p*105|0},${220-p*20|0},255,${0.5+p*0.5})`; ctx.beginPath(); ctx.arc(216,0,22,0,7); ctx.fill(); ctx.globalCompositeOperation='lighter'; glow(GLOW.teal,216,0,90+p*160,0.3+p*0.5); }
  ctx.restore(); }
function drawDecor6(L){ for(const d of L.decor){ if(!inVis(d.x-300,600))continue; if(d.k==='cache')cacheDraw(d); else if(d.k==='rib')ribDraw(d); else if(d.k==='orrery')orreryDraw(d); else if(d.k==='scope')scopeDraw(d); }
  drawDecor5(L); }
function drawTeo(n){ const t=W.time; const x=n.x, y=n.y; const P=W.P; const f=P.x>x?1:-1; const im=IMG.teo_full;
  ctx.fillStyle='rgba(10,6,16,.4)'; ctx.beginPath(); ctx.ellipse(x,y,16,3.5,0,0,7); ctx.fill(); if(!im)return;
  const H=64, Wd=H*im.width/im.height, br=Math.sin(t*2.1+x)*0.01; ctx.save(); ctx.translate(x,y); ctx.scale(f,1); ctx.drawImage(im,-Wd/2,-H*(1+br),Wd,H*(1+br)); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation='lighter'; glow(GLOW.teal,x,y-34,44,0.1); ctx.restore(); }
// экран: «стоп-кадр» механизмов
function freezeOverlay(g){ if(!LV.chrono)return; const f=W.frz||0; if(f>0){ const a=clamp(Math.min((LV.chronoT-f)/0.25,f/0.4),0,1); g.save(); g.globalAlpha=a*0.9;
    const gr=g.createRadialGradient(VW/2,VH/2,VH*0.25,VW/2,VH/2,VH*0.9); gr.addColorStop(0,'rgba(120,200,255,0)'); gr.addColorStop(1,'rgba(90,170,255,.32)'); g.fillStyle=gr; g.fillRect(0,0,VW,VH);
    g.strokeStyle='rgba(170,230,255,.35)'; g.lineWidth=2; const R=Math.min(VW,VH)*0.47; for(let i=0;i<60;i++){ const an=i/60*Math.PI*2; const r1=i%5?R-8:R-20; g.beginPath(); g.moveTo(VW/2+Math.cos(an)*r1,VH/2+Math.sin(an)*r1); g.lineTo(VW/2+Math.cos(an)*R,VH/2+Math.sin(an)*R); g.stroke(); }
    g.restore(); } }
function hudChrono(g){ if(!LV.chrono||!W.chr)return; const x=28+262+16+34, y=22+28; const f=W.frz||0, cd=W.frzCd||0; const T=LV.chronoT||3, C=LV.chronoCd||4.5;
  g.save(); g.fillStyle='rgba(12,10,18,.82)'; g.beginPath(); g.arc(x,y,26,0,7); g.fill(); g.strokeStyle=f>0?'#9fe4ff':cd>0?'rgba(242,192,136,.4)':'#f2c088'; g.lineWidth=2; g.beginPath(); g.arc(x,y,26,0,7); g.stroke();
  let k, col; if(f>0){ k=f/T; col='#9fe4ff'; } else if(cd>0){ k=1-cd/C; col='rgba(242,192,136,.7)'; } else { k=1; col='#ffd690'; }
  g.strokeStyle=col; g.lineWidth=5; g.beginPath(); g.arc(x,y,19,-Math.PI/2,-Math.PI/2+Math.PI*2*k); g.stroke();
  const an=f>0?-Math.PI/2:-Math.PI/2+W.time*2; g.strokeStyle='#fff3e0'; g.lineWidth=2; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(an)*12,y+Math.sin(an)*12); g.stroke();
  keycap(g,x-10,y+50,'R'); g.restore(); }
