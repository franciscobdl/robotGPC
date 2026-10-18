
// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;
var cameraTop;
const clock = new THREE.Clock();


// Piezas a animar
let robot;
let base;
let brazo;
let antebrazo;
let pinzaDe;
let pinzaIz;
let mano;

// Material
let material;
let materials;
let materialPhong;
let materialLamb;
let pisoMaterial;
let reflectiveMaterial;
  
// interface gui
var controls = {
  giro_base: 0,
  giro_brazo: 0,
  giro_antebrazo_y: 0,
  giro_antebrazo_z: 0,
  giro_pinza: 0,
  separacion_pinza: 10,
  alambres: false,

  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  speed: 60,

  anima: function(){
    const speed = 3000;

    const baseMov = new TWEEN.Tween( base.rotation ).to( {y:-63 / 180 * Math.PI}, speed );
    const brazoMov = new TWEEN.Tween( brazo.rotation ).to( {z:-40 / 180 * Math.PI}, speed );
    const antebrazoMovZ = new TWEEN.Tween( antebrazo.rotation ).to( {z:-90 / 180 * Math.PI}, speed );
    const antebrazoMovY = new TWEEN.Tween( antebrazo.rotation ).to( {y:0}, speed );
    const pinzaMov = new TWEEN.Tween( mano.rotation ).to( {z:44 / 180 * Math.PI}, speed );

    const abrePinzaIz = new TWEEN.Tween( pinzaIz.position ).to( {z:15}, speed );
    const abrePinzaDe = new TWEEN.Tween( pinzaDe.position ).to( {z:-15}, speed );

    const cierraPinzaIz = new TWEEN.Tween( pinzaIz.position ).to( {z:10}, speed );
    const cierraPinzaDe = new TWEEN.Tween( pinzaDe.position ).to( {z:-10}, speed );

    const baseVuelve = new TWEEN.Tween( base.rotation ).to( {y:0}, speed );
    const brazoVuelve = new TWEEN.Tween( brazo.rotation ).to( {z:0}, speed );
    const antebrazoVuelveZ = new TWEEN.Tween( antebrazo.rotation ).to( {z:0}, speed );
    const antebrazoVuelveY = new TWEEN.Tween( antebrazo.rotation ).to( {y:0}, speed );
    const pinzaVuelve = new TWEEN.Tween( mano.rotation ).to( {z:0}, speed );

    abrePinzaIz.chain(cierraPinzaIz);
    abrePinzaDe.chain(cierraPinzaDe);
    cierraPinzaDe.chain(baseVuelve, brazoVuelve, antebrazoVuelveZ, antebrazoVuelveY, pinzaVuelve);


    baseMov.start();
    brazoMov.start();
    antebrazoMovZ.start();
    antebrazoMovY.start();
    pinzaMov.start();
    abrePinzaIz.start();
    abrePinzaDe.start();

    baseMov.onComplete( function() {
      controls.giro_base = -63;
      controls.giro_brazo = -40;
      controls.giro_antebrazo_z = -90;
      controls.giro_antebrazo_y = 0;
      controls.giro_pinza = 44;
      controls.separacion_pinza = 15;
    });

    cierraPinzaDe.onComplete( function(){
      controls.separacion_pinza = 10
    });

    baseVuelve.onComplete( function(){
      controls.giro_base = 0;
      controls.giro_brazo = 0;
      controls.giro_antebrazo_z = 0;
      controls.giro_antebrazo_y = 0;
      controls.giro_pinza = 0;
      controls.separacion_pinza = 10;
    });
  }
};

// Event listeners para controles
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            controls.moveForward = true;
            break;
        case 'ArrowDown':
            controls.moveBackward = true;
            break;
        case 'ArrowLeft':
            controls.moveLeft = true;
            break;
        case 'ArrowRight':
            controls.moveRight = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            controls.moveForward = false;
            break;
        case 'ArrowDown':
            controls.moveBackward = false;
            break;
        case 'ArrowLeft':
            controls.moveLeft = false;
            break;
        case 'ArrowRight':
            controls.moveRight = false;
            break
    }
});

