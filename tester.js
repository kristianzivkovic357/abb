var request= require('request');
var fs= require('fs');

function rp(myPlace)
{
    
    request("https://api.4zida.rs/v3/places?withAds=true",function(err,resp,places)
    {
        places=JSON.parse(places);
        for(var i in places)
        {
            if(places[i].accentLessTitle.toLowerCase()==myPlace.toLowerCase())
                {
                    console.log("FOUND IT: ");
                    console.log(places[i]);
                }
        }
    })
}
rp("Kosovska Mitrovica");