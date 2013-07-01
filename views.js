function ActionButton(html, callback)
{
    var self = this; // <- I hate javascript.
    this.hover = function()
    {
        self.hovered = true;
        if(self.selected) self.html.style.backgroundColor = '#CCCCFF';
        else self.html.style.backgroundColor = '#CCCCCC';
    };
    this.unhover = function()
    {
        self.hovered = false;
        if(self.selected) self.html.style.backgroundColor = '#DDDDFF';
        else self.html.style.backgroundColor = '#DDDDDD';
    };
    this.select = function()
    {
        self.selected = true;
        if(self.hovered) self.html.style.backgroundColor = '#CCCCFF';
        else self.html.style.backgroundColor = '#DDDDFF';
    };
    this.deselect = function()
    {
        self.selected = false;
        if(self.hovered) self.html.style.backgroundColor = '#CCCCCC'
        else self.html.style.backgroundColor = '#DDDDDD';
        self.callback(self);
    };
    this.hovered = false;
    this.selected = false;

    this.html = html;
    this.callback = callback;
    this.html.addEventListener('mouseover', this.hover,    false);
    this.html.addEventListener('mouseout',  this.unhover,  false);
    this.html.addEventListener('mousedown', this.select,   false);
    this.html.addEventListener('mouseup',   this.deselect, false);
}

function ListNote(callback, note, noteId)
{
    var self = this; // <- I hate javascript.
    this.note = note;
    this.callback = callback;

    this.getImageHtml = function()
    {
        this.noteHtml = "";
        this.noteImage = getImageToUse(note);

        // construct html with note image
        if(this.noteImage != "")
        {
            this.noteHtml =  "<div class='note_list_cell'><img id='image"+noteId+"' class='note_list_cell_media' src='"+this.noteImage+"' style='cursor:pointer;'/></div>";
            setTimeout(function () { 
                if(document.getElementById("image"+noteId)) 
                    document.getElementById("image"+noteId).addEventListener("click", function() { self.callback(self); });
                }, 300);
        }

        return this.noteHtml;
    }
}

