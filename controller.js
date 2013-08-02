
function Controller()
{
    var self = this; //<- I hate javascript.

    this.noteSelected = function(sender) 
    {
        var note = sender.note;
        model.views.noteView = new NoteView(note);
        model.views.noteViewContainer.innerHTML = '';

        model.views.noteViewContainer.appendChild(model.views.noteViewCloseButton.html);
        model.views.noteViewContainer.appendChild(model.views.noteView.html);
        model.views.noteViewContainer.style.display = 'block';
	model.views.darkness.style.display = 'block';
    };

    this.createNote = function() 
    {
        if(model.playerId > 0)
        {   
            model.views.noteCreateView = new NoteCreateView();
            model.views.createNoteViewContainer.innerHTML = '';
            model.views.createNoteViewContainer.appendChild(model.views.createNoteViewCloseButton.html);
            model.views.createNoteViewContainer.appendChild(model.views.noteCreateView.html);
            model.views.createNoteViewContainer.style.display = 'block';
		    model.views.darkness.style.display = 'block';
		
		    document.getElementById("create_tag_1").checked = true; //this is the default tag, it should be checked (but can't do it in HTML for reasons)

	    }
        else
            this.showLoginView();
    };

    this.showLoginView = function() 
    {
        self.hideJoinView(); //CDH only show one at a time
		model.views.loginView = new LoginView();
        model.views.loginViewContainer.innerHTML = '';
        model.views.loginViewContainer.appendChild(model.views.loginViewCloseButton.html);
        model.views.loginViewContainer.appendChild(model.views.loginView.html);
        model.views.loginViewContainer.style.display = 'block';
		model.views.darkness.style.display = 'block';
    };

    this.showJoinView = function() 
    {
        self.hideLoginView(); //CDH only show one at a time
		model.views.joinView = new JoinView();
        model.views.joinViewContainer.innerHTML = '';
        model.views.joinViewContainer.appendChild(model.views.joinViewCloseButton.html);
        model.views.joinViewContainer.appendChild(model.views.joinView.html);
        model.views.joinViewContainer.style.display = 'block';
		model.views.darkness.style.display = 'block';
    };

    this.populateMapNotesFromModel = function(center)
    {	
        for(var i = 0; i < model.mapMarkers.length; i++)
            if(model.mapMarkers[i].marker != null) model.mapMarkers[i].marker.setMap(null);
        model.mapMarkers = [];
        model.views.markerclusterer.clearMarkers();
        var tmpmarker;
        for(var i = 0; i < model.notes.length; i++)
        {
            if(!this.hasAtLeastOneSelectedTag(model.notes[i])) continue;
            if(!this.matchesFilter(model.notes[i], document.getElementById("filterbox").value)) continue;

            tmpmarker = new MapMarker(this.noteSelected, model.notes[i]);
            model.mapMarkers[model.mapMarkers.length] = tmpmarker;
        }

        if(center)
        {
            var bounds = new google.maps.LatLngBounds();
            for(var i = 0; i < model.mapMarkers.length; i++)
                if(model.mapMarkers[i].note.geoloc.Xa != 0 && model.mapMarkers[i].note.geoloc.Ya != 0)
                    bounds.extend(model.mapMarkers[i].note.geoloc);
            setTimeout(function(){ model.views.gmap.fitBounds(bounds); }, 100);
        }
    };

    this.hasAtLeastOneSelectedTag = function(note)
    {
		try{
        	for(var i = 1; i <= 5; i++)
        	{
            	if(document.getElementById("tag"+i).checked)
           		{
                	for(var j = 0; j < note.tags.length; j++)
                	{
                    	if(note.tags[j].tag.toLowerCase() == document.getElementById("tag"+i).value.toLowerCase())
                        return true;
                	}
            	}
       		 }  
			 return false;
			}	catch(err){console.log(err); }; //CDH was getting errors here for a while

    }

    this.populateListNotesFromModel = function()
    {	
        model.views.mainViewLeft.innerHTML = '';

        for(var i = 0; i < model.notes.length; i++)
        {
            if(!this.hasAtLeastOneSelectedTag(model.notes[i])) continue;
            if(!this.matchesFilter(model.notes[i], document.getElementById("filterbox").value)) continue;
            var listNote = new ListNote(this.noteSelected, model.notes[i], i);
            model.views.mainViewLeft.innerHTML += listNote.html;
        }
    };

    this.matchesFilter = function(note, filter)
    {
        if(filter == "") return true; 
        // check title
        if(note.title.toLowerCase().indexOf(filter.toLowerCase()) != -1) return true;
        // check contributor
        if(note.username.toLowerCase().indexOf(filter.toLowerCase()) != -1) return true;
        // check caption & type
        for (i = 0; i < note.contents.length; i++)
        {
            if(note.contents[i].text.toLowerCase().indexOf(filter.toLowerCase()) != -1) return true;
            if(note.contents[i].type.toLowerCase().indexOf(filter.toLowerCase()) != -1) return true;
        }
        // check tags
        for (var i = 0; i < note.tags.length; i++) 
            if(note.tags[i].tag.toLowerCase().indexOf(filter.toLowerCase()) != -1) return true;

        return false;
    };

    this.getIconsForNoteContents = function(note)
    {
        if(note.contents[0] == null) return "";

        var textCount = 0;
        var audioCount = 0;
        var videoCount = 0;
        var photoCount = 0;

        for(i = 0; i < note.contents.length; i++)
        {
            if (note.contents[i].type == "AUDIO")
                audioCount++;
            else if (note.contents[i].type == "VIDEO")
                videoCount++;
            else if (note.contents[i].type == "PHOTO")
                photoCount++;
            else  if (note.contents[i].type == "TEXT")
                textCount++;
        }

        var iconHTML = "";
        if(textCount  > 0) iconHTML += '<img src="./assets/images/defaultTextIcon.png"  height=14px;>';
        if(audioCount > 0) iconHTML += '<img src="./assets/images/defaultAudioIcon.png" height=15px;>';
        if(photoCount > 0) iconHTML += '<img src="./assets/images/defaultImageIcon.png" height=15px;> ';
        if(videoCount > 0) iconHTML += '<img src="./assets/images/defaultVideoIcon.png" height=14px;>';

        return iconHTML;
    };

    this.rightSideOfCell = function(text)
    {
        return "<div id='selector_cell_right_id' class='selector_cell_right' style='float:right; vertical-align:middle; padding-top:5px; padding-right:20px';>" + text + "</div>";
    }

    this.hideNoteView = function()
    {
        model.views.noteViewContainer.style.display = 'none';
        model.views.noteViewContainer.innerHTML = '';
	model.views.darkness.style.display = 'none';
        document.removeEventListener('click', controller.hideNoteView, false);
    }

    this.hideCreateNoteView = function()
    {
        model.views.createNoteViewContainer.style.display = 'none';
        model.views.createNoteViewContainer.innerHTML = '';
	model.views.darkness.style.display = 'none';
        document.removeEventListener('click', controller.hideCreateNoteView, false);
    }

    this.hideLoginView = function()
    {
        model.views.loginViewContainer.style.display = 'none';
        model.views.loginViewContainer.innerHTML = '';
	model.views.darkness.style.display = 'none';
        document.removeEventListener('click', controller.hideLoginView, false);
    }

    this.hideJoinView = function()
    {
        model.views.joinViewContainer.style.display = 'none';
        model.views.joinViewContainer.innerHTML = '';
	model.views.darkness.style.display = 'none';
        document.removeEventListener('click', controller.hideJoinView, false);
    }

    this.populateAllFromModel = function()
    {
        this.populateMapNotesFromModel(true);
        this.populateListNotesFromModel();
    }

    this.createNewNote = function()
    {
		//CDH first, reset currentNote to clear out any old data, and give it just lat & lon to start
		model.currentNote = {};
		model.currentNote.lat = model.defaultLat;
		model.currentNote.lon = model.defaultLon;

        var gameId = model.gameId;
        var playerId = model.playerId;		
        callService("notes.createNewNoteStartIncomplete", this.newNoteCreated, "/"+ gameId + "/" + playerId, false);
    }

    this.newNoteCreated = function(returnString)
    {
        var startJson = returnString.indexOf("{");
        var jsonString = returnString.substr(startJson);
        var obj = JSON.parse(jsonString);

        var noteId = obj.data;

        model.currentNote.noteId = noteId;
    }

    this.updateNoteLocation = function(noteId, lat, lon) 
    {
        var gameId = model.gameId;
        var getString = "/"+ gameId + "/" + noteId + "/" + lat + "/" + lon;
        callService("notes.updateLocation", function(){}, getString, false);
    }

    this.addContentToNote = function(noteId, filename, type, text, title)
    {
        var gameId = model.gameId;
        var playerId = model.playerId;

        if(type == "TEXT")
        {
            var getString = "/"+ noteId + "/" + gameId + "/" + playerId + "/0/" + type + "/" + text;
            callService("notes.addContentToNote", controller.callPushNewNote, getString, false);	
        }
        else
        {
            var getString = "/"+ gameId + "/" + noteId + "/" + playerId + "/" + filename + "/" + type;
            callService("notes.addContentToNoteFromFileName", controller.callPushNewNote, getString, false);	
        }
    }

	this.callPushNewNote = function callPushNewNote(responseText){
		//CDH this function exists to save me from having to type it multiple times in callbacks
		callService("notes.getDetailedFullNoteObject", controller.pushNewNote, "/" + model.currentNote.noteId + "/" + model.playerId, false);
	}

	this.pushNewNote = function pushNewNote(note){
    	//CDH this function helps add the newly uploaded note into the currenty cached HTML

	    var fullNote = JSON.parse(note); //the note will have come in like text
	    if(fullNote.contents.length == 0) console.log("Empty uploaded note");  //if the contents haven't loaded, it won't display
	    model.addNoteFromData(fullNote);  //add it in to the cached model
	    controller.populateAllFromModel();  //re-display the map and left hand images
	}

    this.updateNote = function(noteId, title) 
    {
        callService("notes.updateNote", function(){},"/"+noteId+"/"+title+"/true/true", false);
    }

    this.addCommentToNote = function(noteId, comment, callback)
    {
//		callService("notes.getFullNoteObject", callback, "/"+model.currentNote.noteId+"/"+model.playerId, false);
        callService("notes.addCommentToNote", callback, "/"+model.gameId+"/"+model.playerId+"/"+noteId+"/"+comment, false);
    }

    this.addTagToNote = function(noteId, tag)
    {
        callService("notes.addTagToNote", function(){},"/"+noteId+"/"+model.gameId+"/"+tag, false);
    }

    this.deleteNote = function(noteId)
    {
        callService("notes.deleteNote", function(){}, "/"+noteId, false);
    }

    this.login = function(email, password)
    {
        callService("players.getLoginPlayerObject", this.loginReturned,"/"+email+"/"+password, false);
    }

    this.loginReturned = function(returnString)
    {
        var startJson = returnString.indexOf("{");
        var jsonString = returnString.substr(startJson);
        var obj = JSON.parse(jsonString);

	//CDH first check to see if you have a valid login
	if (obj.data) {

		//CDH updated the display name and player ID to match getLoginPlayerObject data
        var playerId = obj.data.player_id;
		var displayName = obj.data.display_name; //in new user account creation this will be same as username
		if(!obj.display_name){displayName = obj.data.user_name; };//just in case set it to username if display name is blank
 
        model.playerId = playerId;
		model.displayName = displayName;

        if(model.playerId > 0)
    	{
            self.hideLoginView();
	    	model.views.loginButton.style.display = 'none'; //CDH hide login
	    	model.views.uploadButton.style.display = 'inline'; //CDH show upload
        }
        else
            alert("Incorrect login. Please try again.");

	}
	else
		alert(obj.returnCodeDescription + ". Please try again");
	
	}

    this.createAccount = function(email, password,username)
    {
        callService("players.createPlayer", this.createPlayerReturned,"/"+username+"/"+password+"/"+username+"/"+username+"/"+email, false); //CDH added username
    }

    this.createPlayerReturned = function(returnString)
    {
        var obj = JSON.parse(returnString);

        if(obj.returnCode > 0) alert(obj.returnCodeDescription);
        else
        {
            model.playerId = obj.data;
            self.hideLoginView();
            self.hideJoinView();
		    model.views.loginButton.style.display = 'none'; //CDH hide login
		    model.views.uploadButton.style.display = 'inline'; //CDH show upload
	    
        }
    }

    this.resetAndEmailPassword = function(email)
    {
        callService("players.resetAndEmailPassword", function(){}, "/"+ email, false);
    }
}
