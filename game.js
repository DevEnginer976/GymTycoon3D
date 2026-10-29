import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = id => document.getElementById(id);
const moneyFmt = n => '$' + Math.floor(n).toLocaleString('en-US');
const state = {
  money: 500, members: 0, reputation: 1, level: 1, xp: 0, satisfaction: 82,
  cleanliness: 100, day: 1, hour: 8, minute: 0, todayClients: 0,
  equipment: ['bench','treadmill','dumbbell'], owned: {}, lastIncome: 0, opened: 0
};
const catalog = [
  {id:'bench',name:'Press de banca',icon:'🏋️',price:180,desc:'Zona de fuerza para entrenar pecho y brazos.',capacity:4,rep:2},
  {id:'treadmill',name:'Cinta de correr',icon:'🏃',price:220,desc:'Cardio para mejorar la salud y atraer más socios.',capacity:5,rep:2},
  {id:'dumbbell',name:'Mancuernas',icon:'💪',price:120,desc:'Pesas versátiles para rutinas de fuerza.',capacity:4,rep:1},
  {id:'bike',name:'Bicicleta estática',icon:'🚴',price:260,desc:'Entrenamiento cardiovascular de bajo impacto.',capacity:4,rep:3},
  {id:'rack',name:'Jaula de sentadillas',icon:'🦾',price:450,desc:'Equipo avanzado para levantamientos pesados.',capacity:6,rep:5},
  {id:'cable',name:'Polea multifunción',icon:'🔩',price:520,desc:'Más variedad de ejercicios y mejor reputación.',capacity:6,rep:5},
  {id:'water',name:'Fuente de agua',icon:'💧',price:90,desc:'Aumenta la satisfacción de los miembros.',capacity:0,rep:2},
  {id:'mirror',name:'Espejos de pared',icon:'🪞',price:150,desc:'Un toque profesional para tu gimnasio.',capacity:0,rep:2},
  {id:'locker',name:'Taquillas',icon:'🗄️',price:300,desc:'Comodidad para tus socios y más capacidad.',capacity:3,rep:4}
];
let scene,camera,renderer,clock,raycaster,center = new THREE.Vector2(0,0);
let player, yaw=0, pitch=0, locked=false, keys={}, colliders=[], equipmentMeshes=[], membersMeshes=[];
let interactTarget=null, toastTimer, lastTick=0, autoSave=0, gymFloor;
const objects = new Map();

