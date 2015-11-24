/**
 * combotree - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	 tree
 * 
 */
(function($){
	function setSize(target){
		var opts = $.data(target, 'combotree').options;
		var combo = $.data(target, 'combotree').combotree;
		var content = $.data(target, 'combotree').content;
		if (!isNaN(opts.width)){
			var arrowWidth = combo.find('.combotree-arrow').outerWidth();
			var width = opts.width - arrowWidth - (combo.outerWidth() - combo.width());
			combo.find('input.combotree-text').width(width);
		}
		if (opts.treeWidth){
			content.width(opts.treeWidth);
		} else {
			content.width($.boxModel==true ? combo.outerWidth()-(content.outerWidth()-content.width()) : combo.outerWidth());
		}
		if (opts.treeHeight){
			content.height(opts.treeHeight);
		}
		
		content.find('>ul').tree({
			url:opts.url,
			onClick:function(node){
				var oldValue = combo.find('input.combotree-value').val();
				combo.find('input.combotree-value').val(node.id);
				combo.find('input.combotree-text').val(node.text);
				content.hide();
				
				opts.onSelect.call(target, node);
				if (oldValue != node.id){
					opts.onChange.call(target, node.id, oldValue);
				}
			}
		});
	}
	
	function init(target){
		$(target).hide();
		
		var span = $('<span class="combotree"></span>').insertAfter(target);
		$('<input type="hidden" class="combotree-value"></input>').appendTo(span);
		$('<input class="combotree-text" readonly="true"></input>').appendTo(span);
		var arrow = $('<span><span class="combotree-arrow"></span></span>').appendTo(span);
		var content = $('<div class="combotree-content"><ul></ul></div>').insertAfter(span);
		
		var name = $(target).attr('name');
		if (name){
			span.attr('name', name);
			$(target).removeAttr('name');
		}
		
		/**
		 * show tree panel
		 */
		function show(){
			content.css({
				display:'block',
				left:span.offset().left,
				top:span.offset().top+span.outerHeight()
			});
			
			$(document).unbind('.combotree').bind('click.combotree', function(){
				content.hide();
				return false;
			});
		}
		
		span.click(function(){
			show();
			return false;
		});
		arrow.find('.combotree-arrow').hover(
			function(){$(this).addClass('combotree-arrow-hover');},
			function(){$(this).removeClass('combotree-arrow-hover');}
		);
		
		return {
			combotree: span,
			content: content
		}
	}
	
	/**
	 * set the value.
	 * node: object, must at lease contains two properties: id and text.
	 */
	function setValue(target, node){
		var opts = $.data(target, 'combotree').options;
		var combo = $.data(target, 'combotree').combotree;
		var content = $.data(target, 'combotree').content;
		
		var oldValue = combo.find('input.combotree-value').val();
		combo.find('input.combotree-value').val(node.id);
		combo.find('input.combotree-text').val(node.text);
		
		var root = content.find('>ul');
		var node1 = $('div.tree-node[node-id='+node.id+']', root);
		root.tree('select', node1[0]);
		
		if (oldValue != node.id){
			opts.onChange.call(target, node.id, oldValue);
		}
	}
	
	/**
	 * reload the tree panel
	 */
	function reload(target, url){
		var opts = $.data(target, 'combotree').options;
		var content = $.data(target, 'combotree').content;
		if (url){
			opts.url = url;
		}
		content.find('>ul').tree({url:opts.url}).tree('reload');
	}
	
	$.fn.combotree = function(options, param){
		if (typeof options == 'string'){
			switch(options){
			case 'setValue':
				return this.each(function(){
					setValue(this, param);
				});
			case 'reload':
				return this.each(function(){
					reload(this, param);
				});
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'combotree');
			if (state){
				$.extend(state.options, options);
			} else {
				var r = init(this);
				state = $.data(this, 'combotree', {
					options: $.extend({}, $.fn.combotree.defaults, {
						width: (parseInt($(this).css('width')) || 'auto'),
						treeWidth: $(this).attr('treeWidth'),
						treeHeight: ($(this).attr('treeHeight') || 200),
						url: $(this).attr('url')
					}, options),
					combotree: r.combotree,
					content: r.content
				});
			}
			
			setSize(this);
		});
	};
	
	$.fn.combotree.defaults = {
		width:'auto',
		treeWidth:null,
		treeHeight:200,
		url:null,
		onSelect:function(node){},
		onChange:function(newValue,oldValue){}
	};
})(jQuery);