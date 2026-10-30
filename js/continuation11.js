'use strict';
// v0.10 — grounded continuation. New mechanics are isolated from legacy service puzzles.
const ACT11_META=[
 ['Обратное течение','Глава IX','Поднимите понтоны и выясните, куда уходит вода Орсо.'],
 ['Нулевая ветка','Глава X','Проведите дрезину по закрытой ветке и найдите получателя груза.'],
 ['Последняя смена','Глава XI','Восстановите релейную связь, не раскрывая служебный маршрут.']
];
const TALK11={
 a9a:{s:'avram',t:'Вода есть, Ирма. Но обратный счётчик крутится даже при закрытых кранах. Кто-то отбирает воду между станцией и Орсо.'},
 a9b:{s:'mara',t:'В коллекторе шесть камер. Подними воду впуском, опусти сливом. Понтоны поднимутся вместе с ней. На дальнем берегу проверь датчик.'},
 a9c:{s:'irma',t:'Заслонки целы. Вода уходит в служебную трубу. На хомуте свежая пломба, а в журнале эта ветка снята тридцать лет назад.'},
 a9d:{s:'teo',t:'Я сверил расход. Это не утечка: кто-то наполняет цистерны. Дойди до выпускного затвора, но не перекрывай общую подачу.'},
 ep11_0:{s:'narr',t:'Мара снимает крышку счётчика. Под ней — свежая путевая квитанция: вода и уголь для нулевой ветки. Срок действия выдан сегодня. На обороте рукой Вейла: «Не останавливать до смены». Вдали один раз стучат колёса.'},
 a10a:{s:'teo',t:'Нулевая ветка считалась разобранной. Но рельсы блестят. Возьми ремонтную дрезину: дальше между площадками открытые пролёты.'},
 a10b:{s:'mara',t:'Сначала выбери груз по накладной и выставь две стрелки по схеме. Пуск сработает на белой лампе. Дрезина вернётся, если маршрут неверен.'},
 a10c:{s:'irma',t:'На ящиках нет оружия. Фильтры, лекарства, детские одеяла. Вейл отнимал их у наших городов. Но кому он их отправлял?'},
 a10d:{s:'avram',t:'Нашёл копию старого списка. Снятые с Кольца города не все погибли. Часть ушла на запасной ход. Вейл убрал их из расписания, но продолжил снабжать.'},
 ep11_1:{s:'narr',t:'Дрезина вкатывается на пустую платформу. Мара открывает шкаф с накладными: получатели — города, объявленные потерянными. Последняя пачка не подписана. На соседнем пути медленно проходит тёплый состав. Изнутри запотело окно.'},
 a11a:{s:'teo',t:'Приказы Вейла уже у диспетчеров. Если опубликуем координаты этой ветки, сюда пойдут фонари. Сначала восстановим закрытый служебный канал.'},
 a11b:{s:'mara',t:'На щите четыре поворотных контакта. Веди линию от белого входа к выходу, без обрывов. Поворачивай контакты кнопками внизу. Потом удерживай передачу на белой лампе.'},
 a11c:{s:'irma',t:'Он спасал тех, кого сам вычеркнул. Это не отменяет Орсо и Сангру. Но теперь я хочу спросить его лично, кто подписывает списки над ним.'},
 a11d:{s:'teo',t:'Канал принимает. На той стороне обычный дежурный. Просит назвать номер смены. Не имя смотрителя — номер смены.'},
 ep11_2:{s:'narr',t:'Лента приёмника двигается впервые за много лет. «Смена принята. Оставьте входной путь свободным». Ирма смотрит в окно: дальние сигналы гаснут один за другим, оставляя единственную белую лампу. У пустого стола остывает нетронутая чашка. Где-то за стеной отодвигают стул.'}
};
Object.assign(ASSETS_LINES,TALK11);
const PLOTS11=[['a9a','a9b','a9c','a9d'],['a10a','a10b','a10c','a10d'],['a11a','a11b','a11c','a11d']];
function act11(k){
 const id=k+9,meta=ACT11_META[k];
 const L=mkLevel({id,name:meta[0],sub:meta[1],sky:'sky'+id,tex:'tex5',music:k===1?'m_city':'m_hall',length:23500,killY:1050,spawn:[120,560],chrono:0,cloak:false,litOnly:true,views:[],tasks9:[],nodes9:[],service9:1e8,terminals:[],sequence:{id:'none',order:[],progress:0},flow:{id:'none',bits:0,target:0},act11:k,mechanisms11:[],pal:{...LEVELS[6].pal,fog:['#24494a','#24384e','#454137'][k],fogA:.09}});
 const S=(x,y,w,h=1050-y,o={})=>L.solids.push({x,y,w,h,k:'hull',...o});
 S(0,560,700);L.cps.push({x:120});
 for(let j=0;j<6;j++){
  const b=700+j*3700,id='N11_'+k+'_'+j;
  const title=[['Приёмный бассейн','Подземный акведук','Чужой водоотвод','Старый перепуск','Весовой бассейн','Выпускной затвор'],['Ремонтный выезд','Погрузка фильтров','Тихий перегон','Обход поста','Угольная эстакада','Последняя накладная'],['Входная линия','Обход фонарей','Служебный канал','Тихий вызов','Проверка изоляции','Ответ дежурного']][k][j];
  const hint=k===0?'E у ВПУСКА/СЛИВА: меняет уровень на 1. Держите нужный уровень, перейдите по понтонам и нажмите E у датчика на дальнем берегу. Если упали — лестница внизу или T.':k===1?'Накладная на щите. Выберите груз, две стрелки и запустите дрезину на белой лампе. Прыгните на платформу дрезины: она перевезёт через пролёт. На другом берегу E — принять груз.':'E поворачивает контакт на 90°. Соедините белый вход с выходом по светлой линии. Удерживайте E у передатчика на белой лампе; передача сохраняется до следующего окна.';
  const q={id,x:b,y:560,title,hint,kind:'act11',stage:j};L.tasks9.push(q);
  const m={id,b,j,kind:k,level:0,waterY:760,target:[2,1,3,2,3,1][j],valves:0,route:[0,0],cargo:0,needCargo:[0,2,1,2,0,1][j],needRoute:[[0,1],[1,0],[1,1],[0,0],[1,0],[0,1]][j],rideX:b+650,rideT:0,mode:'idle',rot:[0,0,0,0],charge:0};L.mechanisms11.push(m);
  L.cps.push({x:b+100});S(b,560,780);S(b+2340,560,1360);
  // Continuous safety floor + climbing steps. Missing a jump never loses mechanism state.
  S(b+780,880,1560);for(let r=0;r<5;r++)S(b+2190+r*30,820-r*65,45,1050-(820-r*65));
  L.gates.push({id,x:b+2860,y:-650,w:34,h:1210,dir:'up'});
  L.decor.push({k:'glamp',x:b+70,y:560},{k:'glamp',x:b+2460,y:560});
  if(j<4)L.trig.push({x:b+30,lines:[PLOTS11[k][j]]});
  if(k===0){S(b+3160,490,100,70);S(b+3360,420,120,140);L.anchors.push({x:b+3490,y:245});}
  if(k===1){L.vents.push({x:b+3190,y:560,per:3.8,on:1.25,ph:j*.4},{x:b+3410,y:560,per:3.8,on:1.25,ph:j*.4+1.8});S(b+3290,475,90,85);}
  if(k===2){S(b+3130,480,110,80);S(b+3330,400,110,160);S(b+3520,330,140,18,{oneWay:1});L.anchors.push({x:b+3470,y:190});}

  if(k===0){
   m.controls=[{x:b+260,n:0,label:'ВПУСК +1'},{x:b+490,n:1,label:'СЛИВ −1'},{x:b+2580,n:2,label:'ДАТЧИК · E'}];
   for(let r=0;r<7;r++)S(b+770+r*225,760,150,22,{oneWay:1,pontoon11:id});
   // Optional high ledges are real alternate traversal, not compulsory collectibles.
   S(b+1190,420,180,18,{oneWay:1});L.anchors.push({x:b+1480,y:255});
  }else if(k===1){
   m.controls=[{x:b+140,n:0,label:'ГРУЗ'},{x:b+340,n:1,label:'СТРЕЛКА A'},{x:b+540,n:2,label:'СТРЕЛКА Б'},{x:b+710,n:3,label:'ПУСК'},{x:b+2580,n:4,label:'ПРИЁМКА'}];
   S(m.rideX,540,200,24,{oneWay:1,trolley11:id});
  }else{
   // Four elbow contacts form an upper/lower bypass. Source and sink are fixed.
   L.views.push({x1:b-20,x2:b+790,cx:b+720,cy:410,z:.88});const flip=j%2;m.solution=flip?[2,0,3,1]:[3,1,2,0];m.rot=m.solution.map((v,i)=>(v+1+(i+j)%3)%4);
   m.controls=[0,1,2,3].map((n)=>({x:b+150+n*180,n,label:'КОНТАКТ '+(n+1)}));m.controls.push({x:b+2540,n:4,label:'ПЕРЕДАЧА · ДЕРЖАТЬ E'});
   for(let r=0;r<8;r++)S(b+780+r*195,640-(r%2)*55,150,18,{oneWay:1,relay11:id});
   L.anchors.push({x:b+1180,y:260},{x:b+1770,y:240});
  }
 }
 S(22900,560,600);L.cps.push({x:23000});L.goal={x:23210,kind:'repair',hold:2,label:['зафиксировать расход и открыть служебный выход','снять накладную последнего рейса','подтвердить приём смены'][k],gy:560};
 L.npcs=[{k:k===1?'mara':'teo',x:23060,y:560}];
 return L;
}
for(let k=0;k<3;k++){LEVELS.push(act11(k));SUNPOS[k+9]=[.82,.25];GRADE[k+9]={...GRADE[k===1?5:7],bloom:.22,sat:.95};CH_LINE[k+8]=ACT11_META[k][2];}
const END11=[
 ['sky9','КВИТАНЦИЯ НА СЕГОДНЯ',TALK11.ep11_0.t],
 ['sky10','СОСТАВ БЕЗ РАСПИСАНИЯ',TALK11.ep11_1.t],
 ['sky11','ОДНА БЕЛАЯ ЛАМПА',TALK11.ep11_2.t]
];
END11.forEach((v,i)=>{EP8.push(v);ASSETS_LINES['ep8_'+(i+8)]=TALK11['ep11_'+i];});
// Do not let the old eight-act finale close the new story.
if(SAVE.done&&SAVE.chapter===7){SAVE.done=false;SAVE.unlocked=Math.max(SAVE.unlocked||0,8);SAVE.chapter=8;SAVE.cp=0;persist();}
const oldRespawn11=respawn;respawn=function(ci){oldRespawn11(ci);if(LV.act11!==undefined){W.P.inv=1;W.use11=.25;}};
function save11(){if(LV.act11===undefined)return;SAVE.progress11=SAVE.progress11||{};SAVE.progress11[LV.id]={flags:{...W.flags},mechanisms:LV.mechanisms11.map(m=>({id:m.id,level:m.level,route:m.route,cargo:m.cargo,rot:m.rot,charge:m.charge,mode:W.flags[m.id]?'arrived':'idle'}))};persist();}
const startBefore11=startGame;startGame=function(li,cp=0){startBefore11(li,cp);if(LV.act11!==undefined){const s=SAVE.progress11&&SAVE.progress11[LV.id];if(s){Object.assign(W.flags,s.flags);s.mechanisms.forEach(v=>{const m=LV.mechanisms11.find(m=>m.id===v.id);if(m)Object.assign(m,v);});for(const g of LV.gates)if(W.flags[g.id]){g.open=1;g.latch=true;}}}}
const checkpointBefore11=onCheckpoint;onCheckpoint=function(i){save11();checkpointBefore11(i);};
function note11(text){W.note8={t:3.5,text};}
function done11(m){if(W.flags[m.id])return;fireLink(m.id);sfx('s_checkpoint',{vol:.6});note11('✓ '+LV.tasks9.find(q=>q.id===m.id).title+' · проход открыт');save11();}
const cargo11=['ИНСТРУМЕНТ','ФИЛЬТРЫ','МЕДИКАМЕНТЫ'];
function lamp11(m){return ((W.time+m.j*1.7)%7)<3.6;}
function powered11(m){return m.rot.every((r,i)=>r===m.solution[i]);}
function use11(m,n){
 if(W.flags[m.id])return;
 if(m.kind===0){if(n<2){m.level=clamp(m.level+(n===0?1:-1),0,3);note11('Уровень '+m.level+' / 3 · датчик требует '+m.target);save11();}else if(m.level===m.target&&Math.abs(m.waterY-(760-m.target*65))<5)done11(m);else note11('Датчик: нужен уровень '+m.target+'. Впуск и слив — на ближнем берегу.');}
 if(m.kind===1){if(m.mode==='travel')return;if(n===0)m.cargo=(m.cargo+1)%3;else if(n<3)m.route[n-1]^=1;else if(n===3){if(!lamp11(m))note11('Путь занят. Следующее белое окно — через несколько секунд.');else if(m.cargo!==m.needCargo||m.route.some((r,i)=>r!==m.needRoute[i])){note11('Диспетчер отклонил маршрут: сверьте груз и обе стрелки с накладной.');sfx('s_ui_select',{vol:.5});}else{m.mode='travel';m.rideT=0;note11('Маршрут принят · запрыгните на дрезину, отправление через 3 секунды.');}}else if(n===4){if(m.mode==='arrived')done11(m);else note11('Сначала доставьте дрезину с указанным грузом.');}save11();}
 if(m.kind===2&&n<4){m.rot[n]=(m.rot[n]+1)%4;save11();}
 sfx('s_plate',{vol:.45});
}
const stepBefore11=stepWorld;
stepWorld=function(dt){
 if(LV.act11===undefined)return stepBefore11(dt);if(W.journal9)return;
 const P=W.P,I=inp();W.use11=Math.max(0,(W.use11||0)-dt);
 let near=null;for(const m of LV.mechanisms11)for(const c of m.controls)if(Math.abs(P.x-c.x)<75&&Math.abs(P.y-560)<75)near={m,c};
 if(near&&I.hit('grapple')&&!W.use11){use11(near.m,near.c.n);W.use11=.3;W.hook=null;P.rope=null;}
 const hit=I.hit;if(near)I.hit=function(a){return a==='grapple'?false:hit.call(this,a);};
 // Moving colliders use the same ground carry mechanism as ordinary elevators.
 for(const m of LV.mechanisms11){
  if(m.kind===0){const target=760-m.level*65,old=m.waterY;m.waterY+=clamp(target-m.waterY,-38*dt,38*dt);for(const s of LV.colStatic)if(s.pontoon11===m.id){s.y=m.waterY-12;s.vy=(m.waterY-old)/dt;}}
  if(m.kind===1){let x=m.b+650;if(m.mode==='travel'){m.rideT+=dt;const u=clamp((m.rideT-3)/14,0,1);x+=u*1510;if(u>=1){m.mode='arrived';save11();}}else if(m.mode==='arrived')x=m.b+2160;m.rideX=x;for(const s of LV.colStatic)if(s.trolley11===m.id){s.vx=(x-s.x)/dt;s.x=x;}}
  if(m.kind===2&&near&&near.m===m&&near.c.n===4&&I.held('grapple')&&!P.dead){if(powered11(m)&&lamp11(m)){m.charge=Math.min(1,m.charge+dt/6);if(m.charge>=1)done11(m);}else if(!powered11(m))m.charge=Math.max(0,m.charge-dt*.12);}
 }
 stepBefore11(dt);I.hit=hit;
 // Remote brake is deliberately not part of these new mechanics.
 if(W.finished&&LV.tasks9.some(q=>!W.flags[q.id])){W.finished=false;W.goalP=0;}
};
// Keep legacy art/labels out of the three new environments.
const decorBefore11=drawDecor5;
function label11(x,y,text,size=16,col='#efe4cc'){ctx.font=`600 ${size}px ${FONT_U}`;ctx.textAlign='center';ctx.fillStyle=col;ctx.fillText(text,x,y);}
function board11(x,y,w,h){ctx.fillStyle='rgba(13,30,35,.95)';ctx.strokeStyle='#b09362';ctx.lineWidth=2;ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);}
function pipe11(m){const x=m.b+880,y=240,step=100;const flip=m.j%2;
 const points=flip?[[0,1],[0,2],[1,2],[1,1]]:[[0,1],[0,0],[1,0],[1,1]];
 board11(x-90,y-80,540,390);label11(x+180,y-48,'СЛУЖЕБНЫЙ КАНАЛ · '+(m.j+1),19);
 ctx.strokeStyle='#40545a';ctx.lineWidth=3;for(let a=0;a<3;a++)for(let b=0;b<3;b++){ctx.strokeRect(x+a*step-35,y+b*step-35,70,70);}
 // Input and output are printed wire terminals, never decorative magic.
 const all=powered11(m),dirs=[[0,-1],[1,0],[0,1],[-1,0]];ctx.lineCap='round';
 ctx.strokeStyle='#ece8d6';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x-75,y+100);ctx.lineTo(x-38,y+100);ctx.moveTo(x+140,y+100);ctx.lineTo(x+260,y+100);ctx.stroke();
 points.forEach(([a,b],i)=>{const xx=x+a*step,yy=y+b*step;ctx.strokeStyle=all?'#9bdfbe':'#b6a07c';ctx.lineWidth=8;ctx.beginPath();for(const d of [m.rot[i],(m.rot[i]+1)%4]){ctx.moveTo(xx,yy);ctx.lineTo(xx+dirs[d][0]*48,yy+dirs[d][1]*48);}ctx.stroke();ctx.fillStyle='#122b30';ctx.beginPath();ctx.arc(xx,yy,13,0,7);ctx.fill();label11(xx,yy+5,String(i+1),16,'#f4e3c7');});
 label11(x-40,y+150,'ВХОД',13);label11(x+235,y+150,'ВЫХОД',13);label11(x+175,y+275,all?'ЛИНИЯ СОБРАНА':'СОЕДИНИТЕ КОНТАКТЫ 1–4',16,all?'#a1e7c8':'#dfc79d');ctx.lineCap='butt';
}
drawDecor5=function(L){if(L.act11===undefined)return decorBefore11(L);
 for(const m of L.mechanisms11){if(!inVis(m.b-100,3700))continue;ctx.save();const done=W.flags[m.id];
  board11(m.b+80,230,660,124);label11(m.b+410,264,(m.j+1)+' / 6 · '+L.tasks9.find(q=>q.id===m.id).title,23);label11(m.b+410,300,m.kind===0?'ПОНТОНЫ · УРОВЕНЬ '+m.level+' → ДАТЧИК '+m.target:m.kind===1?'НАКЛАДНАЯ: '+cargo11[m.needCargo]:'ПОВОРОТ КОНТАКТОВ · E',18);label11(m.b+410,330,m.kind===1?'МАРШРУТ: A '+(m.needRoute[0]?'ОТВОД':'ПРЯМО')+' → Б '+(m.needRoute[1]?'ОТВОД':'ПРЯМО'):done?'ПРОВЕРЕНО · ПРОХОД ОТКРЫТ':m.kind===0?'ВПУСК / СЛИВ → ПЕРЕХОД → ДАТЧИК':'ВХОД → КОНТАКТЫ → ВЫХОД',15,done?'#9de2bb':'#caba9e');
  if(m.kind===0){ctx.fillStyle='rgba(42,103,111,.62)';ctx.fillRect(m.b+780,m.waterY,1560,880-m.waterY);ctx.strokeStyle='#92c6c3';ctx.lineWidth=2;ctx.beginPath();for(let x=m.b+780;x<m.b+2340;x+=12){const yy=m.waterY+Math.sin(x*.035+W.time*2)*2;x===m.b+780?ctx.moveTo(x,yy):ctx.lineTo(x,yy);}ctx.stroke();for(let r=0;r<=3;r++){label11(m.b+2380,760-r*65,'— '+r,15,r===m.target?'#ffe2a4':'#a9c3bc');}for(const s of L.colStatic)if(s.pontoon11===m.id){ctx.fillStyle='#8a7350';ctx.fillRect(s.x,s.y,150,19);ctx.strokeStyle='#c5b383';ctx.strokeRect(s.x,s.y,150,19);for(let t=0;t<6;t++){ctx.beginPath();ctx.moveTo(s.x+t*25,s.y);ctx.lineTo(s.x+t*25,s.y+19);ctx.stroke();}}}
  if(m.kind===1){ctx.strokeStyle='#64757a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(m.b+700,568);ctx.lineTo(m.b+2360,568);ctx.moveTo(m.b+700,582);ctx.lineTo(m.b+2360,582);ctx.stroke();const xx=m.rideX;ctx.fillStyle='#7c4232';ctx.fillRect(xx+8,485,184,55);ctx.strokeStyle='#d4ad71';ctx.strokeRect(xx+8,485,184,55);ctx.fillStyle='#bc9767';ctx.fillRect(xx+65,450,65,35);for(const dx of [35,165]){ctx.fillStyle='#14272d';ctx.beginPath();ctx.arc(xx+dx,553,14,0,7);ctx.fill();ctx.strokeStyle='#9c9f8d';ctx.stroke();}label11(xx+100,475,cargo11[m.cargo],12);label11(m.b+1520,400,m.mode==='travel'?(m.rideT<3?'ОТПРАВЛЕНИЕ ЧЕРЕЗ '+Math.ceil(3-m.rideT):'ДРЕЗИНА В ПУТИ'):m.mode==='arrived'?'ГРУЗ ПРИБЫЛ':'ДРЕЗИНА ОЖИДАЕТ',21);label11(m.b+1500,440,lamp11(m)?'○ ПУТЬ СВОБОДЕН':'× ПУТЬ ЗАНЯТ',17,lamp11(m)?'#e9f1d9':'#d18c76');}
  if(m.kind===2)pipe11(m);
  for(const c of m.controls){if(!inVis(c.x-130,260))continue;board11(c.x-22,478,44,82);ctx.fillStyle=done?'#9dd1ac':'#d0a268';ctx.beginPath();ctx.arc(c.x,500,10,0,7);ctx.fill();label11(c.x,452,c.label,14);if(m.kind===1&&c.n<3)label11(c.x,429,c.n===0?cargo11[m.cargo]:(m.route[c.n-1]?'ОТВОД':'ПРЯМО'),14,'#9fdfcf');if(Math.abs(W.P.x-c.x)<75&&Math.abs(W.P.y-560)<75)label11(c.x,398,done?'✓ ГОТОВО':m.kind===2&&c.n===4?'ДЕРЖАТЬ E':'E · ИСПОЛЬЗОВАТЬ',16,'#fff0ce');}
  if(m.kind===2){const x=m.b+2390;board11(x,270,300,92);label11(x+150,297,lamp11(m)?'○ ОКНО ПЕРЕДАЧИ':'× ОЖИДАНИЕ ОКНА',16);ctx.fillStyle='#32494a';ctx.fillRect(x+20,316,260,12);ctx.fillStyle='#a1ddbf';ctx.fillRect(x+20,316,260*m.charge,12);label11(x+150,348,Math.round(m.charge*100)+' % · НАКОПЛЕННЫЙ ПРИЁМ',13);}
  ctx.restore();
 }
};
const goalBefore11=drawGoal;drawGoal=function(L){if(L.act11===undefined)return goalBefore11(L);const g=L.goal;ctx.save();board11(g.x-30,445,90,115);label11(g.x+15,420,'ПУЛЬТ СМЕНЫ',17);label11(g.x+15,398,'E · ПОДТВЕРДИТЬ',14);ctx.restore();};
const hudBefore11=drawHUD;drawHUD=function(dt){if(LV.act11===undefined)return hudBefore11(dt);
 // Base HUD contains character health/charge, subtitles and checkpoint notices.
 hud9(dt);U.save();U.textAlign='center';panel(U,330,20,620,76,{c:8});U.fillStyle='#e9ddc5';U.font=`700 20px ${FONT_U}`;U.fillText(LV.name,640,48);U.fillStyle='#accbbf';U.font=`500 14px ${FONT_U}`;U.fillText(LV.tasks9.filter(q=>W.flags[q.id]).length+' / 6 · Tab — цель и инструкция · T — возврат',640,76);
 const q=LV.tasks9.find(q=>!W.flags[q.id]);if(q&&!VOICE.busy()&&!W.note8){U.font=`500 16px ${FONT_U}`;const text=q.hint,lines=wrapText(text,960);panel(U,125,616-lines.length*19,1030,lines.length*24+28,{c:8});U.font=`500 16px ${FONT_U}`;U.fillStyle='#e8e0cf';lines.forEach((s,i)=>U.fillText(s,640,637-lines.length*19+i*24));}U.restore();};
// Three 24-second motion-comic scenes; actual moving water, wheels, relay tape overlays.
const motionBefore11=screenMotion8;
screenMotion8=function(dt){if(ST.li<8)return motionBefore11(dt);if(!ST.init){ST.init=true;VOICE.clear();VOICE.say(['ep8_'+ST.li],{story:1});AUD.playMusic(LEVELS[ST.li].music,1);}
 ST.t+=dt;VOICE.update(dt);const k=ST.li-8,E=END11[k],u=clamp(ST.t/26,0,1);ctx.fillStyle='#0c191e';ctx.fillRect(0,0,VW,VH);drawCover(IMG[E[0]],0,0,VW,VH,1.03+u*.12,.35+u*.3,.5);
 ctx.save();ctx.globalAlpha=.24;ctx.fillStyle=k===0?'#71b8b8':'#e5d7ab';if(k===0){ctx.beginPath();ctx.moveTo(0,720);for(let x=0;x<=1280;x+=12)ctx.lineTo(x,580+Math.sin(x*.025+ST.t*1.7)*6);ctx.lineTo(1280,720);ctx.fill();}if(k===1){ctx.translate(1280-ST.t*48,420);ctx.fillStyle='#111b20';ctx.fillRect(0,0,320,150);ctx.fillStyle='#f3bc74';for(let i=0;i<5;i++)ctx.fillRect(24+i*58,22,34,48);}if(k===2){ctx.fillRect(800,260,170,Math.min(180,ST.t*8));ctx.fillStyle='#263434';for(let j=0;j<8;j++)ctx.fillRect(815,285+j*18,100+(j%3)*13,2);}ctx.restore();
 const gr=ctx.createLinearGradient(0,300,0,720);gr.addColorStop(0,'rgba(6,14,19,0)');gr.addColorStop(.45,'rgba(6,14,19,.84)');gr.addColorStop(1,'rgba(6,14,19,.98)');ctx.fillStyle=gr;ctx.fillRect(0,300,1280,420);letterbox(35);
 U.save();U.textAlign='center';U.fillStyle='#d7b77e';U.font=`600 13px ${FONT_U}`;U.fillText('ПОСЛЕ СМЕНЫ · '+LEVELS[ST.li].sub.toUpperCase(),640,442);U.fillStyle='#f7e7ca';fitFont(U,E[1],700,36,FONT_T,1100,24);U.fillText(E[1],640,487);U.font=`500 20px ${FONT_U}`;const lines=wrapText(E[2],1050);U.fillStyle='#ede6d6';lines.forEach((t,i)=>U.fillText(t,640,531+i*27));U.font=`500 14px ${FONT_U}`;U.fillStyle='#b7bfb5';U.fillText('Enter — продолжить · сюжетная сцена',640,681);U.restore();Object.assign(FX,{bloom:.22,vign:.45,grain:.035});
 if(ST.t>Math.max(26,(AUD.buf['v_ep8_'+ST.li]?.duration||0)+1)||(ST.t>2&&INPUT.hit('confirm'))){const li=ST.li,stats=ST.stats;VOICE.clear();setState('chapterEnd',{li,stats});}
};
const chapterEndBefore11=screenChapterEnd;
screenChapterEnd=function(dt){if(ST.li!==10)return chapterEndBefore11(dt);ST.t+=dt;drawCover(IMG.sky11,0,0,1280,720,1.1,.5,.5);overlayDim(.65);U.save();U.textAlign='center';U.fillStyle='#f0e5cd';U.font=`700 42px ${FONT_T}`;U.fillText('Смена принята',640,282);U.font=`500 22px ${FONT_U}`;U.fillText('В служебном коридоре зажёгся свет.',640,342);U.fillStyle='#a8cabe';U.font=`500 16px ${FONT_U}`;U.fillText('Глава XI пройдена · продолжение истории впереди',640,394);U.fillText('Enter — к карте глав',640,465);U.restore();if(ST.t>1.5&&(INPUT.hit('confirm')||MOUSE.click)){MOUSE.click=false;SAVE.done=false;persist();setState('chapters',{sel:10});}};
// Eleven chapters require a compact list; the legacy fixed 48px gap overflowed.
screenChapters=function(){const li=clamp(ST.sel||0,0,LEVELS.length-1);bgMenu(LEVELS[li].sky);const x=54,y=22,w=1150,h=676;const cy=windowFrame('Главы',x,y,w,h,'ЛИНИЯ ЗАРИ · 11 ГЛАВ');const items=LEVELS.map((L,i)=>({label:`${L.sub}. ${L.name}`,disabled:i>(SAVE.unlocked||0),note:i>(SAVE.unlocked||0)?'Пройдите предыдущую главу':CH_LINE[i],act:()=>{AUD.stopMusic(1);startChapter(i,0);}}));items.push({label:'Назад',act:()=>setState('menu',{sel:2})});menuList(items,x+44,cy+32,{gap:39,w:w-88,noteY:668});if(INPUT.hit('back'))setState('menu',{sel:2});};
// Migration preserves all existing records; old service snapshots never overwrite these chapters.
window.__dbg.startGame=(li,cp=0)=>startGame(li,cp);
