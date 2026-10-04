'use strict';
// ===== экраны: заставка, меню, главы, ролик, пауза, итоги, финал; главный цикл =====
let STATE='loading', ST={t:0};
const IS_ELECTRON=/Electron/i.test(navigator.userAgent);
const VERSION='v0.5.1';
if(!SETTINGS.fx)SETTINGS.fx='high';
function setState(s,o={}){ STATE=s; ST=Object.assign({t:0,sel:0},o); MOUSE.click=false; }
function loadSave(){ return Object.assign({chapter:0,cp:0,unlocked:0,shards:[],done:false,deaths:0,time:0},getSave()||{}); }
let SAVE=loadSave();
function persist(){ setSave(SAVE); }
function onShard(id){ if(!SAVE.shards.includes(id))SAVE.shards.push(id); persist(); }
function onCheckpoint(i){ SAVE.chapter=LV.idx; SAVE.cp=i; persist(); }
function onChoice(c){ SAVE.sola=c; persist(); }
function onChase(on){ AUD.playMusic(on?'m_chase':LV.music,on?0.6:3); }
// ---- общие элементы меню (текст — в UI-канвас)
function menuList(items,x,y,opts={}){ const g=U; const gap=opts.gap||54; const rw=opts.w||420; let clicked=-1;
  const hitRow=i=>MOUSE.x>x-24&&MOUSE.x<x+rw&&MOUSE.y>y+i*gap-30&&MOUSE.y<y+i*gap+14&&!items[i].disabled;
  if(MOUSE.moved){ items.forEach((it,i)=>{ if(hitRow(i)&&ST.sel!==i){ST.sel=i;AUD.play('s_ui_move',{vol:.4});} }); MOUSE.moved=false; }
  if(MOUSE.click){ items.forEach((it,i)=>{ if(hitRow(i))clicked=i; }); }
  if(INPUT.hit('down')){ do{ST.sel=(ST.sel+1)%items.length;}while(items[ST.sel].disabled); AUD.play('s_ui_move',{vol:.4}); }
  if(INPUT.hit('up')){ do{ST.sel=(ST.sel-1+items.length)%items.length;}while(items[ST.sel].disabled); AUD.play('s_ui_move',{vol:.4}); }
  if(clicked>=0)ST.sel=clicked; const it=items[ST.sel];
  if(it&&it.adj){ if(INPUT.hit('left')){it.adj(-1);AUD.play('s_ui_move',{vol:.4});} if(INPUT.hit('right')){it.adj(1);AUD.play('s_ui_move',{vol:.4});} }
  if((INPUT.hit('confirm')||clicked>=0)&&it&&it.act){ AUD.play('s_ui_select',{vol:.6}); it.act(1); }
  const small=opts.small; const fs=small?19:24;
  items.forEach((it,i)=>{ const sel=i===ST.sel; const yy=y+i*gap; g.save(); g.textBaseline='alphabetic';
    if(sel){ const gr=g.createLinearGradient(x-24,0,x+rw,0); gr.addColorStop(0,'rgba(255,170,90,.26)'); gr.addColorStop(1,'rgba(255,170,90,.02)'); g.fillStyle=gr; chamferPath(g,x-24,yy-29,rw+24,40,8); g.fill();
      g.strokeStyle='rgba(242,192,136,.55)'; g.lineWidth=1; chamferPath(g,x-23.5,yy-28.5,rw+23,39,8); g.stroke();
      g.fillStyle=UI.accent; g.beginPath(); g.moveTo(x-14,yy-15); g.lineTo(x-7,yy-9); g.lineTo(x-14,yy-3); g.closePath(); g.fill(); }
    const valW=it.value!==undefined?150:0; const lf=fitFont(g,it.label,small?600:700,fs,small?FONT_U:FONT_T,rw-valW-16,12);
    g.fillStyle=it.disabled?'rgba(244,237,227,.3)':sel?'#ffe6c4':'rgba(244,237,227,.78)'; g.fillText(it.label,x,yy);
    if(it.value!==undefined){ g.textAlign='right'; setFont(g,600,17,FONT_U); g.fillStyle=sel?UI.accent:'rgba(244,237,227,.62)'; g.fillText(typeof it.value==='function'?it.value():it.value,x+rw-14,yy); }
    g.restore(); });
  const cur=items[ST.sel]; if(cur&&cur.note&&opts.noteY){ g.save(); setFont(g,500,14,FONT_U); g.fillStyle=UI.dim; const ls=wrapText(cur.note,rw); ls.forEach((l,i)=>g.fillText(l,x,opts.noteY+i*19)); g.restore(); }
  MOUSE.click=false; }
// окно с заголовком (рамка + крупный заголовок + орнамент)
let MENU_EMB=null;
function bgMenu(img='cover'){ const t=performance.now()/1000; const mx=(MOUSE.x/VW-0.5)*14, my=(MOUSE.y/VH-0.5)*10;
  drawCover(IMG[img],-20-mx,-20-my,VW+40,VH+40,1.04+Math.sin(t*0.05)*0.02,0.6,0.5);
  let gr=ctx.createLinearGradient(0,0,VW*0.7,0); gr.addColorStop(0,'rgba(8,8,14,.88)'); gr.addColorStop(.55,'rgba(8,8,14,.4)'); gr.addColorStop(1,'rgba(8,8,14,0)'); ctx.fillStyle=gr; ctx.fillRect(0,0,VW,VH);
  if(!MENU_EMB)MENU_EMB=Array.from({length:80},()=>({x:rnd(0,VW),y:rnd(0,VH),v:rnd(20,70),s:rnd(1,2.6),p:rnd(0,6)}));
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(const e of MENU_EMB){ e.y-=e.v/60; e.x+=Math.sin(t+e.p)*0.4-0.2; if(e.y<-10){e.y=VH+10;e.x=rnd(0,VW);} ctx.globalAlpha=0.5+0.5*Math.sin(t*5+e.p); ctx.fillStyle='#ffb35a'; ctx.fillRect(e.x,e.y,e.s,e.s); glow(GLOW.hot,e.x,e.y,e.s*6,0.25);} ctx.restore(); ctx.globalAlpha=1;
  Object.assign(FX,{bloom:0.5,thr:0.7,vign:0.45,grain:0.05,sat:1.05}); }
