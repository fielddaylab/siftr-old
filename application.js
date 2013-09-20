window.addEventListener('load', pageLoad, false);

//Defining here to make available to everyone
var model;
var controller;

function pageLoad()
{
    //Initialize stuff
    controller = new Controller();
    model = new Model();
    model.finishLoad(startLoadGame);

    if(navigator.appName == 'Microsoft Internet Explorer') alert('You might need to install quicktime to properly view some media.\n(http://www.apple.com/quicktime/download)');
}

function startLoadGame()
{
    document.getElementById('message').innerHTML = "&nbsp; <img height='12px' src='assets/images/spinner.gif'></img> Waiting on Server...";
    callService("notes.getNotesWithAttributes", finishLoadGame, '', JSON.stringify({ gameId:model.gameId, searchTerms:[], noteCount:50, searchType:0, playerId:model.playerId, tagIds:[], lastLocation:0, date:0}));
}


function finishLoadGame(responseText)
{
    model.gameJSONText = responseText;
    responseData=JSON.parse(responseText);
    if(responseData.returnCode == 1) //Error
    {
        document.getElementById('message').innerHTML = responseData.data;	
        return;
    }
    model.populateFromData(responseData.data);

    document.getElementById('message').innerHTML = "";

    controller.populateAllFromModel();

    //  Set actual page visible
    document.getElementById('message').style.display = 'none';
    document.getElementById('content').style.display = 'block';

    google.maps.event.trigger(model.views.gmap, 'resize'); // To fix google maps incorrect sizing bug

}

function startSift(siftType){
	model.views.mainViewLeft.innerHTML = ''; //clear out old notes
    document.getElementById('message').innerHTML = "&nbsp; <img height='12px' src='assets/images/spinner.gif'></img>Sifting....";
    document.getElementById('message').style.display = 'block'; //this is set to hidden after page loads first time

	switch(siftType){
		case "top":
		 	siftString =  JSON.stringify({ gameId:model.gameId, searchTerms:[], noteCount:50, searchType:0, playerId:0, tagIds:[], lastLocation:0, date:0});
			break;
		case "recent":
			//don't use the date paramenter, bc then it'll only find the notes created since that date. We want it to just sort the notes by date & give 50 mores recent
		 	siftString =  JSON.stringify({ gameId:model.gameId, searchTerms:[], noteCount:50, searchType:2, playerId:0, tagIds:[], lastLocation:0, date:""});
			break;
		case "popular":
		 	siftString =  JSON.stringify({ gameId:model.gameId, searchTerms:[], noteCount:50, searchType:1, playerId:0, tagIds:[], lastLocation:0, date:0});
			break;
		case "mine":
		 	siftString =  JSON.stringify({ gameId:model.gameId, searchTerms:[], noteCount:50, searchType:3, playerId:model.playerId, tagIds:[], lastLocation:0, date:0});
			break;
		default: siftString = "kSearchTop"; console.log("Error in sift type: " + siftType) ;
	}
    callService("notes.getNotesWithAttributes", finishLoadGame, '', siftString);
}