function NoteView(note)
{
    var thism = this; //garbage
    this.html = model.views.constructNoteView.cloneNode(true);
    this.note = note;

    this.constructHTML = function()
    {
        if(!this.note) return; 

        var imgcontent;
        for(var i = 0; i < this.note.contents.length; i++)
            if(this.note.contents[i].type == 'PHOTO') imgcontent = this.note.contents[i];
        if(imgcontent != null)
            this.html.children[0].innerHTML = '<img class="note_media" style="width:500px;height:500px;" src="' + imgcontent.media_url + '" />';
        this.html.children[1].children[0].innerHTML += 'Caption: ' + this.note.title + '<br><br><br> Tags: ' + this.note.tagString + '<br><br><br>';
        this.html.children[1].children[1].innerHTML = 'Comments: ';
        for(var i = 0; i < this.note.comments.length; i++)
            this.html.children[1].children[1].appendChild(this.constructCommentHTML(this.note.comments[i]));
        this.html.children[1].children[2].innerHTML = '<br><br><br>';
        var t = document.createElement('textarea'); 
        t.id="commentInput";
        t.rows="4";
        t.placeholder="add comment";
        this.html.children[1].children[2].appendChild(t);
        var b = document.createElement('button');
        b.id = 'commentSubmit';
        b.className = 'button';
        b.onclick = function(){thism.submitComment(thism.note, t.value);};
        b.innerHTML = 'Submit';
        this.html.children[1].children[2].appendChild(b);
        //this.html.children[1].children[2].innerHTML += '<br><br><br>'; 
        //this.html.children[1].children[2].innerHTML += this.note.likes + model.views.likeIcon + '    ' + this.note.comments.length + model.views.commentIcon;   
        this.loadComments();
    }

    this.loadComments = function()
    {
        for(var i = 0; i < thism.note.comments.length; i++)
            thism.html.children[1].children[1].innerHTML += thism.constructCommentHTML(thism.note.comments[i]);
    }

    this.submitComment = function(note, comment)
    {
        if(model.playerId > 0)
            controller.addCommentToNote(note.note_id, comment, thism.loadComments);
    }

    this.constructContentHTML = function(content)
    {
        var contentHTML = document.getElementById('note_content_cell_construct').cloneNode(true);
        contentHTML.setAttribute('id','');
        switch(content.type)
        {
            case 'TEXT':
                contentHTML.innerHTML = content.text;
                break;
            case 'PHOTO':
                contentHTML.innerHTML = '<img class="note_media" src="'+content.media_url+'" />';
                break;
            case 'AUDIO':
                //contentHTML.innerHTML = '<audio class="note_media" controls="controls"><source src="'+content.media_url+'" type="audio/mpeg"><a href="'+content.media_url+'">audio</a></audio>';
                contentHTML.innerHTML = '<a href="'+content.media_url+'">audio</a>';
                break;
            case 'VIDEO':
                contentHTML.innerHTML = '<video class="note_media" controls="controls"><source src="'+content.media_url+'"><a href="'+content.media_url+'">video</a></video>';
                break;
        }
        return contentHTML;
    };


    this.constructCommentHTML = function(comment)
    {
        var commentHTML = document.getElementById('note_comment_cell_construct').cloneNode(true);
        commentHTML.setAttribute('id','');
        var splitDateCreated = comment.created.split(/[- :]/);
        var dateCreated = new Date(splitDateCreated[0], splitDateCreated[1]-1, splitDateCreated[2], splitDateCreated[3], splitDateCreated[4], splitDateCreated[5]);
        commentHTML.children[0].innerHTML = '<br>' + comment.username + ' (' + dateCreated.toLocaleString() + '):';
        commentHTML.appendChild(thism.constructContentHTML({"type":"TEXT","text":comment.title}));
        for(var i = 0; i < comment.contents.length; i++)
            commentHTML.appendChild(thism.constructContentHTML(comment.contents[i]));
        return commentHTML;
    }

    this.constructHTML();
}


function getLocation()
{
    if(navigator.geolocation) return navigator.geolocation.getCurrentPosition();
    else return "Geolocation is not supported by this browser.";
}

function submitNote() 
{
    // check for required stuff
    // add location to note
    controller.updateNoteLocation(model.currentNote.noteId, model.currentNote.lat, model.currentNote.lon);

    // add text to note
    model.currentNote.text = document.getElementById("caption").value;
    if (model.currentNote.text != '')
        controller.updateNote(model.currentNote.noteId, model.currentNote.text);

    // add image content
    if (model.currentNote.imageFile != null)
    {
        var oMyForm = new FormData();
        oMyForm.append("file", model.currentNote.imageFile);
        oMyForm.append("path", model.gameId); // number 123456 is immediately converted to string "123456"

        var oReq = new XMLHttpRequest();
        oReq.open("POST", SERVER_URL+"/services/v1/uploadHandler.php");
        oReq.onreadystatechange = function ClientSideUpdate() {
            if (oReq.readyState == 4) 
            {
                model.currentNote.arisImageFileName = oReq.responseText;
                controller.addContentToNote(model.currentNote.noteId, model.currentNote.arisImageFileName, "PHOTO", '', '');
            }
        };
        oReq.send(oMyForm);
    }

    // add tags
    if (document.getElementById("create_tag_1").checked) controller.addTagToNote(model.currentNote.noteId, document.getElementById("create_tag_1").value);
    if (document.getElementById("create_tag_2").checked) controller.addTagToNote(model.currentNote.noteId, document.getElementById("create_tag_2").value);
    if (document.getElementById("create_tag_3").checked) controller.addTagToNote(model.currentNote.noteId, document.getElementById("create_tag_3").value);
    if (document.getElementById("create_tag_4").checked) controller.addTagToNote(model.currentNote.noteId, document.getElementById("create_tag_4").value);
    if (document.getElementById("create_tag_5").checked) controller.addTagToNote(model.currentNote.noteId, document.getElementById("create_tag_5").value);

    // add audio content (optional)
    if (model.currentNote.audioFile != null)
    {
        var oMyForm = new FormData();
        oMyForm.append("file", model.currentNote.audioFile);
        oMyForm.append("path", model.gameId); // number 123456 is immediately converted to string "123456"

        var oReq = new XMLHttpRequest();
        oReq.open("POST", SERVER_URL+"/services/v1/uploadHandler.php");
        oReq.onreadystatechange = function ClientSideUpdate() {
            if (oReq.readyState == 4) 
            {
                model.currentNote.arisAudioFileName = oReq.responseText;
                controller.addContentToNote(model.currentNote.noteId, model.currentNote.arisAudioFileName, "AUDIO", '', '');
            }
        };
        oReq.send(oMyForm);

    }

    // hide create note view
    controller.hideCreateNoteView();
}

