window.addEventListener('load', pageLoad, false);

//Defining here to make available to everyone
var model;
var controller;

function pageLoad() {
    //Initialize stuff
    controller = new Controller();
    model = new Model();
    model.finishLoad(startLoadGame);

    if (navigator.appName == 'Microsoft Internet Explorer') alert('You might need to install quicktime to properly view some media.\n(http://www.apple.com/quicktime/download)');
}

function startLoadGame() {
    startSift('top');
}

var lastSiftTime = 0;

function finishLoadGame(responseData, thisSiftTime, callback) {
    if (thisSiftTime !== lastSiftTime) {
        console.log('Throwing out a Sift because it was overridden.');
        return;
    }

    if (responseData.returnCode == 1) //Error
    {
        document.getElementById('messageContent').innerHTML = responseData.data;
        return;
    }
    model.populateFromData(responseData.data);


    controller.populateAllFromModel();

    //  Set actual page visible
    document.getElementById('messageContent').innerHTML = "";
    document.getElementById('message').style.display = 'none';

    google.maps.event.trigger(model.views.gmap, 'resize'); // To fix google maps incorrect sizing bug

    if (callback) callback();
}

function startSift(siftType, callback) {
    model.lastSiftType = siftType;

    var thisSiftTime;
    thisSiftTime = lastSiftTime = Date.now();

    model.views.mainViewLeft.innerHTML = ''; //clear out old notes
    document.getElementById('messageContent').innerHTML = "Sifting...";
    document.getElementById('message').style.display = 'block'; //this is set to hidden after page loads first time

    //we remember this in model so that on tag or searchs we can retrieve the last used sift
    var searchTypeCode = model.getSiftTypeCode(siftType);

    //check to see if any search terms have been set, if so, build an array by word
    var searchText = $('.sifter-filter-search-input').filter(":visible").val();
    var searchTerms = (searchText ? searchText.split(" ") : [""]);
    if (searchTerms[0] === "") {
        searchTerms = [];
    }

    //see which tags have been set and put their id #s in the selectedTags array
    var selectedTags = [];
    for (var i = 1; i <= model.tags.length; i++) {
        tagItem = document.getElementById("tag" + i);
        if (tagItem.checked) {

            //each tag has an ID number, which must be sent to the JSON for the query to work right
            var tagIdNum;
            var tagValue = tagItem.value.toLowerCase().trim();
            for (var j = 0; j <= model.tags.length; j++) {
                if (tagValue === model.tags[j].tag.toLowerCase().trim()) {
                    tagIdNum = model.tags[j].tag_id;
                    break;
                }
            }
            selectedTags[selectedTags.length] = tagIdNum;
        }
    }

    var siftObj = {
        game_id: model.gameId,
        search_terms: searchTerms,
        tag_ids: selectedTags,
        order_by: 'recent',
        user_id: model.playerId,
        auth: getAuthObject(),
    };
    switch (siftType) {
        case "popular":
            siftObj.order_by = 'popular';
            break;
        case "mine":
            siftObj.filter_by = 'mine';
            break;
        case "top":
        case "recent":
        case "tags":
        case "search":
            break;
        default:
            console.log("Error in sift type: " + siftType);
    }
    callAris("notes.searchNotes", siftObj, function(obj) {
        finishLoadGame(obj, thisSiftTime, callback);
    });
}
