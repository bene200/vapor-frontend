    $(document).ready(function(){
    //Dependencies
    var req = require("request");

    //models
    var Intercol = require("./intercol");
    var Annocol = require("./annocol");

    //controller
    var Controller = require("./controller");

    //Vapor REST-URL, Galaxy URL and API key
    // var restURL = "http://10.0.63.98:3000";
    var restURL = "http://localhost:3000";

    //Get submit button and file from file upload and text field of file upload
    var submit = document.getElementById("submit"),
        fileUpload = document.getElementById("candidate")
        log = document.getElementById("log");

    //init with example sequence
    fileUpload.value = ">example\nMAARQQQKGTGFGVQYEDFVPKSEWKDQPEATILNIDLTGFAKEQMKVTYVHSSKMIRVTGERPLANRKWSRFNEVFTVPQNCLVDKIHGSFKNNVLTITMPKETITKVAYLPETSRTEAAALEKAAKLEEKRLLEESRRKEKEEEEAKQMKKQLLEEKEALIRKLQEEAKAKEEAEMRKLQEEAKAKEEAAAKKLQEEIEAKEKLEERKLEERRLEERKLEDMKLAEEAKLKKIQERKSVDESGEKEKILKPEVVYTKSGHVATPKPESGSGLKSGFGGVGEVVKSAEEKLGNLVEKEKKMGKGIMEKIRRKEITSEEKKLMMNVGVAALVIFALGAYVSYTFCSSSSSSSSSSPSSSSSSTKPE";

    //A click on the submit button triggers upload and data transformation
    submit.addEventListener("click", function(e){
        var query = fileUpload.value,
            spinner = document.getElementById("spinner"),
            vo = null,
            inter = null;

        if(fileUpload.value === ""){
            alert("No candidate sequence");
        }
        else {
            //Trigger loading spinner
            spinner.style.visibility = "visible";
            log.value = "Processing data ... \n";

            req({
                uri: restURL,
                method: "POST",
                json: { query: query }
            }, function(err, req, body){
                spinner.style.visibility = "hidden";
                console.log(body);

                vaporObj = {
                    msa: body.msa,
                    phylotree: body.phylotree,
                    interactions: new Intercol(body.interactions),
                    anno: new Annocol(body.anno),
                    expr: body.expr
                };

                v = new Controller(vaporObj);
            });
        }

    });
});