function drawTitle(x,y,size=84,a=1){ const g=U; g.save(); g.globalAlpha=a; g.textAlign='left'; setFont(g,700,size,FONT_T); g.letterSpacing=(size*0.05)+'px';
  g.shadowColor='rgba(255,140,60,.45)'; g.shadowBlur=24; g.fillStyle='#fff3e4'; g.fillText('ЛИНИЯ ЗАРИ',x,y); g.shadowBlur=0;
  const w=g.measureText('ЛИНИЯ ЗАРИ').width; g.letterSpacing='5px'; setFont(g,700,13,FONT_U); g.fillStyle=UI.accent; g.fillText('ЧАСТЬ I  ·  ЧЕТЫРЕ ГЛАВЫ',x+4,y+34);
  g.strokeStyle='rgba(201,138,75,.7)'; g.lineWidth=1.2; g.beginPath(); g.moveTo(x+240,y+29); g.lineTo(x+Math.max(300,w-20),y+29); g.stroke(); g.restore(); }
function screenSplash(){ ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,VH); ST.t+=FDT; const a=clamp(ST.t/1.2,0,1); const g=U;
  g.save(); g.globalAlpha=a; g.textAlign='center'; setFont(g,700,64,FONT_T); g.letterSpacing='5px'; g.fillStyle='#fff1e0'; g.fillText('ЛИНИЯ ЗАРИ',VW/2,VH/2-14); g.letterSpacing='0px';
  ornament(g,VW/2,VH/2+14,420,UI.brass,1); g.letterSpacing='3px';
  setFont(g,600,14,FONT_U); g.fillStyle=`rgba(255,200,150,${0.45+0.35*Math.sin(ST.t*3)})`; g.fillText('НАЖМИТЕ ЛЮБУЮ КЛАВИШУ',VW/2,VH/2+60);
  setFont(g,500,13,FONT_U); g.fillStyle='rgba(244,237,227,.42)'; g.letterSpacing='1px'; g.fillText('Рекомендуется играть в наушниках',VW/2,VH-50); g.restore();
  if(anyKey&&ST.t>0.4&&!ST.wait){ anyKey=false; ST.wait=true; AUD.init().then(()=>{ AUD.playMusic('m_menu',2); setState('menu'); }); } }
function screenMenu(){ bgMenu(); drawTitle(84,200); SAVE=loadSave(); const has=SAVE.cp>0||SAVE.chapter>0;
  const items=[ {label:'Новая игра',act:()=>{ SAVE={chapter:0,cp:0,unlocked:SAVE.unlocked||0,shards:SAVE.shards||[],done:SAVE.done}; persist(); AUD.stopMusic(1.5); setState('intro'); }},
    {label:'Продолжить',disabled:!has,note:has?`${LEVELS[SAVE.chapter].sub} · ${LEVELS[SAVE.chapter].name}`:'',act:()=>startChapter(SAVE.chapter,SAVE.cp,true)},
    {label:'Главы',act:()=>setState('chapters',{sel:0})},
    {label:'Настройки',act:()=>setState('settings',{from:'menu'})},{label:'Управление',act:()=>setState('controls',{from:'menu'})},{label:'Об игре',act:()=>setState('about')},
    {label:'Выход',act:()=>{ if(IS_ELECTRON) window.close(); else setState('bye'); }} ];
  if(ST.sel===1&&items[1].disabled)ST.sel=0;
  const px=64,py=262,pw=400,gap=46,ph=items.length*gap+64; panel(U,px,py,pw,ph,{c:14});
  menuList(items,px+44,py+52,{gap,w:pw-70,noteY:py+ph+28});
  hintBar(`${VERSION}  ·  ↑↓ — выбор  ·  Enter — подтвердить  ·  F11 — полный экран  ·  F3 — FPS`,64,VH-30,false); }
function screenChapters(){ const li=ST.sel<LEVELS.length?ST.sel:0; bgMenu(LEVELS[li].sky); const g=U;
  const x=64,y=70,w=600,h=500; const cy=windowFrame('Главы',x,y,w,h,'ВЫБЕРИТЕ ГЛАВУ');
  const items=LEVELS.map((L,i)=>({label:`${L.sub}. ${L.name}`,disabled:i>(SAVE.unlocked||0),note:i>(SAVE.unlocked||0)?'Глава ещё не открыта':`${CH_LINE[i]}  Осколки памяти: ${L.shards.filter(s=>SAVE.shards.includes(s.id)).length} / ${L.shards.length}`,act:()=>{ AUD.stopMusic(1); startChapter(i,0); }}));
  items.push({label:'Назад',act:()=>setState('menu',{sel:2})}); menuList(items,x+56,cy+52,{gap:56,w:w-90,noteY:y+h-56});
  if(INPUT.hit('back'))setState('menu',{sel:2}); }
