define(["jquery",'utils/dict','utils/chosen','utils/datetimepicker','bootstrap','$.form'], function($) {
	

	function EditTd(el,options){
		this.el=$(el);
		this.currentEdit=null;
		this.lastEdit=null;
		this.options=options;
		this.data=options.edit.data;
		this.types=options.edit.types;
		this.el.data('edittd',this);
		this.sid=((new Date).getTime()*Math.random()).toString().replace(/\./g,'');
		this.init();
		
		this.editFocus={row:-1,col:-1};
		
	}
	
	EditTd.prototype={
		constructor:EditTd,
		init:function(){
			
			var me=this; 
			var lastClickTime=(new Date).getTime();
			this.el.on('click', '[data-edittd]',function(e){
				//限制双击
				var time=(new Date).getTime();
				if(time-lastClickTime<300){
					return false;
				}else lastClickTime=time;
				if(e.target.tagName=='A'&&$(e.target).attr('target')){
					
					return true;
				}
				//第二次点击的时候，
				if(!this.editTD){
					$('body').click();
					//if(me.currentEdit) try{ me.currentEdit.destroy(); }catch(e){console.log('Error:' ,e);};
					me.editInit(this);
					this.editTD=true;
					return false;
				} else{
					this.editTD=false;
				}
			});
			
			$('body').on('click.'+this.sid,function(){
				this.editFocus={row:-1,col:-1};
				if(me.currentEdit) 
					try{ me.currentEdit.destroy(); }catch(e){console.log('Error:' ,e);};
			});
			
			$('.body').on('keydown.'+this.sid,function(e){
				switch(e.keyCode){
					case 9:
					if(e.shiftKey) me.nextEdit(1);
					else me.nextEdit();
					return false;
					break;
					case 13:
					if(me.editFocus.col>-1&&!e.shiftKey&&!e.altKey&&!e.ctrlKey) me.nextEdit();
					break;
					case 37:
					if(e.ctrlKey&&me.editFocus.col>-1) me.nextEdit(1);
					break;
					case 38:
					if(e.ctrlKey)
						if(me.editFocus.row>0){
							var td=me.getTdByPosition({row:me.editFocus.row-1,col:me.editFocus.col});
							if(me.currentEdit) 
								try{ me.currentEdit.destroy(); }catch(e){console.log('Error:' ,e);};
							me.editInit(td);
							
						}
					break;
					case 39:
					if(e.ctrlKey&&me.editFocus.col>-1) me.nextEdit();
					break;
					case 40:
					if(e.ctrlKey)
						if(me.editFocus.row<me.el.children('tbody').children('tr[data-item-id]').length-1){
							var td=me.getTdByPosition({row:me.editFocus.row+1,col:me.editFocus.col});
							if(me.currentEdit) 
								try{ me.currentEdit.destroy(); }catch(e){console.log('Error:' ,e);};
							me.editInit(td);
						}
					break;
				}
			});
		},
		
		
		
		setData:function(data){
			this.data=data;
		},
		
		editInit:function(el){
			if(!el&&!el.length)return;
			el=$(el);
			var readonly=!!el.data('readonly');
			if(readonly) return;
			
			var type=el.data('type');
			var field=el.data('edittd');
			var td=el[0].tagName=='TD'?el:el.parents('td').eq(0);
			var tr=el.parents('tr').eq(0);
			var id=tr.data('row-id')||tr.data('item-id');
			var idField=tr.data('field');
			var frd=findRowData(idField,id,this.data);
			var rowData=frd.data;
			var fieldData=rowData[field];
			var fieldDefind=this.types[type];
			
			this.currentEdit={
				el:el,
				td:td,
				tr:tr,
				type:type,
				rowData:rowData,
				fieldData:fieldData,
				fieldDefind:fieldDefind,
			};
			
			this.editFocus.row=frd.index;
			this.editFocus.col=tr.children('td').index(td);
			
			this[type+'_edit'](tr,td,el,field,rowData,fieldData,fieldDefind);
				
		},
		destroy:function(){
			
			this.currentEdit&&this.currentEdit.destroy();
			this.el.off();
			this.el.data('edittd',null);
			this.el=null;
			$('body').off('click.'+this.sid);
			$('.body').off('keydown.'+this.sid);
			this.options=null;
		},
		
		popover_edit:function(tr,td,el,field,rowData,fieldData,fieldDefind){
			
			fieldDefind.afterEdit=fieldDefind.afterEdit||function(){};
			fieldDefind.beforeEdit=fieldDefind.beforeEdit||function(){};
			
			var placement=el.data('placement');
			
			var me=this;
			
			var form=$('<form id="EditTD-Form"></form>');
			var v=fieldDefind.beforeEdit(tr,td,el,fieldData,rowData);
			
			var height=td.height();
			form.html(v);
			
			var t=el.attr('title');
			
			
			
			var wrap=$('<a href="javascript:" class="sgrid-edittd-popover-div" >');
			td.addClass('sgrid-edittd-popover sgrid-edittd-editing');
			var child=td.children();
			wrap.html(child);
			td.html(wrap);
			var valign=td.css('vertical-align');
			wrap.css({'text-align':td.css('text-align'),'vertical-align':valign,height:height});
			
			$(el).popover({animation:true,title:t,placement:placement||'bottom',delay:0,html:true,content:form,container:'body'});
			$(el).popover('show');
			
			var popo;
			
			setTimeout(function(){ 
				popo=$('.popover.in'); 
				popo.on('click',function(){ return false; }); 
				wrap.focus();
			},10); 
			
			this.currentEdit.destroy=function(){
				destroy.apply(popo[0],{});
			};
			
			function destroy(e){
				if(!popo) return false;
				me.editFocus={row:-1,col:-1};
				td.append(child);
				wrap.remove();
				td.removeClass('sgrid-edittd-popover sgrid-edittd-editing');
				var formObj=form.formToObj();
				var fb=fieldDefind.afterEdit.call(this,tr,td,field,formObj,rowData[field],rowData); 
				popo.off();
				el.popover('destroy');
				if(typeof fb!='undefined'){
					var tr=el.parents('tr[data-item-id]');
					//var 
					el.html(fb);
				}
				me.endEdit(el);
				popo=null;
				form=null;
				td=null;
				wrap=null;
				child=null;
			}
			
		},
		
		
		number_edit:function(tr,td,el,field,rowData,fieldData,fieldDefind){
			this.text_edit(tr,td,el,field,rowData,fieldData,fieldDefind,1);
		},
		text_edit:function(tr,td,el,field,rowData,fieldData,fieldDefind,isNumber){
			
			fieldDefind.afterEdit=fieldDefind.afterEdit||function(){};
			fieldDefind.beforeEdit=fieldDefind.beforeEdit||function(){};
			
			td.addClass('sgrid-edittd-text sgrid-edittd-editing');
			
			var me=this;
			var input=$('<input type="text" >');
			
			input.on('click',function(){return false;});
			if(isNumber)input.on('keydown.'+this.sid,function(e){
				var keycode=[9,13,8,108,46,37,38,39,40,136];
				if((e.keyCode<48||e.keyCode>57&&e.keyCode<96||e.keyCode>105)&&keycode.indexOf(e.keyCode)==-1){
					return false;
				}
			});
			
			var valign=td.css('vertical-align');
			input.css({'text-align':td.css('text-align'),'vertical-align':valign,height:td.height()-2});
			
			
			this.currentEdit.destroy=function(){
				destroy.apply(input[0],{});
			};
			
			var v=fieldDefind.beforeEdit(tr,td,input,fieldData,rowData);
			v=v||fieldData;
			
			input.val(v);
			el.html(input);
			
			setTimeout(function(){
				input.focus().select();
			},16);
			
			function destroy(e){
				if(!input) return false;
				me.editFocus={row:-1,col:-1};
				td.removeClass('sgrid-edittd-text sgrid-edittd-editing');
				var fb=fieldDefind.afterEdit.call(this,tr,td,field,this.value,rowData[field],rowData);
				if(fb!=undefined)
					el.html(fb);
				else el.html(this.value);
				me.endEdit(el);
				input.off();
				input=null;
			}
			
		},
		div_edit:function(tr,td,el,field,rowData,fieldData,fieldDefind,isNumber){
			
			fieldDefind.afterEdit=fieldDefind.afterEdit||function(){};
			fieldDefind.beforeEdit=fieldDefind.beforeEdit||function(){};
			
			td.addClass('sgrid-edittd-div sgrid-edittd-editing');
			
			var placeholder=$(el).data('placeholder');
			
			var me=this;
			var div=$('<div contenteditable="true" ></div>');
			
			var valign=td.css('vertical-align');
			div.css({'text-align':td.css('text-align'),'vertical-align':valign,'min-height':td.height()-12});
			
			div.on('click',function(){return false;});
			
			this.currentEdit.destroy=function(){
				destroy.apply(div[0],{});
			};
			
			var v=fieldDefind.beforeEdit(tr,td,div,fieldData,rowData);
			v=v||fieldData;
			//v=window.util.encodeText(v);
			div.html(v);
			el.html(div);
			
			if(div.find('.sgrid-edittd-div-tips').length) 
				div.find('.sgrid-edittd-div-tips').remove();
			
			div.focus();
			var tips='<span class="sgrid-edittd-div-placeholder">'+(placeholder||'请输入内容')+'</span>';
			function destroy(e){
				if(!div) return false;
				me.editFocus={row:-1,col:-1};
				td.removeClass('sgrid-edittd-div sgrid-edittd-editing');
				var fb=fieldDefind.afterEdit.call(this,tr,td,field,this.innerHTML,rowData[field],rowData);
				//fieldData[field]=isNumber?parseInt(this.value):this.value;
				
				if(fb!=undefined)
					el.html(fb||tips);
				else el.html(this.innerHTML||tips);
				me.endEdit(el);
				div.off();
				div=null;
			}
			
		},
		date_edit:function(tr,td,el,field,rowData,fieldData,fieldDefind){
			this.datetime_edit(tr,td,el,field,rowData,fieldData,fieldDefind,'date');
		},
		time_edit:function(tr,td,el,field,rowData,fieldData,fieldDefind){
			this.datetime_edit(tr,td,el,field,rowData,fieldData,fieldDefind,'time');
		},
		datetime_edit:function(tr,td,el,field,rowData,fieldData,fieldDefind,type){
			type=type||'datetime';
			fieldDefind.afterEdit=fieldDefind.afterEdit||function(){};
			fieldDefind.beforeEdit=fieldDefind.beforeEdit||function(){};
			
			var me=this;
			var input=$('<input type="text">');
			
			input.on('click',function(){return false;});
			
			td.addClass('sgrid-edittd-text sgrid-edittd-editing');
			
			var valign=td.css('vertical-align');
			input.css({'text-align':td.css('text-align'),'vertical-align':valign,height:td.height()-2});
			
			var v=fieldDefind.beforeEdit(tr,td,input,fieldData,rowData);
			v=v||fieldData;
			
			input.val(v);
			switch(type){
				case 'datetime':
				input.css({width:120}).pickDateTime();
				break;
				case 'date':
				input.css({width:80}).pickDate();
				break;
				case 'time':
				input.css({width:40}).pickTime();
				break;
			}
			
			el.html(input);
			setTimeout(function(){
				input.focus().select();
			},16);
			
			this.currentEdit.destroy=function(){
				destroy.apply(input[0],{});
			};
			function destroy(e){
				if(!input) return false;
				me.editFocus={row:-1,col:-1};
				td.removeClass('sgrid-edittd-text sgrid-edittd-editing');
				var fb=fieldDefind.afterEdit.call(this,tr,td,field,this.value,rowData[field],rowData);
				if(fb!=undefined)
					el.html(fb);
				else el.html(this.innerHTML);
				me.endEdit(el);
				input.pickDateTime('destroy');
				input.off();
				input=null;
			}
			
		},
		
		multiselect_edit:function(tr,td,el,field,rowData,fieldData,fieldDefind,isMultiple){
			this.select_edit(tr,td,el,field,rowData,fieldData,fieldDefind,1);
		},
		select_edit:function(tr,td,el,field,rowData,fieldData,fieldDefind,isMultiple){
			fieldDefind.afterEdit=fieldDefind.afterEdit||function(){};
			fieldDefind.beforeEdit=fieldDefind.beforeEdit||function(){};
			
			var width=td.width();
			
			var me=this,selector=null;
			var options=fieldDefind.options[field];
			
			td.addClass('sgrid-edittd-select sgrid-edittd-editing');
			
			var v=fieldDefind.beforeEdit(tr,td,selector,fieldData,rowData);
			v=v||fieldData;
			
			if(options.constructor==String){
				
				selector=isMultiple?$(window.dict[options].toSelect({value:v,multiple:true,nullOption:false})):$(window.dict[options].toSelect({value:v,nullOption:false}));
			}else {
				window.dict.add('EditTD_tmp',options);
				selector=isMultiple?$(window.dict['EditTD_tmp'].toSelect({value:v,multiple:true,nullOption:false})):$(window.dict['EditTD_tmp'].toSelect({value:v,nullOption:false}));
			}
			
			selector.on(isMultiple?'select2-blur':'change',destroy);
			
			selector.on('click',function(){
				return false;
			});
			
			
			this.currentEdit.destroy=function(){
				destroy.apply(selector[0],{});
			};
			
			var height=td.height()-2;
			
			el.html(selector);
			
			selector.chosen({height:height+2},{
				minimumResultsForSearch:-1,
			});
			
			var chosen=selector.prev('.select2-container');
			chosen.find('.select2-choice').css({width:width+4,height:height,'line-height':height+'px', 'padding-left':4});
			selector.select2('open');
			selector.on("select2-close", function(){ 
				destroy.apply(selector[0],{});
			})
			function destroy(e){
				if(!selector) return false;
				me.editFocus={row:-1,col:-1};
				td.removeClass('sgrid-edittd-select sgrid-edittd-editing');
				var fb=fieldDefind.afterEdit.call(this,tr,td,field,this.value,rowData[field],rowData);
				//fieldData[field]=this.value;
				selector.select2('destroy');
				if(fb!=undefined)
					el.html(fb);
				else el.html(this.innerHTML);
				me.endEdit(el);
				selector.off();
				selector=null;
				return false;
			}
		},
		
		
		
		
		endEdit:function(el){
			delete el[0].editTD;
			if(this.currentEdit){
				this.lastEdit=this.currentEdit;
				this.currentEdit=null;
			}
			this.options._m.pub('refresh');
		},
		
		
		
		nextEdit:function(_reverse){
			
			//重新获取正在编辑TD的坐标
			var td=this.el.find('td.sgrid-edittd-editing');
			if(!td.length) return ;//避免多个editTD冲突
			
			this.editFocus.row= td.parents('tbody').children().index(td.parent()[0]);
			this.editFocus.col = td.parent().children().index(td);
			
			var tmp=this.editFocus;
			
			if(this.currentEdit) 
				try{ this.currentEdit.destroy(); }catch(e){console.log('Error:' ,e);};
			this.editFocus=tmp;
			this.editInit(this.getNextEditTd(_reverse));
			
		},
		getTdByPosition:function(p){
			var td=this.el.children('tbody').children('tr:nth-child('+(p.row+1)+')').children('td:nth-child('+(p.col+1)+')'); 
			if(td.data('edittd')) return td; 
			else return td.find('[data-edittd]'); 
		},
		getCurrentEtd:function(){
			var td=this.el.find('tbody>tr:nth-child('+(this.editFocus.row+1)+')>td:nth-child('+(this.editFocus.col+1)+')');
			if(td.data('edittd')) return td;
			else return td.find('[data-edittd]');
		},
		
		getNextEditTd:function(_reverse){
			
			var etd=this.getCurrentEtd();
			var tr=etd.parents('tr').eq(0);
			var row_etd=etd.parents('tr').eq(0).find('[data-edittd]');
			var index = row_etd.index(etd);
			var target;
			if(!_reverse){
				if(index<row_etd.length-1) {
					target=row_etd.eq(index+1);
				}else{
					next=tr.nextAll().find('[data-edittd]').eq(0);
					if(next.length) {
						target = next;
					}else target = etd
				}
			}else{
				if(index>0) {
					target = row_etd.eq(index-1);
				}else{
					next=tr.prevAll().find('[data-edittd]').eq(-1);
					if(next.length){
						target = next;
					}else{
						target = etd
					}
				}
			}
			if(!target.length) target=this.el.find('[data-edittd]:first').eq(0);
			if(target[0].tagName=='TD') {
				this.editFocus.row= target.parent().parent().children().index(target.parent()[0]);
				this.editFocus.col = target.parent().children().index(target);
			}else {
				var td=target.parents('td').eq(0);
				this.editFocus.row= td.parents('tbody').children().index(td.parent()[0]);
				this.editFocus.col = td.parent().children().index(target);
			}
			
			return target;
		},
		
	};
	
	return EditTd;
	
	function findRowData(field,value,rows){
		var d={};
		for(var i=0;i<rows.length;i++){
			if(rows[i][field]==value){
				d.data= rows[i];
				d.index=i;
				break;
			}
		}
		return d;
	}
	
});