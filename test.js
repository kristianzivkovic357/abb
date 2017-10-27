var request=require('request');
var os=require('os');
console.log(os.totalmem());
request({url:'https://img.halooglasi.com/slike/oglasi/Thumbs/171023/m/blok-63-novodnja-odlican-id-1967-5425599238876-71783789094.jpg"',timeout:2000},function(err,res,body)
{
    if(err)console.log(err);
    console.log(res.statusCode)
    console.log(body);
})