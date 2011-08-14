// javascript:var%20CouchClient%20=%20require(%27couch-client%27);var%20userDb%20=%20CouchClient.open(%27http://localhost:5984/user%27);var%20projectDb%20=%20CouchClient.open(%27http://localhost:5984/project%27);var%20updateDb%20=%20CouchClient.open(%27http://localhost:5984/update%27);var%20deferred%20=%20require(%27deferred%27);exports.update%20=%20{put:%20function(update){var%20d%20=%20deferred();update._id%20=%20(new%20Date()).getTime();updateDb.save(update,%20function(err,%20doc){if(err){console.error(%22UpdateDB%20Failed%22,%20err);}d.resolve(doc);});return%20d.promise;},getByProjectUser:%20function(project,%20user,%20count,%20skip){var%20d%20=%20deferred();if(!count){count%20=%2030;}if(!skip){skip%20=%200;}updateDb.view(%27/update/_design/update_views/_view/by_project_user%27,%20{key:%20project%20+%20%27#%27%20+%20user,%20limit:%20count,skip:skip},%20function(err,%20docs){if(error){}});}}
var CouchClient = require('couch-client');
var userDb = CouchClient('http://localhost:5984/user');
var projectDb = CouchClient('http://localhost:5984/project');
var updateDb = CouchClient('http://localhost:5984/update');

var deferred = require('deferred');

var lastId = null;
var lastId_count = 100000;
function getNextUpdateId(time) {
    //ensure you return a fixed length string
    //such that when sorted by this key, the updates are in the order of their entry
	if(!time){
		time = (new Date()).getTime();
	}
    var id = time;
    if (id == lastId) {
        lastId_count++;
    }
    lastId = id;
    return "" + id + "" + lastId_count;
}

exports.update = {
    put: function(update) {
        var d = deferred();
        update._id = getNextUpdateId(update.at);
		//update.at = (new Date()).getTime();
        updateDb.save(update,
        function(err, doc) {
            if (err) {
                console.error("UpdateDB Failed", err);
                d.resolve(null);
                return;
            }
            d.resolve(doc);
        });
        return d.promise;
    },
    remove: function(update) {
        var d = deferred();
        updateDb.remove(update,
        function(err, doc) {
            if (err) {
                console.error("UpdateDB Remove Failed", err);
                d.resolve(null);
                return;
            }
            d.resolve(doc);
        });
        return d.promise;
    },
    getByProjectUser: function(project, user, count, skip) {
        var d = deferred();
        if (!count) {
            count = 30;
        }
        if (!skip) {
            skip = 0;
        }
		console.log('Fetching updates by ' + project + "#" + user);
        updateDb.view('/update/_design/update_views/_view/by_project_user', {
            key: project + '#' + user,
            limit: count,
            skip: skip,
			descending: true
        },
        function(err, docs) {
            if (err) {
                console.error("UpdateDB getByProjectUser Failed", err);
                d.resolve(null);
                return;
            }
            console.log("fetched rows", docs);
            var arr = [];
            docs.rows.forEach(function(entry) {
                arr.push(entry.value);
            });
            d.resolve(arr);
        });
        return d.promise;
    },
    getByProject: function(project, count, skip) {
        var d = deferred();
        if (!count) {
            count = 100;
        }
        if (!skip) {
            skip = 0;
        }
		console.log('Fetching updates by ' + project);
        updateDb.view('/update/_design/update_views/_view/by_project', {
            key: project,
            limit: count,
            skip: skip,
			descending: true
        },
        function(err, docs) {
            if (err) {
                console.error("UpdateDB getByProject Failed", err);
                d.resolve(null);
                return;
            }
            console.log("fetched rows", docs);
            var arr = [];
            docs.rows.forEach(function(entry) {
                arr.push(entry.value);
            });
            d.resolve(arr);
        });
        return d.promise;
    }

}

exports.project = {
    all: function(count, skip) {
        var d = deferred();
        if (!count) {
            count = 30;
        }
        if (!skip) {
            skip = 0;
        }
        projectDb.view('/project/_design/project_views/_view/all', {
            limit: count,
            skip: skip
        },
        function(err, docs) {
            if (err) {
                console.error("projectDB all Failed", err);
                d.resolve(null);
                return;
            }
            console.log("fetched project rows", docs);
            var arr = [];
            docs.rows.forEach(function(entry) {
                arr.push(entry.value);
            });
            d.resolve(arr);
        });
        return d.promise;
    },
    put: function(project) {
        var d = deferred();
        projectDb.save(project,
        function(err, doc) {
            if (err) {
                console.error("projectDB Put Failed", err);
                d.resolve(null);
                return;
            }
            d.resolve(doc);
        });
        return d.promise;
    },
    remove: function(project) {
        var d = deferred();
        projectDb.remove(project,
        function(err, doc) {
            if (err) {
                console.error("projectDB Remove Failed", err);
                d.resolve(null);
                return;
            }
            d.resolve(doc);
        });
        return d.promise;
    }
}


