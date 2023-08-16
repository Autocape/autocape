// (c) Felixmax_ 2023

if (window.localStorage.getItem("turntoken") == null) {
    window.location.href = "https://cloaks.lol/challange?redirect=" + window.location.href; 
}
else if (window.localStorage.getItem("turntoken") == "XXXX.DUUMMY.TOKEN.XXXX") {
    alert("Debug mode pls return with valid token in localstorage");
}