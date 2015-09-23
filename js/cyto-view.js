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
            'line-color': 'data(color)'
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
    console.log("Setting cytoscape colours...");
    var self = this,
        nodes = self.elements.nodes,
        edges = self.elements.edges,
        scale = null,
        col = "";

    //nodes
    for(var i=0; i<nodes.length; i++){
        if(anno.find(nodes[i].data.label)){
            nodes[i].data.color = "#00CC66";
        }
        else {
            nodes[i].data.color = "#66CCFF";
            _.each(nodes[i].data.refids, function(el){
                if(anno.find(el)){
                    nodes[i].data.color = "#00CC66";
                }
            });
        }
    }

    //edges
    scale = chroma.scale(["green", "red"]);
    for(var i=0; i<edges.length; i++){
        col = scale(parseFloat(edges[i].data.confidence)).hex();
        edges[i].data.color = col;
    }
    console.log("done");
}

CytoView.prototype.render = function(success){
    var self = this;

    console.log("Rendering cytoscape...");
    document.getElementById("cy").style.display = "block";   
    document.getElementById("expr").style.display = "block";

    if(self.elements.nodes.length>0){
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
        self.drawLegend();
        console.log("done");
    }
    else {
        document.getElementById("cy").innerHTML = "No interaction data available for requested gene.";
        success();
    }
}

CytoView.prototype.drawLegend = function(){
    var svg = d3.select("#legend").append("svg")
        .attr("width", 555)
        .attr("height", 105);
    svg.append("circle")
        .attr("r", 20)
        .attr("cx", 40)
        .attr("cy", 40)
        .style("fill", "#66CCFF")

    svg.append("text")
        .attr("x", 70)
        .attr("y", 43)
        .text("No metadata")
        .attr("font-family", "sans-serif")
        .attr("font-size", "15px");

    svg.append("circle")
        .attr("r", 20)
        .attr("cx", 200)
        .attr("cy", 40)
        .style("fill", "#00CC66");

    svg.append("text")
        .attr("x", 230)
        .attr("y", 43)
        .text("Has metadata")
        .attr("font-family", "sans-serif")
        .attr("font-size", "15px");

    svg.append("path")
        .attr("d", "M 360.000 55.000,\
            L 374.695 60.225,\
            L 374.266 44.635,\
            L 383.776 32.275,\
            L 368.817 27.865,\
            L 360.000 15.000,\
            L 351.183 27.865,\
            L 336.224 32.275,\
            L 345.734 44.635,\
            L 345.305 60.225,\
            L 360.000 55.000")
        .attr("cx", 200)
        .attr("cy", 40)
        .style("fill", "#00CC66")
        .style("stroke-width", 5);

    svg.append("text")
        .attr("x", 390)
        .attr("y", 43)
        .text("Query")
        .attr("font-family", "sans-serif")
        .attr("font-size", "15px");

    svg.append("text")
        .attr("x", 460)
        .attr("y", 35)
        .text("Node radius")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px");

    svg.append("text")
        .attr("x", 460)
        .attr("y", 45)
        .text("depends on degree")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px");

    svg.append("text")
        .attr("x", 20)
        .attr("y", 85)
        .text("Low")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px");

    svg.append("text")
        .attr("x", 20)
        .attr("y", 95)
        .text("confidence")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px");

    //edge color gradient in legend
    scale = chroma.scale(["green", "red"]);
    svg.selectAll("rect")
        .data([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]).enter()
        .append("rect")
        .attr("x", function(e){ return 77 + (10 * e * 20); })
        .attr("y", 83)
        .attr("width", 20)
        .attr("height", 4)
        .style("fill", function(e){ return scale(e).hex(); });

    svg.append("text")
        .attr("x", 310)
        .attr("y", 85)
        .text("High")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px");

    svg.append("text")
        .attr("x", 310)
        .attr("y", 95)
        .text("confidence")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px");
}
