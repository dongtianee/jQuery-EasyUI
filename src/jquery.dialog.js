/**
 * dialog - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	 window
 * 
 */
(function($){
	/**
	 * wrap dialog and return content panel.
	 */
	function wrapDialog(target){
		var t = $(target);
		t.wrapInner('<div class="dialog-content"></div>');
		var contentPanel = t.find('>div.dialog-content');
		
		contentPanel.css('padding', t.css('padding'));
		t.css('padding', 0);
		
		contentPanel.panel({
			border:false
		});
		
		return contentPanel;
	}
	
	/**
	 * build the dialog
	 */
	function buildDialog(target){
		var opts = $.data(target, 'dialog').options;
		var contentPanel = $.data(target, 'dialog').contentPanel;
		
		$(target).find('div.dialog-toolbar').remove();
		$(target).find('div.dialog-button').remove();
		if (opts.toolbar){
			var toolbar = $('<div class="dialog-toolbar"></div>').prependTo(target);
			for(var i=0; i<opts.toolbar.length; i++){
				var p = opts.toolbar[i];
				if (p == '-'){
					toolbar.append('<div class="dialog-tool-separator"></div>');
				} else {
					var tool = $('<a href="javascript:void(0)"></a>').appendTo(toolbar);
					tool.css('float','left').text(p.text);
					if (p.iconCls) tool.attr('icon', p.iconCls);
					if (p.handler) tool[0].onclick = p.handler;
					tool.linkbutton({
						plain: true,
						disabled: (p.disabled || false)
					});
				}
			}
			toolbar.append('<div style="clear:both"></div>');
		}
		
		if (opts.buttons){
			var buttons = $('<div class="dialog-button"></div>').appendTo(target);
			for(var i=0; i<opts.buttons.length; i++){
				var p = opts.buttons[i];
				var button = $('<a href="javascript:void(0)"></a>').appendTo(buttons);
				if (p.handler) button[0].onclick = p.handler;
				button.linkbutton(p);
			}
		}
		
		if (opts.href){
			contentPanel.panel({
				href: opts.href,
				onLoad: opts.onLoad
			});
			
			opts.href = null;
		}
		
		$(target).window($.extend({}, opts, {
			onResize:function(width, height){
				var wbody = $(target).panel('panel').find('>div.panel-body');
				
				contentPanel.panel('resize', {
					width: wbody.width(),
					height: (height=='auto') ? 'auto' :
							wbody.height()
							- wbody.find('>div.dialog-toolbar').outerHeight()
							- wbody.find('>div.dialog-button').outerHeight()
				});
				
				if (opts.onResize) opts.onResize.call(target, width, height);
			}
		}));
	}
	
	function refresh(target){
		var contentPanel = $.data(target, 'dialog').contentPanel;
		contentPanel.panel('refresh');
	}
	
	$.fn.dialog = function(options, param){
		if (typeof options == 'string'){
			switch(options){
			case 'options':
				return $(this[0]).window('options');
			case 'dialog':
				return $(this[0]).window('window');
			case 'setTitle':
				return this.each(function(){
					$(this).window('setTitle', param);
				});
			case 'open':
				return this.each(function(){
					$(this).window('open', param);
				});
			case 'close':
				return this.each(function(){
					$(this).window('close', param);
				});
			case 'destroy':
				return this.each(function(){
					$(this).window('destroy', param);
				});
			case 'refresh':
				return this.each(function(){
					refresh(this);
				});
			case 'resize':
				return this.each(function(){
					$(this).window('resize', param);
				});
			case 'move':
				return this.each(function(){
					$(this).window('move', param);
				});
			case 'maximize':
				return this.each(function(){
					$(this).window('maximize');
				});
			case 'minimize':
				return this.each(function(){
					$(this).window('minimize');
				});
			case 'restore':
				return this.each(function(){
					$(this).window('restore');
				});
			case 'collapse':
				return this.each(function(){
					$(this).window('collapse', param);
				});
			case 'expand':
				return this.each(function(){
					$(this).window('expand', param);
				});
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'dialog');
			if (state){
				$.extend(state.options, options);
			} else {
				var t = $(this);
				var opts = $.extend({}, $.fn.dialog.defaults, {
					title:(t.attr('title') ? t.attr('title') : undefined),
					href:t.attr('href'),
					collapsible: (t.attr('collapsible') ? t.attr('collapsible') == 'true' : undefined),
					minimizable: (t.attr('minimizable') ? t.attr('minimizable') == 'true' : undefined),
					maximizable: (t.attr('maximizable') ? t.attr('maximizable') == 'true' : undefined),
					resizable: (t.attr('resizable') ? t.attr('resizable') == 'true' : undefined)
				}, options);
				$.data(this, 'dialog', {
					options: opts,
					contentPanel: wrapDialog(this)
				});
			}
			buildDialog(this);
		});
	};
	
	$.fn.dialog.defaults = {
		title: 'New Dialog',
		href: null,
		collapsible: false,
		minimizable: false,
		maximizable: false,
		resizable: false,
		
		toolbar:null,
		buttons:null
	};
})(jQuery);