/**
 * numberbox - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	 validatebox
 * 
 */
(function($){
	function fixValue(target){
		var opts = $.data(target, 'numberbox').options;
		var val = parseFloat($(target).val()).toFixed(opts.precision);
		if (isNaN(val)){
			$(target).val('');
			return;
		}
		
		if (opts.min != null && opts.min != undefined && val < opts.min){
			$(target).val(opts.min.toFixed(opts.precision));
		} else if (opts.max != null && opts.max != undefined && val > opts.max){
			$(target).val(opts.max.toFixed(opts.precision));
		} else {
			$(target).val(val);
		}
	}
	
	function bindEvents(target){
		$(target).unbind('.numberbox');
		$(target).bind('keypress.numberbox', function(e){
			if (e.which == 45){	//-
				return true;
			} if (e.which == 46) {	//.
				return true;
			}
			else if ((e.which >= 48 && e.which <= 57 && e.ctrlKey == false && e.shiftKey == false) || e.which == 0 || e.which == 8) {
				return true;
			} else if (e.ctrlKey == true && (e.which == 99 || e.which == 118)) {
				return true;
			} else {
				return false;
			}
		}).bind('paste.numberbox', function(){
			if (window.clipboardData) {
				var s = clipboardData.getData('text');
				if (! /\D/.test(s)) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		}).bind('dragenter.numberbox', function(){
			return false;
		}).bind('blur.numberbox', function(){
			fixValue(target);
		});
	}
	
	/**
	 * do the validate if necessary.
	 */
	function validate(target){
		if ($.fn.validatebox){
			var opts = $.data(target, 'numberbox').options;
			$(target).validatebox(opts);
		}
	}
	
	function setDisabled(target, disabled){
		var opts = $.data(target, 'numberbox').options;
		if (disabled){
			opts.disabled = true;
			$(target).attr('disabled', true);
		} else {
			opts.disabled = false;
			$(target).removeAttr('disabled');
		}
	}
	
	$.fn.numberbox = function(options){
		if (typeof options == 'string'){
			switch(options){
			case 'disable':
				return this.each(function(){
					setDisabled(this, true);
				});
			case 'enable':
				return this.each(function(){
					setDisabled(this, false);
				});
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'numberbox');
			if (state){
				$.extend(state.options, options);
			} else {
				var t = $(this);
				state = $.data(this, 'numberbox', {
					options: $.extend({}, $.fn.numberbox.defaults, {
						disabled: (t.attr('disabled') ? true : undefined),
						min: (t.attr('min')=='0' ? 0 : parseFloat(t.attr('min')) || undefined),
						max: (t.attr('max')=='0' ? 0 : parseFloat(t.attr('max')) || undefined),
						precision: (parseInt(t.attr('precision')) || undefined)
					}, options)
				});
				t.removeAttr('disabled');
				$(this).css({imeMode:"disabled"});
			}
			
			setDisabled(this, state.options.disabled);
			bindEvents(this);
			validate(this);
		});
	};
	
	$.fn.numberbox.defaults = {
		disabled: false,
		min: null,
		max: null,
		precision: 0
	};
})(jQuery);