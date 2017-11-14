//////////////////////////////////////
///Logica BomberChalo Multiplayer////
////////////////////////////////////

//Iniciar valor del servidor
var nMatriz=0;
var nMapa=0;
var matrizXY=[];
var player2=false;
//PLAYER 1
var matrix_x=0;
var matrix_y=0;
var global_x=0;
var global_y=0;
//PLAYER 2
var matrix_x_2=0;
var matrix_y_2=0;
var global_x_2=0;
var global_y_2=0;

function actualizarPlayer(player){  
    nMatriz=player.nMatriz;
    nMapa=player.nMapa;
    matrizXY=player.matrizXY;
    //PLAYER 1
    matrix_x=player.matrix_x;
    matrix_y=player.matrix_y;
    global_x=player.global_x;
    global_y=player.global_y;
    //PLAYER 2
    matrix_x_2=player.matrix_x_2;
    matrix_y_2=player.matrix_y_2;
    global_x_2=player.global_x_2;
    global_y_2=player.global_y_2;
}

socket.on('player-server',function(player){
    actualizarPlayer(player);
    for (var i = 0; i < nMapa; i=i+20) {
        for (var j = 0; j < nMapa; j=j+20) {
            if(i==0 || j==0 || i==380 || j==380){
                ponerLadrillo(i,j,false)
            }else{
                ponerLadrillo(i,j)                   
            }
            
        }            
    }
    console.log('Actulizacion del servidor');
});
 
//Borrar bloque en el mapa
function quitarLadrillo(x,y){            
    var canvas = document.getElementById('mapa');
    var contexto = canvas.getContext('2d');
    contexto.fillStyle = 'white';
    contexto.clearRect(x, y, 20, 20);
    contexto.fillRect(x,y, 20, 20);                                   
}

//Borrar bloque en el mapa
function quitarLadrilloRojo(x,y){            
    var canvas = document.getElementById('mapa');
    var contexto = canvas.getContext('2d');
    contexto.fillStyle = 'red';
    contexto.clearRect(x, y, 20, 20);
    contexto.fillRect(x,y, 20, 20);                                   
}
 
//poner bloque en el mapa
function ponerLadrillo(x,y,madera=true){
    var context = document.getElementById('mapa').getContext("2d");
    var img = new Image();
    img.onload = function () {
        context.clearRect(x, y, 20, 20);
        context.drawImage(img, x, y,20,20);
    }
    if(madera){
        img.src = "img/tile_wood.png"; 
    }else{
        img.src = "img/tile_wall.png"; 
    }
}
 
//mover player en el mapa
function moverChalo(x,y,moverse='derecha',pintarPlayer2=false){
    var ctx = document.getElementById('mapa').getContext("2d");
    var img = new Image();
    if(pintarPlayer2){
        img.src = "img/betty.png";   
    }else{
        img.src = "img/chalo.png"; 
    } 
    posicion={}; 
    posicion.x=0;            
    if(moverse==='izquierda'){ 
        posicion.y=60;
    }else if(moverse==='derecha'){
        posicion.y=155;
    }else if(moverse==='abajo'){
        posicion.y=10;
    }else{
        posicion.y=105;
    }
    ctx.clearRect(x, y, 20, 20);
    img.onload = function () {
        ctx.drawImage(  
                img,
                posicion.x,posicion.y, //x,y en la imagen
                40,40, //zoom x,y en la imagen
                x-2,y+2, //ubicacion en el mapa
                20,20  // zoon x,y en el mapa   
            );
    }            
}

//Bomba en el mapa y en la logica
var bomba= [];
    bomba.armada=0;
    bomba.explotada=0;
