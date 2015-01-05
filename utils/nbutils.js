function callService(serviceName, callback, GETparams, POSTparams)
{
    var displayArguments = Array.prototype.slice.call(arguments, 0);
    if (displayArguments[0] === 'players.getLoginPlayerObject')
    {
        var namePass = displayArguments[2];
        var slash = namePass.lastIndexOf('/');
        namePass = namePass.substring(0, slash + 1) + '******';
        displayArguments[2] = namePass;
    }
    console.log("calling for service", displayArguments);
    var url;
    if(GETparams) url = SERVER_URL+'/json.php/v1.'+serviceName+GETparams;
    else          url = SERVER_URL+'/json.php/v1.'+serviceName;

    var request = new XMLHttpRequest();
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            if(request.status == 200)
			{
                callback(request.responseText);
            }
			else
			{
				console.log("request.status = " + request.status);
                callback(false);
			}
        }
    };
    if(POSTparams)
    {
        request.open('POST', url, true);
        request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        request.send(POSTparams);
        console.log("POSTparams: " + POSTparams);
        console.log("url: " + url);
    }
    else
    {
        request.open('GET', url, true);
        request.send();
    }
}

// USAGE: callService2('games.getGame', function(x){console.log(x);}, '', '{"game_id": 123}')
function callService2(serviceName, callback, GETparams, POSTparams)
{
    var displayArguments = Array.prototype.slice.call(arguments, 0);
    if (displayArguments[0] === 'users.logIn') // TODO: fix for v2
    {
        displayArguments[3] = '[REDACTED]';
    }
    console.log("calling for service", displayArguments);
    var url;
    if(GETparams) url = SERVER_URL+'/json.php/v2.'+serviceName+GETparams;
    else          url = SERVER_URL+'/json.php/v2.'+serviceName;

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
    if(POSTparams)
    {
        request.open('POST', url, true);
        request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        request.send(POSTparams);
        console.log("POSTparams: " + POSTparams);
        console.log("url: " + url);
    }
    else
    {
        request.open('GET', url, true);
        request.send();
    }
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
