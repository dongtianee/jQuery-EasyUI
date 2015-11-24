/**
 * menu - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 */
(function($){
	
	/**
	 * initialize the target menu, the function can be invoked only once
	 */
	function init(target){
		$(target).appendTo('body');
		$(target).addClass('menu-top');	// the top menu
		
		var menus = [];
		adjust($(target));
		
		for(var i=0; i<menus.length; i++){
			var menu = menus[i];
			wrapMenu(menu);
			menu.find('>div.menu-item').each(function(){
				bindMenuItemEvent($(this));
			});
			
			menu.find('div.menu-item').click(function(){
				// only the sub menu clicked can hide all menus
				if (!this.submenu){
					hideAll(target);
				}
				return false;
			});
		}
		
		
		function adjust(menu){
			menus.push(menu);
			menu.find('>div').each(function(){
				var item = $(this);
				var submenu = item.find('>div');
				if (submenu.length){
					submenu.insertAfter(target);
					item[0].submenu = submenu;
					adjust(submenu);
				}
			});
		}
		
		/**
		 * bind menu item event
		 */
		function bindMenuItemEvent(item){
			item.hover(
				function(){
					// hide other menu
					item.siblings().each(function(){
						if (this.submenu){
							hideMenu(this.submenu);
						}
						$(this).removeClass('menu-active');
					});
					
					// show this menu
					item.addClass('menu-active');
					var submenu = item[0].submenu;
					if (submenu){
						var left = item.offset().left + item.outerWidth() - 2;
						if (left + submenu.outerWidth() > $(window).width()){
							left = item.offset().left - submenu.outerWidth() + 2;
						}
						showMenu(submenu, {
							left: left,
							top:item.offset().top - 3
						});
					}
				},
				function(e){
					item.removeClass('menu-active');
					var submenu = item[0].submenu;
					if (submenu){
						if (e.pageX>=parseInt(submenu.css('left'))){
							item.addClass('menu-active');
						} else {
							hideMenu(submenu);
						}
						
					} else {
						item.removeClass('menu-active');
					}
					
				}
			);
		}
		
		/**
		 * wrap a menu and set it's status to hidden
		 * the menu not include sub menus
		 */
		function wrapMenu(menu){
			menu.addClass('menu').find('>div').each(function(){
				var item = $(this);
				if (item.hasClass('menu-sep')){
					item.html('&nbsp;');
				} else {
					var text = item.addClass('menu-item').html();
					item.empty().append($('<div class="menu-text"></div>').html(text));
					var icon = item.attr('icon');
					if (icon){
						$('<div class="menu-icon"></div>').addClass(icon).appendTo(item);
					}
					if (item[0].submenu){
						$('<div class="menu-rightarrow"></div>').appendTo(item);	// has sub menu
					}
					
					if ($.boxModel == true){
						var height = item.height();
						item.height(height - (item.outerHeight() - item.height()));
					}
				}
			});
			menu.hide();
		}
	}
	
	
	
	function onDocClick(e){
		var target = e.data;
		hideAll(target);
		return false;
	}
	
	/**
	 * hide top menu and it's all sub menus
	 */
	function hideAll(target){
		var opts = $.data(target, 'menu').options;
		hideMenu($(target));
		$(document).unbind('.menu');
		opts.onHide.call(target);
		
//		var state = $.data(target, 'menu');
//		if (state){
//			hideMenu($(target));
//			$(document).unbind('.menu');
//			state.options.onHide.call(target);
//		}
		return false;
	}
	
	/**
	 * show the top menu
	 */
	function showTopMenu(target, pos){
		var opts = $.data(target, 'menu').options;
		if (pos){
			opts.left = pos.left;
			opts.top = pos.top;
		}
		showMenu($(target), {left:opts.left,top:opts.top}, function(){
			$(document).bind('click.menu', target, onDocClick);
			opts.onShow.call(target);
		});
	}
	
	function showMenu(menu, pos, callback){
		if (!menu) return;
		
		if (pos){
			menu.css(pos);
		}
		menu.show(1, function(){
			if (!menu[0].shadow){
				menu[0].shadow = $('<div class="menu-shadow"></div>').insertAfter(menu);
			}
			menu[0].shadow.css({
				display:'block',
				zIndex:$.fn.menu.defaults.zIndex++,
				left:menu.css('left'),
				top:menu.css('top'),
				width:menu.outerWidth(),
				height:menu.outerHeight()
			});
			menu.css('z-index', $.fn.menu.defaults.zIndex++);
			
			if (callback){
				callback();
			}
		});
	}
	
	function hideMenu(menu){
		if (!menu) return;
		
		hideit(menu);
		menu.find('div.menu-item').each(function(){
			if (this.submenu){
				hideMenu(this.submenu);
			}
			$(this).removeClass('menu-active');
		});
		
		function hideit(m){
			if (m[0].shadow){
				m[0].shadow.hide();
			}
			m.hide();
			
		}
	}
	
	$.fn.menu = function(options, param){
		if (typeof options == 'string'){
			switch(options){
				case 'show':
					return this.each(function(){
						showTopMenu(this, param);
					});
				case 'hide':
					return this.each(function(){
						hideAll(this);
					});
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'menu');
			if (state){
				$.extend(state.options, options);
			} else {
				state = $.data(this, 'menu', {
					options: $.extend({}, $.fn.menu.defaults, options)
				});
				init(this);
			}
			$(this).css({
				left: state.options.left,
				top: state.options.top
			});
		});
	};
	
	$.fn.menu.defaults = {
		zIndex:110000,
		left: 0,
		top: 0,
		onShow: function(){},
		onHide: function(){}
	};
})(jQuery);
