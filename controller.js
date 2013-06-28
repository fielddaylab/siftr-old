function Controller()
{
    var self = this; //<- I hate javascript.

    this.noteSelected = function(sender) 
    {
        var note = sender.object;
        var html = model.views.constructNoteView.cloneNode(true);
        model.views.noteView = new NoteView(html, note);
        model.views.noteViewContainer.innerHTML = '';

        model.views.noteViewContainer.appendChild(model.views.noteViewCloseButton.html);
        model.views.noteViewContainer.appendChild(model.views.noteView.html);
        model.views.noteViewContainer.style.display = 'block';
        //setTimeout(function() { document.addEventListener('click', controller.hideNoteView, false); }, 100); //timeout to disallow imediate hiding
    };

    this.noteCreate = function() 
    {
        // show login view if not logged in already
        if(model.playerId > 0)
        {   
            var html = model.views.constructNoteCreateView.cloneNode(true);
            model.views.noteCreateView = new NoteCreateView(html);
            model.views.createNoteViewContainer.innerHTML = '';
            model.views.createNoteViewContainer.appendChild(model.views.createNoteViewCloseButton.html);
            model.views.createNoteViewContainer.appendChild(model.views.noteCreateView.html);
            model.views.createNoteViewContainer.style.display = 'block';
            //setTimeout(function() { document.addEventListener('click', controller.hideCreateNoteView, false); }, 100); //timeout to disallow imediate hiding
        }
        else
            this.showLoginView();
    };

    this.showLoginView = function() 
    {
        // To Do: setup login view from submitting comments. Currently it only goes to login view if you try to upload a new note.
        var html = model.views.constructLoginView.cloneNode(true);
        model.views.loginView = new LoginView(html);
        model.views.loginViewContainer.innerHTML = '';
        model.views.loginViewContainer.appendChild(model.views.loginViewCloseButton.html);
        model.views.loginViewContainer.appendChild(model.views.loginView.html);
        model.views.loginViewContainer.style.display = 'block';
    };

    this.showJoinView = function() 
    {
        var html = model.views.constructJoinView.cloneNode(true);
        model.views.joinView = new JoinView(html);
        model.views.joinViewContainer.innerHTML = '';
        model.views.joinViewContainer.appendChild(model.views.joinViewCloseButton.html);
        model.views.joinViewContainer.appendChild(model.views.joinView.html);
        model.views.joinViewContainer.style.display = 'block';
    };

    this.populateModel = function(gameData)
    {
        model.gameData = gameData;

        model.backpacks = model.gameData.backpacks;
        for(var i = 0; i < model.backpacks.length; i++)
        {
            if(model.backpacks[i] == "Invalid Player ID") continue;
            for(var j = 0; j < model.backpacks[i].notes.length; j++)
            {
                //Fix up note tags
                model.backpacks[i].notes[j].tags.sort(
                        function(a, b) {
                        if (a.tag.toLowerCase() < b.tag.toLowerCase()) return -1;
                        if (a.tag.toLowerCase() > b.tag.toLowerCase()) return 1;
                        return 0;
                        });
                if(model.backpacks[i].notes[j].tags.length == 0) 
                    model.backpacks[i].notes[j].tags[0] = {"tag":'(untagged)'}; //conform to tag object structure
                model.backpacks[i].notes[j].tagString = '';
                for(var k = 0; k < model.backpacks[i].notes[j].tags.length; k++)
                    model.backpacks[i].notes[j].tagString += model.backpacks[i].notes[j].tags[k].tag+', ';
                model.backpacks[i].notes[j].tagString = model.backpacks[i].notes[j].tagString.slice(0,-2); 

                //Calculate popularity
                model.backpacks[i].notes[j].popularity = parseInt(model.backpacks[i].notes[j].likes,10)+parseInt(model.backpacks[i].notes[j].comments.length,10);

                //Add to various note lists
                model.addNote(model.backpacks[i].notes[j]);
                model.addMapNote(model.backpacks[i].notes[j]);
            }
        }

        this.populateMapNotes(true);
        this.populateListNotes();
    };

    this.populateMapNotes = function(center)
    {	
        for(var i = 0; i < model.mapMarkers.length; i++)
            if(model.mapMarkers[i].marker != null) model.mapMarkers[i].marker.setMap(null);
        model.mapMarkers = [];
        model.views.markerclusterer.clearMarkers();
        var tmpmarker;
        for(var i = 0; i < model.mapNotes.length; i++)
        {
            if(!this.tagsSelected(model.mapNotes[i].tags)) continue;
            if(!this.filter(model.mapNotes[i], document.getElementById("filterbox").value)) continue;

            tmpmarker = new MapMarker(this.noteSelected, model.mapNotes[i]);
            model.mapMarkers[model.mapMarkers.length] = tmpmarker;
        }

        if(center)
        {
            var bounds = new google.maps.LatLngBounds();
            for(var i = 0; i < model.mapMarkers.length; i++)
                if(model.mapMarkers[i].object.geoloc.Xa != 0 && model.mapMarkers[i].object.geoloc.Ya != 0)
                    bounds.extend(model.mapMarkers[i].object.geoloc);
            setTimeout(function(){ model.views.gmap.fitBounds(bounds); }, 100);
        }

    };

    this.tagsSelected = function(tags)
    {
        // check if each checked tag is in notes tag list
        if (document.getElementById("tag1").checked) {
            for(var i = 0; i < tags.length; i++) {
                if (tags[i].tag.toLowerCase() == document.getElementById("tag1").value.toLowerCase())
                    return true;
            }
        }
        if (document.getElementById("tag2").checked) {
            for(var i = 0; i < tags.length; i++) {
                if (tags[i].tag.toLowerCase() == document.getElementById("tag2").value.toLowerCase())
                    return true;
            }
        }
        if (document.getElementById("tag3").checked) {
            for(var i = 0; i < tags.length; i++) {
                if (tags[i].tag.toLowerCase() == document.getElementById("tag3").value.toLowerCase())
                    return true;
            }
        }
        if (document.getElementById("tag4").checked) {
            for(var i = 0; i < tags.length; i++) {
                if (tags[i].tag.toLowerCase() == document.getElementById("tag4").value.toLowerCase())
                    return true;
            }
        }
        if (document.getElementById("tag5").checked) {
            for(var i = 0; i < tags.length; i++) {
                if (tags[i].tag.toLowerCase() == document.getElementById("tag5").value.toLowerCase())
                    return true;
            }
        }

        return false;
    }

    this.populateListNotes = function()
    {	
        // clear notes
        model.views.mainViewLeft.innerHTML = '';

        var tmpmarker;
        for(var i = 0; i < model.notes.length; i++)
        {

            if(!this.tagsSelected(model.notes[i].tags)) continue;
            if(!this.filter(model.notes[i], document.getElementById("filterbox").value)) continue;
            //To do: set up any other filters here

            // add
            var listNote = new ListNote(this.noteSelected, model.notes[i], i);
            model.views.mainViewLeft.innerHTML = model.views.mainViewLeft.innerHTML + listNote.getImageHtml();

        }

    };

    this.filter = function(note, filter)
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
        if(textCount  > 0) iconHTML += '<img src="./assets/images/defaultTextIcon.png" height=14px;>';
        if(audioCount > 0) iconHTML += '<img src="./assets/images/defaultAudioIcon.png" height=15px;>';
        if(photoCount > 0) iconHTML += '<img src="./assets/images/defaultImageIcon.png" height=15px;> ';
        if(videoCount > 0) iconHTML += '<img src="./assets/images/defaultVideoIcon.png" height=14px;>';

        return iconHTML;
    };

    this.getLikeIcon = function()
    {
        return '  <img id="likeIcon" src="./assets/images/LikeIcon.png" height=10px;>';
    };


    this.getCommentIcon = function()
    {
        return '  <img src="./assets/images/CommentIcon.png" height=8px;>';
    };

    this.getNoteIcon = function()
    {
        //return '  <img src="./assets/images/defaultTextIcon.png" height=14px;>  ';
        return "";
    };

    this.checkBox = function(checked)
    {
        if(checked) return '  <img src="./assets/images/checkbox.png" height=16px;>';
        else        return '  <img src="./assets/images/checkboxUnchecked.gif" height=16px;>';
    }

    this.rightSideOfCell = function(text)
    {
        return "<div id='selector_cell_right_id' class='selector_cell_right' style='float:right; vertical-align:middle; padding-top:5px; padding-right:20px';>" + text + "</div>";
    }

    this.displayNextNote = function(key)
    {
        if(model.views.mapLayoutButton.selected) ;
        if(model.views.listLayoutButton.selected)
        {
            if(model.views.contributorSortButton.selected) this.displayNextNoteInList(key, model.views.contributorNoteCells);
            if(model.views.tagSortButton.selected)  this.displayNextNoteInList(key, model.views.tagNoteCells);
            if(model.views.popularitySortButton.selected) this.displayNextNoteInList(key, model.views.popularNoteCells);
        }
    }

    this.displayNextNoteInList = function(key, list)
    {
        var index = -1;
        for(var i = 0; i < list.length; i++) 
            if(list[i].selected) { index = i; break; }
        if(key == 'Up') index--;
        else if(key == 'Down') index++;
        if(index >= list.length) index = 0;
        if(index < 0) index = list.length-1;
        list[index].select();
    }

    this.hideNoteView = function()
    {
        model.views.noteViewContainer.style.display = 'none';
        model.views.noteViewContainer.innerHTML = '';
        document.removeEventListener('click', controller.hideNoteView, false);
    }

    this.hideCreateNoteView = function()
    {
        model.views.createNoteViewContainer.style.display = 'none';
        model.views.createNoteViewContainer.innerHTML = '';
        document.removeEventListener('click', controller.hideCreateNoteView, false);
    }

    this.hideLoginView = function()
    {
        model.views.loginViewContainer.style.display = 'none';
        model.views.loginViewContainer.innerHTML = '';
        document.removeEventListener('click', controller.hideLoginView, false);
    }

    this.hideJoinView = function()
    {
        model.views.joinViewContainer.style.display = 'none';
        model.views.joinViewContainer.innerHTML = '';
        document.removeEventListener('click', controller.hideJoinView, false);
    }

    this.repopulateAll = function()
    {
        this.populateMapNotes(true);
        this.populateListNotes();
    }

    this.createNewNote = function()
    {
        var gameId = model.gameId;
        var playerId = model.playerId;		
        callService("notes.createNewNoteStartIncomplete", this.newNoteCreated, "/"+ gameId + "/" + playerId, false);
    }

    this.newNoteCreated = function(returnString)
    {
        // set note Id
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
        callService("notes.deleteNote", function(){}, "/"+noteI, false);
    }

    this.login = function(email, password)
    {
        callService("players.loginPlayer", this.loginReturned,"/"+email+"/"+password, false);
    }

    this.loginReturned = function(returnString)
    {
        // set note Id
        var startJson = returnString.indexOf("{");
        var jsonString = returnString.substr(startJson);
        var obj = JSON.parse(jsonString);

        var playerId = obj.data;

        model.playerId = playerId;

        if(model.playerId > 0)
        {
            controller.noteCreate();
            controller.hideLoginView();
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
            controller.noteCreate();
            self.hideLoginView();
            self.hideJoinView();
        }
    }

    this.resetAndEmailPassword = function(email)
    {
        callService("players.resetAndEmailPassword", function(){}, "/"+ email, false);
    }
}
