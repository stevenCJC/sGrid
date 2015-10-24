define(["jquery",'$.multiselect','$.multiselectfilter'],
function($) {
	
	var _re_escape_regex= new RegExp( '(\\' + [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-' ].join('|\\') + ')', 'g' );
	
	function ColFilter(ts, stable, options){
		
		this.stable=stable;
		this.head=ts.head_table;
		this.options=options;
		this.render();
	}
	ColFilter.prototype={
		constructor:ColFilter,
		
		render:function(){
			var me=this;
			var options=this.options;
			this.head.find('thead th').each(function(i) {
				
				if(options.colFilter&&options.colFilter[i]){
					var select=me.makeSelector(i);
					if(select){
						$(this).append(select);
						me.initSelector(select);
						$(this).find('button.ui-multiselect').addClass('sgrid-selectbtn'); 
					}
				}
				
				if(options.sort&&options.sort[i]){
					$(this).append('<i class="sgrid-sorting-icon"></i>');
				}
			});
			
		},
		
		makeSelector:function(i){
			var select = $('<select style="width:50px;display:none;" multiple="multiple" size="5"></select>');
			var exit = [],options=[];
			this.stable.eachColText(i,function(d, j) {
				var text = d;
				if(d.indexOf('sgrid-colfilter-option')>-1){
					text=$.trim($("<div>"+d+"</div>").find('.sgrid-colfilter-option').text());
				}else{
					if (d.match(/<[\s\S]*?>/g)&&d.replace(/\s||(\<\.?>)/g,'')) {
						d=$('<p>'+d+'</p>')
						d.find('.dpn,.dropdown-menu').remove();
						text = $.trim(d.text());
					}
				}
				
				if(text&&text.replace(/\s/g,'')&&exit.indexOf(text)==-1){
					exit.push(text);
					options.push('<option value="' + text.replace(_re_escape_regex, '\\$1') + '">' + text + '</option>')
				}
			});
			//if(exit.length){
				select.html(options.join(''));
				return select;
			//}
		},
		initSelector:function(select){
			var me=this;
			select.multiselect({
				checkAllText:'全     选',
				uncheckAllText:'取消全选',
				selectedText: '',
				noneSelectedText: '',
				position: {
					my: 'left top',
					at: 'left bottom'
				},
				open: function(event, ui) {
					$(".ui-multiselect-menu:visible").find('input[type=search]').focus();
				},
				click: function(event, ui) {
					var array_of_checked_values = $(this).multiselect("getChecked").map(function() {
						return $.trim(this.value);
					}).get();
					var selectvalue = array_of_checked_values.join('|');
					var reg= new RegExp(selectvalue ? $.trim(selectvalue):'.');
					
					me.options._m.pub('search',{index:$(this).parent().index(),text:reg});
					
					if(array_of_checked_values.length){
						$(this).parents('th').addClass('sgrid-colFiltered');
					}else{
						$(this).parents('th').removeClass('sgrid-colFiltered');
					}
					event.stopPropagation()
				},
				close:function(event,ui){
					
				},
				uncheckAll: function(event, ui) {
					me.options._m.pub('search',{index:$(this).parent().index(),text:''});
					$(this).parents('th').removeClass('sgrid-colFiltered');
				},
				checkAll: function() {
					me.options._m.pub('search',{index:$(this).parent().index(),text:''});
					$(this).parents('th').removeClass('sgrid-colFiltered'); 
				} 
			}).multiselectfilter({placeholder:'请输入关键字'}); 
			
		},
		
		destroy:function(){
			
			this.head.find('thead th').each(function(i) {
				$(this).find('select').multiselect('destroy');
				$(this).find('select').remove();
				$(this).removeClass('sgrid-colFiltered').find('.sgrid-sorting-icon').remove();
			});
			
		},
		
	};
	
	
	$("body").on('keyup focus', '.ui-multiselect-menu:visible input[type=search]', function(event) {
		var sg = $(".ui-state-active").parents('.sGrid');
		if(sg.length){
			
			var sgrid=sg.find('.sGrid-body>table').data('sgrid');
			var th=$(".ui-state-active").parents('th');
			var index = th.index();
			
			var val = $(this).val();
			var checkbox=$('.ui-multiselect-menu:visible').find('input:checked');
			
			if(val||checkbox.length){
				th.addClass('sgrid-colFiltered');
			}else{
				th.removeClass('sgrid-colFiltered');
			}
			if(!checkbox.length){
				if(val.indexOf(',')>-1||val.indexOf('，')>-1){
					val=val.replace(/(,|，)/g,'|');
				}
				sgrid.search(index,val ? val : '');
			}
			if(event.keyCode=='13'){
				$('.ui-multiselect-close').trigger('click');
			}
			return false;
		}

	});
	$("body").on('click', '.ui-multiselect-menu:visible input[type=search]', function(event) {
		var sg = $(".ui-state-active").parents('.sGrid');
		if(sg.length){
			setTimeout(function() {
				$('.ui-multiselect-menu:visible input[type=search]').focus();
				$('.ui-multiselect-menu:visible').find('li').css('display', 'list-item');
			}, 200)
		}
		
	});
	
	
	
	
	
	return ColFilter;
	
	
});


