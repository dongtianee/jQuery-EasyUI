/**
 * accordion - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	 panel
 * 
 */
(function($){
	
	function setSize(container){
		var opts = $.data(container, 'accordion').options;
		var panels = $.data(container, 'accordion').panels;
		
		var cc = $(container);
		if (opts.fit == true){
			var p = cc.parent();
			opts.width = p.width();
			opts.height = p.height();
		}
		
		if (opts.width > 0){
			cc.width($.boxModel==true ? (opts.width-(cc.outerWidth()-cc.width())) : opts.width);
		}
		var panelHeight = 'auto';
		if (opts.height > 0){
			cc.height($.boxModel==true ? (opts.height-(cc.outerHeight()-cc.height())) : opts.height);
			// get the first panel's header height as all the header height
			var headerHeight = panels[0].panel('header').css('height', null).outerHeight();
			var panelHeight = cc.height() - (panels.length-1)*headerHeight;
		}
		for(var i=0; i<panels.length; i++){
			var panel = panels[i];
			var header = panel.panel('header');
			header.height($.boxModel==true ? (headerHeight-(header.outerHeight()-header.height())) : headerHeight);
			panel.panel('resize', {
				width: cc.width(),
				height: panelHeight
			});
		}
	}
	
	/**
	 * get the current panel DOM element
	 */
	function getCurrent(container){
		var panels = $.data(container, 'accordion').panels;
		for(var i=0; i<panels.length; i++){
			var panel = panels[i];
			if (panel.panel('options').collapsed == false){
				return panel;
			}
		}
		return null;
	}
	
	function wrapAccordion(container){
		var cc = $(container);
		cc.addClass('accordion');
		if (cc.attr('border') == 'false'){
			cc.addClass('accordion-noborder');
		} else {
			cc.removeClass('accordion-noborder');
		}
		
		// the original panel DOM elements
		var panels = [];
		
		// if no panel selected set the first one active
		if (cc.find('>div[selected=true]').length == 0){
			cc.find('>div:first').attr('selected', 'true');
		}
		
		cc.find('>div').each(function(){
			var pp = $(this);
			panels.push(pp);
			
			pp.panel({
				collapsible: true,
				minimizable: false,
				maximizable: false,
				closable: false,
				doSize: false,
				collapsed: pp.attr('selected') != 'true',
				onBeforeExpand: function(){
					var curr = getCurrent(container);
					if (curr){
						var header = $(curr).panel('header');
						header.removeClass('accordion-header-selected');
						header.find('.panel-tool-collapse').triggerHandler('click');
					}
					pp.panel('header').addClass('accordion-header-selected');
				},
				onExpand: function(){
					pp.panel('body').find('>div').triggerHandler('_resize');
				},
				onBeforeCollapse: function(){
					pp.panel('header').removeClass('accordion-header-selected');
				}
			});
			pp.panel('body').addClass('accordion-body');
			pp.panel('header').addClass('accordion-header').click(function(){
				$(this).find('.panel-tool-collapse').triggerHandler('click');
				return false;
			});
		});
		
		cc.bind('_resize', function(){
			var opts = $.data(container, 'accordion').options;
			if (opts.fit == true){
				setSize(container);
			}
			return false;
		});
		
		return {
			accordion: cc,
			panels: panels
		}
	}
	
	/**
	 * select and set the special panel active
	 */
	function select(container, title){
		var panels = $.data(container, 'accordion').panels;
		var curr = getCurrent(container);
		if (curr && getTitle(curr) == title){
			return;
		}
		
		for(var i=0; i<panels.length; i++){
			var panel = panels[i];
			if (getTitle(panel) == title){
				$(panel).panel('header').triggerHandler('click');
				return;
			}
		}
		
		curr = getCurrent(container);
		curr.panel('header').addClass('accordion-header-selected');
		
		
		function getTitle(panel){
			return $(panel).panel('options').title;
		}
	}
	
	$.fn.accordion = function(options, param){
		if (typeof options == 'string'){
			switch(options){
			case 'select':
				return this.each(function(){
					select(this, param);
				});
			}
		}
		
		options = options || {};
		
		return this.each(function(){
			var state = $.data(this, 'accordion');
			var opts;
			if (state){
				opts = $.extend(state.options, options);
				state.opts = opts;
			} else {
				var t = $(this);
				opts = $.extend({}, $.fn.accordion.defaults, {
					width: (parseInt(t.css('width')) || undefined),
					height: (parseInt(t.css('height')) || undefined),
					fit: (t.attr('fit') ? t.attr('fit') == 'true' : undefined),
					border: (t.attr('border') ? t.attr('border') == 'true' : undefined)
				}, options);
				var r = wrapAccordion(this);
				$.data(this, 'accordion', {
					options: opts,
					accordion: r.accordion,
					panels: r.panels
				});
			}
			
			setSize(this);
			select(this);
		});
	};
	
	$.fn.accordion.defaults = {
		width: 'auto',
		height: 'auto',
		fit: false,
		border: true
	};
})(jQuery);