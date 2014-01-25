
SmartGrid JQuery Plugin
========================

Author: Filipe Rinaldi
        filipe.rinaldi@gmail.com

Introduction
------------

SmartGrid is a JQuery plugin that presents data in different views (list or tiles) and supports basic features like pagination and search. The plugin has the following features:

- JSON based data input
- Embedded search (_under development_)
- Order by option
- Multi-view (list|tiles)
- Pagination (_under development_)
- Add/remove data during run-time

Demo
----

This [demo][1] page shows some examples of Smart Grid.

Getting Started
---------------

```
<div id="component"></div>

<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
<script src="jquery.smartgrid.min.js"></script>
<script>
$('#component').smartGrid({
    items : [{
                id : 0,
                name : John,
                surname : Doe,
                email: john.doe@email.com,
            },{
                id : 1,
                name : Mary,
                surname : Doe,
                email: mary.doe@email.com,
            }]
});
</script>
```

Options
-------

| Name | Default | Description |
|--------|---------|-------------|
|currentPage|`1`| Set default page|
|fnContent|`null`|Callback used to fill in the item|
|items|`[]`|List of items where each item is a JSON structure |
|itemsPerPage|`'all'`| Number of items per page. The parameter can be a number or `'all'`|
|orderBy|`null`| When set to `null`, the Order elements using the field |
|orderByFields|`[]`| Fields used to order the items. Format: {key: *'field name'*, label: *'Label'*}.<br>Example: {key:'name', label:'Name'}|
|viewMode|`'list'`| One of the following supported view modes: `'list'`, `'tiles'`|
||||

Methods
-------

### addItem(item)
Summary:
> Add an item to the component and update the UI. If the component is currently configured to show the data ordered, then the new item will be inserted in order.

Parameters:
> **item** - Item object to be added to the item list.

Return:
> None.

Example:

```
var sg = $('#component').data('smartGrid'); 
sg.addItem({
    "name" : "Harold",
	"surname" : "Giraffe",
	"email" : "harold@email.co.uk",
	"phone" : "01223 77777"
});
```

### orderBy(key)
Summary:
> Set the elements in ascending order defined by the field 'key'. The UI is updated with the new ordering. The 'key' parameter must be a valid entry in the 'orderByFields' option.

Parameters:
> **key** - Field name used to order the elements.

Return:
> **true** - If key is a valid entry in the 'orderByFields' option.<br>
> **false** - If key is not a valid entry in the 'orderByFields' option.

Example:
```
var sg = $('#component').data('smartGrid');
sg.orderBy('surname');
```

### removeItem(item)
Summary:
> Remove one or more items that match the parameter "item".

Parameters:
> **item** - Dictionary containing key and value.

Return:
> list of items removed.

Example:
```
var sg = $('#component').data('smartGrid'); 
sg.removeItem({
    "key" : "name",
	"value" : "Harold",
});
```

### setViewMode(mode)
Summary:
> Set the view mode.

Parameters:
> **mode** - One of the valid view modes: 'list' or 'tiles'.

Return:
> **true** - Returns true if mode is valid.<br>
> **false** - Returns false if mode is invalid.

Example:
```
var sg = $('#component').data('smartGrid'); 
sg.setViewMode('tiles');
```

  [1]: http://filiperinaldi.github.io/SmartGrid