var express = require('express');
var app = express();
var mongoose=require('mongoose');
var  bodyParser = require('body-parser');
const multer= require('multer');

const session = require('express-session');
var route=require('./expert');
var route2=require('./official');
var route3=require('./admin');
const farmer=require('./Model/farmer');
const meeting=require('./Model/meetings');
const comments=require('./Model/comments');

app.use(bodyParser.urlencoded({extended:true}));
const post= require('./Model/innovations');
const expert= require('./Model/experts');
app.use(bodyParser.json());

app.use(session({
	secret: 'abc'
}))

app.use(express.static('public'));
app.set('view engine','ejs');

mongoose.connect('mongodb://neha:neha@cluster0-shard-00-00-3pcxv.mongodb.net:27017,cluster0-shard-00-01-3pcxv.mongodb.net:27017,cluster0-shard-00-02-3pcxv.mongodb.net:27017/FarmNet?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true',{ useNewUrlParser: true});

const storage = multer.diskStorage({
    destination : './public/uploads',
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
	}
});

const storage1 = multer.diskStorage({
    destination : './public/uploads',
    filename: function(req, file, callback) {
        callback(null,file.originalname);
	}
});
const upload = multer({
   storage: storage
}).fields([
	{name:'image',maxCount:1},
	{name:'video',maxCount:1},
	{name:'audio',maxCount:1}
])
const upload1 = multer({
    storage: storage1
 }).single('image')

app.use(express.static('static'));
app.use('/expert',route);
app.use('/official',route2);
app.use('/admin',route3);


app.post('/innregister',(req,res)=>{
    // var img;
     upload(req,res,(err)=>{
          if(err){
             res.send(err);
         }
         else{
             req.body.owner=req.session.user.fname;
             req.body.image=req.files.image[0].filename;
             req.body.video=req.files.video[0].filename;
             req.body.audio=req.files.audio[0].filename;
              var data= new post(req.body);
             data.save(function(err){
                 if(err) res.send(err);
                 else{
                         res.render('./newInnovation');
                     }
             })
          }
      });
 });
 
app.get('/',(req,res)=>{
    res.render('index')

}).get('/single-post',(req,res)=>{
    res.render('single-post')

}).get('/blog',(req,res)=>{
    if(req.session.user){
        var user = req.session.user;
       var number= post.find().count();
       console.log(number);
		post.find({},(err, data)=> {
        
			res.render('blog',{post:data,farmer:user});
          })
        }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='login';</script>
        `;
        res.send(resp);   
	}
    //res.render('blog')
}).get('/myblog',(req,res)=>{
    if(req.session.user){
        var user = req.session.user;
        //console.log(user);
		post.find({owner:user.fname},(err, data)=> {
            if(data)
            {//console.log(data);
            res.render('blog',{post:data,farmer:user});}
            else
            res.send("no posts yet!");
          })
        }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='login';</script>
        `;
        res.send(resp);   
	}
    
}).get('/innovationblog',(req,res)=>{
    if(req.session.user){
        var user = req.session.user;
        console.log(user);
		post.find({type:'Innovation'},(err, data)=> {
            if(data)
            {console.log(data);
            res.render('blog',{post:data,farmer:user});}
            else
            res.send("no posts yet!");
          })
        }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='login';</script>
        `;
        res.send(resp);   
	}
    //res.render('blog')
}).get('/index',(req,res)=>{
    res.render('index')

}).get('/newInnovation',(req,res)=>{
    res.render('newInnovation');
}).get('/farmerregistration',(req,res)=>{
    res.render('farmerregistration');
});

app.post('/cregister',(req,res)=>{
    
    upload1(req,res,(err)=>{
        if(err){
           res.send(err);
       }
       else{
          // req.body.owner=req.session.user.fname;
          console.log(req.body.image);
           //req.body.image=req.file.filename1;
           
    var data= new farmer(req.body);
    data.save(function(err){
        if(err) res.send(err);
        else{
                res.render('login');
        }
})
       }
    })
})


app.get('/notifications',(req,res)=>{
    if(req.session.user){
		var user = req.session.user;
		meeting.find({},(err, data)=> {
        
			res.render('notification',{meeting:data});
          })
        }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='login';</script>
        `;
        res.send(resp);   
    }
});
app.get('/detail/:name',(req,res)=>{
	if(req.session.user){
	var user = req.session.user;  
	const usnm = req.params.name;
	post.findOne({title: usnm},(err,data)=>{
		if(data){
            comments.find({title:usnm},(err, msg)=> {
                console.log(farmer.fname);
                console.log(comments);
			    res.render('single-post',{post:data,farmer:user,comments:msg});
        })
        }
	})
}
else{
	var resp =`
	<script> alert('log in first');window.location.href='login';</script>
	`;
	res.send(resp);   
}	
});
app.post('/addcomment/:title',(req,res)=>{
	if(req.session.user){
        var user = req.session.user;
        req.body.title = req.params.title;
        req.body.personaadhar=req.session.user.aadhar;
        req.body.personname=user.fname;
        var data= new comments(req.body);
        data.save(function(err){
            if(err) res.send(err);
            else{
                    res.render('/');
            }
    });
    
}
else{
	var resp =`
	<script> alert('log in first');window.location.href='login';</script>
	`;
	res.send(resp);   
}	
});

app.post('/clogin',(req,res)=>{
	const usnm = req.body.aadhar;
	const passwd= req.body.password;
	farmer.findOne({aadhar: usnm},(err,data)=>{
		if(data){
			req.session.user = data;
			res.redirect('blog');
		}
		else{
			var resp =`
        <script> alert('login Incorrect!');window.location.href='/login';</script>
        `;
        res.send(resp);
		}
	})
});

app.get('/logout',(req,res)=>{
     if(req.session.user){
        req.session.destroy((err,data)=>{
            if(err) console.log(err);
            else{
                var succ =`
                <script> alert('successfully logged out');window.location.href='/login';</script>
                `;
                res.send(succ);
            }
        
    });
}
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/login';</script>
        `;
        res.send(resp);
    }
});

app.get('/viewuserr/:aadhar',(req,res)=>{
	if(req.session.user){
	//var user = req.session.user;  
	const usnm = req.params.aadhar;
	farmer.findOne({aadhar: usnm},(err,data)=>{
		if(data){
			    res.render('userfar',{farm:data});
        }})
        }
	

else{
	var resp =`
	<script> alert('log in first');window.location.href='login';</script>
	`;
	res.send(resp);   
}	
});
app.get('/home',(req,res)=>{
    res.render('home');
})  

app.get('/login',(req,res)=>{
	res.render('login');
})	
app.listen(process.env.PORT || 8080);