import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $=id=>document.getElementById(id), fmt=n=>'$'+Math.floor(n).toLocaleString('en-US');
const CATALOG=[
{id:'bench',name:'Press de banca',cat:'strength',icon:'🏋️',price:180,desc:'Entrena pecho y brazos con una estación de fuerza.',cap:4,rep:2},
{id:'dumbbell',name:'Mancuernas',cat:'strength',icon:'💪',price:120,desc:'Pesas libres para rutinas variadas.',cap:4,rep:1},
{id:'rack',name:'Jaula de sentadillas',cat:'strength',icon:'🦾',price:450,desc:'Equipo profesional para entrenamientos pesados.',cap:6,rep:5},
{id:'cable',name:'Polea multifunción',cat:'strength',icon:'🔩',price:520,desc:'Máquina versátil para todo el cuerpo.',cap:6,rep:5},
{id:'treadmill',name:'Cinta de correr',cat:'cardio',icon:'🏃',price:220,desc:'Cardio para mantener a los socios activos.',cap:5,rep:2},
{id:'bike',name:'Bicicleta estática',cat:'cardio',icon:'🚴',price:260,desc:'Sesiones cardiovasculares de bajo impacto.',cap:4,rep:3},
{id:'rower',name:'Remo indoor',cat:'cardio',icon:'🚣',price:330,desc:'Entrenamiento cardiovascular de cuerpo completo.',cap:4,rep:3},
{id:'water',name:'Fuente de agua',cat:'comfort',icon:'💧',price:90,desc:'Mejora la comodidad y satisfacción.',cap:0,rep:2},
{id:'mirror',name:'Espejos de pared',cat:'comfort',icon:'🪞',price:150,desc:'Dale al gimnasio un aspecto profesional.',cap:0,rep:2},
{id:'locker',name:'Taquillas',cat:'comfort',icon:'🗄️',price:300,desc:'Guarda las pertenencias de tus clientes.',cap:3,rep:4},
{id:'plant',name:'Planta decorativa',cat:'comfort',icon:'🪴',price:70,desc:'Mejora el ambiente del establecimiento.',cap:0,rep:1},
{id:'speaker',name:'Sistema de sonido',cat:'comfort',icon:'🔊',price:240,desc:'Música ambiental que anima a entrenar.',cap:0,rep:3}
];
const STAFF=[{id:'trainer',name:'Entrenador personal',icon:'🏋️',price:350,salary:18,desc:'Aumenta satisfacción y reputación.'},{id:'cleaner',name:'Personal de limpieza',icon:'🧹',price:250,salary:12,desc:'Mantiene el gimnasio más limpio.'},{id:'reception',name:'Recepcionista',icon:'🛎️',price:300,salary:14,desc:'Mejora la captación de nuevos socios.'}];
const state={money:1250,members:8,reputation:1,level:1,xp:0,satisfaction:86,cleanliness:100,energy:100,day:1,hour:8,minutes:0,todayClients:0,equipment:['bench','treadmill','dumbbell'],owned:{},staff:{},view:1,marketingCount:0,visited:0};
let scene,camera,renderer,clock,player,locked=false,paused=false,yaw=0,pitch=0,keys={},colliders=[],equipment=[],npcs=[],interactTarget=null,activeTab='overview',shopCat='all',toastTimer,simTimer=0,autoTimer=0,camView=1,soundOn=false;
const mats={};
function mat(c,r=.8,m=0){const k=`${c}-${r}-${m}`;return mats[k]||(mats[k]=new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m}));}
function box(w,h,d,ma,x,y,z,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),ma);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function cyl(rt,rb,h,ma,x,y,z,parent=scene,seg=16){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),ma);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function createRoom(){
 scene.background=new THREE.Color(0x11182a);scene.fog=new THREE.Fog(0x11182a,27,62);
 scene.add(new THREE.HemisphereLight(0xcbdcff,0x272033,2));
 const sun=new THREE.DirectionalLight(0xffe9cf,2.5);sun.position.set(-7,14,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-20;sun.shadow.camera.right=20;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-20;scene.add(sun);
 const floor=mat(0x292f40),wall=mat(0x343b4d),dark=mat(0x171c2b),purple=mat(0x805dff),metal=mat(0x98a5b8,.3,.7),wood=mat(0x79543d);
 box(28,.25,25,floor,0,-.16,0);
 for(let x=-13;x<=13;x+=2)box(.025,.008,24,mat(0x3a4256),x,-.025,0);
 for(let z=-11;z<=11;z+=2)box(27,.008,.025,mat(0x3a4256),0,-.024,z);
 box(28,5,.35,wall,0,2.35,-12.5);box(.35,5,25,wall,-14,2.35,0);box(.35,5,25,wall,14,2.35,0);box(28,5,.35,wall,0,2.35,12.5);
 box(27.8,.12,.4,purple,0,3.25,-12.28);box(.4,.12,24.8,purple,-13.78,3.25,0);box(.4,.12,24.8,purple,13.78,3.25,0);
 for(let x=-9;x<=9;x+=4){box(2.3,1.5,.08,mat(0x42627f,.3),x,3.8,-12.28);box(2.35,.06,.1,metal,x,3.8,-12.18);box(.06,1.55,.1,metal,x,3.8,-12.18);}
 box(4,.9,1.2,wood,-8,.45,8);box(4,.1,1.25,purple,-8,.95,8);box(1.3,.55,.12,dark,-8,1.28,7.38);
 box(5,1.3,.16,dark,0,4.25,-12.25);box(4.8,.08,.2,purple,0,4.83,-12.1);
 const cv=document.createElement('canvas');cv.width=512;cv.height=128;const ctx=cv.getContext('2d');ctx.fillStyle='#15192b';ctx.fillRect(0,0,512,128);ctx.fillStyle='#aa94ff';ctx.font='bold 60px Arial';ctx.textAlign='center';ctx.fillText('IRON DISTRICT',256,82);const tex=new THREE.CanvasTexture(cv);const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.1),new THREE.MeshBasicMaterial({map:tex}));sign.position.set(0,4.25,-12.13);scene.add(sign);
 for(let x=-10;x<=10;x+=5){box(.12,.12,24,dark,x,4.83,0);const l=box(2,.07,.55,mat(0xe8eaff),x,4.68,0);l.material.emissive=new THREE.Color(0x6677bb);l.material.emissiveIntensity=.45;}
 for(let i=0;i<6;i++){const x=7+i*1.05;box(.85,2,.55,mat(i%2?0x59647a:0x46516a),x,1,10.5);box(.045,1.5,.03,metal,x+.24,1,10.19);}
 for(let x=-11;x<=-7;x+=2){box(1.2,1.1,.07,dark,x,3,-12.25);box(1.05,.06,.09,purple,x,3.5,-12.15);}
 // Entrance door and floor mat
 box(2.5,2.8,.1,mat(0x24344a),-8,1.4,12.28);box(2.4,.1,.15,purple,-8,2.82,12.15);
 box(3,.05,1.2,mat(0x111522),-8,0,11.4);
}
function addMachine(id,x,z,rot=0){
 const item=CATALOG.find(v=>v.id===id);if(!item)return;
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);
 const add=(w,h,d,m,px,py,pz)=>box(w,h,d,m,px,py,pz,g), cc=(rt,rb,h,m,px,py,pz)=>cyl(rt,rb,h,m,px,py,pz,g);
 const metal=mat(0x98a5b8,.3,.7),rubber=mat(0x11151e),purple=mat(0x805dff),seat=mat(0x252b3a),dark=mat(0x171c2b);
 if(id==='bench'){add(1.65,.12,.5,seat,0,.72,0);add(1.85,.1,.13,purple,0,.78,0);for(const xx of [-.58,.58]){add(.1,.68,.1,metal,xx,.35,0);add(.45,.08,.45,rubber,xx,.08,0);}for(const xx of [-.95,.95]){add(.1,1.55,.1,metal,xx,.78,-.25);cc(.07,.07,1.65,rubber,xx,1.35,-.25);}add(2.5,.08,.08,metal,0,1.48,-.25);}
 else if(id==='treadmill'){add(1.15,.15,2.2,rubber,0,.35,0);add(1.22,.08,2.25,metal,0,.43,0);for(const xx of [-.52,.52]){add(.08,1.1,.08,metal,xx,.8,-.88);add(.12,.1,.8,purple,xx,1.32,-.5);}add(1.15,.12,.25,dark,0,1.34,-.94);}
 else if(id==='dumbbell'){add(1.25,.09,.4,metal,0,.55,0);for(let i=0;i<3;i++){const xx=-.4+i*.4;cc(.13,.13,.22,rubber,xx,.72,0);cc(.08,.08,.4,metal,xx,.72,0);}for(const xx of [-.55,.55])add(.08,.5,.08,metal,xx,.28,0);}
 else if(id==='bike'){cc(.48,.48,.12,rubber,0,.65,.15);cc(.33,.33,.12,rubber,0,.65,-.85);add(.06,.85,.06,metal,0,1,-.15);add(.65,.09,.25,seat,0,1.38,-.15);add(.65,.07,.07,metal,0,1.72,-.75);add(.6,.08,.08,purple,0,1.72,-.75);}
 else if(id==='rack'){for(const xx of [-.8,.8]){add(.12,2.4,.12,metal,xx,1.2,0);add(.22,.08,.75,rubber,xx,.06,0);for(let y=.6;y<2.1;y+=.3)add(.16,.07,.16,purple,xx,y,0);}add(1.7,.1,.12,metal,0,2.25,0);add(1.7,.09,.12,purple,0,1.85,0);}
 else if(id==='cable'){for(const xx of [-.65,.65]){add(.1,2.2,.1,metal,xx,1.1,0);cc(.07,.07,.6,rubber,xx,2.1,0);}add(1.45,.12,.12,purple,0,2.2,0);add(1.2,.08,.1,metal,0,.12,0);add(.08,1.2,.08,metal,0,.8,-.05);}
 else if(id==='water'){add(.65,1.15,.55,mat(0x9bcbe7,.3),0,.58,0);add(.68,.1,.58,metal,0,1.2,0);add(.1,.28,.1,purple,.2,1.35,-.25);}
 else if(id==='mirror'){add(1.7,2.2,.08,mat(0x638ba1,.2,.4),0,1.1,0);add(1.8,.08,.12,metal,0,.05,.02);add(1.8,.08,.12,metal,0,2.2,.02);}
 else if(id==='locker'){for(let i=0;i<3;i++){add(.45,1.8,.5,mat(0x56647a),-.5+i*.5,.9,0);add(.03,1.3,.03,metal,-.35+i*.5,.95,-.26);}}
 else if(id==='plant'){cyl(.3,.38,.45,mat(0x8b6248),0,.22,0);for(let i=0;i<7;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.17,8,6),mat(i%2?0x399b69:0x267e54));leaf.scale.set(.7,1.6,.7);leaf.position.set(Math.sin(i*2.4)*.2,.65+Math.cos(i)*.16,Math.cos(i*2.4)*.2);g.add(leaf);}}
 else if(id==='speaker'){add(.7,1,.45,dark,0,.5,0);cc(.23,.23,.06,metal,0,.68,-.24);cc(.1,.1,.07,purple,0,.3,-.24);}
 else if(id==='rower'){add(.45,.12,2.1,rubber,0,.3,0);add(.3,.35,.35,seat,0,.55,.2);add(.08,.85,.08,metal,0,.65,-.85);add(.8,.08,.08,purple,0,1.08,-.85);}
 g.userData={kind:'equipment',id,name:item.name,desc:item.desc};equipment.push(g);colliders.push({x,z,r:.7});return g;
}
function createNpc(x,z,shirt=0x4283ba){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const skin=mat(0xd8a47a),pants=mat(0x222b3b),shoe=mat(0x10131a),top=mat(shirt);
 cyl(.22,.24,.68,top,0,1.06,0,g,12);const head=new THREE.Mesh(new THREE.SphereGeometry(.19,12,10),skin);head.position.y=1.55;head.castShadow=true;g.add(head);
 for(const xx of [-.12,.12]){box(.13,.58,.15,pants,xx,.34,0,g);box(.14,.1,.25,shoe,xx,.07,.04,g);}for(const xx of [-.28,.28])cyl(.07,.08,.48,skin,xx,1.08,0,g,10);
 g.userData={kind:'npc',name:['Alex','Sofía','Daniel','Valeria','Mateo','Camila','Leo','Andrea'][Math.floor(Math.random()*8)],desc:'Socio del gimnasio. Mantenerlo satisfecho ayuda a que renueve su membresía.'};
 g.userData.target=null;g.userData.think=Math.random()*3;g.userData.phase=Math.random()*6;g.userData.speed=.4+Math.random()*.35;npcs.push(g);return g;
}
function setup(){
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,100);renderer=new THREE.WebGLRenderer({canvas:$('gameCanvas'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;clock=new THREE.Clock();createRoom();player=new THREE.Group();player.position.set(0,0,5);scene.add(player);camera.position.set(0,1.65,0);player.add(camera);
 addMachine('bench',-3,1);addMachine('treadmill',2,-2,Math.PI);addMachine('dumbbell',-6,-2);addMachine('mirror',-10,-7);addMachine('water',6,7);addMachine('locker',9,10);
 const startNpcs=[[-2,-4,0x4d77b8],[5,1,0x39a987],[4,-5,0xb86c50],[-7,5,0x9d68b5],[8,-2,0xc69c42],[-1,7,0x4d77b8],[0,-7,0x39a987],[6,4,0xb86c50]];
 startNpcs.forEach(a=>createNpc(...a));
 addEventListener('resize',resize);addEventListener('keydown',keyDown);addEventListener('keyup',e=>keys[e.code]=false);
 $('gameCanvas').addEventListener('click',()=>{if(!modalOpen()&&!paused)$('gameCanvas').requestPointerLock();});
 document.addEventListener('pointerlockchange',()=>locked=document.pointerLockElement===$('gameCanvas'));
 document.addEventListener('mousemove',e=>{if(!locked||paused)return;yaw-=e.movementX*.0022;pitch-=e.movementY*.0022;pitch=Math.max(-1.2,Math.min(1.2,pitch));player.rotation.y=yaw;camera.rotation.x=pitch;});
 buildLeft();buildShop();buildStaff();updateUI();drawMaps();$('boot').classList.add('hidden');$('app').classList.remove('hidden');toast('¡Bienvenido! Haz clic en el gimnasio para jugar.');requestAnimationFrame(loop);
}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
function modalOpen(){return [...document.querySelectorAll('.modal')].some(m=>!m.classList.contains('hidden'));}
function openModal(id){$(id).classList.remove('hidden');if(locked)document.exitPointerLock();if(id==='mapModal')drawMaps();}
function closeModal(id){$(id).classList.add('hidden');}
function closeAll(){document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));paused=false;}
function keyDown(e){keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.repeat)return;
 if(e.code==='Escape'){if(modalOpen()){closeAll();return;}paused=!paused;paused?openModal('pauseModal'):closeModal('pauseModal');if(locked)document.exitPointerLock();return;}
 if(modalOpen()||paused)return;
 if(e.code==='KeyE')interact();if(e.code==='KeyB')openModal('shopModal');if(e.code==='KeyN')openModal('mapModal');if(e.code==='KeyJ')openModal('missionsModal');if(e.code==='KeyV')toggleView();if(e.code==='KeyM')marketing();if(e.code==='KeyC')cleanGym();
}
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);if(locked&&!modalOpen()&&!paused)movePlayer(dt);animateNpcs(dt);updateTarget();simulate(dt);drawMaps();renderer.render(scene,camera);}
function movePlayer(dt){const speed=(keys.ShiftLeft||keys.ShiftRight)?7:4.2;const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)),d=new THREE.Vector3();if(keys.KeyW||keys.ArrowUp)d.add(f);if(keys.KeyS||keys.ArrowDown)d.sub(f);if(keys.KeyD||keys.ArrowRight)d.add(r);if(keys.KeyA||keys.ArrowLeft)d.sub(r);if(d.lengthSq()){d.normalize().multiplyScalar(speed*dt);const nx=player.position.x+d.x,nz=player.position.z+d.z;if(Math.abs(nx)<12.8&&!colliders.some(c=>Math.hypot(nx-c.x,nz-c.z)<c.r))player.position.x=nx;if(Math.abs(nz)<11.2&&!colliders.some(c=>Math.hypot(player.position.x-c.x,nz-c.z)<c.r))player.position.z=nz;}}
function animateNpcs(dt){for(const n of npcs){n.userData.think-=dt;n.userData.phase+=dt;if(n.userData.think<=0){n.userData.think=2+Math.random()*5;n.userData.target=new THREE.Vector3(-10+Math.random()*20,0,-9+Math.random()*17);}if(n.userData.target){const d=n.userData.target.clone().sub(n.position);if(d.length()>.4){d.normalize();const nx=n.position.x+d.x*n.userData.speed*dt,nz=n.position.z+d.z*n.userData.speed*dt;if(Math.abs(nx)<12&&Math.abs(nz)<10&&!colliders.some(c=>Math.hypot(nx-c.x,nz-c.z)<c.r+.3)){n.position.x=nx;n.position.z=nz;}n.rotation.y=Math.atan2(d.x,d.z);}}n.position.y=Math.abs(Math.sin(n.userData.phase*3))*.025;}}
function updateTarget(){if(!locked||paused||modalOpen()){$('interactionPrompt').classList.add('hidden');return;}const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(0,0),camera);const hits=ray.intersectObjects([...equipment,...npcs],true);interactTarget=null;if(hits.length&&hits[0].distance<3.5){let o=hits[0].object;while(o.parent&&o.parent!==scene)o=o.parent;if(o.userData.kind)interactTarget=o;}if(interactTarget){$('interactionPrompt').classList.remove('hidden');$('promptText').textContent=interactTarget.userData.name||'Interactuar';}else $('interactionPrompt').classList.add('hidden');}
function interact(){if(interactTarget){const d=interactTarget.userData;if(d.kind==='npc'){state.reputation=Math.min(5,state.reputation+.03);state.satisfaction=Math.min(100,state.satisfaction+1);addFeed('👋','Has saludado a '+d.name);toast('¡Buen trato con '+d.name+'! + satisfacción');}else{state.xp+=5;toast('Revisaste '+d.name+'. +5 EXP');}updateUI();return;}if(Math.hypot(player.position.x+8,player.position.z-8)<3)openModal('shopModal');else toast('Acércate a una máquina o a un socio para interactuar.');}
function capacity(){return 8+state.equipment.reduce((a,id)=>a+(CATALOG.find(i=>i.id===id)?.cap||0),0);}
function simulate(dt){if(paused||modalOpen())return;simTimer+=dt;autoTimer+=dt;if(simTimer>5){simTimer=0;state.hour++;if(state.hour>=24){state.hour=6;state.day++;state.todayClients=0;}const capacityNow=capacity();const gain=Math.max(0,Math.floor(capacityNow*.12+state.reputation*.3+state.satisfaction*.025-state.members*.04));state.members=Math.min(capacityNow*4,state.members+gain);const income=state.members*3;state.money+=income;state.todayClients+=Math.min(state.members,Math.floor(Math.random()*4+1));state.xp+=Math.max(1,Math.floor(state.members/3));state.cleanliness=Math.max(15,state.cleanliness-(state.staff.cleaner?0.3:1.2));state.satisfaction=Math.max(25,Math.min(100,state.satisfaction+(state.staff.trainer?.5:0)+(state.staff.cleaner?.2:0)-(state.cleanliness<45?1.8:0)));state.energy=Math.max(15,state.energy-.4);
 for(const s of STAFF)if(state.staff[s.id])state.money-=s.salary;
 if(state.xp>=state.level*100){state.xp-=state.level*100;state.level++;state.reputation=Math.min(5,state.reputation+.15);state.money+=200;toast('¡Nivel '+state.level+'! Bonus de $200');addFeed('🏆','Has alcanzado el nivel '+state.level);}
 if(state.members>npcs.length&&npcs.length<16&&Math.random()<.5){const x=-9+Math.random()*18,z=-8+Math.random()*16;createNpc(x,z,[0x4d77b8,0x39a987,0xb86c50,0x9d68b5,0xc69c42][Math.floor(Math.random()*5)]);}
 updateUI();}
 if(autoTimer>35){autoTimer=0;save(false);} $('gameTime').textContent=`DÍA ${state.day} · ${String(state.hour).padStart(2,'0')}:00`;}
