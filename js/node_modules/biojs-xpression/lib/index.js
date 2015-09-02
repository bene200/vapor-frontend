/*
 * biojs-xpression
 * https://github.com/bene200/biojs-xpression
 *
 * Copyright (c) 2015 Benedikt Rauscher
 * Licensed under the MIT license.
 */

//imports
var Backbone = require("backbone");
var scale = require("chroma-js").scale(["green", "red"]).mode("lab");
var d3 = require("d3");
var tip = require("d3-tip")(d3);

//Tissue color model. One color for each tissue
var TairTissue = Backbone.Model.extend({
    initialize: function(args){
        this.set("stem", args.stem);
        this.set("flower", args.flower);
        this.set("roots", args.roots);
        this.set("leaves", args.leaves);
    }
})

//Every gene model has the expression values, a gene name
//and an additional model that has the tissue specific colors
//as well as a flag describing whether it is currently rendered.
var Gene = Backbone.Model.extend({
    initialize: function(args){
        var cols = this.getCols();
        this.set("colors", new TairTissue(cols));
        this.set("active", false);
    },
    getCols: function(){
        var col = {};
        var t = this.get("tissues");
        for(var key in t){
            hex = scale(t[key]).hex();
            col[key] = hex;
        }
        return col;
    }
})

//Collection of all the genes. The one that is set as active is rendered
var Genes = Backbone.Collection.extend({
    model: Gene,
    active: function(){
        return this.where({active: true})[0];
    },
    setActive: function(gn){
        this.where({name: gn})[0].set("active", true);
    },
    setInactive: function(){
        var active = this.where({active: true});
        if(active && active.length > 0){
            active[0].set("active", false);
        }
    }
})

//This collection describes the legend. It consists of 10 elements
//I use chroma-js to assign colors
var legend = new Backbone.Collection([
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
])

//The view. Consists of a legend made up of squares and the
//picture of the organism loaded from an HTML file in ../data
//the parts of which are filled according to gene expression levels
module.exports = TairView = Backbone.View.extend({
    initialize: function(args){
        this.el = args.el;
        var genes = [];
        for(var i=0; i<args.data.length; i++){
          genes.push(new Gene({
              name: args.data[i].name,
              tissues: args.data[i].tissues
          }));
        }
        this.genecol = new Genes(genes);
        this.legend = legend;
    },
    show: function(gene){
        this.genecol.setInactive();
        this.genecol.setActive(gene);
        this.render();
    },
    render: function(){
        //This is messy but oh well..
        //One Tooltip event is defined for each tissue and the legend
        var self = this;
        var elid = "#" + self.el.id
        var ltip = tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong></strong> <span style='color:red'>" + d.val + "</span>";
            });
        var tipLeaves = d3.tip()
            .attr('class', 'd3-tip')
            .offset([0, 0])
            .html(function(d) {
                return "<strong>Expression of Gene " + self.genecol.active().get("name") + " in leaves: </strong> <span style='color:red'>" + self.genecol.active().get("tissues").leaves + "</span>";
            });
        var tipRoots = d3.tip()
            .attr('class', 'd3-tip')
            .offset([0, 0])
            .html(function(d) {
                return "<strong>Expression of Gene " + self.genecol.active().get("name") + " in roots: </strong> <span style='color:red'>" + self.genecol.active().get("tissues").roots + "</span>";
            });
        var tipStem = d3.tip()
            .attr('class', 'd3-tip')
            .offset([200, -30])
            .html(function(d) {
                return "<strong>Expression of Gene " + self.genecol.active().get("name") + " in shoots: </strong> <span style='color:red'>" + self.genecol.active().get("tissues").stem + "</span>";
            });
        var tipFlower = d3.tip()
            .attr('class', 'd3-tip')
            .offset([30, 0])
            .html(function(d) {
                return "<strong>Expression of Gene " + self.genecol.active().get("name") + " in the flower: </strong> <span style='color:red'>" + self.genecol.active().get("tissues").flower + "</span>";
            });
        self.el.innerHTML = require("../data/tair");
        var svg = d3.select(elid).selectAll("svg");
        var cols = self.genecol.active().get("colors");

        svg.call(ltip);
        svg.call(tipLeaves);
        svg.call(tipFlower);
        svg.call(tipRoots);
        svg.call(tipStem);

        //Tissues are select, colored according to expression
        //and mouseover/mouseout events are assigned to show
        //tooltips.
        d3.select("#roots")
            .attr("fill", cols.get("roots"))
            .on('mouseover', tipRoots.show)
            .on('mouseout', tipRoots.hide);

        d3.select("#leaves")
            .attr("fill", cols.get("leaves"))
            .on('mouseover', tipLeaves.show)
            .on('mouseout', tipLeaves.hide);

        d3.select("#bloom")
            .attr("fill", cols.get("flower"))
            .on('mouseover', tipFlower.show)
            .on('mouseout', tipFlower.hide);

        d3.select("#stem")
            .attr("fill", cols.get("stem"))
            .on('mouseover', tipStem.show)
            .on('mouseout', tipStem.hide);

        svg.append("svg")
          .attr("width", 600)
          .attr("height", 600)
          .attr("y", 0)
          .attr("x", 230)
          .selectAll("rect")
            .data(self.legend.toJSON()).enter()
            .append("rect")
              .attr("x", function(e) {
                  var value = e.val * 10 * 12;
                  value += 10;
                  return value; })
              .attr("y", 50)
              .attr("width", 12)
              .attr("height", 50)
              .attr("fill", function(e) { return e.col; })
              .on('mouseover', ltip.show)
              .on('mouseout', ltip.hide);
    }
})
