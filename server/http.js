// Express Setup
var express = require("express");
var db = require("./couch.js");

var app = express.createServer();
app.use(express.bodyParser());
app.use(express.cookieParser());
//documentation of session: http://senchalabs.github.com/connect/middleware-session.html
app.use(express.session({secret: 'some cat'}))


app.get('/p/:handle',
function(req, res) {
    res.send(req.params.handle);
});

app.get('/u/:id',
function(req, res) {
    res.send('user ' + req.params.id);
});

app.get('/projects', function(req, res){
	db.project.all()(function(projects){
		res.json(projects, 200);
	});
});
app.get('/updates/:project', function(req, res){
	if(!validSession(req)){
		sendLogin(req, res);
		return;
	}
	db.update.getByProjectUser(req.params.project, req.session.user)(function(updates){
		res.json(updates, 200);
	});
});

app.get('/p/:project/updates', function(req, res){
	db.update.getByProject(req.params.project)(function(updates){
		res.json(updates, 200);
	});
});

function validSession(req){
	return !!req.session.user;
}
function sendLogin(req, res){
	res.json({error: true, sessionExpired: true}, 403);
}
app.post('/',
function(req, res) {
    console.log("BODY:",req.rawBody);
	if(!validSession(req)){
		sendLogin(req, res);
		return;
	}
    var request = JSON.parse(req.rawBody);
    switch (request.request) {
    case 'update-post':
		console.log("New Update:", request.data);
		var update = request.data;
		if(!update.at){
			update.at = (new Date()).getTime();			
		}
		update.user = req.session.user;
        db.update.put(request.data)(function(doc) {
			console.log("Inserted new Update:", doc);
            res.send({
                sucess:
                true,
                data: {
                    id: doc._id
                }
            })
        });
		return;
    }
    res.send('');
});

app.post('/login',
function(req, res) {
    if (!req.body.user || !req.body.password) {
        res.send("Request with insufficient data", 404);
        return;
    }
    req.session.user = req.body.user;
    res.redirect('http://127.0.0.1/standup/u/' + req.body.user);
});

//make it post later
app.get('/logout',
function(req, res) {
	req.session.destroy(function(){
		res.json({success: true});
	});
});
app.get('/user-redirect',
function(req, res) {
	if(req.session.user){
		res.redirect("http://127.0.0.1/standup/u/" + req.session.user);
	}else{
		res.redirect("http://127.0.0.1/standup/login.html");		
	}
});

app.listen(9090);
console.log("express:9090");

