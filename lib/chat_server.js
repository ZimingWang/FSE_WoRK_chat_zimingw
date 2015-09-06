var socketio = require('socket.io');
var io;
var guestNumber = 1;//count the users
var nickNames = {};//username
var sqlite=require('sqlite3').verbose();//import the sqlitedatabase
var dataB=new sqlite.Database('ChatInfo.db');//run a object instance


exports.listen = function(server) {//as a "main function"
  io = socketio.listen(server);
  io.sockets.on('connection', function (socket) {
    dataB.run('CREATE TABLE IF NOT EXISTS info (infomat TEXT)');
    dataB.all('SELECT * FROM info',function(err,rows){
      socket.emit('showinfo',rows);
    });//create  a tabele info to store data which column name is infomat,and if it exists load the info and emit to client
    joinRoom(socket,guestNumber, 'ChatRoom',nickNames);//join the chatroom ,show username,introduce other users
    handleMessageBroadcasting(socket, nickNames);//broadcasting the message to other user clients
    handleClientDisconnection(socket, nickNames,'ChatRoom');//handle the users' leaving
    socket.on('storeinfo',function(message){
      var info =message.text;
      console.log(info);
      dataB.run("INSERT INTO info (infomat) VALUES('"+info+"')");
    });//get the info from client and store it in the database
  });
};






function joinRoom(socket,guestNumber, room,nickNames) {
  socket.join(room);
  socket.on('username', function (username){
    nickNames[socket.id]=username;
    socket.emit('nameResult',username );
    socket.broadcast.to(room).emit('message', {
      text: nickNames[socket.id] + ' has joined ' + room + '.'
    });
  });//add username to array,emit the result when finish join,and broadcating as message to other clients
  var usersInRoom = io.sockets.clients(room);//return the clients info in current room
  if (usersInRoom.length > 1) {
    var usersInRoomSummary = 'Users in ' + room + ': ';
    for (var index in usersInRoom) {
      var userSocketId = usersInRoom[index].id;//do not show the current user
      if (userSocketId != socket.id) {
        if (index > 0) {
          usersInRoomSummary += '***';
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
    }//use the "iterator" to load all users in nickname array at the room
    socket.emit('message', {text: usersInRoomSummary});//show the  users in the chatroom
  }
  return guestNumber+1;
}



function handleMessageBroadcasting(socket) {
  var date = new Date();
  var datemessage=date.toUTCString();// introduce the time
  socket.on('message', function (message) {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ': ' + message.text+datemessage
    });//get the info from client and broadcasting it to other clients
  });
}//broadcasting the message to other user clients


function handleClientDisconnection(socket,nickNames,room) {
  socket.on('disconnect', function() {
    var users=nickNames[socket.id]+"has leaved the room";
    socket.broadcast.to(room).emit('disconectinfo',users);
    delete nickNames[socket.id];

  });
}//handle the users' leaving

