/**
 * form - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 */
(function($){
	/**
	 * submit the form
	 */
	function ajaxSubmit(target, options){
		options = options || {};
		
		if (options.onSubmit){
			if (options.onSubmit.call(target) == false) {
				return;
			}
		}
		
		var form = $(target);
		if (options.url){
			form.attr('action', options.url);
		}
		var frameId = 'easyui_frame_' + (new Date().getTime());
		var frame = $('<iframe id='+frameId+' name='+frameId+'></iframe>')
				.attr('src', window.ActiveXObject ? 'javascript:false' : 'about:blank')
				.css({
					position:'absolute',
					top:-1000,
					left:-1000
				});
		var t = form.attr('target'), a = form.attr('action');
		form.attr('target', frameId);
		try {
			frame.appendTo('body');
			frame.bind('load', cb);
			form[0].submit();
		} finally {
			form.attr('action', a);
			t ? form.attr('target', t) : form.removeAttr('target');
		}
		
		var checkCount = 10;
		function cb(){
			frame.unbind();
			var body = $('#'+frameId).contents().find('body');
			var data = body.html();
			if (data == ''){
				if (--checkCount){
					setTimeout(cb, 100);
					return;
				}
				return;
			}
			var ta = body.find('>textarea');
			if (ta.length){
				data = ta.value();
			} else {
				var pre = body.find('>pre');
				if (pre.length){
					data = pre.html();
				}
			}
			if (options.success){
				options.success(data);
			}
//			try{
//				eval('data='+data);
//				if (options.success){
//					options.success(data);
//				}
//			} catch(e) {
//				if (options.failure){
//					options.failure(data);
//				}
//			}
			setTimeout(function(){
				frame.unbind();
				frame.remove();
			}, 100);
		}
	}
	
	/**
	 * load form data
	 * if data is a URL string type load from remote site, 
	 * otherwise load from local data object. 
	 */
	function load(target, data){
		if (typeof data == 'string'){
			$.ajax({
				url: data,
				dataType: 'json',
				success: function(data){
					_load(data);
				}
			});
		} else {
			_load(data);
		}
		
		function _load(data){
			var form = $(target);
			for(var name in data){
				var val = data[name];
				$('input[name='+name+']', form).val(val);
				$('textarea[name='+name+']', form).val(val);
				$('select[name='+name+']', form).val(val);
			}
		}
	}
	
	/**
	 * clear the form fields
	 */
	function clear(target){
		$('input,select,textarea', target).each(function(){
			var t = this.type, tag = this.tagName.toLowerCase();
			if (t == 'text' || t == 'password' || tag == 'textarea')
				this.value = '';
			else if (t == 'checkbox' || t == 'radio')
				this.checked = false;
			else if (tag == 'select')
				this.selectedIndex = -1;
			
		});
	}
	
	/**
	 * set the form to make it can submit with ajax.
	 */
	function setForm(target){
		var options = $.data(target, 'form').options;
		var form = $(target);
		form.unbind('.form').bind('submit.form', function(){
			ajaxSubmit(target, options);
			return false;
		});
	}
	
	$.fn.form = function(options, param){
		if (typeof options == 'string'){
			switch(options){
			case 'submit':
				return this.each(function(){
					ajaxSubmit(this, $.extend({}, $.fn.form.defaults, param||{}));
				});
			case 'load':
				return this.each(function(){
					load(this, param);
				});
			case 'clear':
				return this.each(function(){
					clear(this);
				});
			}
		}
		
		options = options || {};
		return this.each(function(){
			if (!$.data(this, 'form')){
				$.data(this, 'form', {
					options: $.extend({}, $.fn.form.defaults, options)
				});
			}
			setForm(this);
		});
	};
	
	$.fn.form.defaults = {
		url: null,
		onSubmit: function(){},
		success: function(data){}
	};
})(jQuery);