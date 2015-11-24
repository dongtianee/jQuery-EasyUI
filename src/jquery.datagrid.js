/**
 * datagrid - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	resizable
 * 	linkbutton
 * 	pagination
 * 
 */
(function($){
	
	function setSize(target) {
		var grid = $.data(target, 'datagrid').grid;
		var opts = $.data(target, 'datagrid').options;
		if (opts.fit == true){
			var p = grid.parent();
			opts.width = p.width();
			opts.height = p.height();
		}
		
		if (opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length>0)){
			$('.datagrid-body .datagrid-cell,.datagrid-body .datagrid-cell-rownumber',grid).addClass('datagrid-cell-height');
		}
		
		var gridWidth = opts.width;
		if (gridWidth == 'auto') {
			if ($.boxModel == true) {
				gridWidth = grid.width();
			} else {
				gridWidth = grid.outerWidth();
			}
		} else {
			if ($.boxModel == true){
				gridWidth -= grid.outerWidth() - grid.width();
			}
		}
		grid.width(gridWidth);
		
		var innerWidth = gridWidth;
		if ($.boxModel == false) {
			innerWidth = gridWidth - grid.outerWidth() + grid.width();
		}
		
		$('.datagrid-wrap', grid).width(innerWidth);
		$('.datagrid-view', grid).width(innerWidth);
		$('.datagrid-view1',grid).width($('.datagrid-view1 table',grid).width());
		$('.datagrid-view2',grid).width(innerWidth - $('.datagrid-view1',grid).outerWidth());
		$('.datagrid-view1 .datagrid-header',grid).width($('.datagrid-view1',grid).width());
		$('.datagrid-view1 .datagrid-body',grid).width($('.datagrid-view1',grid).width());
		$('.datagrid-view2 .datagrid-header',grid).width($('.datagrid-view2',grid).width());
		$('.datagrid-view2 .datagrid-body',grid).width($('.datagrid-view2',grid).width());
		
		var hh;
		var header1 = $('.datagrid-view1 .datagrid-header',grid);
		var header2 = $('.datagrid-view2 .datagrid-header',grid);
		header1.css('height', null);
		header2.css('height', null);
		if ($.boxModel == true){
			hh = Math.max(header1.height(), header2.height());
		} else {
			hh = Math.max(header1.outerHeight(), header2.outerHeight());
		}
		$('.datagrid-view1 .datagrid-header table',grid).height(hh);
		$('.datagrid-view2 .datagrid-header table',grid).height(hh);
		header1.height(hh);
		header2.height(hh);
		
		if (opts.height == 'auto') {
			$('.datagrid-body', grid).height($('.datagrid-view2 .datagrid-body table', grid).height());
		} else {
			$('.datagrid-body', grid).height(
					opts.height
					- (grid.outerHeight() - grid.height())
					- $('.datagrid-header', grid).outerHeight(true)
					- $('.datagrid-title', grid).outerHeight(true)
					- $('.datagrid-toolbar', grid).outerHeight(true)
					- $('.datagrid-pager', grid).outerHeight(true)
			);
		}
		
		$('.datagrid-view',grid).height($('.datagrid-view2',grid).height());
		$('.datagrid-view1',grid).height($('.datagrid-view2',grid).height());
		$('.datagrid-view2',grid).css('left', $('.datagrid-view1',grid).outerWidth());
	}
	
	/**
	 * wrap and return the grid object, fields and columns
	 */
	function wrapGrid(target, rownumbers) {
		var grid = $(target).wrap('<div class="datagrid"></div>').parent();
		
		grid.append(
				'<div class="datagrid-wrap">' +
					'<div class="datagrid-view">' +
						'<div class="datagrid-view1">' +
							'<div class="datagrid-header">' +
								'<div class="datagrid-header-inner"></div>' +
							'</div>' +
							'<div class="datagrid-body">' +
								'<div class="datagrid-body-inner">' +
									'<table border="0" cellspacing="0" cellpadding="0"></table>' +
								'</div>' +
							'</div>' +
						'</div>' +
						'<div class="datagrid-view2">' +
							'<div class="datagrid-header">' +
								'<div class="datagrid-header-inner"></div>' +
							'</div>' +
							'<div class="datagrid-body"></div>' +
						'</div>' +
						'<div class="datagrid-resize-proxy"></div>' +
					'</div>' +
				'</div>'
		);
		
		var frozenColumns = getColumns($('thead[frozen=true]', target));
		$('thead[frozen=true]', target).remove();
		var columns = getColumns($('thead', target));
		$('thead', target).remove();
		
		$(target).attr({
			cellspacing: 0,
			cellpadding: 0,
			border: 0
		}).removeAttr('width').removeAttr('height').appendTo($('.datagrid-view2 .datagrid-body', grid));
		
		
		function getColumns(thead){
			var columns = [];
			$('tr', thead).each(function(){
				var cols = [];
				$('th', this).each(function(){
					var th = $(this);
					var col = {
						title: th.html(),
						align: th.attr('align') || 'left',
						sortable: th.attr('sortable')=='true' || false,
						checkbox: th.attr('checkbox')=='true' || false
					};
					if (th.attr('field')) {
						col.field = th.attr('field');
					}
					if (th.attr('formatter')){
						col.formatter = eval(th.attr('formatter'));
					}
					if (th.attr('rowspan')) col.rowspan = parseInt(th.attr('rowspan'));
					if (th.attr('colspan')) col.colspan = parseInt(th.attr('colspan'));
					if (th.attr('width')) col.width = parseInt(th.attr('width'));
					
					cols.push(col);
				});
				columns.push(cols);
			});
			
			return columns;
		}
		
		var fields = getColumnFields(columns);
		$('.datagrid-view2 .datagrid-body tr', grid).each(function(){
			for(var i=0; i<fields.length; i++){
				$('td:eq('+i+')', this)
						.addClass('datagrid-column-'+fields[i])
						.wrapInner('<div class="datagrid-cell"></div>');
			}
		});
		
		grid.bind('_resize', function(){
			var opts = $.data(target, 'datagrid').options;
			if (opts.fit == true){
				setSize(target);
				fixColumnSize(target);
			}
			return false;
		});
		
		return {
			grid: grid,
			frozenColumns: frozenColumns,
			columns: columns
		};
	}
	
	function createColumnHeader(columns){
		var t = $('<table border="0" cellspacing="0" cellpadding="0"><thead></thead></table>');
		for(var i=0; i<columns.length; i++) {
			var tr = $('<tr></tr>').appendTo($('thead', t));
			var cols = columns[i];
			for(var j=0; j<cols.length; j++){
				var col = cols[j];
				
				var attr = '';
				if (col.rowspan) attr += 'rowspan="' + col.rowspan + '" ';
				if (col.colspan) attr += 'colspan="' + col.colspan + '" ';
				var th = $('<th ' + attr + '></th>').appendTo(tr);
				
				if (col.checkbox){
					th.attr('field', col.field);
					$('<div class="datagrid-header-check"></div>')
							.html('<input type="checkbox"/>')
							.appendTo(th);
				} else if (col.field){
					th.append('<div class="datagrid-cell"><span></span><span class="datagrid-sort-icon"></span></div>');
					th.attr('field', col.field);
					$('.datagrid-cell', th).width(col.width);
					$('span', th).html(col.title);
					$('span.datagrid-sort-icon', th).html('&nbsp;');
				} else {
					th.append('<div class="datagrid-cell-group"></div>');
					$('.datagrid-cell-group', th).html(col.title);
				}
			}
			
		}
		return t;
	}
	
	/**
	 * set the common properties
	 */
	function setProperties(target) {
		var grid = $.data(target, 'datagrid').grid;
		var opts = $.data(target, 'datagrid').options;
		var data = $.data(target, 'datagrid').data;
		
		if (opts.striped) {
			$('.datagrid-view1 .datagrid-body tr:odd', grid).addClass('datagrid-row-alt');
			$('.datagrid-view2 .datagrid-body tr:odd', grid).addClass('datagrid-row-alt');
		}
		if (opts.nowrap == false) {
			$('.datagrid-body .datagrid-cell', grid).css('white-space', 'normal');
		}
		
		$('.datagrid-header th:has(.datagrid-cell)', grid).hover(
			function(){$(this).addClass('datagrid-header-over');},
			function(){$(this).removeClass('datagrid-header-over');}
		);
		
		$('.datagrid-body tr', grid).mouseover(function(){
			var index = $(this).attr('datagrid-row-index');
			$('.datagrid-body tr[datagrid-row-index='+index+']',grid).addClass('datagrid-row-over');
		}).mouseout(function(){
			var index = $(this).attr('datagrid-row-index');
			$('.datagrid-body tr[datagrid-row-index='+index+']',grid).removeClass('datagrid-row-over');
		}).click(function(){
			var index = $(this).attr('datagrid-row-index');
			if ($(this).hasClass('datagrid-row-selected')){
				unselectRow(target, index);
			} else {
				selectRow(target, index);
			}
			if (opts.onClickRow){
				opts.onClickRow.call(this, index, data.rows[index]);
			}
		}).dblclick(function(){
			var index = $(this).attr('datagrid-row-index');
			if (opts.onDblClickRow){
				opts.onDblClickRow.call(this, index, data.rows[index]);
			}
		});
		
		function onHeaderCellClick(){
			var field = $(this).parent().attr('field');
			var opt = getColumnOption(target, field);
			if (!opt.sortable) return;
			
			opts.sortName = field;
			opts.sortOrder = 'asc';
			
			var c = 'datagrid-sort-asc';
			if ($(this).hasClass('datagrid-sort-asc')){
				c = 'datagrid-sort-desc';
				opts.sortOrder = 'desc';
			}
			$('.datagrid-header .datagrid-cell', grid).removeClass('datagrid-sort-asc');
			$('.datagrid-header .datagrid-cell', grid).removeClass('datagrid-sort-desc');
			$(this).addClass(c);
			
			if (opts.onSortColumn){
				opts.onSortColumn.call(this, opts.sortName, opts.sortOrder);
			}
			request(target);
		}
		
		function onHeaderCheckboxClick(){
			if ($(this).attr('checked')){
				$('.datagrid-view2 .datagrid-body tr', grid).each(function(){
					if (!$(this).hasClass('datagrid-row-selected')){
						$(this).trigger('click');
					}
				});
			} else {
				$('.datagrid-view2 .datagrid-body tr', grid).each(function(){
					if ($(this).hasClass('datagrid-row-selected')){
						$(this).trigger('click');
					}
				});
			}
		}
		
		$('.datagrid-header .datagrid-cell', grid).unbind('.datagrid');
		$('.datagrid-header .datagrid-cell', grid).bind('click.datagrid', onHeaderCellClick);
		
		$('.datagrid-header .datagrid-header-check input[type=checkbox]', grid).unbind('.datagrid');
		$('.datagrid-header .datagrid-header-check input[type=checkbox]', grid).bind('click.datagrid', onHeaderCheckboxClick);
		
		$('.datagrid-header .datagrid-cell', grid).resizable({
			handles:'e',
			minWidth:50,
			onStartResize: function(e){
				$('.datagrid-resize-proxy', grid).css({
					left:e.pageX - $(grid).offset().left - 1
				});
				$('.datagrid-resize-proxy', grid).css('display', 'block');
			},
			onResize: function(e){
				$('.datagrid-resize-proxy', grid).css({
					left:e.pageX - $(grid).offset().left - 1
				});
				return false;
			},
			onStopResize: function(e){
				fixColumnSize(target, this);
				$('.datagrid-view2 .datagrid-header', grid).scrollLeft($('.datagrid-view2 .datagrid-body', grid).scrollLeft());
				$('.datagrid-resize-proxy', grid).css('display', 'none');
			}
		});
		$('.datagrid-view1 .datagrid-header .datagrid-cell', grid).resizable({
			onStopResize: function(e){
				fixColumnSize(target, this);
				$('.datagrid-view2 .datagrid-header', grid).scrollLeft($('.datagrid-view2 .datagrid-body', grid).scrollLeft());
				$('.datagrid-resize-proxy', grid).css('display', 'none');
				setSize(target);
			}
		});
		
		var body1 = $('.datagrid-view1 .datagrid-body', grid);
		var body2 = $('.datagrid-view2 .datagrid-body', grid);
		var header2 = $('.datagrid-view2 .datagrid-header', grid);
		body2.scroll(function(){
			header2.scrollLeft(body2.scrollLeft());
			body1.scrollTop(body2.scrollTop());
		});
	}
	
	/**
	 * fix column size with the special cell element
	 */
	function fixColumnSize(target, cell) {
		var grid = $.data(target, 'datagrid').grid;
		var opts = $.data(target, 'datagrid').options;
		
		if (cell) {
			fix(cell);
		} else {
			$('.datagrid-header .datagrid-cell', grid).each(function(){
				fix(this);
			});
		}
		
		function fix(cell) {
			var headerCell = $(cell);
			if (headerCell.width() == 0) return;
			
			var fieldName = headerCell.parent().attr('field');
			$('.datagrid-body td.datagrid-column-' + fieldName + ' .datagrid-cell', grid).each(function(){
				var bodyCell = $(this);
				if ($.boxModel == true) {
					bodyCell.width(headerCell.outerWidth() - bodyCell.outerWidth() + bodyCell.width());
				} else {
					bodyCell.width(headerCell.outerWidth());
				}
				
			});
			
			var col = getColumnOption(target, fieldName);
			col.width = $.boxModel==true ? headerCell.width() : headerCell.outerWidth();
			
		}
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
	
	/**
	 * get column fields which will be show in row
	 */
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
	
	/**
	 * load data to the grid
	 */
	function loadData(target, data){
		var grid = $.data(target, 'datagrid').grid;
		var opts = $.data(target, 'datagrid').options;
		var selectedRows = $.data(target, 'datagrid').selectedRows;
		var rows = data.rows;
		
		var getWidthDelta = function(){
			if ($.boxModel == false) return 0;
			
			var headerCell = $('.datagrid-header .datagrid-cell:first');
			var headerDelta = headerCell.outerWidth() - headerCell.width();
			
			var t = $('.datagrid-body table', grid);
			t.append($('<tr><td><div class="datagrid-cell"></div></td></tr>'));
			var bodyCell = $('.datagrid-cell', t);
			
			var bodyDelta = bodyCell.outerWidth() - bodyCell.width();
			
			return headerDelta - bodyDelta;
		};
		
		var widthDelta = getWidthDelta();
		var frozen = opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length > 0);
		
		function getTBody(fields, rownumbers){
			function isSelected(row){
				if (!opts.idField) return false;
				
				for(var i=0; i<selectedRows.length; i++){
					if (selectedRows[i][opts.idField] == row[opts.idField]) return true;
				}
				return false;
			}
			
			var tbody = ['<tbody>'];
			for(var i=0; i<rows.length; i++) {
				var row = rows[i];
				var selected = isSelected(row);
				
				if (i % 2 && opts.striped){
					tbody.push('<tr datagrid-row-index="' + i + '" class="datagrid-row-alt');
				} else {
					tbody.push('<tr datagrid-row-index="' + i + '" class="');
				}
				if (selected == true){
					tbody.push(' datagrid-row-selected');
				}
				tbody.push('">');
				
				if (rownumbers){
					var rownumber = i+1;
					if (opts.pagination){
						rownumber += (opts.pageNumber-1)*opts.pageSize;
					}
					if (frozen){
						tbody.push('<td><div class="datagrid-cell-rownumber datagrid-cell-height">'+rownumber+'</div></td>');
					} else {
						tbody.push('<td><div class="datagrid-cell-rownumber">'+rownumber+'</div></td>');
					}
				}
				for(var j=0; j<fields.length; j++){
					var field = fields[j];
					var col = getColumnOption(target, field);
					if (col){
						var style = 'width:' + (col.width + widthDelta) + 'px;';
						style += 'text-align:' + (col.align || 'left');
						
						tbody.push('<td class="datagrid-column-' + field + '">');
						
						tbody.push('<div style="' + style + '" ');
						if (col.checkbox){
							tbody.push('class="datagrid-cell-check ');
						} else {
							tbody.push('class="datagrid-cell ');
						}
						if (frozen){
							tbody.push('datagrid-cell-height ');
						}
						tbody.push('">');
						
						if (col.checkbox){
							if (selected){
								tbody.push('<input type="checkbox" checked="checked"/>');
							} else {
								tbody.push('<input type="checkbox"/>');
							}
						} else if (col.formatter){
							tbody.push(col.formatter(row[field], row));
						} else {
							tbody.push(row[field]);
						}
						tbody.push('</div>');
						tbody.push('</td>');
					}
				}
				
				tbody.push('</tr>');
			}
			tbody.push('</tbody>');
			return tbody.join('');
		}
		
		$('.datagrid-body, .datagrid-header', grid).scrollLeft(0).scrollTop(0);
		var fields = getColumnFields(opts.columns);
		$('.datagrid-view2 .datagrid-body table', grid).html(getTBody(fields));
		if (opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length > 0)){
			var frozenFields = getColumnFields(opts.frozenColumns);
			$('.datagrid-view1 .datagrid-body table', grid).html(getTBody(frozenFields, opts.rownumbers));
		}
		
		$.data(target, 'datagrid').data = data;
		$('.datagrid-pager', grid).pagination({total: data.total});
		setSize(target);
		setProperties(target);
	}
	
	function getSelectedRows(target){
		var opts = $.data(target, 'datagrid').options;
		var grid = $.data(target, 'datagrid').grid;
		var data = $.data(target, 'datagrid').data;
		
		if (opts.idField){
			return $.data(target, 'datagrid').selectedRows;
		}
		
		var rows = [];
		$('.datagrid-view2 .datagrid-body tr.datagrid-row-selected', grid).each(function(){
			var index = parseInt($(this).attr('datagrid-row-index'));
			if (data.rows[index]){
				rows.push(data.rows[index]);
			}
		});
		return rows;
	}
	
	/**
	 * clear all the selection records
	 */
	function clearSelections(target){
		var grid = $.data(target, 'datagrid').grid;
		
		$('.datagrid-body tr.datagrid-row-selected', grid).removeClass('datagrid-row-selected');
		$('.datagrid-body .datagrid-cell-check input[type=checkbox]', grid).attr('checked', false);
		var selectedRows = $.data(target, 'datagrid').selectedRows;
		while(selectedRows.length > 0){
			selectedRows.pop();
		}
	}
	
	/**
	 * select a row with specified row index which start with 0.
	 */
	function selectRow(target, index){
		var grid = $.data(target, 'datagrid').grid;
		var opts = $.data(target, 'datagrid').options;
		var data = $.data(target, 'datagrid').data;
		var selectedRows = $.data(target, 'datagrid').selectedRows;
		
		var tr = $('.datagrid-body tr[datagrid-row-index='+index+']',grid);
		var ck = $('.datagrid-body tr[datagrid-row-index='+index+'] .datagrid-cell-check input[type=checkbox]',grid);
		if (opts.singleSelect == true){
			clearSelections(target);
		}
		tr.addClass('datagrid-row-selected');
		ck.attr('checked', true);
		
		if (opts.idField){
			var row = data.rows[index];
			for(var i=0; i<selectedRows.length; i++){
				if (selectedRows[i][opts.idField] == row[opts.idField]){
					return;
				}
			}
			selectedRows.push(row);
		}
		opts.onSelect.call(target, index, data.rows[index]);
	}
	
	/**
	 * select record by idField.
	 */
	function selectRecord(target, idValue){
		var opts = $.data(target, 'datagrid').options;
		var data = $.data(target, 'datagrid').data;
		if (opts.idField){
			var index = -1;
			for(var i=0; i<data.rows.length; i++){
				if (data.rows[i][opts.idField] == idValue){
					index = i;
					break;
				}
			}
			if (index >= 0){
				selectRow(target, index);
			}
		}
	}
	
	/**
	 * unselect a row.
	 */
	function unselectRow(target, index){
		var opts = $.data(target, 'datagrid').options;
		var grid = $.data(target, 'datagrid').grid;
		var selectedRows = $.data(target, 'datagrid').selectedRows;
		
		var tr = $('.datagrid-body tr[datagrid-row-index='+index+']',grid);
		var ck = $('.datagrid-body tr[datagrid-row-index='+index+'] .datagrid-cell-check input[type=checkbox]',grid);
		tr.removeClass('datagrid-row-selected');
		ck.attr('checked', false);
		
		var row = $.data(target, 'datagrid').data.rows[index];
		if (opts.idField){
			for(var i=0; i<selectedRows.length; i++){
				var row1 = selectedRows[i];
				if (row1[opts.idField] == row[opts.idField]){
					for(var j=i+1; j<selectedRows.length; j++){
						selectedRows[j-1] = selectedRows[j];
					}
					selectedRows.pop();
					break;
				}
			}
		}
		opts.onUnselect.call(target, index, row);
	}
	
	/**
	 * request remote data
	 */
	function request(target){
		var grid = $.data(target, 'datagrid').grid;
		var opts = $.data(target, 'datagrid').options;
		
		if (!opts.url) return;
		
		var param = $.extend({}, opts.queryParams);
		if (opts.pagination){
			$.extend(param, {
				page: opts.pageNumber,
				rows: opts.pageSize
			});
		}
		if (opts.sortName){
			$.extend(param, {
				sort: opts.sortName,
				order: opts.sortOrder
			});
		}
		
		$('.datagrid-pager', grid).pagination({loading:true});
		
		var wrap = $('.datagrid-wrap', grid);
		$('<div class="datagrid-mask"></div>').css({
			display:'block',
			width: wrap.width(),
			height: wrap.height()
		}).appendTo(wrap);
		$('<div class="datagrid-mask-msg"></div>')
				.html(opts.loadMsg)
				.appendTo(wrap)
				.css({
					display:'block',
					left:(wrap.width()-$('.datagrid-mask-msg',grid).outerWidth())/2,
					top:(wrap.height()-$('.datagrid-mask-msg',grid).outerHeight())/2
				});
		
		$.ajax({
			type: opts.method,
			url: opts.url,
			data: param,
			dataType: 'json',
			success: function(data){
				$('.datagrid-pager', grid).pagination({loading:false});
				$('.datagrid-mask', grid).remove();
				$('.datagrid-mask-msg', grid).remove();
				loadData(target, data);
				if (opts.onLoadSuccess){
					opts.onLoadSuccess.apply(this, arguments);
				}
			},
			error: function(){
				$('.datagrid-pager', grid).pagination({loading:false});
				$('.datagrid-mask', grid).remove();
				$('.datagrid-mask-msg', grid).remove();
				if (opts.onLoadError){
					opts.onLoadError.apply(this, arguments);
				}
			}
		});
	}
	
	$.fn.datagrid = function(options, param){
		if (typeof options == 'string') {
			switch(options){
				case 'options':
					return $.data(this[0], 'datagrid').options;
					
				case 'resize':
					return this.each(function(){
						setSize(this);
					});
					
				case 'reload':
					return this.each(function(){
						request(this);
					});
					
				case 'fixColumnSize':
					return this.each(function(){
						fixColumnSize(this);
					});
					
				case 'loadData':
					return this.each(function(){
						loadData(this, param);
					});
					
				case 'getSelected':
					var rows = getSelectedRows(this[0]);
					return rows.length>0 ? rows[0] : null;
					
				case 'getSelections':
					return getSelectedRows(this[0]);
					
				case 'clearSelections':
					return this.each(function(){
						clearSelections(this);
					});
				
				case 'selectRow':
					return this.each(function(){
						selectRow(this, param);
					});
					
				case 'selectRecord':
					return this.each(function(){
						selectRecord(this, param);
					});
					
				case 'unselectRow':
					return this.each(function(){
						unselectRow(this, param);
					});
			}
		}
		
		options = options || {};
		
		return this.each(function(){
			var state = $.data(this, 'datagrid');
			var opts;
			if (state) {
				opts = $.extend(state.options, options);
				state.options = opts;
			} else {
				opts = $.extend({}, $.fn.datagrid.defaults, {
					width: (parseInt($(this).css('width')) || 'auto'),
					height: (parseInt($(this).css('height')) || 'auto'),
					fit: $(this).attr('fit') == 'true'
				}, options);
				$(this).css('width', null).css('height', null);
				
				var wrapResult = wrapGrid(this, opts.rownumbers);
				if (!opts.columns) opts.columns = wrapResult.columns;
				if (!opts.frozenColumns) opts.frozenColumns = wrapResult.frozenColumns;
				$.data(this, 'datagrid', {
					options: opts,
					grid: wrapResult.grid,
					selectedRows: []
				});
			}
			
			var target = this;
			var grid = $.data(this, 'datagrid').grid;
			
			if (opts.border == true){
				grid.removeClass('datagrid-noborder');
			} else {
				grid.addClass('datagrid-noborder');
			}
			
			if (opts.frozenColumns){
				var t = createColumnHeader(opts.frozenColumns);
				if (opts.rownumbers){
					var th = $('<th rowspan="'+opts.frozenColumns.length+'"><div class="datagrid-header-rownumber"></div></th>');
					if ($('tr',t).length == 0){
						th.wrap('<tr></tr>').parent().appendTo($('thead',t));
					} else {
						th.prependTo($('tr:first', t));
					}
				}
				$('.datagrid-view1 .datagrid-header-inner', grid).html(t);
			}
			
			if (opts.columns){
				var t = createColumnHeader(opts.columns);
				$('.datagrid-view2 .datagrid-header-inner', grid).html(t);
			}
			
		
			$('.datagrid-title', grid).remove();
			if (opts.title) {
				var title = $('<div class="datagrid-title"><span class="datagrid-title-text"></span></div>');
				$('.datagrid-title-text', title).html(opts.title);
				title.prependTo(grid);
				if (opts.iconCls) {
					$('.datagrid-title-text', title).addClass('datagrid-title-with-icon');
					$('<div class="datagrid-title-icon"></div>').addClass(opts.iconCls).appendTo(title);
				}
			}
			
			$('.datagrid-toolbar', grid).remove();
			if (opts.toolbar) {
				var tb = $('<div class="datagrid-toolbar"></div>').prependTo($('.datagrid-wrap', grid));
				for(var i=0; i<opts.toolbar.length; i++) {
					var btn = opts.toolbar[i];
					if (btn == '-') {
						$('<div class="datagrid-btn-separator"></div>').appendTo(tb);
					} else {
						var tool = $('<a href="javascript:void(0)"></a>');
						tool[0].onclick = eval(btn.handler || function(){});
						tool.css('float', 'left')
							.text(btn.text)
							.attr('icon', btn.iconCls || '')
							.appendTo(tb)
							.linkbutton({
								plain:true,
								disabled:(btn.disabled || false)
							});
					}
				}
			}
			
			$('.datagrid-pager', grid).remove();
			if (opts.pagination) {
				var pager = $('<div class="datagrid-pager"></div>').appendTo($('.datagrid-wrap', grid));
				pager.pagination({
					pageNumber:opts.pageNumber,
					pageSize:opts.pageSize,
					pageList:opts.pageList,
					onSelectPage: function(pageNum, pageSize){
						// save the page state
						opts.pageNumber = pageNum;
						opts.pageSize = pageSize;
						
						request(target);	// request new page data
					}
				});
				opts.pageSize = pager.pagination('options').pageSize;	// repare the pageSize value
			}
			
			if (!state) {
				fixColumnSize(target);
			}
			setSize(target);
			
			if (opts.url) {
				request(target);
			}
			
			setProperties(target);
				
		});
	};
	
	$.fn.datagrid.defaults = {
		title: null,
		iconCls: null,
		border: true,
		width: 'auto',
		height: 'auto',
		frozenColumns: null,
		columns: null,
		striped: false,
		method: 'post',
		nowrap: true,
		idField: null,
		url: null,
		loadMsg: 'Processing, please wait ...',
		pagination: false,
		rownumbers: false,
		singleSelect: false,
		fit: false,
		pageNumber: 1,
		pageSize: 10,
		pageList: [10,20,30,40,50],
		queryParams: {},
		sortName: null,
		sortOrder: 'asc',
		
		onLoadSuccess: function(){},
		onLoadError: function(){},
		onClickRow: function(rowIndex, rowData){},
		onDblClickRow: function(rowIndex, rowData){},
		onSortColumn: function(sort, order){},
		onSelect: function(rowIndex, rowData){},
		onUnselect: function(rowIndex, rowData){}
	};
})(jQuery);