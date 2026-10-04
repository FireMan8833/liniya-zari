'use strict';
// ===== UI-кит «Линии Зари»: латунные рамки со срезанными углами, заклёпки, тёплое дымчатое стекло =====
// Всё рисуется в UI-канвас (родное разрешение экрана) — текст всегда чёткий.
const UI={brass:'#c98a4b',brassL:'#f2c088',brassD:'#5a361c',ink:'#f4ede3',dim:'rgba(244,237,227,.66)',faint:'rgba(244,237,227,.42)',accent:'#ffb35a',teal:'#8ff0e0',cold:'#9fd0ff'};
function chamferPath(g,x,y,w,h,c){ g.beginPath(); g.moveTo(x+c,y); g.lineTo(x+w-c,y); g.lineTo(x+w,y+c); g.lineTo(x+w,y+h-c); g.lineTo(x+w-c,y+h); g.lineTo(x+c,y+h); g.lineTo(x,y+h-c); g.lineTo(x,y+c); g.closePath(); }
function setFont(g,w,size,fam){ g.font=`${w} ${size}px ${fam||FONT_U}`; }
// подобрать кегль, чтобы строка влезла в maxW
function fitFont(g,text,w,size,fam,maxW,min=10){ let s=size; setFont(g,w,s,fam); while(s>min&&g.measureText(text).width>maxW){ s-=1; setFont(g,w,s,fam); } return s; }
function wrapText(text,maxW,c=U){ const out=[]; for(const para of String(text).split('\n')){ const words=para.split(' '); let cur='';
    for(const w of words){ const t=cur?cur+' '+w:w; if(c.measureText(t).width>maxW&&cur){ out.push(cur); cur=w; } else cur=t; } out.push(cur); } return out; }
// рамка-панель
function panel(g,x,y,w,h,o={}){ const c=o.c!=null?o.c:12; const col=o.col||UI.brass; g.save(); if(o.alpha!=null)g.globalAlpha*=o.alpha;
  g.fillStyle='rgba(0,0,0,.32)'; chamferPath(g,x+2,y+4,w,h,c); g.fill();
  const gr=g.createLinearGradient(0,y,0,y+h); gr.addColorStop(0,o.top||'rgba(34,24,19,.88)'); gr.addColorStop(1,o.bot||'rgba(11,8,7,.92)'); g.fillStyle=gr; chamferPath(g,x,y,w,h,c); g.fill();
  g.lineWidth=1.6; g.strokeStyle=col; chamferPath(g,x+.8,y+.8,w-1.6,h-1.6,c); g.stroke();
  const ga=g.globalAlpha; g.globalAlpha=ga*0.38; g.lineWidth=1; chamferPath(g,x+5,y+5,w-10,h-10,Math.max(2,c-3)); g.stroke(); g.globalAlpha=ga;
  g.strokeStyle='rgba(255,224,180,.22)'; g.beginPath(); g.moveTo(x+c+6,y+3); g.lineTo(x+w-c-6,y+3); g.stroke();
  if(o.rivets!==false&&w>60&&h>36){ g.fillStyle=o.rivetCol||UI.brassL; const r=c*0.5+4; for(const [rx,ry] of [[x+r,y+r],[x+w-r,y+r],[x+r,y+h-r],[x+w-r,y+h-r]]){ g.beginPath(); g.arc(rx,ry,1.7,0,7); g.fill(); } }
  if(o.sun){ const cx=x+w/2; g.strokeStyle=col; g.lineWidth=1.4; g.beginPath(); g.arc(cx,y,9,Math.PI,0); g.stroke(); g.fillStyle=col; g.beginPath(); g.arc(cx,y,4,Math.PI,0); g.fill();
    for(let i=-2;i<=2;i++){ const a=-Math.PI/2+i*0.5; g.beginPath(); g.moveTo(cx+Math.cos(a)*12,y+Math.sin(a)*12); g.lineTo(cx+Math.cos(a)*17,y+Math.sin(a)*17); g.stroke(); }
    g.fillStyle=o.top||'rgba(34,24,19,.88)'; }
  if(o.title){ setFont(g,700,12,FONT_T); g.letterSpacing='3px'; const tw=g.measureText(o.title).width+30; const tx=x+18, ty=y-11;
    g.fillStyle='rgba(18,12,10,.96)'; chamferPath(g,tx,ty,tw,22,6); g.fill(); g.strokeStyle=o.titleCol||col; g.lineWidth=1.2; chamferPath(g,tx+.5,ty+.5,tw-1,21,6); g.stroke();
    g.fillStyle=o.titleCol||UI.accent; g.textAlign='left'; g.textBaseline='middle'; g.fillText(o.title,tx+15,ty+11.5); g.letterSpacing='0px'; g.textBaseline='alphabetic'; }
  g.restore(); }
// тонкая декоративная линия с ромбом в центре (для заставок/карточек)
function ornament(g,cx,y,w,col=UI.brass,a=1){ g.save(); g.globalAlpha*=a; g.strokeStyle=col; g.fillStyle=col; g.lineWidth=1.2;
  const gr=g.createLinearGradient(cx-w/2,0,cx+w/2,0); gr.addColorStop(0,'rgba(201,138,75,0)'); gr.addColorStop(.5,col); gr.addColorStop(1,'rgba(201,138,75,0)'); g.strokeStyle=gr;
  g.beginPath(); g.moveTo(cx-w/2,y); g.lineTo(cx-10,y); g.moveTo(cx+10,y); g.lineTo(cx+w/2,y); g.stroke();
  g.beginPath(); g.moveTo(cx,y-5); g.lineTo(cx+5,y); g.lineTo(cx,y+5); g.lineTo(cx-5,y); g.closePath(); g.fill(); g.restore(); }
// клавиша-«жетон»
function keycap(g,x,y,label){ setFont(g,700,13,FONT_U); const w=Math.max(28,Math.ceil(g.measureText(label).width)+16);
  g.fillStyle='rgba(60,40,26,.9)'; chamferPath(g,x,y-18,w,26,5); g.fill(); g.strokeStyle=UI.brassL; g.lineWidth=1.2; chamferPath(g,x+.5,y-17.5,w-1,25,5); g.stroke();
  g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(x+4,y+5,w-8,2);
  g.fillStyle='#ffe6c4'; g.textAlign='center'; g.fillText(label,x+w/2,y); g.textAlign='left'; return w; }
function keycapW(g,label){ setFont(g,700,13,FONT_U); return Math.max(28,Math.ceil(g.measureText(label).width)+16); }
// текст с мягкой подложкой-тенью без shadowBlur (дёшево)
function textShadowed(g,t,x,y,col,sh='rgba(0,0,0,.55)'){ g.fillStyle=sh; g.fillText(t,x+1,y+2); g.fillStyle=col; g.fillText(t,x,y); }
