define(['jquery'],function($){
	/*
		
		options:{
			default:[1,'asc']
			sort:[number','string',function(){
				
			}],
		}
		
		data:
		
	*/
	
	
	function SData(data,options){
		
		this.data=data;
		this.options=options;
		
		this.result=data.slice();//通过给定附加属性来影响UI
		this.query;
		this.rowImages=[];
	}
	
	SData.prototype={
		constructor:SData,
		
		destroy:function(){
			this.data=null;
			this.options=null;
			this.result=null;
			this.query={};
			this.rowString=[];
		},
		search:function(index,str){
			var data=this.data,t;
			if(arguments.length==2){
				
				this.query={column:index,search:str};
				for(var i=0;i<data.length;i++){
					t=this.data[i][index];
					if(t==null) {
						t='null';
					}else t=t.toString();
					
					if(str.constructor==RegExp?t.search(str)>-1:t.indexOf(str)>-1) 
						data[i].show=true;
					else data[i].show=false;
				}
				
			}else if(arguments.length==1){
				this.query={column:null,search:index};
				for(var i=0;i<this.rowString.length;i++){
					if(this.rowString[i].indexOf(str)>-1) 
						data[i].show=true;
					else data[i].show=false;
				}
			}
			
			return this;
		},
		makeRowString:function(){
			var rs=this.rowString=[];
			this.eachRow(function(row){
				rs.push(row.join('//'));
			});
			
			return this;
		},
		
		sort:function(index,order){
			order=order||'asc';
			var tmp=[],tt,null_row=[];
			for(var i=0,l=this.data.length;i<l;i++){
				this.data[i].row_index=i;
				if(this.data[i][index]==null) null_row.push(this.data[i]);
				else tmp.push(this.data[i]);
			}
			
			var func = this.options.types[index].constructor==Function?this.options.types[index]:false;
			
			if(order=='asc') //升序
				for(var i=0,l=tmp.length;i<l;i++){
					for(var k=0 ,kl=tmp.length-1; k<kl;k++){
						if(func?func(tmp[k][index],tmp[k+1][index],tmp[k],tmp[k+1],'asc'):tmp[k][index]>tmp[k+1][index]){
							tt=tmp[k+1];
							tmp[k+1]=tmp[k];
							tmp[k]=tt;
						}
					}
				}
			else for(var i=0,l=tmp.length;i<l;i++){
					for(var k=0 ,kl=tmp.length-1; k<kl;k++){
						if(func?func(tmp[k][index],tmp[k+1][index],tmp[k],tmp[k+1],'desc'):tmp[k][index]<tmp[k+1][index]){
							tt=tmp[k+1];
							tmp[k+1]=tmp[k];
							tmp[k]=tt;
						}
					}
				}
			
			this.result = tmp.concat(null_row);
			this.makeRowString();
			return this;
		},
		
		reset:function(){
			
			this.query={};
			this.result=this.data.slice();
			this.makeRowString();
			
			return this;
		},
		
		load:function(data){
			this.data=data;
			this.reset();
			return this;
		},
		
		set:function(rowIndex,fieldIndex,data){
			//有效性判断
			switch(arguments.length){
				case 1:
				this.load(rowIndex);
				break;
				case 2:
				this.data[rowIndex]=fieldIndex;
				break;
				case 3:
				this.data[rowIndex][fieldIndex]=data;
				break;
			}
			return this;
		},
		get:function(rowIndex,fieldIndex){
			switch(arguments.length){
				case 0:
				return this.result;
				break;
				case 1:
				return this.result[rowIndex];
				break;
				case 2:
				return this.data[rowIndex][fieldIndex];
				break;
			}
		},
		
		eachRow:function(cb){
			for(var i=0;i<this.result.length;i++) cb(this.result[i]);
		},
		eachCol:function(index,cb){
			for(var i=0;i<this.result.length;i++) cb(this.result[i][index]);
		},
	};
	
	
	
	
	
	
	
	return SData;
	
	
});