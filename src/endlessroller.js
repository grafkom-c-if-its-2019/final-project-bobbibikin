/*global THREE*/
/*global Stats*/
window.addEventListener('load', init, false);

var sceneWidth, sceneHeight, camera, scene, renderer, dom, sun, ground, orbitControl, rollingGroundSphere;
var heroSphere, heroSphere2, rollingSpeed=0.008, heroRollingSpeed, worldRadius=26, heroRadius=0.2, sphericalHelper;
var pathAngleValues, heroBaseY=1.8,heroBaseY2=1.8,bounceValue=0.1, bounceValue2=0.1, gravity=0.005, leftLane=-1, rightLane=1;
var middleLane=0, currentLane, currentLane2, clock, jumping, jumping2, treeReleaseInterval=0.5, lastTreeReleaseTime=0;
var treesInPath, treesPool, particleGeometry, particleGeometry2, particleGeometry3, particleCount=20, particleCount2=8, explosionPower=1.06;
var particles, particles2, particles3, stats, scoreText, score, hasCollided, hasCollided2;
var boleh1,boleh2;
var score1=10, score2=10;
var temp1, temp2;
var tinggi1, tinggi2;
function init() {
	// set up the scene
	createScene();
	
	//call game loop
	update();
}

function createScene(){
	hasCollided=false;
	hasCollided2=false;
	score=0;
	treesInPath=[], treesPool=[];
	clock=new THREE.Clock();
	clock.start();
	heroRollingSpeed=(rollingSpeed*worldRadius/heroRadius)/5;
	sphericalHelper = new THREE.Spherical();
	pathAngleValues=[1.52,1.57,1.62];
    sceneWidth=window.innerWidth;
    sceneHeight=window.innerHeight;
	bgmusik = new Audio('src/music/intro.mp3');
	bgmusik.loop=true;
	bgmusik.volume=0.5;
	bgmusik.play();
	// Fog	
	scene = new THREE.Scene();//the 3d scene
	// scene.fog = new THREE.FogExp2( 0xf0fff0, 0.14 ); 008cff
	scene.fog = new THREE.FogExp2( 0xf0fff0, 0.14 );//fog yang di scene
    camera = new THREE.PerspectiveCamera( 60, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
    renderer = new THREE.WebGLRenderer({alpha:true});//renderer with transparent backdrop
    renderer.setClearColor(0x85C1E9 , 0.3); //lebih ke backdrop
    renderer.shadowMap.enabled = true;//enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; //biar soft
	renderer.setSize( sceneWidth, sceneHeight );
	
	// attach ke dom
	dom = document.getElementById('TutContainer');
	// dom2 = document.getElementById('scoreboard');
	dom.appendChild(renderer.domElement);
	// dom2.appendChild(renderer.domElement);
	stats = new Stats();
	dom.appendChild(stats.dom);
	// dom2.appendChild(stats.dom);
	
	createTreesPool();
	// addSalju();
	addWorld();
	addHero();
	addLight();
	addExplosion();
	addExplosion2();
	addExplosion3();
	
	scene.children.forEach(function (child) {
		if (child instanceof THREE.PointCloud) {
			var vertices = child.geometry.vertices;
			vertices.forEach(function (v) {
				v.y = v.y - (v.velocityY);
				v.x = v.x - (v.velocityX);
				v.z = v.z - (v.velocityZ);

				if (v.y <= 0) v.y = 60;
				if (v.x <= -20 || v.x >= 20) v.velocityX = v.velocityX * -1;
				if (v.z <= -20 || v.z >= 20) v.velocityZ = v.velocityZ * -1;
			});
		}
	});
	camera.position.z = 6.5;
	camera.position.y = 3.5;
	orbitControl = new THREE.OrbitControls( camera, renderer.domElement );//helper to rotate around in scene
	orbitControl.addEventListener( 'change', render );
	// orbitControl.enableDamping = true;
	// orbitControl.dampingFactor = 0.8;

	orbitControl.noKeys = true;
	orbitControl.noPan = true;
	orbitControl.enableZoom = false;
	orbitControl.minPolarAngle = 1.1;
	orbitControl.maxPolarAngle = 1.1;
	orbitControl.minAzimuthAngle = -0.2;
	orbitControl.maxAzimuthAngle = 0.2;
	
	window.addEventListener('resize', onWindowResize, false);//resize callback

	// document.onkeydown = handleKeyDown;
	// document.addEventListener('keydown', Controller);
	// document.addEventListener('keydown', handleKeyDown2);
	// document.onkeydown = handleKeyDown2;
	
	// scoreText = document.createElement('div');
	// scoreText.style.position = 'absolute';
	// //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
	// scoreText.style.width = 100;
	// scoreText.style.height = 100;
	// //scoreText.style.backgroundColor = "blue";
	// scoreText.innerHTML = "0";
	// scoreText.style.top = 10 + 'px';
	// scoreText.style.left = 100 + 'px';
	// document.body.appendChild(scoreText);
}
// var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
function Controller1() {
	// if(!boleh1) return;
	// if(jumping2) return;
	var validMove=true;
	// var delta = clock.getDelta();
	// var moveDistance = 5*delta;
	//P1

		if(keyboard.pressed("up") && !tinggi1) {
			bounceValue=0.1;
			jumping=true;
			validMove=false;
		}
		if( keyboard.pressed("left")  ){
				if(currentLane==middleLane && heroSphere.position.x < 0.1){
					currentLane=leftLane;
				}
				else if(currentLane==rightLane && heroSphere.position.x >0.9){
					currentLane=middleLane;
				}
				else{
					validMove=false;
				}
				boleh1=false;
					
					
		}
		if( keyboard.pressed("right")){
			if(currentLane==middleLane && heroSphere.position.x > -0.1){
				currentLane=rightLane;
			}else if(currentLane==leftLane && heroSphere.position.x < -0.9){
				currentLane=middleLane;
			}else{
				validMove=false;	
			}
			boleh1=false;
		}

}

function Controller2(){
	// if(!boleh2) return;
	var validMove2=true;
	if(keyboard.pressed("W") && !tinggi2 ){
		bounceValue2=0.1;
		jumping2=true
		validMove2=false;
	}
	if( keyboard.pressed("A") ){
		if(currentLane2==middleLane && heroSphere2.position.x < 0.1){
			currentLane2=leftLane;
		}else if(currentLane2==rightLane && heroSphere2.position.x >0.9){
			currentLane2=middleLane;
		}else{
			validMove2=false;	
		}
		boleh2=false;
	}
	if( keyboard.pressed("D")){
		if(currentLane2==middleLane  && heroSphere2.position.x > -0.1){
			currentLane2=rightLane;
		}else if(currentLane2==leftLane && heroSphere2.position.x < -0.9){
			currentLane2=middleLane;
		}else{
			validMove2=false;	
		}
		boleh2=false;
	}
	// if(validMove2){
	// 		jumping2=true;
	// 		bounceValue2=0.06;
	// 	}

}
function addSalju(){
	
	var texture1 = THREE.ImageUtils.loadTexture("images/snowflake1.png");
	var texture2 = THREE.ImageUtils.loadTexture("images/snowflake2.png");
	var texture3 = THREE.ImageUtils.loadTexture("images/snowflake3.png");
	var texture4 = THREE.ImageUtils.loadTexture("images/snowflake5.png");

	var material = new THREE.PointCloudMaterial({
		size: 1,
		transparent:true,
		map:texture1,
		blending: THREE.AdditiveBlending,
		depthWrite:false,
	});
	var range = 40;
	var geom = new THREE.Geometry();
	for (var i = 0; i < 50; i++) {
		var particle = new THREE.Vector3(
				Math.random() * range - range / 2,
				Math.random() * range * 1.5,
				Math.random() * range - range / 2);
		particle.velocityY = 0.1 + Math.random() / 5;
		particle.velocityX = (Math.random() - 0.5) / 3;
		particle.velocityZ = (Math.random() - 0.5) / 3;
		geom.vertices.push(particle);
	}

	part = new THREE.PointCloud(geom, material);
	part.sortParticles = true;
	scene.add( part );
}
function addExplosion(){
	particleGeometry = new THREE.Geometry();
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		particleGeometry.vertices.push( vertex );
	}
	var texture = THREE.ImageUtils.loadTexture("images/salju.jfif");
	texture.transparent=true;
	var pMaterial = new THREE.ParticleBasicMaterial({
	  color: 0xfffafa,
	  size: 0.2,
	//   map : texture
	  
	});
	particles = new THREE.Points( particleGeometry, pMaterial );
	scene.add( particles );
	particles.visible=false;
}

