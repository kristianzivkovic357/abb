
function formirajQuery(query,req)
{
	query={"$and":[]}
	if(req.cena[0]>req.cena[1])req.cena=swap(req.cena)
	//var arr=[];
	//var obj={};
	if((typeof(req.cena[0])=='number')&&(typeof(req.cena[1])=='number'))
	{
		query.$and.push({"cena":{$gte:req.cena[0]}},{"cena":{$lte:req.cena[1]}})
	}
	if(req.kvadratura[0]<req.kvadratura[1])req.kvadratura=swap(req.kvadratura)
	if((typeof(req.kvadratura[0])=='number')&&(typeof(req.kvadratura[1])=='number'))
	{
		query.$and.push({"kvadratura":{$gte:req.kvadratura[0]}},{"kvadratura":{$lte:req.kvadratura[1]}});
	}
	var swti=1;
	for(i in req.brojsoba)
	{
		if(typeof(req.brojsoba[i])!='number')
		{
			swti=0;break;
		}
	}
	if(swti)
	{
		query.$and.push({brojsoba:{$in:req.brojsoba}});
	}
	//console.log(query.$and);
	return query;

	
}
function swap(a)
{
	var temp=a[0];
	a[0]=a[1];
	a[1]=temp;
	return a;
}
module.exports={formirajQuery}