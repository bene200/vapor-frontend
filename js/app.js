$(document).ready(function(){
    //Dependencies
    var req = require("request");

    //models
    var Intercol = require("./intercol");
    var Annocol = require("./annocol");

    //controller
    var Controller = require("./controller");

    //Vapor REST-URL, Galaxy URL and API key
    var restURL = "http://10.0.63.98:3000";
    // var restURL = "http://localhost:3000";

    //Get submit button and file from file upload and text field of file upload
    var submit = document.getElementById("submit"),
        fileUpload = document.getElementById("candidate"),
        evalCutoff = document.getElementById("cutoff"),
        log = document.getElementById("log");

    //init with example sequence
    fileUpload.value = ">example\nATGATGAATCAGAATTGCTTTAATTCTTGTTCACCTCTAACTGTTGATGCACTTGAACCAAAAAAATCCTCTTGTGCTGCTAAATGCATACAAGTAAATGGTCCTCTTATTGTTGGAGCTGGCCCTTCAGGCCTGGCTACTGCTGCCGTCCTTAAGCAATACAGTGTTCCGTATGTAATCATTGAACGCGCGGACTGCATTGCTTCTCTGTGGCAACACAAGACCTACGATCGGCTTAGGCTTAACGTGCCACGACAATACTGCGAATTGCCTGGCTTGCCATTTCCACCAGACTTTCCAGAGTATCCAACCAAAAACCAATTCATCAGCTACCTCGTATCTTATGCAAAGCATTTCGAGATCAAACCACAACTCAACGAGTCAGTAAACTTAGCTGGATATGATGAGACATGTGGTTTATGGAAGGTGAAAACAGTTTCTGAAATCAATGGTTCAACCTCTGAATACATGTGTAAGTGGCTTATTGTGGCCACAGGAGAGAATGCTGAGATGATAGTGCCCGAATTCGAAGGATTGCAAGATTTTGGTGGCCAGGTTATTCATGCTTGTGAGTACAAGACTGGGGAATACTATACTGGAGAAAATGTGCTGGCGGTTGGCTGTGGCAATTCCGGGATCGATATCTCACTTGATCTTTCCCAACATAATGCAAATCCATTCATGGTAGTTCGAAGCTCGGTACAGGGTCGTAATTTCCCTGAGGAAATAAACATAGTTCCAGCAATCAAGAAATTTACTCAAGGAAAAGTAGAATTTGTTAATGGACAAATTCTAGAGATCGACTCTGTTATCTTGGCAACTGGTTATACCAGCAATGTAACTTCTTGGTTAATGGAGAGTGAATTTTTTTCAAGGGAGGGATGTCCAAAAAGCCCATTCCCAAATGGTTGGAAGGGGGAGGATGGTCTCTATGCAGTTGGATTTACAGGAATAGGACTGTTTGGTGCTTCTATAGATGCCACTAATGTTGCACAAGATATTGCCAAAATTTGGAAAGAACAAATGTAG";

    //A click on the submit button triggers upload and data transformation
    submit.addEventListener("click", function(e){
        var query = fileUpload.value,
            eval = evalCutoff.value,
            spinner = document.getElementById("spinner"),
            vo = null,
            inter = null;

        if(fileUpload.value === ""){
            alert("No candidate sequence");
        }
        else {
            //Clear page before processing the new query
            clearPage()
            //Trigger loading spinner
            spinner.style.visibility = "visible";
            log.value = "Processing data ... \n" + log.value;

            req({
                uri: restURL,
                method: "POST",
                json: { query: query, eval: parseFloat(eval) }
            }, function(err, req, body){
                spinner.style.visibility = "hidden";
                if(body === "NA"){
                    log.value = "No matches. Maybe try a higher cutoff? \n" + log.value;
                }
                else{
                    vaporObj = {
                        msa: body.msa,
                        phylotree: body.phylotree,
                        interactions: new Intercol(body.interactions),
                        anno: new Annocol(body.anno),
                        expr: body.expr
                    };

                    v = new Controller(vaporObj);
                }
            });
        }

    });

    function clearPage(){
        document.getElementById("tnt").innerHTML = "";
        document.getElementById("msa").innerHTML = "";
        document.getElementById("cy").innerHTML = "";
        document.getElementById("gene-info").innerHTML = "";
        document.getElementById("expr").innerHTML = "";
        document.getElementById("legend").innerHTML = "";
    }
});
