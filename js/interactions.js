var _ = require("underscore");

var Interactions = module.exports = function(net){
    this.query = net.query;
    this.nodes = net.graph.nodes;
    this.edges = net.graph.edges;
}

Interactions.prototype.toCytoscape = function(){
    //convert data to proper cytoscape format
    var self = this
        cyNodes = [],
        cyEdges = [],
        elements = {};
    //nodes
    for(i=0; i<self.nodes.length; i++){
        if(self.nodes[i].isquery === "true"){
            self.nodes[i].shape = "star";
        }
        else {
            self.nodes[i].shape = "ellipse";
        }
        cyNodes.push({ data: self.nodes[i] });
    }
    //edges
    for(i=0; i<self.edges.length; i++){
        cyEdges.push({ data: self.edges[i] });
    }
    //return cytoscape el
    elements = {
        nodes: cyNodes,
        edges: cyEdges
    };
    return elements;
}

Interactions.prototype.filterEdges = function(edges){
    var filtered = [],
        all = [];

    for(var i=0; i<edges.length; i++){
        all = _.filter(edges, function(el){
            return (el.source === edges[i].source) && (el.target === edges[i].target);
        });
        all = _.filter(all, function(el){ return el.experiment !== "combined_confidence"; });
        filtered.push(_.max(all, function(el) { return el.confidence; }));
    }
    filtered = _.uniq(filtered);
    return filtered;
}
