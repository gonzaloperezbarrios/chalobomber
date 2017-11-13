var express=require('express');
var app=express();
var server=require('http').Server(app); 
var io=require('socket.io')(server);

var messages=[{
      id:1,
      text:'Hola soy un mensaje',
      author:'Gonzalo Perez'
}];

var player={};
    player.nMatriz=0;
    player.matrix_x=0;
    player.matrix_y=0;
    player.global_x=0;
    player.global_y=0;
    player.nMapa=0;
    player.matrizXY=[];
    player.player2=-1;

var mapaNoCreado=true;

app.use(express.static('public'));

app.get('/',function(request,response){
    response.status(200).send('hola mundo 2');
});

server.listen(8080,function(){
    console.log('Estamos corriemndo en el 8080');
});

io.on('connection',function(socket){
    console.log('Alguien se ha conectado con socket');
    socket.emit('messages',messages);
    socket.on('new-message',function(dato){
        messages.push(dato);
        io.sockets.emit('messages',messages);
    });
    //////////////////////////////////////
    ///Logica BomberChalo Multiplayer////
    ////////////////////////////////////
    socket.emit('player-server',player);
    socket.on('mapa-aletorio-server',function(){ 
        if(mapaNoCreado==true){
            mapaAleatorio();
            mapaNoCreado=false;
        } 
        player.player2++;
        console.log("player Conectado: "+player.player2);
        if(player.player2==0){
            player.onlinePlayer2=false;
            console.log('a')
        }else if(player.player2==1){
            player.onlinePlayer2=true;
            console.log('a2')
        }else{
            player.onlinePlayer2='lleno';
            console.log('a3')
        }
        socket.emit('mapa-server',player);
        console.log('Mapa Aletorio Creado');
    }); 
    
    socket.on('move-player-server',function(move){ 
        var isMove=false;
        if(move=='derecha'){
            isMove=movePlayerAction.derecha();
        }else if(move=='izquierda'){
            isMove=movePlayerAction.izquierda();
        }else if(move=='abajo'){
            isMove=movePlayerAction.abajo();
        }else if(move=='arriba'){
            isMove=movePlayerAction.arriba();
        }else{
            //bomba
        }
        if(isMove){
            io.sockets.emit('moved-payer-server',player);
        }
        return false;
    });
    
    socket.on('make-kabum-server',function(x,y,x2,y2){
        player.matrizXY[x][y]=0;//amar bomba
        io.sockets.emit('make-payer-server',x2,y2);
    }); 
    socket.on('kabum-server',function(x,y){
        kabum(x,y);
        io.sockets.emit('kabum-payer-server',player);
    });  
   
});



//////////////////////////////////////
///Logica BomberChalo Multiplayer////
////////////////////////////////////
function initPlayBomber(){
    //Llenar mapa posiciones logicas
    var nMatriz=20;
    var matrix_x=1;
    var matrix_y=1;
    //dibujar relleno de mapa
    var global_x=20;
    var global_y=20;
    var nMapa=400;
    var matrizXY=new Array(nMatriz + 1);        
    for (var i = 0; i < nMatriz; i++) {
        matrizXY[i] = new Array(nMatriz + 1);
        for (var j = 0; j < nMatriz; j++) {
            matrizXY[i][j]=0; //pared              
        }            
    }  
    //Eliminar los bordes        
    for (var i = 0; i < nMatriz; i++) {
        for (var j = 0; j < nMatriz; j++) {
            if(i%(nMatriz-1)==0 || j%(nMatriz-1)==0){
                matrizXY[i][j]='*'; //borde
            }                               
        }            
    }
    player.nMatriz=nMatriz;
    player.matrix_x=matrix_x;
    player.matrix_y=matrix_y;
    player.global_x=global_x;
    player.global_y=global_y;
    player.nMapa=nMapa;  
    player.matrizXY=matrizXY;     
}
initPlayBomber();

