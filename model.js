function Model()
{
	self = this;
    this.gameId = YOI_GAME_ID;
	this.displayName = ""; // for displaying newly added content
    this.gameJSONText = '';
	this.gameNotes = []; //this is using new API
    this.currentNote = {};
    this.currentNote.noteId = 0;
    this.audio_context = '';
    this.recorder = '';
	this.contentWaitingToUpload = 0; // when user uploads multiple contents, you'll have to wait till all are uploaded before you can push it to HTML
    this.mapMarkers = [];
	this.tags = '';
	this.serverCallsToLoad = 5; //right now, we have 5 consecutive server calls for icon URLS, all must complete before we can continue
	this.loadFinishCallback = '' ;

	self.playerId = 0;

	this.finishLoad = function(callback){
		//dynamically load the tags and their icon urls from the server
		
		if(callback) //this is set when it's called from index
		{	
			this.loadFinishCallback = callback;
			callService("notes.getAllTagsInGame", model.loadTagsFromServer,"/"+ this.gameId, false);
		}
		else  //it's being called from the laodTagsFromServer's returning
		{
			this.serverCallsToLoad--; //one more is loaded
			//not untill all the server calls return can we proceed
			if(this.serverCallsToLoad <= 0){ 
				this.loadFinishCallback();
			}
		}	
	}

	
	//check to see if they have a session cookie with their playerId and can skip login, if not set it to zero
	if($.cookie("sifter") > 0)
	{
		self.playerId = $.cookie("sifter");
	}

	this.loadTagsFromServer = function(response){
		//format tag array
		model.tags = JSON.parse("[" + response + "]")[0].data;

	
		//retrieve and store icon URLs

			callService("media.getMediaObject", function(response){model.tags[0].iconURL = JSON.parse("[" + response + "]")[0].data.url; model.finishLoad(); }, "/"+model.gameId+ "/" + model.tags[0].media_id, false);
			callService("media.getMediaObject", function(response){model.tags[1].iconURL = JSON.parse("[" + response + "]")[0].data.url; model.finishLoad(); }, "/"+model.gameId+ "/" + model.tags[1].media_id, false);
			callService("media.getMediaObject", function(response){model.tags[2].iconURL = JSON.parse("[" + response + "]")[0].data.url; model.finishLoad(); }, "/"+model.gameId+ "/" + model.tags[2].media_id, false);
			callService("media.getMediaObject", function(response){model.tags[3].iconURL = JSON.parse("[" + response + "]")[0].data.url; model.finishLoad(); }, "/"+model.gameId+ "/" + model.tags[3].media_id, false);
			callService("media.getMediaObject", function(response){model.tags[4].iconURL = JSON.parse("[" + response + "]")[0].data.url; model.finishLoad(); }, "/"+model.gameId+ "/" + model.tags[4].media_id, false);
	}

    this.addNoteFromData = function(note)
    { 
        //Fix up note tags
        note.tagString = note.tags[0].tag;  //all notes are required to have one, and only one, tag
        note.geoloc = new google.maps.LatLng(note.lat, note.lon);
        this.gameNotes[this.gameNotes.length] = note;
    }

    this.populateFromData = function(rawNotes)
    {	//the notes coming in need some processing
		this.gameNotes = []; //empty out old notes
		this.rawNotes = rawNotes;
        for(var i = 0; i < this.rawNotes.length; i++)
        {
                this.addNoteFromData(this.rawNotes[i]);
        }
		
    };

    this.views = new function Views()
    { 
        //Content
        this.mainView 					= document.getElementById('main_view_full');
        //this.mainView.addEventListener('click', function(e) { e.stopPropagation(); }); 
		//don't know why this is commented out, but if we don't need it we don't need the removeEventListeners either
        this.mainViewLeft              = document.getElementById('main_view_left');
		this.mainViewRight			   = document.getElementById('main_view_right');
        this.createNoteViewContainer   = document.getElementById('create_note_view_container');
        this.noteViewContainer         = document.getElementById('note_view_container');
        
		this.noteViewCloseButton       = new ActionButton(document.getElementById('note_view_close_button'), controller.hideNoteView);
        this.createNoteViewCloseButton = new ActionButton(document.getElementById('create_note_view_close_button'), controller.hideCreateNoteView);
        this.loginViewCloseButton      = new ActionButton(document.getElementById('login_view_close_button'), controller.hideLoginView);
        this.joinViewCloseButton       = new ActionButton(document.getElementById('join_view_close_button'), controller.hideJoinView);
        this.forgotViewCloseButton     = new ActionButton(document.getElementById('forgot_view_close_button'), controller.hideForgotView);        

		this.loginViewContainer        = document.getElementById('login_view_container');
        this.joinViewContainer         = document.getElementById('join_view_container');
        this.forgotViewContainer       = document.getElementById('forgot_view_container');
        this.constructNoteView         = document.getElementById('note_view_construct');
        this.constructNoteCreateView   = document.getElementById('note_create_view_construct');
        
		this.constructLoginView     	= document.getElementById('login_view_construct');
        this.constructJoinView      	= document.getElementById('join_view_construct');
        this.constructForgotView      	= document.getElementById('forgot_view_construct');

		this.uploadButton 				= document.getElementById('uploadButton'); 
		this.loginButton				= document.getElementById('loginButton'); 
		this.logoutButton				= document.getElementById('logoutButton');
		this.siftMineButton				= document.getElementById('siftMineButton');

		if(self.playerId > 0){ //if the cookie indicated they are logged in
			this.loginButton.style.display = 'none'; // hide login
			this.logoutButton.style.display = 'inline'; //They are logged in, let them log out
    		this.uploadButton.style.display = 'inline'; // show upload		
			this.siftMineButton.style.display = 'inline'; //show sift by mine
		}
		else{
			this.uploadButton.style.display = 'none'; // hide until login
			this.logoutButton.style.display = 'none';
			this.siftMineButton.style.display = 'none'; //this is meaningless until you are logged in
		}

        this.likeIcon     = '<img id="likeIcon" src="./assets/images/LikeIcon.png" height=10px; />';
        this.commentIcon  = '<img src="./assets/images/CommentIcon.png" height=8px; />';
        this.noteIcon     = '';

		this.darkness		    = document.getElementById("darkBackgroundLayer");
		this.darkness.style.display = 'none'; 

        //Map
        this.map = document.getElementById('main_view_map');
        var centerLoc = new google.maps.LatLng(0, 0);
        var myOptions = { zoom:5, center:centerLoc, mapTypeId:google.maps.MapTypeId.ROADMAP };
        this.gmap = new google.maps.Map(this.map, myOptions);
		
		//default map pin location is in lake, where no notes are expected. User must move this pin to submit a note.
		this.defaultLat = 43.081829;
		this.defaultLon = -89.402313;
 
        // marker clusterer
        var mcOptions = { styles: [
            { height:53, url:"./assets/images/speechBubble_cluster_large.png", width:41, anchor:[15,17], fontFamily:"Helvetica, Arial" },
            { height:53, url:"./assets/images/speechBubble_cluster_large.png", width:41, anchor:[15,13], fontFamily:"Helvetica, Arial" },
            { height:53, url:"./assets/images/speechBubble_cluster_large.png", width:41, anchor:[15,13], fontFamily:"Helvetica, Arial" },
            { height:53, url:"./assets/images/speechBubble_cluster_large.png", width:41, anchor:[15,13], fontFamily:"Helvetica, Arial" },
            { height:53, url:"./assets/images/speechBubble_cluster_large.png", width:41, anchor:[15,13], fontFamily:"Helvetica, Arial" }
        ]};
        
        this.markerclusterer = new MarkerClusterer(this.gmap,[],mcOptions);
        
        this.markerclusterer.setMinimumClusterSize(3)
    };
}
