


/*
	Utility functions based on examples from
	Danny Goodman, "JavaScript and DHTML Cookbook", O'Reilly & Associates
    Copyright 2003 Danny Goodman
    ISBN 0-596-00467-2
    
    For O'Reilly source code re-use policy, see:
    http://www.oreillynet.com/pub/a/oreilly/ask_tim/2001/codepolicy.html
    
*/

// utility function to retrieve a future expiration date in proper format;
// pass three integer parameters for the number of days, hours,
// and minutes from now you want the cookie to expire; all three
// parameters required, so use zeros where appropriate
function getExpDate(days, hours, minutes) {
    var expDate = new Date();
    if (typeof days == "number" && typeof hours == "number" && typeof hours == "number") {
        expDate.setDate(expDate.getDate() + parseInt(days));
        expDate.setHours(expDate.getHours() + parseInt(hours));
        expDate.setMinutes(expDate.getMinutes() + parseInt(minutes));
        return expDate.toGMTString();
    }
}

// utility function called by getCookie()
function getCookieVal(offset) {
    var endstr = document.cookie.indexOf (";", offset);
    if (endstr == -1) {
        endstr = document.cookie.length;
    }
    return unescape(document.cookie.substring(offset, endstr));
}

// primary function to retrieve cookie by name
function getCookie(name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg) {
            return getCookieVal(j);
        }
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) break; 
    }
    return null;
}

// store cookie value with optional details as needed
function setCookie(name, value, expires, path, domain, secure) {
    document.cookie = name + "=" + escape (value) +
        ((expires) ? "; expires=" + expires : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
}

function setGlobalCookie(name, value, expires) {
    document.cookie = name + "=" + escape (value) +
        ((expires) ? "; expires=" + expires : "") +
        "; path=/";
}

// remove the cookie by setting ancient expiration date
function deleteCookie(name,path,domain) {
    if (getCookie(name)) {
        document.cookie = name + "=" +
            ((path) ? "; path=" + path : "") +
            ((domain) ? "; domain=" + domain : "") +
            "; expires=Thu, 01-Jan-70 00:00:01 GMT";
    }
}

// Saves all form data from a single form
function saveData(name, form) {
	var data = form2ArrayString(form);
	var expDate = getExpDate(180, 0, 0);
	setCookie(name, data, expDate);
	}

// Same as saveData but saves data so it is accessible to any page on this web site
function saveDataGlobal(name, form) {
	var data = form2ArrayString(form);
	var expDate = getExpDate(180, 0, 0);
	setGlobalCookie(name, data, expDate);
	}

// Read saved form data
function readData(name, form) {
	var data = getCookie(name);
	string2FormObj(form, data);
}

// Return string with all elements of a multi-select listfunction getMultiSelectList(opt){	var items = new Array();
     for (var i = 0; i < opt.length; i++) {
		if ((opt[i].selected) || (opt[i].checked)) {
			items[items.length] = opt[i].value;
			}
		}
	var strResult = items.join("|");
	return strResult;
}function setMultiSelectList(opt, strVal){    for (var i = 0; i < opt.length; i++) {
		opt[i].selected = false;
		}
	var items = strVal.split("|");	for (var i = 0; i < items.length; ++i) {		var n = items[i];		for (var j = 0; j < opt.length; ++j) {			if (opt[j].value == n)				opt[j].selected = true;			}		}}

/*
     Based on example File From "JavaScript and DHTML Cookbook"
     Published by O'Reilly & Associates, Copyright 2003 Danny Goodman
*/

// Read the name, id, type, and value of one form control element
// as requested by form2ArrayString()
function formObj2String(obj) {
		
	var output = "{";
	if (obj.name) {
		output += "name:'" + obj.name + "',";
	}
	if (obj.id) {
		output += "id:'" + obj.id + "',";
	}
	output += "type:'" + obj.type + "',";
	switch (obj.type) {
		case "radio":
			if (obj.name) {
				obj = document.forms[0].elements[obj.name];
				var radioVal = "value:false,index:-1";
				for (var i = 0; i < obj.length; i++) {
					if (obj[i].checked) {
						radioVal = "value:true,index:" + i;
						i = obj.length;
					} 
				}
				output += radioVal;
			} else {
				output += "value:" + obj.checked;
			}
			break;
		case "checkbox":
			output += "value:" + obj.checked;
			break;
		case "select-one":
			output += "value:" + obj.selectedIndex;
			break;
		case "select-multiple":
			output += "value:'" + escape(getMultiSelectList(obj)) + "'";			// output += "value:" + obj.selectedIndex;
			break;
		case "edit":
		case "text":
		case "textarea":
		case "password":
		case "hidden":
		case "button":
			output += "value:'" + escape(obj.value) + "'";
			break;
		default:
			output += "value:'none'";
			break;
	}
	output += "}\r\n"
	return output;
}

// Convert a passed form reference to a string formatted like
// a JavaScript array of objects
function form2ArrayString(form) {
	if (!form || !form.elements)
		return "";
		
	var elem, lastName = "";
	var output = "[";
	for (var i = 0; i < form.elements.length; i++) {
		elem = form.elements[i];
		// Do not save state of hidden controls
		if  ((elem.type == "hidden") || (elem.type == "button"))
			continue;
		if (elem.name && (elem.name != lastName)) {
			output += formObj2String(form.elements[i]) + ",";
			lastName = elem.name;
		}
	}
	output = output.substring(0, output.length-1) + "]";
	return output;
}

// Distribute form control values from another source to the
// controls in this page's form, whose names/ids match those
// of the original form controls
function string2FormObj(form, str) {
	var elem;
	var objArray;
	if (!form || !str)
		return;

	try {
		objArray = eval(str);
		}
	catch(e) {
		}
	if (!objArray)
		return;
		
	for (var i = 0; i < objArray.length; i++) {
		elem = (objArray[i].name) ? form.elements[objArray[i].name] : document.getElementById(objArray[i].id);
		if (!elem)
			continue;
		var changed = true;
		switch (objArray[i].type) {
			case "radio":
				if (objArray[i].name && objArray[i].value && objArray[i].index >= 0) {
					elem = elem[objArray[i].index];
				}
				elem.checked = objArray[i].value;
				break;
			case "checkbox":
				elem.checked = objArray[i].value;
				break;
			case "select-one":
				elem.selectedIndex = objArray[i].value;
				break;
			case "select-multiple":
				setMultiSelectList(elem, unescape(objArray[i].value));				// elem.selectedIndex = objArray[i].value;
				break;
			// Do not save state of hidden or button controls
			case "hidden":
			case "button":
				changed = false;
				break;
			default:
				elem.value = unescape(objArray[i].value);
				break;
		}
		if (changed && elem.onchange)
			elem.onchange();
			
	}
}

