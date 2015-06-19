$(document).ready(function(){
    var vaporObj = {
        blastProxy : "",
        galaxyProxy : "",
        mode : "example",
        restURL : "",
        galaxyURL : "",
        apiKey : "",
        query : ""
    };
    var Vapor = require("vapor"),
        vap = new Vapor(vaporObj);
    
    vap.run();
});