function ponerBomba(x,y,posicionarBomba=true){
    if(posicionarBomba){        
        if(player2==true){
            var matrix_x_temp=matrix_x_2;
            var matrix_y_temp=matrix_y_2;
        }else{
            var matrix_x_temp=matrix_x;
            var matrix_y_temp=matrix_y;
        }
        socket.emit('make-kabum-server',matrix_x_temp,matrix_y_temp,x,y);//Quitamos el espcio para que no pise la bomba
        //Iniciar tiempo para explotar
        kabum=function(){    
            socket.emit('kabum-server',matrix_x_temp,matrix_y_temp);
            bomba.armada=0;//bomba desarmada y explotada 
            console.log('Kabum');                   
        }
        bombaAction.explotar(kabum)        
    }
}

//Armar la bomba
socket.on('make-payer-server',function(x,y){
    dibujarBomba(x,y);
}); 

function dibujarBomba(x,y){
    bomba.armada=1;
    var context = document.getElementById('mapa').getContext("2d");
    var img = new Image();
    //context.clearRect(x, y, 20, 20);
    img.onload = function () {
        context.drawImage(img, x, y,20,20);
    }
    img.src = "img/bomba.png"; 
}
 
//Explosion de la boma fuera de tiempo real en el mapa
var bombaAction= (function (){ 
    return{ 
        explotar:function(kabum){
            setTimeout(kabum, 1000);			
        }, 
    }
})();

function limpiarCelda(){
    if(bomba.armada==0){
        //PLAYER 1
        quitarLadrillo(global_x,global_y)   
        //PLAYER 2
        quitarLadrillo(global_x_2,global_y_2)             
    }else{    
        //PLAYER 1    
        quitarLadrillo(global_x,global_y)                    
        dibujarBomba(global_x,global_y);
        //PLAYER 2
        quitarLadrillo(global_x_2,global_y_2)        
        dibujarBomba(global_x_2,global_y_2);
    }
    bomba.armada=0;
}

//Explotar la bomba
socket.on('kabum-payer-server',function(player){
     actualizarPlayer(player); 
     for (var i = 0; i < nMapa; i=i+20) {                               
        for (var j = 0; j < nMapa; j=j+20) {
            if(matrizXY[i/20][j/20]=='+'){
                quitarLadrilloRojo(i,j);
                socket.emit('bomber-exploted-server',i/20,j/20);
                matrizXY[i/20][j/20]=1;//quite pared 
            }
            if(matrizXY[i/20][j/20]=="game-over2"){ 
                if(player2===true){
                   // alert('Game Over. Player 2'); 
                    document.getElementById('contendor').innerHTML="<h1>Game Over. Player 2</h1>";
                    console.log('Game Over. Player 2'); 
                }else{
                    //setTimeout(function(){ alert('Winner. Player 1'); },10);
                    document.getElementById('contendor').innerHTML="<h1>Winner. Player 1</h1>";
                    console.log('Winner. Player 1'); 
                }                
                //location.reload();
            }    
            if(matrizXY[i/20][j/20]=="game-over"){ 
                if(player2===true){
                    document.getElementById('contendor').innerHTML="<h1>Winner. Player 1</h1>";
                    console.log('Winner. Player 1'); 
                }else{
                    // alert('Game Over. Player 2'); 
                    document.getElementById('contendor').innerHTML="<h1>Game Over. Player 2</h1>";
                    console.log('Game Over. Player 2'); 
                }                
                //location.reload();
            }                                    
        }
    }
    
}); 
     
        
//Moverse en el mapa
socket.on('moved-payer-server',function(player){
    if(player!=false){
        limpiarCelda();
        actualizarPlayer(player);  
        //PLAYER 1
        moverChalo(global_x,global_y,player.moved,false);   
        //PLAYER 2
        setTimeout(function(){ moverChalo(global_x_2,global_y_2,player.moved2,true); },10);
    }  
 });  
