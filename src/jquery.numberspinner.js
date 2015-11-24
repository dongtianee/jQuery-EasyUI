/**
 * numberspinner - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	 spinner
 * 	 numberbox
 */
(function($){
	function create(target){
		var opts = $.data(target, 'numberspinner').options;
		$(target).spinner(opts).numberbox(opts);
	}
	
	function doSpin(target, down){
		var opts = $.data(target, 'numberspinner').options;
		
		var v = parseFloat($(target).val() || opts.value) || 0;
		if (down == true){
			v -= opts.increment;
		} else {
			v += opts.increment;
		}
		$(target).val(v).numberbox('fix');
	}
	
	$.fn.numberspinner = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.numberspinner.methods[options];
			if (method){
				return method(this, param);
			} else {
				return this.spinner(options, param);
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'numberspinner');
			if (state){
				$.extend(state.options, options);
			} else {
				$.data(this, 'numberspinner', {
					options: $.extend({}, $.fn.numberspinner.defaults, $.fn.numberspinner.parseOptions(this), options)
				});
			}
			create(this);
		});
	};
	
	$.fn.numberspinner.methods = {
		options: function(jq){
			var opts = $.data(jq[0], 'numberspinner').options;
			return $.extend(opts, {
				value: jq.val()
			});
		},
		setValue: function(jq, value){
			return jq.each(function(){
				$(this).val(value).numberbox('fix');
			});
		}
	};
	
	$.fn.numberspinner.parseOptions = function(target){
		return $.extend({}, $.fn.spinner.parseOptions(target), $.fn.numberbox.parseOptions(target), {
		});
	};
	
	$.fn.numberspinner.defaults = $.extend({}, $.fn.spinner.defaults, $.fn.numberbox.defaults, {
		spin: function(down){doSpin(this, down);}
	});
})(jQuery);