
function setLinks(link) {
globalVarLink = link;
//alert(link);

if(document.URL.split('#')[1])
{
   if($("p[title='"+"#"+document.URL.split('#')[1]+"']").next().attr('title'))
   {
      document.getElementById("next").setAttribute("href",$("p[title='"+"#"+document.URL.split('#')[1]+"']").next().attr('title'));
   }
   else
   {
      document.getElementById("next").setAttribute("href",$('div[id=slideshow] p').first().attr('title'));
   }
}
else if($("p[title='"+globalVarLink+"']").next().attr('title'))
{
   document.getElementById("next").setAttribute("href",$("p[title='"+$('div[id=slideshow] p').first().attr('title')+"']").next().attr('title'));
}
else
{
}

if(document.URL.split('#')[1])
{
   if($("p[title='"+"#"+document.URL.split('#')[1]+"']").prev().attr('title'))
   {
      document.getElementById("prev").setAttribute("href",$("p[title='"+"#"+document.URL.split('#')[1]+"']").prev().attr('title'));
   }
   else
   {
      document.getElementById("prev").setAttribute("href",$('div[id=slideshow] p').first().attr('title'));
   }
}
else if($("p[title='"+globalVarLink+"']").next().attr('title'))
{
   document.getElementById("prev").setAttribute("href","index.html");
}
else
{
}
//end set links

}
$(window).load(function(){

var interval = undefined;
$(document).ready(function () {
    interval = setInterval(getNext, 1); // milliseconds
    //$('#next').on('click', getNext);
    //$('#prev').on('click', getPrev);
});



function getNext() {
    var $curr = $('.slideshow p:visible'),
        $next = ($curr.next().length) ? $curr.next() : $('.slideshow p').first();
        //document.getElementById("next").setAttribute("href",$next.innerHTML);
    transition($curr, $next);
    
    //setLinks($(this).attr('href'));
    
}

function getPrev() {
    var $curr = $('.slideshow p:visible'),
        $next = ($curr.prev().length) ? $curr.prev() : $('.slideshow p').last();
        //document.getElementById("next").setAttribute("href",$next.innerHTML);
    transition($curr, $next);
    //setLinks($(this).attr('href'));
}

function transition($curr, $next) {
    clearInterval(interval);
    $next.css('z-index', 2).fadeIn('slow', function () {
        $curr.hide().css('z-index', 0);
        $next.attr('id', 'next');
        $curr.attr('id', 'current');
        $next.css('z-index', 1);
    });
}
});