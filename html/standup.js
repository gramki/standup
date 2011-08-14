
function obj2array(obj){
	var a=[];
	for(var k in obj){
		a.push(k);
	}
	return a;
}
function getDay(update){
	if(!update.at){
		return 'unknown';
	}
	var d = new Date(update.at);
	var ds = ""+d.getFullYear() + (d.getMonth()<10?"0"+d.getMonth():d.getMonth()) + (d.getDate()<10?"0"+d.getDate():d.getDate()); 
	return ds;
}
function isToday(date){
	var now = new Date();
	if(date.getYear() == now.getYear() && date.getMonth() == now.getMonth() && date.getDate() == now.getDate()){
		return true;
	}
	return false;
}
function isYesterday(date){
	var yesterday = (new Date((new Date()).getTime() - 86400*1000 ));
	if(date.getYear() == yesterday.getYear() && yesterday.getMonth() == yesterday.getMonth() && date.getDate() == yesterday.getDate()){
		return true;
	}
	return false;
}
function getDayName(update){
	var date = new Date(update.at);
	if(isToday(date)){
		return "Today";
	}
	if(isYesterday(date)){
		return "Yesterday";
	}
	return date.toLocaleDateString();
}
var months=["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getDayName2(update){
	var date = new Date(update.at);
	if(isToday(date)){
		return "Today";
	}
	if(isYesterday(date)){
		return "Yesterday";
	}
	return date.getDate() + " " + months[date.getMonth()];
}

function _standup() {

    var phrases = [];
    var phraseToFeature = {};
    var phraseToStatus = {};
    var rex = [];
	var currentProject;
	var projects = {};

    function changeCurrentProject(projectId) {
		var proj = projects[projectId];
		currentProject = proj;
        for (var p in currentProject.features) {
            phrases.push.apply(phrases, currentProject.features[p]);
            currentProject.features[p].forEach(function(ph) {
                phraseToFeature[ph] = p;
            });
        }

        for (var p in currentProject.statuses) {
            phrases.push.apply(phrases, currentProject.statuses[p]);
            currentProject.statuses[p].forEach(function(ph) {
                phraseToStatus[ph] = p;
            });
        }

        phrases.forEach(function(ph) {
            var re = new RegExp('s?(' + ph + ')s?', "gi");
            if (phraseToFeature[ph]) {
                re.feature =
                phraseToFeature[ph];
            } else {
                re.status = phraseToStatus[ph];
            }
            rex.push(re);
        });
    }

    function toUpdateObject(txt) {
		var features={};
		var statuses={};
		
		var html = txt;
        rex.forEach(function(re) {
            var css_class = "high";
            if (re.feature) {
                css_class += "  feature ";
            } else {
                css_class += "  " + statusToCss(re.status);
            }
			var oldHtml = html;
            html = html.replace(re, "<span class='" + css_class + "' title='" + (re.feature || re.status)
            + "'>$1</span>");
			if(oldHtml !== html ){
				if(re.feature){
					features[re.feature]=true;
				}else{
					statuses[re.status]=true;
				}
			}
        });
        html = html.replace(/\n/g, '<br/>');
		var obj = {
			text: txt,
			html: html,
			features: obj2array(features),
			statuses: obj2array(statuses)
		}
        return obj;
    }
    function statusToCss(stat) {
        var map = {
            "In Progress": "progress",
            "Completed": "completed",
            "Blocked": "blocked"
        }
        return map[stat] || 'progress';
    }

    function handleStatusChange() {
        var txt = $('#status')[0].value;
        var update = toUpdateObject(txt);
		var html = update.html;
		if(html){
	        $("#preview").html(html);
			$("#preview")[0].style.display = 'block';
		}else{
			$("#preview")[0].style.display = 'none';			
		}
		console.log("Update:", update);
    }
    function onUpdates(updates) {
		updates.sort(function(l, r){
			if(l.at > r.at){
				return -1;
			}
			return 1;
		});
		$('#prev').html("");
		var d=null,pd=null;
        updates.forEach(function(update) {
			d = getDayName(update);
			if(pd !== d){
	            $('#prev').append('<div class="date">' + d + '</div>');	
				pd = d;
			}
            var html = toUpdateObject(update.text).html;
            $('#prev').append('<div class="status">' + html + '</div>');
        });
    }
    function fetchUpdatesForUser(projectId) {
		if(!projectId){
			projectId = currentProject._id;
		}
        $.ajax({
            url: '/standup-api/updates/'+ projectId,
            type: 'GET',
            dataType: 'json',
            success: function(obj) {
                onUpdates(obj);
            },
            error: function(e) {
				var html = 'Failed to get Status updates. ';
				if(e.status === 403){
					html += "You need to <a href='/standup/login.html'>re-login</a>!";
				}
                showAlert(html);
                console.error("Fetching updates for project", e);
            }
        });
    }
	function showAlert(str){
		$('#postStatus').html(str);
	}

	////
	///			PROJECT PART
	///
	function handleProjectChange(id){
		changeCurrentProject(id);
		fetchUpdatesForUser(id);
	}
	function onProjectList(list){
		list.forEach(function(project){
			projects[project._id] = project;			
		});
		populateProjectSelectionBox(list);
	}
	function populateProjectSelectionBox(list){
		if($('#projectList').length==0){
			return;
		}
		$('#projectList').html('');
		list.forEach(function(project){
			var html = '<option value="'+ project._id +'">' + project.handle + '</option>';
			$('#projectList').append(html);
		});
		if(list.length>0){
			handleProjectChange(list[0]._id);
		}		
	}
	function fetchProjects(callback){
        $.ajax({
            url: '/standup-api/projects/',
            type: 'GET',
            dataType: 'json',
            success: function(obj) {
                onProjectList(obj);
				if(callback){
					callback(obj);
				}
            },
            error: function(e) {
                alert('Failed to get Project List');
                console.error(e);
            }
        });		
	}
	function fetchProjectUpdates(projectId, callback){		
        $.ajax({
            url: '/standup-api/p/'+ projectId +'/updates',
            type: 'GET',
            dataType: 'json',
            success: function(updates) {
				var objs=[];
				updates.forEach(function(up){
					var update = toUpdateObject(up.text);
					update.at = up.at;
					update.user = up.user;
					update.project = up.project;
					objs.push(update);
				});
                callback(objs);
            },
            error: function(e) {
				var html = 'Failed to get Status updates. ';
				if(e.status === 403){
					html += "You need to <a href='/standup/login.html'>re-login</a>!";
				}
                showAlert(html);
                console.error("Fetching updates for project", e);
            }
        });
	}
	return {
		handleStatusChange:handleStatusChange,
		handleProjectChange:handleProjectChange,
		fetchUpdatesForUser: fetchUpdatesForUser,
		fetchProjects: fetchProjects,
		toUpdateObject: toUpdateObject,
		fetchProjectUpdates: fetchProjectUpdates,
		changeCurrentProject: changeCurrentProject,
		getCurrentProject: function(){
			return currentProject._id;
		}
	}
};

var standup = _standup();

standup.init = function(callback){
	standup.fetchProjects(callback);
}
