/**
 * timespinner - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 *   spinner
 * 
 */
(function($){
	function create(target){
		var opts = $.data(target, 'timespinner').options;
		$(target).spinner(opts);
		
		$(target).unbind('.timespinner');
		$(target).bind('click.timespinner', function(){
			var start = 0;
			if (this.selectionStart != null){
				start = this.selectionStart;
			} else if (this.createTextRange){
				var range = target.createTextRange();
				var s = document.selection.createRange();
				s.setEndPoint("StartToStart", range);
				start = s.text.length;
			}
			if (start >= 0 && start <= 2){
				opts.highlight = 0;
			} else if (start >= 3 && start <= 5){
				opts.highlight = 1;
			} else if (start >= 6 && start <= 8){
				opts.highlight = 2;
			}
			highlight(target);
		}).bind('blur.timespinner', function(){
			fixValue(target);
		});
	}
	
	/**
	 * highlight the hours or minutes or seconds.
	 */
	function highlight(target){
		var opts = $.data(target, 'timespinner').options;
		var start = 0, end = 0;
		if (opts.highlight == 0){
			start = 0;
			end = 2;
		} else if (opts.highlight == 1){
			start = 3;
			end = 5;
		} else if (opts.highlight == 2){
			start = 6;
			end = 8;
		}
		if (target.selectionStart != null){
			target.setSelectionRange(start, end);
		} else if (target.createTextRange){
			var range = target.createTextRange();
			range.collapse();
			range.moveEnd('character', end);
			range.moveStart('character', start);
			range.select();
		}
		$(target).focus();
	}
	
	/**
	 * parse the time and return it or return null if the format is invalid
	 */
	function parseTime(target, value){
		var opts = $.data(target, 'timespinner').options;
		if (!value) return null;
		var vv = value.split(opts.separator);
		for(var i=0; i<vv.length; i++){
			if (isNaN(vv[i])) return null;
		}
		while(vv.length < 3){
			vv.push(0);
		}
		return new Date(1900, 0, 0, vv[0], vv[1], vv[2]);
	}
	
	function fixValue(target){
		var opts = $.data(target, 'timespinner').options;
		var value = $(target).val();
		var time = parseTime(target, value);
		if (!time){
			time = parseTime(target, opts.value);
		}
		if (!time){
			opts.value = '';
			$(target).val('');
			return;
		}
		
		var minTime = parseTime(target, opts.min);
		var maxTime = parseTime(target, opts.max);
		if (minTime && minTime > time) time = minTime;
		if (maxTime && maxTime < time) time = maxTime;
		
		var tt = [formatNumber(time.getHours()), formatNumber(time.getMinutes())];
		if (opts.showSeconds){
			tt.push(formatNumber(time.getSeconds()));
		}
		var val = tt.join(opts.separator);
		opts.value = val;
		$(target).val(val);
		
//		highlight(target);
		
		function formatNumber(value){
			return (value < 10 ? '0' : '') + value;
		}
	}
	
	function doSpin(target, down){
		var opts = $.data(target, 'timespinner').options;
		var val = $(target).val();
		if (val == ''){
			val = [0,0,0].join(opts.separator);
		}
		var vv = val.split(opts.separator);
		for(var i=0; i<vv.length; i++){
			vv[i] = parseInt(vv[i], 10);
		}
		if (down == true){
			vv[opts.highlight] -= opts.increment;
		} else {
			vv[opts.highlight] += opts.increment;
		}
		$(target).val(vv.join(opts.separator));
		fixValue(target);
		highlight(target);
	}
	
	
	$.fn.timespinner = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.timespinner.methods[options];
			if (method){
				return method(this, param);
			} else {
				return this.spinner(options, param);
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'timespinner');
			if (state){
				$.extend(state.options, options);
			} else {
				$.data(this, 'timespinner', {
					options: $.extend({}, $.fn.timespinner.defaults, $.fn.timespinner.parseOptions(this), options)
				});
				create(this);
			}
		});
	};
	
	$.fn.timespinner.methods = {
		options: function(jq){
			var opts = $.data(jq[0], 'timespinner').options;
			return $.extend(opts, {
				value: jq.val()
			});
		},
		setValue: function(jq, value){
			return jq.each(function(){
				$(this).val(value);
				fixValue(this);
			});
		}
	};
	
	$.fn.timespinner.parseOptions = function(target){
		var t = $(target);
		return $.extend({}, $.fn.spinner.parseOptions(target), {
			separator: t.attr('separator'),
			showSeconds: (t.attr('showSeconds') ? t.attr('showSeconds') == 'true' : undefined),
			highlight: (parseInt(t.attr('highlight')) || undefined)
		});
	};
	
	$.fn.timespinner.defaults = $.extend({}, $.fn.spinner.defaults, {
		separator: ':',
		showSeconds: false,
		highlight: 0,	// The field to highlight initially, 0 = hours, 1 = minutes, ...
		spin: function(down){doSpin(this, down);}
	});
})(jQuery);