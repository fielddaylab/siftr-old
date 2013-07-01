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
            var html = model.views.constructNoteCreateView.cloneNode(true);
            model.views.noteCreateView = new NoteCreateView(html);
            model.views.createNoteViewContainer.innerHTML = '';
            model.views.createNoteViewContainer.appendChild(model.views.createNoteViewCloseButton.html);
            model.views.createNoteViewContainer.appendChild(model.views.noteCreateView.html);
            model.views.createNoteViewContainer.style.display = 'block';
	    model.views.darkness.style.display = 'block';
        }
        else
            this.showLoginView();
    };

    this.showLoginView = function() 
    {
        var html = model.views.constructLoginView.cloneNode(true);
        model.views.loginView = new LoginView(html);
        model.views.loginViewContainer.innerHTML = '';
        model.views.loginViewContainer.appendChild(model.views.loginViewCloseButton.html);
        model.views.loginViewContainer.appendChild(model.views.loginView.html);
        model.views.loginViewContainer.style.display = 'block';
	model.views.darkness.style.display = 'block';
    };

    this.showJoinView = function() 
    {
        var html = model.views.constructJoinView.cloneNode(true);
        model.views.joinView = new JoinView(html);
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
    }

    this.populateListNotesFromModel = function()
    {	
        model.views.mainViewLeft.innerHTML = '';

        for(var i = 0; i < model.notes.length; i++)
        {
            if(!this.hasAtLeastOneSelectedTag(model.notes[i])) continue;
            if(!this.matchesFilter(model.notes[i], document.getElementById("filterbox").value)) continue;
            var listNote = new ListNote(this.noteSelected, model.notes[i], i);
            model.views.mainViewLeft.innerHTML = model.views.mainViewLeft.innerHTML + listNote.getImageHtml();
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
            callService("notes.addContentToNote", function(){}, getString, false);	
        }
        else
        {
            var getString = "/"+ gameId + "/" + noteId + "/" + playerId + "/" + filename + "/" + type;
            callService("notes.addContentToNoteFromFileName", function(){}, getString, false);	
        }
    }

    this.updateNote = function(noteId, title) 
    {
        callService("notes.updateNote", function(){},"/"+noteId+"/"+title+"/true/true", false);
    }

    this.addCommentToNote = function(noteId, comment, callback)
    {
        callService("notes.addCommentToNote", callback, "/"+model.gameId+"/"+model.playerId+"/"+noteId+"/comment", false);
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
        callService("players.loginPlayer", this.loginReturned,"/"+email+"/"+password, false);
    }

    this.loginReturned = function(returnString)
    {
        var startJson = returnString.indexOf("{");
        var jsonString = returnString.substr(startJson);
        var obj = JSON.parse(jsonString);

        var playerId = obj.data;

        model.playerId = playerId;

        if(model.playerId > 0)
        {
            controller.createNote();
            controller.hideLoginView();
	    model.views.darkness.style.display = 'block';
        }
        else
            alert("Incorrect login. Please try again.");
    }

    this.createAccount = function(email, password)
    {
        callService("players.createPlayer", this.createPlayerReturned,"/"+email+"/"+password+"/"+email+"/"+email+"/"+email, false);
    }

    this.createPlayerReturned = function(returnString)
    {
        var obj = JSON.parse(returnString);

        if(obj.returnCode > 0) alert(obj.returnCodeDescription);
        else
        {
            model.playerId = obj.data;
            controller.createNote();
            self.hideLoginView();
            self.hideJoinView();
            model.views.darkness.style.display = 'block';
        }
    }

    this.resetAndEmailPassword = function(email)
    {
        callService("players.resetAndEmailPassword", function(){}, "/"+ email, false);
    }
}
