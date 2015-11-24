/**
 * calendar - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 */
(function($){
	
	function setSize(target){
		var opts = $.data(target, 'calendar').options;
		var t = $(target);
		if (opts.fit == true){
			var p = t.parent();
			opts.width = p.width();
			opts.height = p.height();
		}
		var header = t.find('.calendar-header');
		if ($.boxModel == true){
			t.width(opts.width - (t.outerWidth() - t.width()));
			t.height(opts.height - (t.outerHeight() - t.height()));
		} else {
			t.width(opts.width);
			t.height(opts.height);
		}
		var body = t.find('.calendar-body');
		var height = t.height() - header.outerHeight();
		if ($.boxModel == true){
			body.height(height - (body.outerHeight() - body.height()));
		} else {
			body.height(height);
		}
		
	}
	
	function init(target){
		$(target).addClass('calendar').wrapInner(
				'<div class="calendar-header">' +
					'<div class="calendar-prevmonth"></div>' +
					'<div class="calendar-nextmonth"></div>' +
					'<div class="calendar-prevyear"></div>' +
					'<div class="calendar-nextyear"></div>' +
					'<div class="calendar-title">' +
						'<span>Aprial 2010</span>' +
					'</div>' +
				'</div>' +
				'<div class="calendar-body">' +
					'<div class="calendar-menu">' +
						'<div class="calendar-menu-year-inner">' +
							'<span class="calendar-menu-prev"></span>' +
							'<span><input class="calendar-menu-year" type="text"></input></span>' +
							'<span class="calendar-menu-next"></span>' +
						'</div>' +
						'<div class="calendar-menu-month-inner">' +
						'</div>' +
					'</div>' +
				'</div>'
		);
		
		$(target).find('.calendar-title span').hover(
			function(){$(this).addClass('calendar-menu-hover');},
			function(){$(this).removeClass('calendar-menu-hover');}
		).click(function(){
			var menu = $(target).find('.calendar-menu');
			if (menu.is(':visible')){
				menu.hide();
			} else {
				showSelectMenus(target);
			}
		});
		
		$('.calendar-prevmonth,.calendar-nextmonth,.calendar-prevyear,.calendar-nextyear', target).hover(
			function(){$(this).addClass('calendar-nav-hover');},
			function(){$(this).removeClass('calendar-nav-hover');}
		);
		$(target).find('.calendar-nextmonth').click(function(){
			showMonth(target, 1);
		});
		$(target).find('.calendar-prevmonth').click(function(){
			showMonth(target, -1);
		});
		$(target).find('.calendar-nextyear').click(function(){
			showYear(target, 1);
		});
		$(target).find('.calendar-prevyear').click(function(){
			showYear(target, -1);
		});
		
		$(target).bind('_resize', function(){
			var opts = $.data(target, 'calendar').options;
			if (opts.fit == true){
				setSize(target);
			}
			return false;
		});
	}
	
	/**
	 * show the calendar corresponding to the current month.
	 */
	function showMonth(target, delta){
		var opts = $.data(target, 'calendar').options;
		opts.month += delta;
		if (opts.month > 12){
			opts.year++;
			opts.month = 1;
		} else if (opts.month < 1){
			opts.year--;
			opts.month = 12;
		}
		show(target);
		
		var menu = $(target).find('.calendar-menu-month-inner');
		menu.find('td.calendar-selected').removeClass('calendar-selected');
		menu.find('td:eq(' + (opts.month-1) + ')').addClass('calendar-selected');
	}
	
	/**
	 * show the calendar corresponding to the current year.
	 */
	function showYear(target, delta){
		var opts = $.data(target, 'calendar').options;
		opts.year += delta;
		show(target);
		
		var menu = $(target).find('.calendar-menu-year');
		menu.val(opts.year);
	}
	
	/**
	 * show the select menu that can change year or month, if the menu is not be created then create it.
	 */
	function showSelectMenus(target){
		var opts = $.data(target, 'calendar').options;
		$(target).find('.calendar-menu').show();
		
		if ($(target).find('.calendar-menu-month-inner').is(':empty')){
			$(target).find('.calendar-menu-month-inner').empty();
			var t = $('<table></table>').appendTo($(target).find('.calendar-menu-month-inner'));
			var idx = 0;
			for(var i=0; i<3; i++){
				var tr = $('<tr></tr>').appendTo(t);
				for(var j=0; j<4; j++){
					$('<td class="calendar-menu-month"></td>').html(opts.months[idx++]).attr('abbr',idx).appendTo(tr);
				}
			}
			
			$(target).find('.calendar-menu-prev,.calendar-menu-next').hover(
					function(){$(this).addClass('calendar-menu-hover');},
					function(){$(this).removeClass('calendar-menu-hover');}
			);
			$(target).find('.calendar-menu-next').click(function(){
				var y = $(target).find('.calendar-menu-year');
				if (!isNaN(y.val())){
					y.val(parseInt(y.val()) + 1);
				}
			});
			$(target).find('.calendar-menu-prev').click(function(){
				var y = $(target).find('.calendar-menu-year');
				if (!isNaN(y.val())){
					y.val(parseInt(y.val() - 1));
				}
			});
			
			$(target).find('.calendar-menu-year').keypress(function(e){
				if (e.keyCode == 13){
					setDate();
				}
			});
			
			$(target).find('.calendar-menu-month').hover(
					function(){$(this).addClass('calendar-menu-hover');},
					function(){$(this).removeClass('calendar-menu-hover');}
			).click(function(){
				var menu = $(target).find('.calendar-menu');
				menu.find('.calendar-selected').removeClass('calendar-selected');
				$(this).addClass('calendar-selected');
				setDate();
			});
		}
		
		function setDate(){
			var menu = $(target).find('.calendar-menu');
			var year = menu.find('.calendar-menu-year').val();
			var month = menu.find('.calendar-selected').attr('abbr');
			if (!isNaN(year)){
				opts.year = parseInt(year);
				opts.month = parseInt(month);
				show(target);
			}
			menu.hide();
		}
		
		var body = $(target).find('.calendar-body');
		var sele = $(target).find('.calendar-menu');
		var seleYear = sele.find('.calendar-menu-year-inner');
		var seleMonth = sele.find('.calendar-menu-month-inner');
		
		seleYear.find('input').val(opts.year).focus();
		seleMonth.find('td.calendar-selected').removeClass('calendar-selected');
		seleMonth.find('td:eq('+(opts.month-1)+')').addClass('calendar-selected');
		
		if ($.boxModel == true){
			sele.width(body.outerWidth() - (sele.outerWidth() - sele.width()));
			sele.height(body.outerHeight() - (sele.outerHeight() - sele.height()));
			seleMonth.height(sele.height() - (seleMonth.outerHeight() - seleMonth.height()) - seleYear.outerHeight());
		} else {
			sele.width(body.outerWidth());
			sele.height(body.outerHeight());
			seleMonth.height(sele.height() - seleYear.outerHeight());
		}
	}
	
	/**
	 * get weeks data.
	 */
	function getWeeks(year, month){
		var dates = [];
		var lastDay = new Date(year, month, 0).getDate();
		for(var i=1; i<=lastDay; i++) dates.push([year,month,i]);
		
		// group date by week
		var weeks = [], week = [];
		while(dates.length > 0){
			var date = dates.shift();
			week.push(date);
			if (new Date(date[0],date[1]-1,date[2]).getDay() == 6){
				weeks.push(week);
				week = [];
			}
		}
		if (week.length){
			weeks.push(week);
		}
		
		var firstWeek = weeks[0];
		if (firstWeek.length < 7){
			while(firstWeek.length < 7){
				var firstDate = firstWeek[0];
				var date = new Date(firstDate[0],firstDate[1]-1,firstDate[2]-1)
				firstWeek.unshift([date.getFullYear(), date.getMonth()+1, date.getDate()]);
			}
		} else {
			var firstDate = firstWeek[0];
			var week = [];
			for(var i=1; i<=7; i++){
				var date = new Date(firstDate[0], firstDate[1]-1, firstDate[2]-i);
				week.unshift([date.getFullYear(), date.getMonth()+1, date.getDate()]);
			}
			weeks.unshift(week);
		}
		
		var lastWeek = weeks[weeks.length-1];
		while(lastWeek.length < 7){
			var lastDate = lastWeek[lastWeek.length-1];
			var date = new Date(lastDate[0], lastDate[1]-1, lastDate[2]+1);
			lastWeek.push([date.getFullYear(), date.getMonth()+1, date.getDate()]);
		}
		if (weeks.length < 6){
			var lastDate = lastWeek[lastWeek.length-1];
			var week = [];
			for(var i=1; i<=7; i++){
				var date = new Date(lastDate[0], lastDate[1]-1, lastDate[2]+i);
				week.push([date.getFullYear(), date.getMonth()+1, date.getDate()]);
			}
			weeks.push(week);
		}
		
		return weeks;
	}
	
	/**
	 * show the calendar day.
	 */
	function show(target){
		var opts = $.data(target, 'calendar').options;
		$(target).find('.calendar-title span').html(opts.months[opts.month-1] + ' ' + opts.year);
		
		var body = $(target).find('div.calendar-body');
		body.find('>table').remove();
		
		var t = $('<table cellspacing="0" cellpadding="0" border="0"><thead></thead><tbody></tbody></table>').prependTo(body);
		var tr = $('<tr></tr>').appendTo(t.find('thead'));
		for(var i=0; i<opts.weeks.length; i++){
			tr.append('<th>'+opts.weeks[i]+'</th>');
		}
		var weeks = getWeeks(opts.year, opts.month);
		for(var i=0; i<weeks.length; i++){
			var week = weeks[i];
			var tr = $('<tr></tr>').appendTo(t.find('tbody'));
			for(var j=0; j<week.length; j++){
				var day = week[j];
				$('<td class="calendar-day calendar-other-month"></td>').attr('abbr',day[0]+','+day[1]+','+day[2]).html(day[2]).appendTo(tr);
			}
		}
		t.find('td[abbr^='+opts.year+','+opts.month+']').removeClass('calendar-other-month');
		
		var now = new Date();
		var today = now.getFullYear()+','+(now.getMonth()+1)+','+now.getDate();
		t.find('td[abbr='+today+']').addClass('calendar-today');
		
		if (opts.current){
			t.find('.calendar-selected').removeClass('calendar-selected');
			var current = opts.current.getFullYear()+','+(opts.current.getMonth()+1)+','+opts.current.getDate();
			t.find('td[abbr='+current+']').addClass('calendar-selected');
		}
		
		t.find('tr').find('td:first').addClass('calendar-sunday');
		t.find('tr').find('td:last').addClass('calendar-saturday');
		
		t.find('td').hover(
			function(){$(this).addClass('calendar-hover');},
			function(){$(this).removeClass('calendar-hover');}
		).click(function(){
			t.find('.calendar-selected').removeClass('calendar-selected');
			$(this).addClass('calendar-selected');
			var parts = $(this).attr('abbr').split(',');
			opts.current = new Date(parts[0], parseInt(parts[1])-1, parts[2]);
			opts.onSelect.call(target, opts.current);
		});
	}
	
	$.fn.calendar = function(options){
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'calendar');
			if (state){
				$.extend(state.options, options);
			} else {
				init(this);
				state = $.data(this, 'calendar', {
					options:$.extend({}, $.fn.calendar.defaults, options)
				});
			}
			if (state.options.border == false){
				$(this).addClass('calendar-noborder');
			}
			setSize(this);
			show(this);
			$(this).find('div.calendar-menu').hide();	// hide the calendar menu
		});
	};
	
	$.fn.calendar.defaults = {
		width:180,
		height:180,
		fit:false,
		border:true,
		weeks:['S','M','T','W','T','F','S'],
		months:['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		year:new Date().getFullYear(),
		month:new Date().getMonth()+1,
		current:new Date(),
		
		onSelect: function(date){}
	};
})(jQuery);