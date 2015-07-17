var msa = require("msa");
var TreeView = require("./tree-view");
var Xpress = require("biojs-xpression");
var _ = require("underscore");

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
                seqlogo: false,
                metacell: false
            },
            zoomer: {
                labelIdLength: 20,
                rowHeight: 20,
                alignmentHeight: $(".tnt_groupDiv").children().height()-30
            }
        };
        m = msa(opts);
        return m;
    };
    this.tree = new TreeView(data.phylotree);
    this.tree.render();
    this.m = initMsa(data.msa);
    this.arrangeMsaTree();
    this.setMsaEvents();
    this.m.render();
    this.setTreeEvents();
    this.tree.setNodeCols(this.c.treeColorMap());
    console.log(document.getElementById("expr"));
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
        anno = null;

    //tree events
    self.tree.treeVis.on("click", function(node){
        self.c.treeClick(node, function(){
            self.setCyEvents();
        });
    });
    //tooltips on mouseover (dirty d3 hack)
    $(".leaf").each(function(){
        anno = self.c.anno.find(this.childNodes[1].innerHTML);
        if(anno){
            $(this).tooltipster({
                content: $(anno.goAsHTML())
            });
        }
    });
}

View.prototype.setCyEvents = function(){
    var self = this,
        geneInfo = document.getElementById("gene-info"),
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
    }
}

View.prototype.setMsaEvents = function(){
    var self = this;

    self.m.g.on("row:click", function(data){
        self.c.msaClick(data);
    });
}