function updateUI(){ $('money').textContent=fmt(state.money);$('members').textContent=state.members;$('reputation').textContent='★ '+state.reputation.toFixed(1);$('dailyIncome').textContent=fmt(state.members*3);$('level').textContent=state.level;$('xpLabel').textContent=`${state.xp} / ${state.level*100} EXP`;$('xpBar').style.width=(state.xp/(state.level*100)*100)+'%';$('satisfaction').textContent=Math.round(state.satisfaction)+'%';$('satisfactionBar').style.width=state.satisfaction+'%';$('cleanliness').textContent=Math.round(state.cleanliness)+'%';$('cleanlinessBar').style.width=state.cleanliness+'%';$('energy').textContent=Math.round(state.energy)+'%';$('energyBar').style.width=state.energy+'%';$('shopBalance').textContent=fmt(state.money);
 const goals=[{n:10,t:'Consigue 10 socios',d:'Atrae clientes y mejora el gimnasio.'},{n:20,t:'Construye tu reputación',d:'Consigue 20 socios y amplía tus instalaciones.'},{n:35,t:'Centro de fitness popular',d:'Alcanza 35 socios y contrata personal.'},{n:60,t:'Imperio del fitness',d:'Llega a 60 socios para dominar el barrio.'}];const goal=goals.find(g=>state.members<g.n)||{n:100,t:'Leyenda del fitness',d:'Llega a 100 socios y conviértete en una leyenda.'};$('questTitle').textContent=goal.t;$('questDesc').textContent=goal.d;$('questBar').style.width=Math.min(100,state.members/goal.n*100)+'%';if(activeTab==='overview')buildLeftContent();}
