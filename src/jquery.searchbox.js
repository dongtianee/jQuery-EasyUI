/**
 * searchbox - jQuery EasyUI
 * 
 * Licensed under the GPL terms
 * To use it on other terms please contact us
 *
 * Copyright(c) 2009-2012 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	menubutton
 * 
 */
(function($){
	function init(target){
		$(target).hide();
		var span = $('<span class="searchbox"></span>').insertAfter(target);
		var input = $('<input type="text" class="searchbox-text">').appendTo(span);
		$('<span><span class="searchbox-button"></span></span>').appendTo(span);
		
		var name = $(target).attr('name');
		if (name){
			input.attr('name', name);
			$(target).removeAttr('name').attr('searchboxName', name);
		}
		
		return span;
	}
	
	function setSize(target, width){
		var opts = $.data(target, 'searchbox').options;
		var sb = $.data(target, 'searchbox').searchbox;
		if (width) opts.width = width;
		sb.appendTo('body');
		
		if (isNaN(opts.width)){
			opts.width = sb.outerWidth();
		}
		sb._outerWidth(opts.width);
		sb.find('input.searchbox-text')._outerWidth(sb.width() - sb.find('a.searchbox-menu').outerWidth() - sb.find('span.searchbox-button').outerWidth());
		
		sb.insertAfter(target);
	}
	
	function buildMenu(target){
		var state = $.data(target, 'searchbox');
		var opts = state.options;
		
		if (opts.menu){
			state.menu = $(opts.menu).menu({
				onClick:function(item){
					attachMenu(item);
				}
			});
			var selected = state.menu.children('div.menu-item:first[selected]');
			if (!selected.length){
				selected = state.menu.children('div.menu-item:first');
			}
			selected.triggerHandler('click');
			
//			var item = state.menu.menu('getItem', state.menu.children('div.menu-item')[0]);
//			state.menu.children('div.menu-item').triggerHandler('click');
		} else {
			state.searchbox.find('a.searchbox-menu').remove();
			state.menu = null;
		}
		
		function attachMenu(item){
			state.searchbox.find('a.searchbox-menu').remove();
			var mb = $('<a class="searchbox-menu" href="javascript:void(0)"></a>').html(item.text);
			mb.prependTo(state.searchbox).menubutton({
				menu:state.menu,
				iconCls:item.iconCls
			});
			state.searchbox.find('input.searchbox-text').attr('name', $(item.target).attr('name') || item.text);
			setSize(target);
		}
	}
	
	function bindEvents(target){
		var state = $.data(target, 'searchbox');
		var opts = state.options;
		var input = state.searchbox.find('input.searchbox-text');
		var button = state.searchbox.find('.searchbox-button');
		input.unbind('.searchbox').bind('blur.searchbox', function(e){
			opts.value = $(this).val();
			if (opts.value == ''){
				$(this).val(opts.prompt);
				$(this).addClass('searchbox-prompt');
			} else {
				$(this).removeClass('searchbox-prompt');
			}
		}).bind('focus.searchbox', function(e){
			if ($(this).val() != opts.value){
				$(this).val(opts.value);
			}
			$(this).removeClass('searchbox-prompt');
		}).bind('keydown.searchbox', function(e){
			if (e.keyCode == 13){
				e.preventDefault();
				var name = $.fn.prop ? input.prop('name') : input.attr('name');
				opts.value = $(this).val();
				opts.searcher.call(target, opts.value, name);
				return false;
			}
		});
		
		button.unbind('.searchbox').bind('click.searchbox', function(){
			var name = $.fn.prop ? input.prop('name') : input.attr('name');
			opts.searcher.call(target, opts.value, name);
		}).bind('mouseenter.searchbox', function(){
			$(this).addClass('searchbox-button-hover');
		}).bind('mouseleave.searchbox', function(){
			$(this).removeClass('searchbox-button-hover');
		});
	}
	
	function initValue(target){
		var state = $.data(target, 'searchbox');
		var opts = state.options;
		var input = state.searchbox.find('input.searchbox-text');
		if (opts.value == ''){
			input.val(opts.prompt);
			input.addClass('searchbox-prompt');
		} else { 
			input.val(opts.value);
			input.removeClass('searchbox-prompt');
		}
	}
	
	$.fn.searchbox = function(options, param){
		if (typeof options == 'string'){
			return $.fn.searchbox.methods[options](this, param);
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'searchbox');
			if (state){
				$.extend(state.options, options);
			} else {
				state = $.data(this, 'searchbox', {
					options: $.extend({}, $.fn.searchbox.defaults, $.fn.searchbox.parseOptions(this), options),
					searchbox: init(this)
				});
			}
			buildMenu(this);
			initValue(this);
			bindEvents(this);
			setSize(this);
		});
	}
	
	$.fn.searchbox.methods = {
		options: function(jq){
			return $.data(jq[0], 'searchbox').options;
		},
		menu: function(jq){
			return $.data(jq[0], 'searchbox').menu;
		},
		textbox: function(jq){
			return $.data(jq[0], 'searchbox').searchbox.find('input.searchbox-text');
		},
		getValue: function(jq){
			return $.data(jq[0], 'searchbox').options.value;
		},
		setValue: function(jq, value){
			return jq.each(function(){
				$(this).searchbox('options').value = value;
				$(this).searchbox('textbox').val(value);
				$(this).searchbox('textbox').blur();
			});
		},
		getName: function(jq){
			return $.data(jq[0], 'searchbox').searchbox.find('input.searchbox-text').attr('name');
		},
		selectName: function(jq, name){
			return jq.each(function(){
				var menu = $.data(this, 'searchbox').menu;
				if (menu){
					menu.children('div.menu-item[name="'+name+'"]').triggerHandler('click');
				}
			});
		},
		destroy: function(jq){
			return jq.each(function(){
				var menu = $(this).searchbox('menu');
				if (menu){
					menu.menu('destroy');
				}
				$.data(this, 'searchbox').searchbox.remove();
				$(this).remove();
			});
		},
		resize: function(jq, width){
			return jq.each(function(){
				setSize(this, width);
			});
		}
	};
	
	$.fn.searchbox.parseOptions = function(target){
		var t = $(target);
		return {
			width: (parseInt(target.style.width) || undefined),
			prompt: t.attr('prompt'),
			value: t.val(),
			menu: t.attr('menu'),
			searcher: (t.attr('searcher') ? eval(t.attr('searcher')) : undefined)
		};
	};
	
	$.fn.searchbox.defaults = {
		width:'auto',
		prompt:'',
		value:'',
		menu:null,
		searcher:function(value,name){}
	};
})(jQuery);