import { AsyncPromise } from './asyncpromise.js';
import { Utils } from './utils.js';

//Needed for certain components which need to load scripts the old way!
var LoadScript = (url, useCache, frameWorkFile, scriptId) => {
    if (!scriptId) {
        scriptId = "ActiveScript";
    }

    return new Promise((resolve, reject) => {
        //IsDefined removed here isn't yet loaded, we could place it here...
        if (typeof useCache === "undefined" || useCache === null) { useCache = true; }
        if (typeof frameWorkFile === "undefined" || frameWorkFile === null) { frameWorkFile = false; }

        if (!useCache) {
            if (url.indexOf("?") === -1) { url += "?_=" + new Date().getTime(); }
            else { url += "&_=" + new Date().getTime(); }
        }

        RemoveScript(scriptId);

        var script = document.createElement("script");
        script.type = "text/javascript";

        //IE/Edge
        script.onreadystatechange =
            () => {
                this.readyState === "complete" ? resolve() : reject();
            }

        //OtherBrowser then IE/Edge In both instances we need to do this
        script.onload = () => resolve();
        script.onerror = () => reject();

        if (!frameWorkFile) {
            script.id = scriptId;
        }

        script.src = url;

        if (document.body !== null) { document.body.appendChild(script); }
        else { document.head.appendChild(script); }
    });
};

var RemoveScript = (scriptId) => {
    var script = document.getElementById(scriptId);
    if (script) { script.parentElement.removeChild(script); }
}

var LoadScripts = (urls, useCache, frameWorkFiles, timeout) => {
    var apId = Utils.Guid();
    
    var load = () => {
        if (urls.length === 0) {
            AsyncPromise.retrieve(apId).then();
        } else {
            var url = urls.splice(0, 1);
            LoadScript(url, useCache, frameWorkFiles)
                .then(() => { load(); })
                .catch(() => { AsyncPromise.retrieve(apId).catch(); });
        }     
    }
    
    load();

    return AsyncPromise.create(apId, timeout);
}

export { LoadScript, LoadScripts, RemoveScript };