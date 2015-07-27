var View = require("./view");
var CyView = require("./cyto-view");
var RnaExpr = require("../lib/biojs-rnaexpression/js/rnaexpr");
var msa = require("msa");
var _ = require("underscore");
var chroma = require("chroma-js");

var Controller = module.exports = function(obj){
    //log
    this.logbox = document.getElementById("log");
    this.logbox.value = "Successful. Rendering ... \n" + this.logbox.value;
    //models
    this.interactions = obj.interactions;
    this.msa = obj.msa;
    this.phylotree = obj.phylotree;
    this.anno = obj.anno;
    this.expr = _.map(obj.expr, function(el){
        return {
            name: el.query,
            tissues: {
                flower: el.flower,
                leaves: el.leaves,
                roots: el.roots,
                stem: el.stem
            }
        };
    });

    //view
    this.view = new View(this);
    this.view.init({
        msa: this.msa,
        phylotree: this.phylotree,
        expr: this.expr
    });
}

Controller.prototype.arrangeMsaTree = function(){
    var m = this.view.m,
        tree = this.view.tree.treeVis;

    var leaves = tree.root().get_all_leaves(),
        newIds = [],
        element = null;
        oldId = null;

    //loop through all leaves and search msa ids for mathches
    //remember old ids and new ids of msa matches
    for(var i=0; i<leaves.length; i++){
        element = m.seqs.filter(function(el) {
                return leaves[i].data().name.indexOf(el.get('name')) !== -1;
            });
        if(element !== null && element.length !== 0){
            if(element.length > 1){
                if(element[0].get("id").toString().length > 2){
                    oldId = element[0].get("id");
                }
                else {
                    oldId = element[1].get("id");
                }
            }
            else {
                oldId = element[0].get("id");
            }
            newIds.push({
                oldid: oldId,
                newid: i
            });
        }
        else {
            element = msa.seqs.filter(function(el) {
                    return leaves[i].data().name.indexOf(el.get('name')) !== -1;
                })[0];
            newIds.push({
                oldid: element.get("id"),
                newid: i
            })
        }
    }
    //change msa ids according to newIds
    for(var i=0; i<newIds.length; i++){
        element = m.seqs.filter(function(el){
                                        return el.get('id') === newIds[i].oldid;
                                    });
        element[0].set('id', newIds[i].newid);
    }
    m.seqs.comparator = "id";
    m.seqs.sort();

    //fix msa names
    for(var i=0; i<leaves.length; i++){
        leaves[i].data().vaporId = i;
        m.seqs.at(i).set("name", leaves[i].data().name);
    }

    return [m, tree];
}

Controller.prototype.treeClick = function(node, success){
    var hide = null,
        names = [],
        id = "",
        self = this,
        m = self.view.m,
        tree = self.view.tree.treeVis;


    var msaHide = function(node, val){
        //hides sequences in msa depending on phylogenetic tree
        hide = node.get_all_leaves();
        names = [];
        for(var i=0; i<hide.length; i++){
            if(hide[i].data().name !== ""){
                m.seqs.at(hide[i].data().vaporId).set("hidden", val);
            }
        }
    };

    if(node.is_leaf()){
        if(node.is_collapsed()){
            node.toggle();
            tree.update();
            msaHide(node, false);
        }
        else {
            //if leave is clicked show interaction network
            id = node.data().name;
            m.g.selcol.reset();
            m.g.selcol.add(new msa.selection.rowsel({seqId: node.data().vaporId}));
            //cytoscape layout is asynchronous. we need to wait for it to be done
            self.showInteractions(id, function(){
                self.showExpression(id);
                success()
            });
        }
    }
    else {
        msaHide(node, true);
        node.toggle();
        tree.update();
    }
}

Controller.prototype.showInteractions = function(id, success){
    var geneInfo = document.getElementById("gene-info"),
        cytoView = null;
        log = this.logbox,
        self = this,
        eles = null;

    net = self.interactions.find(id);
    //filter edges to get highest confidence edges only
    net.edges = net.filterEdges(net.edges);
    //convert data to proper cytoscape format
    eles = net.toCytoscape();
    //cytoscape element
    document.getElementById("cy").innerHTML = "";
    document.getElementById("legend").innerHTML = "";

    //display network
    cytoView = new CyView(eles);
    cytoView.setDegree();
    cytoView.setColors(self.anno);
    cytoView.render(function(){
        self.view.cyto = cytoView;
        success();
    });
    log.value = "Showing interactions for " + id + "\n" + log.value;
}

Controller.prototype.showExpression = function(id){
    var ele = document.getElementById("expr"),
        log = this.logbox,
        gene = "";

    //clear old before showing new
    ele.innerHTML = "";

    gene = _.filter(this.expr, function(el){
        return el.name.indexOf(id) !== -1;
    })[0];
    if(gene){
        self.view.rna.show(gene.name);
        log.value = "Showing expression for " + id + "\n" + log.value;
    }
    else {
        ele.innerHTML = "<p>No expression data for gene " + id + "</p>";
    }
}

Controller.prototype.msaClick = function(data, success){
    var self = this,
        id = "";

    id = self.view.m.seqs.at(data.seqId).get("name");
    self.showInteractions(id, function(){
        self.showExpression(id);
        success();
    });
}

Controller.prototype.treeColorMap = function(){
    var map = [],
        scale = null,
        max = 0;

    max = _.max(d3.selectAll("circle").data(), function(e){
            return e.gos.length;
        }).gos.length;
    scale = chroma.scale(["grey", "#00CC66"]).domain([0, max]);

    return scale;
}
