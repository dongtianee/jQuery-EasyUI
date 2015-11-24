/**
 * tabs - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 */
(function($){
	
	// get the left position of the tab element
	function getTabLeftPosition(container, tab) {
		var w = 0;
		var b = true;
		$('>div.tabs-header ul.tabs li', container).each(function(){
			if (this == tab) {
				b = false;
			}
			if (b == true) {
				w += $(this).outerWidth(true);
			}
		});
		return w;
	}
	
	// get the max tabs scroll width(scope)
	function getMaxScrollWidth(container) {
		var header = $('>div.tabs-header', container);
		var tabsWidth = 0;	// all tabs width
		$('ul.tabs li', header).each(function(){
			tabsWidth += $(this).outerWidth(true);
		});
		var wrapWidth = $('.tabs-wrap', header).width();
		var padding = parseInt($('.tabs', header).css('padding-left'));
		
		return tabsWidth - wrapWidth + padding;
	}
	
	// set the tabs scrollers to show or not,
	// dependent on the tabs count and width
	function setScrollers(container) {
		var header = $('>div.tabs-header', container);
		var tabsWidth = 0;
		$('ul.tabs li', header).each(function(){
			tabsWidth += $(this).outerWidth(true);
		});
		
		if (tabsWidth > header.width()) {
			$('.tabs-scroller-left', header).css('display', 'block');
			$('.tabs-scroller-right', header).css('display', 'block');
			$('.tabs-wrap', header).addClass('tabs-scrolling');
			
			if ($.boxModel == true) {
				$('.tabs-wrap', header).css('left',2);
			} else {
				$('.tabs-wrap', header).css('left',0);
			}
			var width = header.width()
				- $('.tabs-scroller-left', header).outerWidth()
				- $('.tabs-scroller-right', header).outerWidth();
			$('.tabs-wrap', header).width(width);
			
		} else {
			$('.tabs-scroller-left', header).css('display', 'none');
			$('.tabs-scroller-right', header).css('display', 'none');
			$('.tabs-wrap', header).removeClass('tabs-scrolling').scrollLeft(0);
			$('.tabs-wrap', header).width(header.width());
			$('.tabs-wrap', header).css('left',0);
			
		}
	}
	
	// set size of the tabs container
	function setSize(container) {
		var opts = $.data(container, 'tabs').options;
		var cc = $(container);
		if (opts.fit == true){
			var p = cc.parent();
			opts.width = p.width();
			opts.height = p.height();
		}
		cc.width(opts.width).height(opts.height);
		
		var header = $('>div.tabs-header', container);
		if ($.boxModel == true) {
			var delta = header.outerWidth() - header.width();
//			var delta = header.outerWidth(true) - header.width();
			header.width(cc.width() - delta);
		} else {
			header.width(cc.width());
		}
		
		setScrollers(container);
		
		var panels = $('>div.tabs-panels', container);
		var height = opts.height;
		if (!isNaN(height)) {
			if ($.boxModel == true) {
				var delta = panels.outerHeight() - panels.height();
				panels.css('height', (height - header.outerHeight() - delta) || 'auto');
			} else {
				panels.css('height', height - header.outerHeight());
			}
		} else {
			panels.height('auto');
		}
		var width = opts.width;
		if (!isNaN(width)){
			if ($.boxModel == true) {
				var delta = panels.outerWidth() - panels.width();
//				var delta = panels.outerWidth(true) - panels.width();
				panels.width(width - delta);
			} else {
				panels.width(width);
			}
		} else {
			panels.width('auto');
		}
		
		if ($.parser){
			$.parser.parse(container);
		}
		
//		// resize the children tabs container
//		$('div.tabs-container', container).tabs();	
	}
	
	/**
	 * make the selected tab panel fit layout
	 */
	function fitContent(container){
		var tab = $('>div.tabs-header ul.tabs li.tabs-selected', container);
		if (tab.length){
			var panelId = $.data(tab[0], 'tabs.tab').id;
			var panel = $('#'+panelId);
			var panels = $('>div.tabs-panels', container);
			if (panels.css('height').toLowerCase() != 'auto'){
				if ($.boxModel == true){
					panel.height(panels.height() - (panel.outerHeight()-panel.height()));
					panel.width(panels.width() - (panel.outerWidth()-panel.width()));
				} else {
					panel.height(panels.height());
					panel.width(panels.width());
				}
			}
			$('>div', panel).triggerHandler('_resize');
		}
		
	}
	
	// wrap the tabs header and body
	function wrapTabs(container) {
		$(container).addClass('tabs-container');
		$(container).wrapInner('<div class="tabs-panels"/>');
		$('<div class="tabs-header">'
				+ '<div class="tabs-scroller-left"></div>'
				+ '<div class="tabs-scroller-right"></div>'
				+ '<div class="tabs-wrap">'
				+ '<ul class="tabs"></ul>'
				+ '</div>'
				+ '</div>').prependTo(container);
		
		var header = $('>div.tabs-header', container);
		
		$('>div.tabs-panels>div', container).each(function(){
			if (!$(this).attr('id')) {
				$(this).attr('id', 'gen-tabs-panel' + $.fn.tabs.defaults.idSeed++);
			}
			
			var options = {
				id: $(this).attr('id'),
				title: $(this).attr('title'),
				content: null,
				href: $(this).attr('href'),
				closable: $(this).attr('closable') == 'true',
				icon: $(this).attr('icon'),
				selected: $(this).attr('selected') == 'true',
				cache: $(this).attr('cache') == 'false' ? false : true
			};
			$(this).attr('title','');
			createTab(container, options);
		});
		
		$('.tabs-scroller-left, .tabs-scroller-right', header).hover(
			function(){$(this).addClass('tabs-scroller-over');},
			function(){$(this).removeClass('tabs-scroller-over');}
		);
		$(container).bind('_resize', function(){
			var opts = $.data(container, 'tabs').options;
			if (opts.fit == true){
				setSize(container);
				fitContent(container);
			}
			return false;
		});
	}
	
	function setProperties(container){
		var opts = $.data(container, 'tabs').options;
		var header = $('>div.tabs-header', container);
		var panels = $('>div.tabs-panels', container);
		var tabs = $('ul.tabs', header);
		
		if (opts.plain == true) {
			header.addClass('tabs-header-plain');
		} else {
			header.removeClass('tabs-header-plain');
		}
		if (opts.border == true){
			header.removeClass('tabs-header-noborder');
			panels.removeClass('tabs-panels-noborder');
		} else {
			header.addClass('tabs-header-noborder');
			panels.addClass('tabs-panels-noborder');
		}
		
		$('li', tabs).unbind('.tabs').bind('click.tabs', function(){
			$('.tabs-selected', tabs).removeClass('tabs-selected');
			$(this).addClass('tabs-selected');
			$(this).blur();
			
			$('>div.tabs-panels>div', container).css('display', 'none');
			
			var wrap = $('.tabs-wrap', header);
			var leftPos = getTabLeftPosition(container, this);
			var left = leftPos - wrap.scrollLeft();
			var right = left + $(this).outerWidth();
			if (left < 0 || right > wrap.innerWidth()) {
				var pos = Math.min(
						leftPos - (wrap.width()-$(this).width()) / 2,
						getMaxScrollWidth(container)
				);
				wrap.animate({scrollLeft:pos}, opts.scrollDuration);
			}
			
			var tabAttr = $.data(this, 'tabs.tab');
			var panel = $('#' + tabAttr.id);
			panel.css('display', 'block');
			
			if (tabAttr.href && (!tabAttr.loaded || !tabAttr.cache)) {
				panel.load(tabAttr.href, null, function(){
					if ($.parser){
						$.parser.parse(panel);
					}
					opts.onLoad.apply(this, arguments);
					tabAttr.loaded = true;
				});
			}
			
			fitContent(container);
			
			opts.onSelect.call(panel, tabAttr.title);
		});
		
		$('a.tabs-close', tabs).unbind('.tabs').bind('click.tabs', function(){
			var elem = $(this).parent()[0];
			var tabAttr = $.data(elem, 'tabs.tab');
			closeTab(container, tabAttr.title);
		});
		
		$('.tabs-scroller-left', header).unbind('.tabs').bind('click.tabs', function(){
			var wrap = $('.tabs-wrap', header);
			var pos = wrap.scrollLeft() - opts.scrollIncrement;
			wrap.animate({scrollLeft:pos}, opts.scrollDuration);
		});
		
		$('.tabs-scroller-right', header).unbind('.tabs').bind('click.tabs', function(){
			var wrap = $('.tabs-wrap', header);
			var pos = Math.min(
					wrap.scrollLeft() + opts.scrollIncrement,
					getMaxScrollWidth(container)
			);
			wrap.animate({scrollLeft:pos}, opts.scrollDuration);
		});
	}
	
	function createTab(container, options) {
		var header = $('>div.tabs-header', container);
		var tabs = $('ul.tabs', header);
		
		var tab = $('<li></li>');
		var tab_span = $('<span></span>').html(options.title);
		var tab_a = $('<a class="tabs-inner"></a>')
				.attr('href', 'javascript:void(0)')
				.append(tab_span);
		tab.append(tab_a).appendTo(tabs);
		
		if (options.closable) {
			tab_span.addClass('tabs-closable');
			tab_a.after('<a href="javascript:void(0)" class="tabs-close"></a>');
		}
		if (options.icon) {
			tab_span.addClass('tabs-with-icon');
			tab_span.after($('<span/>').addClass('tabs-icon').addClass(options.icon));
		}
		if (options.selected) {
			tab.addClass('tabs-selected');
		}
		if (options.content) {
			$('#' + options.id).html(options.content);
		}
		
		$('#' + options.id).removeAttr('title');
		$.data(tab[0], 'tabs.tab', {
			id: options.id,
			title: options.title,
			href: options.href,
			loaded: false,
			cache: options.cache
		});
	}
	
	function addTab(container, options) {
		options = $.extend({
			id: null,
			title: '',
			content: '',
			href: null,
			cache: true,
			icon: null,
			closable: false,
			selected: true,
			height: 'auto',
			width: 'auto'
		}, options || {});
		
		if (options.selected) {
			$('.tabs-header .tabs-wrap .tabs li', container).removeClass('tabs-selected');
		}
		options.id = options.id || 'gen-tabs-panel' + $.fn.tabs.defaults.idSeed++;
		
		$('<div></div>').attr('id', options.id)
				.attr('title', options.title)
				.height(options.height)
				.width(options.width)
				.appendTo($('>div.tabs-panels', container));
		
		createTab(container, options);
	}
	
	// close a tab with specified title
	function closeTab(container, title) {
		var opts = $.data(container, 'tabs').options;
		var elem = $('>div.tabs-header li:has(a span:contains("' + title + '"))', container)[0];
		if (!elem) return;
		
		var tabAttr = $.data(elem, 'tabs.tab');
		var panel = $('#' + tabAttr.id);
		
		if (opts.onClose.call(panel, tabAttr.title) == false) return;
		
		var selected = $(elem).hasClass('tabs-selected');
		$.removeData(elem, 'tabs.tab');
		$(elem).remove();
		panel.remove();
		
		setSize(container);
		if (selected) {
			selectTab(container);
		} else {
			var wrap = $('>div.tabs-header .tabs-wrap', container);
			var pos = Math.min(
					wrap.scrollLeft(),
					getMaxScrollWidth(container)
			);
			wrap.animate({scrollLeft:pos}, opts.scrollDuration);
		}
	}
	
	// active the selected tab item, if no selected item then active the first item
	function selectTab(container, title){
		if (title) {
			var elem = $('>div.tabs-header li:has(a span:contains("' + title + '"))', container)[0];
			if (elem) {
				$(elem).trigger('click');
			}
		} else {
		
			var tabs = $('>div.tabs-header ul.tabs', container);
			if ($('.tabs-selected', tabs).length == 0) {
				$('li:first', tabs).trigger('click');
			} else {
				$('.tabs-selected', tabs).trigger('click');
			}
		}
	}
	
	function exists(container, title){
		return $('>div.tabs-header li:has(a span:contains("' + title + '"))', container).length > 0;
	}
	
	
	$.fn.tabs = function(options, param){
		if (typeof options == 'string') {
			switch(options) {
				case 'resize':
					return this.each(function(){
						setSize(this);
					});
				case 'add':
					return this.each(function(){
						addTab(this, param);
						$(this).tabs();
					});
				case 'close':
					return this.each(function(){
						closeTab(this, param);
					});
				case 'select':
					return this.each(function(){
						selectTab(this, param);
					});
				case 'exists':
					return exists(this[0], param);
			}
		}
		
		options = options || {};
		
		return this.each(function(){
			var state = $.data(this, 'tabs');
			var opts;
			if (state) {
				opts = $.extend(state.options, options);
				state.options = opts;
			} else {
				var t = $(this);
				opts = $.extend({},$.fn.tabs.defaults, {
					width: (parseInt(t.css('width')) || undefined),
					height: (parseInt(t.css('height')) || undefined),
					fit: (t.attr('fit') ? t.attr('fit') == 'true' : undefined),
					border: (t.attr('border') ? t.attr('border') == 'true' : undefined),
					plain: (t.attr('plain') ? t.attr('plain') == 'true' : undefined)
				}, options);
				wrapTabs(this);
				$.data(this, 'tabs', {
					options: opts
				});
			}
			
			setProperties(this);
			setSize(this);
			selectTab(this);
		});
	};
	
	$.fn.tabs.defaults = {
		width: 'auto',
		height: 'auto',
		idSeed: 0,
		plain: false,
		fit: false,
		border: true,
		scrollIncrement: 100,
		scrollDuration: 400,
		onLoad: function(){},
		onSelect: function(title){},
		onClose: function(title){}
	};
})(jQuery);