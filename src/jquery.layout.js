/**
 * layout - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 *   resizable
 *   panel
 */
(function($){
	var resizing = false;	// indicate if the region panel is resizing
	
	function setSize(container){
		var opts = $.data(container, 'layout').options;
		var panels = $.data(container, 'layout').panels;
		
		var cc = $(container);
		
		if (opts.fit == true){
			var p = cc.parent();
			cc.width(p.width()).height(p.height());
		}
		
		var cpos = {
			top:0,
			left:0,
			width:cc.width(),
			height:cc.height()
		};
		
		// set north panel size
		function setNorthSize(pp){
			if (pp.length == 0) return;
			pp.panel('resize', {
				width: cc.width(),
				height: pp.panel('options').height,
				left: 0,
				top: 0
			});
			cpos.top += pp.panel('options').height;
			cpos.height -= pp.panel('options').height;
		}
		if (isVisible(panels.expandNorth)){
			setNorthSize(panels.expandNorth);
		} else {
			setNorthSize(panels.north);
		}
		
		// set south panel size
		function setSouthSize(pp){
			if (pp.length == 0) return;
			pp.panel('resize', {
				width: cc.width(),
				height: pp.panel('options').height,
				left: 0,
				top: cc.height() - pp.panel('options').height
			});
			cpos.height -= pp.panel('options').height;
		}
		if (isVisible(panels.expandSouth)){
			setSouthSize(panels.expandSouth);
		} else {
			setSouthSize(panels.south);
		}
		
		// set east panel size
		function setEastSize(pp){
			if (pp.length == 0) return;
			pp.panel('resize', {
				width: pp.panel('options').width,
				height: cpos.height,
				left: cc.width() - pp.panel('options').width,
				top: cpos.top
			});
			cpos.width -= pp.panel('options').width;
		}
		if (isVisible(panels.expandEast)){
			setEastSize(panels.expandEast);
		} else {
			setEastSize(panels.east);
		}
		
		// set west panel size
		function setWestSize(pp){
			if (pp.length == 0) return;
			pp.panel('resize', {
				width: pp.panel('options').width,
				height: cpos.height,
				left: 0,
				top: cpos.top
			});
			cpos.left += pp.panel('options').width;
			cpos.width -= pp.panel('options').width;
		}
		if (isVisible(panels.expandWest)){
			setWestSize(panels.expandWest);
		} else {
			setWestSize(panels.west);
		}
		
		panels.center.panel('resize', cpos);
	}
	
	/**
	 * initialize and wrap the layout
	 */
	function init(container){
		var cc = $(container);
		
		if (cc[0].tagName == 'BODY'){
			$('html').css({
				height: '100%',
				overflow: 'hidden'
			});
			$('body').css({
				height: '100%',
				overflow: 'hidden',
				border: 'none'
			});
		}
		cc.addClass('layout');
		cc.css({
			margin:0,
			padding:0
		});
		
		
		function createPanel(dir){
			var pp = $('>div[region='+dir+']', container).addClass('layout-body');
			
			var toolCls = null;
			if (dir == 'north'){
				toolCls = 'layout-button-up';
			} else if (dir == 'south'){
				toolCls = 'layout-button-down';
			} else if (dir == 'east'){
				toolCls = 'layout-button-right';
			} else if (dir == 'west'){
				toolCls = 'layout-button-left';
			}
			
			var cls = 'layout-panel layout-panel-' + dir;
			if (pp.attr('split') == 'true'){
				cls += ' layout-split-' + dir;
			}
			pp.panel({
				cls: cls,
				doSize: false,
				border: (pp.attr('border') == 'false' ? false : true),
				tools: [{
					iconCls: toolCls, 
					handler: function(){
						collapsePanel(container, dir);
					}
				}]
			});
			
			if (pp.attr('split') == 'true'){
				var panel = pp.panel('panel');
				
				var handles = '';
				if (dir == 'north') handles = 's';
				if (dir == 'south') handles = 'n';
				if (dir == 'east') handles = 'w';
				if (dir == 'west') handles = 'e';
				
				panel.resizable({
					handles:handles,
					onStartResize: function(e){
						resizing = true;
						
						if (dir == 'north' || dir == 'south'){
							var proxy = $('>div.layout-split-proxy-v', container);
						} else {
							var proxy = $('>div.layout-split-proxy-h', container);
						}
						var top=0,left=0,width=0,height=0;
						var pos = {display: 'block'};
						if (dir == 'north'){
							pos.top = parseInt(panel.css('top')) + panel.outerHeight() - proxy.height();
							pos.left = parseInt(panel.css('left'));
							pos.width = panel.outerWidth();
							pos.height = proxy.height();
						} else if (dir == 'south'){
							pos.top = parseInt(panel.css('top'));
							pos.left = parseInt(panel.css('left'));
							pos.width = panel.outerWidth();
							pos.height = proxy.height();
						} else if (dir == 'east'){
							pos.top = parseInt(panel.css('top')) || 0;
							pos.left = parseInt(panel.css('left')) || 0;
							pos.width = proxy.width();
							pos.height = panel.outerHeight();
						} else if (dir == 'west'){
							pos.top = parseInt(panel.css('top')) || 0;
							pos.left = panel.outerWidth() - proxy.width();
							pos.width = proxy.width();
							pos.height = panel.outerHeight();
						}
						proxy.css(pos);
						
						$('<div class="layout-mask"></div>').css({
							left:0,
							top:0,
							width:cc.width(),
							height:cc.height()
						}).appendTo(cc);
					},
					onResize: function(e){
						if (dir == 'north' || dir == 'south'){
							var proxy = $('>div.layout-split-proxy-v', container);
							proxy.css('top', e.pageY - $(container).offset().top - proxy.height()/2);
						} else {
							var proxy = $('>div.layout-split-proxy-h', container);
							proxy.css('left', e.pageX - $(container).offset().left - proxy.width()/2);
						}
						return false;
					},
					onStopResize: function(){
						$('>div.layout-split-proxy-v', container).css('display','none');
						$('>div.layout-split-proxy-h', container).css('display','none');
						var opts = pp.panel('options');
						opts.width = panel.outerWidth();
						opts.height = panel.outerHeight();
						opts.left = panel.css('left');
						opts.top = panel.css('top');
						pp.panel('resize');
						setSize(container);
						resizing = false;
						
						cc.find('>div.layout-mask').remove();
					}
				});
			}
			return pp;
		}
		
		
		$('<div class="layout-split-proxy-h"></div>').appendTo(cc);
		$('<div class="layout-split-proxy-v"></div>').appendTo(cc);
		
		var panels = {
			center: createPanel('center')
		};
		
		panels.north = createPanel('north');
		panels.south = createPanel('south');
		panels.east = createPanel('east');
		panels.west = createPanel('west');
		
		$(container).bind('_resize', function(){
			var opts = $.data(container, 'layout').options;
			if (opts.fit == true){
				setSize(container);
			}
			return false;
		});
		$(window).resize(function(){
			setSize(container);
		});
		
		return panels;
	}
	
	function collapsePanel(container, region){
		var panels = $.data(container, 'layout').panels;
		var cc = $(container);
		
		function createExpandPanel(dir){
			var icon;
			if (dir == 'east') icon = 'layout-button-left'
				else if (dir == 'west') icon = 'layout-button-right'
					else if (dir == 'north') icon = 'layout-button-down'
						else if (dir == 'south') icon = 'layout-button-up';
			
			var p = $('<div></div>').appendTo(cc).panel({
				cls: 'layout-expand',
				title: '&nbsp;',
				closed: true,
				doSize: false,
				tools: [{
					iconCls: icon,
					handler:function(){
						expandPanel(container, region);
					}
				}]
			});
			p.panel('panel').hover(
				function(){$(this).addClass('layout-expand-over');},
				function(){$(this).removeClass('layout-expand-over');}
			);
			return p;
		}
		
		if (region == 'east'){
			if (panels.east.panel('options').onBeforeCollapse.call(panels.east) == false) return;
			
			panels.center.panel('resize', {
				width: panels.center.panel('options').width + panels.east.panel('options').width - 28
			});
			panels.east.panel('panel').animate({left:cc.width()}, function(){
				panels.east.panel('close');
				panels.expandEast.panel('open').panel('resize', {
					top: panels.east.panel('options').top,
					left: cc.width() - 28,
					width: 28,
					height: panels.east.panel('options').height
				});
				panels.east.panel('options').onCollapse.call(panels.east);
			});
			if (!panels.expandEast) {
				panels.expandEast = createExpandPanel('east');
				panels.expandEast.panel('panel').click(function(){
					panels.east.panel('open').panel('resize', {left:cc.width()});
					panels.east.panel('panel').animate({
						left: cc.width() - panels.east.panel('options').width
					});
					return false;
				});
			}
		} else if (region == 'west'){
			if (panels.west.panel('options').onBeforeCollapse.call(panels.west) == false) return;
			
			panels.center.panel('resize', {
				width: panels.center.panel('options').width + panels.west.panel('options').width - 28,
				left: 28
			});
			panels.west.panel('panel').animate({left:-panels.west.panel('options').width}, function(){
				panels.west.panel('close');
				panels.expandWest.panel('open').panel('resize', {
					top: panels.west.panel('options').top,
					left: 0,
					width: 28,
					height: panels.west.panel('options').height
				});
				panels.west.panel('options').onCollapse.call(panels.west);
			});
			if (!panels.expandWest) {
				panels.expandWest = createExpandPanel('west');
				panels.expandWest.panel('panel').click(function(){
					panels.west.panel('open').panel('resize', {left: -panels.west.panel('options').width});
					panels.west.panel('panel').animate({
						left: 0
					});
					return false;
				});
			}
		} else if (region == 'north'){
			if (panels.north.panel('options').onBeforeCollapse.call(panels.north) == false) return;
			
			var hh = cc.height() - 28;
			if (isVisible(panels.expandSouth)){
				hh -= panels.expandSouth.panel('options').height;
			} else if (isVisible(panels.south)){
				hh -= panels.south.panel('options').height;
			}
			panels.center.panel('resize', {top:28, height:hh});
			panels.east.panel('resize', {top:28, height:hh});
			panels.west.panel('resize', {top:28, height:hh});
			if (isVisible(panels.expandEast)) panels.expandEast.panel('resize', {top:28, height:hh});
			if (isVisible(panels.expandWest)) panels.expandWest.panel('resize', {top:28, height:hh});
			
			panels.north.panel('panel').animate({top:-panels.north.panel('options').height}, function(){
				panels.north.panel('close');
				panels.expandNorth.panel('open').panel('resize', {
					top: 0,
					left: 0,
					width: cc.width(),
					height: 28
				});
				panels.north.panel('options').onCollapse.call(panels.north);
			});
			if (!panels.expandNorth) {
				panels.expandNorth = createExpandPanel('north');
				panels.expandNorth.panel('panel').click(function(){
					panels.north.panel('open').panel('resize', {top:-panels.north.panel('options').height});
					panels.north.panel('panel').animate({top:0});
					return false;
				});
			}
		} else if (region == 'south'){
			if (panels.south.panel('options').onBeforeCollapse.call(panels.south) == false) return;
			
			var hh = cc.height() - 28;
			if (isVisible(panels.expandNorth)){
				hh -= panels.expandNorth.panel('options').height;
			} else if (isVisible(panels.north)){
				hh -= panels.north.panel('options').height;
			}
			panels.center.panel('resize', {height:hh});
			panels.east.panel('resize', {height:hh});
			panels.west.panel('resize', {height:hh});
			if (isVisible(panels.expandEast)) panels.expandEast.panel('resize', {height:hh});
			if (isVisible(panels.expandWest)) panels.expandWest.panel('resize', {height:hh});
			
			panels.south.panel('panel').animate({top:cc.height()}, function(){
				panels.south.panel('close');
				panels.expandSouth.panel('open').panel('resize', {
					top: cc.height() - 28,
					left: 0,
					width: cc.width(),
					height: 28
				});
				panels.south.panel('options').onCollapse.call(panels.south);
			});
			if (!panels.expandSouth) {
				panels.expandSouth = createExpandPanel('south');
				panels.expandSouth.panel('panel').click(function(){
					panels.south.panel('open').panel('resize', {top:cc.height()});
					panels.south.panel('panel').animate({top:cc.height()-panels.south.panel('options').height});
					return false;
				});
			}
		}
	}
	
	function expandPanel(container, region){
		var panels = $.data(container, 'layout').panels;
		var cc = $(container);
		if (region == 'east' && panels.expandEast){
			if (panels.east.panel('options').onBeforeExpand.call(panels.east) == false) return;
			
			panels.expandEast.panel('close');
			panels.east.panel('panel').stop(true,true);
			panels.east.panel('open').panel('resize', {left:cc.width()});
			panels.east.panel('panel').animate({
				left: cc.width() - panels.east.panel('options').width
			}, function(){
				setSize(container);
				panels.east.panel('options').onExpand.call(panels.east);
			});
		} else if (region == 'west' && panels.expandWest){
			if (panels.west.panel('options').onBeforeExpand.call(panels.west) == false) return;
			
			panels.expandWest.panel('close');
			panels.west.panel('panel').stop(true,true);
			panels.west.panel('open').panel('resize', {left: -panels.west.panel('options').width});
			panels.west.panel('panel').animate({
				left: 0
			}, function(){
				setSize(container);
				panels.west.panel('options').onExpand.call(panels.west);
			});
		} else if (region == 'north' && panels.expandNorth){
			if (panels.north.panel('options').onBeforeExpand.call(panels.north) == false) return;
			
			panels.expandNorth.panel('close');
			panels.north.panel('panel').stop(true,true);
			panels.north.panel('open').panel('resize', {top:-panels.north.panel('options').height});
			panels.north.panel('panel').animate({top:0}, function(){
				setSize(container);
				panels.north.panel('options').onExpand.call(panels.north);
			});
		} else if (region == 'south' && panels.expandSouth){
			if (panels.south.panel('options').onBeforeExpand.call(panels.south) == false) return;
			
			panels.expandSouth.panel('close');
			panels.south.panel('panel').stop(true,true);
			panels.south.panel('open').panel('resize', {top:cc.height()});
			panels.south.panel('panel').animate({top:cc.height()-panels.south.panel('options').height}, function(){
				setSize(container);
				panels.south.panel('options').onExpand.call(panels.south);
			});
		}
	}
	
	function bindEvents(container){
		var panels = $.data(container, 'layout').panels;
		var cc = $(container);
		
		// bind east panel events
		if (panels.east.length){
			panels.east.panel('panel').bind('mouseover','east',collapsePanel);
		}
		
		// bind west panel events
		if (panels.west.length){
			panels.west.panel('panel').bind('mouseover','west',collapsePanel);
		}
		
		// bind north panel events
		if (panels.north.length){
			panels.north.panel('panel').bind('mouseover','north',collapsePanel);
		}
		
		// bind south panel events
		if (panels.south.length){
			panels.south.panel('panel').bind('mouseover','south',collapsePanel);
		}
		
		panels.center.panel('panel').bind('mouseover','center',collapsePanel);
		
		function collapsePanel(e){
			if (resizing == true) return;
			
			if (e.data != 'east' && isVisible(panels.east) && isVisible(panels.expandEast)){
				panels.east.panel('panel').animate({left:cc.width()}, function(){
					panels.east.panel('close');
				});
			}
			if (e.data != 'west' && isVisible(panels.west) && isVisible(panels.expandWest)){
				panels.west.panel('panel').animate({left:-panels.west.panel('options').width}, function(){
					panels.west.panel('close');
				});
			}
			if (e.data != 'north' && isVisible(panels.north) && isVisible(panels.expandNorth)){
				panels.north.panel('panel').animate({top:-panels.north.panel('options').height}, function(){
					panels.north.panel('close');
				});
			}
			if (e.data != 'south' && isVisible(panels.south) && isVisible(panels.expandSouth)){
				panels.south.panel('panel').animate({top:cc.height()}, function(){
					panels.south.panel('close');
				});
			}
			return false;
		}
		
	}
	
	function isVisible(pp){
		if (!pp) return false;
		if (pp.length){
			return pp.panel('panel').is(':visible');
		} else {
			return false;
		}
	}
	
	$.fn.layout = function(options, param){
		if (typeof options == 'string'){
			switch(options){
			case 'panel':
				return $.data(this[0], 'layout').panels[param];
			case 'collapse':
				return this.each(function(){
					collapsePanel(this, param);
				});
			case 'expand':
				return this.each(function(){
					expandPanel(this, param);
				});
			}
		}
		
		return this.each(function(){
			var state = $.data(this, 'layout');
			if (!state){
				var opts = $.extend({}, {
					fit: $(this).attr('fit') == 'true'
				});
//				var t1=new Date().getTime();
				$.data(this, 'layout', {
					options: opts,
					panels: init(this)
				});
				bindEvents(this);
//				var t2=new Date().getTime();
//				alert(t2-t1)
			}
			setSize(this);
		});
	};
})(jQuery);
