'use strict';
// v0.8 — two acts of the living city. Each puzzle is local, reversible, checkpoint-safe.
for(const g of LEVELS[5].gates) if(g.tm&&g.dir==='up')g.tm=Math.max(g.tm,3.8);
// Rescue ledges in the blind drop after the first gear and in the press staircase.
LEVELS[5].solids.push({x:5410,y:480,w:100,h:16,k:'grate',oneWay:1},{x:5520,y:400,w:100,h:16,k:'grate',oneWay:1});
const ACT8_LINES={};
function line8(id,s,t){ACT8_LINES[id]={s,t};return id;}
function newAct8(id,name,sky,length){return mkLevel({id,name,sub:id===7?'Глава VII':'Глава VIII',sky,tex:'tex5',music:id===7?'m_city':'m_hall',length,killY:900,cloak:true,litOnly:true,chrono:0,chronoT:3,chronoCd:4.5,spawn:[120,560],views:[],terminals:[],pal:{fog:id===7?'#30636b':'#58404e',fogA:0.13,amb:'#e1e5d7',far:'#22383e',mid:'#15272b',rim:'rgba(255,218,157,.9)',lightDir:[-.4,-.8]}});}
LEVELS.push((()=>{const L=newAct8(7,'Водозабор у канала','sky7',7900);
const S=(x,y,w,h=900-y,k='hull',o={})=>L.solids.push({x,y,w,h,k,...o});
// Canal district: local bridge control, readable two-stage approach.
S(0,560,1800); L.pulls.push({x:1320,y:300,link:'C7'});L.gates.push({id:'C7',x:1800,y:560,w:220,h:22,dir:'bridge'});S(2020,560,1780);
L.decor.push({k:'sign',x:600,y:400,t:'ВОДОЗАБОР · АВАРИЙНЫЙ РЕЖИМ'},{k:'glamp',x:1100,y:560},{k:'pipes',x:2100,y:560,w:1400});
L.water=[{x1:1800,x2:2020,y:650},{x1:5780,x2:6000,y:650}];
// Memory chimes: discover correct order on the mural; wrong answers reset only this lock.
L.sequence={id:'SONG7',order:[1,3,2],progress:0};
[1,2,3].forEach((n,i)=>L.terminals.push({x:2440+i*180,y:560,n,kind:'chime'}));
L.gates.push({id:'SONG7',x:3280,y:300,w:36,h:260,dir:'up'});
L.decor.push({k:'sign',x:2640,y:390,t:'ИЗОЛЯЦИЯ → СБРОС → ПИТАНИЕ'});
L.npcs.push({k:'teo',x:2220,y:560});
// Rooftops: safe falls, optional archive shard above the main path.
S(3800,560,1980);S(3960,480,140,80,'crate');S(4180,400,160,160,'tower');S(4400,320,200,18,'grate',{oneWay:1});L.shards.push({id:'s13',x:4510,y:280});
L.anchors.push({x:4700,y:260});L.embers.push([4260,350],[4860,520]);
// Redirect the city sun into the canal bridge.
L.sunz.push([5040,5160]);L.mirrors.push({id:'CM7',x:5480,y:520,t:'/',alt:'/'});L.receivers.push({x:5480,y:290,link:'SUN7',need:.8});L.gates.push({id:'SUN7',x:5780,y:560,w:220,h:22,dir:'bridge'});
L.hints.push({done:'SUN7',x1:4900,x2:5780,pts:[[5100,520],[5480,520],[5480,290]]});S(6000,560,1900);
// The central lens requires the power flow to be routed, not a mandatory death chase.
L.flow={id:'FLOW7',target:5,bits:0};[0,1,2].forEach((n,i)=>L.terminals.push({x:6370+i*190,y:560,n,kind:'valve'}));L.gates.push({id:'FLOW7',x:7190,y:300,w:36,h:260,dir:'up'});
L.decor.push({k:'sign',x:6550,y:380,t:'ПРИВОД + УПРАВЛЕНИЕ · БЕЗ УТЕЧКИ'},{k:'heart',x:7720,y:560});L.npcs.push({k:'mara',x:7460,y:560});
L.cps=[120,1200,2110,3440,3880,4930,6100,7300].map(x=>({x}));
L.goal={x:7660,kind:'repair',hold:1.6,label:'подготовить ремонтную линию'};
L.trig=[{x:150,lines:[line8('a7_arr','irma','Тео, здесь горят окна. Сангра была мёртвой. Этот город — живой.')]},{x:950,tip:'citybridge8',lines:[line8('a7_bridge','teo','Люмен покупает рассвет у Гильдии. Но сегодня солнце не взошло.')]},{x:2130,tip:'chime8',lines:[line8('a7_song','teo','Когда я был маленьким, город отвечал на три ноты. Первая, третья, вторая. Я помню это место… хотя никогда здесь не был.')]},{x:3540,lines:[line8('a7_roof','mara','Дома дышат в такт Хребту. Не двигатель питает город — это город держит двигатель живым.')]},{x:4930,tip:'sun8',lines:[line8('a7_light','irma','В этой линзе нет топлива. Только голоса. Они забирают у людей воспоминания за свет?')]},{x:6130,tip:'flow8',lines:[line8('a7_flow','mara','Открой первый и третий контур. Средний ведёт в хранилище Гильдии — его оставь закрытым.')]},{x:7330,lines:[line8('a7_end','teo','На рынке продают не вещи, Ирма. Там продают вчерашний день. И кто-то выставил на продажу наш.')]}];return L;})());
LEVELS.push((()=>{const L=newAct8(8,'Товарный рынок','sky8',8600);const S=(x,y,w,h=900-y,k='hull',o={})=>L.solids.push({x,y,w,h,k,...o});
S(0,560,3600);L.npcs.push({k:'mara',x:600,y:560},{k:'teo',x:3100,y:560});
// Three market stalls encode the tune, with an optional memory above the awnings.
L.sequence={id:'SONG8',order:[3,1,2],progress:0};[1,2,3].forEach((n,i)=>L.terminals.push({x:1240+i*220,y:560,n,kind:'chime'}));L.gates.push({id:'SONG8',x:2160,y:280,w:36,h:280,dir:'up'});
L.decor.push({k:'sign',x:650,y:390,t:'ТОВАРНЫЙ СКЛАД · НАСОС ДЛЯ ОРСО'},{k:'sign',x:1470,y:360,t:'ПИТАНИЕ → ПОДАЧА → СЛИВ'});
S(2400,480,120,80,'crate');S(2620,400,130,160,'tower');S(2820,320,220,18,'grate',{oneWay:1});L.shards.push({id:'s14',x:2930,y:280});
// Flooded freight court: actual crate transport / counterweight and an accessible return route.
L.crates.push({x:3320,y:464,w:84,h:96});L.plates.push({x:3480,w:100,y:560,link:'LOAD8'});L.gates.push({id:'LOAD8',x:3600,y:560,w:240,h:22,dir:'bridge'});S(3840,560,1760);
L.water=[{x1:3600,x2:3840,y:650},{x1:5600,x2:6220,y:670}];
// Rotating mirror has no lock-out: wait and freeze, or charge over several cycles.
L.sunz.push([4120,4240]);L.mirrors.push({id:'M8',x:4610,y:520,t:'/',rot:3,t0:'/',t1:'\\'});L.receivers.push({x:4610,y:270,link:'OPT8',need:.7});L.gates.push({id:'OPT8',x:5020,y:290,w:36,h:270,dir:'up'});L.hints.push({done:'OPT8',x1:3920,x2:5000,pts:[[4180,520],[4610,520],[4610,270]]});
// Ferries over the dark canal: static safe stepping stones, one moving optional shortcut.
S(5720,560,120,340);S(5960,560,120,340);S(6220,560,2380);L.movers.push({x:5620,y:470,w:140,h:18,x2:6060,y2:470,per:6,k:'beam'});L.anchors.push({x:5890,y:280});
L.flow={id:'ARCH8',target:6,bits:0};[0,1,2].forEach((n,i)=>L.terminals.push({x:6620+i*190,y:560,n,kind:'valve'}));L.gates.push({id:'ARCH8',x:7380,y:270,w:36,h:290,dir:'up'});
L.decor.push({k:'sign',x:6810,y:380,t:'ТАЛЬ + ТОРМОЗ · БЕЗ ПЕРЕГРУЗКИ'},{k:'heart',x:8280,y:560},{k:'glamp',x:7820,y:560});L.npcs.push({k:'teo',x:7950,y:560},{k:'mara',x:8070,y:560});
L.cps=[120,950,2280,3150,3920,5160,6300,7540].map(x=>({x}));L.goal={x:8240,kind:'repair',hold:2,label:'открыть подачу воды в Орсо'};
L.trig=[{x:150,lines:[line8('a8_arr','mara','За каждым фонарём — чья-то забытая жизнь. Сегодня мы вернём её владельцу.')]},{x:950,tip:'chime8',lines:[line8('a8_tune','teo','Здесь пароль звучит наоборот: третья, первая, вторая. Не покупай ничего — даже если услышишь свой голос.')]},{x:2300,lines:[line8('a8_truth','irma','Этот цилиндр помечен моим именем. На записи я сама прошу стереть курс «Зари». Значит, Вейл не придумал запрет. Я его оставила.')]},{x:3150,tip:'cargo8',lines:[line8('a8_load','mara','Груз на весы — и мост откроется. Цилиндры не трогай: одна трещина, и чужое детство исчезнет навсегда.')]},{x:3920,tip:'sun8',lines:[line8('a8_lens','teo','В записи есть вторая дорожка. Стирание было временным. Кто-то убрал срок и сделал его вечным.')]},{x:5230,tip:'ferry8',lines:[line8('a8_canal','irma','Теперь понятно, почему Вейл нас преследует. Мы не нарушаем приказ. Мы пришли проверить, кто его изменил.')]},{x:6330,tip:'archive8',lines:[line8('a8_code','mara','Первый контур стирает память. Второй и третий отдают её городу. Сначала закрой первый.')]},{x:7570,lines:[line8('a8_last','teo','Ирма… на звёздной карте нет Земли. «Заря» не улетела от неё. Она всё это время летит к ней. А под нами — не планета.')]}];return L;})());
Object.assign(TIPS,{citybridge8:[['E'],'Кольцо поднимает мост через канал. После открытия мост останется на месте'],chime8:[['E'],'Подойдите к резонатору и нажмите E. Ноты вводятся в порядке на табличке. Ошибка сбрасывает только мелодию'],sun8:[['Q','R'],'Встаньте в столб света, смотрите вправо и держите Q. R фиксирует вращающееся зеркало'],flow8:[['E'],'E у клапана переключает контур. Включите I и III, оставьте II выключенным'],cargo8:[['→'],'Толкните ящик на весы. Он закрепится и удержит грузовой мост'],ferry8:[['Пробел','E'],'Через канал: прыгайте по опорам или используйте кольцо. Подождать паром тоже можно'],archive8:[['E'],'Включите питание тали и тормоза: II и III. Перегруженный контур I должен быть выключен'] ,rescue8:[['T'],'Застряли? Держите T одну секунду — возврат к контрольной точке. Меню паузы также доступно'] });
SHARDS.s13='Акт осмотра насоса';SHARDS.s14='Накладная для Орсо';
