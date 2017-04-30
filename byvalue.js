
var NoviOglasi=[1,1,1,1,1];
var cenalow=1;
var cenahigh=1;
var kvadraturalow=2;
var kvadraturahigh=3
var start=0;
var end=NoviOglasi.length;
var piv;
var levo,desno;
var temp;
var soll=0,sold=NoviOglasi.length
start=soll;
end=sold;
while(start<end)
{
	piv=Math.floor((start+end)/2)
	if(temp==piv)break;
	//if(end-start<=1)break;
	if(NoviOglasi[piv]>cenalow)end=piv;
	else if(NoviOglasi[piv]<cenalow)start=piv
	else end=piv;
	temp=piv;
if(NoviOglasi[piv]>=cenalow)levo=piv
}


start=soll-1;
end=sold;
temp=-1;

while(start<end)
{
	piv=Math.ceil((start+end)/2)
	if(temp==piv)break;
	//if(end-start<=1)break;
	if(NoviOglasi[piv]>cenahigh)end=piv;
	else if(NoviOglasi[piv]<cenahigh)start=piv
	else start=piv;
	temp=piv;
	if(NoviOglasi[piv]<=cenahigh)desno=piv;

}
soll=levo;
sold=desno;
levo=undefined;
desno=undefined;
start=soll;
end=sold;
temp=-1;
while(start<end)
{
	piv=Math.floor((start+end)/2)
	if(temp==piv)break;
	//if(end-start<=1)break;
	if(NoviOglasi[piv]>kvadraturalow)end=piv;
	else if(NoviOglasi[piv]<kvadraturalow)start=piv
	else end=piv;
	temp=piv;
if(NoviOglasi[piv]>=kvadraturalow)levo=piv
}
console.log(levo);
start=soll;
end=sold;
temp=-1;
console.log(start,end)
while(start<end)
{
	piv=Math.ceil((start+end)/2)
	if(temp==piv)break;
	//if(end-start<=1)break;
	if(NoviOglasi[piv]>kvadraturahigh)end=piv;
	else if(NoviOglasi[piv]<kvadraturahigh)start=piv
	else start=piv;
	temp=piv;
	if(NoviOglasi[piv]<=kvadraturahigh)desno=piv
}
soll=levo;
sold=desno;
console.log(soll,sold)