var controlInicio=true;
document.addEventListener('keydown', function (e) {
    lastDownTarget = event.target;
    //derecha
    if (e.keyCode === 39) { 
        socket.emit('move-player-server','derecha',player2);
        console.log('Player: Mover derecha');             
    }
    //izquierda
    if (e.keyCode === 37) {
        socket.emit('move-player-server','izquierda',player2);
        console.log('Player: Mover izquierda');   
    }
    //abajo
    if (e.keyCode === 40) { 
        socket.emit('move-player-server','abajo',player2);
        console.log('Player: Mover abajo');              
    }
    //arriba
    if (e.keyCode === 38) {
        socket.emit('move-player-server','arriba',player2);
        console.log('Player: Mover arriba'); 
    }  
    //barra espaciadora
    //Poner Bomba
    if (e.keyCode === 32) {
        if(player2===true){
            ponerBomba(global_x_2,global_y_2,true)
        }else{
            ponerBomba(global_x,global_y,true)
        }
        
    }  
    //Enter
    //Restablecemos valores            
    if (e.keyCode === 13 && controlInicio==true) {
        socket.emit('mapa-aletorio-server');
        socket.on('mapa-server',function(player){
            if(player.onlinePlayer2===true){
                player2=true;   
                document.getElementById('name-player').innerHTML="Player 2"; 
            }else if(player.onlinePlayer2==='lleno'){
                alert('Sala LLena');
                document.getElementById('contendor').innerHTML="<h1>Sala llena</h1>";
            }else{
                player2=false;   
                document.getElementById('name-player').innerHTML="Player 1";             
            } 
            actualizarPlayer(player); 
            for (var i = 0; i < nMapa; i=i+20) {                               
                for (var j = 0; j < nMapa; j=j+20) {
                    if(matrizXY[i/20][j/20]=='*'){
                        ponerLadrillo(i,j,false);
                    }
                    if(matrizXY[i/20][j/20]==1){
                        quitarLadrillo(i,j);
                    }                                        
                }
            }         
            console.log('Mapa Creado');
        });      
        /////////////////////////////////////////
        /////////////////////////////////////////              
        controlInicio=false;       
        //PLAYER 1
        quitarLadrillo(global_x,global_y);
        moverChalo(global_x,global_y,'derecha',false);
        //PLAYER 2
        quitarLadrillo(global_x_2,global_y_2);
        moverChalo(global_x_2,global_y_2,'izquierda',true);
        /////////////////////////////////////////
        ////////////////////////////////////////
        /*
        var time=1000;
        setTimeout(function(){ playerbombaAction.run(20,80); },time);
        setTimeout(function(){ playerbombaAction.run(20,140,0.5); },time+2000);
        setTimeout(function(){ playerbombaAction.run(20,200,1); },time+4000);
        setTimeout(function(){ playerbombaAction.run(20,260,1.5); },time+3000);
        setTimeout(function(){ playerbombaAction.run(20,320,2); },time+1000);
        */
    }
}, false);
 

 
 var playerbombaAction= (function (){ 
     var refreshIntervalId;
     return{ 
         run:function(x,y,velocidad=1){            
             var direccion=1;
             refreshIntervalId =setInterval(function() {
                 var ctx = document.getElementById('mapa').getContext("2d");
                 var img = new Image();       
                 img.src = "img/player-bomba.jpg";     
                 ctx.clearRect(x, y, 20, 20);
                 img.onload = function () {
                     ctx.drawImage(  
                             img,
                             0,5, //x,y en la imagen
                             100,100, //zoom x,y en la imagen
                             x,y, //ubicacion en el mapa
                             19,19  // zoon x,y en el mapa   
                         );
                 } 
                 if(direccion==1){
                     x=x+20;
                     
                 }else{
                     x=x-20;
                 }
                 if((x/20)==matrix_x && (y/20)==matrix_y){
                     alert('Game Over');
                     location.reload();
                 }
                 if(nMapa-40<=x || x==20){
                     direccion=direccion*(-1);
                 }
             }, 1000/(5*velocidad)); // Aproximadamente 12 frames por segundo 
         },
         stop:function(){
             clearInterval(refreshIntervalId);
         } 
     }
 })();
 
 
 
 
 
 
     
 