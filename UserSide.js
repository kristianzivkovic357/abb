var express=require('express');
var session=require('client-sessions');
var bodyParser = require('body-parser');
var app=express();
var mongo=require('./mongo');
var async=require('async')
var tools=require('./tools');
var nodemailer=require('nodemailer');
//var sender=require('./sender.js');
//var sql=require('./sql.js');
app.use(session({
  cookieName: 'session',
  secret: 'Vojvoda*?od?!Vince357',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));
 var transporter = nodemailer.createTransport({
        service: 'Gmail',
        port:465,
        secure:true,
        auth: {
            user: 'kristiano9611@gmail.com', // Your email id
            pass: 'milica357zivkovic' // Your password
        }
    });

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

function SendEmailConfirmation(email)
{
  var mailOptions = {
    from: 'kristiano9611@gmail.com>', // sender address
    to: email, // list of receivers
    subject: 'Potvrda naloga', // Subject line
    text: 'potvrda nalgoa' //, // plaintext body
    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
};
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        
    }else{
        console.log('Message sent: ' + info.response);
    };
});
}

app.use(function(req, res, next) 
{
  //console.log('fefefe')
  if((req.url!='/login')&&(req.url!='/register')&&(req.url!='/css'))
    {
      console.log('u middle');
      console.log(req.session.user)
      if(req.session.user)
        {
          next();
        }
        else
        {
          res.writeHead(302,{'Location':'/login'})
          res.end();
        }

    }
    else next();
});
var db;
mongo.MongoWrapper(function(d)
{
  db=d;//UZIMANJE KONEKCIJE SAMO JEDANPUT;
})
app.listen(3030,function(req,res)
{
  console.log('Server listening on port:3030');
})
app.use(bodyParser());
app.get('/register',function(req,res)
    {
      res.sendFile('views/register.html',{root:__dirname});
    })
app.get("/login",function(req,res)
  {
      res.sendFile('views/login.html',{root:__dirname});
  })
app.get("/image",function(req,res)
  {
      res.sendFile('no-image.jpg',{root:__dirname});
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
          console.log('IMA TAKVOG USERA');
          res.writeHead(302,{'Location':'/register'});
          res.end(0);
        }
        else
        {

          console.log('Nema usera');
          var obj={};obj.email=req.body.email;obj.password=req.body.password;obj.activated=false;
          
          console.log(obj)
         users.insert(obj,function(err,r)
         {
            if(!err)
            {
               console.log('create user:'+req.body.email);
               res.writeHead(302,{'Location':'/home'})
               res.end();
            }
            else console.log(err);

         });
         delete obj.activated;
         delete obj._id;

         req.session.user = obj;
         SendEmailConfirmation(obj.email);

        }
      })

    }
    else 
    {
      console.log('NE VALJA ')
      res.writeHead(302,{'Location':'/register'})
      res.end()
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
  				//console.log(req.session.user)
         res.writeHead(302,{'Location':'/home'})
         res.end();
       }
       else
       {

        res.writeHead(302,{'Location':'/login'})
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
	res.sendFile('views/index.html',{root:__dirname});
})
app.post('/endpoint', function(req, res){
  var obj = {};
  console.log(req.body)
  var oglasi=db.collection('oglasi');
 // sql.select('SELECT * FROM oglasi WHERE ime LIKE "%'+req.body.namena+'stan%"',function(r)//UMESTO STAN IDE VRSTA KOJA TREBA DA SE SALJE SA FRONTA
 // {
    oglasi.find({"ime":new RegExp(req.body.namena+req.body.vrsta)}).toArray(function(err,r)
    {
      
      
    if(r.length)
    {
      var wer1 =[];
      
      var DatabaseIndex=req.body.namena+req.body.vrsta;
      var kolekcija=db.collection(DatabaseIndex);
        var wer =[];
        var brojac = 0;
        var query_object={};
        query_object=tools.formirajQuery(query_object,req.body);
       console.log(query_object);return;
       
        //sql.select('SELECT * FROM '+r[DatabaseIndex].ime+' WHERE'+cond1 +cond2 +cond3+cond4+cond5+cond6+' ORDER BY ids DESC LIMIT '+Piece*20+20+' OFFSET '+Piece*20,function(re) { //brojevi sa . u bazi ne rade!
         kolekcija.find(
          query_object
          //$or:[{grad:req.body.lokacija},{opstina:req.body.lokacija},{mesto:req.body.lokacija}]
          
        ,{"limit":req.body.scroll*20,"skip":req.body.scroll*20-20}).sort({cena:1}).toArray(function(err,re)
        {
          if(err)console.log(err);
          async.each(re,function(j,call) {
            if(j.slika.toLowerCase().search('http') == -1 && j.slika.toLowerCase().search('www') == -1) {
              j.slika = 'image';
             
            }
             wer.push(j);
             call();
           
           },function(err)
           {
            console.log(wer);
              res.send(JSON.stringify(wer))
           })
        })
        
     // }
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
  console.log(obj);
  console.log('ovde sam');
  alerts.insert(obj,function(err)
  {
    if(err)console.log(err)
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
  //sql.select('DELETE FROM alerts WHERE email="'+req.session.user[0].email+'" AND id = '+req.body.id,function(odg) {
    console.log(req.body);
    alerts.deleteOne({"email":req.session.user.email,"id":req.body._id},function(err,odg)
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
  console.log('POSLAO SAM')
  /*console.log(req.session.user[0].email);
  var alerts=db.collection('alerts');
  var matching=db.collection('matching');
  //res.header('Access-Control-Allow-Credentials', 'true');
  //sql.select('SELECT * FROM alerts WHERE email=\''+req.session.user[0].email+'\'',function(odg)
  //{
    alerts.find({"email":req.session.user[0].email}).toArray(function(err,odg)
    {
    if(odg.length)
    {
      for(var i=0;i<odg.length;i++)
      {
        //sql.select('SELECT * FROM matching WHERE idalert='+odg[i].id,function(r)

        {
            var wer=[];
           async.each(r,function(j,call)
           {
              {
                //var query='SELECT * FROM '+j.websitename+' WHERE ids='+j.idogl;
                //console.log(query);
                //break;
                  //sql.select('SELECT * FROM '+j.websitename+' WHERE ids='+j.idogl,function(lk)

                  {
                    wer.push(Object.assign({},lk[0]));
                    call()
                  })
              }
            },function(err)
            {
              console.log(wer);
              res.send(wer);
            })
        })
      }
    }
  })*/
  
})
app.get('/logout',function(req,res)
{
  if(req.session.user) delete req.session.user;
  res.writeHead(302,{'Location':'/login'})
  res.end();
 
})
app.get('/css',function(req,res){
   res.sendFile('css/style.css',{root:__dirname});
});