function addExplosion2(){
	particleGeometry2 = new THREE.Geometry();
	for (var i = 0; i < particleCount2; i ++ ) {
		var vertex = new THREE.Vector3();
		particleGeometry2.vertices.push( vertex );
	}
	var pMaterial2 = new THREE.ParticleBasicMaterial({
	  color: 0xFFD700,
	  size: 0.1
	});
	particles2 = new THREE.Points( particleGeometry2, pMaterial2 );
	scene.add( particles2 );
	particles2.visible=false;
}

function addExplosion3(){
	particleGeometry3 = new THREE.Geometry();
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		particleGeometry3.vertices.push( vertex );
	}
	var pMaterial3 = new THREE.ParticleBasicMaterial({
	  color: 0xfffafa,
	  size: 0.2
	});
	particles3 = new THREE.Points( particleGeometry3, pMaterial3 );
	scene.add( particles3 );
	particles3.visible=false;
}
function createTreesPool(){
	var maxTreesInPool=10;
	var newTree;
	for(var i=0; i<maxTreesInPool;i++){
		newTree=createTree();
		treesPool.push(newTree);
	}
}


// add object
function addHero(){
	var img = new Image();
	// img.src = "images/road.jpg";
	var texture = new THREE.TextureLoader().load("images/panda.jpg");
	var texture2 = new THREE.TextureLoader().load("images/grizzly.jpg");
	var sphereGeometry = new THREE.DodecahedronGeometry( heroRadius, 2);
	var sphereMaterial = new THREE.MeshStandardMaterial( { map: texture2, shading: THREE.FlatShading} )
	var sphereMaterial2 = new THREE.MeshStandardMaterial( { map: texture, shading:THREE.FlatShading} )
	jumping=false;
	jumping2=false;
	// boleh1=false;
	// boleh2=false;
	heroSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	heroSphere.receiveShadow = true;
	heroSphere.castShadow=true;

	heroSphere2 = new THREE.Mesh( sphereGeometry, sphereMaterial2 );
	heroSphere2.receiveShadow = true;
	heroSphere2.castShadow=true;
	scene.add( heroSphere, heroSphere2);
	heroSphere.position.y=heroBaseY;
	heroSphere.position.z=4.8;
	heroSphere.rotation.y = 1.7;
	
	heroSphere2.position.y=heroBaseY2;
	heroSphere2.position.z=4.8;
	heroSphere2.rotation.y = 1.7;

	currentLane2=leftLane
	heroSphere2.position.x = currentLane2;
	
	currentLane=rightLane;
	heroSphere.position.x=currentLane;
}

