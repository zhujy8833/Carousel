/*
 * File: Selectr - a jQuery plugin!
 * Dependencies : jquery-1.4.4.js, selectr.css 
 * Author: Madison Williams at Regpack (madison@regpacks.com)
 * Website: http://www.Regpacks.com
 * Inspired by: Chosen - http://harvesthq.github.com/chosen/
 * 
 * 
 * 						---- DOCUMENTATION ----
 * 
 * Usage:
 * 	   	$("select").selectr({
 * 			//options go here
 * 	   	});
 * 
 * 
 * Multiple mode:
 * 		In order to make Selectr go into MULTIPLE mode, have the attribute in 
 * 		your select html to make it multiple selection like this:
 * 				<select multiple="multiple">
 * 					//options go here
 * 				</select>
 * 
 * 
 * Options: (all are optional)
 * 		link_text : (string) [default="Select an Option..."] 	: this chooses what will display as your "default option" but it is unselectable
 * 		openOnCreate : (boolean) [default=false] 				: this decides if you want to automatically open your Selectr upon it's creation
 * 
 * 
 * Callbacks:
 * 		Callback Name	: arguments passed	: when it is run 
 * 		-----------------------------------------------------------------------
 * 		onCreate 		: (instance)		: runs after creation of Selectr
 * 		onOpen 			: (instance)		: runs after Selectr is opened up
 * 		onSearch 		: (instance,term)	: runs after the person's keyup on the search box and it does searching
 * 		onClose 		: (instance)		: runs after the Selectr dropdown is closed
 * 		onBind 			: (instance)		: runs after everything is bound (this occurs multiple times if it's a multiple-select)
 * 		onSelect 		: (instance,item)	: runs after someone selects an option
 * 		onDestroy 		: (instance)		: runs after you have called the instance.destroy() method
 * 		onContentUpdate : (instance)		: runs after the content as updated (or the that.updateContent() function is called)
 * 
 * 
 * API:
 * 		You can use certain functions in Selector on your own by accessing 
 * 		the instance that is stored as a property in your <select> element.
 * 		It is located like this:
 * 			var selectr_inst = $("#selectelement")[0].selectr_inst;
 * 
 * 		Technically, you can run whatever functions I have in here on your own, but I would only recommend running these:
 * 
 *  		selectr_inst.showBox() 		 -	 This will expand your box
 * 			selectr_inst.hideBox() 		 - 	 This will collapse your box
 * 			selectr_inst.updateContent() - 	 This will take whatever options you have in the original select box and update Selectr's contents with the new options
 * 			selectr_inst.destroy()		 - 	 This will destroy your Selectr instance. I highly recommend using this as it will clear all the bindings in addition to your instance
 */

