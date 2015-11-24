/**
 * menubutton - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 *   linkbutton
 *   menu
 */
(function($){
	
	function init(target){
		var opts = $.data(target, 'menubutton').options;
		var btn = $(target);
		btn.removeClass('m-btn-active m-btn-plain-active');
		btn.linkbutton(opts);
		if (opts.menu){
			$(opts.menu).menu({
				onShow: function(){
					btn.addClass((opts.plain==true) ? 'm-btn-plain-active' : 'm-btn-active');
				},
				onHide: function(){
					btn.removeClass((opts.plain==true) ? 'm-btn-plain-active' : 'm-btn-active');
				}
			});
		}
		btn.unbind('.menubutton');
		if (opts.disabled == false && opts.menu){
			btn.bind('click.menubutton', function(){
				showMenu();
				return false;
			});
			var timeout = null;
			btn.bind('mouseenter.menubutton', function(){
				timeout = setTimeout(function(){
					showMenu();
				}, opts.duration);
				return false;
			}).bind('mouseleave.menubutton', function(){
				if (timeout){
					clearTimeout(timeout);
				}
			});
		}
		
		function showMenu(){
			var left = btn.offset().left;
			if (left + $(opts.menu).outerWidth() + 5 > $(window).width()){
				left = $(window).width() - $(opts.menu).outerWidth() - 5;
			}
			
			$('.menu-top').menu('hide');
			$(opts.menu).menu('show', {
				left: left,
				top: btn.offset().top + btn.outerHeight()
			});
			btn.blur();
		}
	}
	
	$.fn.menubutton = function(options){
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'menubutton');
			if (state){
				$.extend(state.options, options);
			} else {
				$.data(this, 'menubutton', {
					options: $.extend({}, $.fn.menubutton.defaults, {
						disabled: $(this).attr('disabled') == 'true',
						plain: ($(this).attr('plain')=='false' ? false : true),
						menu: $(this).attr('menu'),
						duration: (parseInt($(this).attr('duration')) || 100)
					}, options)
				});
				$(this).removeAttr('disabled');
				$(this).append('<span class="m-btn-downarrow">&nbsp;</span>');
			}
			
			init(this);
		});
	};
	
	$.fn.menubutton.defaults = {
			disabled: false,
			plain: true,
			menu: null,
			duration: 100
	};
})(jQuery);
