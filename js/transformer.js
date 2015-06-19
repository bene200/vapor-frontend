var Transformer = module.exports = function(query){
    this.query = query;
}

Transformer.prototype.blastSearch = function(blastproxy, success){
    var Quickblast = require("/Users/bene1/masters_thesis/quickblast/lib/blast"),
        fasta = "",
        lines = [],
        shortFasta = "";

    blast = new Quickblast({
        query: this.query,
        p: "blastp",
        d: "swissprot",
        proxy: blastproxy,
        megablast: true,
        entrezQuery: "Arabidopsis thaliana"
    });
    blast.search(function(){
        // document.getElementById("log").value = "BLAST finished\n" + document.getElementById("log").value;
        fasta = blast.asFasta();
        //If many matches are found, display only 20 best ones
        if(fasta.match(/>/g).length > 20){
            lines = fasta.split("\n");
            //every sequence hast 2 lines: header and sequence ->20*2=40
            shortFasta = lines.slice(0, 40).join("\n");
            fasta = shortFasta;
        }
        success(fasta);
    });
}

Transformer.prototype.runClustal = function(galaxyInfo, success){
    var Galaxy = require("/Users/bene1/masters_thesis/galaxyJS/lib/galaxy"),
        g = new Galaxy(galaxyInfo.galaxyURL, galaxyInfo.apiKey, galaxyInfo.browser),
        inid = "",
        workflow = "ebfb8f50c6abde6d",
        jobID = "",
        waitForJob = null;

    //we create a new galaxy history, upload the fasta file to it
    //and run the galaxy clustalW workflow
    g.createHistory("New VAPoR History", function(hist){
        g.uploadToHistory(galaxyInfo.file, "blastresult.fasta", hist.id, function(inFile){
            inFile = JSON.parse(inFile);
            inid = inFile.outputs[0].id;
            g.executeWorkflow(inid, workflow, "VAPoR clustal history", function(wfout){
                //Get workflow job ID
                jobID = wfout.steps[0].job_id;
                waitForJob = setInterval(function(){
                    g.getJob(jobID, function(job){
                        if(job.state !== "ok"){
                            console.log("ClustalW is running ...");
                        }
                        //Job is done, get output data from galaxy instance
                        else{
                            clearInterval(waitForJob);
                            g.getDatasetContent(wfout.outputs[1], function(log){
                                g.getDatasetContent(wfout.outputs[0], function(clustal){
                                    success({
                                        log: log,
                                        clustal: clustal
                                    });
                                });
                            });
                        }
                    });
                }, 2000);
            });
        });
    });
}

Transformer.prototype.idsFromFasta = function(fasta){
    //find headers in fasta
    var headers = fasta.match(/>.*/g),
        parts = [],
        ids = [];

    //for swissport search the last part of the header
    //is the identifier we want as both uniprot 
    //and stringdb understand it
    for(var i=0; i<headers.length; i++){
        parts = headers[i].split("\|");
        if(parts.length > 3){
            //the H needs to be added to find the id in 
            //a database foo_ARAT -> foo_ARATH
            ids.push(parts[4] + "H");
        }
    }

    return ids;
}

Transformer.prototype.getSTRINGNetworks = function(geneList, proxy, success){
    var StringDB = require("/Users/bene1/masters_thesis/biojs-stringdb/js/string"),
        sdb = new StringDB(),
        net = {},
        networks = [],
        id = "";

    asyncLoop({
        length : geneList.length,
        functionToLoop : function(loop, i){
            id = geneList[i];
            //get protein interaction network for each id
            sdb.getNetwork(id, proxy).then(function(res){
                net = sdb.networkToJSON(res);
                networks.push({ id: id, graph: net });
                loop();
            });
        },
        callback : function(){
            success(networks);
        }    
    });
}

Transformer.prototype.shortTreeIDs = function(newick){
    var ids = newick.match(/gi.+?_ARAT/g),
        header = "",
        tree = newick;

    for(var i=0; i<ids.length; i++){
        header = ids[i].match(/\|.{3,10}_ARAT/g)[0].replace(/\|/g, "");
        tree = tree.replace(ids[i], header);
    }
    
    return tree;
}   

Transformer.prototype.getGeneInfo = function(ids, proxy, done){
    var UniprotGet = require("./uniprot"),
        uni = new UniprotGet(proxy),
        uniprotData = [];
    
    asyncLoop({
        length : ids.length,
        functionToLoop : function(loop, i){
            var id = ids[i];
            //parse uniport entries for each id
            uni.fetchEntry(id, function(entry){
                if(entry === "NA"){
                    uniprotData.push(null);
                }
                else {
                    uniprotData.push(uni.parse(entry));
                }
                loop();
            });
        },
        callback : function(){
            done(uniprotData);
        }    
    });
}

Transformer.prototype.extractNetworkIDs = function(nets){
    var _ = require("underscore"),
        ids = [],
        nodes = []
        id = "";

    //extract ids
    for(var i=0; i<nets.length; i++){
        nodes = nets[i].graph.nodes;
        for(var j=0; j<nodes.length; j++){
            id = nodes[j].name;
            if(id.substring(0, 2) !== "AT"){
                id += "_ARATH";
            }
            ids.push(id);
        }
    }

    return _.uniq(ids);
}

Transformer.prototype.treeFromLog = function(logfile){
    var start, end, newick;

    //Parse newick tree
    start = logfile.indexOf("dnd file") + 30;
    end = logfile.length - 1;
    newick = logfile.substring(start, end);
    newick = newick.replace(/\n/g, "");
    
    return newick;
}

function asyncLoop(o){
    var i=-1,
        length = o.length;
    
    var loop = function(){
        i++;
        if(i==length){o.callback(); return;}
        o.functionToLoop(loop, i);
    } 
    loop();//init
}