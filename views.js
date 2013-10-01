$(document).ready (function ()
{
  /* Template compile speed up test */
  compiledShowTemplate = Mustache.compile( $('#showTemplate').html() );
});


function ListNote(callback, note, noteId)
{
    var self = this; // <- I hate javascript.
    this.html = "";
    this.note = note;
    this.callback = callback;

    this.constructHTML = function()
    {
        var noteImage = getImageToUse(note);

        if(noteImage != "")
        {
            /* Get Data */
            var data = {}
            data.image_url = noteImage;
            data.note_id  = noteId;
            data.category_class = getTagIconName(note);
            
            /* Render View */
            var template = $('#gridIconTemplate').html();
            var view = Mustache.render (template, data);
		
            this.html = $(view).get(0);
        }
        else
        {
            this.html = $("<div></div>").get(0);//clear out the entire node if no media
            console.log("Error: Note with no image in database: noteID# " + noteId ); //since this shouldn't happen, log it if it does
        }

        $(this.html).find('img').on('click', function() { self.callback(self); });
    }
    this.constructHTML();
}

function NoteView(note)
{
    var thism = this; // FIXME needs better name, like view
    this.note = note;
	model.currentNote = note; // this is done so that the send email function over in controller can get at all the information

	//this.html.children[0] is for the image
	//this.html.children [1][0] Caption 
	//this.html.children [1][1] Audio
	//this.html.children [1][2] Tags
	//this.html.children [1][3] Comments
	//this.html.children [1][4] Inputs (of more comments)
	//this.html.children [1][5] Social Media
    this.constructHTML = function()
    {
      /* Get Data */
      var data = {};

      data.image_url = getImageToUse (this.note);
      data.category_class = getTagIconName(this.note);
      data.audio_url = getAudioToUse (this.note); 
      data.details   = getTextToUse  (this.note);
      data.comments  = this.getCommentsJson (this.note.comments);
      data.logged_in = controller.logged_in();	
	data.emailShare =  this.note.email_shares;

      /* Render View */
      var render = compiledShowTemplate (data);
      this.html = $(render).get(0);


      /* Attach login or comment events */
      $(this.html).find('.login-to-comment').on('click', function()
      {
        controller.loginRequired (function () { controller.noteSelected(thism); });
      });

      $(this.html).find('.post-comment').on('click', function()
      {
        var text = $(thism.html).find('textarea').val();
        thism.submitComment (thism.note, text)
      });


      /* TODO social stuff, new comment logic */
      $(this.html).find('.share-email').on('click', function()
	{
	 controller.sendEmail(model.playerId, model.currentNote.note_id);	
      });
		

    }


    this.old_constructHTML = function()
    {
        if(!this.note) return; 

		//load content
        var imgcontent;
        var audcontent;
		var textcontent;

        for(var i = 0; i < this.note.contents.length; i++){
			switch(this.note.contents[i].type){
				case 'PHOTO': imgcontent = this.note.contents[i].media.data; break;
				case 'AUDIO': audcontent = this.note.contents[i].media.data; break; 
				case 'TEXT': textcontent = this.note.contents[i].text; break;
        		default: console.log("Error in parsing note content type in NoteView");
			}
		}

		//display image
		if(imgcontent != null)
            this.html.children[0].innerHTML = '<img class="note_media" style="width:500px;height:500px;" src="' + imgcontent.url + '" />';


		//dispaly text
        this.html.children[1].children[0].innerHTML += 'Caption: ' + textcontent;

		//dispaly audio
		if(audcontent != null)
		{
			var audioHTML =  'Audio:'  + '<br> <audio controls id="audioPreview" > <source src="' + audcontent.url +  ' " ';
			audioHTML += 'type="audio/mpeg">';
			audioHTML += 'Your browser does not support the audio element. </audio>';
			this.html.children[1].children[1].innerHTML  += audioHTML;
		}

		//display tags
        this.html.children[1].children[2].innerHTML +=' Tags: ' + this.note.tagString + '<br><br><br>';

		//display comments
        this.loadComments();

		//start social media build
		var shareHTML =  "<ul class='shares'>"; //this has to be assembled in a string and added to .innerHTML all at once or it adds returnlines
	

		//if user is logged in, let them submit comments. Else, prompt them to login 
		if(model.playerId > 0){
	        var t = document.createElement('textarea'); 
        	t.id="commentInput";
	        t.rows="4";
        	t.placeholder="add comment";
	        this.html.children[1].children[4].appendChild(t);
	
			var b = document.createElement('button');
        	b.id = 'commentSubmit';
        	b.className = 'button';
        	b.onclick = function(){thism.submitComment(thism.note, t.value);};
        	b.innerHTML = 'Submit';

			//check to see if user has liked the note yet, and display the appropriate button
	       	
			this.likeToggle(this.note.player_liked);

			shareHTML +=  "<li>" + this.note.facebook_shares + " Facebook </li>   ";
		//	document.getElementById('shareFacebook').innerHTML = this.note.facebook_shares + " Facebook!";
		//above only works second time you run it

		}
		else{
			var b = document.createElement('button');
			b.id = 'loginToComment';
			b.classname = 'button';
			b.onclick = controller.showLoginView;
			b.innerHTML = 'Login to Comment';

			//they can't submit to social media if they are not logged in, show static numbers

//			document.getElementById('shareFacebook').innerHTML = this.note.facebook_shares + " Facebook";
//			document.getElementById('shareLikes').innerHTML = this.note.likes + " " + model.views.likeIcon;		

	    	var likeButtonHTML =  this.note.likes + " " +  model.views.likeIcon ;

	    	shareHTML +=  "<li>" + likeButtonHTML + "</li>   " ;
			var facebookButtonHTML =  this.note.facebook_shares ;
			shareHTML +=  "<li>" + facebookButtonHTML + " Facebook </li>   ";
	
		}
    
		this.html.children[1].children[4].appendChild(b);
		document.getElementById('shareLikes').innerHTML = ""; //supposed to be button, doesn't work yet

		//Social Media   
		shareHTML += "<li>" + this.note.twitter_shares + " Twitter </li>   ";
		shareHTML += "<li>" + this.note.pinterest_shares + " Pinterest </li>   ";

		//	emailButtonHTML = "<button id='emailButton' class='button' onClick=controller.sendEmail(model.playerId, thism.note.note_id)> "
		emailButtonHTML = "<button id='emailButton' class='button' onClick=controller.sendEmail(" + model.playerId +","+thism.note.note_id + ")>";

		shareHTML += "<li>" + emailButtonHTML + this.note.email_shares + " Emails</button> </li>   ";

		shareHTML += "</ul>";
	
		this.html.children[1].children[5].innerHTML += shareHTML; //this ends up in [1][5]
	//	this.html.children[1].children[5].appendChild(emailButton);

	}

    this.getCommentsJson = function(comments)
    {
      return $(comments).map (function ()
      {
         return {author: this.username, text: this.title};
      }).toArray();
    }

    this.loadComments = function()
    {
        this.html.children[1].children[3].innerHTML = 'Comments: ';
        for(var i = 0; i < thism.note.comments.length; i++)
            thism.html.children[1].children[3].appendChild(thism.constructCommentHTML(thism.note.comments[i]));
    }

    this.submitComment = function(note, comment)
    {
        if(model.playerId > 0){ 
	
			// in this section add the note to the cached HTML so we don't have to re-load the whole page   
			var day = new Date();
			var today = day.getFullYear() + "-" + day.getMonth() + "-" + day.getDate() + " " + day.getHours() + ":" + day.getMinutes() + ":" + day.getSeconds();
	   
			note.comments.push({ "username":model.displayName, "title":comment, "created":today}); 
	
			// now add it to the server copy and re-display the updated note
			controller.addCommentToNote(note.note_id, comment, function(status){controller.setCommentComplete(status); controller.noteSelected(thism);});
		}

		else
        {
            controller.showLoginView();
        }
    }

    this.constructCommentHTML = function(comment)
    {
        var commentHTML = document.getElementById('note_comment_cell_construct').cloneNode(true);
        var splitDateCreated = comment.created.split(/[- :]/);
        var dateCreated = new Date(splitDateCreated[0], splitDateCreated[1]-1, splitDateCreated[2], splitDateCreated[3], splitDateCreated[4], splitDateCreated[5]);

        commentHTML.children[0].innerHTML = '<br>' + comment.username + ' (' + dateCreated.toLocaleString() + '):';
        var commenttext = document.getElementById('note_content_cell_construct').cloneNode(true);
        commenttext.setAttribute('id','');
        commenttext.innerHTML = comment.title;
        commentHTML.appendChild(commenttext);
        return commentHTML;
    }

	this.likeToggle = function(hasLiked)
	{
	//user may or maynot have already like the note, this changes the display and effect of clicking	
	
		//start button
		var likeButton = document.createElement('button');
   	   	likeButton.id = 'likeButton';

		if(hasLiked == 0) 
		{ //the user has not yet liked it

			//then allow them to like it	
       		likeButton.className = 'button';
	       	likeButton.onclick = function(){thism.likeNote();};
		}
		else if(hasLiked == 1)
		{	//user has already liked the note
			likeButton.className = 'clickedButton';
			likeButton.onclick = function(){thism.unlikeNote();};
		}	

		//finish common elements of button and add it to HTML		
		likeButton.innerHTML = thism.note.likes +  " " +  model.views.likeIcon;
		thism.html.children[1].appendChild(likeButton);	
	}	

	this.likeNote = function()
	{
		this.note.likes = parseInt(this.note.likes) + 1;
		var likeB = document.getElementById('likeButton');
		likeB.innerHTML = this.note.likes + " "  + model.views.likeIcon;
       	likeB.onclick = function(){thism.unlikeNote();};
		likeB.className = 'clickedButton';
		controller.like(model.playerId, this.note.note_id);
		this.note.player_liked = 1;
	}

	this.unlikeNote = function()
	{
		this.note.likes = parseInt(this.note.likes) - 1;
		var likeB = document.getElementById('likeButton');
		likeB.innerHTML = this.note.likes + " "  + model.views.likeIcon;
       	likeB.onclick = function(){thism.likeNote();};
		likeB.className = 'Button';
		controller.unlike(model.playerId, this.note.note_id);
		this.note.player_liked = 0;
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

	model.currentNote.text = document.getElementById("caption").value;

  // check for required stuff 
  var requirementsMet = true; 
  var errors = [];

  $('.error').removeClass('error');

	if(!model.currentNote.imageFile)
  {
		errors.push ("select an image"); 
    $('.camera_box').addClass ('error');
		requirementsMet = false;
	}

	if(!model.currentNote.text) //if string is not empty, null or blank
  {
		errors.push ("write a caption");
    $('#caption').addClass ('error');
		requirementsMet = false;
	}

	//map pin starts at default location in lake where no notes are expected. 
	//Google maps map move the pin slightly during map creation, so can't do an exact == comparison
	if(Math.abs(model.currentNote.lat-model.views.defaultLat)<.0001 &&  Math.abs(model.currentNote.lon-model.views.defaultLon)<.0001)
  {
		errors.push ("choose a location");
    // TODO add error to location
		requirementsMet = false;
	}

	if(!requirementsMet)
  {
		alert("Please "+errors.join(", "));
	}
	else{

	//count how many things we'll be uploading before pushing it to HTML
	model.contentsWaitingToUpload = 1; //we have to have an image
	if(model.currentNote.audioFile != null) model.contentsWaitingToUpload += 1; //add one for the audio


	// add location to note
    controller.updateNoteLocation(model.currentNote.noteId, model.currentNote.lat, model.currentNote.lon);

    // add text to note
	controller.addContentToNote(model.currentNote.noteId, '', "TEXT", model.currentNote.text);

    // add image content
    
        var form = new FormData();
        form.append("file", model.currentNote.imageFile);
        form.append("path", model.gameId); // number 123456 is immediately converted to string "123456"

        var imgxhr = new XMLHttpRequest();
        imgxhr.open("POST", SERVER_URL+"/services/v1/uploadHandler.php");
        imgxhr.onreadystatechange = function ClientSideUpdate() {
            if (imgxhr.readyState == 4) 
            {
                model.currentNote.arisImageFileName = imgxhr.responseText;
                controller.addContentToNote(model.currentNote.noteId, model.currentNote.arisImageFileName, "PHOTO", '');
		}
        };
        imgxhr.send(form);
    

    // add tags
	var tags = "Innovation"; //this is the default tag and its radio button is checked, but in case that fails we'll set it here 

    if(document.getElementById("create_tag_1").checked){tags = document.getElementById("create_tag_1").value; controller.addTagToNote(model.currentNote.noteId, tags); }
    if(document.getElementById("create_tag_2").checked){tags = document.getElementById("create_tag_2").value; controller.addTagToNote(model.currentNote.noteId, tags); }
    if(document.getElementById("create_tag_3").checked){tags = document.getElementById("create_tag_3").value; controller.addTagToNote(model.currentNote.noteId, tags); }
    if(document.getElementById("create_tag_4").checked){tags = document.getElementById("create_tag_4").value; controller.addTagToNote(model.currentNote.noteId, tags); }
    if(document.getElementById("create_tag_5").checked){tags = document.getElementById("create_tag_5").value; controller.addTagToNote(model.currentNote.noteId, tags); }

    // add audio content (optional)
    if(model.currentNote.audioFile != null)
    {
        var form = new FormData();
        form.append("file", model.currentNote.audioFile);
        form.append("path", model.gameId); // number 123456 is immediately converted to string "123456"

        var audxhr = new XMLHttpRequest();
        audxhr.open("POST", SERVER_URL+"/services/v1/uploadHandler.php");
        audxhr.onreadystatechange = function ClientSideUpdate() {
            if (audxhr.readyState == 4) 
     	    {
                model.currentNote.arisAudioFileName = audxhr.responseText;
                controller.addContentToNote(model.currentNote.noteId, model.currentNote.arisAudioFileName, "AUDIO", '');
		
			}
        };
        audxhr.send(form);
    }
	

    //hide create note view
    controller.hideCreateNoteView();
	
	}//end else (required content is all present)
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
        content: xconstructMarker(this.note)
        });

    this.marker = imageMarker;
    model.views.markerclusterer.addMarker(this.marker);

    google.maps.event.addListener(this.marker, 'click', function(e) { self.callback(self); });
}

