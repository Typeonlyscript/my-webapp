var express = require('express');

var moment = require('moment');
var FormData = require('form-data');
var fetch = require('node-fetch');
var app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
var mysql = require('sync-mysql');
const e = require('express');
const cors = require('cors');
app.use(cors());
const { urlencoded, raw } = require('body-parser');
var con = new mysql(
	{
		host : 'gkdatabase.cwkv3gsp9w51.ap-south-1.rds.amazonaws.com',
		user : 'admin',
		password : 'password',
		database : 'mydb'
	  }
)
/* var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'root',
    password : '',
    database : 'getkaewb_karigar'
  }
}); */
// var knex = require('knex')({
// 	client: 'mysql',
// 	connection: {
// 	  host : '207.174.214.213',
// 	  user : 'getkaewb_getkari',
// 	  password : '7838750375@sS123',
// 	  database : 'getkaewb_karigar'
// 	}
//   });



  
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'gkdatabase.cwkv3gsp9w51.ap-south-1.rds.amazonaws.com',
    user : 'admin',
    password : 'password',
    database : 'mydb'
  }
});

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());
app.use(upload.array());
app.use(express.static('public'));

app.get('/', function (req, res) {
	
/* 	knex('vendor_list')
	.where('id','4962')
	.then(data=>{
		console.log("OK1");
		res.json(data)
	}).catch(err=>res.status(400).json('Wrong crendials')) */
	
   res.send('Hello World');
})




app.get('/categoriesdata',(req,res)=>{

    async function catdata(){
		let categoriesdata;
		let karigardata;
		let consultantdata;
		let contractordata;
		let productSupplierdata;
		let cityList;
        await knex('vendor_cat_mgmt').innerJoin('category_list','vendor_cat_mgmt.v_type_cat','category_list.id').select().then(data=>{
		
		 karigardata = data.filter(val=>{
			return val.v_type == "1"
		})
		 consultantdata = data.filter(val=>{
			return val.v_type == "4"
		})
		 contractordata = data.filter(val=>{
			return val.v_type == "3"
		})
		 productSupplierdata = data.filter(val=>{
			return val.v_type == "2"
		})
	});
	    await knex('location_list').select().then(data=>{
		 cityList=data
		
	});
          
	categoriesdata={
		karigar:karigardata,
		contractor:contractordata,
		consultant:consultantdata,
		productSupplier:productSupplierdata,
		citylist:cityList
 }
   return categoriesdata;
}
  catdata().then(data=>{
	res.json(data);
});

})


// Get City List
app.get('/getcitylist',(req,res)=>{
	knex('location_list').select().then(data=>{
		res.json({
			citylist:data
		})
	}).catch(err=>res.status(400).json({response:"Unsuccessful"}));
});

app.get('/getsubcategory/:catId',(req,res)=>{
	let {catId} = req.params;
	knex('subcategory_list').where('cat_id',catId).then(data=>{
		res.json({
			subcategory:data
		})
	}).catch(err=>res.status(400).json({response:"Unsuccessful"}));
});

app.get('/:category/:subCatId/:city',(req,res)=>{
	let {category,subCatId,city} = req.params;
	knex('subcat_mgmt').innerJoin('subcategory_list','subcat_mgmt.subcat_id','subcategory_list.id').innerJoin('vendor_list','subcat_mgmt.v_id','vendor_list.id')
	.innerJoin('location_list','vendor_list.city','location_list.id')
	.where('subcat_url',subCatId).andWhere('location_list.name',city).then(data=>{
		res.json({
			vendorsList:data
		})
	}).catch(err=>res.status(400).json({response:"Unsuccessful"}));
});

app.get('/getSubCatUrl/:catUrl',(req,res)=>{
	let {catUrl}=req.params;
	knex('subcategory_list').innerJoin('category_list','subcategory_list.cat_id','category_list.id').where('cat_url',catUrl)
	.then(data=>{
		res.json({
			subcategory:data
		})
	}).catch(err=>res.status(400).json({response:"Unsuccessful"}));
});

app.get('/enquiry/:cName/:cMobile',(req,res)=>{
	let{cName,cMobile}=req.params;
	let otp = Math.floor(Math.random()*100)+999;
	sendOtp(otp,cMobile)
});
const sendOtp = (otp,number)=>{
	let username='getkarigar@gmail.com';
	let hash = 'Getconmedia@123';
	let sender = encodeURI('GETKGR');
	let message = otp+" is your GETKARIGAR AUTHORIZATION OTP. By confirming OTP, you agree to GETKARIGAR's T&C https://getkarigar.com/terms-of-use . NEVER SHARE YOUR OTP WITH ANYONE.";
	message = encodeURIComponent(message);
	let url = 'http://api.textlocal.in/send/'
		let formData = new FormData();
		formData.append('username',username);
		formData.append('hash',hash);
		formData.append('numbers',number);
		formData.append('sender',sender);
		formData.append('message',message);
		  fetch(url,{
			method:'post',
			body:formData
		}).then(res=>{
			console.log(res.json());
		}).catch(err=>{
			console.log(err);
		});
		//console.log(number);
}
var server = app.listen(3001, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})