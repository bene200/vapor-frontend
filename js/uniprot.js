var Uniprot = module.exports = function(proxy){
    this.proxy = proxy;
    this.request = require("request");
    this.uid = "";
}

Uniprot.prototype.fetchEntry = function(id, done){
    var url = "",
        entry = "";

    this.uid = id;
    url = "http://www.uniprot.org/uniprot/?query="
        + id.replace(/_ARATH/g, "") + "+AND+reviewed%3Ayes+AND+organism%3AARATH&sort=score&format=txt";
    if(this.proxy){
        url = this.proxy + url;
    }
    this.request(url, function(err, res, body){
        if(body.indexOf("Reviewed;") !== -1){
            entry = body;
        }
        else {
            entry = "NA";
        }
        done(entry);
    });
}

Uniprot.prototype.parse = function(file){
    var parsedInfo = {},
        geneName = null,
        geneFunc = null,
        go = null;

    //query
    parsedInfo.query = this.uid;
    //organism
    parsedInfo.os = file.match(/\nOS(.)*\n/g)[0]
                    .replace(/\n/g, "")
                    .replace(/OS/g, "")
                    .trim();

    //gene name
    geneName = file.match(/ID\s+.+\s+Rev/g)[0]
                .replace(/ID/g, "")
                .replace(/Rev/g, "")
                .trim();
    
    parsedInfo.gene = geneName;

    //function
    geneFunc = file.match(/FUNCTION:[\s\S]+?\-\!\-/g);
    if(geneFunc !== null){
        geneFunc = geneFunc[0].replace(/\nCC\s+/g, "")
                .replace(/\-\!\-/g, "")
                .replace(/FUNCTION:/g, "")
                .trim();
    }
    else {
        geneFunc = "";
    }
    parsedInfo.func = geneFunc;

    //GO terms
    go = file.match(/GO:.*/g);
    parsedInfo.goterms = go;

    return parsedInfo;
}