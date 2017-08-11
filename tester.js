var request= require('request');
var fs= require('fs');
function max(a,b)
{
    return a>b ?a:b
}
function rp(myPlace)
{
    
    request("https://api.4zida.rs/v3/places?withAds=true",function(err,resp,places)
    {
        places=JSON.parse(places);
        var parents=0;
        var parentObj;
        for(var i in places)
        {
            if(places[i].accentLessTitle.toLowerCase()==myPlace.toLowerCase())
                {
                    console.log("FOUND IT: ");
                    console.log(places[i]);
                }
        }
        //console.log(parentObj);
    })
}
rp("Blok 7a");