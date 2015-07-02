var RnaExpr = module.exports = function(gene){
    var RnaModel = require("./expr-model");
    var RnaView = require("./expr-view");

    this.model = new RnaModel(gene);
    this.view = new RnaView(this.model);
}

RnaExpr.prototype.setGene = function(gene){
    this.model = new RnaModel(gene);
}

RnaExpr.prototype.render = function(){
    this.view.render({
        roots: this.model.rootscol,
        leaves: this.model.leavescol,
        flower: this.model.flowercol,
        stem: this.model.stemcol
    });
}