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
		this.setPage = setPage;
		this.setViewMode = setViewMode;
		this.update = update;

		/*
		 * Private methods
		 */
		this._isValidSearchKey = _isValidSearchKey;
		this._paginationUpdate = _paginationUpdate;
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

		this.widgetPagination = element.find('ul').eq(1);
		this.widgetPagination.data('smartGrid', this);
		this._paginationUpdate();
		this.widgetPagination.click(function (event){
			var sg = $(this).data('smartGrid');
			var target = event.target;
			var page = $(target).data('page');
			sg.setPage(page);
		})

		/*
		 * Methods implementation
		 */
		function setPage(page) {
			if (this.options.itemsPerPage == 'all')
				return;
			if (page === 'next') {
				this.options.currentPage++;
			} else if (page === 'prev') {
				this.options.currentPage--;
			} else if (_isInteger(page)) {
				this.options.currentPage = page;
			} else {
;;;				throw "Error: Invalid page option";
				return;
			}

			/* Check limits */
			if (this.options.currentPage >= this.pageCount)
				this.options.currentPage = this.pageCount - 1;
			else if (this.options.currentPage < 0)
				this.options.currentPage = 0;

			this._paginationUpdate(); /* TODO: This is overkill. We should update the active/disabled directly */
			this.update();
		}

		function _paginationUpdate() {
			var itemsPerPage;
			if (this.options.itemsPerPage === 'all')
				itemsPerPage = this.items.length + this.hiddenItems.length;
			else
				itemsPerPage = this.options.itemsPerPage;
			this.pageCount = Math.ceil(this.items.length / itemsPerPage);
			this.widgetPagination.empty();
			var selection="";
			/* Create the 'previous' entry */
			if (this.options.currentPage == 0)
				selection = "disabled"
			$('<li class="'+selection+'"><a data-page="prev" href="#">&laquo;</a></li>').appendTo(this.widgetPagination);
			/* Create number items */
			for (var i=0; i<this.pageCount; i++) {
				if (i == this.options.currentPage)
					selection="active";
				else
					selection="";
				$('<li class="'+selection+'"><a data-page="'+i+'" href="#">'+(i+1)+'</a></li>').appendTo(this.widgetPagination);
			}
			/* Create the 'next' entry */
			if (this.options.currentPage == (this.pageCount - 1))
				selection = "disabled"
			$('<li class="'+selection+'"><a data-page="next" href="#">&raquo;</a></li>').appendTo(this.widgetPagination);
		}

		function update() {
			if (this.options.itemsPerPage === 'all') {
				var first = 0;
				var last = this.items.length - 1;
			} else {
				var first = this.options.itemsPerPage * this.options.currentPage;
				var last = first + this.options.itemsPerPage - 1;
				if (last >= this.items.length)
					last = this.items.length - 1;
			}
			this.contents.empty();
			for (var i=first; i<=last; i++) {
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
			this._paginationUpdate();
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
			if (removed.length != 0) {
				this._paginationUpdate();
				this.update();
			}
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

		function _isInteger(value) {
			return ((typeof value !== 'number') || (value % 1 !== 0)) ? false : true;
		};
	};
})(jQuery);