function buildLeft(){document.querySelectorAll('.quick-action').forEach(b=>b.onclick=()=>{activeTab=b.dataset.tab;document.querySelectorAll('.quick-action').forEach(x=>x.classList.toggle('active',x===b));buildLeftContent();});buildLeftContent();}
function buildLeftContent(){const root=$('leftContent');root.innerHTML='';const div=document.createElement('div');div.className='quick-panel';
 if(activeTab==='overview'){div.innerHTML=`<div class="section-head"><b>RESUMEN DEL NEGOCIO</b><span class="eyebrow">HOY</span></div><div class="mini-cards"><div class="mini-card"><small>Clientes hoy</small><b>${state.todayClients}</b></div><div class="mini-card"><small>Equipos</small><b>${state.equipment.length}</b></div><div class="mini-card"><small>Personal</small><b>${Object.values(state.staff).filter(Boolean).length}</b></div><div class="mini-card"><small>Capacidad</small><b>${capacity()}</b></div></div><h3>Acciones rápidas</h3><div class="action-list"><button class="list-action" data-act="shop"><span>🏋</span><div><b>Comprar equipamiento</b><small>Mejora la capacidad y la reputación</small></div></button><button class="list-action" data-act="marketing"><span>📣</span><div><b>Campaña publicitaria</b><small>Cuesta $100 · atrae nuevos socios</small></div></button><button class="list-action" data-act="clean"><span>🧹</span><div><b>Limpiar el gimnasio</b><small>Recupera limpieza y satisfacción</small></div></button><button class="list-action" data-act="staff"><span>♟</span><div><b>Contratar personal</b><small>Entrenadores y servicios</small></div></button></div>`;}
 else if(activeTab==='build'){div.innerHTML=`<div class="section-head"><b>MODO CONSTRUCCIÓN</b><span class="eyebrow">EXPANDE</span></div><p class="muted">Compra equipamiento en la tienda. Las nuevas máquinas se colocan automáticamente en una zona libre del gimnasio.</p><button class="primary-btn full" data-act="shop">＋ Abrir catálogo</button><button class="secondary-btn full" data-act="clean">✦ Limpiar instalación</button><div class="statline"><span>Equipos instalados</span><b>${state.equipment.length}</b></div><div class="statline"><span>Capacidad total</span><b>${capacity()} personas</b></div><div class="statline"><span>Reputación</span><b>★ ${state.reputation.toFixed(1)}</b></div>`;}
 else if(activeTab==='staff'){div.innerHTML=`<div class="section-head"><b>GESTIÓN DE PERSONAL</b><span class="eyebrow">SERVICIOS</span></div><p class="muted">Contrata empleados para mantener el local limpio y mejorar la satisfacción. Cada empleado cobra un salario diario.</p><button class="primary-btn full" data-act="staff">＋ Contratar personal</button>${STAFF.map(s=>`<div class="statline"><span>${s.icon} ${s.name}</span><b>${state.staff[s.id]?'Contratado':'No contratado'}</b></div>`).join('')}`;}
 else{div.innerHTML=`<div class="section-head"><b>FINANZAS</b><span class="eyebrow">DÍA ${state.day}</span></div><div class="mini-cards"><div class="mini-card"><small>Saldo actual</small><b>${fmt(state.money)}</b></div><div class="mini-card"><small>Ingresos / día</small><b>${fmt(state.members*3)}</b></div><div class="mini-card"><small>Salarios / día</small><b>${fmt(STAFF.reduce((a,s)=>a+(state.staff[s.id]?s.salary:0),0))}</b></div><div class="mini-card"><small>Socios</small><b>${state.members}</b></div></div><h3>Recomendaciones</h3><p class="muted">${state.money<300?'Cuida tu saldo antes de comprar más máquinas.':'Invierte parte de tus ganancias en equipamiento y publicidad.'}</p><button class="primary-btn full" data-act="marketing">📣 Hacer campaña ($100)</button>`;}
 root.appendChild(div);root.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{const a=b.dataset.act;if(a==='shop')openModal('shopModal');if(a==='marketing')marketing();if(a==='clean')cleanGym();if(a==='staff')openModal('staffModal');});}
