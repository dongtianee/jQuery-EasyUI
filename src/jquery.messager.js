/**
 * messager - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	draggable
 * 	resizable
 * 	linkbutton
 * 	panel
 *  window
 */
(function($){
	/**
	 * show window with animate, after sometime close the window
	 */
	function show(win, type, speed, timeout){
		if (!win) return;
		
		switch(type){
		case null:
			win.show();
			break;
		case 'slide':
			win.slideDown(speed);
			break;
		case 'fade':
			win.fadeIn(speed);
			break;
		case 'show':
			win.show(speed);
			break;
		}
		
		var timer = null;
		if (timeout > 0){
			timer = setTimeout(function(){
				hide(win, type, speed);
			}, timeout);
		}
		win.hover(
				function(){
					if (timer){
						clearTimeout(timer);
					}
				},
				function(){
					if (timeout > 0){
						timer = setTimeout(function(){
							hide(win, type, speed);
						}, timeout);
					}
				}
		)
		
	}
	
	/**
	 * hide window with animate
	 */
	function hide(win, type, speed){
		if (!win) return;
		
		switch(type){
		case null:
			win.hide();
			break;
		case 'slide':
			win.slideUp(speed);
			break;
		case 'fade':
			win.fadeOut(speed);
			break;
		case 'show':
			win.hide(speed);
			break;
		}
		
		setTimeout(function(){
			win.remove();
		}, speed);
	}
	
	/**
	 * create a dialog, when dialog is closed destroy it
	 */
	function createDialog(title, content, buttons){
		var win = $('<div class="messager-body"></div>').appendTo('body');
		win.append(content);
		if (buttons){
			var tb = $('<div class="messager-button"></div>').appendTo(win);
			for(var label in buttons){
				$('<a></a>').attr('href', 'javascript:void(0)').text(label)
							.css('margin-left', 10)
							.bind('click', eval(buttons[label]))
							.appendTo(tb).linkbutton();
			}
		}
		win.window({
			title: title,
			width: 300,
			height: 'auto',
			modal: true,
			collapsible: false,
			minimizable: false,
			maximizable: false,
			resizable: false,
			onClose: function(){
				setTimeout(function(){
					win.window('destroy');
				}, 100);
			}
		});
		return win;
	}
	
	$.messager = {
		show: function(options){
			var opts = $.extend({
				showType: 'slide',
				showSpeed: 600,
				width: 250,
				height: 100,
				msg: '',
				title: '',
				timeout: 4000
			}, options || {});
			
			var win = $('<div class="messager-body"></div>').html(opts.msg).appendTo('body');
			win.window({
				title: opts.title,
				width: opts.width,
				height: opts.height,
				collapsible: false,
				minimizable: false,
				maximizable: false,
				shadow: false,
				draggable: false,
				resizable: false,
				closed: true,
				onBeforeOpen: function(){
					show($(this).window('window'), opts.showType, opts.showSpeed, opts.timeout);
					return false;
				},
				onBeforeClose: function(){
					hide(win.window('window'), opts.showType, opts.showSpeed);
					return false;
				}
			});
			
			// set the message window to the right bottom position
			win.window('window').css({
				left: null,
				top: null,
				right: 0,
				bottom: -document.body.scrollTop-document.documentElement.scrollTop
			});
			win.window('open');
		},
		
		alert: function(title, msg, icon, fn) {
			var content = '<div>' + msg + '</div>';
			switch(icon) {
				case 'error':
					content = '<div class="messager-icon messager-error"></div>' + content;
					break;
				case 'info':
					content = '<div class="messager-icon messager-info"></div>' + content;
					break;
				case 'question':
					content = '<div class="messager-icon messager-question"></div>' + content;
					break;
				case 'warning':
					content = '<div class="messager-icon messager-warning"></div>' + content;
					break;
			}
			content += '<div style="clear:both;"/>';
			
			var buttons = {};
			buttons[$.messager.defaults.ok] = function(){
				win.dialog({closed:true});
				if (fn){
					fn();
					return false;
				}
			};
			buttons[$.messager.defaults.ok] = function(){
				win.window('close');
				if (fn){
					fn();
					return false;
				}
			};
			var win = createDialog(title,content,buttons);
		},
		
		confirm: function(title, msg, fn) {
			var content = '<div class="messager-icon messager-question"></div>'
					+ '<div>' + msg + '</div>'
					+ '<div style="clear:both;"/>';
			var buttons = {};
			buttons[$.messager.defaults.ok] = function(){
				win.window('close');
				if (fn){
					fn(true);
					return false;
				}
			};
			buttons[$.messager.defaults.cancel] = function(){
				win.window('close');
				if (fn){
					fn(false);
					return false;
				}
			};
			var win = createDialog(title,content,buttons);
		},
		
		prompt: function(title, msg, fn) {
			var content = '<div class="messager-icon messager-question"></div>'
						+ '<div>' + msg + '</div>'
						+ '<br/>'
						+ '<input class="messager-input" type="text"/>'
						+ '<div style="clear:both;"/>';
			var buttons = {};
			buttons[$.messager.defaults.ok] = function(){
				win.window('close');
				if (fn){
					fn($('.messager-input', win).val());
					return false;
				}
			};
			buttons[$.messager.defaults.cancel] = function(){
				win.window('close');
				if (fn){
					fn();
					return false;
				}
			};
			var win = createDialog(title,content,buttons);
		}
	};
	
	$.messager.defaults = {
		ok: 'Ok',
		cancel: 'Cancel'
	};
	
})(jQuery);
