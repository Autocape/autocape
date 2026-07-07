// (C) Felixmax_ 2023
var lang = navigator.language || navigator.userLanguage;
var pageid = "0";
var translationjson = {};


function localizecontent(divid){
    var div = document.getElementById(divid);
    if (div == null) {
        console.log("%c[localize.js] Error: localizecontent() could not find element with id " + divid, "color: red;");
    }
    if (translationjson == {}) {
        console.log("%c[localize.js] Error: localizecontent() could not find translation data. probaply because plugin was never initialized! ", "color: red;");
    }
    


}

function initlocalize(pageident){
    console.log("%c[localize.js] Initializing localization for page " + pageident + " in language " + lang + "...", "color: blue;");
    pageid = pageident;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "localize/" + lang + "/" + pageid, true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                translationjson = JSON.parse(xhr.responseText);
                console.log("%c[localize.js] Loaded translation data for page " + pageid + " in language " + lang + "!", "color: green;");
                return true;

            } else if (xhr.status === 404) {
                console.error(xhr.statusText);

            }
        }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);

    };
    xhr.send(null);
}