function mat(color, roughness=.8, metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness});}
function box(w,h,d,material,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(rt,rb,h,material,x,y,z,parent=scene,segments=16){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
function addCollider(mesh, radius=.65){colliders.push({x:mesh.position.x,z:mesh.position.z,r:radius});}
function createRoom(){
  scene.background=new THREE.Color(0x11182a);scene.fog=new THREE.Fog(0x11182a,24,60);
  const hemi=new THREE.HemisphereLight(0xc9d9ff,0x252033,2.0);scene.add(hemi);
  const light=new THREE.DirectionalLight(0xffeed7,2.8);light.position.set(-7,13,5);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-20;light.shadow.camera.right=20;light.shadow.camera.top=20;light.shadow.camera.bottom=-20;scene.add(light);
  const floorMat=mat(0x252c3d,.95), wallMat=mat(0x32394b), dark=mat(0x171d2b), purple=mat(0x7d5cff), metal=mat(0x8994a8,.35,.7), rubber=mat(0x11141c), wood=mat(0x79533d);
  gymFloor=box(28,.3,25,floorMat,0,-.18,0);gymFloor.receiveShadow=true;
  // Rubber training zones and floor strips
  for(let x=-11;x<=11;x+=2){box(.035,.012,24,mat(0x394154),x,-.015,0);}
  for(let z=-10;z<=10;z+=2){box(27,.012,.035,mat(0x394154),0,-.014,z);}
  // Enclosing walls
  box(28,5,.35,wallMat,0,2.3,-12.5);box(.35,5,25,wallMat,-14,2.3,0);box(.35,5,25,wallMat,14,2.3,0);
  box(28,5,.35,wallMat,0,2.3,12.5);
  // Purple wall stripe
  box(27.8,.12,.38,purple,0,3.3,-12.3);box(.38,.12,24.8,purple,-13.8,3.3,0);box(.38,.12,24.8,purple,13.8,3.3,0);
  // windows on back wall
  for(let x=-9;x<=9;x+=4){box(2.3,1.55,.08,mat(0x42617c,.3),x,3.8,-12.25);box(2.35,.07,.12,metal,x,3.8,-12.17);box(.07,1.6,.12,metal,x,3.8,-12.17);}
  // reception desk
  box(4,.95,1.2,wood,-8,.48,8);box(4,.1,1.25,purple,-8,1.02,8);box(1.4,.6,.15,mat(0x121625),-8,1.35,7.4);
  // logo wall sign
  box(5,1.3,.18,dark,0,4.25,-12.25);box(4.7,.08,.22,purple,0,4.85,-12.08);
  const signCanvas=document.createElement('canvas');signCanvas.width=512;signCanvas.height=128;const ctx=signCanvas.getContext('2d');
  ctx.fillStyle='#15192b';ctx.fillRect(0,0,512,128);ctx.fillStyle='#a991ff';ctx.font='bold 62px Arial';ctx.textAlign='center';ctx.fillText('IRON DISTRICT',256,83);
  const tex=new THREE.CanvasTexture(signCanvas);const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.5,1.1),new THREE.MeshBasicMaterial({map:tex}));sign.position.set(0,4.25,-12.13);scene.add(sign);
  // ceiling beams and lights
  for(let x=-10;x<=10;x+=5){box(.12,.12,24,dark,x,4.85,0);const lamp=box(2.2,.07,.6,mat(0xe4e8ff,0.4),x,4.72,0);lamp.material.emissive=new THREE.Color(0x6677aa);lamp.material.emissiveIntensity=.45;}
  // lockers
  for(let i=0;i<6;i++){const x=7+i*1.05;box(.85,2,.55,mat(i%2?0x58647b:0x47526a),x,1,10.5);box(.055,1.5,.03,metal,x+.25,1,10.19);cylinder(.04,.04,.05,metal,x+.22,.95,10.15);}
  // wall decorations
  for(let x=-11;x<=-7;x+=2){box(1.2,1.1,.07,dark,x,3,-12.25);box(1.05,.06,.09,purple,x,3.5,-12.15);}
}
function makeEquipment(item,x,z,rotation=0){
  const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rotation;scene.add(group);
  const metal=mat(0x8d9bb1,.35,.7), rubber=mat(0x11151f), purple=mat(0x805dff), seat=mat(0x252b3a), dark=mat(0x171d2b);
  const add=(w,h,d,m,px,py,pz)=>box(w,h,d,m,px,py,pz,group);
  const cyl=(rt,rb,h,m,px,py,pz)=>cylinder(rt,rb,h,m,px,py,pz,group);
  if(item.id==='bench'){
    add(1.65,.12,.5,seat,0,.72,0);add(1.85,.12,.13,purple,0,.78,0);
    for(const x0 of [-.58,.58]){add(.1,.68,.1,metal,x0,.35,0);add(.45,.08,.45,rubber,x0,.08,0);}
    for(const x0 of [-.95,.95]){add(.1,1.55,.1,metal,x0,.78,-.25);cyl(.07,.07,1.65,rubber,x0,1.35,-.25);}
    add(2.5,.08,.08,metal,0,1.48,-.25);
  } else if(item.id==='treadmill'){
    add(1.15,.15,2.2,rubber,0,.35,0);add(1.22,.09,2.25,metal,0,.43,0);
    for(const x0 of [-.52,.52]){add(.08,1.1,.08,metal,x0,.8,-.88);add(.12,.1,.8,purple,x0,1.32,-.5);}
    add(1.15,.12,.25,dark,0,1.34,-.94);
  } else if(item.id==='dumbbell'){
    add(1.25,.09,.4,metal,0,.55,0);
    for(let i=0;i<3;i++){const xx=-.4+i*.4;cyl(.13,.13,.22,rubber,xx,.72,0);cyl(.08,.08,.4,metal,xx,.72,0);}
    for(let x0 of [-.55,.55]){add(.08,.5,.08,metal,x0,.28,0);}
  } else if(item.id==='bike'){
    cyl(.48,.48,.12,rubber,0,.65,.15);cyl(.33,.33,.12,rubber,0,.65,-.85);
    add(.06,.85,.06,metal,0,1,-.15);add(.65,.09,.25,seat,0,1.38,-.15);add(.65,.07,.07,metal,0,1.72,-.75);
    add(.6,.08,.08,purple,0,1.72,-.75);add(.08,.1,.5,metal,0,.75,-.35);
  } else if(item.id==='rack'){
    for(const x0 of [-.8,.8]){add(.12,2.4,.12,metal,x0,1.2,0);add(.22,.08,.75,rubber,x0,.06,0);for(let y=0.6;y<2.1;y+=.3)add(.16,.07,.16,purple,x0,y,0);}
    add(1.7,.1,.12,metal,0,2.25,0);add(1.7,.09,.12,purple,0,1.85,0);
  } else if(item.id==='cable'){
    for(const x0 of [-.65,.65]){add(.1,2.2,.1,metal,x0,1.1,0);cyl(.07,.07,.6,rubber,x0,2.1,0);}
    add(1.45,.12,.12,purple,0,2.2,0);add(1.2,.08,.1,metal,0,.12,0);
    add(.08,1.2,.08,metal,0,.8,-.05);cyl(.12,.12,.2,rubber,0,.9,-.05);
  } else if(item.id==='water'){
    add(.65,1.15,.55,mat(0x9bcbe7,.3),0,.58,0);add(.68,.1,.58,metal,0,1.2,0);add(.1,.28,.1,purple,.2,1.35,-.25);
  } else if(item.id==='mirror'){
    add(1.7,2.2,.08,mat(0x638ba1,.2,.4),0,1.1,0);add(1.8,.08,.12,metal,0,.05,.02);add(1.8,.08,.12,metal,0,2.2,.02);
  } else if(item.id==='locker'){
    for(let i=0;i<3;i++){add(.45,1.8,.5,mat(0x56647a),-.5+i*.5,.9,0);add(.03,1.3,.03,metal,-.35+i*.5,.95,-.26);}
  }
  group.userData={kind:'equipment',itemId:item.id,name:item.name,description:item.desc};
  equipmentMeshes.push(group);objects.set(group.uuid,group);
  return group;
}
function createMember(x,z,shirtColor){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  const skin=mat(0xd9a77d), shirt=mat(shirtColor), pants=mat(0x242b3b), shoe=mat(0x11131a);
  cylinder(.22,.23,.65,shirt,0,1.08,0,g,12);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.19,12,10),skin);head.position.y=1.58;head.castShadow=true;g.add(head);
  for(const sx of [-.12,.12]){box(.13,.58,.15,pants,sx,.34,0,g);box(.14,.1,.25,shoe,sx,.07,.04,g);}
  for(const sx of [-.28,.28]){cylinder(.07,.08,.5,skin,sx,1.08,0,g,10);}
  g.userData={kind:'member',name:'Socio del gimnasio',description:'Un miembro está entrenando y pagando su cuota.'};
  membersMeshes.push(g);return g;
}
function setupPlayer(){
  player=new THREE.Group();player.position.set(0,0,5);scene.add(player);
  camera.position.set(0,1.65,0);player.add(camera);camera.rotation.order='YXZ';
}
function init(){
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,100);
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  document.body.appendChild(renderer.domElement);clock=new THREE.Clock();raycaster=new THREE.Raycaster();
  createRoom();setupPlayer();
  // Starter equipment and first members
  makeEquipment(catalog[0],-3,1);makeEquipment(catalog[1],2,-2,Math.PI);makeEquipment(catalog[2],-6,-2);
  // Recreate purchased equipment after loading a saved game.
  if(state.equipment.length>3){
    const savedExtras=state.equipment.slice(3);
    const spots=[[-10,-3,0],[-9,2,Math.PI/2],[-5,5,0],[0,5,Math.PI/2],[4,5,0],[8,5,Math.PI/2],[9,-3,Math.PI/2],[7,-7,0],[-8,-7,0],[0,-7,Math.PI/2],[10,0,0],[-10,0,0]];
    savedExtras.forEach((id,i)=>{const item=catalog.find(v=>v.id===id);if(item){const spot=spots[i%spots.length];makeEquipment(item,spot[0],spot[1],spot[2]);colliders.push({x:spot[0],z:spot[1],r:.85});}});
  }
  createMember(-2,-4,0x4d77b8);createMember(5,1,0x39a987);createMember(4,-5,0xb86c50);
  addEventListener('resize',onResize);addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.repeat)return;onKey(e);});
  addEventListener('keyup',e=>keys[e.code]=false);
  renderer.domElement.addEventListener('click',()=>{if(!anyModalOpen())renderer.domElement.requestPointerLock();});
  document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===renderer.domElement;});
  document.addEventListener('mousemove',e=>{if(!locked)return;yaw-=e.movementX*.0022;pitch-=e.movementY*.0022;pitch=Math.max(-1.25,Math.min(1.25,pitch));player.rotation.y=yaw;camera.rotation.x=pitch;});
  $('loading').style.display='none';$('game').style.display='block';
  populateShop();updateUI();toast('¡Bienvenido! Tu gimnasio ya está abierto.');
  requestAnimationFrame(animate);
}
function onResize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
function anyModalOpen(){return !['shopModal','menuModal','interactModal'].every(id=>$(id).classList.contains('hidden'));}
function onKey(e){
  if(e.code==='Escape'){if(locked)document.exitPointerLock();else closeAll();return;}
  if(anyModalOpen())return;
  if(e.code==='KeyB')openShop();
  if(e.code==='KeyM')marketing();
  if(e.code==='KeyC')cleanGym();
  if(e.code==='KeyE')interact();
}
function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
  if(locked&&!anyModalOpen())movePlayer(dt);
  updateTarget();simulate(dt);renderer.render(scene,camera);
}
function movePlayer(dt){
  const speed=(keys.ShiftLeft||keys.ShiftRight)?7:4.2;
  const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const move=new THREE.Vector3();
  if(keys.KeyW||keys.ArrowUp)move.add(forward);if(keys.KeyS||keys.ArrowDown)move.sub(forward);
  if(keys.KeyD||keys.ArrowRight)move.add(right);if(keys.KeyA||keys.ArrowLeft)move.sub(right);
  if(move.lengthSq()>0){move.normalize().multiplyScalar(speed*dt);const nx=player.position.x+move.x,nz=player.position.z+move.z;
    if(Math.abs(nx)<12.8&&!colliders.some(c=>Math.hypot(nx-c.x,nz-c.z)<c.r))player.position.x=nx;
    if(Math.abs(nz)<11.2&&!colliders.some(c=>Math.hypot(player.position.x-c.x,nz-c.z)<c.r))player.position.z=nz;
  }
}
function updateTarget(){
  if(!locked){$('prompt').style.display='none';return;}
  raycaster.setFromCamera(center,camera);
  const hits=raycaster.intersectObjects([...equipmentMeshes,...membersMeshes],true);
  let target=null;
  if(hits.length&&hits[0].distance<3.2){let o=hits[0].object;while(o.parent&&o.parent!==scene)o=o.parent;if(o.userData.kind)target=o;}
  interactTarget=target;
  if(target){$('prompt').style.display='block';$('prompt').innerHTML='Pulsa <b>E</b> para interactuar con '+(target.userData.name||'equipo');}
  else $('prompt').style.display='none';
}
function interact(){
  if(interactTarget){const d=interactTarget.userData;$('interactTitle').textContent=d.name||'Gimnasio';$('interactText').textContent=d.description||'Todo en orden.';const a=$('interactActions');a.innerHTML='';
    const btn=document.createElement('button');btn.className='interact-action';btn.textContent=d.kind==='equipment'?'Revisar equipo (+5 EXP)':'Saludar al socio (+2 reputación)';btn.onclick=()=>{if(d.kind==='equipment'){state.xp+=5;toast('Equipo revisado: +5 EXP');}else{state.reputation+=.02;toast('¡Buen trato con tus clientes!');}updateUI();closeAll();};a.appendChild(btn);openModal('interactModal');}
  else if(player.position.distanceTo(new THREE.Vector3(-8,0,8))<3)openShop();
  else toast('Acércate a una máquina o a un socio para interactuar.');
}
function simulate(dt){
  lastTick+=dt;autoSave+=dt;
  if(lastTick>5){lastTick=0;state.hour+=1;if(state.hour>=24){state.hour=6;state.day++;state.todayClients=0;}
    const capacity=capacityTotal();const newMembers=Math.max(0,Math.floor((capacity*0.25+state.reputation*.12+state.satisfaction*.04)-state.members*.08));
    state.members=Math.min(100,Math.max(state.members,state.members+newMembers));
    const income=state.members*3;state.money+=income;state.lastIncome=income;state.xp+=Math.max(1,Math.floor(state.members/2));state.todayClients+=Math.min(state.members,Math.floor(Math.random()*4+1));
    state.cleanliness=Math.max(15,state.cleanliness-1.5);state.satisfaction=Math.max(30,Math.min(100,state.satisfaction-(state.cleanliness<50?2:0)+.2));
    if(state.xp>=state.level*100){state.xp-=state.level*100;state.level++;state.reputation+=.5;state.money+=150;toast('¡Subiste al nivel '+state.level+'! Bonus de $150');}
    spawnMembersIfNeeded();updateUI();
  }
  if(autoSave>45){autoSave=0;saveGame(false);}
  $('clock').textContent=`DÍA ${state.day} · ${String(state.hour).padStart(2,'0')}:00`;
}
function capacityTotal(){return 8+state.equipment.reduce((n,id)=>n+(catalog.find(i=>i.id===id)?.capacity||0),0);}
function spawnMembersIfNeeded(){
  const target=Math.min(8,2+Math.floor(state.members/3));
  while(membersMeshes.length<target){const x=-9+Math.random()*18,z=-8+Math.random()*15;createMember(x,z,[0x4d77b8,0x39a987,0xb86c50,0x9d68b5,0xc69c42][Math.floor(Math.random()*5)]);}
}
function updateUI(){
  $('money').textContent=moneyFmt(state.money);$('members').textContent=state.members;$('rep').textContent='★ '+state.reputation.toFixed(1);$('income').textContent=moneyFmt(state.members*3);
  $('level').textContent=state.level;$('xp').textContent=state.xp;$('xpNext').textContent=state.level*100;$('xpBar').style.width=(state.xp/(state.level*100)*100)+'%';
  $('satisfaction').textContent=Math.round(state.satisfaction)+'%';$('satisfactionBar').style.width=state.satisfaction+'%';$('equipmentCount').textContent=state.equipment.length;$('todayClients').textContent=state.todayClients;$('cleanliness').textContent=Math.round(state.cleanliness)+'%';
  $('shopMoney').textContent=moneyFmt(state.money);
  const goals=[{n:5,t:'Consigue tus primeros socios',d:'Llega a 5 miembros para demostrar que tu gimnasio funciona.'},{n:12,t:'Haz crecer tu comunidad',d:'Llega a 12 miembros y mejora el equipamiento.'},{n:25,t:'Conviértete en referente',d:'Consigue 25 miembros para alcanzar una nueva meta.'},{n:50,t:'Una potencia del fitness',d:'Llega a 50 miembros y sigue ampliando el local.'}];
  const goal=goals.find(g=>state.members<g.n)||{n:100,t:'Domina la ciudad',d:'Llega a 100 miembros y conviértete en una leyenda.'};
  const prev=goals[goals.indexOf(goal)-1]?.n||0;$('questTitle').textContent=goal.t;$('questDesc').textContent=goal.d;$('questBar').style.width=Math.min(100,(state.members-prev)/(goal.n-prev)*100)+'%';
  $('tipText').textContent=state.cleanliness<50?'¡Limpia el gimnasio! La suciedad reduce la satisfacción.':state.members<5?'Atrae miembros con una campaña publicitaria y compra más equipos.':state.money>400?'¡Buen trabajo! Invierte en nuevas máquinas para subir tu reputación.':'Controla los gastos y mantén a tus socios contentos.';
}
function populateShop(){
  const root=$('shopItems');root.innerHTML='';
  for(const item of catalog){const owned=state.owned[item.id]||0;const card=document.createElement('div');card.className='shop-item';
    card.innerHTML=`<div class="item-icon">${item.icon}</div><h3>${item.name}</h3><p>${item.desc}</p><div class="item-meta">+${item.rep} reputación · ${item.capacity?item.capacity+' plazas':''}${owned?' · Tienes '+owned:''}</div><button class="buy-btn" ${state.money<item.price?'disabled':''}>Comprar · ${moneyFmt(item.price)}</button>`;
    card.querySelector('button').onclick=()=>buyItem(item);root.appendChild(card);}
}
function buyItem(item){
  if(state.money<item.price){toast('No tienes suficiente dinero.');return;}
  state.money-=item.price;state.owned[item.id]=(state.owned[item.id]||0)+1;state.equipment.push(item.id);state.reputation+=item.rep*.1;state.xp+=15;
  const spot=findPlacement(item.id);const mesh=makeEquipment(item,spot.x,spot.z,spot.rot||0);colliders.push({x:spot.x,z:spot.z,r:.85});
  populateShop();updateUI();toast('¡Compraste '+item.name+'!');saveGame(false);
}
function findPlacement(id){
  const spots=[[-10,-3,0],[-9,2,Math.PI/2],[-5,5,0],[0,5,Math.PI/2],[4,5,0],[8,5,Math.PI/2],[9,-3,Math.PI/2],[7,-7,0],[-8,-7,0],[0,-7,Math.PI/2],[10,0,0],[-10,0,0]];
  const s=spots[(state.equipment.length-3)%spots.length];return{x:s[0],z:s[1],rot:s[2]};
}
function openShop(){populateShop();openModal('shopModal');if(locked)document.exitPointerLock();}
function marketing(){if(state.money<100){toast('Necesitas $100 para una campaña.');return;}state.money-=100;state.members=Math.min(100,state.members+Math.floor(3+state.reputation*1.2));state.satisfaction=Math.min(100,state.satisfaction+2);state.xp+=20;spawnMembersIfNeeded();updateUI();toast('¡Campaña exitosa! Nuevos miembros se han unido.');}
function cleanGym(){state.cleanliness=100;state.satisfaction=Math.min(100,state.satisfaction+12);state.xp+=8;updateUI();toast('Gimnasio limpio. Satisfacción mejorada.');}
function openModal(id){$(id).classList.remove('hidden');if(locked)document.exitPointerLock();}
function closeAll(){document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
function saveGame(show=true){
  const save={...state};try{localStorage.setItem('gymTycoon3DSave',JSON.stringify(save));if(show)toast('Partida guardada correctamente.');}catch(e){if(show)toast('No se pudo guardar la partida.');}
}
function loadGame(){
  try{const raw=localStorage.getItem('gymTycoon3DSave');if(raw){const data=JSON.parse(raw);Object.assign(state,data);return true;}}catch(e){}
  return false;
}
function resetGame(){if(!confirm('¿Seguro que quieres borrar tu partida y empezar de cero?'))return;localStorage.removeItem('gymTycoon3DSave');location.reload();}
$('buildBtn').onclick=openShop;$('marketingBtn').onclick=marketing;$('cleanBtn').onclick=cleanGym;$('saveBtn').onclick=()=>saveGame(true);$('resetBtn').onclick=resetGame;
$('menuBtn').onclick=()=>openModal('menuModal');$('resumeBtn').onclick=closeAll;$('menuSaveBtn').onclick=()=>{saveGame(true);closeAll();};$('menuShopBtn').onclick=()=>{closeAll();openShop();};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).classList.add('hidden'));
loadGame();
try{init();}catch(err){console.error(err);$('loading').innerHTML='<h1>No se pudo iniciar el juego</h1><p>Comprueba que tienes conexión a internet y abre el proyecto desde un servidor web.</p><p>'+String(err.message||err)+'</p>';}