// scrolling ground
function addWorld(){
	var sides=40;
	var tiers=40;
	var img = new Image();
	// img.src = "images/road.jpg";
	// var texture = new THREE.TextureLoader().load("images/senow.jpg");
	var sphereGeometry = new THREE.SphereGeometry( worldRadius, sides,tiers);
	var sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xFBFCFC  ,shading:THREE.PhongShading} )
	
	var vertexIndex;
	var vertexVector= new THREE.Vector3();
	var nextVertexVector= new THREE.Vector3();
	var firstVertexVector= new THREE.Vector3();
	var offset= new THREE.Vector3();
	var currentTier=1;
	var lerpValue=0.5;
	var heightValue;
	var maxHeight=0.07;
	for(var j=1;j<tiers-2;j++){
		currentTier=j;
		for(var i=0;i<sides;i++){
			vertexIndex=(currentTier*sides)+1;
			vertexVector=sphereGeometry.vertices[i+vertexIndex].clone();
			if(j%2!==0){
				if(i==0){
					firstVertexVector=vertexVector.clone();
				}
				nextVertexVector=sphereGeometry.vertices[i+vertexIndex+1].clone();
				if(i==sides-1){
					nextVertexVector=firstVertexVector;
				}
				lerpValue=(Math.random()*(0.75-0.25))+0.25;
				vertexVector.lerp(nextVertexVector,lerpValue);
			}
			heightValue=(Math.random()*maxHeight)-(maxHeight/2);
			offset=vertexVector.clone().normalize().multiplyScalar(heightValue);
			sphereGeometry.vertices[i+vertexIndex]=(vertexVector.add(offset));
		}
	}
	rollingGroundSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	rollingGroundSphere.receiveShadow = true;
	rollingGroundSphere.castShadow=false;
	rollingGroundSphere.rotation.z=-Math.PI/2;
	scene.add( rollingGroundSphere );
	rollingGroundSphere.position.y=-24;
	rollingGroundSphere.position.z=2;
	addWorldTrees();
}

