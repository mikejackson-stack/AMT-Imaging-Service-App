    ICONPATH = '../verticalnav/images/';
    USETEXTLINKS = 1
    STARTALLOPEN = 0
    USEFRAMES = 0
    USEICONS = 0
    WRAPTEXT = 0
    PERSERVESTATE = 1
    foldersTree = gFld(" ", "",false)
    foldersTree.xID = '1';
    
    			aux1 = insFld(foldersTree, gFld("<a href='home.htm' ><b>Home</b></a>"));
    			aux1.xID = '46007c83f27e24224d5724100ec1aa302a4791b589343dd5584f86436c821330';

			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>CT750</b><br>", "discovery_ct750.htm",false));
			aux1.xID = 'ls7xa';
	
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>7.X (VCT, Pro32, 64)</b><br>", "lightspeed7x.htm",false));
			aux1.xID = 'ls7x';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>5.X (Pro16, HP60, RT, Xtra)</b><br>", "lightspeed5x.htm",false));
			aux1.xID = 'ls5x';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>4.X (16-Slice)</b><br>", "lightspeed4x.htm",false));
			aux1.xID = 'ls4x';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>3.X (Ultra)</b><br>", "lightspeed3x.htm",false));
			aux1.xID = 'ls3x';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>2.X (Plus)</b><br>", "lightspeed2x.htm",false));
			aux1.xID = 'ls2x';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>1.X (QX/i)</b><br>", "lightspeed1x.htm",false));
			aux1.xID = 'ls1x';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>BrightSpeed</b><br>", "brightspeed.htm",false));
			aux1.xID = 'bs';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>HiSpeed QX/i</b><br>", "hispeed.htm",false));
			aux1.xID = 'hsqxi';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>Mobile</b><br>", "mobile.htm",false));
			aux1.xID = 'mobile';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>PM</b><br>", "../../5112972/root/data/frameset.htm",false));
			aux1.xID = 'pm';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>Operator Consoles</b><br>", "ct_consoles.htm",false));
			aux1.xID = 'consoles';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>FMI</b><br>", "fmi.htm",false));
			aux1.xID = 'ct-fmi';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>Service Notes</b><br>", "servicenotes.htm",false));
			aux1.xID = 'ct-sn';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>Extras</b><br>", "extras.htm",false));
			aux1.xID = 'ct-extras';
		
			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>ePSTs</b><br>", "http://doNothing",false));
			aux1.xID = 'epst_header';
		
				doc1 = insDoc(aux1, gLnk("S", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>What is an ePST?</b>", "../../epst/CT_Lightspeed_ePST_Announcement.pps"));
				doc1.xID='epst_announcement';
		
				doc1 = insDoc(aux1, gLnk("S", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>LightSpeed 1.X-4.X</b>", "../../epst/lightspeed_epst.pdf"));
				doc1.xID='lightspeed_epst';

				doc1 = insDoc(aux1, gLnk("S", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>ePST Install Note</b>", "../../epst/install_readme.rtf"));
				doc1.xID='install_readme';

			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>Pre-LightSpeed</b><br>", "pre_ls.htm",false));
			aux1.xID = 'pre-lightspeed';

			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>Quick Links</b><br>", "http://doNothing",false));
			aux1.xID = 'links';
							
				doc1 = insDoc(aux1, gLnk("B", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>FCTSE (MKE) Techpubs</b>", "http://www.ct.med.ge.com/tech_pubs/fct/system/fct_home.htm"));
    				doc1.xID='fctse_home';
								
				doc1 = insDoc(aux1, gLnk("B", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>Hino CT Techpubs </b>", "http://jptyoiis01.ap.health.ge.com:8000/ct/"));
    				doc1.xID='hino_techpubs';
								
				doc1 = insDoc(aux1, gLnk("B", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>Beijing CT Techpubs </b>", "http://cnbeiapp06.asia.med.ge.com/bjtp/index.htm"));
    				doc1.xID='beijing_techpubs';
								
				doc1 = insDoc(aux1, gLnk("B", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>Imatron (EBT)</b>", "http://web.am.med.ge.com/htm/LIB.htm"));
    				doc1.xID='imatron';
								
				doc1 = insDoc(aux1, gLnk("B", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>AW</b>", "http://aw-ib.euro.med.ge.com/"));
    				doc1.xID='aw';
								
				doc1 = insDoc(aux1, gLnk("B", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>Common Documentation Library (CDL)</b>", "http://olcweb.olc.med.ge.com:8020/servlet/ClientServletProp?REQ=Enter+Documentation+Library"));
    				doc1.xID='cdl';
								
				doc1 = insDoc(aux1, gLnk("B", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>Coakley-Tech (order CDs, pubs, S/W)</b>", "http://coakleytech.med.ge.com/cgi-win/default.aspx"));
    				doc1.xID='coakley-tech';
									
				doc1 = insDoc(aux1, gLnk("B", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>CT Support Central</b>", "http://supportcentral.ge.com/products/sup_products.asp?prod_id=15768"));
    				doc1.xID='support_central';
									
				doc1 = insDoc(aux1, gLnk("B", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>CEM Home</b>", "http://gein.euro.med.ge.com/idm/index.html"));
    				doc1.xID='cem_home';

    			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>Support</b><br>", "http://doNothing",false));
			aux1.xID = 'support';
									
				doc1 = insDoc(aux1, gLnk("B", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>Share Feedback</b>", "mailto:Judith.Neumiller@ge.com?subject=LS Service Info DVD, Rev 15, Feedback&body=Please enter your comments here:"));
    				doc1.xID='mailto';
									
				doc1 = insDoc(aux1, gLnk("B", "<img src='../images/spacer.gif' height='6' /><INPUT type='image'  src='../verticalnav/images/subListClosedcarat.gif'><b>iTrak - Complaint Handling System</b>", "http://itrak.med.ge.com/"));
    				doc1.xID='itrack';

			aux1 = insFld(foldersTree, gFld("<HR width=170 align='left' style='height: 1px;color: #E0E0E0;' ><b>Forms</b><br>", "../../forms/",false));
			aux1.xID = 'forms';
		
     aux3 = insFld(foldersTree, gFld("<HR width=170 style='height: 1px;color: #E0E0E0;'", "",false))
     aux3.xID = '2';
     initializeDocument()
     if(findObj('8f4f831a869c9b59cbfb1110f84013302a4791b589343dd5584f86436c821330') != null)
     	findObj('8f4f831a869c9b59cbfb1110f84013302a4791b589343dd5584f86436c821330').forceOpeningOfAncestorFolders();


function doSomething()
{

}

function doNothing()
{
//alert('into do nothing')
var abc = location.href;
var dnIndex = 0;
var dnCount = 0
	while (dnCount < 3)
	{
		abc = abc.substring(abc.indexOf("/",dnIndex))
		dnIndex = abc.indexOf("/") + 1;
		dnCount++;
	}
	//alert(abc)
	if (abc.indexOf("?") == -1)
	{
		location.href=abc + "?hdnFavExpand=true";
	}
	else
	{
		location.href=abc + "&hdnFavExpand=true";
	}

}