(function($){
	var Selectr,
		S_p = Selectr.prototype;
	Selectr.numOfInstances = 1;
	Selectr.instances = [];

	function Selectr(args) {
		var empty_func = function(){},
			that = this,
			callbacks = ["onCreate","onOpen","onSearch","onClose","onBind","onSelect","onDestroy","onContentUpdate"];
		this.cbs = {};
		this.firstAdjustWidth=true;
		this.OPEN_CLASS = "selectr_container_open";
		this.element = $(args.element);
		this.link_text = args.link_text || "Select an Option...";
		this.link_text_custom = !!args.link_text;
		this.options = [];
		this.selected = [];
		this.openOnCreate = args.openOnCreate || false;
		this.isOpen = false;
		this.hoveringOverOption = false;
		this.identifier = "Selectr_inst_"+Selectr.numOfInstances;
		this.multiple = !!(this.element.attr("multiple"));
		
		//Throwing the callbacks in.
		$(callbacks).each(function() {
			that.cbs[this] = args[this] || empty_func;
		})
	}
	S_p.renderMultiUI = function() {
		var uibox = $("#"+this.identifier+"_multiui"),
			that = this,
			oSelect,
			optionwidth = 0,
			optionlis,
			html = "";
		$(this.selected).each(function(ind) {
			oSelect = that.selected[ind];
			if (typeof(oSelect)==="string") {
				html+="<li class='selectr_choice'>"+oSelect+"<a href='javascript:;' rel='"+ind+"'></a></li>";
			}
		})
		html+="<li><input type='text' autocomplete='off' id='"+this.identifier+"_searchinput' value='"+this.link_text+"'/></li>";
		uibox.empty().append(html);
		this.toggle_input = $("#"+this.identifier+"_searchinput");
		this.bind();
		
		
		//get the combined width of the options
		optionlis = $(uibox).find("li");
		$(optionlis).each(function() {
			optionwidth+=$(this).width();
		})
		
		if ((optionwidth+30)>$("#"+this.identifier+"_container").width()) {
			this.adjustWidth($(optionlis[optionlis.length-1]).width());
		}
		
		uibox.find("a").click(function() {
			var index = $(this).attr("rel");
			that.unselectOption(index);
			that.adjustWidth(parseInt("-"+$(this).parent().width(),10));
			that.renderMultiUI();
		})
	}
	S_p.selectOption = function(index,tf) {
		var selectedOption;
		if (typeof(tf)==="undefined") tf=true;
		selectedOption = $(this.element).find("option")[parseInt(index,10)];
		if (selectedOption) selectedOption.selected=tf;
		this.selected[index] = !!(tf)?this.options[index].text:false;
	}
	
	S_p.unselectOption = function(index) {
		this.selectOption(index,false);
	}
	
	S_p.bind = function() {
		var drop = $("#"+this.identifier+"_dropdown"),
			that = this,
			HOVER_CLASS = "selectr_result_hover",
			container = $("#"+this.identifier+"_container"),
			search_input = $("#"+this.identifier+"_searchinput"),
			arrow_toggle = "selectr_arrow_down selectr_arrow_up";
		this.toggle_input.unbind().click(function(){
			if (that.isOpen) {
				that.hideBox();
			} else {
				that.showBox();
			}
		})
		
		$("#"+this.identifier+"_results").unbind().click(function(e) {
			var ele = e.target,
				selectedOption,
				rel = $(ele).attr("rel");
			if (typeof(rel)==="undefined") return false;
			that.selectOption(rel);
			if (!that.multiple) {
				$("#"+that.identifier+"_toggle span.selectr_toggle_text").empty().append($(ele).text());
			} else {
				that.renderMultiUI();
			}
			that.hideBox();
			that.cbs.onSelect(that,that.options[rel]);
		})
		
		$("#"+this.identifier+"_container").unbind().mouseover(function(e) {
			var ele = e.target;
			if (ele.tagName==="A") {
				$("#"+that.identifier+"_results li a."+HOVER_CLASS).removeClass(HOVER_CLASS);
				$(ele).addClass(HOVER_CLASS);
				that.hoveringOverOption = true;
			}
		}).mouseleave(function() {
			$("#"+that.identifier+"_results li a."+HOVER_CLASS).removeClass(HOVER_CLASS);
			that.hoveringOverOption = false;
		}).mouseover(function() {
			$(search_input).focus();
		})
		
		$(search_input).keyup(function() {
			var oVal = $(this).val()
			that.filter(oVal);
			that.cbs.onSearch(that,oVal);
		}).blur(function(evt) {
			if (!that.hoveringOverOption && that.isOpen) {
				that.hideBox();
			}
		})
		
		if (this.multiple) {
			$(search_input).focus(function() {
				$(this).val("");
			}).blur(function() {
				if (!$(this).val()) {
					$(this).val(that.link_text);
				}
			})
		}
		
		this.cbs.onBind(this);
	}
	S_p.showBox = function() {
		var arrow = $("#"+this.identifier+"_container .selectr_arrow"),
			search_input = $("#"+this.identifier+"_searchinput"),
			container = $("#"+this.identifier+"_container"),
			arrow_toggle = "selectr_arrow_down selectr_arrow_up";
		$("#"+this.identifier+"_dropdown").show();
		arrow.toggleClass(arrow_toggle);
		this.updateContent();
		search_input.focus();
		container.addClass(this.OPEN_CLASS);
		this.cbs.onOpen(this);
		this.isOpen = true;
	}
	S_p.hideBox = function() {
		var arrow = $("#"+this.identifier+"_container .selectr_arrow"),
			container = $("#"+this.identifier+"_container"),
			arrow_toggle = "selectr_arrow_down selectr_arrow_up";
		$("#"+this.identifier+"_dropdown").hide();
		this.cbs.onClose(this);
		this.isOpen = false;
		arrow.toggleClass(arrow_toggle);
		container.removeClass(this.OPEN_CLASS);
	}
	S_p.updateContent = function() {
		var options = [],
			oOption,
			html="",
			results_box = $("#"+this.identifier+"_results"),
			select_options = this.element.children();
		
		select_options.each(function(ind) {
			oOption = {
				index : ind,
				text : $(this).text(),
				category : $(this).hasClass("selectr_category")
			}
			options.push(oOption);
		})
		this.options = options;
		$(options).each(function() {
			if (this.category) {
				html+="<li class='selectr_results_category'><span>"+this.text+"</span></li>";
			} else {
				html+="<li><a href='javascript:;' rel='"+this.index+"'>"+this.text+"</a></li>";
			}
			
		})
		
		results_box.empty().append(html);
		this.cbs.onContentUpdate(this);
	}
	
	S_p.filter = function(term) {
		var matching_indexes = {},
			oIndex;
		$(this.options).each(function(ind) {
			if (!this.category && this.text.indexOf(term)!==-1) {
				matching_indexes[ind] = true;
			}
		})
		$("#"+this.identifier+"_results").find("li").each(function(ind) {
			if (!$(this).hasClass("selectr_results_category")) {
				if (!matching_indexes[ind]) {
					$(this).hide();
				} else {
					$(this).show();
				}
			}
		})
	}
	S_p.adjustWidth = function(pluswidth) {
		var container = $("#"+this.identifier+"_container"),
			dropdown = $("#"+this.identifier+"_dropdown"),
			searchinput = $("#"+this.identifier+"_searchinput"),
			selectWidth = $(this.element).width(),
			finalWidth, defWidth;
		if (!pluswidth) {
				selectWidth = $(this.element).width()
				if (this.adjustWidth.firstrun) {
					defWidth = (this.multiple)?230:130;
				} else {
					defWidth = selectWidth+35;
				}
			finalWidth = (this.link_text_custom)?selectWidth:defWidth;
			container.css({width:(finalWidth+10)+"px"});
			
			//console.log((finalWidth+10))
			if (!this.multiple) {
				dropdown.css({width:(finalWidth+8)+"px"});
			} else {
				dropdown.css({width:(finalWidth)+"px"});
			}
			
			searchinput.css({width:(finalWidth-12)+"px"})
		} else {
			container.css({width:(container.width()+pluswidth)+"px"});
			dropdown.css({width:(dropdown.width()+pluswidth)+"px"});
			searchinput.css({width:(searchinput.width()+pluswidth)+"px"})
		}
		this.firstAdjustWidth=false;
	}
	
	S_p.destroy = function() {
		var container = $("#"+this.identifier+"_container")
		container.contents().andSelf().unbind();
		container.remove();
		$(this.element).show();
		this.cbs.onDestroy(this);
		delete this.element.selectr_inst;
	}
	
	S_p.init = function() {
		
		var html="",
			ele = this.element,
			finalWidth,
			id = this.identifier;
		
		if (!this.multiple) {
			html+=	"<div id='"+id+"_container' class='selectr_container'>"
				+		"<a href='javascript:;' class='selectr_toggle' id='"+id+"_toggle'><span class='selectr_toggle_text'>"+this.link_text+"</span><div class='selectr_arrow selectr_arrow_down'><span></span></div></a>"
				+		"<div id='"+id+"_dropdown' class='selectr_dropdown' style='display:none;'>"
				+			"<div class='selectr_search'>"
				+				"<input type='text' autocomplete='off' id='"+id+"_searchinput' />"
				+			"</div>";
		} else {
			html+=	"<div id='"+id+"_container' class='selectr_container selectr_container_multiple'>"
				+		"<div class='selectr_search'>"
				+				"<ul id='"+id+"_multiui' class='selectr_choices'>"
				+					"<li><input type='text' autocomplete='off' id='"+id+"_searchinput' value='"+this.link_text+"'/></li>"
				+				"</ul>"
				+		"</div>"
				+		"<div id='"+id+"_dropdown' class='selectr_dropdown' style='display:none;'>";
		}
		html+=			"<div class='selectr_results'>"
			+				"<ul id='"+id+"_results'></ul>"
			+			"</div>"
			+		"</div>"
			+	"</div>";
		ele.after(html);
		this.cbs.onCreate(this);
		this.element.hide();
		this.adjustWidth();
		this.toggle_input = (this.multiple)?$("#"+this.identifier+"_searchinput"):$("#"+this.identifier+"_toggle");
		this.bind();
		if (this.openOnCreate) this.showBox();
	}
	//make it a jquery function
	$.fn.selectr = function(args) {
		//console.log(this);
		args = args || {};
		this.each(function(){
			//console.log(this)
			args.element = this;
			this.selectr_inst = new Selectr(args);
			this.selectr_inst.init();
			Selectr.numOfInstances+=1;
		})
		return this;
	}
}(jQuery))