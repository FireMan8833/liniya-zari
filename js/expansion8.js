'use strict';
GRADE[7]={...GRADE[6],lift:[0,0.02,0.02],sat:1.02,bloom:.32};GRADE[8]={...GRADE[5],sat:1.04,bloom:.34};
Object.assign(window.ASSETS_LINES,ACT8_LINES,{
 e8:{s:'narr',t:'Память Люмена вернулась домой. Теперь Ирма знает: «Заря» — не разбитый корабль в легендах. Это мир под её ногами. И кто-то снаружи ждёт, когда откроется шлюз.'},
 s13:{s:'narr',t:'Протокол первого рассвета: световой сбор оплачивается памятью. Личные имена скрыты по приказу И. Рей.'},
 s14:{s:'irma',t:'Мой приказ: закрыть курс на сорок дней. Только на сорок дней. Вейл стёр последнее предложение.'}
});
SPEAKER.teo='ТЕО';
CH_LINE[6]='Живой город платит за рассвет своими воспоминаниями.';
CH_LINE[7]='На ночном рынке продают вчера. Верните городу его память.';
// Smaller local cameras make puzzle labels readable together with the mechanisms.
for(const L of LEVELS.slice(6)){
 L.chrono=1;
 L.views=[{x1:1050,x2:1900,cx:1480,cy:390,z:1.05},{x1:2200,x2:3300,cx:2700,cy:390,z:1.05},{x1:4000,x2:5000,cx:4500,cy:380,z:1.05},{x1:6300,x2:7300,cx:6820,cy:390,z:1.05}];
}
// Progress persists at checkpoints, including keys behind the player after reloading.
const oldCheckpoint8=onCheckpoint;
onCheckpoint=function(i){ SAVE.mechanisms={li:LV.idx,flags:{...W.flags},receivers:LV.receivers.filter(r=>r.done).map(r=>r.link),gates:LV.gates.filter(g=>g.latch||g.passed).map(g=>g.id)};oldCheckpoint8(i); };
const oldStart8=startGame;
startGame=function(li,cp){oldStart8(li,cp);const m=SAVE.mechanisms;if(cp>0&&m&&m.li===li){Object.assign(W.flags,m.flags);for(const r of LV.receivers)if(m.receivers.includes(r.link))r.done=true;for(const g of LV.gates)if(m.gates.includes(g.id)){g.latch=true;g.open=1;if(g.tm)g.passed=true;}}
 // Backward compatible old saves: key puzzles behind checkpoint count as completed.
 if(li>=6&&cp>0&&LV.flow&&W.flags[LV.flow.id])LV.flow.bits=LV.flow.target;
 if(li===5&&cp>0){const x=LV.cps[cp].x;if(x>=24800)W.flags.K1=true;if(x>=26900)W.flags.K2=true;if(x>=27800)W.flags.K3=true;}
 
};
if(SAVE.done&&SAVE.chapter===5){SAVE.done=false;SAVE.unlocked=Math.max(SAVE.unlocked||0,6);SAVE.chapter=6;SAVE.cp=0;persist();}
BIND.rescue=['KeyT'];
const baseStep8=stepWorld;
stepWorld=function(dt){const I=inp();W.rescueT=I.held('rescue')?(W.rescueT||0)+dt:0;if(W.rescueT>=1){respawn(W.cp);W.rescueT=0;W.note8={t:3,text:'Возврат к контрольной точке · решённые узлы сохранены'};return;}
 baseStep8(dt);if(W.P.dead||W.finished)return;
 W.termLock=Math.max(0,(W.termLock||0)-dt);
 if(LV.terminals&&I.hit('grapple')&&!W.termLock){const n=LV.terminals.find(n=>Math.abs(W.P.x-n.x)<68&&Math.abs(W.P.y-n.y)<64);if(n){W.termLock=.3;W.hook=null;W.P.rope=null;if(n.kind==='chime'){const q=LV.sequence;if(!W.flags[q.id]){if(n.n===q.order[q.progress]){q.progress++;sfx('s_checkpoint',{vol:.4,rate:.75+n.n*.22});W.note8={t:2,text:'Проверено: '+q.order.slice(0,q.progress).map(n=>['','I','II','III'][n]).join(' · ')};if(q.progress===q.order.length){fireLink(q.id);W.note8={t:3,text:'Пусковая последовательность принята · проход открыт'};}}else{q.progress=0;sfx('s_ui_select',{vol:.5,rate:.6});W.note8={t:3,text:'Неверный порядок. Защита сбросила пуск; схема указана на щите'};}}}else{const f=LV.flow;if(!W.flags[f.id]){f.bits^=(1<<n.n);sfx('s_plate',{vol:.6});if(f.bits===f.target){fireLink(f.id);W.note8={t:3,text:'Контуры согласованы · питание восстановлено'};}}}}}
 if(W.note8){W.note8.t-=dt;if(W.note8.t<=0)W.note8=null;}
 // Key plates in the new freight court latch too; cargo can never strand the player.
 if(LV.id>=7)for(const p of LV.plates)if(p.on)fireLink(p.link);
};
const drawBaseDecor8=drawDecor5;
drawDecor5=function(L){drawBaseDecor8(L);if(L.id<7)return;const t=W.time;
 // Game-native foreground awnings, lanterns and stall displays; real painted panorama behind.
 for(let x=250;x<Math.min(L.length,L.service9||L.length);x+=680){if(!inVis(x-200,480))continue;ctx.save();ctx.fillStyle=L.id===8?'#653c43':'#28464b';ctx.strokeStyle='#aa8355';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(x-160,250);ctx.quadraticCurveTo(x,285+Math.sin(t*.8+x)*3,x+160,250);ctx.lineTo(x+176,282);ctx.quadraticCurveTo(x,315,x-176,282);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#203032';ctx.fillRect(x-165,281,5,279);ctx.fillRect(x+160,281,5,279);
 if(L.id===8){ctx.fillStyle='#26383a';ctx.fillRect(x-130,520,260,40);for(let j=0;j<5;j++){const xx=x-96+j*48;ctx.fillStyle=j%2?'#cc9859':'#83b9ad';ctx.fillRect(xx,488,16,28);ctx.strokeStyle='#d8b779';ctx.strokeRect(xx-2,486,20,32);}}
 ctx.restore();glampDraw({x:x-165,y:560});}
 drawBaseDecor8({...L,decor:L.decor.filter(d=>d.k==='sign')});
 for(const n of L.terminals){if(!inVis(n.x-90,180))continue;const active=n.kind==='chime'?W.flags[L.sequence.id]||L.sequence.order.slice(0,L.sequence.progress).includes(n.n):((L.flow.bits>>n.n)&1);ctx.save();ctx.fillStyle='#15262b';ctx.fillRect(n.x-23,n.y-92,46,92);ctx.strokeStyle='#b18f5f';ctx.lineWidth=2;ctx.strokeRect(n.x-21,n.y-90,42,88);ctx.fillStyle=active?'#b8f6da':'#d9aa65';ctx.beginPath();ctx.arc(n.x,n.y-62,12,0,7);ctx.fill();ctx.font=`700 16px ${FONT_U}`;ctx.textAlign='center';ctx.fillText(['I','II','III'][n.kind==='chime'?n.n-1:n.n],n.x,n.y-26);ctx.fillStyle='#f8e8cb';ctx.font=`600 14px ${FONT_U}`;ctx.fillText(n.kind==='chime'?'ЭТАП':'КОНТУР',n.x,n.y-107);if(Math.abs(W.P.x-n.x)<68){ctx.fillStyle='#fff4d3';ctx.fillText('E · '+(n.kind==='chime'?'выполнить':'переключить'),n.x,n.y-133);}ctx.restore();}
};
const hudBase8=drawHUD;
drawHUD=function(dt){hudBase8(dt);if(LV.id>=6){U.save();U.font=`500 13px ${FONT_U}`;U.textAlign='left';U.fillStyle='#e2d6b8';U.fillText('T — возврат (держать 1 с)',30,105);if(W.rescueT>0){U.fillStyle='#a0ead9';U.fillRect(30,114,212*Math.min(1,W.rescueT),4);}if(W.note8){U.font=`600 17px ${FONT_U}`;const w=Math.min(1020,U.measureText(W.note8.text).width+40);panel(U,VW/2-w/2,104,w,42,{c:8});U.textAlign='center';U.fillStyle='#f7e9ca';U.fillText(W.note8.text,VW/2,131);}U.restore();}};
// Eight short motion-comic epilogues, one after each level, integrated into the engine.
// Painted camera pans + animated light paths / orbit / foreground particles; not a video file.
const EP8=[
 ['sky2','КОЛЕЯ НА ГРАНИ НОЧИ','За кабиной Орсо открывается мост. На старой частоте рации кто-то зовёт Ирму по имени.'],
 ['sky3','ГОРОД ПО ТУ СТОРОНУ','Затвор поднят. Между радиопомехами слышен голос Тео: «Не верь фонарям».'],
 ['bg_hot','ПРЯМОЙ ПУТЬ','Стрелка оттаяла. Под льдом осталась табличка: «Заря» — не название поезда.'],
 ['sky5','САНГРА ПРОСЫПАЕТСЯ','Семафор посылает импульс в пустыню. В мёртвом городе впервые за сорок лет зажигается окно.'],
 ['sky6','ПОД ЛАТУННЫМ НЕБОМ','Сердце Хребта отвечает на сигнал. В куполе «Зари» кто-то переставляет звёзды.'],
 ['sky7','ГОРОД, КОТОРЫЙ ПОМНИТ','Голос «Зари» произносит координаты Люмена. Тео узнаёт их раньше, чем успевает вспомнить почему.'],
 ['cine7','ЦЕНА УТРА','Свет возвращается в окна. На ночном рынке раскрывается цилиндр с именем Ирмы. Внутри — её собственный приказ стереть курс.'],
 ['cine8','ПОД НАМИ — КОРАБЛЬ','Освобождённые воспоминания складываются в карту. Города — модули «Зари». Горизонт — внутренняя обшивка. Из глубины приходит ответ Земли: «Не открывайте внешний шлюз».']
];
EP8.forEach((e,i)=>{window.ASSETS_LINES['ep8_'+i]={s:'narr',t:e[2]};});
function screenMotion8(dt){if(!ST.init){ST.init=true;ST.skip=0;VOICE.clear();VOICE.say(['ep8_'+ST.li],{story:1});AUD.playMusic(LEVELS[Math.min(ST.li+1,7)].music,1.5);sfx('s_checkpoint',{vol:.6,rate:.7});}ST.t+=dt;VOICE.update(dt);const E=EP8[ST.li];const u=clamp(ST.t/14,0,1);ctx.fillStyle='#0d171d';ctx.fillRect(0,0,VW,VH);drawCover(IMG[E[0]]||IMG[LEVELS[ST.li].sky],0,0,VW,VH,1.05+u*.14,.35+u*.25,.5);
 ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<44;i++){const x=(i*97+ST.t*(8+i%5))%(VW+80)-40,y=(i*71-ST.t*(14+i%8)+1440)%720;ctx.fillStyle=i%3?'rgba(246,199,122,.45)':'rgba(127,241,220,.7)';ctx.beginPath();ctx.arc(x,y,1+i%3*.45,0,7);ctx.fill();}
 const p=clamp((ST.t-2)/7,0,1);ctx.strokeStyle='rgba(160,239,222,.55)';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=80*p;i++){let x=250+i*10,y=365+Math.sin(i*.13+ST.li)*65; i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();glow(GLOW.teal,250+800*p,365+Math.sin(80*p*.13+ST.li)*65,55,.5);ctx.restore();
 const grad=ctx.createLinearGradient(0,330,0,720);grad.addColorStop(0,'rgba(4,10,16,.12)');grad.addColorStop(.42,'rgba(4,10,16,.7)');grad.addColorStop(1,'rgba(4,10,16,.96)');ctx.fillStyle=grad;ctx.fillRect(0,330,VW,390);letterbox(48);
 U.save();U.globalAlpha=clamp(ST.t/.8,0,1);U.textAlign='center';U.fillStyle='#e8bc78';setFont(U,700,13,FONT_U);U.fillText('ЛИНИЯ ЗАРИ · ЭПИЛОГ · '+LEVELS[ST.li].sub.toUpperCase(),640,460);fitFont(U,E[1],700,38,FONT_T,1100,26);U.fillStyle='#fff0d5';U.fillText(E[1],640,511);setFont(U,500,21,FONT_U);const ls=wrapText(E[2],950);U.fillStyle='#f0e6d6';ls.forEach((l,i)=>U.fillText(l,640,554+i*29));U.font=`500 14px ${FONT_U}`;U.fillStyle='#c6c7ba';U.fillText(ST.t>2?'Enter — продолжить · сцена завершится автоматически':'',640,665);U.restore();Object.assign(FX,{bloom:.4,vign:.5,grain:.04});if(ST.t>Math.max(15,(AUD.buf['v_ep8_'+ST.li]?.duration||0)+1.5)||(ST.t>2&&INPUT.hit('confirm'))||skipper(dt)){const li=ST.li,stats=ST.stats;VOICE.clear();setState('chapterEnd',{li,stats});}}
