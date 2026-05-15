// Twisty.js
//
// Copyright (c) 2007 Red Hat, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// Provide a nice interface for creating disclosure triangles in a web page
// To use:
//
// include the twisty.js file in your code:
// <script type="text/javascript" src="twisty.js"></script>
//
// You should also include the two external style sheets:
//
// <link rel="stylesheet" href="twisty.css" type="text/css" media="screen"></link>
// <link rel="stylesheet" href="twisty-print.css" type="text/css" media="print"></link>
//
// When you have a section you wish to expose/hide, put:
//
// <div class="collapsible"><a href="javascript:toggleTwisty('uniqueid');">The Section Title<img class="twisty" src="../resources/img/expanded.gif"></a>
//   <div id="uniqueid">
//     <div>
//       Section Content
//     </div>
//   </div>
// </div>
//
// If you want the section to default to hidden, simpy add this code to the end of the above code snippet. (after the last </div>)
// <script type="text/javascript">
//   hideTwisty('uniqueid');
// </script>

function hideTwisty(id) {
    var el = getElemById(id);

    if (el) {
        setStyle(el, {
            display: 'none'
        });
        var twisty = getElementsByClassName(el.parentNode, "img", "show_hide_expanded")[0];
        if (typeof twisty != "undefined")
            setNewBaseSrc(twisty, 'collapse.gif');
    }
}

function toggleTwisty(id) {
    var el = getElemById(id);
    var twisty = getElementsByClassName(el.parentNode, "img", "show_hide_expanded")[0];
    var twisties = getElementsByClassName(document, "img", "show_hide_expanded");


    for (var i = 0; i < twisties.length; i++) {
        if (twisties[i].src.indexOf('oxygen-webhelp/resources/img/expanded.gif') != -1) {
            setNewBaseSrc(twisties[i], 'expanded.gif');

        } else if (twisties[i].src.indexOf('oxygen-webhelp/resources/img/collapse.gif') != -1) {
            setNewBaseSrc(twisties[i], 'collapse.gif');

        }
    }

    if (el.style.display == "none") {
        if (typeof twisty != "undefined")
            setNewBaseSrc(twisty, 'expanded.gif');

        if (typeof Effect != "undefined") {
            Effect.toggle(id, "Slide", {
                duration: .4
            });
        } else {
            setStyle(el, {
                display: 'block'
            });
        }
    } else {
        if (typeof twisty != "undefined")
            setNewBaseSrc(twisty, 'collapse.gif');

        if (typeof Effect != "undefined") {
            Effect.toggle(id, "Slide", {
                duration: .4
            });
        } else {
            setStyle(el, {
                display: 'none'
            });
        }
    }
}


function getElementsByClassName(oElm, strTagName, strClassName) {
    var arrElements = (strTagName == "*" && document.all) ? document.all : oElm.getElementsByTagName(strTagName);
    var arrReturnElements = new Array();
    strClassName = strClassName.replace(/\-/g, "\\-");
    var oRegExp = new RegExp("(^|\\s)" + strClassName + "(\\s|$)");
    var oElement;
    for (var i = 0; i < arrElements.length; i++) {
        oElement = arrElements[i];
        if (oRegExp.test(oElement.className)) {
            arrReturnElements.push(oElement);
        }
    }
    return (arrReturnElements);
}

function getElemById(aID) {

    if (document.getElementById)
        return document.getElementById(aID);

    return document.all[aID];
}

function setStyle(element, style) {
    for (var name in style) {
        var value = style[name];
        element.style[name] = value;
    }
    return element;
}

function setNewBaseSrc(ele, newBaseSrc) {
    var dirPath = ele.src.replace(/[^\/]*$/, '');
    ele.setAttribute('src', dirPath + newBaseSrc);
}