


function divEscapedContentElement(message) {
    return $('<div style="color: #0e17ff"></div>').text(message);
}//show the users message itself,use the color blue to distinguish with others chat words




function processUserInput(chatApp, socket) {
    var date = new Date();
    var datemessage=date.toUTCString();//add the date
    var message = $('#send-message').val();//get the info in send-message box
    chatApp.sendMessage($('#room').text(), message);//send the message to server for broadcasting
    $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    $('#messages').append(datemessage);//show the info of users itself
    var message={text:message+datemessage};
    socket.emit('storeinfo',message);//emit info to server to store in the database
    $('#send-message').val('');//clear the send-message box
}




var socket = io.connect();






$(document).ready(function() {

    var username =window.username;//get the username from Login.html
    socket.emit("username",username);//emit it to server

    socket.on("showinfo",function(rows){
        for(i in rows){
            var showcontent= $('<div></div>').html(rows[i].infomat);
            $('#messages').append(showcontent);
        }
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    });//receive the info in database from the server and show it in messages field

    var chatApp = new Chat(socket);
    socket.on('nameResult', function(username) {
        var message;
        message = 'You are called as ' +username + 'in chat room .';
        $('#messages').append(message);
    });//show the username

    socket.on('message', function (message) {
        socket.emit("storeinfo",message);//emit the broadcasting info to server to save in database
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);//show the broadcasting info
    });
    socket.on('disconectinfo', function (users) {
        var Element = $('<div style="color: #ff2323"></div>').text(users);
        $('#messages').append(Element);//show the broadcasting info
    });


    $('#send-message').focus();
    $('#send-form').submit(function() {
        processUserInput(chatApp, socket);
        return false;
    });//get the info in sendmessage field and use the  processUserInput to handle it and send it to server
});
