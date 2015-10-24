define(["jquery",'utils/SGrid/_/sgrid_wrap'], function($) {
	
	
	//此类主要负责table的分割，和协调各个部分的表现
	function TableSgrid(table,options){
		this.options=options;
		this.sgrid=null;
		this.table=$(table);
		this.head_table=null;
		//this.foot_table=null;
		this.offset=this.table.offset();
		this.init();
		
		var me=this;
		this.options._m.sub('reset',function(){me.reset();});
		this.options._m.sub('resetWidth',function(){me.resetWidth();});
		this.options._m.sub('resetPosition',function(){me.resetPosition();});
	}
	
	TableSgrid.prototype={
		constructor:TableSgrid,
		init:function(){
			
			var twrap = this.sgrid = $(window.TPL['sgrid_wrap']({options:this.options}));
			
			this.table.before(twrap);//插入文档
			
			if(this.table.find('thead').length) this.head_table=partTable('thead',this.table);
			
			//if(this.table.find('tfoot').length) this.foot_table=partTable('tfoot',this.table);
			
			//this.head_table.css({'table-layout':'fixed'});
			
			twrap.find('.sGrid-body').append(this.table);
			twrap.find('.sGrid-head').append(this.head_table);
			//twrap.find('.sGrid-foot').append(this.foot_table);
			
			this.reset();
			
			this.bind();
			
		},
		
		reset:function(){
			this.resetWidth();
			this.resetPosition();
		},
		
		resetWidth:function(){
			if(!this.options) return;
			var table_ths,sort=this.options.sort;
			try{
				table_ths=this.table.children('thead').children('tr:first-child').children('th');
			}catch(e){}
			if(!table_ths) return false;
			
			var head_ths=this.head_table.children('thead').children('tr:first-child').children('th');
			//if(this.table.find('tbody>tr').length){
				table_ths.css('min-width','auto');
				head_ths.css('min-width','auto');
			//}
			//if(this.foot_table) var foot_ths=this.foot_table.children('tfoot').children('tr:first-child').children('th');
			if(this.head_table){
				var w,ow,attW=[],wP=false;
				for(var i=0,l=head_ths.length;i<l;i++){
					attW[i]=table_ths.eq(i).attr('width');
				}
				for(var i=0,l=head_ths.length;i<l;i++){
					w=table_ths.eq(i).width();
					if(attW[i]){
						if(attW[i].toString().indexOf('%')==-1)
							head_ths.eq(i).css('min-width',w);
					}else head_ths.eq(i).css('min-width',w);
				}
				for(var i=0,l=head_ths.length;i<l;i++){
					w=head_ths.eq(i).width();
					if(attW[i]){
						if(attW[i].indexOf('%')==-1)
							table_ths.eq(i).css('min-width',w);
					}else table_ths.eq(i).css('min-width',w);
				}
				for(var i=0,l=head_ths.length;i<l;i++){
					if(attW[i]&&attW[i].indexOf('%')>-1){
						w=head_ths.eq(i).width();
						table_ths.eq(i).css('min-width',w);
					}
				}
				for(var i=0,l=head_ths.length;i<l;i++){
					if(attW[i]&&attW[i].indexOf('%')>-1){
						w=table_ths.eq(i).width();
						head_ths.eq(i).css('min-width',w);
					}
				}
			}
		},
		
		resetPosition:function(){
			if(this.head_table){
				this.table.parent().css('margin-top',-this.table.children('thead').height());
			}
		},
		
		bind:function(){
			if(this.options.fixHeader)
				$(window).on('scroll.'+this.options._sid,this.onScrollThrottle());
			$(window).on('resize.'+this.options._sid,this.onResizeThrottle());
		},
		
		onScrollThrottle:function(){
			var me=this;
			return _.throttle(function(e){
				
				var st=$(document).scrollTop();
				var shead=me.head_table.parent();
				var os=me.offset;
				var width=shead.width();
				var top=me.options.fixHeader.top;
				if(!os) {
					os=me.sgrid.offset();
					me.offset=os;
				}
				if(os.top<st+top && !shead.hasClass('sgrid-fixed')){
					shead.css({left:os.left,top:top,width:width});
					shead.addClass('sgrid-fixed');
					me.reset();
				}else if(os.top>=st+top && shead.hasClass('sgrid-fixed')){
					shead.css({left:'auto',top:'auto',width:'100%'});
					shead.removeClass('sgrid-fixed');
				}
				me.options._m.pub('scroll');
			},200);
			
		},
		onResizeThrottle:function(){
			var me=this;
			return _.throttle(function(e){
				me.reset();
				me.options._m.pub('resize');
			},200);
			
		},
		
		destroy:function(){
			$(window).off('scroll.'+this.options._sid);
			$(window).off('resize.'+this.options._sid);
			this.options=null;
			this.table=null;
			this.head_table=null;
			//this.foot_table=null;
		},
	};
	
	return TableSgrid;
	
	
	
	function partTable(part,table){
		var newPart=$(table).children(part).clone(true);
		newPart=$('<table></table>').append(newPart);
		newPart.attr('class',$(table).attr('class')).attr('style',$(table).attr('style'));
		table.children(part).css({opacity:0});
		return newPart;
	}
	
	
	
});