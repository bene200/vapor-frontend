// Test the web service for vapor

var toyEntry = {
    info: [{
        gi: "23423424test",
        acc: "AC234234.1",
        uniprotId: "QW2342",
        name: "RTM2",
        anno: "This gene does absolutely nothing and is completely useless",
        graphs:{
            nodes: [
                {name : "n1", id: "n1" },
                {name : "n2", id: "n2" }
            ],
            edges: [
                {source: "n1", target: "n2"}
            ]
        }
    }],
    tree: "this can just be any string really",
    msa: "Same goes for this here"
}

console.log(toyEntry);
//now submit that
var req = require("request");
req({
    uri: "http://localhost:3000/queries",
    json: toyEntry,
    method: "POST"
    },
    function(err, res, body){
        //can I get it now?
        req("http://localhost:3000/queries", function(err, res, body){
            console.log(JSON.parse(body)[0]);
        });
    }
);