function MapMarker(callback, note)
{
    var self = this; // <- I hate javascript.
    this.callback = callback;
    this.note = note;

    if(this.note.contents[0] == null)
        return;

    var imageMarker = new RichMarker({
        position: this.note.geoloc,
        map: model.views.gmap,
        draggable: false,
        content: constructMarker(this.note)
        });

    this.marker = imageMarker;
    model.views.markerclusterer.addMarker(this.marker);

    google.maps.event.addListener(this.marker, 'click', function(e) { self.callback(self); });
}

function constructMarker(note)
{
    var html;
    var mediaURL = getMediaToUse(note);
    mediaType = mediaToUseType(note);
    var clip;
    var size;
    var height;
    var width;
    var left;
    var top;

    if(mediaType == "PHOTO")
    {
        clip = "rect(2px 30px 32px 2px)";
        size = "height='40' width='40'";
        position = "top:0;left:0;";
        height = 40;
        width = 30;
        top = 0;
        left = 0;
    }
    else
    {
        clip = "";
        size = "height = '25' width = '30'";
        position = "top:4;left:6;";
        height = 25;
        width = 20;
        top = 4;
        left = 6;
    }

    var image = new Image();
    var imageSource = getMediaToUse(note); //"./assets/images/defaultImageIcon.png";
    image.onload = function() { /*replaceMarkerImage(imageSource);*/ }
    image.src = imageSource;
    image.style.top = top;
    image.style.left = left;
    image.style.position = "absolute";
    image.style.clip = clip;
    image.height = height;
    image.width = width;

    var outerDiv = document.createElement('div'); 
    outerDiv.style.cursor = "pointer";
    /*var innerDiv = document.createElement('div'); 
      innerDiv.style.top = 1;
      innerDiv.style.left = 33;
      innerDiv.style.position = "absolute";
      innerDiv.innerHTML = getIconsForNoteContents(note);*/

    var speechBubble = new Image();
    speechBubble.src = './assets/images/speechBubble2.png';
    speechBubble.height = 51;
    speechBubble.width = 32;

    outerDiv.appendChild(speechBubble);
    outerDiv.appendChild(image);
    //outerDiv.appendChild(innerDiv);

    html = outerDiv.outerHTML;

    //html  = "<div style=><img src='./assets/images/speechBubble.png' height='51' width='43'/> " + image + " </div><div style='top:1;left:33; position:absolute' >" +   getIconsForNoteContents(note) +"</div>"	;

    return html;
}

function getMediaToUse(note)
{
    var mediaURL = "";

    for(i = 0; i < note.contents.length; i++)
        if(note.contents[i].type == "PHOTO") return note.contents[i].media_url;

    if (note.contents[0].type == "TEXT")
        mediaURL = "./assets/images/defaultTextIcon.png";
    else if (note.contents[0].type == "AUDIO")
        mediaURL = "./assets/images/defaultAudioIcon.png";
    else if (note.contents[0].type == "VIDEO")
        mediaURL = "./assets/images/defaultVideoIcon.png";

    return mediaURL;
}