function addLight(){
	// A light source positioned directly above the scene, with color fading from the sky color to the ground color.
	var hemisphereLight = new THREE.HemisphereLight(0xfffafa,0xFBFCFC, .9)  //0xffffbb, 0x080820
	scene.add(hemisphereLight);
	
	// sun
	sun = new THREE.DirectionalLight(0xffffff, 0.5); //0xcdc1c5
	sun.position.set( 12,12,-7 ); //-7
	sun.castShadow = true;
	scene.add(sun);

	//Set up shadow properties for the sun light
	sun.shadow.mapSize.width = 256;
	sun.shadow.mapSize.height = 256;
	sun.shadow.camera.near = 0.5;
	sun.shadow.camera.far = 50 ;
}

function addPathTree(){
	var options=[0,1,2];
	var lane= Math.floor(Math.random()*3);
	addTree(true,lane);
	options.splice(lane,1);
	if(Math.random()>0.05){
		lane= Math.floor(Math.random()*2);
		addTree(true,options[lane]);
	}
}
function addWorldTrees(){
	var numTrees=50;
	var gap=6.28/36;
	for(var i=0;i<numTrees;i++){
		addTree(false,i*gap, true);
		addTree(false,i*gap, false);
	}
}
function addTree(inPath, row, isLeft){
	var newTree;
	if(inPath){
		if(treesPool.length==0)return;
		newTree=treesPool.pop();
		newTree.visible=true;
		//console.log("add tree");
		treesInPath.push(newTree);
		sphericalHelper.set( worldRadius-0.3, pathAngleValues[row], -rollingGroundSphere.rotation.x+4 );
	}else{
		newTree=createTree();
		var forestAreaAngle=0;//[1.52,1.57,1.62];
		if(isLeft){
			forestAreaAngle=1.68+Math.random()*0.1;
		}else{
			forestAreaAngle=1.46-Math.random()*0.1;
		}
		sphericalHelper.set( worldRadius-0.3, forestAreaAngle, row );
	}
	newTree.position.setFromSpherical( sphericalHelper );
	var rollingGroundVector=rollingGroundSphere.position.clone().normalize();
	var treeVector=newTree.position.clone().normalize();
	newTree.quaternion.setFromUnitVectors(treeVector,rollingGroundVector);
	newTree.rotation.x+=(Math.random()*(2*Math.PI/10))+-Math.PI/10;
	
	rollingGroundSphere.add(newTree);
}
function createTree(){
	var sides=8;
	var tiers=6;
	var scalarMultiplier=(Math.random()*(0.25-0.1))+0.05;
	var midPointVector= new THREE.Vector3();
	var vertexVector= new THREE.Vector3();
	var treeGeometry = new THREE.ConeGeometry( 0.5, 1, sides, tiers); //daunnya
	var treeMaterial = new THREE.MeshStandardMaterial( { color: 0x33ff33,shading:THREE.FlatShading  } );
	var offset;
	midPointVector=treeGeometry.vertices[0].clone();
	var currentTier=0;
	var vertexIndex;

	// biar treenya ada bentuknya, ga cuma cone segitiga gitu
	blowUpTree(treeGeometry.vertices,sides,0,scalarMultiplier);
	tightenTree(treeGeometry.vertices,sides,1);
	blowUpTree(treeGeometry.vertices,sides,2,scalarMultiplier*1.1,true);
	tightenTree(treeGeometry.vertices,sides,3);
	blowUpTree(treeGeometry.vertices,sides,4,scalarMultiplier*1.2);
	tightenTree(treeGeometry.vertices,sides,5);

	var treeTop = new THREE.Mesh( treeGeometry, treeMaterial );
	treeTop.castShadow=true;
	treeTop.receiveShadow=false;
	treeTop.position.y=0.9;
	treeTop.rotation.y=(Math.random()*(Math.PI));
	var treeTrunkGeometry = new THREE.CylinderGeometry( 0.1, 0.1,0.5); //batangnya
	var trunkMaterial = new THREE.MeshStandardMaterial( { color: 0x886633,shading:THREE.FlatShading  } );
	var treeTrunk = new THREE.Mesh( treeTrunkGeometry, trunkMaterial );
	treeTrunk.position.y=0.25;
	var tree =new THREE.Object3D();
	tree.add(treeTrunk);
	tree.add(treeTop);
	return tree;
}

