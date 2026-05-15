/*
	
	The onload and onunload event handlers call readData and saveDataGlobal
	to save the state of the search form so it will be restored the next time the
	form loads.  These functions are implemented in Utilites.js.

	saveDataGlobal saves the form data as a global cookie (one that applies to the
	whole site, not just the folder with the search form).  This ensures that the
	same form data can be recovered when the search form appended to search results.


	updateField() makes it easy to add field searches to a search form.  The onchange
	handler for the field edit control calls updateField(this).  updateField maintains
	a list of (fieldname, value) pairs in fieldTable of the names and values of
	any field criteria on the form.   Each time a field value changes on the form,
	the booleanConditions form variable is updated to reflect the field search.
	
	updateFilters does the same thing with filterTable and a File Conditions
	("xfilter") expression maintained in the hidden fileConditions form variable.
	

*/


// Set up form load and unload events to read or save the cookie with the form data
// This avoids the need to add onload and onunload calls to the body tag of the
// search form.
addEvent(window,"load", readFormState);
addEvent(window,"unload",saveFormState);

// filterTable and fieldTable are used to add support for 
// field searching and date range or filename searching
var filterTable = new Array;
var fieldTable = new Array;

// Add event listener
function addEvent(o,e,f){
	if (o.addEventListener){ o.addEventListener(e,f,true); return true; }
	else if (o.attachEvent){ return o.attachEvent("on"+e,f); }
	else { return false; }
	}

function readFormState()
{	readData('dtSearch.DemoForm', document.SearchForm); 
}

function saveFormState()
{	saveDataGlobal('dtSearch.DemoForm', document.SearchForm);
}

function doSearch() {
    document.SearchForm.submit()
    }


function updateField(ctrl)
{	var fld =  "(" + ctrl.name + " contains (" + ctrl.value + ")) ";
	if (isBlank(ctrl.value))
		fld = "";
	fieldTable[ctrl.name] = fld;
	var req = "";
	var fBlank = true;
	for (f in fieldTable) {
		var item = fieldTable[f];
		if (!isBlank(item)) {
			if (!isBlank(req))
				req = req + " and ";
			req = req + item;
			fBlank = false;
			}
		}
	document.SearchForm.booleanConditions.value = req;
}

function updateDateFilter()
{
	var f= makeDateFilter();
	filterTable["date"] = f;
	updateFilters();
}

function updateFilter(type, ctrl)
{	filterTable[type] = type + " \"" + ctrl.value + "\"";
	updateFilters();
}

function updateFilters()
{	var req = "xfilter(";
	var fBlank = true;
	for (f in filterTable) {
		var item = filterTable[f];
		if (!isBlank(item)) {
			req = req + item;
			fBlank = false;
			}
		}
	if (fBlank)
		document.SearchForm.fileConditions.value = "";
	else
		document.SearchForm.fileConditions.value = req + ")";
}

function makeDateFilter()
{
    if (isFieldBlank(document.SearchForm.StartYear) && isFieldBlank(document.SearchForm.EndYear))
        return ""

    var begin, end;
    var beginMonth, endMonth

    if (isFieldBlank(document.SearchForm.StartMonth))
        beginMonth = "M01";
    else
        beginMonth = document.SearchForm.StartMonth.value;

    if (isFieldBlank(document.SearchForm.EndMonth))
        endMonth = "M12";
    else
        endMonth = document.SearchForm.EndMonth.value;

    if (isFieldBlank(document.SearchForm.StartYear))
        begin = "M01/D01/Y1980";
    else
        begin =  beginMonth + "/" + document.SearchForm.StartYear.value + "/D01";
    if (isFieldBlank(document.SearchForm.EndYear))
        end = "M12/D31/Y2999";
    else
        end =  endMonth + "/" + document.SearchForm.EndYear.value + "/D31";

    var filter;
    filter = "date \"" + begin + "~~" + end + "\"";
    return filter;
    }

function clearDateSearch() {
    document.SearchForm.StartMonth.selectedIndex = 0
    document.SearchForm.EndMonth.selectedIndex = 0
    document.SearchForm.StartYear.selectedIndex = 0
    document.SearchForm.EndYear.selectedIndex = 0
    updateDateSearch()
    }
    
function isBlank(str)
{	if (!str)
		return true;
	if (str.length == 0)
		return true;
	var i;
	for (i = 0; i < str.length; ++i) {
		var ch = str.charCodeAt(i);
		
		if (ch != 32)
			return false;
		}
	return true;
}


function isFieldBlank(theField) {
        if (theField && isBlank(theField.value))
            return true;
        else
            return false;
    }
