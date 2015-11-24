/**
 * linkbutton - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 */
(function($){
	
	function createButton(target) {
		var opts = $.data(target, 'linkbutton').options;
		
		$(target).empty();
		$(target).addClass('l-btn');
		if (opts.id){
			$(target).attr('id', opts.id);
		} else {
			$(target).removeAttr('id');
		}
		if (opts.plain){
			$(target).addClass('l-btn-plain');
		} else {
			$(target).removeClass('l-btn-plain');
		}
		
		if (opts.text){
			$(target).html(opts.text).wrapInner(
					'<span class="l-btn-left">' +
					'<span class="l-btn-text">' +
					'</span>' +
					'</span>'
			);
			if (opts.iconCls){
				$(target).find('.l-btn-text').addClass(opts.iconCls).css('padding-left', '20px');
			}
		} else {
			$(target).html('&nbsp;').wrapInner(
					'<span class="l-btn-left">' +
					'<span class="l-btn-text">' +
					'<span class="l-btn-empty"></span>' +
					'</span>' +
					'</span>'
			);
			if (opts.iconCls){
				$(target).find('.l-btn-empty').addClass(opts.iconCls);
			}
		}
		
		setDisabled(target, opts.disabled);
	}
	
	function setDisabled(target, disabled){
		var state = $.data(target, 'linkbutton');
		if (disabled){
			state.options.disabled = true;
			var href = $(target).attr('href');
			if (href){
				state.href = href;
				$(target).attr('href', 'javascript:void(0)');
			}
			var onclick = $(target).attr('onclick');
			if (onclick) {
				state.onclick = onclick;
				$(target).attr('onclick', null);
			}
			$(target).addClass('l-btn-disabled');
		} else {
			state.options.disabled = false;
			if (state.href) {
				$(target).attr('href', state.href);
			}
			if (state.onclick) {
				target.onclick = state.onclick;
			}
			$(target).removeClass('l-btn-disabled');
		}
	}
	
	$.fn.linkbutton = function(options){
		if (typeof options == 'string'){
			switch(options){
			case 'options':
				return $.data(this[0], 'linkbutton').options;
			case 'enable':
				return this.each(function(){
					setDisabled(this, false);
				});
			case 'disable':
				return this.each(function(){
					setDisabled(this, true);
				});
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'linkbutton');
			if (state){
				$.extend(state.options, options);
			} else {
				var t = $(this);
				$.data(this, 'linkbutton', {
					options: $.extend({}, $.fn.linkbutton.defaults, {
						id: t.attr('id'),
						disabled: (t.attr('disabled') ? true : undefined),
						plain: (t.attr('plain') ? t.attr('plain') == 'true' : undefined),
						text: $.trim(t.html()),
						iconCls: t.attr('icon')
					}, options)
				});
				t.removeAttr('disabled');
			}
			
			createButton(this);
		});
	};
	
	$.fn.linkbutton.defaults = {
			id: null,
			disabled: false,
			plain: false,
			text: '',
			iconCls: null
	};
	
})(jQuery);
