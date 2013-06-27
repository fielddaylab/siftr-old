function callService(serviceName, callback, GETparams, POSTparams)
{
    var ROOT_URL = "http://dev.arisgames.org"
    var url;
    if(GETparams) url = ROOT_URL+'/server/json.php/v1.'+serviceName+GETparams;
    else          url = ROOT_URL+'/server/json.php/v1.'+serviceName;

    var request = new XMLHttpRequest();
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            if(request.status == 200)
                callback(request.responseText);
            else
                callback(false);
        }
    };
    if(POSTparams)
    {
        request.open('POST', url, true);
        request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        request.send(POSTparams);
        console.log("POSTparams:" + POSTparams);
        console.log("url:" + url);
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
