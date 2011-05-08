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
 

var app = express.createServer();

app.configure(function(){
    app.use(express.static(__dirname + '/public'));
});

app.get('/hello', function(req, res){
	var pub = redis.createClient(); 
	
	pub.publish("trololo","hello!");

  res.send('Hello world message was sent to subscribers');
});


app.listen(8000);

var io = sio.listen(app); 

io.on('connection', function(socket){
  var sub = redis.createClient(); 

  socket.on('message', function (msg) { 
    if (msg.action === "subscribe") {
      console.log("Subscribe on " + msg.channel);
      sub.subscribe(msg.channel);    
    }
    if (msg.action === "unsubscribe") {
      console.log("Unsubscribe from" + msg.channel);      
      sub.unsubscribe(msg.channel); 
    }
  });
  
  socket.on('disconnect', function () { 
    sub.quit();
  });
		
	sub.on("message", function (channel, message) {
	    console.log(channel +": " + message);
      socket.send({
        channel: channel,
        data: message
      });
	}); 
}); 
