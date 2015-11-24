/**
 * dmenu - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2009 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	shadow
 * 
 * Options:
 * 	minWidth: integer, the menu minimum width. default 150
 * 	shadow: boolean, true to show shadow and false to hide. default true
 * 	minZIndex: integer, the menu's zIndex value. default 500
 */
(function($){
	$.fn.dmenu = function(options){
		options = $.extend({}, $.fn.dmenu.defaults, options || {});
		
		return this.each(function(){
			
			$('li ul li a', this).each(function(){
				if (/^[u4E00-u9FA5]/.test($(this).html()) == false && $.browser.msie) {
					$(this).css('padding', '7px 20px 5px 30px');
				}
			});
			$('li.dmenu-sep', this).html('&nbsp;');
			
			var mainmenu = $(this);
			var menus = mainmenu.find('ul').parent();
			menus.each(function(i) {
				$(this).css('z-index', options.minZIndex + menus.length - i);
				if (mainmenu[0] != $(this).parent()[0]) {
					if ($('>ul', this).length > 0) {
						$('>a', this).append('<span class="dmenu-right-arrow"></span>');
					}
				} else {
					if ($('>ul', this).length > 0) {
						$('<span></span>').addClass('dmenu-down-arrow')
								.css('top', $(this).height()/2-4)
								.appendTo($('>a', this));
					}
				}
				if (options.shadow) {
					var shadow = $('<div class="dmenu-shadow"><div class="dmenu-shadow-inner"></div></div>');
					shadow.css({
						width:20,
						height:20
					});
					shadow.prependTo(this);
					$('.dmenu-shadow-inner', shadow).shadow({width:5, fit:true, hidden:true});
				}
				
			});
			
			$('a', this).each(function(){
				var icon = $(this).attr('icon');
				if (icon) {
					$('<span></span>').addClass('dmenu-icon').addClass(icon).appendTo(this);
				}
			});
			
			// show the main menu
			$('>li', this).hover(
					function(){
						var menu = $(this).find('ul:eq(0)');
						if (menu.length == 0) return;
						
						$('a', menu).css('width', 'auto');
						var menuWidth = menu.width();
						if (menuWidth < options.minWidth) {
							menuWidth = options.minWidth;
						}
						if ($.boxModel == true) {
							$('>li>a', menu).css('width', menuWidth - 45);
						} else {
							$('>li', menu).css('width', menuWidth);
							$('>li>a', menu).css('width', menuWidth);
						}
						
						var parent = menu.parent();
						if (parent.offset().left + menu.outerWidth() > $(window).width()) {
							var left = menu.offset().left;
							left -= parent.offset().left + menu.outerWidth() - $(window).width() + 5;
							menu.css('left', left);
						}
						$('li:last', menu).css('border-bottom', '0px');
						
						menu.fadeIn('normal');
						$('>div.dmenu-shadow', this).css({
							left: parseInt(menu.css('left')) - 5,
							top: $(this).height(),
							width: menu.outerWidth() + 10,
							height: menu.outerHeight() + 5,
							display: 'block'
						});
						$('.dmenu-shadow-inner', this).shadow({hidden:false});
					},
					
					function(){
						var menu = $(this).find('ul:eq(0)');
						menu.fadeOut('normal');
						$('div.dmenu-shadow', this).css('display', 'none');
					}
			);
			
			// show the sub menu
			$('li ul li', this).hover(
					function(){
						var menu = $(this).find('ul:eq(0)');
						if (menu.length == 0) return;
						
						$('a', menu).css('width', 'auto');
						var menuWidth = menu.width();
						if (menuWidth < options.minWidth) {
							menuWidth = options.minWidth;
						}
						if ($.boxModel == true) {
							$('>li>a', menu).css('width', menuWidth - 45);
						} else {
							$('>li', menu).css('width', menuWidth);
							$('>li>a', menu).css('width', menuWidth);
						}
						
						var parent = menu.parent();
						if (parent.offset().left + parent.outerWidth() + menu.outerWidth() > $(window).width()) {
							menu.css('left', - menu.outerWidth() + 5);
						} else {
							menu.css('left', parent.outerWidth() - 5);
						}
						
						menu.fadeIn('normal');
						$('>div.dmenu-shadow', this).css({
							left: parseInt(menu.css('left')) - 5,
							top: parseInt(menu.css('top')),
							width: menu.outerWidth() + 10,
							height: menu.outerHeight() + 5,
							display: 'block'
						});
						$('.dmenu-shadow-inner', this).shadow({hidden:false});
					},
					
					function(){
						$('>div.dmenu-shadow', this).css('display', 'none');
						$(this).children('ul:first').animate({height:'hide',opacity:'hide'});
					}
			);
		});
	};
	
	$.fn.dmenu.defaults = {
			minWidth:150,
			shadow:true,
			minZIndex:500
	};
	
	$(function(){
		$('ul.dmenu').dmenu();
	});
})(jQuery);