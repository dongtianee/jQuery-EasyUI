/**
 * treegrid - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	 datagrid
 * 
 */
(function($){
	function buildGrid(target){
		var opts = $.data(target, 'treegrid').options;
		$(target).datagrid($.extend({}, opts, {
			url: null,
			onResizeColumn: function(field, width){
				setRowHeight(target);
			}
		}));
	}
	
	function getColumnFields(columns){
		if (columns.length == 0) return [];
		
		function getFields(ridx,cidx,count){
			var fields = [];
			while(fields.length < count){
				var col = columns[ridx][cidx];
				if (col.colspan && parseInt(col.colspan)>1){
					var ff = getFields(ridx+1, getSubColIndex(ridx,cidx), parseInt(col.colspan));
					fields = fields.concat(ff);
				} else if (col.field){
					fields.push(col.field);
				}
				cidx++;
			}
			
			return fields;
		}
		
		function getSubColIndex(ridx, cidx){
			var index = 0;
			for(var i=0; i<cidx; i++){
				var colspan = parseInt(columns[ridx][i].colspan || '1');
				if (colspan > 1){
					index += colspan;
				}
			}
			return index;
		}
		
		var fields = [];
		for(var i=0; i<columns[0].length; i++){
			var col = columns[0][i];
			if (col.colspan && parseInt(col.colspan)>1){
				var ff = getFields(1, getSubColIndex(0,i), parseInt(col.colspan));
				fields = fields.concat(ff);
			} else if (col.field){
				fields.push(col.field);
			}
		}
		
		return fields;
	}
	function getColumnOption(target, field){
		var opts = $.data(target, 'datagrid').options;
		if (opts.columns){
			for(var i=0; i<opts.columns.length; i++){
				var cols = opts.columns[i];
				for(var j=0; j<cols.length; j++){
					var col = cols[j];
					if (col.field == field){
						return col;
					}
				}
			}
		}
		if (opts.frozenColumns){
			for(var i=0; i<opts.frozenColumns.length; i++){
				var cols = opts.frozenColumns[i];
				for(var j=0; j<cols.length; j++){
					var col = cols[j];
					if (col.field == field){
						return col;
					}
				}
			}
		}
		return null;
	}
	function setRowHeight(target, idValue){
		var opts = $.data(target, 'datagrid').options;
		var panel = $.data(target, 'datagrid').panel;
		
		var view = panel.find('>div.datagrid-view');
		var view1 = view.find('>div.datagrid-view1');
		var view2 = view.find('>div.datagrid-view2');
		if (opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length>0)){
			if (idValue){
				view2.find('tr[node-id=' + idValue + ']').next('tr.treegrid-tr-tree').find('tr[node-id]').each(function(){
					setHeight($(this).attr('node-id'));
				});
			} else {
				view2.find('tr[node-id]').each(function(){
					setHeight($(this).attr('node-id'));
				});
			}
		}
		if (opts.height == 'auto'){
			var height = view2.find('div.datagrid-body table').height() + 18;
			view1.find('div.datagrid-body').height(height);
			view2.find('div.datagrid-body').height(height);
			view.height(view2.height());
		}
		console.log('ss')
		
		function setHeight(idValue){
			var tr1 = view1.find('tr[node-id='+idValue+']');
			var tr2 = view2.find('tr[node-id='+idValue+']');
			tr1.css('height', null);
			tr2.css('height', null);
			var height = Math.max(tr1.height(), tr2.height());
			tr1.css('height', height);
			tr2.css('height', height);
		}
	}
	
	function bindEvents(target){
		var body = $(target).datagrid('getPanel').find('div.datagrid-body');
		body.find('span.tree-hit').unbind('.treegrid').bind('click.treegrid', function(){
			var tr = $(this).parent().parent().parent();
			var id = tr.attr('node-id');
			toggle(target, id);
			return false;
		}).bind('mouseenter.treegrid', function(){
			if ($(this).hasClass('tree-expanded')){
				$(this).addClass('tree-expanded-hover');
			} else {
				$(this).addClass('tree-collapsed-hover');
			}
		}).bind('mouseleave.treegrid', function(){
			if ($(this).hasClass('tree-expanded')){
				$(this).removeClass('tree-expanded-hover');
			} else {
				$(this).removeClass('tree-collapsed-hover');
			}
		});;
		body.find('tr').unbind('.treegrid').bind('click.treegrid', function(){
			select(target, $(this).attr('node-id'));
			return false;
		});
	}
	
	function loadData(target, parentId, data, append){
		var opts = $.data(target, 'datagrid').options;
		var wrap = $.data(target, 'datagrid').panel;
		var view = wrap.find('>div.datagrid-view');
		var view1 = view.find('>div.datagrid-view1');
		var view2 = view.find('>div.datagrid-view2');
		
		var frozenFields = getColumnFields(opts.frozenColumns);
		var fields = getColumnFields(opts.columns);
		
		if (parentId){
			var subtree1 = createSubTree(parentId, view1, frozenFields);
			var subtree2 = createSubTree(parentId, view2, fields);
			var body1 = subtree1.body;
			var body2 = subtree2.body;
			var level = subtree1.level + subtree2.level;
		} else {
			var body1 = view1.find('>div.datagrid-body>div.datagrid-body-inner');
			var body2 = view2.find('>div.datagrid-body');
			var level = 0;
		}
		if (!append){
			body1.empty();
			body2.empty();
		}
		
		if (opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length > 0)){
			var table1 = $('<table cellspacing="0" cellpadding="0" border="0"></table>').appendTo(body1);
			appendRows(table1, data, level, frozenFields);
		}
		var table2 = $('<table cellspacing="0" cellpadding="0" border="0"></table>').appendTo(body2);
		appendRows(table2, data, level, fields);
		
		setRowHeight(target);
		bindEvents(target);
		
		function createSubTree(idValue, view, fields){
			var r = {};
			var tr = view.find('>div.datagrid-body tr[node-id=' + idValue + ']');
			var subtr = tr.next('tr.treegrid-tr-tree');
			if (subtr.length){
				r.body = subtr.find('>td');
			} else {
				var subtr = $('<tr class="treegrid-tr-tree"></tr>').insertAfter(tr);
				var body = $('<td style="border:0"></td>').attr('colspan', fields.length).appendTo(subtr);
				r.body = body;
			}
			var td = tr.find('td[field=' + opts.treeField + ']');
			r.level = td.find('span.tree-indent,span.tree-hit').length;
			
			return r;
		}
		
		function appendRows(ptable, children, depth, fields){
			for(var i=0; i<children.length; i++){
				var row = children[i];
				if (row.state != 'open' && row.state != 'closed'){
					row.state = 'open';
				}
				
				var tr = $('<tr></tr>').attr('node-id', row[opts.idField]).appendTo(ptable);
				$.data(tr[0], 'treegrid-node', row);
				
				var table = [];
				for(var j=0; j<fields.length; j++){
					var field = fields[j];
					var col = getColumnOption(target, field);
					if (col){
						var style = 'width:' + (col.width) + 'px;';
						style += 'text-align:' + (col.align || 'left') + ';';
						style += opts.nowrap == false ? 'white-space:normal;' : '';
						
						table.push('<td field="' + field + '">');
						
						table.push('<div style="' + style + '" ');
						if (col.checkbox){
							table.push('class="datagrid-cell-check ');
						} else {
							table.push('class="datagrid-cell ');
						}
						table.push('">');
						
						if (col.checkbox){
							if (selected){
								table.push('<input type="checkbox" checked="checked"/>');
							} else {
								table.push('<input type="checkbox"/>');
							}
						} else if (col.formatter){
							table.push(col.formatter(row[field], row, i));
						} else {
							table.push(row[field] || '&nbsp;');
						}
						table.push('</div>');
						table.push('</td>');
					}
				}
				tr.html(table.join(''));
				
				var cell = tr.find('td[field='+opts.treeField+'] div.datagrid-cell');
				cell.wrapInner('<span class="tree-title"></span>');
				if (row.children && row.children.length){
					var subtr = $('<tr class="treegrid-tr-tree"></tr>').insertAfter(tr);
					var td = $('<td style="border:0"></td>').attr('colspan', fields.length).appendTo(subtr);
					var table = $('<table cellspacing="0" cellpadding="0" border="0"></table>').appendTo(td);
					
					if (row.state == 'open'){
						$('<span class="tree-icon tree-folder tree-folder-open"></span>').addClass(row.iconCls).prependTo(cell);
						$('<span class="tree-hit tree-expanded"></span>').prependTo(cell);
					} else {
						$('<span class="tree-icon tree-folder"></span>').addClass(row.iconCls).prependTo(cell);
						$('<span class="tree-hit tree-collapsed"></span>').prependTo(cell);
						subtr.css('display','none');
					}
					
					appendRows(table, row.children, depth+1, fields);
				} else {
					if (row.state == 'closed'){
						$('<span class="tree-folder"></span>').addClass(row.iconCls).prependTo(cell);
						$('<span class="tree-hit tree-collapsed"></span>').prependTo(cell);
					} else {
						$('<span class="tree-icon tree-file"></span>').addClass(row.iconCls).prependTo(cell);
						$('<span class="tree-indent"></span>').prependTo(cell);
					}
				}
				for(var j=0; j<depth; j++){
					$('<span class="tree-indent"></span>').prependTo(cell);
				}
			}
		}
	}
	
	function request(target, parentId, param, callback){
		var opts = $.data(target, 'treegrid').options;
		var body = $(target).datagrid('getPanel').find('div.datagrid-body');
		param = param || {};
		
		var row = null;
		var tr = body.find('tr[node-id=' + parentId + ']');
		if (tr.length){
			row = $.data(tr[0], 'treegrid-node');
		}
		
		if (opts.onBeforeLoad.call(target, row, param) == false) return;
		if (!opts.url) return;
		
		var folder = tr.find('span.tree-folder');
		folder.addClass('tree-loading');
		$.ajax({
			type: opts.method,
			url: opts.url,
			data: param,
			dataType: 'json',
			success: function(data){
				folder.removeClass('tree-loading');
				loadData(target, parentId, data);
				if (callback) {
					callback();
				}
			},
			error: function(){
				folder.removeClass('tree-loading');
				opts.onLoadError.apply(target, arguments);
				if (callback){
					callback();
				}
			}
		});
	}
	
	function select(target, idValue){
		var body = $(target).datagrid('getPanel').find('div.datagrid-body');
		body.find('tr.tree-node-selected').removeClass('tree-node-selected');
		body.find('tr[node-id=' + idValue + ']').addClass('tree-node-selected');
	}
	
	function collapse(target, idValue){
		var opts = $.data(target, 'treegrid').options;
		var body = $(target).datagrid('getPanel').find('div.datagrid-body');
		var tr = body.find('tr[node-id=' + idValue + ']');
		var row = $.data(tr[0], 'treegrid-node');
		var hit = tr.find('span.tree-hit');
		
		if (hit.length == 0) return;	// is leaf
		if (hit.hasClass('tree-collapsed')) return;	// has collapsed
		if (opts.onBeforeCollapse.call(target, row) == false) return;
		
		hit.removeClass('tree-expanded tree-expanded-hover').addClass('tree-collapsed');
		hit.next().removeClass('tree-folder-open');
		tr.next('tr.treegrid-tr-tree').hide();
		opts.onCollapse.call(target, row);
	}
	
	function expand(target, idValue){
		var opts = $.data(target, 'treegrid').options;
		var body = $(target).datagrid('getPanel').find('div.datagrid-body');
		var tr = body.find('tr[node-id=' + idValue + ']');
		var row = $.data(tr[0], 'treegrid-node');
		var hit = tr.find('span.tree-hit');
		
		if (hit.length == 0) return;	// is leaf
		if (hit.hasClass('tree-expanded')) return;	// has expanded
		if (opts.onBeforeExpand.call(target, row) == false) return;
		
		hit.removeClass('tree-collapsed tree-collapsed-hover').addClass('tree-expanded');
		hit.next().addClass('tree-folder-open');
		var subtree = tr.next('tr.treegrid-tr-tree');
		if (subtree.length){
			subtree.show();
			$(target).datagrid('fixColumnSize');
			setRowHeight(target, idValue);
			opts.onExpand.call(target, row);
		} else {
			request(target, row[opts.idField], {id:row[opts.idField]}, function(){
				opts.onExpand.call(target, row);
			});
		}
	}
	
	function toggle(target, idValue){
		var body = $(target).datagrid('getPanel').find('div.datagrid-body');
		var tr = body.find('tr[node-id=' + idValue + ']');
		var hit = tr.find('span.tree-hit');
		if (hit.hasClass('tree-expanded')){
			collapse(target, idValue);
		} else {
			expand(target, idValue);
		}
	}
	
	$.fn.treegrid = function(options, param){
		if (typeof options == 'string'){
			switch(options){
			case 'select':
				return this.each(function(){
					select(this, param);	// param: the row id value
				});
			case 'collapse':
				return this.each(function(){
					collapse(this, param);	// param: the row id value
				});
			case 'expand':
				return this.each(function(){
					expand(this, param);	// param: the row id value
				});
			case 'toggle':
				return this.each(function(){
					toggle(this, param);	// param: the row id value
				});
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'treegrid');
			if (state){
				$.extend(state.options, options);
			} else {
				$.data(this, 'treegrid', {
					options: $.extend({}, $.fn.treegrid.defaults, options)
				});
			}
			
			buildGrid(this);
			request(this);
		});
	};
	
	$.fn.treegrid.defaults = {
		treeField:null,
		
		onBeforeLoad: function(row, param){},
		onLoadSuccess: function(row){},
		onLoadError: function(){},
		onBeforeCollapse: function(row){},
		onCollapse: function(row){},
		onBeforeExpand: function(row){},
		onExpand: function(row){}
	};
})(jQuery);