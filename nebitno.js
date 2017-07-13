var request = require('request');
var links = ['http://google.com', 'http://yahoo.com'];
for (link in links) {
    (function(url) {
        request(url, function() {
            console.log(url);
        });
    })(links[link]);
}