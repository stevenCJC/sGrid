define([], function() {
	function Mediator(){
		this.channels={};
	}
	
	Mediator.prototype={ 
		constructor:Mediator,
		pub:function(channel,message){
			var cn=this.channels[channel];
			if(!cn||!cn.length) return;
			for(var i=0,len=cn.length;i<len;i++){
				cn[i](message);
			}
		},
		sub:function(channel,callback){
			var cn=this.channels[channel]=this.channels[channel]||[];
			cn.push(callback);
		},
	}
	
	return Mediator;
});


