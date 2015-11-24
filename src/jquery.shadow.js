/**
 * shadow - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2009 stworthy [ stworthy@gmail.com ] 
 * 
 * options:
 * 	hidden: boolean false to show the shadow and true to hide the shadow 
 * 	fit: boolean true to fit the parent container and false not
 * 	width: integer width The width in pixels of the shadow. Default: 8
 * 
 */
(function($){
	$.fn.shadow = function(options){
		
		return this.each(function(){
			
			// wrap the element and return the jQuery object
			function wrapElem(target) {
				var wraps = [
				             '<div class="shadow">',
				             '<div class="shadow-one">',
				             '<div class="shadow-corner-a"></div>',
				             '<div class="shadow-corner-b"></div>',
				             '<div class="shadow-two">',
				             '	<div class="shadow-three">',
				             '		<div class="shadow-four">',
				             '		</div>',
				             '	</div>',
				             '</div>',
				             '</div>',
				             '</div>'
				             ];
				
				var shadow = $(wraps.join('')).insertAfter($(target));
				$(target).appendTo($('.shadow-four', shadow));
				return shadow;
			}
			
			if ($.data(this, 'shadow')) {
				$.extend($.data(this, 'shadow').options, options || {});
			} else {
				$.data(this, 'shadow', {
					options: $.extend({}, $.fn.shadow.defaults, options || {}),
					shadow: wrapElem(this),
					oldWidth: $(this).width(),	// the element old width and height
					oldHeight: $(this).height()
				});
			}
			
			if (!$.data(this, 'shadow').shadow) {
				$.data(this, 'shadow').shadow = wrapElem(this);
			}
			
			var opts = $.data(this, 'shadow').options;
			var shadow = $.data(this, 'shadow').shadow;
			
			if (opts.hidden == true) {
				$(this).insertAfter(shadow);
				shadow.remove();
				$.data(this, 'shadow').shadow = null;
				return;
			}
			
			$('.shadow-one', shadow).css({
				paddingLeft: opts.width * 2,
				paddingTop: opts.width * 2
			});
			$('.shadow-corner-a', shadow).css({
				width: opts.width * 2,
				height: opts.width * 2
			});
			$('.shadow-corner-b', shadow).css({
				width: opts.width * 2,
				height: opts.width * 2
			});
			$('.shadow-three', shadow).css({
				left: opts.width * -2,
				top: opts.width * -2
			});
			$('.shadow-four', shadow).css({
				left: opts.width,
				top: opts.width
			});
			
			if (opts.fit == true) {
				// make element and shadow fit the parent container
				
				var parent = $(shadow).parent();	// the parent container
				
				if ($.boxModel == true) {
					var delta = $(this).outerWidth(true) - $(this).width();
					$(this).css({
						width: parent.width() - 2*opts.width - delta,
						height: parent.height() - 2*opts.width - delta
					});
					$(shadow).css({
						width: parent.width(),
						height: parent.height()
					});
					$('.shadow-one', shadow).css({
						width: parent.width() - 2*opts.width,
						height: parent.height() - 2*opts.width
					});
				
				} else {
					$(this).css({
						width:'100%',
						height:'100%'
					});
					$(shadow).css({
						width: parent.width(),
						height: parent.height()
					});
					$('.shadow-one', shadow).css({
						width: parent.width(),
						height: parent.height()
					});
				}
			} else {
				// restore the element's width and height
				$(this).width($.data(this, 'shadow').oldWidth)
						.height($.data(this, 'shadow').oldHeight);
				
				$('.shadow-one', shadow).css({
					width:'100%',
					height:'100%'
				});
				
				if ($.boxModel == true) {
					$(shadow).css({
						width: $(this).outerWidth(),
						height: $(this).outerHeight()
					});
				} else {
					$(shadow).css({
						width: $.data(this, 'shadow').oldWidth + 2*opts.width,
						height: $.data(this, 'shadow').oldHeight + 2*opts.width
					});
				}
			}
			
		});
	};
	
	$.fn.shadow.defaults = {
			hidden: false,
			fit: false,
			width: 8
	};
})(jQuery);