var cytoscape = require("cytoscape");
var chroma = require("chroma-js");
var _ = require("underscore");

var CytoView = module.exports = function(eles){
    this.elements = eles;
    this.stylesheet = cytoscape.stylesheet()
        .selector('node')
        .css({
            'content': 'data(label)',
            'background-color': 'data(color)',
            'text-valign': 'center',
            'color': 'white',
            'text-outline-width': 2,
            'text-outline-color': '#888',
            'min-zoomed-font-size': 8,
            'width': 'data(deg)',
            'height': 'data(deg)',
            'shape': 'data(shape)'
        })
        .selector('node:selected')
        .css({
            'background-color': '#66ff99',
            'text-outline-color': '#888'
        })
        .selector('edge')
        .css({
            'width': 2,
            'line-color': 'data(color)',
            'content': 'data(experiment)',
            'font-size': 8
        });

    this.cy = null;
}

CytoView.prototype.setDegree = function(){
    var self = this,
        cy = null;

    cy = cytoscape({
        style: self.stylesheet,
        elements: self.elements
    });
    cy.$("node").each(function(i, ele){
        ele.data().deg = ele.degree()*10;
    });
    self.elements.nodes = [];
    cy.elements("node").each(function(i, el){
        self.elements.nodes.push({data: el.json().data});
    });
}

CytoView.prototype.setColors = function(anno){
    var self = this,
        nodes = self.elements.nodes,
        edges = self.elements.edges,
        scale = null,
        col = "";

    //nodes
    for(var i=0; i<nodes.length; i++){
        if(anno.find(nodes[i].data.label)){
            nodes[i].data.color = "#ff6666";
        }
        else {
            nodes[i].data.color = "#66CCFF";
            _.each(nodes[i].data.refids, function(el){
                if(anno.find(el)){
                    nodes[i].data.color = "#ff6666";
                }
            });
        }
    }

    //edges
    scale = chroma.scale(["red", "green"]);
    for(var i=0; i<edges.length; i++){
        col = scale(parseFloat(edges[i].data.confidence)).hex();
        edges[i].data.color = col;
    }
}

CytoView.prototype.render = function(success){
    var self = this;

    $('<div style="z-index:9;position:relative;height:500px;width:100%;"></div>')
    .appendTo('#cy').cytoscape({
        style: self.stylesheet,
        elements: self.elements,
        layout: {
            name: "cose"
        },
        ready: function(){
            this.fit();
            this.center();
            this.height(700);
            self.cy = this;
            success();
        }
    });
}