// 1-inicializa 
init();
// 2-Crea una escena
loadScene();
// 3-renderiza
render();

function init()
{
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0xFFFFFF) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 5000 );
  camera.position.set( 200, 300, 400 );


  // vista de planta
  cameraTop = new THREE.OrthographicCamera( -100, 100, 100,-100, 1, 1000 );
  cameraTop.position.set(0,500,0);
  cameraTop.up.set( 0, 0, -1 );
  cameraTop.lookAt( 0, 0, 0 );
  cameraTop.updateProjectionMatrix();  

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  // interface de usuario
  var gui = new dat.GUI();

  var gui_control = gui.addFolder('Control Robot');
  gui_control.add(controls, 'giro_base', -180, 180).name("Giro Base").listen();
  gui_control.add(controls, 'giro_brazo', -45, 45).name("Giro Brazo").listen();
  gui_control.add(controls, 'giro_antebrazo_y', -180, 180).name("Giro Antebrazo Y").listen();
  gui_control.add(controls, 'giro_antebrazo_z', -90, 90).name("Giro Antebrazo Z").listen();
  gui_control.add(controls, 'giro_pinza', -40, 220).name("Giro Pinza").listen();
  gui_control.add(controls, 'separacion_pinza', 0, 15).name("Separación Pinza").listen();
  gui_control.add(controls, 'alambres').name("Alambres");
  gui_control.add(controls, 'anima').name("Anima")
  gui_control.open();

  window.addEventListener('resize', updateAspectRatio );


}


