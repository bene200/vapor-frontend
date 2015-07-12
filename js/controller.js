var View = require("./view");
var CyView = require("./cyto-view");
var RnaExpr = require("../lib/biojs-rnaexpression/js/rnaexpr");
var msa = require("msa");
var _ = require("underscore");
var chroma = require("chroma-js");

var Controller = module.exports = function(obj){
    //log
    this.logbox = document.getElementById("log");

    //models
    this.interactions = obj.interactions;
    this.msa = obj.msa;
    this.phylotree = obj.phylotree;
    this.anno = obj.anno;
    this.expr = obj.expr;

    //view
    this.view = new View(this);
    this.view.init({
        msa: this.msa,
        phylotree: this.phylotree
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
        cyEl = document.getElementById("cy"),
        cytoView = null;
        log = this.logbox.value,
        self = this,
        eles = null;

    net = self.interactions.find(id);
    //filter edges to get highest confidence edges only
    net.edges = net.filterEdges(net.edges);
    //convert data to proper cytoscape format
    eles = net.toCytoscape();
    //cytoscape element
    cyEl.innerHTML = "";

    //display network
    cytoView = new CyView(eles);
    cytoView.setDegree();
    cytoView.setColors(self.anno);
    cytoView.render(function(){
        self.view.cyto = cytoView;
        success();
    });
    log += "Showing expression for " + id + "\n" + log;
}

Controller.prototype.showExpression = function(id){
    var rna = null,
        exprInfo = null,
        info = null,
        log = this.logbox.value;

    //clear old before showing new
    var ele = document.getElementById("expr");
    ele.innerHTML = "";

    //display expression
    info = _.filter(this.expr, function(el){
        return el.query.indexOf(id) !== -1
    })[0];
    if(info !== undefined){
        exprInfo = {
            orga: "tair",
            name: id.replace(/_ARAT/g, ""),
            flower: parseFloat(info.flower).toFixed(2),
            roots: parseFloat(info.roots).toFixed(2),
            leaves: parseFloat(info.leaves).toFixed(2),
            stem: parseFloat(info.stem).toFixed(2)
        }
        rna = new RnaExpr(exprInfo);
        this.view.rna = rna;
        rna.render();
    }
    else {
        ele.innerHTML = "<p>No expression data for gene " + id + "</p>";
    }
    log += "Showing expression for " + id + "\n" + log;
}

Controller.prototype.msaClick = function(data){
    var self = this,
        id = "";

    id = self.view.m.seqs.at(data.seqId).get("name");
    self.showInteractions(id, function(){
        self.showExpression(id);
    });
}

Controller.prototype.treeColorMap = function(){
    var self = this,
        tree = self.view.tree.treeVis,
        map = [],
        anno = null,
        scale = null,
        max = 0;

    $(".leaf").each(function(){
        anno = self.anno.find(this.childNodes[1].innerHTML);
        if(anno){
            map.push({
                name: anno.query,
                number: anno.goterms.length
            });
        }
        else {
            map.push({
                name: this.childNodes[1].innerHTML,
                number: 0
            });
        }
    });
    max = _.max(map, function(el){ return el.number; }).number;
    scale = chroma.scale(["grey", "red"]).domain([0, max]);
    map = _.map(map, function(el){
        return {
            name: el.name,
            color: scale(el.number).hex()
        };
    });
    return map;
}
