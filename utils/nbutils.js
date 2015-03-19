// USAGE: callAris('games.getGame', {game_id: 123}, function(x){console.log(x);})
function callAris(serviceName, postJson, callback)
{
    var url = SERVER_URL+'/json.php/v2.'+serviceName;

    var request = new XMLHttpRequest();
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            if(request.status == 200)
            {
                callback( JSON.parse(request.responseText) );
            }
            else
            {
                console.log("request.status = " + request.status);
                callback(false);
            }
        }
    };
    var POSTparams = JSON.stringify(postJson);
    request.open('POST', url, true);
    request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    request.send(POSTparams);
    if (serviceName !== 'users.logIn' && serviceName !== 'users.createUser') {
        console.log("POSTparams: " + POSTparams);
    }
    console.log("url: " + url);
}

function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1;
    var queryEnd   = url.indexOf("#") + 1 || url.length + 1;
    var query      = url.slice(queryStart, queryEnd - 1);

    var params  = {};
    if (query === url || query === "") return params;
    var nvPairs = query.replace(/\+/g, " ").split("&");

    for (var i=0; i<nvPairs.length; i++) {
        var nv = nvPairs[i].split("=");
        var n  = decodeURIComponent(nv[0]);
        var v  = decodeURIComponent(nv[1]);
        if ( !(n in params) ) {
            params[n] = [];
        }
        params[n].push(nv.length === 2 ? v : null);
    }
    return params;
}
