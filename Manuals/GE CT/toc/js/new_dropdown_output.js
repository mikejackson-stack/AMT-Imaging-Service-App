function parseString(string) {
	var tstring = "";	
	// To remove spaces 
	splitstring = string.split(" ");
	for(i = 0; i < splitstring.length; i++)
	tstring += splitstring[i];	
	
	//To remove & 
	splitstring = tstring ;
	tstring = "";
	splitstring = splitstring.split("&");
	for(i = 0; i < splitstring.length; i++)
	tstring += splitstring[i];	
	
	//To remove -
	splitstring = tstring ;
	tstring = "";
	splitstring = splitstring.split("-");
	for(i = 0; i < splitstring.length; i++)
	tstring += splitstring[i];
	
	//To remove \
	splitstring = tstring ;
	tstring = "";
	splitstring = splitstring.split("\\");
	for(i = 0; i < splitstring.length; i++)
	tstring += splitstring[i];
	
	//To remove /
	splitstring = tstring ;
	tstring = "";
	splitstring = splitstring.split("/");
	for(i = 0; i < splitstring.length; i++)
	tstring += splitstring[i];
	
	//To remove " 
	splitstring = tstring ;
	tstring = "";
	splitstring = splitstring.split("\"");
	for(i = 0; i < splitstring.length; i++)	
	tstring += splitstring[i];			
		
	//To remove '	
	splitstring = tstring ;	
	tstring = "";
	splitstring = splitstring.split("\'");
	for(i = 0; i < splitstring.length; i++)		
		tstring += splitstring[i];			
	
	//To remove ; 
	splitstring = tstring ;
	tstring = "";
	splitstring = splitstring.split(";");
	for(i = 0; i < splitstring.length; i++)
	tstring += splitstring[i];		
	
	//To remove ,
	splitstring = tstring ;
	tstring = "";
	splitstring = splitstring.split(",");
	for(i = 0; i < splitstring.length; i++)
	tstring += splitstring[i];		
	 
	return tstring;	
}

function rootpage(obj)
    {
    if(obj.options[obj.selectedIndex].value != 0)
    {
     alert(obj.options[obj.selectedIndex].name);
    window.location.href=obj.options[obj.selectedIndex].value;
   
    }
    }

html = '<!-- ========= BEGIN SELECTOR WITH DISCLAIMER (E01) ========== -->';
dd = parseString(dropdown_label);

html +='<form name="rootpager_' + dd + '" action="actiongoeshere" method="post">';
html +='<label for="drop_down">' + dropdown_label +'</label>';

html +='<select name="' + dd + '" id="' + dd + '" style="width:400px;" onchange="if (this.selectedIndex > 0) window.location.href=this[this.selectedIndex].value;">';
html +='<option value="0">--' + select + '--</option>';	
for(i=0; i<dropdown.length ; i++)
	{
html += '<option value="' + dropdown[i][1] + '" > ' + dropdown[i][0] + ' </option>';
  }
html += '</select> ';

html +='</form>';

document.write(html);


