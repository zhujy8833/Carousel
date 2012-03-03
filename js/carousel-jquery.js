(function($){
	$.fn.carousel = function(args){
		//var args = typeof(args)=="undefined"?{}:args;
		var args = $.extend({
			element : this,
			children : this.children(),
			count_per_page : 3,
			
		},args);
		//args.children = this.children();   //find the children 
		//args.count_per_page = typeof(init_args.count_per_page) == 'undefined'?3:init_args.count_per_page;   //how many items in one page
		
		this.each(function(){
			new Carousel(args);
			
		});
		
	}
	
	var Carousel = function(config_arg){
		this.parent = $(config_arg.element);
		this.children = $(config_arg.children);
		this.children_num = this.children.length;
		this.count_per_page = config_arg.count_per_page;
		this.current_page = 0;
		this.current_pos = 0;
		this.page_need= Math.ceil(this.children_num/this.count_per_page);
		//console.log(this.count_per_page)
		this.init();
		
		
	}
	
	Carousel.prototype.init = function(){
		var ele = this.parent,btn_html;
		//var btn_div = document.createElement("div");
		
		btn_html="<div class='button_div'>";
		btn_html+="<input type='button' id='prev_btn' value='Previous'/>";
		btn_html+="<input type='button' id='next_btn' value='Next'/>";
		btn_html+="</div>";
		//$(btn_div).html(btn_html);
		
		//document.appendChild(btn_div);
		ele.parent().append(btn_html);
		//document.append(btn_html);
		
		
		this.render();
		
		var that = this;
		$("#prev_btn").click(function(){
			that.prev();
			});
		$("#next_btn").click(function(){
			that.next();
			});
	};
	
	Carousel.prototype.prev = function(){
		//prev
		//var that = this
		//console.log(that)
		if(this.current_page == 0){ 
			return false
		}
		this.current_page--;
        this.current_pos = this.current_pos-this.count_per_page;         //calculate current start position
        this.render();
	};
	
	Carousel.prototype.next = function(){
		//next
		if(this.current_page == this.page_num-1){
			return false
		}
		this.current_page++;
        this.current_pos = this.current_pos+this.count_per_page;     //get current start postion
        this.render();
	};
	
	Carousel.prototype.render = function(){
		var items = this.children, count = this.children_num;
		//console.log(this.page_need)
		//console.log(items)
		$(items).hide();
		for(var i=0;i<count;i++){
			
			
            	if(items[i]){
            		if(i<this.current_pos){
            			$(items[i]).hide();
            			//this.target_group[index].setStyle({"left": "-"+max_left});
            		}
            		else if(i>this.current_pos+this.count_per_page-1){
            			$(items[i]).hide();
            			//this.target_group[index].setStyle({"left": max_left});
            		}
            		else {
            			//console.log(i)
            			$(items[i]).show();
            			//this.target_group[index].setStyle({"left": this.start_left+(index-this.current_pos)*this.left_increment+"px"});
            		}
    		
            	}

			
		}
	}
	
})(jQuery)
