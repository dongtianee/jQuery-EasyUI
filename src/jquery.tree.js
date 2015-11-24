/**
 * tree - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Node is a javascript object which contains following properties:
 * 1 id: An identity value bind to the node.
 * 2 text: Text to be showed.
 * 3 checked: Indicate whether the node is checked selected.
 * 3 attributes: Custom attributes bind to the node.
 * 4 target: Target DOM object.
 */
(function($){
	/**
	 * wrap the <ul> tag as a tree and then return it.
	 */
	function wrapTree(target){
		var tree = $(target);
		tree.addClass('tree');
		
		wrapNode(tree, 0);
		
		function wrapNode(ul, depth){
			$('>li', ul).each(function(){
				var node = $('<div class="tree-node"></div>').prependTo($(this));
				var text = $('>span', this).addClass('tree-title').appendTo(node).text();
				$.data(node[0], 'tree-node', {
					text: text
				});
				var subTree = $('>ul', this);
				if (subTree.length){
					$('<span class="tree-folder tree-folder-open"></span>').prependTo(node);
					$('<span class="tree-hit tree-expanded"></span>').prependTo(node);
					wrapNode(subTree, depth+1);
				} else {
					$('<span class="tree-file"></span>').prependTo(node);
					$('<span class="tree-indent"></span>').prependTo(node);
				}
				for(var i=0; i<depth; i++){
					$('<span class="tree-indent"></span>').prependTo(node);
				}
			});
		}
		return tree;
	}
	
	function expandNode(target, node){
		var opts = $.data(target, 'tree').options;
		
		var hit = $('>span.tree-hit', node);
		if (hit.length == 0) return;	// is a leaf node
		
		if (hit.hasClass('tree-collapsed')){
			hit.removeClass('tree-collapsed tree-collapsed-hover').addClass('tree-expanded');
			hit.next().addClass('tree-folder-open');
			var ul = $(node).next();
			if (ul.length){
				if (opts.animate){
					ul.slideDown();
				} else {
					ul.css('display','block');
				}
			} else {
				var id = $.data($(node)[0], 'tree-node').id;
				var subul = $('<ul></ul>').insertAfter(node);
				request(target, subul, {id:id});	// request children nodes data
			}
		}
	}
	
	function collapseNode(target, node){
		var opts = $.data(target, 'tree').options;
		
		var hit = $('>span.tree-hit', node);
		if (hit.length == 0) return;	// is a leaf node
		
		if (hit.hasClass('tree-expanded')){
			hit.removeClass('tree-expanded tree-expanded-hover').addClass('tree-collapsed');
			hit.next().removeClass('tree-folder-open');
			if (opts.animate){
				$(node).next().slideUp();
			} else {
				$(node).next().css('display','none');
			}
		}
	}
	
	function toggleNode(target, node){
		var hit = $('>span.tree-hit', node);
		if (hit.length == 0) return;	// is a leaf node
		
		if (hit.hasClass('tree-expanded')){
			collapseNode(target, node);
		} else {
			expandNode(target, node);
		}
	}
	
	function bindTreeEvents(target){
		var opts = $.data(target, 'tree').options;
		var tree = $.data(target, 'tree').tree;
		
		$('.tree-node', tree).unbind('.tree').bind('dblclick.tree', function(){
			$('.tree-node-selected', tree).removeClass('tree-node-selected');
			$(this).addClass('tree-node-selected');
			
			if (opts.onDblClick){
				var target = this;	// the target HTML DIV element
				var data = $.data(this, 'tree-node');
				opts.onDblClick.call(this, {
					id: data.id,
					text: data.text,
					attributes: data.attributes,
					target: target
				});
			}
		}).bind('click.tree', function(){
			$('.tree-node-selected', tree).removeClass('tree-node-selected');
			$(this).addClass('tree-node-selected');
			
			if (opts.onClick){
				var target = this;	// the target HTML DIV element
				var data = $.data(this, 'tree-node');
				opts.onClick.call(this, {
					id: data.id,
					text: data.text,
					attributes: data.attributes,
					target: target
				});
			}
//			return false;
		}).bind('mouseenter.tree', function(){
			$(this).addClass('tree-node-hover');
			return false;
		}).bind('mouseleave.tree', function(){
			$(this).removeClass('tree-node-hover');
			return false;
		});
		
		$('.tree-hit', tree).unbind('.tree').bind('click.tree', function(){
			var node = $(this).parent();
			toggleNode(target, node);
			return false;
		}).bind('mouseenter.tree', function(){
			if ($(this).hasClass('tree-expanded')){
				$(this).addClass('tree-expanded-hover');
			} else {
				$(this).addClass('tree-collapsed-hover');
			}
		}).bind('mouseleave.tree', function(){
			if ($(this).hasClass('tree-expanded')){
				$(this).removeClass('tree-expanded-hover');
			} else {
				$(this).removeClass('tree-collapsed-hover');
			}
		});
		
		$('.tree-checkbox', tree).unbind('.tree').bind('click.tree', function(){
			if ($(this).hasClass('tree-checkbox0')){
				$(this).removeClass('tree-checkbox0').addClass('tree-checkbox1');
			} else if ($(this).hasClass('tree-checkbox1')){
				$(this).removeClass('tree-checkbox1').addClass('tree-checkbox0');
			} else if ($(this).hasClass('tree-checkbox2')){
				$(this).removeClass('tree-checkbox2').addClass('tree-checkbox1');
			}
			setParentCheckbox($(this).parent());
			setChildCheckbox($(this).parent());
			return false;
		});
		
		function setChildCheckbox(node){
			var childck = node.next().find('.tree-checkbox');
			childck.removeClass('tree-checkbox0 tree-checkbox1 tree-checkbox2')
			if (node.find('.tree-checkbox').hasClass('tree-checkbox1')){
				childck.addClass('tree-checkbox1');
			} else {
				childck.addClass('tree-checkbox0');
			}
		}
		
		function setParentCheckbox(node){
			var pnode = getParentNode(target, node[0]);
			if (pnode){
				var ck = $(pnode.target).find('.tree-checkbox');
				ck.removeClass('tree-checkbox0 tree-checkbox1 tree-checkbox2');
				if (isAllSelected(node)){
					ck.addClass('tree-checkbox1');
				} else if (isAllNull(node)){
					ck.addClass('tree-checkbox0');
				} else {
					ck.addClass('tree-checkbox2');
				}
				setParentCheckbox($(pnode.target));
			}
			
			function isAllSelected(n){
				var ck = n.find('.tree-checkbox');
				if (ck.hasClass('tree-checkbox0') || ck.hasClass('tree-checkbox2')) return false;
				var b = true;
				n.parent().siblings().each(function(){
					if (!$(this).find('.tree-checkbox').hasClass('tree-checkbox1')){
						b = false;
					}
				});
				return b;
			}
			function isAllNull(n){
				var ck = n.find('.tree-checkbox');
				if (ck.hasClass('tree-checkbox1') || ck.hasClass('tree-checkbox2')) return false;
				var b = true;
				n.parent().siblings().each(function(){
					if (!$(this).find('.tree-checkbox').hasClass('tree-checkbox0')){
						b = false;
					}
				});
				return b;
			}
		}
	}
	
	function loadData(target, ul, data){
		// clear the tree when loading to the root
		if (target == ul) {
			$(target).empty();
		}
		
		var opts = $.data(target, 'tree').options;
		function appendNodes(ul, children, depth){
			for(var i=0; i<children.length; i++){
				var li = $('<li></li>').appendTo(ul);
				var item = children[i];
				
				// the node state has only 'open' or 'closed' attribute
				if (item.state != 'open' && item.state != 'closed'){
					item.state = 'open';
				}
				
				var node = $('<div class="tree-node"></div>').appendTo(li);
				node.attr('node-id', item.id);
				
				// store node attributes
				$.data(node[0], 'tree-node', {
					id: item.id,
					text: item.text,
					attributes: item.attributes
				});
				
				$('<span class="tree-title"></span>').html(item.text).appendTo(node);
				if (opts.checkbox){
					if (item.checked){
						$('<span class="tree-checkbox tree-checkbox1"></span>').prependTo(node);
					} else {
						$('<span class="tree-checkbox tree-checkbox0"></span>').prependTo(node);
					}
				}
				if (item.children){
					var subul = $('<ul></ul>').appendTo(li);
					if (item.state == 'open'){
						$('<span class="tree-folder tree-folder-open"></span>').addClass(item.iconCls).prependTo(node);
						$('<span class="tree-hit tree-expanded"></span>').prependTo(node);
					} else {
						$('<span class="tree-folder"></span>').addClass(item.iconCls).prependTo(node);
						$('<span class="tree-hit tree-collapsed"></span>').prependTo(node);
						subul.css('display','none');
					}
					appendNodes(subul, item.children, depth+1);
				} else {
					if (item.state == 'closed'){
						$('<span class="tree-folder"></span>').addClass(item.iconCls).prependTo(node);
						$('<span class="tree-hit tree-collapsed"></span>').prependTo(node);
					} else {
//						$('<input type="checkbox" style="vertical-align:bottom;margin:0;height:18px;">').prependTo(node);
						$('<span class="tree-file"></span>').addClass(item.iconCls).prependTo(node);
						$('<span class="tree-indent"></span>').prependTo(node);
					}
				}
				for(var j=0; j<depth; j++){
					$('<span class="tree-indent"></span>').prependTo(node);
				}
			}
		}

		var depth = $(ul).prev().find('>span.tree-indent,>span.tree-hit').length;
		appendNodes(ul, data, depth);
		
	}
	
	/**
	 * request remote data and then load nodes in the <ul> tag.
	 */
	function request(target, ul, param){
		var opts = $.data(target, 'tree').options;
		if (!opts.url) return;
		
		param = param || {};
		
		var folder = $(ul).prev().find('>span.tree-folder');
		folder.addClass('tree-loading');
		$.ajax({
			type: 'post',
			url: opts.url,
			data: param,
			dataType: 'json',
			success: function(data){
				folder.removeClass('tree-loading');
				loadData(target, ul, data);
				bindTreeEvents(target);
				if (opts.onLoadSuccess){
					opts.onLoadSuccess.apply(this, arguments);
				}
			},
			error: function(){
				folder.removeClass('tree-loading');
				if (opts.onLoadError){
					opts.onLoadError.apply(this, arguments);
				}
			}
		});
	}
	
	/**
	 * get the parent node
	 * param: DOM object, from which to search it's parent node 
	 */
	function getParentNode(target, param){
		var node = $(param).parent().parent().prev();
		if (node.length){
			return $.extend({}, $.data(node[0], 'tree-node'), {
				target: node[0],
				checked: node.find('.tree-checkbox').hasClass('tree-checkbox1')
			});
		} else {
			return null;
		}
	}
	
	function getCheckedNode(target){
		var nodes = [];
		$(target).find('.tree-checkbox1').each(function(){
			var node = $(this).parent();
			nodes.push($.extend({}, $.data(node[0], 'tree-node'), {
				target: node[0],
				checked: node.find('.tree-checkbox').hasClass('tree-checkbox1')
			}));
		});
		return nodes;
	}
	
	/**
	 * Get the selected node data which contains following properties: id,text,attributes,target
	 */
	function getSelectedNode(target){
		var node = $(target).find('div.tree-node-selected');
		if (node.length){
			return $.extend({}, $.data(node[0], 'tree-node'), {
				target: node[0],
				checked: node.find('.tree-checkbox').hasClass('tree-checkbox1')
			});
		} else {
			return null;
		}
	}
	
	/**
	 * Append nodes to tree.
	 * The param parameter has two properties:
	 * 1 parent: DOM object, the parent node to append to.
	 * 2 data: array, the nodes data.
	 */
	function appendNodes(target, param){
		var node = $(param.parent);
		var ul = node.next();
		if (ul.length == 0){
			ul = $('<ul></ul>').insertAfter(node);
		}
		
		// ensure the node is a folder node
		if (param.data && param.data.length){
			var nodeIcon = node.find('span.tree-file');
			if (nodeIcon.length){
				nodeIcon.removeClass('tree-file').addClass('tree-folder');
				var hit = $('<span class="tree-hit tree-expanded"></span>').insertBefore(nodeIcon);
				if (hit.prev().length){
					hit.prev().remove();
				}
			}
		}
		
		loadData(target, ul, param.data);
		bindTreeEvents(target);
	}
	
	/**
	 * Remove node from tree. 
	 * param: DOM object, indicate the node to be removed.
	 */
	function removeNode(target, param){
		var node = $(param);
		var li = node.parent();
		var ul = li.parent();
		li.remove();
		if (ul.find('li').length == 0){
			var node = ul.prev();
			node.find('.tree-folder').removeClass('tree-folder').addClass('tree-file');
			node.find('.tree-hit').remove();
			$('<span class="tree-indent"></span>').prependTo(node);
			if (ul[0] != target){
				ul.remove();
			}
		}
	}
	
	/**
	 * select the specified node.
	 * param: DOM object, indicate the node to be selected.
	 */
	function selectNode(target, param){
		$('div.tree-node-selected', target).removeClass('tree-node-selected');
		$(param).addClass('tree-node-selected');
	}
	
	/**
	 * Check if the specified node is leaf.
	 * param: DOM object, indicate the node to be checked.
	 */
	function isLeaf(target, param){
		var node = $(param);
		var hit = $('>span.tree-hit', node);
		return hit.length == 0;
	}
	
	
	$.fn.tree = function(options, param){
		if (typeof options == 'string'){
			switch(options){
				case 'options':
					return $.data(this[0], 'tree').options;
				case 'reload':
					return this.each(function(){
						$(this).empty();
						request(this, this);
					});
				case 'getParent':
					return getParentNode(this[0], param);
				case 'getChecked':
					return getCheckedNode(this[0]);
				case 'getSelected':
					return getSelectedNode(this[0]);
				case 'isLeaf':
					return isLeaf(this[0], param);	// param is the node object
				case 'select':
					return this.each(function(){
						selectNode(this, param);
					});
				case 'collapse':
					return this.each(function(){
						collapseNode(this, $(param));	// param is the node object
					});
				case 'expand':
					return this.each(function(){
						expandNode(this, $(param));		// param is the node object
					});
				case 'append':
					return this.each(function(){
						appendNodes(this, param);
					});
				case 'toggle':
					return this.each(function(){
						toggleNode(this, $(param));
					});
				case 'remove':
					return this.each(function(){
						removeNode(this, param);
					});
			}
		}
		
		var options = options || {};
		return this.each(function(){
			var state = $.data(this, 'tree');
			var opts;
			if (state){
				opts = $.extend(state.options, options);
				state.options = opts;
			} else {
				opts = $.extend({}, $.fn.tree.defaults, {
					url:$(this).attr('url'),
					animate:($(this).attr('animate') ? $(this).attr('animate') == 'true' : undefined)
				}, options);
				$.data(this, 'tree', {
					options: opts,
					tree: wrapTree(this)
				});
//				request(this, this);
			}
			
			if (opts.url){
				request(this, this);
			}
			bindTreeEvents(this);
		});
	};
	
	$.fn.tree.defaults = {
		url: null,
		animate: false,
		checkbox: false,
		
		onLoadSuccess: function(){},
		onLoadError: function(){},
		onClick: function(node){},	// node: id,text,attributes,target
		onDblClick: function(node){}	// node: id,text,attributes,target
	};
})(jQuery);
