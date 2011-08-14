// MongoDB Setup
var deferred = require('deferred');
var mongodb = require('mongodb');
var server = new mongodb.Server("127.0.0.1", 27017, {});


function onCollection(str){
	var d = deferred();
	var conn = new mongodb.Db('standup', server, {});
	conn.open(function (error, client) {
		if(error){
			// Not sure, if this is the right usage of promise
			// Don't know if on end() d is supposed to be resolved!
			console.log("FAILED TO GET connection to DB", error);
			conn.close();
			d.resolve();
			return;
		}
		var collection = new mongodb.Collection(client, str);
		collection._connection = conn;
		console.log("Returning new connection");
		d.resolve(collection);
	});		
	return d.promise;	
}

exports.project = {
	get: function(handle){
		var d = deferred();
		onCollection('project')( 
			function(projects){
				projects.find({handle:handle}).toArray(function(err, ps){
					console.dir(ps);
					console.log("PS["+ handle + "]:", ps);
					projects._connection.close();
					d.resolve(ps[0]);
				})
			}
		);
		return d.promise;
	},
	put: function(project, callBack){
		console.log(">>> Inserting into projects:", project);
		var d = deferred();
		onCollection('project')( 
			function(projects){
				console.log("Inserting into projects:", project);
				//project._id = project.handle;
				projects.insert(project, function(err, docs){
					console.log("Insert Error", err);
					var success = !err;
					projects._connection.close();
					d.resolve(success);
				});
		});
		return d.promise;
	},
	list: function(filter, callBack){
		
	}
};

exports.user = {
	get: function(handle, callBack){
		
	},
	put: function(handle, callBack){
		
	}
};
