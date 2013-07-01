function Model()
{
    this.gameId = YOI_GAME_ID;
    this.playerId = 0;
    this.gameJSONText = '';
    this.gameData = {};
    this.backpacks = [];
    this.currentNote = {};
    this.currentNote.noteId = 0;
    this.audio_context = '';
    this.recorder = '';

    this.notes = [];
    this.addNote = function(note)
    {
        this.notes[this.notes.length] = note;
    }
    this.mapNotes = [];
    this.mapMarkers = [];
    this.addMapNote = function(mapNote)
    {
        mapNote.geoloc = new google.maps.LatLng(mapNote.lat, mapNote.lon);
        this.mapNotes[this.mapNotes.length] = mapNote;
    }

    this.views = new function Views()
    { 
        //Content
        this.mainView = document.getElementById('main_view_full');
        this.mainView.addEventListener('click', function(e) { e.stopPropagation(); });
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

        //Map
        this.map = document.getElementById('main_view_map');
        var centerLoc = new google.maps.LatLng(0, 0);
        var myOptions = { zoom:5, center:centerLoc, mapTypeId:google.maps.MapTypeId.ROADMAP };
        this.gmap = new google.maps.Map(this.map, myOptions);

        // setup info area
        document.getElementById('main_view_info').innerHTML = 'Tags:<br />'+
        '<input id="tag1" value="Innovation" type="checkbox" checked="checked" onchange="controller.repopulateAll()">'+
            'Innovation'+
        '</input><br />'+
        '<input id="tag2" value="Stories of the Past" type="checkbox" checked="checked" onchange="controller.repopulateAll()">'+
            'Stories of the Past'+
        '</input><br />'+
        '<input id="tag3" value="Madison Culture" type="checkbox" checked="checked" onchange="controller.repopulateAll()">'+
            'Madison Culture'+
        '</input><br />'+
        '<input id="tag4" value="Must Do" type="checkbox" checked="checked" onchange="controller.repopulateAll()">'+
            'Must Do'+
        '</input><br />'+
        '<input id="tag5" value="100 Years from Now" type="checkbox" checked="checked" onchange="controller.repopulateAll()">'+
            '100 Years from Now'+
        '</input><br />'+
        '<br /><span> Search: <input id="filterbox" type="text" onchange="controller.repopulateAll()"/></span><br /><br /><br /><button onClick="JavaScript:controller.noteCreate()" class="button">Upload</button>';

        // marker clusterer
        var mcOptions = {styles: [{
                height: 53,
                url: "./assets/images/speechBubble_cluster_large.png",
                width: 41,
                anchor:[15,17],
                fontFamily:"Helvetica, Arial"
            },
            {
                height: 53,
                url: "./assets/images/speechBubble_cluster_large.png",
                width: 41,
                anchor:[15,13],
                fontFamily: "Helvetica, Arial"
            },
            {
                height: 53, 
                url: "./assets/images/speechBubble_cluster_large.png",
                width: 41,
                anchor:[15,13],
                fontFamily: "Helvetica, Arial"
            },
            {
                height: 53,
                url: "./assets/images/speechBubble_cluster_large.png",
                width: 41,
                anchor:[15,13],
                fontFamily: "Helvetica, Arial"
            },
            {
                height: 53,
                url: "./assets/images/speechBubble_cluster_large.png",
                width: 41,
                anchor:[15,13],
                fontFamily: "Helvetica, Arial"
            }
        ]};
        
        this.markerclusterer = new MarkerClusterer(this.gmap,[],mcOptions);
        
        this.markerclusterer.setMinimumClusterSize(3)
    };
}
