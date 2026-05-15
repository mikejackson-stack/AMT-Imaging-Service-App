	
<!--
function loadCMSURL(testid){

	var index = testid.indexOf("http://");
	var indexMenu = testid.indexOf("menuitem");

	//if the testid start with http:// open in a new window else if menuitem open in the same window.
	 if (indexMenu==0)
	{

		var the_url = document.URL;
		var name = the_url.indexOf("/site");
		var domain_start = name + 6;
		var without_resource = the_url.substring(domain_start, the_url.length);
		var newIndex = without_resource.indexOf("/");

		 if (newIndex > -1)
			 without_resource = without_resource.substring(0,newIndex);

		 if (without_resource == '')
			{
				var without_resource = the_url.substring(the_url.indexOf("//")+2, the_url.indexOf("."));
			}
		
		 var newURL = "/portal/site/" + without_resource + "/" + testid ;
		 if (newURL.indexOf('?portlet_id=') != -1)
			{
				var abcid = newURL.substring(newURL.indexOf('/?portlet_id=')+13);	
				newURL += '&root_portlet_id=' + abcid;	
			//	alert(newURL)
			}
		 window.location= newURL;
	}
	if (index == 0)
	{
	var picWidth =screen.width;
	var picHeight =screen.height;
	window.open(testid,'new', 'location=yes,menubar=yes,toolbar=yes,scrollbars=yes,resizable=yes,left=0,top=0,width='+picWidth+',height='+picHeight);
	}



 }

function loadStaticURL(testid){

             var the_url = document.URL;

             var name = the_url.indexOf("/portal");

             var domain_start = name + 6;

             var without_resource = the_url.substring(0, name);

             

             window.open(without_resource + testid);

            }


function fnTellFriend()
{
	window.open('/portal/beans/feedbackpage/jsp/getFeedback.jsp?option=Tell','Tell A Friend','HEIGHT=450,WIDTH=450,status=1,resizable=0,scrollbars=1');	
}

function shareFeedback(strOption,strSection)
{
	window.open('/portal/beans/feedbackpage/jsp/getFeedback.jsp?option='+strOption+'&sectionName='+strSection,'Feedback','HEIGHT=450,WIDTH=450,status=1,resizable=0,scrollbars=1');	
}

function doExpand(){

}

function OpenNewWindow(voucherlocation,url){

        var loc = escape(location.href);
        var siteDNS = loc.substring(loc.indexOf('/site/')+6, loc.indexOf('/', loc.indexOf('/site/')+6));
        //alert("siteDNS "+ url+'&voucherlocation='+voucherlocation+'&site_dns='+siteDNS+'&referer='+loc);
        window.open(url+'&voucherlocation='+voucherlocation+'&site_dns='+siteDNS+'&referer='+loc,'PrintVoucher','HEIGHT=600,WIDTH=700,status=1,resizable=0,scrollbars=1');

}


/*function IGEOpenLink(selObj)
{
	
	if(selObj.options.length >0){
		if (selObj.options[selObj.selectedIndex].value != "" && selObj.options[selObj.selectedIndex].value != -1)
		{
			window.open(selObj.options[selObj.selectedIndex].value);
			selObj.selectedIndex = 0;
		}
	}

}*/
function IGEOpenLink(selObj)
{
	if(selObj.options.length >0){
		if (selObj.options[selObj.selectedIndex].value != "" && selObj.options[selObj.selectedIndex].value != -1)
		{
			arrobj = selObj.options[selObj.selectedIndex].value.split("^");
			if (arrobj[1]=="self") {
				location.href=arrobj[0];
			}
			else{
				window.open(arrobj[0]);
				selObj.selectedIndex = 0;
			}
		}
	}

}


function openPdf(pdfUrl)
{

window.open(pdfUrl,'newWin','toolbar=no,scrollbars=yes,resizable=yes');

}

function DisplayImage(picURL,picHeight,picWidth,picTitle){
picWidth=750;
picHeight=550;
window.open(picURL,'newWin','toolbar=no,scrollbars=yes,resizable=yes,left=0,top=0,width='+picWidth+',height='+picHeight);
}

function PopupImage(picURL,picHeight,picWidth,picTitle){
newWindow=window.open(picURL,'newWin','toolbar=no,width='+picWidth+',height='+picHeight);
newWindow.document.write('<html><head><title>'+picTitle+'<\/title><\/head><body background="'+picURL+'"><\/body><\/html>');
newWindow.resizeBy(picWidth-newWindow.document.body.clientWidth,picHeight-newWindow.document.body.clientHeight);
newWindow.focus();
}
//-->
