/**
 * combogrid - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 *   combo
 *   datagrid
 * 
 */
(function($){
	/**
	 * create this component.
	 */
	function create(target){
		var opts = $.data(target, 'combogrid').options;
		var grid = $.data(target, 'combogrid').grid;
		
		$(target).combo(opts);
		var panel = $(target).combo('panel');
		if (!grid){
			grid = $('<table></table>').appendTo(panel);
			$.data(target, 'combogrid').grid = grid;
		}
		grid.datagrid($.extend({}, opts, {
			border: false,
			fit: true,
			singleSelect: (!opts.multiple),
			onSelect: function(){retrieveValues(target);},
			onUnselect: function(){retrieveValues(target);},
			onSelectAll: function(){retrieveValues(target);},
			onUnselectAll: function(){retrieveValues(target);}
		}));
	}
	
	/**
	 * retrieve values from datagrid panel.
	 */
	function retrieveValues(target){
		var opts = $.data(target, 'combogrid').options;
		var grid = $.data(target, 'combogrid').grid;
		var rows = grid.datagrid('getSelections');
		var vv = [],ss = [];
		for(var i=0; i<rows.length; i++){
			vv.push(rows[i][opts.idField]);
			ss.push(rows[i][opts.textField]);
		}
		$(target).combo('setValues', vv).combo('setText', ss.join(opts.separator));
	}
	
	/**
	 * select the specified row via step value,
	 * if the step is not assigned, the current row is selected as the combogrid value.
	 */
	function selectRow(target, step){
		var opts = $.data(target, 'combogrid').options;
		var grid = $.data(target, 'combogrid').grid;
		if (opts.multiple) return;
		
		if (!step){
			var selected = grid.datagrid('getSelected');
			if (selected){
				setValues(target, [selected[opts.idField]]);	// set values
				$(target).combo('hidePanel');	// hide the drop down panel
			}
			return;
		}
		
		var selected = grid.datagrid('getSelected');
		if (selected){
			var index = grid.datagrid('getRowIndex', selected[opts.idField]);
			grid.datagrid('unselectRow', index);
			index += step;
			if (index < 0) index = 0;
			if (index >= grid.datagrid('getRows').length) index = grid.datagrid('getRows').length - 1;
			grid.datagrid('selectRow', index);
		} else {
			grid.datagrid('selectRow', 0);
		}
	}
	
	/**
	 * set combogrid values
	 */
	function setValues(target, values){
		var opts = $.data(target, 'combogrid').options;
		var grid = $.data(target, 'combogrid').grid;
		var rows = grid.datagrid('getRows');
		grid.datagrid('clearSelections');
		for(var i=0; i<values.length; i++){
			var index = grid.datagrid('getRowIndex', values[i]);
			grid.datagrid('selectRow', index);
		}
		retrieveValues(target);
		if ($(target).combogrid('getValues').length == 0){
			$(target).combo('setValues', values).combo('setText', values.join(opts.separator));
		}
	}
	
	$.fn.combogrid = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.combogrid.methods[options];
			if (method){
				return method(this, param);
			} else {
				return $.fn.combo.methods[options](this, param);
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'combogrid');
			if (state){
				$.extend(state.options, options);
			} else {
				var t = $(this);
				state = $.data(this, 'combogrid', {
					options: $.extend({}, $.fn.combo.defaults, $.fn.combogrid.defaults, {
						width: (parseInt(this.style.width) || undefined),
						idField: (t.attr('idField') || undefined),
						textField: (t.attr('textField') || undefined),
						separator: (t.attr('separator') || undefined),
						multiple: (t.attr('multiple') ? (t.attr('multiple') == 'true' || t.attr('multiple') == true) : undefined),
						editable: (t.attr('editable') ? t.attr('editable') == 'true' : undefined),
						disabled: (t.attr('disabled') ? true : undefined),
						required: (t.attr('required') ? (t.attr('required') == 'true' || t.attr('required') == true) : undefined),
						missingMessage: (t.attr('missingMessage') || undefined)
					}, options)
				});
			}
			
			create(this);
		});
	};
	
	$.fn.combogrid.methods = {
		options: function(jq){
			return $.data(jq[0], 'combogrid').options;
		},
		// get the datagrid object.
		grid: function(jq){
			return $.data(jq[0], 'combogrid').grid;
		},
		setValues: function(jq, values){
			return jq.each(function(){
				setValues(this, values);
			});
		}
	};
	
	$.fn.combogrid.defaults = {
		idField: null,
		textField: null,	// the text field to display.
		selectPrev: function(){selectRow(this, -1);},
		selectNext: function(){selectRow(this, 1);},
		select: function(){selectRow(this);}
	};
})(jQuery);
