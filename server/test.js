var db = require("./couch.js");
var deferred = require("deferred");

function insertUpdates() {
	var d = deferred();
    for (var i = 0; i < 10; i++) {
        (function() {
            var id = i;
            db.update.put({
                user: 'test',
                project: 'testproject',
                text: 'something is finished :' + i
            })(function(doc) {
                if (doc) {
                    console.log("Saved update " + id);
                }
                if (id == 9) {
                    d.resolve(true);
                }
            });
        })();
        console.log('put: ' + i);
    }
	return d.promise;
}

function getAndDeleteUpdates() {
    db.update.getByProjectUser('testproject', 'test')(function(updates) {
        console.log("Fetced " + updates.length);
        updates.forEach(function(update) {
            db.update.remove(update)(function() {
                console.log("Deleted: " + update._id);
            });
        });
    });
}


insertUpdates().then(getAndDeleteUpdates);


function insertProjects(){
	var d = deferred();
    for (var i = 0; i < 10; i++) {
        (function() {
            var id = i;
			var p = {
                _id: 'project_' + id,
				features: {
					"Login Screen": ["Login"],
					"Signup Screen": ["Signup", "User Registration", "Signup Form"]
				},
				statuses: {
					"Completed": ["Completed", "Finished", "Done"],
					"In Progress": ["In Progress", "working on"],
					"Blocked": ["Blocked", "Stuck"]
				}
            };
			p.handle = p._id;
            db.project.put(p)(function(doc) {
                if (doc) {
                    console.log("Saved update " + p.handle);
                }
                if (id == 9) {
                    d.resolve(true);
                }
            });
        })();
        console.log('project put: ' + i);
    }
	return d.promise;
}


function getAndDeleteProjects() {
    db.project.all()(function(projects) {
        console.log("Fetced " + projects.length);
        projects.forEach(function(project) {
            db.project.remove(project)(function() {
                console.log("Deleted project: " + project._id);
            });
        });
    });
}

insertProjects().then(getAndDeleteProjects);
