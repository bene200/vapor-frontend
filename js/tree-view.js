var tnt = require("tnt.tree");
var _ = require("underscore");

var TreeView = module.exports = function(data){
    this.newick = data;
    this.treeVis = tnt().data(this.newick);
    this.treeVis.label(tnt.label.text().text(function(){return "";})
                                        .height(20))
                .node_display(tnt.node_display.circle()
                .size(5))
                .layout(tnt.layout.vertical()
                .width(400)
                .scale(false));
    this.treeDiv = document.getElementById("tnt");
    this.treeDiv.innerHTML = "";
}

TreeView.prototype.render = function(){
    this.treeVis(this.treeDiv);
}

TreeView.prototype.setNodeCols = function(scale){
    var color = "",
        name = "";

    d3.selectAll("circle").attr("fill", function(e){
        if(e){ return scale(e.gos.length).hex(); }
    });
}

TreeView.prototype.setGoTerms = function(anno){
    var root = this.treeVis.root(),
        leaves = root.get_all_leaves(),
        gos = null,
        termLists = null;

    //first set leave go terms
    _.each(leaves, function(el){
        gos = anno.find(el.data().name);
        el.data().gos = gos ? gos.goterms : [];
    });
    //then apply intersection of child go terms for all other nodes
    root.apply(function(n){
        termLists = [];
        leaves = n.get_all_leaves();
        _.each(leaves, function(l){
            termLists.push(l.data().gos);
        });
        n.data().gos = _.intersection.apply(null, termLists);
    });

}