function constructMarker(note)
{
    var html;
	
	//if we haven't determined this note's tag icon url yet (i.e. first time we're rendering it) then figure it out!	
	if(!(note.tags[0].tag_url))
	{
	 	note.tags[0].tag_url = controller.getTagIconURL(note.tags[0].tag);
	}
    var clip;
    var size;
    var height;
    var width;
    var left;
    var top;

	//everything is a photo
        clip = "rect(2px 30px 32px 2px)";
        size = "height='40' width='40'";
        position = "top:0;left:0;";
        height = 40;
        width = 30;
        top = 0;
        left = 0;

    var image = new Image();
    var imageSource = getImageToUse(note);
	image.onload = function() { /*replaceMarkerImage(imageSource);*/ }
    image.src = note.tags[0].tag_url;// imageSource;
    image.style.top = top;
    image.style.left = left;
    image.style.position = "absolute";
    image.style.clip = clip;
    image.height = height;
    image.width = width;

    var outerDiv = document.createElement('div'); 
    outerDiv.style.cursor = "pointer";

    var speechBubble = new Image();
    speechBubble.src = './assets/images/speechBubble2.png';
    speechBubble.height = 51;
    speechBubble.width = 32;

    outerDiv.appendChild(speechBubble);
    outerDiv.appendChild(image);
    //outerDiv.appendChild(innerDiv);

    html = outerDiv.outerHTML;

    return html;
}


