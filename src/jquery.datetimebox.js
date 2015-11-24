/**
 * datetimebox - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	 datebox
 *   timespinner
 * 
 */
(function($){
	function createBox(target){
		var state = $.data(target, 'datetimebox');
		var opts = state.options;
		
		$(target).datebox($.extend({}, opts, {
			onShowPanel:function(){
				var value = $(target).datetimebox('getValue');
				setValue(target, value, true);
				opts.onShowPanel.call(target);
			}
		}));
		
		// override the calendar onSelect event, don't close panel when selected
		$(target).datebox('calendar').calendar({
			onSelect:function(date){
				opts.onSelect.call(target, date);
			}
		});
		
		var panel = $(target).datebox('panel');
		if (!state.spinner){
			var p = $('<div style="padding:2px"><input style="width:80px"></div>').insertAfter(panel.children('div.datebox-calendar-inner'));
			state.spinner = p.children('input');
			state.spinner.timespinner({
				showSeconds: true
			}).bind('mousedown',function(e){
				e.stopPropagation();
			});
			setValue(target, opts.value);
			
			var button = panel.children('div.datebox-button');
			var ok = $('<a href="javascript:void(0)" class="datebox-ok"></a>').html(opts.okText).appendTo(button);
			ok.hover(
				function(){$(this).addClass('datebox-button-hover');},
				function(){$(this).removeClass('datebox-button-hover');}
			).click(function(){
				doEnter(target);
			});
		}
	}
	
	/**
	 * get current date, including time
	 */
	function getCurrentDate(target){
		var c = $(target).datetimebox('calendar');
		var t = $(target).datetimebox('spinner');
		var date = c.calendar('options').current;
		return new Date(date.getFullYear(), date.getMonth(), date.getDate(), t.timespinner('getHours'), t.timespinner('getMinutes'), t.timespinner('getSeconds'));
	}
	
	
	/**
	 * called when user inputs some value in text box
	 */
	function doQuery(target, q){
		setValue(target, q, true);
	}
	
	/**
	 * called when user press enter key
	 */
	function doEnter(target){
		var opts = $.data(target, 'datetimebox').options;
		var date = getCurrentDate(target);
		setValue(target, opts.formatter(date));
		$(target).combo('hidePanel');
	}
	
	/**
	 * set value, if remainText is assigned, don't change the text value
	 */
	function setValue(target, value, remainText){
		var opts = $.data(target, 'datetimebox').options;
		
		$(target).combo('setValue', value);
		if (!remainText){
			if (value){
				var date = opts.parser(value);
				$(target).combo('setValue', opts.formatter(date));
				$(target).combo('setText', opts.formatter(date));
			} else {
				$(target).combo('setText', value);
			}
		}
		var date = opts.parser(value);
		$(target).datetimebox('calendar').calendar('moveTo', opts.parser(value));
		$(target).datetimebox('spinner').timespinner('setValue', getTimeS(date));
		
		/**
		 * get the time formatted string such as '03:48:02'
		 */
		function getTimeS(date){
			function formatNumber(value){
				return (value < 10 ? '0' : '') + value;
			}
			
			var tt = [formatNumber(date.getHours()), formatNumber(date.getMinutes())];
			if (opts.showSeconds){
				tt.push(formatNumber(date.getSeconds()));
			}
			return tt.join($(target).datetimebox('spinner').timespinner('options').separator);
		}
	}
	
	$.fn.datetimebox = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.datetimebox.methods[options];
			if (method){
				return method(this, param);
			} else {
				return this.datebox(options, param);
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'datetimebox');
			if (state){
				$.extend(state.options, options);
			} else {
				$.data(this, 'datetimebox', {
					options: $.extend({}, $.fn.datetimebox.defaults, $.fn.datetimebox.parseOptions(this), options)
				});
			}
			createBox(this);
		});
	}
	
	$.fn.datetimebox.methods = {
		options: function(jq){
			return $.data(jq[0], 'datetimebox').options;
		},
		spinner: function(jq){
			return $.data(jq[0], 'datetimebox').spinner;
		},
		setValue: function(jq, value){
			return jq.each(function(){
				setValue(this, value);
			});
		}
	};
	
	$.fn.datetimebox.parseOptions = function(target){
		var t = $(target);
		return $.extend({}, $.fn.datebox.parseOptions(target), {
		});
	};
	
	$.fn.datetimebox.defaults = $.extend({}, $.fn.datebox.defaults, {
		showSeconds:true,
		
		keyHandler: {
			up:function(){},
			down:function(){},
			enter:function(){doEnter(this);},
			query:function(q){doQuery(this, q);}
		},
		
		formatter:function(date){
			var h = date.getHours();
			var M = date.getMinutes();
			var s = date.getSeconds();
			function formatNumber(value){
				return (value < 10 ? '0' : '') + value;
			}
			return $.fn.datebox.defaults.formatter(date) + ' ' + formatNumber(h)+':'+formatNumber(M)+':'+formatNumber(s);
		},
		parser:function(s){
			if ($.trim(s) == ''){
				return new Date();
			}
			var dt = s.split(' ');
			var d = $.fn.datebox.defaults.parser(dt[0]);
			var tt = dt[1].split(':');
			var hour = parseInt(tt[0], 10);
			var minute = parseInt(tt[1], 10);
			var second = parseInt(tt[2], 10);
			return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, minute, second);
		}
	});
})(jQuery);