function vol(name){ return {label:{music:'Музыка',voice:'Голоса',sfx:'Эффекты'}[name],value:()=>'▮'.repeat(SETTINGS[name])+'▯'.repeat(10-SETTINGS[name]),adj:d=>{SETTINGS[name]=clamp(SETTINGS[name]+d,0,10);saveSettings();},act:()=>{SETTINGS[name]=(SETTINGS[name]+1)%11;saveSettings();}}; }
let LZCFG=null; if(window.LZ)LZ.getCfg().then(c=>LZCFG=c).catch(()=>{});
function toggleVsync(){ LZCFG.vsync=!LZCFG.vsync; LZ.setCfg({vsync:LZCFG.vsync}); }
const QNAMES={ultra:'Ультра',high:'Высокое',low:'Быстрое',min:'Минимальное'}, QORDER=['min','low','high','ultra'];
function overlayDim(a){ ctx.fillStyle=`rgba(5,5,8,${a})`; ctx.fillRect(0,0,VW,VH); }
function screenSettings(){ if(ST.from==='pause'){ renderGame(); ctx.setTransform(RS,0,0,RS,0,0); overlayDim(.6);} else bgMenu();
  const x=64,y=24,w=640,h=676; const cy=windowFrame('Настройки',x,y,w,h);
  const tog=(k,lab,note)=>({label:lab,note,value:()=>SETTINGS[k]?'Вкл':'Выкл',adj:()=>{SETTINGS[k]=!SETTINGS[k];saveSettings();},act:()=>{SETTINGS[k]=!SETTINGS[k];saveSettings();}});
  const items=[vol('music'),vol('voice'),vol('sfx'),tog('subs','Субтитры'),tog('shake','Тряска камеры'),
    {label:'Качество графики',note:`Внутреннее разрешение: ${scv.width}×${scv.height}${DYN<1?' (авто-понижено ради FPS)':''}. «Быстрое» и «Минимальное» — для слабых ПК и встроенной графики.`,value:()=>QNAMES[SETTINGS.fx]||'Высокое',adj:d=>setQuality(d>0?1:-1),act:()=>setQuality(1)},
    tog('autoQ','Автокачество','Если FPS долго ниже 38, игра сама понизит качество графики.'),
    tog('assist','Режим помощи','Перегрев и холод копятся медленнее, червь просыпается позже. Для тех, кому важнее сюжет.'),
    tog('showFps','Счётчик FPS','Также переключается клавишей F3.'),
    ...(window.LZ&&LZCFG?[{label:'Вертикальная синхронизация',note:'Выкл — FPS не ограничен частотой монитора. Изменение применится после перезапуска игры.',value:()=>LZCFG.vsync?'Вкл':'Выкл',adj:()=>toggleVsync(),act:()=>toggleVsync()}]:[]),
    {label:'Полный экран',value:()=>document.fullscreenElement||(window.innerHeight===screen.height)?'Вкл':'Выкл',act:()=>toggleFullscreen(),adj:()=>toggleFullscreen()},{label:'Назад',act:()=>back()}];
  const back=()=>{ if(ST.from==='pause')setState('pause',{sel:1}); else setState('menu',{sel:3}); };
  menuList(items,x+56,cy+42,{small:true,gap:38,w:w-90,noteY:y+h-58}); if(INPUT.hit('back'))back(); }
function screenControls(){ if(ST.from==='pause'){ renderGame(); ctx.setTransform(RS,0,0,RS,0,0); overlayDim(.6);} else bgMenu(); const g=U;
  const x=64,y=20,w=1060,h=640; const cy=windowFrame('Управление',x,y,w,h);
  const rows=[['A D  /  ← →','Стик / крестовина','Бег'],['Пробел  /  W  /  ↑','A','Прыжок (держите — выше); у стены — прыжок от стены'],['E (держать)','X','Клюв: зацеп за кольцо, канатка, действие у цели'],['A D / ← → на тросе','Стик','Раскачка'],['W S / ↑ ↓ на тросе','Стик ↑↓','Подтянуться / отпустить трос'],['Пробел на тросе','A','Сорваться с ускорением'],['Shift (+W вверх)','RB / B','Термо-рывок (¼ заряда Печки)'],['Q (держать)','LB / Y','Обогрев на холоде · плащ-отражатель в Пекле (← → / A D — поворот, ↑ / W — выше)'],['S / ↓ (держать)','Стик ↓','Идти тихо (черви не слышат)'],['E (держать) + ← →','X + стик','Клюв: тащить ящик — идите от него; у рычага — дёрнуть кольцо'],['Esc','Start','Пауза'],['F11  ·  F3','—','Полный экран  ·  счётчик FPS']];
  const c1=x+40,c2=x+290,c3=x+490, cw3=x+w-40-c3; g.save(); hudLabel(g,'КЛАВИАТУРА',c1,cy+36,UI.accent); hudLabel(g,'ГЕЙМПАД',c2,cy+36,UI.accent); hudLabel(g,'ДЕЙСТВИЕ',c3,cy+36,UI.accent);
  rows.forEach((r,i)=>{ const yy=cy+66+i*39; if(i%2===0){ g.fillStyle='rgba(255,220,180,.05)'; g.fillRect(x+24,yy-26,w-48,38); }
    fitFont(g,r[0],700,16,FONT_U,c2-c1-20,11); g.fillStyle='#ffe6c4'; g.fillText(r[0],c1,yy); fitFont(g,r[1],600,16,FONT_U,c3-c2-20,11); g.fillStyle=UI.dim; g.fillText(r[1],c2,yy);
    fitFont(g,r[2],500,16,FONT_U,cw3,11); g.fillStyle='rgba(244,237,227,.9)'; g.fillText(r[2],c3,yy); }); g.restore();
  hintBar('Esc / Enter — назад',x+w/2,y+h+30);
  if(INPUT.hit('back')||INPUT.hit('confirm')||MOUSE.click){ MOUSE.click=false; if(ST.from==='pause')setState('pause',{sel:2}); else setState('menu',{sel:4}); } }
