/**
 * splitbutton - jQuery EasyUI
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
		var opts = $.data(target, 'splitbutton').options;
		
		if (opts.menu){
			$(opts.menu).menu({
				onShow: function(){
					btn.addClass((opts.plain==true) ? 's-btn-plain-active' : 's-btn-active');
				},
				onHide: function(){
					btn.removeClass((opts.plain==true) ? 's-btn-plain-active' : 's-btn-active');
				}
			});
		}
		
		var btn = $(target);
		btn.removeClass('s-btn-active s-btn-plain-active');
		btn.linkbutton(opts);
		
		var menubtn = btn.find('.s-btn-downarrow');
		menubtn.unbind('.splitbutton');
		if (opts.disabled == false && opts.menu){
			menubtn.bind('click.splitbutton', function(){
				showMenu();
				return false;
			});
			var timeout = null;
			menubtn.bind('mouseenter.splitbutton', function(){
				timeout = setTimeout(function(){
					showMenu();
				}, opts.duration);
				return false;
			}).bind('mouseleave.splitbutton', function(){
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
	
	$.fn.splitbutton = function(options){
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'splitbutton');
			if (state){
				$.extend(state.options, options);
			} else {
				var t = $(this);
				$.data(this, 'splitbutton', {
					options: $.extend({}, $.fn.splitbutton.defaults, {
						disabled: (t.attr('disabled') ? t.attr('disabled') == 'true' : undefined),
						plain: (t.attr('plain') ? t.attr('plain') == 'true' : undefined),
						menu: t.attr('menu'),
						duration: t.attr('duration')
					}, options)
				});
				$(this).removeAttr('disabled');
				$(this).append('<span class="s-btn-downarrow">&nbsp;</span>');
			}
			init(this);
		});
	};
	
	$.fn.splitbutton.defaults = {
		disabled: false,
		menu: null,
		plain: true,
		duration: 100
	};
})(jQuery);