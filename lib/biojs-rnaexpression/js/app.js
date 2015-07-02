$(document).ready(function(){
    var RnaExpr = require("./rnaexpr"),
        rexp = null,
        gene = null;

    gene = {
        orga: "tair",
        name: "RNDG1",
        flower: 0.2,
        roots: 0.8,
        leaves: 0.5,
        stem: 0.1
    }

    rexp = new RnaExpr(gene);

    rexp.render();
});