function blowUpTree(vertices,sides,currentTier,scalarMultiplier,odd){
	var vertexIndex;
	var vertexVector= new THREE.Vector3();
	var midPointVector=vertices[0].clone();
	var offset;
	for(var i=0;i<sides;i++){
		vertexIndex=(currentTier*sides)+1;
		vertexVector=vertices[i+vertexIndex].clone();
		midPointVector.y=vertexVector.y;
		offset=vertexVector.sub(midPointVector);
		if(odd){
			if(i%2===0){
				offset.normalize().multiplyScalar(scalarMultiplier/6);
				vertices[i+vertexIndex].add(offset);
			}else{
				offset.normalize().multiplyScalar(scalarMultiplier);
				vertices[i+vertexIndex].add(offset);
				vertices[i+vertexIndex].y=vertices[i+vertexIndex+sides].y+0.05;
			}
		}else{
			if(i%2!==0){
				offset.normalize().multiplyScalar(scalarMultiplier/6);
				vertices[i+vertexIndex].add(offset);
			}else{
				offset.normalize().multiplyScalar(scalarMultiplier);
				vertices[i+vertexIndex].add(offset);
				vertices[i+vertexIndex].y=vertices[i+vertexIndex+sides].y+0.05;
			}
		}
	}
}

function tightenTree(vertices,sides,currentTier){
	var vertexIndex;
	var vertexVector= new THREE.Vector3();
	var midPointVector=vertices[0].clone();
	var offset;
	for(var i=0;i<sides;i++){
		vertexIndex=(currentTier*sides)+1;
		vertexVector=vertices[i+vertexIndex].clone();
		midPointVector.y=vertexVector.y;
		offset=vertexVector.sub(midPointVector);
		offset.normalize().multiplyScalar(0.06);
		vertices[i+vertexIndex].sub(offset);
	}
}

function cektinggi(){
	if(heroSphere2.position.y>3.5)
	{
		heroSphere2.position.y=THREE.Math.lerp(heroSphere2.position.y,heroBaseY2, 0.05);
		tinggi2 = true;
	}
	if(heroSphere.position.y>3.5)
	{
		heroSphere.position.y=THREE.Math.lerp(heroSphere.position.y,heroBaseY, 0.05);
		tinggi1 = true;
	}
}

function updatetinggi(){
	if(heroSphere.position.y < 2)
	{
		tinggi1 = false;
	}
	if(heroSphere2.position.y < 2)
	{
		tinggi2 = false;
	}
}

