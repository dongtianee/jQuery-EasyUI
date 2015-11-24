/**
 * numberTextBox - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2009 stworthy [ stworthy@gmail.com ] 
 * 
 * usage: <input class="number-textbox" min="1" max="100" precision="2">
 * The plugin will make the input can only input number chars
 * Options:
 * 	 min: The minimum allowed value
 *   max: The maximum allowed value
 *   precision: The maximum precision to display after the decimal separator
 */
(function($){
	$.fn.numberTextBox = function(){
		function fixValue(target){
			var min = parseFloat($(target).attr('min'));
			var max = parseFloat($(target).attr('max'));
			var precision = $(target).attr("precision") || 0;
			var val = parseFloat($(target).val()).toFixed(precision);
			if (isNaN(val)) {
				$(target).val('');
				return;
			}

			if (min && val < min) {
				$(target).val(min.toFixed(precision));
			} else if (max && val > max) {
				$(target).val(max.toFixed(precision));
			} else {
				$(target).val(val);
			}
		}
		
		return this.each(function(){
			$(this).css({imeMode:"disabled"});
			$(this).keypress(function(e){
				if (e.which == 46) {
					return true;
				}
				else if ((e.which >= 48 && e.which <= 57 && e.ctrlKey == false && e.shiftKey == false) || e.which == 0 || e.which == 8) {
					return true;
				} else if (e.ctrlKey == true && (e.which == 99 || e.which == 118)) {
					return true;
				} else {
					return false;
				}
			}).bind('paste', function(){
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
			}).bind('dragenter', function(){
				return false;
			}).blur(function(){
				fixValue(this);
			});
		});
	};
	
	$(function(){
		$('.number-textbox').numberTextBox();
	});
})(jQuery);