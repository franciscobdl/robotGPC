
// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;
var angulo = -0.01;
var cameraTop;

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
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 2000 );
  camera.position.set( 200, 300, 400 );


    // vista de planta
  cameraTop = new THREE.OrthographicCamera( -100, 100, 100,-100, 1, 1000 );
  cameraTop.position.set(0,500,0);
  cameraTop.up.set( 0, 0, -1 );
  cameraTop.lookAt( 0, 0, 0 );
  cameraTop.updateProjectionMatrix();  

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  window.addEventListener('resize', updateAspectRatio );
}


function loadScene()
{
    let material = new THREE.MeshNormalMaterial();          
        
    // Robot BANDEJA
    let robot = new THREE.Object3D();

    scene.add(robot);

    // Base
    let geometriaBase = new THREE.CylinderGeometry(50, 50, 15, 32);
    let base = new THREE.Mesh(geometriaBase, material);

    base.position.y = 7.5;
    robot.add(base);

    //Brazo BANDEJA

    let brazo = new THREE.Object3D();

    base.add(brazo);

    // Eje
    let geometriaEje = new THREE.CylinderGeometry(20, 20, 18, 32);
    let eje = new THREE.Mesh(geometriaEje, material);

    eje.position.y = 0;
    eje.rotation.x = Math.PI / 2;
    brazo.add(eje);

    // Esparrago
    let geometriaEsparrago = new THREE.BoxGeometry(18, 120, 12);
    let esparrago = new THREE.Mesh(geometriaEsparrago, material);

    esparrago.position.y = 60;
    brazo.add(esparrago);

    // Rotula
    let geometriaRotula = new THREE.SphereGeometry(20, 20, 20);
    let rotula = new THREE.Mesh(geometriaRotula, material);

    rotula.position.y = 120;
    brazo.add(rotula);

    // Antebrazo BANDEJA

    let antebrazo = new THREE.Object3D();

    antebrazo.position.y = 120;
    brazo.add(antebrazo);

    // Disco
    let geometriaDisco = new THREE.CylinderGeometry(22, 22, 6, 32);
    let disco = new THREE.Mesh(geometriaDisco, material);

    disco.position.y = 0;
    antebrazo.add(disco);

    // Nervios
    let geometriaNervio = new THREE.BoxGeometry(4, 80, 4);
    let nervio1 = new THREE.Mesh(geometriaNervio, material);

    nervio1.position.y = 43;
    nervio1.position.x = 8;
    nervio1.position.z = 8;

    antebrazo.add(nervio1);

    let nervio2 = new THREE.Mesh(geometriaNervio, material);

    nervio2.position.y = 43;
    nervio2.position.x = -8;
    nervio2.position.z = 8;

    antebrazo.add(nervio2);

    let nervio3 = new THREE.Mesh(geometriaNervio, material);

    nervio3.position.y = 43;
    nervio3.position.x = 8;
    nervio3.position.z = -8;

    antebrazo.add(nervio3);

    let nervio4 = new THREE.Mesh(geometriaNervio, material);

    nervio4.position.y = 43;
    nervio4.position.x = -8;
    nervio4.position.z = -8;

    antebrazo.add(nervio4);

    // Mano BANDEJA Palma
    let mano = new THREE.Object3D();

    mano.position.y = 80;
    antebrazo.add(mano);

    // Palma
    let geometriaPalma = new THREE.CylinderGeometry(15, 15, 40, 32);
    let palma = new THREE.Mesh(geometriaPalma, material);

    palma.rotation.x = Math.PI / 2;
    mano.add(palma);

    // Pinza Izquierda

    let pinzaIz = new THREE.Object3D();

    pinzaIz.position.z = 10;
    mano.add(pinzaIz);

    // pieza 1 Pinza Izquierda

    let geometriaPinza1 = new THREE.BoxGeometry(19, 20, 4);
    let pinza1Iz = new THREE.Mesh(geometriaPinza1, material);

    pinza1Iz.position.x = 15;
    pinzaIz.add(pinza1Iz);


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

    let geometriaDedo = new THREE.BufferGeometry();
    geometriaDedo.setAttribute('position', new THREE.BufferAttribute(verticesDedo, 3));
    geometriaDedo.computeVertexNormals();

    let dedoIz = new THREE.Mesh(geometriaDedo, material);
    pinzaIz.add(dedoIz);

    // Pinza Derecha
    let pinzaDe = new THREE.Object3D();

    pinzaDe.position.z = -10;
    pinzaDe.rotation.x = Math.PI;
    mano.add(pinzaDe);

    // pieza 1 Pinza Derecha
    let pinza1De = new THREE.Mesh(geometriaPinza1, material);

    pinza1De.position.x = 15;
    pinzaDe.add(pinza1De);

    // Punta Pinza Derecha
    let dedoDe = new THREE.Mesh(geometriaDedo, material);

    pinzaDe.add(dedoDe);



    // // Crear el cuerpo de la flecha (cilindro)
    // let geometriaCilindro = new THREE.CylinderGeometry(1, 1, 10, 32); // Radio y altura ajustados
    // let cilindro = new THREE.Mesh(geometriaCilindro, material);
    // cilindro.position.y = 5; // Posicionar el cilindro sobre el origen
    // flecha.add(cilindro); // Añadir el cilindro al nodo flecha

    // // Crear la punta de la flecha (cono)
    // let geometriaCono = new THREE.ConeGeometry(2, 4, 32); // Radio base y altura ajustados
    // let cono = new THREE.Mesh(geometriaCono, material);
    // cono.position.y = 10; // Posicionar el cono en la parte superior del cilindro
    // flecha.add(cono); // Añadir el cono al nodo flecha

    // // Añadir la flecha a la escena
    // scene.add(flecha);

    // Añadir el piso a la escena
    let geometriaPiso = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    let piso = new THREE.Mesh(geometriaPiso,material);
    piso.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2) ;
    scene.add(piso);

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