function updatetemp(){

	if(currentLane==currentLane2){
		if (heroSphere.position.y < 2 && heroSphere2.position.y < 2) return;
		if(currentLane2==temp1)
		{
			currentLane=temp2;
		}
		if(currentLane==temp2)
		{
			currentLane2=temp1;
		}
		if(currentLane==0 && currentLane2 ==0)
		{
			currentLane=leftLane;
			currentLane2=rightLane;
		}

	}
	if(currentLane==0)
	{
		if(temp1==-1 && heroSphere.position.x >= -0.2 )
		{
			temp1=0;
		}
		else if(temp1==1 && heroSphere.position.x<= 0.2)
		{
			temp1=0;
		}
	}
	else if(currentLane==1 && heroSphere.position.x >= 0.8)
	{
		temp1=1;
	}
	else if(currentLane==-1 && heroSphere.position.x <= -0.8)
	{
		temp1=-1;
	}

	if(currentLane2==0)
	{
		if(temp2==-1 && heroSphere2.position.x >= -0.2 )
		{
			temp2=0;
		}
		else if(temp2==1 && heroSphere2.position.x<= 0.2)
		{
			temp2=0;
		}
	}
	else if(currentLane2==1 && heroSphere2.position.x >= 0.8)
	{
		temp2=1;
	}
	else if(currentLane2==-1 && heroSphere2.position.x <= -0.8)
	{
		temp2=-1;
	}
	
	
}
function cektabrak(){
	if(heroSphere.position.y>2)
	{
		if(heroSphere2.position.y>2)
		{

		}
		else{
			return;
		}
	} 
	else if(heroSphere2.position.y>2)
	{
		if(heroSphere.position.y>2)
		{

		}
		else{
			return;
		}
	}
	console.log(Math.abs(heroSphere.position.x - heroSphere2.position.x))
	if(Math.abs(heroSphere.position.x - heroSphere2.position.x) < 0.3)
	{
		musik= new Audio('src/music/bounce_baru.mp3');
		musik.play();
		currentLane = temp1;
		currentLane2 = temp2;
		explode2(heroSphere);
	}


}
function update(){
	stats.update();
	//animate
	// temp1 = currentLane;
	// temp2 = currentLane2;
    rollingGroundSphere.rotation.x += rollingSpeed;
	heroSphere.rotation.x -= heroRollingSpeed;
	heroSphere2.rotation.x -= heroRollingSpeed;
	// Controller();
	// Controller1();
	// Controller2();
    if(heroSphere.position.y<=heroBaseY){
		jumping=false;
    	bounceValue=(Math.random()*0.04)+0.005;
	}
	if(heroSphere2.position.y<=heroBaseY2){
		jumping2=false;
    	bounceValue2=(Math.random()*0.04)+0.005;
	}
	// if(heroSphere2.position.y >=4) heroSphere.position.y=THREE.Math.lerp(heroSphere.position.y,1.8, 0.05);  
	// Controller();
	console.log(temp1,temp2);

	heroSphere.position.y+=bounceValue;
	if(heroSphere.position.x>=currentLane)
	{
		boleh1=true;
		
	}
	cektabrak();
	updatetemp();
	cektinggi();
	updatetinggi();
    heroSphere.position.x=THREE.Math.lerp(heroSphere.position.x,currentLane, 0.05);//2*clock.getDelta()
	if(heroSphere2.position.x==currentLane2){
		boleh2=true;
	}
	heroSphere2.position.y+=bounceValue2;
    heroSphere2.position.x=THREE.Math.lerp(heroSphere2.position.x,currentLane2, 0.05);//clock.getElapsedTime());
	
	bounceValue-=gravity;
	bounceValue2-=gravity;
	
    if(clock.getElapsedTime()>treeReleaseInterval){
    	clock.start();
    	addPathTree();
    	if(hasCollided){
			score1 = score1 - 1;
			nabrak = new Audio('src/music/nabrak_pohon.mp3');
			nabrak.volume=0.3;
			nabrak.play();
			document.getElementById("scores").innerHTML = score1 + "-" + score2;
			hasCollided = false;
		}
		if(hasCollided2){ // belom scorenya
			score2 = score2 - 1;
			nabrak = new Audio('src/music/nabrak_pohon.mp3');
			nabrak.volume=0.3;
			nabrak.play();
			document.getElementById("scores").innerHTML = score1 + "-" + score2;
			hasCollided2 = false;
		}
    }
	doTreeLogic();
	doExplosionLogic();
	doExplosionLogic2();
	doExplosionLogic3();
	Controller1();
	Controller2();
	render();
	if(score1<=0)
	{
		document.getElementById("player").innerHTML = "Player 2 Wins!";
		bgmusik.pause();
		kalah = new Audio('src/music/kalah.mp3');
		bgmusik.loop=true;
		kalah.play();
		toggleGameOver();
	}
	else if(score2<=0)
	{
		document.getElementById("player").innerHTML = "Player 1 Wins!";
		bgmusik.pause();
		kalah = new Audio('src/music/kalah.mp3');
		bgmusik.loop=true;
		kalah.play();
		toggleGameOver();
	}
	else{
		requestAnimationFrame(update);//request next update
	}
	
}
function doTreeLogic(){
	var oneTree;
	var treePos = new THREE.Vector3();
	var treesToRemove=[];
	treesInPath.forEach( function ( element, index ) {
		oneTree=treesInPath[ index ];
		treePos.setFromMatrixPosition( oneTree.matrixWorld );
		if(treePos.z>6 &&oneTree.visible){//gone out of our view zone
			treesToRemove.push(oneTree);
		}
		if(treePos.distanceTo(heroSphere.position)<=0.6){
			console.log("hit");
			hasCollided=true;
			explode(heroSphere);
		}
		if(treePos.distanceTo(heroSphere2.position)<=0.6){
			console.log("hit2");
			hasCollided2=true;
			explode3(heroSphere2);
		}
		
	});
	var fromWhere;
	treesToRemove.forEach( function ( element, index ) {
		oneTree=treesToRemove[ index ];
		fromWhere=treesInPath.indexOf(oneTree);
		treesInPath.splice(fromWhere,1);
		treesPool.push(oneTree);
		oneTree.visible=false;
		console.log("remove tree");
	});
}

