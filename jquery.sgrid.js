define(['jquery','utils/SGrid/SGrid'],function($,SGrid){
	
	$.fn.sGrid=function(options){
		var sgrid;
		if(options=='destroy'){
			
			this.each(function(){
				
				sgrid=$(this).data('sgrid');
				$(this).data('sgrid',null);
				if(sgrid) sgrid.destroy();
				
			});
		
		}else if(options&&options.constructor==String){
			
			this.each(function(){
				
				sgrid=$(this).data('sgrid');
				if(sgrid&&sgrid[options]) {
					sgrid[options].apply(sgrid,Array.prototype.slice.call(arguments,1));
				}
				
			});
			
		}else {
			
			this.each(function(){
				
				$(this).data('sgrid',new SGrid(this,options));
				
			});
			
		}
	}
	
});