function getImageToUse(note)
{
    var mediaURL = "";
    for (i = 0; i < note.contents.length; i++)
        if (note.contents[i].type == "PHOTO") mediaURL = note.contents[i].media_url;

    return mediaURL;
}

function mediaToUseType(note)
{
    for(i = 0; i < note.contents.length; i++)
        if (note.contents[i].type == "PHOTO") return "PHOTO";

    return note.contents[0].type;
}

function getIconsForNoteContents(note)
{
    if(note.contents[0] == null)
        return "";

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
    if (textCount > 0)
        iconHTML += '<img src="./assets/images/defaultTextIcon.png" height=8px;><br>';
    if (audioCount > 0)
        iconHTML += '<img src="./assets/images/defaultAudioIcon.png" height=8px;><br>';
    if (photoCount > 0)
        iconHTML += '<img src="./assets/images/defaultImageIcon.png" height=8px;><br> ';
    if (videoCount > 0)
        iconHTML += '<img src="./assets/images/defaultVideoIcon.png" height=8px;>';

    return iconHTML;
};

function handleImageFileSelect(files)
{
    for(var i = 0; i < files.length; i++)
    {
        var file = files[i];
        var imageType = /image.*/;

        if(!file.type.match(imageType)) continue;

        var img = document.getElementById("imageThumbnail");
        img.classList.add("obj");
        img.file = file;
        model.currentNote.imageFile = file;

        var reader = new FileReader();
        reader.onload = (function(aImg) { return function(e) { 
            aImg.src = e.target.result; 
            model.currentNote.imageFileURL = e.target.result;
            }; 
            })(img);

        reader.readAsDataURL(file);	
    }
};

function handleAudioFileSelect(files)
{
    for(var i = 0; i < files.length; i++)
    {
        var file = files[i];
        var audioType = /audio.*/;

        if(!file.type.match(audioType)) continue;

        // preview audio control
        var audioPreview = document.getElementById("audioPreview");
        audioPreview.src = URL.createObjectURL(file);
        model.currentNote.audioFile = file;
    }
};

function showVideo()
{
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var video = document.getElementById("video");
    var videoObj = { "video": true };
    var errBack = function(error) { console.log("Video capture error: ", error.code); };

    // Put video listeners into place
    if(navigator.getUserMedia)
    {
        navigator.getUserMedia(videoObj, function(stream) {
                video.src = stream;
                video.play();
                }, errBack);
    }
    else if(navigator.webkitGetUserMedia)
    {
        navigator.webkitGetUserMedia(videoObj, function(stream){
                video.src = window.webkitURL.createObjectURL(stream);
                video.play();
                }, errBack);
    }

    unhide("video");
    unhide("snap");
};

function recordAudio()
{
    try
    {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        window.URL = window.URL || window.webkitURL;

        model.audio_context = new AudioContext;
    }
    catch(e)
    {
        alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({audio: true}, startUserMedia, function(e) { console.log('No live audio input: ' + e); });

    unhide("startRecording");
    unhide("stopRecording");
};

function cancelNote() 
{
    controller.deleteNote(model.currentNote.noteId);
    controller.hideCreateNoteView();
}

function markerMoved(marker, map)
{
    var point = marker.getPosition();
    map.panTo(point);
    //document.getElementById("latitude").innerHTML = "Latitude: " + point.lat();
    //document.getElementById("longitude").innerHTML = "Longitude: " + point.lng();
    document.getElementById("latitude").innerHTML = "";
    document.getElementById("longitude").innerHTML = "";

    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({latLng: point}, function(results, status) {
        if(status == google.maps.GeocoderStatus.OK && results[0]) document.getElementById("address").innerHTML = "Approximate Address:<br> " + results[0].formatted_address;
    });
    model.currentNote.lat = point.lat();
    model.currentNote.lon = point.lng();
}

function handleNoGeolocation(errorFlag)
{
    if(errorFlag) var content = 'Error: The Geolocation service failed.';
    else          var content = 'Error: Your browser doesn\'t support geolocation.';
}

function dataURItoBlob(dataURI)
{
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++)
        array.push(binary.charCodeAt(i));
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}

