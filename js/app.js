$(document).ready(function(){
    //Dependencies
    var req = require("request");

    //models
    var Intercol = require("./intercol");
    var Annocol = require("./annocol");

    //controller
    var Controller = require("./controller");

    //Vapor REST-URL, Galaxy URL and API key
    var restURL = "http://vapor.biojs.tgac.ac.uk:8081";

    //Get submit button and file from file upload and text field of file upload
    var submit = document.getElementById("submit"),
        fileUpload = document.getElementById("candidate"),
        evalCutoff = document.getElementById("cutoff"),
        log = document.getElementById("log"),
        report = document.getElementById("report");
    
    //init with example sequence
    fileUpload.value = ">example\nATTTTTTGCATTTTTCAAATTGAGAGATTAATAAGTGGGCATGCAAATCTGGTGATTTTGTTTCTGATGTTTTTCTTGATTTGGAGATTTGCAGAATGACTCTGCTTTTAGGCCCTCCAGGCTCAGGGAAGACAACTTTATTGTTGGCTTTGGCTGGAAAACTGAGTTCAGATCTGAAGGTGAGGGAAGACAACTTTTTTGTTTTGTAATTGATTTCTAAAAATCATCCACTAAAGTAATATGATGGACAGCTGACAAATGGGAATTACTCTACTATTGAAATCAGGTTACCGGTAGTGTGACATACAATGGTCACAGCATGAAAGAGTTTGTTCCTGGGAGAACAGCAGCTTATATTGGTCAATATGACCTGCATATTGGTGAGATGACAGTGCGTGAAACTCTGGCCTTCTCTGCAAGATGTCAAGGAGTTGGTACTCGACATGGTATACTTTTCTTCTGCAAACTGGGAATGTTTCATCATTTGATGTTCCTCAAAGTTGATAATTTTCCCCACCATGAAGGCAGAACTAGTGAAATTTTGATACCCATAAACAGACTAAGCCTTCAACAGTTAGTTATAATTCCCGGAAATTGTGTCAAAGACTTCTATTTGATAAAGAGAAAATATTGAGATTTGAGTTCTTCAGAATTAGCCATTCTGCTTTGAGGGATTCAATTCTTTGTTGGTCTCCATTCCTTTCCATCTGCAAAATTTTAACTGCATTTCATGACTGCAGATATGTTGTCTGAATTAGTAAGAAGAGAGAAGCAAGCAAATATCAAACCTGATTCAGATATTGATGTCTTCATGAAGGTAAAATTAAAAAAAAAAAAAAAAAAAACCTCTTGGTTTCAATCACCATAATCCTGTGGCACAAATGTATATATAGAAATTCTTAGTTTGGTATTGAGAACCTTTGTTTTCACACACTCAGGCAATAGGAACTGAAGGACAAGAGACCAGTGTGGTTACAGATTATATACTGAAGGTAAGTATAGTTTTCAAGACAAACATTTGACACTATGCTCGTTAAAGAAAATAGACAACCTAAGCTCTTTTTTTTAAATGCAAACAGATTTTAGGATTGGAAGTCTGCGCCGATACCATGGTAGGAGATGACATGGTGAGAGGCATCTCTGGAGGACAAAGGAAGCGTGTTACTACAGGTGAATTCTAGCTTTACTTGTAGTTTCTCTAGTGCTTGTCATGTTCAATCTGCGGGGGAACACTAACATGCTACTCTTCATCTCCAACTCAAATACTGCAGGTGAGATGCTTGTCGGTCCAGCCAGAGTGTTGCTGATGGATGAGATATCCACTGGTCTAGATAGCTCCACAACCTTCCAGATTGTTGATTCACTCAGGCATTCCATTCACATTCTTGGTGGTACAGCAGTAATCTCATTGCTGCAACCTGCACCAGAGACATATGACCTCTTTGACGATATAATTCTCCTCTCTGATGGGCAAGTTGTGTATCAAGGCCCCCGTGAACATGTGCTTGAGTTCTTTGAGTCCATGGGTTTCAGATGCCCTGAGAGGAAAGGTGTTGCTGACTTCTTGCAAGAAGTAGGTCCTCCGCAATACTCCCCCAGTATCCATTCAATGTAATACTAACTTCAATGTGGTTCTAATTTTTCTTTGTCATTTAAATCCACAGGTGACATCAAGAAAAGATCAGCAGCAGTATTGGGCACGTCATGAGGAACCTTATAGGTATGTGCCTGTGAGAGAATTTGCAGAGGCATTCCACTCATTTCATATCGGCGCGAGCATGGGACATGAGCTCTCTGTCCCTTACGATAAGACCAAGAGCCACCCTGCTGCCCTGGCAACTTCAAAATTTGGTGTTGGCAAGATGGAACTACTGAAAGCTTGCATTTGGAGAGAACAATTGCTGATGAAGAGGAACTCGTTTGTCTACATCTTCAAGGCAGTTCAGGTAAGAATGGAATCTTTCACTGCAGTACAAAATTTCAAATTTCATTAGCAAAACTGTGCTTTGAGCAAATTCATGCTTGTATTTTCAGCTTTGTGTCATGGCGTTCATCACAATGACACTCTTCTTCCGCACAAATATGCACCATGATACAGTAACTGATGGAGGAATTTACATGGGTGCACTCTTCTTCGGGATCCTCTCAATCATGTTCAATGGATTCTCAGAACTTGCCATGACCATAATGAAGCTTCCTGTTTTCTTCAAGCAAAGAGATCTTCTCTTTTTCCCTGCATGGGCTTATGCCTTGCCATCGTGGATTCTGAAGATACCCATCACATTTATGGAAGTTGGAGTCTGGGTGTTCACAACATACTATGTCATAGGATTTGATCCCAATGTTGGAAGGTGAGAAACCACTCTGACTTCAGTACTGCTGCAATTAGTTGCAGAGTGAAATTAATGTCAAGCCTCCAATTCTTGATTCAGTGAGACAATACGATGATTTTCTCACATGTACTGCAGGCTGTTCAAGCAATATCTGCTCCTCCTTTGTGTCCAGCAAATGGCATCTGCTTTATTTCGGTTCATTGCAGCGCTAGGTAGGAACATGATTGTTGCCAATACTTTTGGATCTTTTGCGCTCCTTGTGCTAATGGTGCTGGGTGGATTCATCATTTCAAGAGGTATTTCTGATAGCCATCTCTCTGTTGTCAGCCATACAAACTTTGCTGCTCTAATTTTTCACAAATTAAAACTCTACTTGACCTTTAATTACTTTTAACTGACAGAGGACATAAAGAAATGGTGGATATGGGGTTACTGGATTTCACCCTTGATGTACTCACAAAATGCAATTACCACAAATGAATTTCTAGGGAAAAAGTGGAGACATGTAAGAGTGCTTATCATAATTATTTTTCCCCTACAAAAACAAATAATGCTAAGAAAAGAAAAACCATCAACTTATTATGCAATAAAGGAAGGAAAGGCTCTAGGGAAACAAAAACAGCTTACCATTCAAAATTGTAACAGATTTCTCCTGGATCAACGGAGC";

    //A click on the submit button triggers upload and data transformation
    submit.addEventListener("click", function(e){
        var query = fileUpload.value,
            eval = evalCutoff.value,
            spinner = document.getElementById("spinner"),
            vo = null,
            inter = null;
            
        document.getElementById("cy").style.display = "none";
        document.getElementById("expr").style.display = "none";

        if(!checkInput(query)){
            alert("Please provide an input sequence in FASTA format.");
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
                    log.value = "No matches. Maybe try a higher E-value cutoff? \n" + log.value;
                }
                else if(body === "TOOOMANY"){
		    log.value = "More than 50 matches. Please try a lower E-value cut off \n" + log.value;
		}
                else{
                    log.value = "Response received from server \n" + log.value;
		    console.log(body);
                    vaporObj = {
                        msa: body.msa,
                        phylotree: body.phylotree,
                        interactions: new Intercol(body.interactions),
                        anno: new Annocol(body.anno),
                        expr: body.expr
                    };

                    v = new Controller(vaporObj);
                    report.style.display = "block";
                    report.addEventListener("click", function(e){
                        var r = require("./report").report(vaporObj);	
                    });
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
    function checkInput(query){
        var parts = query.split("\n");
        var ok = true;
        if(parts.length !== 2){
            ok = false;
        }
        if(parts[0][0] !== ">"){
            ok = false;
        }
        var pattern = /[0-9]/;
        if(pattern.test(parts[1])){
            ok = false;
        }
        return ok;
    }
});
