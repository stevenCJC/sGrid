define(['jquery','utils/SGrid/STable','utils/SGrid/SData','utils/SGrid/TableSgrid','utils/SGrid/EditTd','utils/SGrid/ColFilter','utils/SGrid/mediator'],
function($,STable,SData,TableSgrid,EditTd,ColFilter,Mediator){
	
	
	function SGrid(table,options){
		
		this.options=options=$.extend({
			fixHeader:{top:0},
			colFilter:[],
			sort:[],
			edit:null,
			_m:new Mediator(),
			_sid:Math.random().toString().replace(/\./g,''),
		},options);
		
		var me=this;
		
		
		
		this.ts=new TableSgrid(table,options);
		
		var st=this.sTable=new STable(this.ts,options);
		
		this.sData=new SData(st.loadDataFromTable(),options);
		
		this.colFilter=new ColFilter(this.ts,st,options);
		
		if(options.edit){
			this.edittd=new EditTd(table,options);
		}
		
		this.ts.resetWidth();
		
		st.bind({
			onSort:function(index,by){
				me.sort(index,by);
			},
		});
		
		options._m.sub('search',function(d){me.search(d.index,d.text)});
	}
	
	SGrid.prototype={
		constructor:SGrid,
		
		destroy:function(){
			
			if(this.sTable)this.sTable.destroy();
			if(this.sData)this.sData.destroy();
			if(this.ts)this.ts.destroy();
			if(this.colFilter)this.colFilter.destroy();
			if(this.edittd)this.edittd.destroy();
			
		},
		
		refresh:function(){
			this.sTable.resetRows();
			this.loadDataFromTable();
			this.ts.resetWidth();
		},
		
		sort:function(index,order){
			
			this.sTable.draw(this.sData.sort(index,order).get());
			
		},
		
		search:function(index,str){
			
			this.sTable.draw(this.sData.search(index,str).get());
			
		},
		
		loadDataFromTable:function(){
			this.sData.load(this.sTable.loadDataFromTable());
		},
		
		data:function(){
			
			return this.sData;
			
		},
		
		table:function(){
			
			return this.sTable;
			
		},
		
		
		
		
	};
	
	
	return SGrid;
	
});