function screenAbout(){ bgMenu(); const g=U; const x=64,y=80,w=900;
  const P=[['«Линия Зари» — сюжетный 2D-платформер в разработке. Часть I: четыре главы, история продолжается. Хальда — планета, навсегда повёрнутая к солнцу одной стороной. Люди живут в Ползущих городах на рельсах, вечно догоняя сумерки. Ирма Кесс — путевая обходчица города Орсо.',UI.ink],
    ['Движок — собственный: Canvas 2D для мира и персонажа + WebGL2 на видеокарте: небо, параллакс, дымка, освещение, bloom, марево, лучи, ударные волны, кино-грейдинг. Процедурная скелетная анимация с IK, физика троса (верлет), Web Audio. Упаковка — Electron.',UI.dim],
    ['Иллюстрации, текстуры и портреты сгенерированы ИИ по арт-дирекшну концепта; текстура соли главы IV — Poly Haven (CC0). Музыка и звуки синтезированы процедурно. Озвучка — нейросетевой синтез речи (Microsoft Edge TTS). Шрифты — Tektur и Exo 2 (SIL Open Font License).',UI.dim]];
  setFont(g,500,17,FONT_U); const LS=P.map(([t])=>wrapText(t,w-80)); const h=72+44+LS.reduce((a,l)=>a+l.length*27+16,0)+20; const cy=windowFrame('Об игре',x,y,w,h);
  g.save(); setFont(g,500,17,FONT_U); let yy=cy+44; for(const [t,col] of P){ const ls=wrapText(t,w-80); g.fillStyle=col; for(const l of ls){ g.fillText(l,x+40,yy); yy+=27; } yy+=16; } g.restore();
  hintBar('Esc / Enter — назад',x+w/2,y+h+30);
  if(INPUT.hit('back')||INPUT.hit('confirm')||MOUSE.click){ MOUSE.click=false; setState('menu',{sel:5}); } }
function screenBye(){ ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,VH); const g=U; g.save(); g.textAlign='center'; fitFont(g,'Можно закрыть вкладку. До встречи на Линии Зари.',600,28,FONT_U,1100); g.fillStyle='#ffd9a8'; g.fillText('Можно закрыть вкладку. До встречи на Линии Зари.',VW/2,VH/2); ornament(g,VW/2,VH/2+26,360); g.restore(); if(INPUT.hit('confirm')||MOUSE.click)setState('menu'); }
function letterbox(h=64){ U.fillStyle='#000'; U.fillRect(0,0,VW,h); U.fillRect(0,VH-h,VW,h); }
function skipper(dt,label='Удерживайте Enter, чтобы пропустить'){ const hold=INPUT.held('confirm')||INPUT.held('back')||INPUT.held('jump')||MOUSE.down; ST.skip=hold?(ST.skip||0)+dt:Math.max(0,(ST.skip||0)-dt*2);
  const g=U; g.save(); setFont(g,600,13,FONT_U); g.textAlign='right'; g.fillStyle='rgba(244,237,227,.55)'; g.fillText(label,VW-74,VH-27); g.strokeStyle='rgba(255,255,255,.15)'; g.lineWidth=2.5; g.beginPath(); g.arc(VW-50,VH-32,9,0,7); g.stroke(); g.strokeStyle=UI.accent; g.beginPath(); g.arc(VW-50,VH-32,9,-Math.PI/2,-Math.PI/2+Math.PI*2*clamp(ST.skip,0,1)); g.stroke(); g.restore(); return ST.skip>=1; }
// ---- вступительный ролик
const INTRO=[ {img:'planet',v:'i1',z:[1.0,1.12],p:[[0.5,0.5],[0.45,0.5]]}, {img:'crash',v:'i2',z:[1.12,1.0],p:[[0.6,0.4],[0.45,0.5]]}, {img:'cover',v:'i3',z:[1.0,1.1],p:[[0.4,0.5],[0.55,0.45]]},
  {img:'city',v:'i4',z:[1.08,1.0],p:[[0.5,0.6],[0.5,0.4]]}, {img:'fault',v:'i5',z:[1.0,1.14],p:[[0.3,0.5],[0.6,0.5]]}, {img:'hero',v:'i6',z:[1.05,1.15],p:[[0.25,0.4],[0.45,0.35]]} ];
