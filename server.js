/*
 * Socket IO server / Redis client.
 * Allows connections from HTML page ans sets up a subscriber client on a Redis instance.
 * 
 */

// Include require modules.
var sio = require('socket.io'); 
var redis = require('redis');
var express = require('express');  
var fs = require('fs');

var rtgpath = "redis://witcraft:f45a034960b524b8e3fe94a728a4c5d5@bluegill.redistogo.com:9291/";
var rtg = require("url").parse(process.env.REDISTOGO_URL || rtgpath);
 

var app = express.createServer();

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['sass'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));		 
});

app.get('/hello', function(req,res) {
  var pub = redis.createClient(rtg.port, rtg.hostname); 
  pub.auth(rtg.auth.split(":")[1]);  
  
  pub.publish("hello", JSON.stringify({ msg : "it works"}));

  pub.quit();
  
  res.send("Hello message sent");
});

var port = process.env.PORT || 3000;

app.listen(port);

var io = sio.listen(app);

io.configure(function () {
  io.set('transports', ['xhr-multipart', 'xhr-polling', 'jsonp-polling']);
});

io.sockets.on('connection', function (socket) {
  var sub = redis.createClient(rtg.port, rtg.hostname); 
  sub.auth(rtg.auth.split(":")[1]);

  socket.on('unsubscribe', function (channel) {   
    sub.unsubscribe(channel); 
  });

  socket.on('subscribe', function (channel) {
    sub.subscribe(channel);
  });
  
  socket.on('disconnect', function () { 
    sub.quit();
  });
		
  sub.on("message", function (channel, messageStr) {    
    var message = JSON.parse(messageStr);
    socket.emit(channel, message);
  }); 
}); 
