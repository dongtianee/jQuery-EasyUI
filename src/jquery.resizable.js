/**
 * resizable - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 */
(function($){
	$.fn.resizable = function(options){
		function resize(e){
			var resizeData = e.data;
			var options = $.data(resizeData.target, 'resizable').options;
			if (resizeData.dir.indexOf('e') != -1) {
				var width = resizeData.startWidth + e.pageX - resizeData.startX;
				width = Math.min(
							Math.max(width, options.minWidth),
							options.maxWidth
						);
				resizeData.width = width;
			}
			if (resizeData.dir.indexOf('s') != -1) {
				var height = resizeData.startHeight + e.pageY - resizeData.startY;
				height = Math.min(
						Math.max(height, options.minHeight),
						options.maxHeight
				);
				resizeData.height = height;
			}
			if (resizeData.dir.indexOf('w') != -1) {
				resizeData.width = resizeData.startWidth - e.pageX + resizeData.startX;
				if (resizeData.width >= options.minWidth && resizeData.width <= options.maxWidth) {
					resizeData.left = resizeData.startLeft + e.pageX - resizeData.startX;
				}
			}
			if (resizeData.dir.indexOf('n') != -1) {
				resizeData.height = resizeData.startHeight - e.pageY + resizeData.startY;
				if (resizeData.height >= options.minHeight && resizeData.height <= options.maxHeight) {
					resizeData.top = resizeData.startTop + e.pageY - resizeData.startY;
				}
			}
		}
		
		function applySize(e){
			var resizeData = e.data;
			var target = resizeData.target;
			if ($.boxModel == true){
				$(target).css({
					width: resizeData.width - resizeData.deltaWidth,
					height: resizeData.height - resizeData.deltaHeight,
					left: resizeData.left,
					top: resizeData.top
				});
			} else {
				$(target).css({
					width: resizeData.width,
					height: resizeData.height,
					left: resizeData.left,
					top: resizeData.top
				});
			}
		}
		
		function doDown(e){
			$.data(e.data.target, 'resizable').options.onStartResize.call(e.data.target, e);
			return false;
		}
		
		function doMove(e){
			resize(e);
			if ($.data(e.data.target, 'resizable').options.onResize.call(e.data.target, e) != false){
				applySize(e)
			}
			return false;
		}
		
		function doUp(e){
			resize(e, true);
			applySize(e);
			$(document).unbind('.resizable');
			$.data(e.data.target, 'resizable').options.onStopResize.call(e.data.target, e);
			return false;
		}
		
		return this.each(function(){
			var opts = null;
			var state = $.data(this, 'resizable');
			if (state) {
				$(this).unbind('.resizable');
				opts = $.extend(state.options, options || {});
			} else {
				opts = $.extend({}, $.fn.resizable.defaults, options || {});
			}
			
			if (opts.disabled == true) {
				return;
			}
			
			$.data(this, 'resizable', {
				options: opts
			});
			
			var target = this;
			
			// bind mouse event using namespace resizable
			$(this).bind('mousemove.resizable', onMouseMove)
				   .bind('mousedown.resizable', onMouseDown);
			
			function onMouseMove(e) {
				var dir = getDirection(e);
				if (dir == '') {
					$(target).css('cursor', 'default');
				} else {
					$(target).css('cursor', dir + '-resize');
				}
			}
			
			function onMouseDown(e) {
				var dir = getDirection(e);
				if (dir == '') return;
				
				var data = {
					target: this,
					dir: dir,
					startLeft: getCssValue('left'),
					startTop: getCssValue('top'),
					left: getCssValue('left'),
					top: getCssValue('top'),
					startX: e.pageX,
					startY: e.pageY,
					startWidth: $(target).outerWidth(),
					startHeight: $(target).outerHeight(),
					width: $(target).outerWidth(),
					height: $(target).outerHeight(),
					deltaWidth: $(target).outerWidth() - $(target).width(),
					deltaHeight: $(target).outerHeight() - $(target).height()
				};
				$(document).bind('mousedown.resizable', data, doDown);
				$(document).bind('mousemove.resizable', data, doMove);
				$(document).bind('mouseup.resizable', data, doUp);
			}
			
			// get the resize direction
			function getDirection(e) {
				var dir = '';
				var offset = $(target).offset();
				var width = $(target).outerWidth();
				var height = $(target).outerHeight();
				var edge = opts.edge;
				if (e.pageY > offset.top && e.pageY < offset.top + edge) {
					dir += 'n';
				} else if (e.pageY < offset.top + height && e.pageY > offset.top + height - edge) {
					dir += 's';
				}
				if (e.pageX > offset.left && e.pageX < offset.left + edge) {
					dir += 'w';
				} else if (e.pageX < offset.left + width && e.pageX > offset.left + width - edge) {
					dir += 'e';
				}
				
				var handles = opts.handles.split(',');
				for(var i=0; i<handles.length; i++) {
					var handle = handles[i].replace(/(^\s*)|(\s*$)/g, '');
					if (handle == 'all' || handle == dir) {
						return dir;
					}
				}
				return '';
			}
			
			function getCssValue(css) {
				var val = parseInt($(target).css(css));
				if (isNaN(val)) {
					return 0;
				} else {
					return val;
				}
			}
			
		});
	};
	
	$.fn.resizable.defaults = {
			disabled:false,
			handles:'n, e, s, w, ne, se, sw, nw, all',
			minWidth: 10,
			minHeight: 10,
			maxWidth: 10000,//$(document).width(),
			maxHeight: 10000,//$(document).height(),
			edge:5,
			onStartResize: function(e){},
			onResize: function(e){},
			onStopResize: function(e){}
	};
	
})(jQuery);