let INTRO_EMB=null;
function screenIntro(dt){ if(!ST.init){ ST.init=true; ST.i=-1; ST.next=0.8; ST.slideT=0; ST.skip=0; AUD.playMusic('m_intro',1,false); VOICE.clear(); ST.durs=INTRO.map(s=>(AUD.buf['v_'+s.v]?AUD.buf['v_'+s.v].duration:5)+1.8); }
  ST.t+=dt; ST.slideT+=dt; VOICE.update(dt);
  if(ST.i<INTRO.length&&ST.t>=ST.next){ ST.i++; ST.slideT=0; if(ST.i<INTRO.length){ VOICE.say([INTRO[ST.i].v]); ST.next=ST.t+ST.durs[ST.i]; } else { ST.next=ST.t+5.5; } }
  ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,VH);
  const draw=(k,a)=>{ const s=INTRO[k]; if(!s)return; const st=ST.durs[k]+1.2; const u=clamp((k===ST.i?ST.slideT:ST.slideT+ST.durs[k])/st,0,1); ctx.globalAlpha=a;
    drawCover(IMG[s.img],0,0,VW,VH,lerp(s.z[0],s.z[1],u),lerp(s.p[0][0],s.p[1][0],u),lerp(s.p[0][1],s.p[1][1],u)); ctx.globalAlpha=1; };
  if(ST.i>=0&&ST.i<INTRO.length){ const fi=clamp(ST.slideT/1.2,0,1); if(ST.i>0&&fi<1) draw(ST.i-1,1); draw(ST.i,fi); }
  else if(ST.i>=INTRO.length){ const u=ST.t-(ST.next-5.5); const a=clamp(u/1.5,0,1)*clamp((5.5-u)/1.0,0,1); draw(INTRO.length-1,clamp(1-u/1.2,0,1)); const g=U; g.save(); g.textAlign='center'; g.globalAlpha=a; setFont(g,700,80,FONT_T); g.letterSpacing='5px'; g.fillStyle='#fff1e0'; g.shadowColor='rgba(255,140,60,.5)'; g.shadowBlur=30; g.fillText('ЛИНИЯ ЗАРИ',VW/2,VH/2); g.shadowBlur=0; g.letterSpacing='0px'; ornament(g,VW/2,VH/2+26,460); g.letterSpacing='6px'; setFont(g,700,14,FONT_U); g.fillStyle=UI.accent; g.fillText('ПРОЛОГ',VW/2,VH/2+58); g.restore(); }
  if(!INTRO_EMB)INTRO_EMB=Array.from({length:60},()=>({x:rnd(0,VW),y:rnd(0,VH),v:rnd(15,50),s:rnd(1,2.4),p:rnd(0,6)})); ctx.save(); ctx.globalCompositeOperation='lighter'; for(const e of INTRO_EMB){ e.y-=e.v*dt; e.x-=10*dt; if(e.y<-10){e.y=VH+10;e.x=rnd(0,VW);} ctx.globalAlpha=0.35+0.3*Math.sin(ST.t*4+e.p); ctx.fillStyle='#ffb35a'; ctx.fillRect(e.x,e.y,e.s,e.s);} ctx.restore(); ctx.globalAlpha=1;
  Object.assign(FX,{bloom:0.55,thr:0.68,vign:0.55,grain:0.06,sat:1.05,ca:0.0018}); if(ST.t<1.2)FX.fade=1-ST.t/1.2;
  letterbox(); drawSubtitle(1,VH-108);
  if(skipper(dt)||(ST.i>=INTRO.length&&ST.t>=ST.next)){ VOICE.clear(); startChapter(0,0); } }
// ---- карточка главы
const CH_LINE={0:'Хвост города плавится. Нужно добраться до головы состава.',1:'Старый мост через каньон. Ветер с ночной стороны.',2:'Вечная ночь. Стрелка обходного пути вмёрзла в лёд.',3:'Пекло. Прямой путь колонистов через вечный полдень.'};
function startChapter(li,cp=0,fromContinue=false){ setState('card',{li,cp}); AUD.stopAmbient(); }
function screenCard(dt){ const L=LEVELS[ST.li]; if(!ST.init){ ST.init=true; AUD.play('s_checkpoint',{vol:.5,rate:.7}); VOICE.clear(); if(ST.li===0&&ST.cp===0)VOICE.say(['c1']); if(LEVELS[ST.li].id===4&&ST.cp===0)VOICE.say(['e2']); }
  ST.t+=dt; VOICE.update(dt); const u=clamp(ST.t/5,0,1); ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,VH); ctx.globalAlpha=clamp(ST.t/1.2,0,1); drawCover(IMG[L.sky],0,0,VW,VH,lerp(1.05,1.15,u),0.3+u*0.2,0.5); ctx.globalAlpha=1;
  const gr=ctx.createLinearGradient(0,0,0,VH); gr.addColorStop(0,'rgba(0,0,0,.25)'); gr.addColorStop(.5,'rgba(0,0,0,.45)'); gr.addColorStop(1,'rgba(0,0,0,.7)'); ctx.fillStyle=gr; ctx.fillRect(0,0,VW,VH);
  Object.assign(FX,{bloom:0.5,thr:0.7,vign:0.5,grain:0.06,rays:0.25,sun:[(SUNPOS[L.id][0]),SUNPOS[L.id][1]]});
  const g=U; const a=clamp((ST.t-0.6)/1,0,1)*clamp((5.2-ST.t)/0.8,0,1); g.save(); g.globalAlpha=a; g.textAlign='center'; setFont(g,700,14,FONT_U); g.letterSpacing='6px'; g.fillStyle=UI.accent; g.fillText(L.sub.toUpperCase(),VW/2,VH/2-78); g.letterSpacing='0px';
  fitFont(g,L.name,700,72,FONT_T,1100,30); g.letterSpacing='3px'; g.shadowColor='rgba(255,140,60,.45)'; g.shadowBlur=24; g.fillStyle='#fff3e4'; g.fillText(L.name,VW/2,VH/2+4); g.shadowBlur=0; g.letterSpacing='0px';
  ornament(g,VW/2,VH/2+30,520,UI.brass); fitFont(g,CH_LINE[ST.li],500,22,FONT_U,1000,14); g.font=g.font.replace('500','italic 500'); g.fillStyle='rgba(255,230,200,.9)'; g.fillText(CH_LINE[ST.li],VW/2,VH/2+70); g.restore(); letterbox(); drawSubtitle(1,VH-108);
  if(ST.t>5.4||(ST.t>1&&(INPUT.hit('confirm')||MOUSE.click))){ MOUSE.click=false; startGame(ST.li,ST.cp); } }
