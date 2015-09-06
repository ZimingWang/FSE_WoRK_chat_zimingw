var http = require('http');
var fs  = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();//send the 404:not found
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200, 
    {"content-type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);//extract the filemime and send fie ,200 means success
}

function serveStatic(response, cache, absPath) {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, function(exists) {
      if (exists) {
        fs.readFile(absPath, function(err, data) {
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });//try to read file from cache when the  file in,
      } else {
        send404(response);
      }
    });
  }
}//create server static and add basic elements excepts for socket.io

var server = http.createServer(function(request, response) {
  var filePath = false;

  if (request.url == '/') {
    filePath = 'public/Login.html';//first start with Login.html
  }
  else if (request.url.indexOf('?') != -1) {
    filePath = 'public' + request.url.substring(0, request.url.indexOf('?'));//remove the content after ? to get the suitable redirect url
  }
  else {
    filePath = 'public' + request.url;
  }

  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);//start staticfile server
});

server.listen(3000, function() {
  console.log("Server listening on port 3000.");
});//start listening on port 3000

var chatServer = require('./lib/chat_server');
chatServer.listen(server);//add "socket.io" server on the listenning
