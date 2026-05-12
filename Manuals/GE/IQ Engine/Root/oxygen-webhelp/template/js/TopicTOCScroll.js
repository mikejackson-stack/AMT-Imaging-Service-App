//US645: Add scroll bar to "On this page" TOC if it is too long for page
//US647: Add scrollbar to chapter level TOC in webhelp topics


function PGTOC() {
    var $pageTOC = $(".wh_topic_toc");
    var tocHeight = parseInt($pageTOC.height()) + parseInt($pageTOC.css("padding-top")) + parseInt($pageTOC.css("padding-bottom")) + parseInt($pageTOC.css("margin-top")) + parseInt($pageTOC.css("margin-bottom")) + 45;
    
    if (tocHeight < window.innerHeight) {
        $('.wh_topic_toc').addClass('ShortTOC');
    } else {
        $('.wh_topic_toc').addClass('LongTOC');
    }
};



function CHTOC() {
    var $chapterTOC = $(".wh_publication_toc");
    var $BodyTxt = $(".wh_topic_content ");

    //var $chapterTOC = document.getElementById("wh_publication_toc");
    var CHtocHeight = parseInt($chapterTOC.height()) + parseInt($chapterTOC.css("padding-top")) + parseInt($chapterTOC.css("padding-bottom")) + parseInt($chapterTOC.css("margin-top")) + parseInt($chapterTOC.css("margin-bottom")) + 45;
    var BodyHeight = parseInt($BodyTxt.height());
    var WindowHeight = parseInt(window.innerHeight) - 100;
    
   //if (CHtocHeight > window.innerHeight) {
    if (CHtocHeight > WindowHeight){
    if (CHtocHeight > BodyHeight) {
        $('.wh_publication_toc').addClass('LongTOCSticky') .attr("dir", "rtl");
    } 
        if ((CHtocHeight /= 3) > BodyHeight) {
        $('.wh_publication_toc').addClass('LongTOCThirty').attr("dir", "rtl");   
    }
    if ((CHtocHeight /= 2) > BodyHeight) {
        $('.wh_publication_toc').addClass('LongTOCFifity').attr("dir", "rtl");    
    }
    
    
      else
        $('.wh_publication_toc').addClass('LongTOC') .attr("dir", "rtl");
    } else {
        $('.wh_publication_toc').addClass('ShortTOC');
    }
};

;
 
   
 
window.onload = function ScrollTOC() {
    PGTOC() 
    CHTOC()
    
}



let expandBTN = $(".wh_expand_btn") 


window.onload = function ScrollTOC() {
    PGTOC() 
    CHTOC()
}

expandBTN.onclick = function(){  
CHTOC()
}



//let ChapTOC = document.getElementsByClassName("wh-expand-btn")
//ChapTOC.addEventListener("click", CHTOC)

//    var $contentBody = $(".wh_topic_content");
//    var visibleAreaHeight = parseInt($(window).height()) - parseInt($(".wh_footer").outerHeight());
//    var MapTocHeight = parseInt($MapTOCID.height()) + parseInt($MapTOCID.css("padding-top")) + parseInt($MapTOCID.css("padding-bottom")) + parseInt($MapTOCID.css("margin-top")) + parseInt($MapTOCID.css("margin-bottom"));
//    var $MapTOCID = $("#wh_publication_toc");
//      if ((MapTocHeight + topOffset) < $contentBody) {
//        $('.wh_publication_toc').addClass('ShortTOC');
//    } else {
//        $('.wh_publication_toc').addClass('LongMapTOC');    }