// ---- игра
let ACC=0;
function startGame(li,cp){ buildWorld(li); W.deaths=0; W.sola=SAVE.sola||null; respawn(cp); setState('game'); VOICE.clear(); SAVE.chapter=li; SAVE.cp=cp; persist();
  for(const s of LV.shards) if(SAVE.shards.includes(s.id)) s.taken=true;
  for(let i=0;i<LV.trig.length;i++) if(LV.trig[i].x<LV.cps[cp].x) W.firedTrig[i]=true;
  AUD.playMusic(LV.music,2); }
function screenGame(dt){ if(INPUT.hit('pause')){ setState('pause'); AUD.setDuck(0.4); return renderGame(0); }
  let sdt=dt; if(W.slowT>0){ W.slowT-=dt; sdt=dt*0.35; } if(W.P.dead&&W.P.dead<0.3)sdt=dt*0.5;
  ACC+=sdt; const STEP=1/120; let n=0; while(ACC>=STEP&&n<14){ if(n>0){ INPUT.prev=INPUT.cur; INPUT.tap=null; } stepWorld(STEP); ACC-=STEP; n++; } if(n>=14)ACC=0;
  updateFx(sdt); updateCamera(dt); VOICE.update(dt);
  const L=LV, P=W.P; AUD.ambient('s_amb_train',L.train?0.22:0); AUD.ambient('s_amb_fire',(W.wall.active?0.8:0)+(L.heat?0.18:0)+(L.braziers.some(b=>Math.abs(b.x-P.x)<200)?0.3:0)); AUD.ambient('s_amb_wind',L.id===3?0.4+W.gust*0.5:L.id===2?0.2+W.gust*0.7:0.05);
  if(L.zips.length)AUD.ambient('s_zip',P.zip?0.6:0);
  if(L.crates.length)AUD.ambient('s_drag',(W.dragSnd>0?0.55:0)); if(L.id===4)AUD.ambient('s_amb_wind',0.18);
  if(W.gustWarn&&!W.gustWarnPrev)AUD.play('s_gust',{vol:.7}); W.gustWarnPrev=W.gustWarn;
  W.time_total=(W.time_total||0)+dt;
  if(W.finished&&!W.endT){ W.endT=0.001; AUD.play('s_checkpoint',{vol:.8}); shake(6); W.flash=0.4; if(L.goal.kind==='lever')VOICE.say(['l2_end']); }
  if(W.endT){ W.endT+=dt; }
  safeRun(()=>renderGame(dt),ctx); safeRun(()=>drawHUD(dt),U);
  if(W.endT){ FX.fade=clamp((W.endT-1.6)/1.4,0,1); if(W.endT>3.2&&!(L.goal.kind==='lever'&&VOICE.busy()&&W.endT<9)){ AUD.stopAmbient(); const st={time:W.time,deaths:W.deaths,shards:L.shards.filter(s=>s.taken).length,total:L.shards.length};
      SAVE.unlocked=Math.max(SAVE.unlocked||0,Math.min(LEVELS.length-1,LV.idx+1)); SAVE.chapter=Math.min(LEVELS.length-1,LV.idx+1); SAVE.cp=0; if(LV.idx===LEVELS.length-1)SAVE.done=true; persist();
      setState('chapterEnd',{li:LV.idx,stats:st}); } } }
function screenPause(){ renderGame(0); ctx.setTransform(RS,0,0,RS,0,0); overlayDim(.55); FX.dist=0; FX.heat=0; const g=U;
  const x=64,y=120,w=520,h=430; const cy=windowFrame('Пауза',x,y,w,h,`${LV.sub.toUpperCase()} · ${LV.name.toUpperCase()}`);
  const items=[{label:'Продолжить',act:()=>{setState('game');AUD.setDuck(1);}},{label:'Настройки',act:()=>setState('settings',{from:'pause'})},{label:'Управление',act:()=>setState('controls',{from:'pause'})},
    {label:'К контрольной точке',act:()=>{ setState('game'); AUD.setDuck(1); W.P.dead=1.2; W.P.deathKind='fall'; }},{label:'Выйти в главное меню',act:()=>{ VOICE.clear(); AUD.stopAmbient(); AUD.playMusic('m_menu',2); setState('menu'); }}];
  menuList(items,x+56,cy+56,{gap:58,w:w-90}); if(INPUT.hit('pause')&&ST.t>0){ setState('game'); AUD.setDuck(1);} ST.t++; }
function fmtTime(s){ const m=Math.floor(s/60), sec=Math.floor(s%60); return `${m}:${String(sec).padStart(2,'0')}`; }
function screenChapterEnd(dt){ const L=LEVELS[ST.li]; ST.t+=dt; VOICE.update(dt); ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,VH); ctx.globalAlpha=clamp(ST.t/1.5,0,1)*0.6; drawCover(IMG[L.sky],0,0,VW,VH,1.1,0.5,0.5); ctx.globalAlpha=1; overlayDim(.4);
  const g=U; const a=clamp(ST.t/1,0,1); const w=720,h=300,x=VW/2-w/2,y=VH/2-h/2-20; g.save(); g.globalAlpha=a; panel(g,x,y,w,h,{c:18,sun:true,title:`${L.sub.toUpperCase()} ПРОЙДЕНА`});
  g.textAlign='center'; fitFont(g,L.name,700,52,FONT_T,w-80,24); g.fillStyle='#fff3e4'; g.fillText(L.name,VW/2,y+96); ornament(g,VW/2,y+122,440); const s=ST.stats;
  const cols=[['ВРЕМЯ',fmtTime(s.time)],['ПОПЫТКИ',String(s.deaths)],['ОСКОЛКИ',`${s.shards} / ${s.total}`]];
  cols.forEach((c,i)=>{ const cx=x+w/2+(i-1)*200; g.textAlign='center'; hudLabel(g,c[0],cx,y+170,UI.accent); setFont(g,700,28,FONT_T); g.fillStyle=UI.ink; g.fillText(c[1],cx,y+208); g.textAlign='left'; });
  if(ST.t>1.5){ g.textAlign='center'; setFont(g,700,14,FONT_U); g.letterSpacing='3px'; g.fillStyle=`rgba(255,200,150,${0.55+0.3*Math.sin(ST.t*3)})`; g.fillText(ST.li<LEVELS.length-1?'ENTER — ДАЛЕЕ':'ENTER — ФИНАЛ',VW/2,y+h-26); } g.restore();
  Object.assign(FX,{bloom:0.5,thr:0.7,vign:0.5});
  if(ST.t>1.5&&(INPUT.hit('confirm')||MOUSE.click)){ MOUSE.click=false; if(ST.li<LEVELS.length-1)startChapter(ST.li+1,0); else setState('ending',{stats:ST.stats}); } }
