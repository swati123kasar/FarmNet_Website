var express = require('express');
var mongoose=require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
var app = express();

app.use(bodyParser.urlencoded({extended:true}));

const farmers= require('./Model/farmer');
const meetings= require('./Model/meetings');
const official= require('./Model/official');

app.use(bodyParser.json());
app.use(session({
    secret: 'TechoTweet',
    resave: false
}))
app.use(express.static('public'));
app.set('view engine','ejs');

mongoose.connect('mongodb://neha:neha@cluster0-shard-00-00-3pcxv.mongodb.net:27017,cluster0-shard-00-01-3pcxv.mongodb.net:27017,cluster0-shard-00-02-3pcxv.mongodb.net:27017/FarmNet?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true',{ useNewUrlParser: true});
app.post('/cregister',(req,res)=>{
    if(req.session.user){
        var aadhar=req.body.aadhar;
            var data= new farmers(req.body);
        //     console.log(aadhar);console.log(data);
            farmers.update({"aadhar":data.aadhar},data,(err, data)=> {
                if(data)
                {
                    console.log(data);
                    res.redirect('/official/show');
                }
                else{
                res.send("no posts yet!");
                }
            })
        }
        //      }
            
	// 		data.save({aadhar: aadhar},function(err){
	// 			if(err) res.send(err);
	// 			else{
	// 					res.render('./official/landRegistration');
	// 			}
    //     });
    // }
});
    

app.get('/logout',(req,res)=>{
        if(req.session.user){
            req.session.destroy((err,data)=>{
                if(err) console.log(err);
                else{
                    var succ =`
                    <script> alert('successfully logged out');window.location.href='/official/login';</script>
                    `;
                    res.send(succ);
                } 
        });
    }
        else{
            var resp =`
            <script> alert('log in first');window.location.href='/official/login';</script>
            `;
            res.send(resp);
        }
});
    
app.post('/addMeeting',(req,res)=>{
        var data= new meetings(req.body);
        data.save(function(err){
            if(err) res.send(err);
            else{
                    res.render('./official/meeting');
            }
    });
});

app.post('/clogin',(req,res)=>{
	const usnm = req.body.username;
	const passwd= req.body.password;
	official.findOne({fname: usnm},(err,data)=>{
		if(data){
			req.session.user = data;
			res.redirect('/official/');
		}
		else{
			var resp =`
        <script> alert('login Incorrect!');window.location.href='/official/login';</script>
        `;
        res.send(resp);
		}
	})
});

app.get('/index',(req,res)=>{
    res.render('./index');

}).get('/login',(req,res)=>{
     
        res.render('./official/login');
    
	
}).get('/landRegistration',(req,res)=>{
    if(req.session.user){
        var user = req.session.user;  
        res.render('./official/landRegistration');
    }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/official/login';</script>
        `;
        res.send(resp);   
    }
    
}).get('/show',(req,res)=>{
    
    if(req.session.user){
        var user = req.session.user;  
        farmers.find({},(err, messages)=> {
        
            res.render('./official/landshow',{farmers:messages});
          })
    }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/official/login';</script>
        `;
        res.send(resp);   
	}
	

   
    
}).get('/meeting',(req,res)=>{
    if(req.session.user){
        var user = req.session.user;  
        res.render('./official/meeting');
    }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/official/login';</script>
        `;
        res.send(resp);   
    }

}).get('/',(req,res)=>{
    if(req.session.user){
        var user = req.session.user;  
        res.render('./official/index');
    }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/official/login';</script>
        `;
        res.send(resp);   
    }
})

module.exports = app;