function buildShop(){renderShop();document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{shopCat=b.dataset.category;document.querySelectorAll('[data-category]').forEach(x=>x.classList.toggle('selected',x===b));renderShop();});}
function renderShop(){const root=$('shopGrid');root.innerHTML='';CATALOG.filter(i=>shopCat==='all'||i.cat===shopCat).forEach(item=>{const owned=state.owned[item.id]||0,card=document.createElement('article');card.className='shop-item';card.innerHTML=`<div class="shop-icon">${item.icon}</div><h3>${item.name}</h3><p>${item.desc}</p><div class="shop-meta">+${item.rep} reputación · ${item.cap?item.cap+' plazas':''}${owned?' · Tienes '+owned:''}</div><button ${state.money<item.price?'disabled':''}>Comprar · ${fmt(item.price)}</button>`;card.querySelector('button').onclick=()=>buyItem(item);root.appendChild(card);});}
function buyItem(item){if(state.money<item.price){toast('No tienes suficiente dinero.');return;}state.money-=item.price;state.owned[item.id]=(state.owned[item.id]||0)+1;state.equipment.push(item.id);state.reputation=Math.min(5,state.reputation+item.rep*.08);state.xp+=15;const spots=[[-10,-3,0],[-9,2,Math.PI/2],[-5,5,0],[0,5,Math.PI/2],[4,5,0],[8,5,Math.PI/2],[9,-3,Math.PI/2],[7,-7,0],[-8,-7,0],[0,-7,Math.PI/2],[10,0,0],[-10,0,0]];const s=spots[(state.equipment.length-7)%spots.length];addMachine(item.id,s[0],s[1],s[2]);renderShop();updateUI();drawMaps();toast('¡'+item.name+' instalado!');save(false);}
function buildStaff(){const root=$('staffGrid');root.innerHTML='';STAFF.forEach(s=>{const row=document.createElement('div');row.className='staff-row';row.innerHTML=`<div class="staff-icon">${s.icon}</div><div class="staff-info"><b>${s.name}</b><p>${s.desc}<br>Contratación ${fmt(s.price)} · Salario ${fmt(s.salary)}/día</p></div><button ${state.staff[s.id]?'disabled':''}>${state.staff[s.id]?'Contratado':'Contratar'}</button>`;row.querySelector('button').onclick=()=>{if(state.money<s.price){toast('No tienes suficiente dinero.');return;}state.money-=s.price;state.staff[s.id]=true;buildStaff();buildLeftContent();updateUI();toast('Has contratado: '+s.name);addFeed('♟',s.name+' se ha unido a tu equipo.');};root.appendChild(row);});}
function marketing(){if(state.money<100){toast('Necesitas $100 para una campaña.');return;}state.money-=100;const gained=Math.max(2,Math.floor(3+state.reputation*1.5));state.members+=gained;state.satisfaction=Math.min(100,state.satisfaction+2);state.xp+=20;state.marketingCount++;for(let i=0;i<Math.min(gained,3)&&npcs.length<18;i++)createNpc(-8+Math.random()*16,-8+Math.random()*15,[0x4d77b8,0x39a987,0xb86c50][i]);updateUI();addFeed('📣','Campaña publicitaria: +'+gained+' socios.');toast('¡Campaña exitosa! +'+gained+' socios.');}
function cleanGym(){state.cleanliness=100;state.satisfaction=Math.min(100,state.satisfaction+12);state.xp+=8;updateUI();addFeed('🧹','El gimnasio está limpio.');toast('Gimnasio limpio: satisfacción mejorada.');}
function toggleView(){camView=camView===1?3:1;if(camView===1){camera.position.set(0,1.65,0);camera.rotation.set(pitch,0,0);}else{camera.position.set(0,3.3,5.5);camera.rotation.set(-.25,0,0);}toast(camView===1?'Vista en primera persona':'Vista en tercera persona');}
function drawMaps(){drawMap($('minimap'),300,220);if(!$('mapModal').classList.contains('hidden'))drawMap($('bigMap'),850,560);}
function drawMap(canvas,w,h){if(!canvas)return;const c=canvas.getContext('2d');c.clearRect(0,0,w,h);c.fillStyle='#111a2d';c.fillRect(0,0,w,h);const sx=(w-28)/28,sz=(h-28)/25;c.strokeStyle='#606b82';c.lineWidth=3;c.strokeRect(14,14,w-28,h-28);c.strokeStyle='#ffffff12';c.lineWidth=1;for(let x=-12;x<=12;x+=2){c.beginPath();c.moveTo(w/2+x*sx,14);c.lineTo(w/2+x*sx,h-14);c.stroke();}for(let z=-10;z<=10;z+=2){c.beginPath();c.moveTo(14,h/2+z*sz);c.lineTo(w-14,h/2+z*sz);c.stroke();}
 const px=x=>w/2+x*sx,pz=z=>h/2+z*sz;
 c.fillStyle='#79543d';c.fillRect(px(-10),pz(8)-sz*.6,sx*4,sz*1.2);
 equipment.forEach(e=>{c.fillStyle='#f5bd62';c.fillRect(px(e.position.x)-4,pz(e.position.z)-4,8,8);});
 npcs.forEach(n=>{c.fillStyle='#41e6a3';c.beginPath();c.arc(px(n.position.x),pz(n.position.z),3.5,0,Math.PI*2);c.fill();});
 c.fillStyle='#ad94ff';c.beginPath();c.arc(px(player.position.x),pz(player.position.z),5,0,Math.PI*2);c.fill();c.strokeStyle='#ad94ff';c.lineWidth=2;c.beginPath();c.moveTo(px(player.position.x),pz(player.position.z));c.lineTo(px(player.position.x)-Math.sin(yaw)*12,pz(player.position.z)-Math.cos(yaw)*12);c.stroke();
 c.fillStyle='#b5c1d8';c.font=`${Math.max(8,w/50)}px Inter`;c.fillText('RECEPCIÓN',px(-10),pz(9.2));}
