function Model()
{
    this.gameId = YOI_GAME_ID;
    this.playerId = 0;
    this.displayName = ""; //CDH for displaying newly added content
    this.gameJSONText = '';
    this.gameData = {};
    this.backpacks = [];
    this.currentNote = {};
    this.currentNote.noteId = 0;
    this.audio_context = '';
    this.recorder = '';

    this.notes = [];
    this.mapMarkers = [];
    this.addNoteFromData = function(note)
    { 
        //Fix up note tags
        note.tags.sort(
            function(a, b) {
                if(a.tag.toLowerCase() < b.tag.toLowerCase()) return -1;
                if(a.tag.toLowerCase() > b.tag.toLowerCase()) return 1;
                return 0;
            });
        if(note.tags.length == 0) note.tags[0] = {"tag":'(untagged)'}; //conform to tag object structure
        note.tagString = '';
        for(var k = 0; k < note.tags.length; k++)
            note.tagString += note.tags[k].tag+', ';
        note.tagString = note.tagString.slice(0,-2); 
        note.geoloc = new google.maps.LatLng(note.lat, note.lon);
        this.notes[this.notes.length] = note;
    }

    this.populateFromData = function(gameData)
    {
        this.gameData = gameData;

        this.backpacks = this.gameData.backpacks;
        for(var i = 0; i < this.backpacks.length; i++)
        {
            if(this.backpacks[i] == "Invalid Player ID") continue;
            for(var j = 0; j < this.backpacks[i].notes.length; j++)
                this.addNoteFromData(this.backpacks[i].notes[j])
        }
    };

    this.views = new function Views()
    { 
        //Content
        this.mainView = document.getElementById('main_view_full');
        //this.mainView.addEventListener('click', function(e) { e.stopPropagation(); });
        this.mainViewLeft              = document.getElementById('main_view_left');
        this.createNoteViewContainer   = document.getElementById('create_note_view_container');
        this.noteViewContainer         = document.getElementById('note_view_container');
        this.noteViewCloseButton       = new ActionButton(document.getElementById('note_view_close_button'), controller.hideNoteView);
        this.createNoteViewCloseButton = new ActionButton(document.getElementById('create_note_view_close_button'), controller.hideCreateNoteView);
        this.loginViewCloseButton      = new ActionButton(document.getElementById('login_view_close_button'), controller.hideLoginView);
        this.joinViewCloseButton       = new ActionButton(document.getElementById('join_view_close_button'), controller.hideJoinView);
        this.loginViewContainer        = document.getElementById('login_view_container');
        this.joinViewContainer         = document.getElementById('join_view_container');
        this.constructNoteView         = document.getElementById('note_view_construct');
        this.constructNoteCreateView   = document.getElementById('note_create_view_construct');
        this.constructLoginView        = document.getElementById('login_view_construct');
        this.constructJoinView         = document.getElementById('join_view_construct');

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
