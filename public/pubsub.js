var Pubsub = function(options) {
  var self = this;
  this.options = options || {};
  
  this.host = this.options.host || window.location.hostname;
  this.port = this.options.port || 8080;
  
  this.socket = new io.Socket(this.host,
    {rememberTransport: false, port: this.port, secure: this.options.secure}
  );

  this.socket.on("connect", function() { self.onconnect() });
  this.socket.on("message", function(msg) { self.onmessage(msg) }); 
  this.socket.on("disconnect", function() { self.ondisconnect() });  
}

Pubsub.prototype	= {
  
  // grabbed from MicroEvent.js. may be i should use microevent mixin?
	on : function(event, fct){
		this._events = this._events || {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
	},
	removeListener : function(event, fct){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	},
	emit : function(event /* , args... */){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		for(var i = 0; i < this._events[event].length; i++){
			this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
		}
	},
	
	subscribe : function(channel, fn) {
		this.socket.send({
		  action : "subscribe",
		  channel : channel
		});	
	  this.on("message:"+channel, fn);
	},
	
  psubscribe : function(channel, fn) {
		this.socket.send({
		  action : "psubscribe",
		  pattern : pattern
		});	
	  this.on("message:"+channel, fn);
	},
	
	unsubscribe : function(channel, fn) {
		this.socket.send({
		  action : "unsubscribe",
		  channel : channel
		});	
	  this.removeListener("message:"+channel, fn);
	},	
	
	connect : function() {
    this.socket.connect();
  },
  
  onconnect : function() {
    this.emit("connect");
  },
  
  onmessage : function(msg) {
    this.emit("message:"+msg.channel, msg.data);
  },
  
  ondisconnect : function() {
    this.emit("disconnect");
  }
};
