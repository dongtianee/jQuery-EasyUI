/**
 * spinner - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 *   validatebox
 * 
 */
(function($){
	/**
	 * initialize the spinner.
	 */
	function init(target){
		var spinner = $(
				'<span class="spinner">' +
				'<span class="spinner-arrow">' +
				'<span class="spinner-arrow-up"></span>' +
				'<span class="spinner-arrow-down"></span>' +
				'</span>' +
				'</span>'
				).insertAfter(target);
		$(target).addClass('spinner-text').prependTo(spinner);
		return spinner;
	}
	
	function setSize(target, width){
		var opts = $.data(target, 'spinner').options;
		var spinner = $.data(target, 'spinner').spinner;
		if (width) opts.width = width;
		if (isNaN(opts.width)){
			opts.width = $(target).outerWidth();
		}
		var arrowWidth = spinner.find('.spinner-arrow').outerWidth();
		var width = opts.width - arrowWidth;
		if ($.boxModel == true){
			width -= spinner.outerWidth() - spinner.width();
		}
		$(target).width(width);
	}
	
	function bindEvents(target){
		var opts = $.data(target, 'spinner').options;
		var spinner = $.data(target, 'spinner').spinner;
		
		spinner.find('.spinner-arrow-up,.spinner-arrow-down').unbind('.spinner');
		if (!opts.disabled){
			spinner.find('.spinner-arrow-up').bind('mouseenter.spinner', function(){
				$(this).addClass('spinner-arrow-hover');
			}).bind('mouseleave.spinner', function(){
				$(this).removeClass('spinner-arrow-hover');
			}).bind('click.spinner', function(){
				opts.spin.call(target, false);
				opts.onSpinUp.call(target);
				$(target).validatebox('validate');
			});
			
			spinner.find('.spinner-arrow-down').bind('mouseenter.spinner', function(){
				$(this).addClass('spinner-arrow-hover');
			}).bind('mouseleave.spinner', function(){
				$(this).removeClass('spinner-arrow-hover');
			}).bind('click.spinner', function(){
				opts.spin.call(target, true);
				opts.onSpinDown.call(target);
				$(target).validatebox('validate');
			});
		}
	}
	
	/**
	 * enable or disable the spinner.
	 */
	function setDisabled(target, disabled){
		var opts = $.data(target, 'spinner').options;
		if (disabled){
			opts.disabled = true;
			$(target).attr('disabled', true);
		} else {
			opts.disabled = false;
			$(target).removeAttr('disabled');
		}
	}
	
	$.fn.spinner = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.spinner.methods[options];
			if (method){
				return method(this, param);
			} else {
				return this.validatebox(options, param);
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'spinner');
			if (state){
				$.extend(state.options, options);
			} else {
				state = $.data(this, 'spinner', {
					options: $.extend({}, $.fn.spinner.defaults, $.fn.spinner.parseOptions(this), options),
					spinner: init(this)
				});
				$(this).removeAttr('disabled');
			}
			$(this).val(state.options.value);
			$(this).attr('readonly', !state.options.editable);
			setDisabled(this, state.options.disabled);
			setSize(this);
			$(this).validatebox(state.options);
			bindEvents(this);
		});
	};
	
	$.fn.spinner.methods = {
		options: function(jq){
			var opts = $.data(jq[0], 'spinner').options;
			return $.extend(opts, {
				value: jq.val()
			});
		},
		destroy: function(jq){
			return jq.each(function(){
				var spinner = $.data(this, 'spinner').spinner;
				$(this).validatebox('destroy');
				spinner.remove();
			});
		},
		resize: function(jq, width){
			return jq.each(function(){
				setSize(this, width);
			});
		},
		enable: function(jq){
			return jq.each(function(){
				setDisabled(this, false);
				bindEvents(this);
			});
		},
		disable: function(jq){
			return jq.each(function(){
				setDisabled(this, true);
				bindEvents(this);
			});
		},
		getValue: function(jq){
			return jq.val();
		},
		setValue: function(jq, value){
			return jq.each(function(){
				var opts = $.data(this, 'spinner').options;
				opts.value = value;
				$(this).val(value);
			});
		},
		clear: function(jq){
			return jq.each(function(){
				var opts = $.data(this, 'spinner').options;
				opts.value = '';
				$(this).val('');
			});
		}
	};
	
	$.fn.spinner.parseOptions = function(target){
		var t = $(target);
		return $.extend({}, $.fn.validatebox.parseOptions(target), {
			width: (parseInt(target.style.width) || undefined),
			value: (t.val() || undefined),
			min: t.attr('min'),
			max: t.attr('max'),
			increment: (parseFloat(t.attr('increment')) || undefined),
			editable: (t.attr('editable') ? t.attr('editable') == 'true' : undefined),
			disabled: (t.attr('disabled') ? true : undefined)
		});
	};
	
	$.fn.spinner.defaults = $.extend({}, $.fn.validatebox.defaults, {
		width: 'auto',
		value: '',
		min: null,
		max: null,
		increment: 1,
		editable: true,
		disabled: false,
		
		spin: function(down){},	// the function to implement the spin button click
		
		onSpinUp: function(){},
		onSpinDown: function(){}
	});
})(jQuery);