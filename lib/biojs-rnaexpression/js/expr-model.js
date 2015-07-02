var ExprModel = module.exports = function(obj){
    var chroma = require("chroma-js");
    var scale = chroma.scale(["green", "red"]).mode("lab");
    this.organism = obj.orga;
    this.genename = obj.name;
    this.roots = obj.roots;
    this.flower = obj.flower;
    this.stem = obj.stem;
    this.leaves = obj.leaves;
    this.rootscol = scale(this.roots).hex();
    this.flowercol = scale(this.flower).hex();
    this.stemcol = scale(this.stem).hex();
    this.leavescol = scale(this.leaves).hex();
    this.legend = [
        { val: 0.0, col: scale(0.0).hex() },
        { val: 0.1, col: scale(0.1).hex() },
        { val: 0.2, col: scale(0.2).hex() },
        { val: 0.3, col: scale(0.3).hex() },
        { val: 0.4, col: scale(0.4).hex() },
        { val: 0.5, col: scale(0.5).hex() },
        { val: 0.6, col: scale(0.6).hex() },
        { val: 0.7, col: scale(0.7).hex() },
        { val: 0.8, col: scale(0.8).hex() },
        { val: 0.9, col: scale(0.9).hex() },
        { val: 1, col: scale(1).hex() }
    ];
}