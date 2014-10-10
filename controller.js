function Controller() {
    var self = this; //<- I hate javascript.

    this.noteSelected = function(sender) {
        var note = sender.note;
        model.views.noteView = new NoteView(note);
        model.views.noteViewContainer.innerHTML = '';
        model.views.noteViewContainer.appendChild(model.views.noteView.html);
        $('.sifter-modal-overlay').show();
    };

    this.createNote = function() {
        model.views.noteCreateView = new NoteCreateView();
        model.views.createNoteViewContainer.innerHTML = '';
        model.views.createNoteViewContainer.appendChild(model.views.noteCreateView.html);
        
        var iOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);
        var clickEvent = iOS ? 'touchend' : 'click';
        $('#submitNote').on(clickEvent, submitNote);
        $('#cancelNote').on(clickEvent, cancelNote);
        $('#cancelNoteOverlay').on(clickEvent, cancelNote);
        $('#cancelNoteOverlay').show();

        document.getElementById("create_tag_1").checked = true; //this is the default tag, it should be checked (but can't do it in HTML for reasons)
    };

    // TODO refactor all these into a function that accepts a view container, and content and takes care of clearing/showing/hiding.
    // ex: model.views.popup(model.views.loginViewContainer, model.views.loginView);
    this.showLoginView = function() {
        self.hideJoinView(); // only show one at a time
        self.hideForgotView(); // only show one at a time
        model.views.loginView = new LoginView();
        model.views.loginViewContainer.innerHTML = '';
        model.views.loginViewContainer.appendChild(model.views.loginView.html);

        var iOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);
        var clickEvent = iOS ? 'touchend' : 'click';
        $('#login'         ).on(clickEvent, clickLogin         );
        $('#noAccount'     ).on(clickEvent, clickNoAccount     );
        $('#forgotPassword').on(clickEvent, clickForgotPassword);

        // Bind enter-key handlers
        var enterHandler = function(evt) {
            if (evt.which === 13) {
                $('#login').click();
                return false;
            }
            return true;
        };
        $('#username_login').keypress(enterHandler);
        $('#password_login').keypress(enterHandler);

        $('.sifter-modal-overlay').show();
    };

    this.showForgotView = function() {
        self.hideLoginView(); // only show one at a time
        model.views.forgotView = new ForgotView();
        model.views.forgotViewContainer.innerHTML = '';
        model.views.forgotViewContainer.appendChild(model.views.forgotView.html);
        $('.sifter-modal-overlay').show();
    };

    this.showJoinView = function() {
        self.hideLoginView(); // only show one at a time
        model.views.joinView = new JoinView();
        model.views.joinViewContainer.innerHTML = '';
        model.views.joinViewContainer.appendChild(model.views.joinView.html);
        $('.sifter-modal-overlay').show();
    };

    this.populateMapNotesFromModel = function(center) {
        for (var i = 0; i < model.mapMarkers.length; i++)
            if (model.mapMarkers[i].marker != null) model.mapMarkers[i].marker.setMap(null);
        model.mapMarkers = [];
        model.views.markerclusterer.clearMarkers();
        var tmpmarker;
        for (var i = 0; i < model.gameNotes.length; i++) {
            //   if(!this.hasAtLeastOneSelectedTag(model.gameNotes[i])) continue;

            //   var search_value = $('.sifter-filter-search-input').filter(":visible").val();
            //   if(!this.matchesFilter(model.gameNotes[i], search_value)) continue;

            tmpmarker = new MapMarker(this.noteSelected, model.gameNotes[i]);
            model.mapMarkers[model.mapMarkers.length] = tmpmarker;
        }

        if (center) {
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < model.mapMarkers.length; i++)
                if (model.mapMarkers[i].note.geoloc.Xa != 0 && model.mapMarkers[i].note.geoloc.Ya != 0)
                    bounds.extend(model.mapMarkers[i].note.geoloc);
            setTimeout(function() {
                model.views.gmap.fitBounds(bounds);
            }, 100);
        }
    };

    this.hasAtLeastOneSelectedTag = function(note) {
        try {
            for (var i = 1; i <= 5; i++) {
                if (document.getElementById("tag" + i).checked) {
                    for (var j = 0; j < note.tags.length; j++) {
                        if (note.tags[j].tag.toLowerCase() == document.getElementById("tag" + i).value.toLowerCase())
                            return true;
                    }
                }
            }
            return false;
        } catch (err) {
            console.log(err);
        }; // was getting errors here for a while

    }

    this.populateListNotesFromModel = function() {
        model.views.mainViewLeft.innerHTML = '';

        for (var i = 0; i < model.gameNotes.length; i++) {
            var listNote = new ListNote(this.noteSelected, model.gameNotes[i], model.gameNotes[i].note_id);
            if (!!listNote.html) model.views.mainViewLeft.appendChild(listNote.html);
            //make sure it's not blank, if it is it'll crash    
        }
        var loadMoreButton = document.createElement('button');
        loadMoreButton.setAttribute('onclick', 'siftMore();');
        loadMoreButton.setAttribute('style', 'margin: 10px;');
        loadMoreButton.innerHTML = 'Load More';
        model.views.mainViewLeft.appendChild(loadMoreButton);
        controller.getNoteFromURL();
    };

    this.matchesFilter = function(note, filter) {

        filterLC = filter.toLowerCase().trim(); //we'll be comparing everything in lower case, trim off leading & trailing spaces

        if (filterLC == "") return true;

        // check contributor
        if (note.username.toLowerCase().indexOf(filterLC) != -1) return true;

        //determine if we need to check the media type 
        var mediaTypeSearch = (filterLC == 'audio' || filterLC == 'video'); //text and photos are manadatory 

        for (var i = 0; i < note.contents.length; i++) {
            if (note.contents[i].type == 'TEXT') {

                // check the title/caption 
                if (note.contents[i].text.toLowerCase().indexOf(filterLC) != -1) return true;

            }
            if (mediaTypeSearch) { //we computed those which don't need to be checked earlier to make this run faster

                //check type
                if (note.contents[i].type.toLowerCase().indexOf(filterLC) != -1) return true;
            }
        }


        return false;
    };

    this.rightSideOfCell = function(text) {
        return "<div id='selector_cell_right_id' class='selector_cell_right' style='float:right; vertical-align:middle; padding-top:5px; padding-right:20px';>" + text + "</div>";
    }

    // NOTE: Don't think this is used, click event from sifter-mobile.js is called instead - Jazmyn
    this.hideNoteView = function() {
        model.views.noteViewContainer.innerHTML = '';
        $('.sifter-modal-overlay').hide();
        document.removeEventListener('click', controller.hideNoteView, false);
    }

    this.hideCreateNoteView = function() {
        model.views.createNoteViewContainer.innerHTML = '';
        $('.sifter-modal-overlay').hide();
        document.removeEventListener('click', controller.hideCreateNoteView, false);
    }

    this.hideLoginView = function() {
        model.views.loginViewContainer.innerHTML = '';
        $('.sifter-modal-overlay').hide();
        document.removeEventListener('click', controller.hideLoginView, false);
    }
    this.hideForgotView = function() {
        model.views.forgotViewContainer.innerHTML = '';
        $('.sifter-modal-overlay').hide();
        document.removeEventListener('click', controller.hideForgotView, false);
    }

    this.hideJoinView = function() {
        model.views.joinViewContainer.innerHTML = '';
        $('.sifter-modal-overlay').hide();
        document.removeEventListener('click', controller.hideJoinView, false);
    }

    this.populateAllFromModel = function() {
        this.populateMapNotesFromModel(false);
        this.populateListNotesFromModel();
    }

    this.createNewNote = function() {
        // first, reset currentNote to clear out any old data, and give it just lat & lon to start
        model.currentNote = {};
        model.currentNote.lat = model.defaultLat;
        model.currentNote.lon = model.defaultLon;

        var gameId = model.gameId;
        var playerId = model.playerId;
        //callService("notes.createNewNoteStartIncomplete", this.newNoteCreated, "/" + gameId + "/" + playerId, false);
    }

    this.pushNewNote = function pushNewNote(note) {
        //fifth, finally push the new note to HTML

        var fullNote = JSON.parse(note).data; //the note will have come in like text
        if (fullNote.contents.length == 0) console.log("Empty uploaded note"); //if the contents haven't loaded, it won't display
        model.addNoteFromData(fullNote); //add it in to the cached model
        controller.populateAllFromModel(); //re-display the map and left hand images
        controller.noteSelected({note: fullNote}); //show the new note
    }

    // New, simpler note upload function
    this.oneStepNote = function () {
        var gameId = model.gameId;
        var playerId = model.playerId;
        var lat = model.currentNote.lat;
        var lon = model.currentNote.lon;
        var caption = model.currentNote.text;
        var tags = [];
        for (var i = 1; i < model.tags.length + 1; i++) {
            if (document.getElementById("create_tag_" + i).checked) {
                var tag = document.getElementById("create_tag_" + i).value;
                tags.push(tag);
            }
        };
        var photoReader = new FileReader();
        photoReader.onload = function() {
            var photoData = photoReader.result;
            // TODO: handle non-jpeg
            var dataPrefix = 'data:image/jpeg;base64,';
            var photoBase64 = '';
            if (photoData.indexOf(dataPrefix) === 0)
            {
                photoBase64 = photoData.substring(dataPrefix.length);
            }
            else
            {
                console.log("controller.oneStepNote: Couldn't encode photo to base64");
            }

            var json = {
                "gameId": gameId,
                "playerId": playerId,
                "title": caption.substring(0, 10),
                "description": caption,
                // ^ This gets turned into a TEXT note_content, *not* the note table description column.
                "publicToMap": 1,
                "publicToBook": 1,
                "location":
                    {
                        "latitude": lat,
                        "longitude": lon,
                    },
                "media":
                    [
                        {
                            "path": gameId,           // <- Often gameId. the folder within gamedata that you want the image saved
                            "filename": "upload.jpg", // <- Unimportant (will get changed), but MUST have correct extension (ie '.jpg')
                            "data": photoBase64,      // <- base64 encoded media data
                            "resizeTo": 640,          // <- Optional: resize image so max(height, width) == this number
                        }
                    ],
                "tags": tags
            }

            callService("notebook.addNoteFromJSON",
                controller.oneStepGetNote,
                '',
                JSON.stringify(json));
        };
        photoReader.readAsDataURL( $('#in-camera')[0].files[0] );
    };
    this.oneStepGetNote = function (response) {
        // retrieve the note object back from the server so you can push it to HTML
        callService("notes.getNoteById", controller.pushNewNote, "/" + JSON.parse(response).data.note_id + "/" + model.playerId, false);
    }

    this.addCommentToNote = function(noteId, comment, callback) {
        callService("notes.addCommentToNote", callback, "/" + model.gameId + "/" + model.playerId + "/" + noteId + "/" + encodeURIComponent(comment), false);
    }

    this.setCommentComplete = function(status) { //unless the comment is set to complete it won't return from any queries
        var startJson = status.indexOf("{");
        var jsonString = status.substr(startJson);
        var obj = JSON.parse(jsonString); //obj.data will be the note ID needed for the call

        callService("notes.setNoteComplete", function() {}, "/" + obj.data, false);

    }

    this.addTagToNote = function(noteId, tag) {
        callService("notes.addTagToNote", function() {}, "/" + noteId + "/" + model.gameId + "/" + tag, false);
    }

    this.deleteNote = function(noteId) {
        callService("notes.deleteNote", function() {}, "/" + noteId, false);
        model.deleteNote(noteId);
        controller.populateAllFromModel(); //re-display the map and left hand images
    }

    this.login = function(username, password) {
        callService("players.getLoginPlayerObject", this.loginReturned, "/" + username + "/" + password, false);
    }

    this.facebookLogin = function(email, displayName, uid) {
        //it is possible for email to be blank
        callService("players.getFacebookLoginPlayerObject", this.facebookLoginReturned, "/" + email + "/" + displayName + "/" + uid, false);
    }

    this.loginReturned = function(returnString) {
        //be sure to sych changes with this to facebookLoginReturned
        var startJson = returnString.indexOf("{");
        var jsonString = returnString.substr(startJson);
        var obj = JSON.parse(jsonString);

        // first check to see if you have a valid login
        if (obj.data) {

            // updated the display name and player ID to match getLoginPlayerObject data
            var playerId = obj.data.player_id;
            var displayName = obj.data.display_name; //in new user account creation this will be same as username
            if (!obj.display_name) {
                displayName = obj.data.user_name;
            }; //just in case set it to username if display name is blank

            model.playerId = playerId;
            model.displayName = displayName;

            if (model.playerId > 0) {
                self.hideLoginView();

                $.cookie("sifter", playerId); //give a cookies so they stay logged in until they close the browser
                $.cookie("displayName", model.displayName); // Since there is no re-check from the server on page load
                $('.sifter-show-logout-button').show();

                /* Trigger original item that required login and clear it out */
                controller.loginCallback();
                controller.loginCallback = function() {};
            } else {
                alert("Incorrect login. Please try again.");
            }
        } else {
            alert(obj.returnCodeDescription + ". Please try again");
        }
    }

    this.facebookLoginReturned = function(returnString) {
        //be sure to sych changes with this to main loginReturned
        var startJson = returnString.indexOf("{");
        var jsonString = returnString.substr(startJson);
        var obj = JSON.parse(jsonString);

        // first check to see if you have a valid login
        if (obj.data) {

            // updated the display name and player ID to match getLoginPlayerObject data
            var playerId = obj.data.player_id;
            var displayName = obj.data.display_name; //in new user account creation this will be same as username
            if (!obj.display_name) {
                displayName = obj.data.user_name;
            }; //just in case set it to username if display name is blank

            model.playerId = playerId;
            model.displayName = displayName;

            if (model.playerId > 0) {
                self.hideLoginView();

                $.cookie("sifter", playerId); //give a cookies so they stay logged in until they close the browser
                $.cookie("displayName", model.displayName); // Since there is no re-check from the server on page load
                $('.sifter-show-logout-button').show();
            } else {
                alert("Incorrect login. Please try again.");
            }
        } else {
            alert(obj.returnCodeDescription + ". Please try again");
        }
    }

    this.logout = function() {
        $.removeCookie('displayName');
        $.removeCookie('sifter'); //without the cookie, the user will have to log in again
        $('.sifter-show-logout-button').hide();
        model.playerId = 0;

    }

    this.logged_in = function() {
        return model.playerId > 0;
    }

    /* Send people back to where they requested the login from */
    this.loginCallback = function() {}

    this.loginRequired = function(callback) {
        if (this.logged_in() === true) {
            callback();
        } else {
            this.loginCallback = callback;
            $('.closable, .sifter-modal-overlay').hide(); /* Close everything */
            this.showLoginView();
        }
    }

    this.createAccount = function(email, password, username) {
        model.displayName = username; /* Because nothing is contained in the callback and we're logging them in */
        callService("players.createPlayer", this.createPlayerReturned, "/" + username + "/" + password + "/" + username + "/" + username + "/" + email, false); //added username
    }

    this.createPlayerReturned = function(returnString) {
        var obj = JSON.parse(returnString);

        if (obj.returnCode > 0) alert(obj.returnCodeDescription);
        else {
            model.playerId = obj.data;

            $.cookie("sifter", model.playerId); //give a cookies so they stay logged in until they close the browser
            $.cookie("displayName", model.displayName); // Since there is no re-check from the server on page load
            $('.sifter-show-logout-button').show();

            self.hideLoginView();
            self.hideJoinView();

            /* Trigger original item that required login and clear it out */
            controller.loginCallback();
            controller.loginCallback = function() {};
        }
    }

    this.resetAndEmailPassword = function(email) {
        callService("players.resetAndEmailNewPassword", controller.resetPasswordMessage, "/" + email, false);
    }

    this.resetPasswordMessage = function(returnString) {
        console.log(returnString);

        responseMessage = JSON.parse(returnString);

        switch (responseMessage.returnCode) {
            case 0:
                alert("Password reset has been successfuly emailed.");
                controller.hideForgotView();
                break;
            case 4:
                alert("No player associated with that email");
                break; //should'nt we limit the number of attempts?
            case 5:
                alert("Error: mail could not be sent.");
                break; //why does this happen?
            default:
                console.log("Unexpected resupt from resetPasswordMessage: " + returnString);
        }
    }

    this.like = function(playerId, noteId) {
        callService("notes.likeNote", function() {}, "/" + playerId + "/" + noteId, false); //add internal like

    }

    this.unlike = function(playerId, noteId) {
        callService("notes.unlikeNote", function() {}, "/" + playerId + "/" + noteId, false); //remove internal like

    }

    this.sendEmail = function(playerId, noteId) {
        //alert("email" + playerId + noteId);
        note = model.currentNote;
        if (!note.note_id == noteId) //we are making an assumption that the current note is the same as the one desired to email
        { //just in case this is in error, record it    
            console.log("Error in email: " + model.currentNote.note_id + " " + noteId);
        }

        //initialize the text
        var bodyText = "Check out this note about ";
        var subjectText = "Interesting note on ";

        //customize based on the tag
        var tagText = "";
        var formattedTag = note.tagString.toLowerCase().trim();
        switch (formattedTag) {
            case ("innovation"):
                tagText = "Innovation ";
                break;
            case ("must do"):
                tagText = "a Must Do ";
                break;
            case ("stories of the past"):
                tagText = "Stories of the Past ";
                break;
            case ("100 years from now"):
                tagText = "100 Years From Now ";
                break;
            case ("madison culture"):
                tagText = "Madison Culture ";
                break;

            default:
                console.log("unexpected tag string on email send " + formattedTag + " " + note.tagString);
                tagText = note.tagString;
        }

        bodyText += tagText;
        subjectText += tagText;

        //customize on if they made it or found it      
        if (playerId == note.owner_id) bodyText += " I made ";
        else bodyText += " I found ";

        bodyText += "on the UW-Madison Campus: " + "\n";
        subjectText += "from UW-Madison Campus";

        //pull out the note text and photo url
        for (var i = 0; i < note.contents.length; i++) {
            //initialize audi variable becuase it could be blank and we don't want that to gum up the works
            var bodyAudio = "";
            switch (note.contents[i].type) {
                case "TEXT":
                    bodyText += "\"" + note.contents[i].text + "\" \n \n";
                    break;
                case "PHOTO":
                    var bodyImage = note.contents[i].media.data.url;
                    break;
                case "AUDIO":
                    bodyAudio = note.contents[i].media.data.url;
                    break;
            }
        }

        var thisSiftr = '';
        var result = document.URL.match(/siftr.org\/(\w+)/);
        if (result !== null) {
            thisSiftr = result[1];
        }

        bodyText += "See the whole note at: siftr.org/" + thisSiftr + " or download the Siftr app \n";
        // bodyText += bodyImage;
        if (thisSiftr !== '') {
            bodyText += "siftr.org/" + thisSiftr + "/#" + note.note_id;
        }


        //add one to email sent count
        callService("notes.sharedNoteToEmail", function() {}, "/" + playerId + "/" + note.note_id, false); //add one to email count

        //add all the accumulated strings together  
        emailText = "mailto:?subject=" + encodeURIComponent(subjectText) + "&body=" + encodeURIComponent(bodyText);

        //send the email
        window.open(emailText);

        //increment the user side HTML
        note.email_shares = parseInt(note.email_shares) + 1;
        document.getElementById("emailButton").innerHTML = note.email_shares + " Emails";

    }

    this.showAbout = function() {
        model.views.aboutView = new AboutView();
        model.views.aboutContainer.innerHTML = '';
        model.views.aboutContainer.appendChild(model.views.aboutView.html);
        $('.sifter-modal-overlay').show();
    }

    this.showFilters = function() {
        model.views.filtersView = new FiltersView();
        model.views.filtersContainer.innerHTML = '';
        model.views.filtersContainer.appendChild(model.views.filtersView.html);

        //Need event listeners to be set after the html is actually there
        $('.sifter-filter-checkbox-input').on('change', function() {
            startSift('tags');
        });

        $('.sifter-filter-search-input').on('change', function() {
            startSift('search');
        });
    }

    this.getNoteFromURL = function() {
        var match = window.location.href.match(/#(.*)$/);
        var noteFromHash;
        if (match) {
            for (var i = 0; i < model.gameNotes.length; i++) {
                if (model.gameNotes[i].note_id === match[1]) {
                    noteFromHash = model.gameNotes[i];
                    break;
                }
            }
            if (noteFromHash) {
                var sender = {
                    note: noteFromHash
                };
                controller.noteSelected(sender);
            } else {
                //else they gave an invalid note_id
                window.history.pushState('', '', window.location.href.split("#")[0]);
            }
        }
    };

    this.sendTweet = function(playerId, noteId) {
        note = model.currentNote;
        if (!note.note_id == noteId) //we are making an assumption that the current note is the same as the one desired to tweet
        { //just in case this is in error, record it 
            console.log("Error in tweet: " + model.currentNote.note_id + " " + noteId);
        }
        //different versions of siftr will have different URLs
        currentURL = window.location.href;

        //initialize the text
        var bodyText = "Check out this note about ";

        //customize based on the tag
        bodyText += note.tagString;

        //customize on if they made it or found it      
        if (playerId == note.owner_id) bodyText += " I made ";
        else bodyText += " I found ";

        bodyText += "on the UW-Madison Campus:";

        noteURL = encodeURIComponent(currentURL + "#" + model.currentNote.note_id);
        shareURL = "https://twitter.com/share?&url=" + noteURL;

        //add all the accumulated strings together  
        tweetURL = shareURL + "&text=" + bodyText;

        //open window to send tweet
        window.open(tweetURL);

        //add one to tweet count and increment the user side HTML
        note.tweets ? note.tweets = parseInt(note.tweets, 10) + 1 : note.tweets = 1;
    };


    this.getPinLink = function(playerId, noteId) {
        note = model.currentNote;
        if (!note.note_id == noteId) //we are making an assumption that the current note is the same as the one desired to pin
        { //just in case this is in error, record it 
            console.log("Error in pin: " + model.currentNote.note_id + " " + noteId);
        }

        //different versions of siftr will have different URLs
        currentURL = window.location.href;

        //initialize the text
        var pinDescr = "Interesting note on ";

        //customize based on the tag
        pinDescr += note.tagString;

        //customize on if they made it or found it      
        if (playerId == note.owner_id) pinDescr += " I made ";
        else pinDescr += " I found ";

        pinDescr += "on the UW-Madison Campus: " + currentURL + "#" + model.currentNote.note_id;
        var pinLink = "";


        //TODO: keeping text, audi, and image for now because might be able to embed them in pin
        var pinText = "";
        var pinImage = "";

        //pull out the note text and photo url
        for (var i = 0; i < note.contents.length; i++) {
            //initialize audi variable becuase it could be blank and we don't want that to gum up the works
            var bodyAudio = "";
            switch (note.contents[i].type) {
                case "TEXT":
                    pinText += "\"" + note.contents[i].text + "\" \n \n";
                    break;
                case "PHOTO":
                    pinImage = note.contents[i].media.data.url;
                    break;
                case "AUDIO":
                    pinAudio = note.contents[i].media.data.url;
                    break;
            }
        }

        console.log(pinImage);

        //assemble link for pinterest button
        pinLink += "http://www.pinterest.com/pin/create/button/";
        pinLink += "?url=" + encodeURIComponent(currentURL + "#" + model.currentNote.note_id);
        pinLink += '&media=' + encodeURIComponent(pinImage);
        pinLink += '&description=' + encodeURIComponent(pinDescr);


        //add one to pin count and increment the user side HTML
        note.pins ? note.pins = parseInt(note.pins, 10) + 1 : note.pins = 1;
        console.log(pinLink);
        window.open(pinLink);

    }

}
