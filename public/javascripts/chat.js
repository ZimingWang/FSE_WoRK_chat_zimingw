var Chat = function(socket) {
  this.socket = socket;
};//create a function as "socket class "

Chat.prototype.sendMessage = function(room, text) {
  var message = {
    room: room,
    text: text
  };
  this.socket.emit('message', message);
};//define a prototype function to send Message






