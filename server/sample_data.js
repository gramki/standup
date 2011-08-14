var db = require("./couch.js");

var p = {
    _id: 'gimply',
    features: {
        "Status Update": ["Status Update", "Update Box", "Update Screen", "User Screen", "User Status"],
        "Login": ["Login", "Login Screen", "Login Form"],
        "Status View": ["Status View","By Status"],
        "Feature View": ["Feature View", "By Feature"],
        "User View": ["User View","By User"]
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
        console.log("Saved project " + p.handle);
    }
});

var dayInMs=86400*1000;
var today = (new Date()).getTime();

var updates=[
	{
		text: "Started working on Login",
		user: "ramki",
		project: "gimply",
		at: (new Date(today-5*dayInMs)).getTime()
	},
	{
		text: "Update Box phase-1 completed",
		user: "ramki",
		project: "gimply",
		at: (new Date(today-3*dayInMs)).getTime()
	},		
	{
		text: "Status Update Screen is blocked on Databse server update",
		user: "ramki",
		project: "gimply",
		at: (new Date(today-2*dayInMs)).getTime()
	}];

updates.forEach(function(up){
	db.update.put(up)(function(doc) {
	    if (doc) {
	        console.log("Saved update " + doc._id);
	    }
	});
});