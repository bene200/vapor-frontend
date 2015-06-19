//Try VAPoR data processing pipleline
//imports
var Q = require("q");
var req = require("request");
var Quickblast = require("/Users/bene1/masters_thesis/quickblast/lib/blast");
var Galaxy = require("/Users/bene1/masters_thesis/galaxyJS/lib/galaxy");

//BLAST and Galaxy instances
var blast = new Quickblast("", "blastp", "nr", "protein", "http://localhost:9001/");
var apiKey = "0a53aa0a95b3519f5159a9b36a7442f3";
var baseUrl = "http://127.0.0.1:9000/localhost:8000";
var g = new Galaxy(baseUrl, apiKey);

//First of all I got my input sequence
var gene = ">putative\nMAARQQQKGTGFGVQYEDFVPKSEWKDQPEATILNIDLTGFAKEQMKVTYVHSSKMIRVTGERPLANRKWSRFNEVFTVPQNCLVDKIHGSFKNNVLTITMPKETITKVAYLPETSRTEAAALEKAAKLEEKRLLEESRRKEKEEEEAKQMKKQLLEEKEALIRKLQEEAKAKEEAEMRKLQEEAKAKEEAAAKKLQEEIEAKEKLEERKLEERRLEERKLEDMKLAEEAKLKKIQERKSVDESGEKEKILKPEVVYTKSGHVATPKPESGSGLKSGFGGVGEVVKSAEEKLGNLVEKEKKMGKGIMEKIRRKEITSEEKKLMMNVGVAALVIFALGAYVSYTFCSSSSSSSSSSPSSSSSSTKPE";
blast.setSequence(gene);

//Now I want to BLAST it
console.log("Starting a BLAST search...");
Q.nfcall(blast.search)
.then(function(){
    var fasta = blast.asFasta();
    //Post query to VAPoR REST service..
    console.log("Posting results to the VAPoR database...");
    var payload = {};
    payload.id = 1234;
    payload.query = gene;
    payload.blastout = fasta;
    var opts = {
        uri: 'http://127.0.0.1:9000/localhost:3000/queries',
        method: 'POST',
        json: payload
    };
    req(opts, function(err, res, body){
        //Create a new Galaxy History
        console.log("Creating new History..");
        g.createHistory("VAPoR history browser", function(hist){
            console.log("History: " + hist);
            //Add data to the history
            console.log("Uploading Blast results...");
            console.log("URL: " + opts.uri + "/" + body._id);
            g.uploadToHistory(opts.uri + "/" + body._id, "vapor_blastout.fasta", hist.id, function(inFile){
                //Execute workflow and get results
                inFile = JSON.parse(inFile);
                console.log("Uploaded File: " + inFile);
                var inid = inFile.outputs[0].id;
                var workflow = "ebfb8f50c6abde6d";
                console.log("Running ClustalW...");
                g.executeWorkflow(inid, workflow, "VAPoR clustal history", function(wfout){
                    //Get clustal file content
                    var jobID = wfout.steps[0].job_id;
                    console.log("Workflow Job ID: " + jobID);
                    var waitForJob = setInterval(function(){
                        g.getJob(jobID, function(job){
                            if(job.state !== "ok"){
                                console.log("Running ClustalW...");
                            }
                            else{
                                clearInterval(waitForJob);
                                console.log("Clustal has finished...");
                                console.log("Retrieving msa and phylogenetic tree...");
                                var clustal = null;
                                var newick = null;
                                g.getDatasetContent(wfout.outputs[0], function(n){
                                    newick = n;
                                    g.getDatasetContent(wfout.outputs[1], function(c){
                                        clustal = c;
                                        console.log(clustal);
                                        console.log(newick);
                                    });
                                });
                            }
                        });
                    }, 2000);
                });
            });
        });
    });
});