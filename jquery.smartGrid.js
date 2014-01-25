/* Smart Grid 
 * Author: Filipe Rinaldi
 * Copyright 2014
 */
(function ($, undefined) {

	var defaults = {
	    items: [],
	    orderBy: null,
	    orderByFields: null,
	    viewMode: 'list',
	    currentPage: 0,
	    itemsPerPage: 'all',
	    fnContent: null,
	};

	var sg = $.smartGrid = {version: '0.1'};

	$.fn.smartGrid = function(param) {
		/* Initialisation */
		var options = {};
		$.extend(options, defaults, param);
		var element = $($(this)[0]);
		var sg = new SmartGrid(element, options);
		element.data('smartGrid', sg);
		sg.update();
		return this;
	};

	function SmartGrid(element, options) {
		
		/* 
		 * Attributes
		 */
		this.items = options.items;
		delete options.items;
		this.options = options;

		/* 
		 * Methods
		 */
		this.addItem = addItem;
		this.orderBy = orderBy;
		this.removeItem = removeItem;
		this.search = search;
		this.setViewMode = setViewMode;
		this.sort = sort;
		this.update = update;

		if (this.options.orderBy)
			this.sort();		

		/* 
		 * Create HTML
		 */
		element.addClass('sg-container thumbnail');

		var order_options = "";
		if (this.options.orderByFields) {
			for (var i=0; i<this.options.orderByFields.length; i++) {
				var option = this.options.orderByFields[i];
				if (this.options.orderBy == option['key'])
					var selected = ' selected';
				else
					var selected = '';
				order_options += '<option value="'+option['key']+'" '+selected+'>'+option['label']+'</option>';
			}
		}

		$('<div class="sg-header">\
				<form class="form-inline">\
					<input class="input-medium search-query" type="text" placeholder="Search">\
					Order by:\
					<select class="">\
					'+order_options+'\
					</select>\
					<div class="btn-group pull-right">\
			    		<a class="btn" href="#"><i class="icon-th-large"></i></a>\
			    		<a class="btn" href="#"><i class="icon-align-justify"></i></a>\
					</div>\
				</form>\
		   </div>\
		   <hr>').prependTo(element);

		/* Create content area */
		this.contents = $('<ul class="thumbnails"></ul>').appendTo(element);

		/* Create pagination */
		$('<div class="pagination pagination-centered">\
		   <ul>\
		     <li><a href="#">&laquo;</a></li>\
		     <li><a href="#">1</a></li>\
		     <li><a href="#">2</a></li>\
		     <li><a href="#">3</a></li>\
		     <li><a href="#">&raquo;</a></li>\
		   </ul>\
		   </div>').appendTo(element);

		/*
		 * Bind controls
		 */
		this.btTiles = element.find('a').eq(0);
		this.btTiles.data('smartGrid', this);
		this.btTiles.click(function(){
			var sg = $(this).data('smartGrid');
			sg.setViewMode('tiles');
		});
		if (this.options.viewMode == 'tiles')
			this.btTiles.addClass('disabled');

		this.btList = element.find('a').eq(1);
		this.btList.data('smartGrid', this);
		this.btList.click(function(){
			var sg = $(this).data('smartGrid');
			sg.setViewMode('list');
		});
		if (this.options.viewMode == 'list')
			this.btList.addClass('disabled');

		this.selectOrder = element.find('select').eq(0);
		this.selectOrder.data('smartGrid', this);
		this.selectOrder.change(function(){
			var sg = $(this).data('smartGrid');
			var key = $(this).children(':selected').val();
			sg.orderBy(key);
		});

		this.inputSearch = element.find('input').eq(0);
		this.inputSearch.data('smartGrid', this);
		this.inputSearch.keyup(function(){
			var sg = $(this).data('smartGrid');
			var text = $(this).val();
			sg.search(text);
		});

		/*
		 * Methods implementation
		 */
		function update() {
			this.contents.empty();
			for (var i=0; i<this.items.length; i++) {
				var item = this.items[i]
				$(this.options.fnContent(item, this.options.viewMode)).appendTo(this.contents);
			}
		};

		function setViewMode(mode) {
;;;			console.assert(mode == 'list' || mode == 'tiles', "Error: Invalid view mode");
			this.options.viewMode = mode;
			if (mode == 'list') {
				this.btList.addClass('disabled');
				this.btTiles.removeClass('disabled');	
			} else if (mode == 'tiles') {
				this.btTiles.addClass('disabled');
				this.btList.removeClass('disabled');
			} else {
				return false;
			}
			this.update();
			return true;
		};

		function search(text) {
;;;			console.debug(text);
			this.update();
		}

		function addItem(item) {
			this.items.push(item);
			if (this.options.orderBy)
				this.sort();
			this.update();	
		}

		function removeItem(item) {
			var i = this.items.length;
			var removed = [];
			while (i--) {
				var node = this.items[i];
				if (node[item['key']] == item['value']) {
					removed.push(node);
					this.items.splice(i, 1);
				}
			}
			if (removed.length != 0)
				this.update();
			return removed;
		}

		function orderBy(key) {
			for (var i=0; i<this.options.orderByFields.length; i++) {
				if (this.options.orderByFields[i].key === key) {
					this.options.orderBy = key;
					this.sort();
					this.update();
					return true;
				}
			}
			return false;
		}

		function sort() {
			var key = this.options.orderBy;
			this.items.sort(function(a, b){
				//TODO: Add more cleverness to sort dates, numbers, case-insensitive, etc
				if (a[key] < b[key])
					return -1;
				if (a[key] > b[key])
					return 1;
				if (a[key] == b[key])
					return 0;
			})
		}
	};
})(jQuery);
