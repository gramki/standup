
var cc=require('couch-client');
var update = cc('http://localhost:5984/update');
var project = cc('http://localhost:5984/project');
/*
update.save({user:'undefined', text:''}, function(err, doc){
	if(err){
		console.log("Couldn't create/update default update doc");
	}
});
*/

var views = {
	"_id": '_design/update_views',
	"language": "javascript",
	"views": {
		"all": {
			"map": "function(doc){emit(null, doc); }"
		},
		"by_project_user": {
			"map": "function(doc){emit(doc.project + '#' + doc.user, doc); }"
		},
		"by_project": {
			"map": "function(doc){emit(doc.project, doc); }"
		},
		"by_project_date": {
			"map": 'function(doc){var d=new Date(doc.at); var ds = ""+d.getFullYear() + (d.getMonth()<10?"0"+d.getMonth():d.getMonth()) + (d.getDate()<10?"0"+d.getDate():d.getDate()); emit(doc.project+ds, doc); }'
		}
	}
};

update.save(views, function(err, doc){
	if(err){
		console.log("Failed to create update views", err);
		return;
	}
	console.log("Update views are created/updated");
});


update.view("/update/_design/update_views/_view/all",function(err, docs){
		console.dir(docs);
		console.dir(err);
});




views = {
	"_id": '_design/project_views',
	"language": "javascript",
	"views": {
		"all": {
			"map": "function(doc){emit(null, doc); }"
		}
	}
};

project.save(views, function(err, doc){
	if(err){
		console.log("Failed to create project views", err);
		return;
	}
	console.log("Project views are created/updated");
});

project.view("/project/_design/project_views/_view/all",function(err, docs){
		console.dir(docs);
		console.dir(err);
});
