var socket=io.connect('http://localhost:8080/',{'forceNew':true});
socket.on('messages',function(dato){
    console.log(dato);
    render(dato);
});

function render(dato){
    var html=dato.map(function(elem,index){
        return("<div>"
                +"<strong>"
                    + elem.author
                +"</strong>"
                +"<p><em>"
                    +elem.text
                +"</em></p>"
             +"</div>");
    }).join(" ");
    
    document.getElementById('messages').innerHTML=html;
}

function addMessage(e){
    var payload={
        author:document.getElementById('username').value,
        text:document.getElementById('texto').value
    };
    socket.emit('new-message',payload);
    return false;
}