function unhide(div)
{
    var item = document.getElementById(div);

    if(item) 
    {       
        if(item.classList.contains('hidden')) item.classList.remove('hidden');
        else                                  item.classList.add('hidden');
    }
}

// audio functionality currently doesn't work, but should based on HTML5 spec.
// keep an eye on https://github.com/mattdiamond/Recorderjs for updates
function startUserMedia(stream)
{
    var input = model.audio_context.createMediaStreamSource(stream);
    input.connect(model.audio_context.destination);
    model.recorder = new Recorder(input);
}

function startRecording(button)
{
    model.recorder && model.recorder.record();
    button.disabled = true;
    button.nextElementSibling.disabled = false;
}

function stopRecording(button)
{
    model.recorder && model.recorder.stop();
    button.disabled = true;
    button.previousElementSibling.disabled = false;

    // create WAV download link using audio data blob
    createDownloadLink();
    //model.recorder.clear();
}

function createDownloadLink()
{
    model.recorder && model.recorder.exportWAV(function(blob)
        {
            var url = URL.createObjectURL(blob);
            var li = document.createElement('li');
            var au = document.createElement('audio');
            var hf = document.createElement('a')    
            au.controls = true;
            au.src = url;
            hf.href = url;
            hf.download = new Date().toISOString() + '.wav';
            hf.innerHTML = hf.download;
            li.appendChild(au);
            li.appendChild(hf);
            recordingslist.appendChild(li);
        });
}

function clickBrowseImage()
{
    document.getElementById('imageFileInput').click();
}

function clickBrowseAudio()
{
    document.getElementById('audioFileInput').click();
}

function clickLogin()
{
    var email = document.getElementById('usermail_login').value;
    var password = document.getElementById('password').value;

    controller.login(email, password);
}

function clickNoAccount()
{
    controller.showJoinView();
}

function clickViewLoginPage()
{
    controller.showLoginView();
}

function clickSignUp()
{
    var email = document.getElementById('usermail_join').value;
    var password = document.getElementById('password').value;

    controller.createAccount(email, password);
}

function clickForgotPassword()
{
    var email = document.getElementById('usermail').value;

    if(email != "")
    {
        controller.resetAndEmailPassword(email);
        alert("An email has been sent to you with instructions on how to reset your password.");
    }
    else
        alert("Enter your e-mail above and click this link again for instructions on changing your password.");
}

function LoginView()
{
    this.html = model.views.constructLoginView.cloneNode(true);
}

function JoinView()
{
    this.html = model.views.constructJoinView.cloneNode(true);
}

