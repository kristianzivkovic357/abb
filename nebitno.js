var request=require('request');

request("https://api.4zida.rs/v3/apartments?for=sale&page=1&sort=createdAt",function(err,resp,body)
{
    console.log(JSON.parse(body).items);
    console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    request("https://api.4zida.rs/v3/apartments?for=sale&page=2&sort=createdAt",function(err,resp,pp)
    {
        console.log(JSON.parse(pp).items);
    })
})