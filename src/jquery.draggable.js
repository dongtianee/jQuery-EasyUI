/**
 * draggable - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 */
(function($){
	function drag(e){
		var opts = $.data(e.data.target, 'draggable').options;
		
		var dragData = e.data;
		var left = dragData.startLeft + e.pageX - dragData.startX;
		var top = dragData.startTop + e.pageY - dragData.startY;
		
		if (opts.deltaX != null && opts.deltaX != undefined){
			left = e.pageX + opts.deltaX;
		}
		if (opts.deltaY != null && opts.deltaY != undefined){
			top = e.pageY + opts.deltaY;
		}
		
		if (e.data.parnet != document.body) {
			if ($.boxModel == true) {
				left += $(e.data.parent).scrollLeft();
				top += $(e.data.parent).scrollTop();
			}
		}
		
		if (opts.axis == 'h') {
			dragData.left = left;
		} else if (opts.axis == 'v') {
			dragData.top = top;
		} else {
			dragData.left = left;
			dragData.top = top;
		}
	}
	
	function applyDrag(e){
		var opts = $.data(e.data.target, 'draggable').options;
		var proxy = $.data(e.data.target, 'draggable').proxy;
		if (proxy){
			proxy.css('cursor', opts.cursor);
		} else {
			proxy = $(e.data.target);
			$.data(e.data.target, 'draggable').handle.css('cursor', opts.cursor);
		}
		proxy.css({
			left:e.data.left,
			top:e.data.top
		});
	}
	
	function doDown(e){
		var opts = $.data(e.data.target, 'draggable').options;
		
		var droppables = $('.droppable').filter(function(){
			return e.data.target != this;
		}).filter(function(){
			var accept = $.data(this, 'droppable').options.accept;
			if (accept){
				return $(accept).filter(function(){
					return this == e.data.target;
				}).length > 0;
			} else {
				return true;
			}
		});
		$.data(e.data.target, 'draggable').droppables = droppables;
		
		var proxy = $.data(e.data.target, 'draggable').proxy;
		if (!proxy){
			if (opts.proxy){
				if (opts.proxy == 'clone'){
					proxy = $(e.data.target).clone().insertAfter(e.data.target);
				} else {
					proxy = opts.proxy.call(e.data.target, e.data.target);
				}
				$.data(e.data.target, 'draggable').proxy = proxy;
			} else {
				proxy = $(e.data.target);
			}
		}
		
		proxy.css('position', 'absolute');
		drag(e);
		applyDrag(e);
		
		opts.onStartDrag.call(e.data.target, e);
		return false;
	}
	
	function doMove(e){
		
		drag(e);
		if ($.data(e.data.target, 'draggable').options.onDrag.call(e.data.target, e) != false){
			applyDrag(e);
		}
		
		var source = e.data.target;
		$.data(e.data.target, 'draggable').droppables.each(function(){
			var dropObj = $(this);
			var p2 = $(this).offset();
			if (e.pageX > p2.left && e.pageX < p2.left + dropObj.outerWidth()
					&& e.pageY > p2.top && e.pageY < p2.top + dropObj.outerHeight()){
				if (!this.entered){
					$(this).trigger('_dragenter', [source]);
					this.entered = true;
				}
				$(this).trigger('_dragover', [source]);
			} else {
				if (this.entered){
					$(this).trigger('_dragleave', [source]);
					this.entered = false;
				}
			}
		});
		
		return false;
	}
	
	function doUp(e){
		drag(e);
		
		var proxy = $.data(e.data.target, 'draggable').proxy;
		var opts = $.data(e.data.target, 'draggable').options;
		if (opts.revert){
			if (checkDrop() == true){
				removeProxy();
				$(e.data.target).css({
					position:e.data.startPosition,
					left:e.data.startLeft,
					top:e.data.startTop
				});
			} else {
				if (proxy){
					proxy.animate({
						left:e.data.startLeft,
						top:e.data.startTop
					}, function(){
						removeProxy();
					});
				} else {
					$(e.data.target).animate({
						left:e.data.startLeft,
						top:e.data.startTop
					}, function(){
						$(e.data.target).css('position', e.data.startPosition);
					});
				}
			}
		} else {
			$(e.data.target).css({
				position:'absolute',
				left:e.data.left,
				top:e.data.top
			});
			removeProxy();
			checkDrop();
		}
		
		
		
		opts.onStopDrag.call(e.data.target, e);
		
		function removeProxy(){
			if (proxy){
				proxy.remove();
			}
			$.data(e.data.target, 'draggable').proxy = null;
		}
		
		function checkDrop(){
			var dropped = false;
			$.data(e.data.target, 'draggable').droppables.each(function(){
				var dropObj = $(this);
				var p2 = $(this).offset();
				if (e.pageX > p2.left && e.pageX < p2.left + dropObj.outerWidth()
						&& e.pageY > p2.top && e.pageY < p2.top + dropObj.outerHeight()){
					if (opts.revert){
						$(e.data.target).css({
							position:e.data.startPosition,
							left:e.data.startLeft,
							top:e.data.startTop
						});
					}
					$(this).trigger('_drop', [e.data.target]);
					dropped = true;
					this.entered = false;
				}
			});
			return dropped;
		}
		
		$(document).unbind('.draggable');
		return false;
	}
	
	$.fn.draggable = function(options){
		if (typeof options == 'string'){
			switch(options){
			case 'options':
				return $.data(this[0], 'draggable').options;
			case 'proxy':
				return $.data(this[0], 'draggable').proxy;
			case 'enable':
				return this.each(function(){
					$(this).draggable({disabled:false});
				});
			case 'disable':
				return this.each(function(){
					$(this).draggable({disabled:true});
				});
			}
		}
		
		return this.each(function(){
//			$(this).css('position','absolute');
			
			var opts;
			var state = $.data(this, 'draggable');
			if (state) {
				state.handle.unbind('.draggable');
				opts = $.extend(state.options, options);
			} else {
				opts = $.extend({}, $.fn.draggable.defaults, options || {});
			}
			
			if (opts.disabled == true) {
				$(this).css('cursor', 'default');
				return;
			}
			
			var handle = null;
            if (typeof opts.handle == 'undefined' || opts.handle == null){
                handle = $(this);
            } else {
                handle = (typeof opts.handle == 'string' ? $(opts.handle, this) : handle);
            }
			$.data(this, 'draggable', {
				options: opts,
				handle: handle
			});
			
			// bind mouse event using event namespace draggable
			handle.bind('mousedown.draggable', {target:this}, onMouseDown);
			handle.bind('mousemove.draggable', {target:this}, onMouseMove);
			
			function onMouseDown(e) {
				if (checkArea(e) == false) return;

				var position = $(e.data.target).position();
				var data = {
					startPosition: $(e.data.target).css('position'),
					startLeft: position.left,
					startTop: position.top,
					left: position.left,
					top: position.top,
					startX: e.pageX,
					startY: e.pageY,
					target: e.data.target,
					parent: $(e.data.target).parent()[0]
				};
				
				$(document).bind('mousedown.draggable', data, doDown);
				$(document).bind('mousemove.draggable', data, doMove);
				$(document).bind('mouseup.draggable', data, doUp);
			}
			
			function onMouseMove(e) {
				if (checkArea(e)){
					$(this).css('cursor', opts.cursor);
				} else {
					$(this).css('cursor', 'default');
				}
			}
			
			// check if the handle can be dragged
			function checkArea(e) {
				var offset = $(handle).offset();
				var width = $(handle).outerWidth();
				var height = $(handle).outerHeight();
				var t = e.pageY - offset.top;
				var r = offset.left + width - e.pageX;
				var b = offset.top + height - e.pageY;
				var l = e.pageX - offset.left;
				
				return Math.min(t,r,b,l) > opts.edge;
			}
			
		});
	};
	
	$.fn.draggable.defaults = {
			proxy:null,	// 'clone' or a function that will create the proxy object, 
						// the function has the source parameter that indicate the source object dragged.
			revert:false,
			cursor:'move',
			deltaX:null,
			deltaY:null,
			handle: null,
			disabled: false,
			edge:0,
			axis:null,	// v or h
			
			onStartDrag: function(e){},
			onDrag: function(e){},
			onStopDrag: function(e){}
	};
})(jQuery);