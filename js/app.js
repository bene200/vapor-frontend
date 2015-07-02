$(document).ready(function(){
    //Dependencies
    var req = require("request");

    //Vapor REST-URL, Galaxy URL and API key
    var restURL = "http://10.0.63.98:3000";
    // var restURL = "http://localhost:3000";

    //Get submit button and file from file upload and text field of file upload
    var submit = document.getElementById("submit"),
        fileUpload = document.getElementById("candidate");

    //init with example sequence
    fileUpload.value = ">example\nMAARQQQKGTGFGVQYEDFVPKSEWKDQPEATILNIDLTGFAKEQMKVTYVHSSKMIRVTGERPLANRKWSRFNEVFTVPQNCLVDKIHGSFKNNVLTITMPKETITKVAYLPETSRTEAAALEKAAKLEEKRLLEESRRKEKEEEEAKQMKKQLLEEKEALIRKLQEEAKAKEEAEMRKLQEEAKAKEEAAAKKLQEEIEAKEKLEERKLEERRLEERKLEDMKLAEEAKLKKIQERKSVDESGEKEKILKPEVVYTKSGHVATPKPESGSGLKSGFGGVGEVVKSAEEKLGNLVEKEKKMGKGIMEKIRRKEITSEEKKLMMNVGVAALVIFALGAYVSYTFCSSSSSSSSSSPSSSSSSTKPE";

    //A click on the submit button triggers upload and data transformation
    submit.addEventListener("click", function(e){
        var l, query = fileUpload.value,
            View = require("./view"), v;

        if(fileUpload.value === ""){
            alert("No candidate sequence");
        }
        else {
            //Trigger loading spinner
            e.preventDefault();
            l = Ladda.create(this);
            l.start();

            req({
                uri: restURL,
                method: "POST",
                json: { query: query }
            }, function(err, req, body){
                v = new View(body);
                v.init();
                v.render();
            });

            l.stop();
        }

    });    
});