function loadScene()
{

    // Cargar la textura
    const textureLoader = new THREE.TextureLoader();
    // const texture_sphere = textureLoader.load('images/wood512.jpg'); 
    
    const texturaSuelo = textureLoader.load('images/pisometalico_1024.jpg');
    const texturaMetal = textureLoader.load('images/metal_128.jpg') 
    // Modos de repetición
    texturaSuelo.wrapS = THREE.RepeatWrapping;  
    texturaSuelo.wrapT = THREE.RepeatWrapping;  
    // MirroredRepeatWrapping
    // RepeatWrapping
    // ClampToEdgeWrapping
    texturaSuelo.repeat.set(5, 5);  // Repetir la textura

    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const cubemap = cubeTextureLoader.load([
      'images/posx.jpg', 
      'images/negx.jpg', 
        'images/posy.jpg', 
        'images/negy.jpg', 
        'images/posz.jpg',  
        'images/negz.jpg' 
    ], 
        function (texture) {
            console.log('Cubemap cargado correctamente.');
        }, 
        undefined, 
        function (error) {
            console.error('Error al cargar el cubemap', error);
        }
    );
    
    // Crear un skybox: un gran cubo invertido
    // Cargar las seis texturas individualmente para el skybox
    materials = [
      new THREE.MeshBasicMaterial({ map: textureLoader.load('images/posx.jpg'), side: THREE.BackSide }), 
      new THREE.MeshBasicMaterial({ map: textureLoader.load('images/negx.jpg'), side: THREE.BackSide }), 
        new THREE.MeshBasicMaterial({ map: textureLoader.load('images/posy.jpg'), side: THREE.BackSide }), 
        new THREE.MeshBasicMaterial({ map: textureLoader.load('images/negy.jpg'), side: THREE.BackSide }), 
        new THREE.MeshBasicMaterial({ map: textureLoader.load('images/posz.jpg'), side: THREE.BackSide }), 
        new THREE.MeshBasicMaterial({ map: textureLoader.load('images/negz.jpg'), side: THREE.BackSide })  
    ];

    materialLamb = new THREE.MeshLambertMaterial({map: texturaMetal});
    materialPhong = new THREE.MeshPhongMaterial({specular:0x444444 , shininess:100, map: texturaMetal});
    material = new THREE.MeshPhongMaterial({color: 0x00ff00, specular:0xFAAFAA , shininess:100});
    reflectiveMaterial = new THREE.MeshPhongMaterial({ envMap: cubemap });
    pisoMaterial = new THREE.MeshStandardMaterial({ map: texturaSuelo });


    const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000); // Un cubo grande
    const skybox = new THREE.Mesh(skyboxGeometry, materials);
    skybox.position.y = 490;

    scene.add(skybox);

        
    // Robot BANDEJA
    robot = new THREE.Object3D();

    scene.add(robot);

    // Base
    let geometriaBase = new THREE.CylinderGeometry(50, 50, 15, 32);
    base = new THREE.Mesh(geometriaBase, materialLamb);

    base.position.y = 7.5;
    robot.add(base);

    //Brazo BANDEJA

    brazo = new THREE.Object3D();

    base.add(brazo);

    // Eje
    let geometriaEje = new THREE.CylinderGeometry(20, 20, 18, 32);
    let eje = new THREE.Mesh(geometriaEje, materialLamb);

    eje.position.y = 0;
    eje.rotation.x = Math.PI / 2;
    brazo.add(eje);

    // Esparrago
    let geometriaEsparrago = new THREE.BoxGeometry(18, 120, 12);
    let esparrago = new THREE.Mesh(geometriaEsparrago, materialLamb);

    esparrago.position.y = 60;
    brazo.add(esparrago);

    // Rotula
    let geometriaRotula = new THREE.SphereGeometry(20, 20, 20);

    let rotula = new THREE.Mesh(geometriaRotula, reflectiveMaterial);

    rotula.position.y = 120;
    brazo.add(rotula);

    // Antebrazo BANDEJA

    antebrazo = new THREE.Object3D();

    antebrazo.position.y = 120;
    brazo.add(antebrazo);

    // Disco
    let geometriaDisco = new THREE.CylinderGeometry(22, 22, 6, 32);
    let disco = new THREE.Mesh(geometriaDisco, materialLamb);

    disco.position.y = 0;
    antebrazo.add(disco);

    // Nervios
    let geometriaNervio = new THREE.BoxGeometry(4, 80, 4);
    let nervio1 = new THREE.Mesh(geometriaNervio, materialPhong);

    nervio1.position.y = 43;
    nervio1.position.x = 8;
    nervio1.position.z = 8;

    antebrazo.add(nervio1);

    let nervio2 = new THREE.Mesh(geometriaNervio, materialPhong);

    nervio2.position.y = 43;
    nervio2.position.x = -8;
    nervio2.position.z = 8;

    antebrazo.add(nervio2);

    let nervio3 = new THREE.Mesh(geometriaNervio, materialPhong);

    nervio3.position.y = 43;
    nervio3.position.x = 8;
    nervio3.position.z = -8;

    antebrazo.add(nervio3);

    let nervio4 = new THREE.Mesh(geometriaNervio, materialPhong);

    nervio4.position.y = 43;
    nervio4.position.x = -8;
    nervio4.position.z = -8;

    antebrazo.add(nervio4);

    // Mano BANDEJA Palma
    mano = new THREE.Object3D();

    mano.position.y = 80;
    antebrazo.add(mano);

    // Palma
    let geometriaPalma = new THREE.CylinderGeometry(15, 15, 40, 32);
    let palma = new THREE.Mesh(geometriaPalma, materialPhong);

    palma.rotation.x = Math.PI / 2;
    mano.add(palma);

    // 0: 24.5, -10, -2    4: 24.5, -10, 2
    // 1: 43.5,  -5, -2    5: 43.5,  -5, 0
    // 2: 24.5,  10, -2    6: 24.5,  10, 2
    // 3: 43.5,   5, -2    7: 43.5,   5, 0
    
    
    let verticesDedo = new Float32Array([
        // Cara plana: 0,2,3 y 0,3,1
        24.5, -10, -2,   24.5,  10, -2,   43.5,   5, -2,
        24.5, -10, -2,   43.5,   5, -2,   43.5,  -5, -2,
        // Cara exterior: 4,5,7 y 4,7,6
        24.5, -10,  2,   43.5,  -5,  0,   43.5,   5,  0,
        24.5, -10,  2,   43.5,   5,  0,   24.5,  10,  2,
        // Arriba: 2,6,7 y 2,7,3
        24.5,  10, -2,   24.5,  10,  2,   43.5,   5,  0,
        24.5,  10, -2,   43.5,   5,  0,   43.5,   5, -2,
        // Abajo: 0,1,5 y 0,5,4
        24.5, -10, -2,   43.5,  -5, -2,   43.5,  -5,  0,
        24.5, -10, -2,   43.5,  -5,  0,   24.5, -10,  2,
        // Punta: 1,3,7 y 1,7,5
        43.5,  -5, -2,   43.5,   5, -2,   43.5,   5,  0,
        43.5,  -5, -2,   43.5,   5,  0,   43.5,  -5,  0,
        // Base: 0,4,6 y 0,6,2
        24.5, -10, -2,   24.5, -10,  2,   24.5,  10,  2,
        24.5, -10, -2,   24.5,  10,  2,   24.5,  10, -2
    ]);



    let uvsDedo = new Float32Array([
        // Cara plana: 0,2,3 y 0,3,1
        0, 0,   1, 0,   1, 1,
        0, 0,   1, 1,   0, 1,
        // Cara exterior: 4,5,7 y 4,7,6
        0, 0,   1, 0,   1, 1,
        0, 0,   1, 1,   0, 1,
        // Arriba: 2,6,7 y 2,7,3
        0, 0,   1, 0,   1, 1,
        0, 0,   1, 1,   0, 1,
        // Abajo: 0,1,5 y 0,5,4
        0, 0,   1, 0,   1, 1,
        0, 0,   1, 1,   0, 1,
        // Punta: 1,3,7 y 1,7,5
        0, 0,   1, 0,   1, 1,
        0, 0,   1, 1,   0, 1,
        // Base: 0,4,6 y 0,6,2
        0, 0,   1, 0,   1, 1,
        0, 0,   1, 1,   0, 1
    ]);


    

    // Pinza Izquierda

    pinzaIz = new THREE.Object3D();

    pinzaIz.position.z = 10;
    mano.add(pinzaIz);

    // pieza 1 Pinza Izquierda

    let geometriaPinza1 = new THREE.BoxGeometry(19, 20, 4);
    let pinza1Iz = new THREE.Mesh(geometriaPinza1, materialPhong);

    pinza1Iz.position.x = 15;
    pinzaIz.add(pinza1Iz);



    let geometriaDedo = new THREE.BufferGeometry();
    geometriaDedo.setAttribute('position', new THREE.BufferAttribute(verticesDedo, 3));
    geometriaDedo.setAttribute('uv', new THREE.BufferAttribute(uvsDedo, 2));
    geometriaDedo.computeVertexNormals();

    let dedoIz = new THREE.Mesh(geometriaDedo, materialPhong);
    pinzaIz.add(dedoIz);

    // Pinza Derecha
    pinzaDe = new THREE.Object3D();

    pinzaDe.position.z = -10;
    pinzaDe.rotation.x = Math.PI;
    mano.add(pinzaDe);

    // pieza 1 Pinza Derecha
    let pinza1De = new THREE.Mesh(geometriaPinza1, materialPhong);

    pinza1De.position.x = 15;
    pinzaDe.add(pinza1De);

    // Punta Pinza Derecha
    let dedoDe = new THREE.Mesh(geometriaDedo, materialPhong);

    pinzaDe.add(dedoDe);

    // Añadir el piso a la escena
    let geometriaPiso = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    let piso = new THREE.Mesh(geometriaPiso,pisoMaterial);
    piso.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2) ;
    scene.add(piso);

    // LUCES

    // Añadir luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040); // luz tenue
    scene.add(ambientLight);

    // Añadir luz direccional
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(300, 300, 300);
    scene.add(directionalLight);    

    // Añadir luz de foco (spotlight)
    const spotLight = new THREE.SpotLight(0xffffff, 1); // color, intensidad
    spotLight.position.set(0, 500, 0); // Posicionar la luz de foco
    spotLight.target.position.set(1, 0, 0); // Apuntar hacia el origen (o hacia cualquier objeto)

    // Ajustar las propiedades del cono
    spotLight.angle = Math.PI / 6; // Establecer un ángulo de 30 grados
    spotLight.penumbra = 0.2; // Borde suave en el cono
    spotLight.distance = 2000; // Distancia a la que afecta la luz
    spotLight.decay = 2; // Atenuación con la distancia

    scene.add(spotLight);
    scene.add(spotLight.target);


    // SOMBRAS

    // 1- habiltar sombras en el renderizador
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // Usar PCFSoftShadowMap para suavizar las sombras
    // THREE.BasicShadowMap

    // 2- idem en la luz
    spotLight.castShadow = true;
    directionalLight.castShadow = true;
    // Configurar el tamaño del mapa de sombras
    spotLight.shadow.mapSize.width = 1024;  // Tamaño del mapa de sombras en ancho
    spotLight.shadow.mapSize.height = 1024; // Tamaño del mapa de sombras en alto
    directionalLight.shadow.mapSize.width = 1024;  // Tamaño del mapa de sombras en ancho
    directionalLight.shadow.mapSize.height = 1024; // Tamaño del mapa de sombras en alto
    // Configurar la cámara de sombras (opcional para ajustar el área de sombras)
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 1000;    
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000; 
    directionalLight.shadow.camera.left = -300; 
    directionalLight.shadow.camera.right = 300; 
    directionalLight.shadow.camera.top = 300;
    directionalLight.shadow.camera.bottom = -300;



    robot.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    piso.receiveShadow = true;

    // scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));
    // scene.add(new THREE.CameraHelper(spotLight.shadow.camera));


 


}


