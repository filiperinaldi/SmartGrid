/* Smart Grid 
 * Author: Filipe Rinaldi (c) 2014
 * https://github.com/filiperinaldi/SmartGrid
 */
(function ($, undefined) {

	var defaults = {
		currentPage: 0,
		fnContent: null,
		items: [],
		itemsPerPage: 'all',
		orderBy: null,
		orderByFields: null,
		searchExcludeFields: [],
		viewMode: 'list'
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
		this.hiddenItems = [];
		this.options = options;

		/* 
		 * Methods
		 */
		this.addItem = addItem;
		this.orderBy = orderBy;
		this.removeItem = removeItem;
		this.search = search;
		this.setViewMode = setViewMode;
		this.update = update;

		/*
		 * Private methods
		 */
		this._isValidSearchKey = _isValidSearchKey;
		this._sort = _sort;

		delete options.items;
		if (this.options.orderBy)
			this._sort();

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

		function _isValidSearchKey(key) {
			for (var i=0; i<this.options.searchExcludeFields.length; i++) {
				if (key === this.options.searchExcludeFields[i])
					return false;
			}
			return true;
		}

		function search(text) {
			text = $.trim(text);
			/* Move hidden items into "items" */
			this.items = this.items.concat(this.hiddenItems);
			/* Then,clear "hiddenItems" */
			this.hiddenItems.length = 0;
			if (text) {
				var i = this.items.length;
				while (i--) {
					var item = this.items[i];
					var found = false;
					/* Search all entries in the item */
					for (var key in item) {
						if (this._isValidSearchKey(key)) {
							if (item[key].toLowerCase().indexOf(text.toLowerCase()) != -1) {
								found = true;
								break;
							}
						}
					}
					if (!found) {
						this.hiddenItems.push(this.items[i]);
						this.items.splice(i,1);
					}
				}
			}
			this._sort();
			this.update();
		}

		function addItem(item) {
			this.items.push(item);
			if (this.options.orderBy)
				this._sort();
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
					this._sort();
					this.update();
					return true;
				}
			}
			return false;
		}

		function _sort() {
			var key = this.options.orderBy;
			if (key === null)
				return;
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