// ---- финал
function screenEnding(dt){ if(!ST.init){ ST.init=true; AUD.playMusic('m_ending',1.5,false); VOICE.clear(); VOICE.say(LEVELS[LEVELS.length-1].id===4?['e4']:['e1','e2']); ST.phase=0; }
  ST.t+=dt; const u=clamp(ST.t/40,0,1);
  ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,VH); ctx.globalAlpha=clamp(ST.t/2,0,1); drawCover(IMG.ending,0,0,VW,VH,lerp(1.02,1.14,u),lerp(0.6,0.5,u),0.5); ctx.globalAlpha=1;
  const vg=ctx.createLinearGradient(0,0,0,VH); vg.addColorStop(0,'rgba(0,0,0,.25)'); vg.addColorStop(1,'rgba(0,0,0,.6)'); ctx.fillStyle=vg; ctx.fillRect(0,0,VW,VH);
  Object.assign(FX,{bloom:0.5,thr:0.68,vign:0.5,grain:0.06});
  if(!VOICE.busy()&&ST.phase===0){ ST.phase=1; ST.p1=ST.t; VOICE.say(['e3']); }
  const g=U; letterbox();
  if(ST.phase>=1){ const a=clamp((ST.t-ST.p1)/2,0,1); ctx.fillStyle=`rgba(0,0,0,${0.45*a})`; ctx.fillRect(0,0,VW,VH); g.save(); g.globalAlpha=a; g.textAlign='center'; setFont(g,700,76,FONT_T); g.letterSpacing='5px'; g.fillStyle='#fff1e0'; g.shadowColor='rgba(255,140,60,.5)'; g.shadowBlur=30; g.fillText('ЛИНИЯ ЗАРИ',VW/2,VH/2-60); g.shadowBlur=0; g.letterSpacing='0px';
    ornament(g,VW/2,VH/2-30,480); setFont(g,500,26,FONT_U); g.font=`italic 500 26px ${FONT_U}`; g.fillStyle='#ffd9a8'; g.fillText('Продолжение следует…',VW/2,VH/2+10);
    const tot=LEVELS.reduce((a,L)=>a+L.shards.length,0); const n=SAVE.shards.filter(id=>LEVELS.some(L=>L.shards.some(s=>s.id===id))).length; const t=`ОСКОЛКИ ПАМЯТИ  ${n} / ${tot}`+(n>=tot?'  ·  ВСЯ ПРАВДА О ГИЛЬДИИ':''); setFont(g,700,14,FONT_U); g.letterSpacing='3px'; const w=g.measureText(t).width+60; panel(g,VW/2-w/2,VH/2+36,w,40,{c:9,col:'#5fb8aa',rivets:false}); g.fillStyle='#bff7ee'; g.fillText(t,VW/2,VH/2+61);
    if(ST.t-ST.p1>4){ g.fillStyle=`rgba(255,200,150,${0.5+0.3*Math.sin(ST.t*3)})`; g.fillText('ENTER — В ГЛАВНОЕ МЕНЮ',VW/2,VH/2+112); } g.restore();
    if(ST.t-ST.p1>4&&(INPUT.hit('confirm')||MOUSE.click)){ MOUSE.click=false; VOICE.clear(); AUD.playMusic('m_menu',2); setState('menu'); } }
  VOICE.update(dt); drawSubtitle(1,VH-108,true); }
function windowFrame(title,x,y,w,h,sub){ const g=U; panel(g,x,y,w,h,{c:16,sun:true}); g.save(); g.textAlign='left'; fitFont(g,title,700,34,FONT_T,w-64,18); textShadowed(g,title,x+32,y+54,'#fff3e4');
  if(sub){ setFont(g,700,11,FONT_U); g.letterSpacing='3px'; g.fillStyle=UI.accent; g.fillText(sub,x+34,y+76); g.letterSpacing='0px'; }
  g.strokeStyle='rgba(201,138,75,.45)'; g.lineWidth=1; g.beginPath(); g.moveTo(x+32,y+(sub?90:72)); g.lineTo(x+w-32,y+(sub?90:72)); g.stroke(); g.restore(); return y+(sub?90:72); }
