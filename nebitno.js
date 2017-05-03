var req = require('request');
var fs = require('fs');
for(var i=0;i<5;i++)
{
//console.log('abccdd');
//console.log('\033[2J');
}
var body=
{
    ptId:[],
cityId:1,
structure:	[],
filed:[],
floor:[],
furnished:[],
ceiling:[],
furnishingArray:[],
bldgOptsArray:[],
heatingArray:[],
parkingArray:[],
petsArray:[],
joineryArray:[],
yearOfConstruction:[],
otherArray:[],
polygonsArray:[],
currentPage:1,
resultsPerPage:20,
rentOrSale:"r",
sort:"datedsc",
avFrom:false,
minPrice:null,
maxPrice:null,
minSize:null,
maxSize:null
}
/*req.post({
   url: 'https://cityexpert.rs/api/Search',
   headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
     ' Host': 'cityexpert.rs',
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
    'Accept': "application/json, text/plain",
    'Accept-Language': "en-US",
    'Accept-Encoding': "gzip",
    'Referer': 'https://cityexpert.rs/izdavanje-stanova-beograd',
    'Content-Type': 'application/json',
    'Content-Length': 503,
    'Cookie': "_ga=GA1.2.16241655.1487581215; _gid=GA1.2.1769251119.1493840001; _dc_gtm_UA-61103808-1=1; _ceg.s=ope6bk "
       
   },
   body:JSON.stringify(body),
   method: 'POST'
  },
  function (e, r, body) {
      console.log(body);
      if(e)console.log(e);
});*/
req.get({
    url:"https://cityexpert.rs/izdavanje-stanova-beograd?currentPage=3",
    headers:
    {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36'
    }
} ,function(err,res,bodu)
{
    console.log(bodu);
})

