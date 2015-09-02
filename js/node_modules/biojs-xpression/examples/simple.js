// if you don't specify a html file, the sniper will generate a div with id "rootDiv"
var app = require("biojs-xpression");
var expr = [{
    tissues: {
        flower: 0.305,
        leaves: 0.236,
        roots: 0.324,
        stem: 0.316
    },
    name: "RTM2_ARATH"
}];
var myDiv = document.getElementById("expr");
var instance = new app({el: myDiv, data: expr});
instance.show("RTM2_ARATH");