function hintBar(text,x=VW/2,y=VH-34,center=true){ const g=U; g.save(); setFont(g,500,13,FONT_U); const w=Math.ceil(g.measureText(text).width)+32; const x0=center?x-w/2:x; panel(g,x0,y-20,w,30,{c:7,rivets:false,alpha:0.85}); g.fillStyle=UI.dim; g.textAlign='left'; g.fillText(text,x0+16,y); g.restore(); }
function setQuality(d){ const n=QORDER.length; const i=QORDER.indexOf(SETTINGS.fx); SETTINGS.fx=QORDER[(Math.max(0,i)+d+n)%n]; saveSettings(); DYN=1; resize(); }
// ---- главный цикл
let last=performance.now(), FPS=60, FDT=1/60; const PERF={n:0,t:0,low:0};
// авто-понижение внутреннего разрешения, если FPS стабильно ниже 50 (только в игре)
function perfWatch(rawDt){ PERF.n++; PERF.t+=rawDt; if(PERF.t<1.5)return; const fps=PERF.n/PERF.t; PERF.n=0; PERF.t=0;
  if(STATE==='game'&&SETTINGS.autoQ!==false&&fps<26&&SETTINGS.fx!=='min'){ PERF.low++; if(PERF.low>=1){ PERF.low=0; const i=QORDER.indexOf(SETTINGS.fx); SETTINGS.fx=QORDER[Math.max(0,i-1)]; saveSettings(); DYN=1; resize(); PERF.msg={t:0,text:'Качество понижено до «'+QNAMES[SETTINGS.fx]+'» ради FPS'}; } }
  else if(STATE==='game'&&fps<50&&DYN>0.6){ PERF.low++; if(PERF.low>=2){ PERF.low=0; DYN=Math.max(0.6,+(DYN-0.1).toFixed(2)); resize(); } }
  else if(STATE==='game'&&SETTINGS.autoQ!==false&&fps<38&&DYN<=0.6&&SETTINGS.fx!=='min'){ PERF.low++; if(PERF.low>=2){ PERF.low=0; const i=QORDER.indexOf(SETTINGS.fx); SETTINGS.fx=QORDER[Math.max(0,i-1)]; saveSettings(); DYN=0.8; resize(); PERF.msg={t:0,text:'Качество понижено до «'+QNAMES[SETTINGS.fx]+'» ради FPS'}; } }
  else PERF.low=0; }
addEventListener('keydown',e=>{ if(e.code==='F3'){ e.preventDefault(); SETTINGS.showFps=!SETTINGS.showFps; saveSettings(); } });
let ERRN=0; function reportErr(e){ window.__lastError=String(e&&e.stack||e); window.__errCount=(window.__errCount||0)+1; if(ERRN++<5)console.error(e); }
function safeRun(fn,g){ try{ fn(); }catch(e){ reportErr(e); try{ if(g.reset)g.reset(); }catch(_){} if(g===ctx)ctx.setTransform(RS,0,0,RS,0,0); else U.setTransform(UIK,0,0,UIK,0,0); } }
function frame(now){ const raw=(now-last)/1000; const dt=Math.min(0.1,raw); FDT=dt; last=now; FPS=lerp(FPS,1/Math.max(raw,1e-3),0.08); perfWatch(Math.min(raw,0.25)); INPUT.poll();
  ctx.setTransform(RS,0,0,RS,0,0); ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1; ctx.imageSmoothingQuality=(SETTINGS.fx==='low'||SETTINGS.fx==='min')?'low':'high';
  U.setTransform(UIK,0,0,UIK,0,0); U.clearRect(0,0,VW,VH);
  fxReset(); FX.time=now/1000;
  try{ switch(STATE){ case 'splash':screenSplash();break; case 'menu':screenMenu();break; case 'chapters':screenChapters();break; case 'settings':screenSettings();break; case 'controls':screenControls();break; case 'about':screenAbout();break; case 'bye':screenBye();break;
    case 'intro':screenIntro(dt);break; case 'card':screenCard(dt);break; case 'game':screenGame(dt);break; case 'pause':screenPause();break; case 'chapterEnd':screenChapterEnd(dt);break; case 'ending':screenEnding(dt);break; }
    if(!['intro','ending','game','card','chapterEnd'].includes(STATE))VOICE.update(dt);
    if(SETTINGS.fx==='low'||SETTINGS.fx==='min'){ FX.rays=0; FX.dist=0; FX.heat=0; }
    if(PERF.msg){ PERF.msg.t+=dt; const a=clamp(Math.min(PERF.msg.t/0.3,(4-PERF.msg.t)/0.5),0,1); if(PERF.msg.t>4)PERF.msg=null; else { U.save(); U.globalAlpha=a; setFont(U,600,14,FONT_U); const w=U.measureText(PERF.msg.text).width+40; panel(U,VW-28-w,VH-90,w,34,{c:8,rivets:false}); U.fillStyle=UI.ink; U.fillText(PERF.msg.text,VW-28-w+20,VH-68); U.restore(); } }
    if(SETTINGS.showFps&&STATE!=='game')drawFps();
    POST.render(); }
  catch(e){ reportErr(e); }
  MOUSE.click=false; requestAnimationFrame(frame); }
(async function boot(){ await loadImages(); try{ for(const f of [`700 40px Tektur`,`500 20px 'Exo 2'`,`600 20px 'Exo 2'`,`700 20px 'Exo 2'`,`italic 500 20px 'Exo 2'`]) await document.fonts.load(f,'АБВ abc');}catch(e){}
  for(const L of LEVELS)prepLevelArt(L);
  if(POST.ok&&POST.preload){ const l=[]; for(const L of LEVELS){ const A=prepLevelArt(L); l.push(IMG[L.sky],A.far,A.mid); } POST.preload(l.filter(Boolean)); }
  document.getElementById('loading').remove(); setState('splash'); requestAnimationFrame(frame); })();
window.__dbg={get W(){return W},startGame,startChapter,setState,get state(){return STATE},get FPS(){return FPS},AUD};
