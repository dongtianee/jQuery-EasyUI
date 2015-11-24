/**
 * pagination - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	linkbutton
 * 
 */
(function($){
	function buildToolbar(target){
		var opts = $.data(target, 'pagination').options;
		
		var pager = $(target).addClass('pagination').empty();
		var t = $('<table cellspacing="0" cellpadding="0" border="0"><tr></tr></table>').appendTo(pager);
		var tr = $('tr', t);
		
		if (opts.showPageList){
			var ps = $('<select class="pagination-page-list"></select>');
			for(var i=0; i<opts.pageList.length; i++) {
				$('<option></option>')
						.text(opts.pageList[i])
						.attr('selected', opts.pageList[i]==opts.pageSize ? 'selected' : '')
						.appendTo(ps);
			}
			$('<td></td>').append(ps).appendTo(tr);
			
			opts.pageSize = parseInt(ps.val());
			
			$('<td><div class="pagination-btn-separator"></div></td>').appendTo(tr);
		}
		
		$('<td><a href="javascript:void(0)" icon="pagination-first"></a></td>').appendTo(tr);
		$('<td><a href="javascript:void(0)" icon="pagination-prev"></a></td>').appendTo(tr);
		$('<td><div class="pagination-btn-separator"></div></td>').appendTo(tr);
		
		$('<span style="padding-left:6px;"></span>')
				.html(opts.beforePageText)
				.wrap('<td></td>')
				.parent().appendTo(tr);
		$('<td><input class="pagination-num" type="text" value="1" size="2"></td>').appendTo(tr);
		$('<span style="padding-right:6px;"></span>')
//				.html(opts.afterPageText)
				.wrap('<td></td>')
				.parent().appendTo(tr);
		
		$('<td><div class="pagination-btn-separator"></div></td>').appendTo(tr);
		$('<td><a href="javascript:void(0)" icon="pagination-next"></a></td>').appendTo(tr);
		$('<td><a href="javascript:void(0)" icon="pagination-last"></a></td>').appendTo(tr);
		
		if (opts.showRefresh){
			$('<td><div class="pagination-btn-separator"></div></td>').appendTo(tr);
			$('<td><a href="javascript:void(0)" icon="pagination-load"></a></td>').appendTo(tr);
			
//			if (opts.loading) {
//				$('<td><a class="pagination-refresh" href="javascript:void(0)" icon="pagination-loading"></a></td>').appendTo(tr);
//			} else {
//				$('<td><a class="pagination-refresh" href="javascript:void(0)" icon="pagination-load"></a></td>').appendTo(tr);
//			}
		}
		
		if (opts.buttons){
			$('<td><div class="pagination-btn-separator"></div></td>').appendTo(tr);
			for(var i=0; i<opts.buttons.length; i++){
				var btn = opts.buttons[i];
				if (btn == '-') {
					$('<td><div class="pagination-btn-separator"></div></td>').appendTo(tr);
				} else {
					var td = $('<td></td>').appendTo(tr);
					$('<a href="javascript:void(0)"></a>')
							.addClass('l-btn')
							.css('float', 'left')
							.text(btn.text || '')
							.attr('icon', btn.iconCls || '')
							.bind('click', eval(btn.handler || function(){}))
							.appendTo(td)
							.linkbutton({plain:true});
				}
			}
		}
		
		$('<div class="pagination-info"></div>').appendTo(pager);
		$('<div style="clear:both;"></div>').appendTo(pager);
		
		
		$('a[icon^=pagination]', pager).linkbutton({plain:true});
		
		pager.find('a[icon=pagination-first]').unbind('.pagination').bind('click.pagination', function(){
			if (opts.pageNumber > 1) selectPage(target, 1);
		});
		pager.find('a[icon=pagination-prev]').unbind('.pagination').bind('click.pagination', function(){
			if (opts.pageNumber > 1) selectPage(target, opts.pageNumber - 1);
		});
		pager.find('a[icon=pagination-next]').unbind('.pagination').bind('click.pagination', function(){
			var pageCount = Math.ceil(opts.total/opts.pageSize);
			if (opts.pageNumber < pageCount) selectPage(target, opts.pageNumber + 1);
		});
		pager.find('a[icon=pagination-last]').unbind('.pagination').bind('click.pagination', function(){
			var pageCount = Math.ceil(opts.total/opts.pageSize);
			if (opts.pageNumber < pageCount) selectPage(target, pageCount);
		});
		pager.find('a[icon=pagination-load]').unbind('.pagination').bind('click.pagination', function(){
			if (opts.onBeforeRefresh.call(target, opts.pageNumber, opts.pageSize) != false){
				selectPage(target, opts.pageNumber);
				opts.onRefresh.call(target, opts.pageNumber, opts.pageSize);
			}
		});
		pager.find('input.pagination-num').unbind('.pagination').bind('keydown.pagination', function(e){
			if (e.keyCode == 13){
				var pageNumber = parseInt($(this).val()) || 1;
				selectPage(target, pageNumber);
			}
		});
		pager.find('.pagination-page-list').unbind('.pagination').bind('change.pagination', function(){
			opts.pageSize = $(this).val();
			opts.onChangePageSize.call(target, opts.pageSize);
			
			var pageCount = Math.ceil(opts.total/opts.pageSize);
			selectPage(target, opts.pageNumber);
		});
	}
	
	function selectPage(target, page){
		var opts = $.data(target, 'pagination').options;
		var pageCount = Math.ceil(opts.total/opts.pageSize);
		var pageNumber = page;
		if (page < 1) pageNumber = 1;
		if (page > pageCount) pageNumber = pageCount;
		opts.onSelectPage.call(target, pageNumber, opts.pageSize);
		opts.pageNumber = pageNumber;
		showInfo(target);
	}
	
	function showInfo(target){
		var opts = $.data(target, 'pagination').options;
		
		var pageCount = Math.ceil(opts.total/opts.pageSize);
		var num = $(target).find('input.pagination-num');
		num.val(opts.pageNumber);
		num.parent().next().find('span').html(opts.afterPageText.replace(/{pages}/, pageCount));
		
		var pinfo = opts.displayMsg;
		pinfo = pinfo.replace(/{from}/, opts.pageSize*(opts.pageNumber-1)+1);
		pinfo = pinfo.replace(/{to}/, Math.min(opts.pageSize*(opts.pageNumber), opts.total));
		pinfo = pinfo.replace(/{total}/, opts.total);
		
		$(target).find('.pagination-info').html(pinfo);
		
		$('a[icon=pagination-first],a[icon=pagination-prev]', target).linkbutton({
			disabled: (opts.pageNumber == 1)
		});
		$('a[icon=pagination-next],a[icon=pagination-last]', target).linkbutton({
			disabled: (opts.pageNumber == pageCount)
		});
		
		if (opts.loading){
			$(target).find('a[icon=pagination-load]').find('.pagination-load').addClass('pagination-loading');
		} else {
			$(target).find('a[icon=pagination-load]').find('.pagination-load').removeClass('pagination-loading');
		}
	}
	
	function setLoadStatus(target, loading){
		var opts = $.data(target, 'pagination').options;
		opts.loading = loading;
		if (opts.loading){
			$(target).find('a[icon=pagination-load]').find('.pagination-load').addClass('pagination-loading');
		} else {
			$(target).find('a[icon=pagination-load]').find('.pagination-load').removeClass('pagination-loading');
		}
	}
	
	$.fn.pagination = function(options) {
		if (typeof options == 'string'){
			switch(options){
				case 'options':
					return $.data(this[0], 'pagination').options;
				case 'loading':
					return this.each(function(){
						setLoadStatus(this, true);
					});
				case 'loaded':
					return this.each(function(){
						setLoadStatus(this, false);
					});
			}
		}
		
		options = options || {};
		return this.each(function(){
			var opts;
			var state = $.data(this, 'pagination');
			if (state) {
				opts = $.extend(state.options, options);
			} else {
				opts = $.extend({}, $.fn.pagination.defaults, options);
				$.data(this, 'pagination', {
					options: opts
				});
			}
			
			buildToolbar(this);
			showInfo(this);
			
		});
	};
	
	$.fn.pagination.defaults = {
		total: 1,
		pageSize: 10,
		pageNumber: 1,
		pageList: [10,20,30,50],
		loading: false,
		buttons: null,
		showPageList: true,
		showRefresh: true,
		
		onSelectPage: function(pageNumber, pageSize){},
		onBeforeRefresh: function(pageNumber, pageSize){},
		onRefresh: function(pageNumber, pageSize){},
		onChangePageSize: function(pageSize){},
		
		beforePageText: 'Page',
		afterPageText: 'of {pages}',
		displayMsg: 'Displaying {from} to {to} of {total} items'
	};
})(jQuery);