function xconstructMarker(note)
{
  var container = document.createElement('div');
  $(container).addClass ("sifter-map-icon");// scale-icon scale-mustdo");
  var image = document.createElement('image');
  image.src = "assets/images/icon_"+getTagIconName(note)+".svg";
  $(container).append(image);
  return container;
}

function getImageToUse(note)
{
    for(i = 0; i < note.contents.length; i++)
        if(note.contents[i].type == "PHOTO") return note.contents[i].media.data.url;
    return "";
}


function getTagIconName(note)
{

  var lookup = {
    "100 Years from Now"  : "100years",
    "Innovation"          : "innovation",
    "Stories of the Past" : "stories",
    "Madison Culture"     : "culture",
    "Must Do"             : "mustdo"
  };
  
  var icon_name = lookup[note.tags[0].tag] || "search"; // unknown icon

  return icon_name;
}

function getAudioToUse(note)
{
    for(i = 0; i < note.contents.length; i++)
        if(note.contents[i].type == "AUDIO") return note.contents[i].media.data.url;
    return "";
};

function getTextToUse(note)
{
    for(i = 0; i < note.contents.length; i++)
        if(note.contents[i].type == "TEXT") return note.contents[i].text;
    return "";
};



function handleImageFileSelect(files)
{
    for(var i = 0; i < files.length; i++)
    {
        var file = files[i];
        var imageType = /image.*/;

	//only jpg, png and gif allowed
	if(!(file.type.match('image/jpeg') || file.type.match('image/png') || file.type.match('image/gif') ))  
	{ 
			window.alert("Please select an image file of type .png, .jpg, .gif");
			return;
	}
	
	//if they submitted a jpEg, let them know we only accept jpg
	if(file.type.match('image/jpeg')){ 
		if(file.name.substring(file.name.lastIndexOf('.')+1).toLowerCase() == "jpeg")
		{
			window.alert(".jpeg not accepted, please choose an image file of type .jpg, .gif or .png");
			return;
		}
	}


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

        if(!(file.type.match('audio/caf') || file.type.match('audio/mp3') || file.type.match('audio/aac') || file.type.match('audio/m4a') ))
		{ 
			window.alert("Please select an audio file of type .mp3, .caf, .aac, .m4a");
			return;
		}

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

function markerMoved(marker, map, html)
{
    var point = marker.getPosition();
    map.panTo(point);

    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({latLng: point}, function(results, status)
    {
        if(status == google.maps.GeocoderStatus.OK && results[0])
        {
          var address_string = results[0].formatted_address;
          document.getElementById('address').innerHTML = address_string; 
        }
    });
    model.currentNote.lat = point.lat();
    model.currentNote.lon = point.lng();
}

function handleNoGeolocation(errorFlag)
{
    if(errorFlag) var content = 'Error: The Geolocation service failed.';
    else          var content = 'Error: Your browser doesn\'t support geolocation.';
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
    $('#in-camera').click();
}

function clickBrowseAudio()
{
    document.getElementById('audioFileInput').click();
}

function clickLogin()
{
    var username = document.getElementById('username_login').value;
    var password = document.getElementById('password_login').value;

    controller.login(username, password);
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
    var password = document.getElementById('password_join').value;
    var username = document.getElementById('username_join').value;	
    controller.createAccount(email, password, username); //CDH added in username
}

function clickForgotPassword()
{
	controller.showForgotView();
}

function clickEmailPassword(){
	
		var usermail = document.getElementById('usermail_forgot').value;


		if(!!usermail){ //email not empty, blank or null

    	    controller.resetAndEmailPassword(usermail);
		}
    	else
        	alert("Enter your e-mail above.");


}

function LoginView()
{
    var template = $('#loginTemplate').html();
    var view = Mustache.render (template);

    this.html = $(view).get(0);
}

function JoinView()
{
    var template = $('#joinTemplate').html();
    var view = Mustache.render (template);

    this.html = $(view).get(0);
}

function ForgotView()
{
    var template = $('#forgotTemplate').html();
    var view = Mustache.render (template);

    this.html = $(view).get(0);
}

function NoteCreateView()
{
    var thism = this; // FIXME needs better name, like view

    /* Constructor */
    this.initialize = function()
    {
      /* Render */
      var template = $('#newTemplate').html();
      var view = Mustache.render (template);

      this.html = $(view).get(0);

      controller.createNewNote ();
      //this.initialize_map ();


      /* Events */
      $(this.html).find('#in-camera').on('change', CropHelper.watch_image_change);
      $(this.html).find('#le-image' ).on('load',   CropHelper.initialize_jcrop);
    };


    /* Methods */ 
    this.initialize_map = function()
    {
      /* Map and Marker */
      var mapOptions = { zoom: 12, mapTypeId: google.maps.MapTypeId.ROADMAP };
      var map = new google.maps.Map (document.getElementById('mapCanvas'), mapOptions);

      var pos = new google.maps.LatLng (model.views.defaultLat, model.views.defaultLon);
      map.setCenter(pos);

      marker = new google.maps.Marker({ map: map, position: pos, draggable: true });

      google.maps.event.addListener(marker, 'dragend', function() { markerMoved(marker, map); } );
      markerMoved(marker, map);


      /* Locate User */
      if(navigator.geolocation) //this may take time to complete, so it'll just move the default when it's ready
      {
        function positionFound(position)
        {
          if(!position) { return; }
          pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          map.setCenter(pos);
          marker.setPosition(pos);
          markerMoved(marker, map);
        }

        function positionNotFound() { handleNoGeolocation(true); }

        navigator.geolocation.getCurrentPosition(positionFound, positionNotFound);
      }


      /* Auto complete location */
      var input = document.getElementById('searchTextField');
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo('bounds', map);

      google.maps.event.addListener(autocomplete, 'place_changed', function()
      {
          var place = autocomplete.getPlace();
          if(place.geometry.viewport)
          {
              map.fitBounds(place.geometry.viewport);
          }
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
    };


    this.initialize();
    setTimeout(this.initialize_map,300);
}


function AboutView()
{
    var template = $('#aboutTemplate').html();
    var view = Mustache.render (template);

    this.html = $(view).get(0);
}
