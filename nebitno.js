var request=require('request');
var mongo=require('./mongo');
mongo.MongoWrapper(function(db)
{
    var reqObj=
    {
      "$oid":"592834ea665d5700049265db"
    }
var matching =db.collection('matching');
matching.find({"idalert":mongo.ObjectId('592834ea665d5700049265db')}).toArray(function(err,odg)
    {
        console.log(err);
        console.log(odg);
    })
})
console.log((JSON.stringify(['kure','palac'])));