//Mapa aleatorio
function mapaAleatorio(){
    var intervalo_x=0;
    for (var i = 0; i < player.nMapa; i=i+20) {                               
        for (var j = 0; j < player.nMapa; j=j+20) {
            if(i==0 || j==0 || i==380 || j==380){
            }else{                          
                if(intervalo_x>2){
                    //quitarLadrillo(i,j);
                    player.matrizXY[i/20][j/20]=1;
                    intervalo_x=0;                                                                
                }else{ 
                    var numTemp=i*numeroAleatorio(1, 3);
                    if(numTemp>=player.nMapa){
                        numTemp=player.nMapa-player.nMapa+20;
                    }
                    //ponerLadrillo(numTemp,j,false);
                    player.matrizXY[numTemp/20][j/20]='*';  
                }
            }                       
            intervalo_x++;                        
        }
    }
}

function numeroAleatorio(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}


var movePlayerAction= (function (){ 
    return{ 
        derecha:function(){
            if(noHayPared(player.matrix_x+1,player.matrix_y)){
               // limpiarCelda()              
                player.global_x=player.global_x+20;
                player.matrix_x++; 
                player.moved='derecha'; 
                console.log("Player: Mover Derecha, "+player.global_x+","+player.global_y);                  
               // moverChalo(player.global_x,player.global_y,'derecha')
                return true;
            }
            return false;             			
        }, 
        izquierda:function(){
            if(noHayPared(player.matrix_x-1,player.matrix_y)){
               // limpiarCelda()
                player.global_x=player.global_x-20;
                player.matrix_x--;   
                player.moved='izquierda'; 
                console.log("Player: Mover izquierda, "+player.global_x+","+player.global_y);
               // moverChalo(player.global_x,player.global_y,'izquierda')
                return true;
            }
            return false;   	
        },
        abajo:function(){
            if(noHayPared(player.matrix_x,player.matrix_y+1)){ 
               // limpiarCelda()              
                player.global_y=player.global_y+20;
                player.matrix_y++;     
                player.moved='abajo';          
                console.log("Player: Mover abajo, "+player.global_x+","+player.global_y);  
               // moverChalo(player.global_x,player.global_y,'abajo') 
                return true;
            }
            return false;   
        },
        arriba:function(){
            if(noHayPared(player.matrix_x,player.matrix_y-1)){ 
               // limpiarCelda()
                player.global_y=player.global_y-20;
                player.matrix_y--;  
                player.moved='arriba';   
                console.log("Player: Mover arriba, "+player.global_x+","+player.global_y);       
                //moverChalo(player.global_x,player.global_y,'arriba')
                return true;
            }
            return false;   
        },
    }
})();
function noHayPared(x,y){
    var i=player.matrizXY[x][y];
    if(i===0 || i==='*'){
        return false;//no, puede caminar
    }
    return true;
}

//Explotar la boma
function kabum(matrix_x_temp,matrix_y_temp) {  
    player.matrizXY[matrix_x_temp][matrix_y_temp]="+";;
    //realizamos la explosion en cruz en la logica
    borrarLadrilloLogico(matrix_x_temp,matrix_y_temp);
    borrarLadrilloLogico(matrix_x_temp+1,matrix_y_temp);
    borrarLadrilloLogico(matrix_x_temp-1,matrix_y_temp);
    borrarLadrilloLogico(matrix_x_temp,matrix_y_temp+1);
    borrarLadrilloLogico(matrix_x_temp,matrix_y_temp-1);
    console.log('Kabum');                   
}

function borrarLadrilloLogico(x,y){
    if(player.matrix_x==x && player.matrix_y==y){
        console.log('Game Over');
        player.matrizXY[x][y]="game-over";
    }
    if(player.matrizXY[x][y]===0){//hay pared
        player.matrizXY[x][y]="+";//simbolo + representa un 1 cuando se lance al cliente               
    }
}