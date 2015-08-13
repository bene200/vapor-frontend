var msa = require("msa");
var TreeView = require("./tree-view");
var Xpress = require("biojs-xpression");
var _ = require("underscore");
var Anno = require("./anno");

var View = module.exports = function(c){
    this.m = null;
    this.tree = null;
    this.cyto = null;
    this.rna = null;
    this.c = c;
}

View.prototype.init = function(data){
    var self = this;
    var initMsa = function(clustal){
        var msaDiv = document.getElementById("msa"),
            opts = {},
            m = null;

        opts = {
            el: msaDiv,
            seqs: clustal,
            vis: {
                conserv: false,
                overviewbox: false,
                seqlogo: true,
                metacell: false
            },
            zoomer: {
                labelIdLength: 20,
                rowHeight: 20,
                alignmentHeight: $(".tnt_groupDiv").children().height()-30
            },
            conf: {
                registerMouseHover: true,
                registerMouseClicks: true
            }
        };
        m = msa(opts);
        return m;
    };
    this.tree = new TreeView(data.phylotree);
    this.tree.setGoTerms(this.c.anno);
    this.tree.render();
    this.m = initMsa(data.msa);
    this.arrangeMsaTree();
    this.setMsaEvents();
    this.m.render();
    this.setTreeEvents();
    this.tree.setNodeCols(this.c.treeColorMap());
    this.rna = new Xpress({
        el: document.getElementById("expr"),
        data: data.expr
    });
}

View.prototype.arrangeMsaTree = function(){
    var arranged = this.c.arrangeMsaTree();
    this.m = arranged[0];
    this.tree.treeVis = arranged[1];
}

View.prototype.setTreeEvents = function(){
    var self = this,
        treeData = null,
        depth = null;

    //tree events
    self.tree.treeVis.on("click", function(node){
        self.c.treeClick(node, function(){
            self.setCyEvents();
        });
    });
    //tooltips on mouseover (dirty d3 hack)
    d3.selectAll("circle")
        .attr("title", function(e){ return self.c.anno.annos[0].goAsHTML(e.gos); });
    $("circle").tooltipster({
        contentAsHTML: true
    });
}

View.prototype.setCyEvents = function(){
    var self = this,
        geneInfo = document.getElementById("gene-info"),
        elabel = document.getElementById("edge-label"),
        anno = null,
        found = null;

    //cytoscape events
    if(this.cyto.cy){
        this.cyto.cy.on("tap", "node", function(evt){
            anno = self.c.anno.find(this.data().label);
            if(!anno){
                _.each(this.data().refids, function(el){
                    found = self.c.anno.find(el);
                    if(found){
                        anno = found;
                    }
                });
            }
            anno ? self.c.showExpression(anno.query) : self.c.showExpression(this.data().label);
        });
        this.cyto.cy.on("tapdrag", "node", function(evt){
            anno = self.c.anno.find(this.data().label);
            if(!anno){
                _.each(this.data().refids, function(el){
                    found = self.c.anno.find(el);
                    if(found){
                        anno = found;
                    }
                });
            }
            if(anno){
                geneInfo.innerHTML = "<span class='glyphicon glyphicon-remove-circle'\
                                     aria-hidden='true' id='showanno'></span>";
                geneInfo.innerHTML += anno.asHTMLTable();
                geneInfo.style.display = "block";
                document.getElementById("showanno")
                    .addEventListener("click", function(){
                        geneInfo.style.display = "none";
                    })
            }
        });

        this.cyto.cy.on("tapdragover", "edge", function(evt){
            var left  = event.clientX  + "px";
            var top  = event.clientY  + "px";
            elabel.style.left = left;
            elabel.style.top = top;
            elabel.innerHTML = this.data().experiment;
            elabel.style.display = "block";
        });
        this.cyto.cy.on("tapdragout", "edge", function(evt){
            elabel.style.display = "none";
        });
    }
}

View.prototype.setMsaEvents = function(){
    var self = this;

    self.m.g.on("row:click", function(data){
        self.c.msaClick(data, function(){ console.log("Showing interactions after MSA click"); });
    });
    self.m.g.on("residue:click", function(data){
        debugger;
    });
}