function toggleGameOver() {
    // get the clock
    var tudo = document.getElementById('tudo');
    // also get the clock button, so we can change what it says
    var TutContainer = document.getElementById('TutContainer');
	var scoreboard = document.getElementById('scoreboard');

    TutContainer.style.display = 'none';
	tudo.style.display = 'block';
	scoreboard.style.display = 'none';
      // change button text
    }

function doExplosionLogic(){
	if(!particles.visible)return;
	for (var i = 0; i < particleCount; i ++ ) {
		particleGeometry.vertices[i].multiplyScalar(explosionPower);
	}
	if(explosionPower>1.005){
		explosionPower-=0.001;
	}else{
		particles.visible=false;
	}

	particleGeometry.verticesNeedUpdate = true;
}
function doExplosionLogic2(){
	if(!particles2.visible)return;
	for (var i = 0; i < particleCount2; i ++ ) {
		particleGeometry2.vertices[i].multiplyScalar(explosionPower);
	}
	if(explosionPower>1.005){
		explosionPower-=0.001;
	}else{
		particles2.visible=false;
	}
	particleGeometry2.verticesNeedUpdate = true;
}
function doExplosionLogic3(){
	if(!particles3.visible)return;
	for (var i = 0; i < particleCount; i ++ ) {
		particleGeometry3.vertices[i].multiplyScalar(explosionPower);
	}
	if(explosionPower>1.005){
		explosionPower-=0.001;
	}else{
		particles3.visible=false;
	}
	particleGeometry3.verticesNeedUpdate = true;
}
function explode(objek){
	particles.position.y=objek.position.y;
	particles.position.z=4.8;
	particles.position.x=objek.position.x;
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = -0.2+Math.random() * 0.4;
		vertex.y = -0.2+Math.random() * 0.4 ;
		vertex.z = -0.2+Math.random() * 0.4;
		particleGeometry.vertices[i]=vertex;
	}

	explosionPower=1.07;
	particles.visible=true;
}

function explode3(objek){
	particles3.position.y=objek.position.y;
	particles3.position.z=4.8;
	particles3.position.x=objek.position.x;
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = -0.2+Math.random() * 0.4;
		vertex.y = -0.2+Math.random() * 0.4 ;
		vertex.z = -0.2+Math.random() * 0.4;
		particleGeometry3.vertices[i]=vertex;
	}
	explosionPower=1.07;
	particles3.visible=true;
}

function explode2(objek){
	particles2.position.y=objek.position.y;
	particles2.position.z=4.8;
	particles2.position.x=objek.position.x;
	for (var i = 0; i < particleCount2; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = -0.2+Math.random() * 0.4;
		vertex.y = -0.2+Math.random() * 0.4 ;
		vertex.z = -0.2+Math.random() * 0.4;
		particleGeometry2.vertices[i]=vertex;
	}
	explosionPower=1.07;
	particles2.visible=true;
}
function render(){
	
    renderer.render(scene, camera);//draw
}
function gameOver () {
  //cancelAnimationFrame( globalRenderID );
  //window.clearInterval( powerupSpawnIntervalID );
}
function onWindowResize() {
	//resize & align
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}