function NoteCreateView(html)
{
    this.html = html;

    controller.createNewNote();

    this.constructHTML = function()
    {
        this.html.children[0].children[0].innerHTML = '<br>Image:<br><img width=300 height=300 id="imageThumbnail"><input type="file" id="imageFileInput" onchange="handleImageFileSelect(this.files)" style="visibility:hidden;position:absolute;top:-50;left:-50"/><button id="browseImage" class="button" onclick="clickBrowseImage()">Browse</button><button id="showCamera" onclick="showVideo()" class="button">Camera</button><video id="video" width="200" height="200" autoplay class="hidden"></video><button id="snap" class="button hidden">Snap Photo</button><div hidden><canvas id="canvas" width="200" height="200"></canvas></div>';
        this.html.children[0].children[1].innerHTML = '<br>Location:<br><div id="mapCanvas" style="width:300px;height:300px;border:1px solid black;"></div><br><input type="text" name="location" id="searchTextField" style="width:300px"><br><div id="latitude"></div><div id="longitude"></div><div id="address"></div><br><br>';
        this.html.children[1].children[0].innerHTML = '<br>Caption:<br><textarea id="caption" rows="8"></textarea><br><br>';
        this.html.children[1].children[1].children[0].innerHTML = 'Tags:<br>'+
        '<input id="create_tag_1" name="note_tag_select" value="Innovation" type="radio">'+
            'Innovation'+
        '</input><br>'+
        '<input id="create_tag_2" name="note_tag_select" value="Stories of the Past" type="radio">'+
            'Stories of the Past'+
        '</input><br>'+
        '<input id="create_tag_3" name="note_tag_select" value="Madison Culture" type="radio">'+
            'Madison Culture'+
        '</input><br>'+
        '<input id="create_tag_4" name="note_tag_select" value="Must Do" type="radio">'+
            'Must Do'+
        '</input><br>'+
        '<input id="create_tag_5" name="note_tag_select" value="100 Years from Now" type="radio">'+
            '100 Years from Now'+
        '</input><br>'+
        '<br>';
        this.html.children[1].children[1].children[1].innerHTML = 'Audio:<br><button id="browseAudio" class="button" onclick="clickBrowseAudio()">Browse</button><br><input type="file" id="audioFileInput" onchange="handleAudioFileSelect(this.files)" class="hidden"><button id="recordAudio" onclick="recordAudio()" class="button">Record</button> <button class="hidden button" id="startRecording" onclick="startRecording(this);">start</button><button id="stopRecording" onclick="stopRecording(this);" class="hidden button" disabled>stop</button><br>Preview:<br><audio controls id="audioPreview"><source type="audio/ogg"><source type="audio/mpeg">Your browser does not support the audio element.</audio><br><br>';
        this.html.children[1].children[2].innerHTML = '<br><button id="submitNote" onclick="submitNote()" class="button">Submit</button><button id="cancelNote" onclick="cancelNote()" class="button">Cancel</button>';

        function refreshMap() 
        {
            var mapOptions = {
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            var map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);

            var marker = null;
            // Try HTML5 geolocation
            if(navigator.geolocation)
            {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    marker = new google.maps.Marker({ 
                        map: map,
                        position: pos,
                        draggable: true
                    });

                    google.maps.event.addListener(marker, 'dragend', function() { markerMoved(marker, map); } );
                    map.setCenter(pos);
                    markerMoved(marker, map);
                }, function() {
                    handleNoGeolocation(true);
                });
            }
            else
            {
                handleNoGeolocation(false);
            }

            var input = document.getElementById('searchTextField');
            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', map);

            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                var place = autocomplete.getPlace();
                if(place.geometry.viewport) 
                    map.fitBounds(place.geometry.viewport);
                else
                {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);  // Why 17? Because it looks good.
                }

                marker.setPosition(place.geometry.location);
                markerMoved(marker, map);
    
                var address = '';
                if(place.address_components)
                {
                    address = [
                        (place.address_components[0] && place.address_components[0].short_name || ''),
                        (place.address_components[1] && place.address_components[1].short_name || ''),
                        (place.address_components[2] && place.address_components[2].short_name || '')
                    ].join(' ');
                }
            });


            document.getElementById("snap").addEventListener("click", function()
            {
                var canvas = document.getElementById("canvas");
                var context = canvas.getContext("2d");

                video = document.getElementById("video");
                context.drawImage(video, 0, 0, 200, 200);
                var image = canvas.toDataURL('image/jpeg');
    
                var img = document.getElementById("imageThumbnail");
                img.src = image;
                model.currentNote.imageFile = dataURItoBlob(image); // it looks like there will eventually be a method canvas.toBlob() method for HTML5 but it is not implemented yet in most browsers as of April 2013
            }, false );
        }
        setTimeout(refreshMap,300);
    };

    this.constructHTML();
}
