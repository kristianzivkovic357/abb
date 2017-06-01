var express=require('express');
var session=require('client-sessions');
var bodyParser = require('body-parser');
var app=express();
var mongo=require('./mongo');
var async=require('async')
var ObjectId = require('mongodb').ObjectId; 
var exec=require('child_process').exec;
//var sender=require('./sender.js');
//var sql=require('./sql.js');
var child = exec('node ./senderb.js');
child.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
});
child.stderr.on('data', function(data) {
    console.log('stderr: ' + data);
});
child.on('close', function(code) {
    console.log('closing code: ' + code);
});
app.use(session({
  cookieName: 'session',
  secret: 'Vojvoda*?od?!Vince357',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

function swap(items, firstIndex, secondIndex){
  var temp = items[firstIndex];
  items[firstIndex] = items[secondIndex];
  items[secondIndex] = temp;
}
function partition(items, left, right,sta) {

  var pivot   = items[Math.floor((right + left) / 2)],
  i       = left,
  j       = right;


  while (i <= j) {


    switch(sta) {
      case 'jeft': 
      while (Number(items[i].cena) < Number(pivot.cena)) i++;
      while (Number(items[j].cena) > Number(pivot.cena)) j--;
      break;
      case 'skup': 
      while (Number(items[i].cena) > Number(pivot.cena)) i++;
      while (Number(items[j].cena) < Number(pivot.cena)) j--;
      break;
      case 'manje': 
      while (Number(items[i].kvadratura) < Number(pivot.kvadratura)) i++;
      while (Number(items[j].kvadratura) > Number(pivot.kvadratura)) j--;
      break;
      case 'vece': 
      while (Number(items[i].kvadratura) > Number(pivot.kvadratura)) i++;
      while (Number(items[j].kvadratura) < Number(pivot.kvadratura)) j--;
      break;
    }

    if (i <= j) {
      swap(items, i, j);
      i++;
      j--;
    }
  }

  return i;
}
function quickSort(sta,items, left, right) {

  var index;

  if (items.length > 1) {

    left = typeof left != "number" ? 0 : left;
    right = typeof right != "number" ? items.length - 1 : right;

    index = partition(items, left, right,sta);

    if (left < index - 1) {
      quickSort(sta,items, left, index - 1);
    }

    if (index < right) {
      quickSort(sta,items, index, right);
    }

  }

  return items;
}



app.use(function(req, res, next) 
{/*
  if (req.url=='/') {
    if(req.session.user)
    { 
      res.writeHead(302,{'Location':'home'})
      next();
    }
  }*/
  if((req.url!='/')&&(req.url!='/login')&&(req.url!='images/no-image.jpg')&&(req.url!='/register')&&(req.url!='/css')&&(req.url!='/endpoint')&&(req.url!='/landing')&&(req.url.indexOf('/home'))&&(req.url!='/radio'))
  {
    console.log('u middle');
    console.log(req.session.user)
    if(req.session.user)
    {      
      next();
    }
    else
    {
      console.log('Nema sesiju')
      if(req.headers.aplikacija) {
        res.end('NO_SESSION');
      } else {
        res.writeHead(302,{'Location':'/'})
      }
    }

  }
  else next();
});
var db;
mongo.MongoWrapper(function(d)
{
  db=d;//UZIMANJE KONEKCIJE SAMO JEDANPUT;
})

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
app.use(bodyParser());
app.get('/register',function(req,res)
{
  res.sendFile('views/register.html',{root:__dirname});
})
app.get("/login",function(req,res)
{
  res.sendFile('views/login.html',{root:__dirname});
})
app.get('/',function(req,res)
{
  res.sendFile('views/index.html',{root:__dirname});
})
app.get("images/no-image.jpg",function(req,res)
{
  res.sendFile('no-image.jpg',{root:__dirname});
})
app.get("/landing",function(req,res)
{
  res.sendFile('/images/landing.jpg',{root:__dirname});
})
app.get("/radio",function(req,res)
{
  res.sendFile('ikon.png',{root:__dirname});
})
app.get("/load",function(req,res)
{
  res.sendFile('giphy.gif',{root:__dirname});
})
app.get("/",function(req,res)
{
  res.end('Under construction');
})
app.get("/json",function(req,res)
{
  var opstine=db.collection('opstine');
  opstine.find({},{naziv:true}).toArray(function(err,r)
  {
   var a = [];
   for(var i = 0;i<r.length;i++) a.push(r[i].naziv);
    res.end(JSON.stringify(a));
})

  
})
app.post('/register',function(req,res)
{
  console.log('REGISTER');
  if((req.body.password==req.body.pass2)&&(req.body.password)&& req.body.email)
  {
   var users=db.collection('users');
    	//sql.select('SELECT * FROM users WHERE email='+'\''+req.body.email+'\''+' AND password='+'\''+req.body.password+'\''+';',function(re)//moze biti da username i password moraju pod navodnike
    //	{
      users.find({"email":req.body.email,"password":req.body.password},{}).toArray(function(err,re)
      {
        if(re.length)
        {
          console.log('IMA TAKVOG USERA')
          if(req.headers.aplikacija) {
            console.log('aplikacija')
            res.send('-1');
          } else {
            res.writeHead(302,{'Location':'/register'})
          }
          res.end();
        }
        else
        {
          console.log('Nema usera');
          var obj={};obj.email=req.body.email;obj.password=req.body.password;
          req.session.user = obj;
          console.log(obj)
          users.insert(obj,function(err,r)
          {
            if(!err)
            {
             console.log('create user:'+req.body.email);
             if(req.headers.aplikacija) {
              console.log('aplikacija')
              res.send('1');
            } else {
              res.writeHead(302,{'Location':'/home'})
            }
            res.end();
          }
          else console.log(err);
        });
        }
      })

    }
    else 
    {
      console.log('NE VALJA ')
      if(req.headers.aplikacija) {
        console.log('aplikacija')
        res.send('-2')
      } else {
        res.writeHead(302,{'Location':'/register'})
      }
      res.end();
    }

  })

app.post("/login",function(req,res)
{
	if((req.body.email)&&(req.body.password))
	{
    console.log('USO')
    var users=db.collection('users');
    users.findOne({"email":req.body.email,"password":req.body.password},{},function(err,r)
    {
      if(err)console.log(err)
       else
       {
        console.log(r);
        if(r)
        {
          req.session.user =Object.assign({},r);
          console.log(req.session.user)
          console.log('send OK')
          if(req.headers.aplikacija) {
            console.log('aplikacija')
            res.send('1')
          } else {
            res.writeHead(302,{'Location':'/home'})
          }
          res.end();
        }
        else
        {
          if(req.headers.aplikacija) {
            console.log('aplikacija')
            res.send('0')
          } else {
            res.writeHead(302,{'Location':'/login'})
          }
          res.end();
        }
      }
    })

  }
})
app.get('/home',function(req,res)
{
  console.log('home');
  console.log(req.session.user);
  res.sendFile('views/oglasi.html',{root:__dirname});
})
app.get('/stari',function(req,res)
{
  console.log('home');
  console.log(req.session.user);
  res.sendFile('views/index1.html',{root:__dirname});
})
app.post('/endpoint', function(req, res){
  var obj = {};

    if(!req.body.namena)
      {
        req.body.namena='Izdavanje';
      }
    if(!req.body.vrsta)
    {
      req.body.vrsta='stan';
    }
  var oglasi=db.collection('oglasi');
  oglasi.find({"ime":new RegExp(req.body.namena+'stan')}).toArray(function(err,r)
  { 

      //console.log(r)
      if(r.length)
      {
        var sortOptions={};
        if(req.body.sort=="ascPrice")
        {
          sortOptions.cena=1;
        }
        else if(req.body.sort=="descPrice")
        {
          sortOptions.cena=-1;
        }
        else if(req.body.sort=='ascSize')
        {
          sortOptions.kvadratura=1;
        }
        else if(req.body.sort=='descSize')
        {
          sortOptions.kvadratura=-1;
        }
        else
        {
          sortOptions.cena=1;
        }
      console.log(sortOptions);
        var databaseIndex=req.body.namena+req.body.vrsta;
        var kolekcija=db.collection(databaseIndex);
        var brojac = 0;
        var andNiz = [];
        andNiz.push({ cena : {$gte:req.body.cena[0],$lte:req.body.cena[1]} });
        andNiz.push({ kvadratura : {$gte:req.body.kvadratura[0],$lte:req.body.kvadratura[1]} });
        var queryy = kolekcija.find({
          $and : andNiz
        });

        queryy.count(function (e, count) {
          queryy.skip(req.body.scroll*18-18).sort(sortOptions).limit(18).toArray(function(err,re){
            console.log(re);
              var solv = {};
              solv.count = count;
              solv.oglasi = re;
              solv.session = req.session.user ? 1:0;
              console.log(solv);
              res.send(JSON.stringify(solv))
            
          })

        })
      }

    });

});
app.post('/alertpoint',function(req,res)
{
  res.header('Access-Control-Allow-Credentials', 'true');
  console.log(req.session);
  if(req.session.user.email)
  {
    var alerts=db.collection('alerts');
    console.log(req.body)
    var obj={}
    obj.email=req.session.user.email;
    obj.cenalow=req.body.cena[0];
    obj.cenahigh=req.body.cena[1];
    obj.kvadraturalow=req.body.kvadratura[0];
    obj.kvadraturahigh=req.body.kvadratura[1];
    obj.brojsoba=req.body.brojsoba;
    obj.vrsta=req.body.vrsta;
    obj.lokacija=req.body.lokacija;
    obj.namena=req.body.namena;
    obj.nazivAlerta=req.body.ime;
    console.log(obj);
    console.log('ovde sam');
    alerts.insert(obj,function(err)
    {
      if(err) {
        console.log(err)
      } else {
        res.end('1')
      }
    })
  }
  else console.log('ALERTPOINTU FALI SESIJA KORISNIKA');
})
app.post('/getalerts', function(req,res) {
  var alerts=db.collection('alerts');
  console.log(req.session.user.email);
  alerts.find({"email":req.session.user.email}).toArray(function(err,odg) {
    if(err)console.log(err);
    else
    {
      res.send(odg);
      res.end();
    }
  });
});
app.post('/deletealert', function(req,res) {
  var alerts=db.collection('alerts');
  console.log(req.session.user.email);
  //console.log(req);
  //sql.select('delete FROM alerts WHERE email="'+req.session.user[0].email+'" AND id = '+req.body.id,function(odg) {
    console.log('delete')
    console.log(req.body);
    var id = req.body.id;       
    var o_id = new ObjectId(id);
    alerts.deleteOne({"email":req.session.user.email,"_id":o_id},function(err,odg)
    {
      if(err)console.log(err)
        else
        {
          console.log('deleted');
          res.send(odg);
          res.end();
        }
      });
  });
app.post('/givealerts',function(req,res)
{
  //console.log('POSLAO SAM')
  //console.log(req.session.user.email);
  var alerts=db.collection('alerts');
  var matching=db.collection('matching');
  console.log(req.body);
  //res.header('Access-Control-Allow-Credentials', 'true');
  //sql.select('SELECT * FROM alerts WHERE email=\''+req.session.user[0].email+'\'',function(odg)
  //{
    matching.find({"idalert":new ObjectId(req.body.idOfAlert)}).toArray(function(err,odg)
    {
      console.log(odg);

      if(odg.length)
      {
         var resp=[];
          
          async.each(odg,function(match,callback)
          {
            var oglasi= db.collection(match.websitename);//OOV JE USTVARI KOJA TABELA SE UZIMA
            oglasi.find({"link":match.idogl}).toArray(function(err,objToSend)
            {
              resp.push({"seen":match.seen,"contentOfAdvert":objToSend[0]});
              callback();
              //samo gledam kad je kraj
            })
            match.seen=1;
            matching.update({"_id":new ObjectId(match._id)},match,function(err,resp)
            {
              if(err)console.log(err);
            })
            /*matching.find({"idalert":odg[i].id}).toArray(function(err,r) {
              var wer=[];
              async.each(r,function(j,call) {
                console.log('async');
                wer.push(Object.assign({},lk[0]));
                call()
              },function(err)
              {
                console.log('end');
                console.log(wer);
                      //res.send(wer);
                      //res.end();
                    })

            });*/
          
        
        },function(err)
        {
          res.send(resp);
          res.end();
        })
      }
      else
      {
        console.log("NISTA NIJE PRONADJENO");
        res.end();
      }
    })

  })
app.get('/logout',function(req,res)
{
  if(req.session.user) delete req.session.user;
  if(req.headers.aplikacija) {
    console.log('aplikacija')
    res.send('1')
  } else {
    res.writeHead(302,{'Location':'/login'})
  }
  res.end();

})
app.get('/css',function(req,res){
 res.sendFile('css/style.css',{root:__dirname});
});