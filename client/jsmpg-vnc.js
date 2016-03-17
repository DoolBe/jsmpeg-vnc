// Set the body class to show/hide certain elements on mobile/desktop
document.body.className = ('ontouchstart' in window) ? 'mobile' : 'desktop';


// Setup the WebSocket connection and start the player
var client = new WebSocket( 'ws://' + window.location.host + '/ws' );

var canvas = document.getElementById('videoCanvas');
var player = new jsmpeg(client, {canvas:canvas});


// Input

var mouseLock = !!document.location.href.match('mouselock');
var lastMouse = {x: 0, y: 0};
if( mouseLock ) {
	// FUCK YEAH, VENDOR PREFIXES. LOVE EM!
	canvas.requestPointerLock = canvas.requestPointerLock ||
		canvas.mozRequestPointerLock || 
		canvas.webkitRequestPointerLock || 
		(function(){});
}

// enum input_type_t
var INPUT_KEY = 0x0001,
	INPUT_MOUSE_BUTTON = 0x0002,
	INPUT_MOUSE_ABSOLUTE = 0x0004,
	INPUT_MOUSE_RELATIVE = 0x0008;

var KEY_DOWN = 0x01,
	KEY_UP = 0x00,
	MOUSE_1_DOWN = 0x0002,
	MOUSE_1_UP = 0x0004,
	MOUSE_2_DOWN = 0x0008,
	MOUSE_2_UP = 0x0010;

// struct input_key_t { uint16 type, uint16 state; uint16 key_code; }
var sendKey = function(ev, action, key) {
	client.send(new Uint16Array([INPUT_KEY, action, key]));
	ev.preventDefault();
};

// struct input_mouse_t { uint16 type, uint16 flags; float32 x; float32 y; }
var mouseDataBuffer = new ArrayBuffer(12);
var mouseDataTypeFlags = new Uint16Array(mouseDataBuffer, 0);
var mouseDataCoords = new Float32Array(mouseDataBuffer, 4);

var sendMouse = function(ev, action,dx,dz) {
	var type = 0;
	var x, y;

	mouseDataTypeFlags[0] = INPUT_MOUSE_ABSOLUTE;//type;
	mouseDataTypeFlags[1] = (action||0);
	mouseDataCoords[0] = 320-dx*320/180;
	mouseDataCoords[1] = 270+dz*270/90;
	
	client.send(mouseDataBuffer);
	ev.preventDefault();
};



//ALPHA,BETA,GAMMA
	var last_alpha=0,last_beta=0,last_gamma=0;
	var alpha = 0,beta= 0,gamma = 0;
	var maax = 1, miin = -1;
	var dx = 0,dy = 0,dz = 0;
	var t1 =0, alpha_lt180=0;
	
	if(window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', function(event) {
      var alpha = Math.round(event.alpha),gamma = Math.round(event.gamma);
	  
	  t1++;
	  if(t1>6){
		  t1=0;last_alpha = alpha;last_gamma = gamma;
	  	  if(last_alpha > 180){	alpha_lt180=1;	}
	  }	  
	  if(gamma>0){
		  dz = gamma - 90;
	  }else{
		  dz = gamma + 90;
	  }	  
	  if(last_gamma>0){
		  dz = dz - ( last_gamma - 90);
	  }else{
		  dz = dz - ( last_gamma + 90);
	  }	 
	  if(last_gamma >0){
		  if(gamma <0) {
			  alpha +=180;
			  if(alpha>360){
				  alpha -=360;
			  }
		}
	  }else{
		  if(gamma>0){
			  alpha +=180;
			  if(alpha>360){
				  alpha -=360;
			  }
		  }
	  }
	  if(alpha_lt180){
		  if(alpha<(last_alpha-180) && alpha >0 ){
			  dx = alpha+360 - last_alpha;
		  }else{
			  dx = alpha - last_alpha;
		  }
	  }else{
		  if(alpha<361 && alpha >(last_alpha+180) ){
			  dx = alpha-360 - last_alpha;
		  }else{
			  dx = alpha - last_alpha;
		  }
	  }
	  if(dx>miin&&dx<maax  || dx >300){
		  dx = 0;
	  }
	  if(dz>miin&&dz<maax){
		  dz = 0;
	  } 
	  sendMouse(event, null,dx*2,dz*2);
		}, false);
  }else{
  	document.querySelector('body').innerHTML = 'NOT SUPPORT';
  }
  
	var v_backandfor =  0;
	var larget_ax=0,larget_ay=0,larget_az=0;
	var forward_flag=0,back_flag=0,left_flag=0,right_flag=0;
	if(window.DeviceMotionEvent) {
		window.addEventListener('devicemotion', function(event) {
      var   
      		ax = event.acceleration.x *100,
      		ay = event.acceleration.y *100,
		  	az = event.acceleration.z *100;
			
			if(900<ax){sendKey(event, KEY_DOWN, 32);sendKey(event, KEY_UP, 32);}
			
			if(100<az && ( back_flag == 0) ){sendKey(event, KEY_DOWN, 87);forward_flag = 1;}
			if(-40>az && forward_flag){sendKey(event, KEY_UP, 87);forward_flag = 0;}
			if(-50<az && az<50 && (/*back_flag||*/forward_flag))
			{ 	sendKey(event, KEY_UP, 87);forward_flag=0;
				//sendKey(event, KEY_UP, 83);back_flag=0;
			}
			
			if(-150>ay && ( right_flag == 0) ){sendKey(event, KEY_DOWN, 65);left_flag = 1;}
			if(90<ay && left_flag){sendKey(event, KEY_UP, 65);left_flag = 0;}
			if(150<ay && (left_flag== 0)){sendKey(event, KEY_DOWN, 68);right_flag = 1;}
			if(-90>ay && right_flag){sendKey(event, KEY_UP, 68);right_flag = 0;}
			if(-70<ay && ay<70 && (right_flag||left_flag))
			{ sendKey(event, KEY_UP, 65);sendKey(event, KEY_UP, 68);right_flag=0;left_flag=0;}
			
		}, false);
  }else{
  	document.querySelector('body').innerHTML = 'NOT SUPPORT';
  }
	
