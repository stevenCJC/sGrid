define(['jquery'],function($){
	
	function STable(ts,options){
		
		this.options=options;
		if(!options.types) options.types=[];
		
		this.table=ts.table;
		this.head=ts.head_table;
		
		this.resetRows();
		this.loadOptionsFromTable();
	}
	
	STable.prototype={
		
		constructor:STable,
		
		destroy:function(){
			
			this.drawSrcTable();
			this.table.off();
			this.rows=null;
			
		},
		eachRow:function(cb){
			
		},
		eachCol:function(cb){
			
		},
		eachColText:function(i,cb){
			this.table.children('tbody').find('tr.sgrid-row>td:nth-child('+(i+1)+')').each(function(index){
				cb(this.innerHTML,index);
			})
		},
		bind:function(evs){
			var me=this;
			this.head.on('click','thead th.sgrid-sorting',function(e){
				
				$(this).parent().children('th').not(this).removeClass('sgrid-sorting_desc sgrid-sorting_asc');
				
				if($(this).hasClass('sgrid-sorting_desc')) {
					evs.onSort(this.col_index,'asc');
					$(this).removeClass('sgrid-sorting_desc').addClass('sgrid-sorting_asc');
				}else  {
					evs.onSort(this.col_index,'desc');
					$(this).removeClass('sgrid-sorting_asc').addClass('sgrid-sorting_desc');
				}
			});
		},
		
		
		drawSrcTable:function(){
			var tbody=this.table.children('tbody');
			for(var i=0;i<this.rows.length;i++)
				tbody.prepend(this.rows[i]);
		},
		
		draw:function(data){
			console.time('STable.draw:');
			var tbody=this.table.children('tbody');
			tbody[0].innerHTML=null;   // 3、使用innerHTML清空视图后，再使用fragment只需要17ms
			var frag=$('<div></div>'); // 2、使用fragment比不使用快三倍 73行，用时950ms，
			for(var i=0;i<data.length;i++){
				if(data[i].show) $(this.rows[data[i].row_index]).show();
				else $(this.rows[data[i].row_index]).hide();
				frag.append(this.rows[data[i].row_index]); // 1、直接在视图上修改，73行，用时3200ms，
			} 
			tbody.html(frag.children()); 
			console.timeEnd('STable.draw:'); 
		},
		
		//重抓取rows
		resetRows:function(){
			var trs=this.table.children('tbody').children('tr');
			this.rows=[];
			for(var i=0;i<trs.length;i++)
				 this.rows.push(trs[i]);
		},
		
		loadOptionsFromTable:function(){
			
			var options =this.options ,cf,sort;
			
			var ths=this.head.children('thead').children('tr').children('th'),t;
			if(options.colFilter){
				cf=options.colFilter;
			}
			if(options.sort){
				sort=options.sort;
			}
			for(var i=0;i<ths.length;i++){
				ths[i].col_index=i;
				
				t=ths.eq(i).attr('sorttype');
				options.types[i]=t||options.types[i]||'string';
				
				t=ths.eq(i).attr('colfilter');
				if(options.colFilter) {
					cf[i]=!(t==='false'||t===false||t=='0');
				}
				
				t=ths.eq(i).attr('sgridSort');
				if(options.sort) {
					sort[i]=!(t==='false'||t===false||t=='0');
					if(sort[i]) ths.eq(i).addClass('sgrid-sorting')
				}
			}
			
		},
		
		loadDataFromTable:function(){
			var options =this.options;
			var data=[];
			var trs=this.table.children('tbody').children('tr');
			var tds,ths,v,t;
			for(var i=0;i<trs.length;i++){
				trs.eq(i).addClass('sgrid-row')
				tds=trs.eq(i).children('td');
				
				data[i]=[];
				data[i].row_index=i;
				data[i].show=true;
				
				for(var k=0;k<tds.length;k++){
					v=tds.eq(k).attr('sortdata');
					if(!(v||v==0||v===false)) {
						
						t=tds.eq(k).text();
						if(t) {
							//t=t.replace(/\s/g,'');
							if(t.replace(/\s/g,'')=='') t=null;
						}else t=null;
						
						v= t;
					}
					
					
					switch(options.types[k]){
						case 'number':
						data[i][k]=v!=null?parseInt(v):null;
						break;
						case 'date':
						data[i][k]=v!=null?(new Date(v).getTime()):null;
						break;
						case 'time':
						data[i][k]=v!=null?(parseInt(v.replace(/\:|\s|\-|\//g,''))):null;
						break;
						case 'string':
						data[i][k]=v!=null?v.toString():null;
						break;
					}
						
				}
				
				
			}
			
			
			return data;
		},
		
	};
	
	
	return STable;
});