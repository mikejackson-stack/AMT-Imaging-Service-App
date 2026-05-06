// These are embedded in the search results header, with the values
// replaced after the search
//    nSearchResultsCount = 
//    nFirstOrdinal = 
//    nLastOrdinal = 
    
var nDoc = nFirstOrdinal-1;

var simpleNav = 1;
var browser = navigator.appName;
var version = parseInt(navigator.appVersion);
// IE 4 or later is needed to use createTextRange
if ((browser.indexOf("Microsoft") != -1) && (version >= 4))
    simpleNav = 0;

function setCurrentDoc(n) {
    nDoc = n;
    }

function findLinksWithName(links, name)
{   if (links.namedItem)
        return links.namedItem(name);
    for (i = 0; i < links.length; ++i) {
        if (links[i]) {
            if (links[i].name == name)
                return links[i];
            }
        }
}

function findLink(links, name)
{   var ret;
    ret = findLinksWithName(links, name);
    if (ret && ret.length && ret.length > 1)
        return ret[0];
    else
        return ret;
}

function gotoDoc(n) {
    if (n < nFirstOrdinal && document.PrevPageForm) {
        document.PrevPageForm.submit();
        return;
        }
    if ((n > nLastOrdinal) && document.NextPageForm) {
       document.NextPageForm.submit();
       return;
       }
    if ((n > nLastOrdinal) || (n < nFirstOrdinal)) {
        return;
        }

    setCurrentDoc(n);
    link = findLink(document.links, "doc" + nDoc);
    if (!link)
        return;

    // Can also set parent.doc.window.location.href but that sometimes crashes IE
    parent.window.open(link.href, "doc");

    if (link.y)
        // Netscape
        window.scrollTo(0, link.y);
    else
        // IE
        window.scrollTo(0, link.offsetTop + link.offsetHeight + link.offsetParent.offsetTop);

    if (!simpleNav) {
		    var s = document.body.createTextRange();
		    if (s == null) return;
		    s.moveToElementText(link);
		    s.moveEnd("word");
		    s.scrollIntoView(1);
		    s.select();
		    }
    }

function nextDoc() {
    gotoDoc(nDoc+1);
    }
function prevDoc() {
    gotoDoc(nDoc-1);
    }

function initResults() {
    var req;
    req = ""
    if (document.LastSearchForm && document.LastSearchForm.request)
        req = document.LastSearchForm.request.value;
    else if (document.PrevPageForm && document.PrevPageForm.request)
        req = document.PrevPageForm.request.value;
    else if (document.NextPageForm && document.NextPageForm.request)
        req = document.NextPageForm.request.value;

    if (document.SearchForm && document.SearchForm.request)
        document.SearchForm.request.value = req;

    // automatically open the first document
    //if (nFirstOrdinal > 1)
    //    nextDoc();
    }

