var async=require('async')
var mongo=require('./mongo');
var a=[1,2,3];
var br=0;
var db;
var pq=0;
function getDbConnection()
{
    mongo.MongoWrapper(function(dbCon)
    {
        if(!pq){db=dbCon;pq=1;poziv();}
        else
        {
            db.close();
            db=dbCon;
        }
       
    })
}
getDbConnection();
var arr=["Petlovo Brdo","Rakovica","Beograd","Srbija"]
function poziv()
{
    var coll= db.collection('Izdavanjestan');
    var obj={$all:arr}
    var query={};
    query.lokacija=obj;
    console.log(query)
    coll.find(query).toArray(function(err,res)
    {
        if(err)console.log(err)
        console.log(res);
    })
}