function addFeed(icon,msg){const root=$('eventFeed'),row=document.createElement('div');row.className='feed-item';row.innerHTML=`<span class="feed-icon">${icon}</span><span>${msg}</span><time>ahora</time>`;root.prepend(row);while(root.children.length>4)root.lastChild.remove();}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
function save(show=true){try{const data={...state};localStorage.setItem('gymTycoon3D-v2',JSON.stringify(data));if(show)toast('Partida guardada en este navegador.');}catch(e){if(show)toast('No se pudo guardar.');}}
function load(){try{const d=JSON.parse(localStorage.getItem('gymTycoon3D-v2'));if(d)Object.assign(state,d);}catch(e){}}
function reset(){localStorage.removeItem('gymTycoon3D-v2');location.reload();}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openModal(b.dataset.open));
$('saveBtn').onclick=()=>save(true);$('helpBtn').onclick=()=>openModal('helpModal');$('pauseBtn').onclick=()=>{paused=true;openModal('pauseModal');};$('resumeBtn').onclick=()=>{paused=false;closeModal('pauseModal');};$('pauseSaveBtn').onclick=()=>save(true);$('pauseSettingsBtn').onclick=()=>openModal('helpModal');$('mapExpand').onclick=()=>openModal('mapModal');$('brandHome').onclick=()=>{activeTab='overview';buildLeft();toast('Panel principal');};
$('soundBtn').onclick=()=>{soundOn=!soundOn;$('soundBtn').textContent=soundOn?'♫':'♩';toast(soundOn?'Sonido activado (ambiente visual)':'Sonido desactivado');};
$('confirmReset').onclick=reset;
document.querySelectorAll('.right-shortcuts button').forEach(b=>b.onclick=()=>openModal(b.dataset.open));
window.addEventListener('beforeunload',()=>save(false));
load();
try{setup();}catch(e){console.error(e);$('boot').innerHTML='<h2>No se pudo iniciar el juego</h2><p>Comprueba tu conexión a Internet y abre el proyecto desde un servidor local.</p><p>'+String(e.message||e)+'</p>';}
