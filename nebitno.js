var req = require('request');
var fs = require('fs');

req.post({
   url: 'http://www.cityexpert.rs/prodaja/stan/23709/dvoiposoban-dr-ivana-ribara-novi-beograd',
   headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
      'Content-Type' : 'application/x-www-form-urlencoded',
       
   },
   method: 'POST'
  },
  function (e, r, body) {
      console.log(r);
    fs.writeFile("resp.txt", body, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 
  });