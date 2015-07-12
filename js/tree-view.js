var tnt = require("tnt.tree");
var _ = require("underscore");

var TreeView = module.exports = function(data){
    this.newick = data;
    this.treeVis = tnt().data(this.newick);
    this.treeVis.label(tnt.label.text().height(20))
                .node_display(tnt.node_display.circle()
                .size(5))
                .layout(tnt.layout.vertical()
                .width(400)
                .scale(true));
    this.treeDiv = document.getElementById("tnt");
}

TreeView.prototype.render = function(){
    this.treeVis(this.treeDiv);
}

TreeView.prototype.setNodeCols = function(map){
    var color = "",
        name = "";

    d3.selectAll(".leaf")
        .each(function(el){
            name = this.childNodes[1].innerHTML;
            color = _.find(map, function(el) {
                return el.name.indexOf(name) !== -1;
            }).color;
            this.childNodes[0].style.fill = color;
        });
}