function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function update()
{
  // Cambios para actualizar la camara segun mvto del raton
  cameraControls.update();

  const delta = clock.getDelta();

  base.rotation.y = controls.giro_base / 180 * Math.PI;
  brazo.rotation.z = controls.giro_brazo / 180 * Math.PI;
  antebrazo.rotation.y = controls.giro_antebrazo_y / 180 * Math.PI;
  antebrazo.rotation.z = controls.giro_antebrazo_z / 180 * Math.PI;
  mano.rotation.z = controls.giro_pinza / 180 * Math.PI;
  material.wireframe = controls.alambres;
  materialLamb.wireframe = controls.alambres;
  materialPhong.wireframe = controls.alambres;
  pisoMaterial.wireframe = controls.alambres;
  reflectiveMaterial.wireframe = controls.alambres;

  for(let i = 0; i < materials.length; i++){
    materials[i].wireframe = controls.alambres;
  }

  pinzaIz.position.z = controls.separacion_pinza;
  pinzaDe.position.z = -controls.separacion_pinza;


  if (controls.moveForward) {robot.position.z -= controls.speed * delta;}
  if (controls.moveBackward) {robot.position.z += controls.speed * delta;}
  if (controls.moveLeft) {robot.position.x -= controls.speed * delta;}
  if (controls.moveRight) {robot.position.x += controls.speed * delta;}

  TWEEN.update();
}

function render()
{
	requestAnimationFrame( render );
	update();

  renderer.autoClear = false;
  renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
	renderer.setClearColor( new THREE.Color(0xa2a2f2) );
	renderer.clear();
	renderer.render( scene, camera );

    // vista de arriba
  var ds = Math.min(window.innerHeight , window.innerWidth)/4;
  renderer.setViewport(0,window.innerHeight - ds,ds,ds);
	renderer.setScissor (0, window.innerHeight - ds, ds, ds);
	renderer.setScissorTest (true);
	renderer.setClearColor( new THREE.Color(0xaffff) );
	renderer.clear();	
	renderer.setScissorTest (false);
  renderer.render(scene, cameraTop);
}