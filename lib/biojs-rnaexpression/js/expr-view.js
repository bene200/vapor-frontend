var ExprView = module.exports = function(model){
    this.model = model;
    this.organism = model.organism;
    this.legend = model.legend;
}

ExprView.prototype.render = function(cols){
    var self = this;
    var tipLegend = d3.tip()
        .attr('class', 'd3-tip')
        .offset([230, 0])
        .html(function(d) {
            return "<strong></strong> <span style='color:red'>" + d.val + "</span>";
        });
    var tipLeaves = d3.tip()
        .attr('class', 'd3-tip')
        .offset([270, 0])
        .html(function(d) {
            return "<strong>Expression of Gene " + self.model.genename + " in leaves: </strong> <span style='color:red'>" + self.model.leaves + "</span>";
        });
    var tipRoots = d3.tip()
        .attr('class', 'd3-tip')
        .offset([270, 0])
        .html(function(d) {
            return "<strong>Expression of Gene " + self.model.genename + " in roots: </strong> <span style='color:red'>" + self.model.roots + "</span>";
        });
    var tipStem = d3.tip()
        .attr('class', 'd3-tip')
        .offset([270, 0])
        .html(function(d) {
            return "<strong>Expression of Gene " + self.model.genename + " in shoots: </strong> <span style='color:red'>" + self.model.stem + "</span>";
        });
    var tipFlower = d3.tip()
        .attr('class', 'd3-tip')
        .offset([270, 0])
        .html(function(d) {
            return "<strong>Expression of Gene " + self.model.genename + " in the flower: </strong> <span style='color:red'>" + self.model.flower + "</span>";
        });

    $("#expr").load(getPathFile(this.organism), function(){
        var svg = d3.select("#expr").selectAll("svg");
        svg.call(tipLegend);
        svg.call(tipLeaves);
        svg.call(tipFlower);
        svg.call(tipRoots);

        d3.select("#roots")
            .attr("fill", cols.roots)
            .on('mouseover', tipRoots.show)
            .on('mouseout', tipRoots.hide);

        d3.select("#leaves")
            .attr("fill", cols.leaves)
            .on('mouseover', tipLeaves.show)
            .on('mouseout', tipLeaves.hide);

        d3.select("#bloom")
            .attr("fill", cols.flower)
            .on('mouseover', tipFlower.show)
            .on('mouseout', tipFlower.hide);

        d3.select("#stem")
            .attr("fill", cols.stem)
            .on('mouseover', tipStem.show)
            .on('mouseout', tipStem.hide);

        svg.append("svg")
        .attr("width", 400)
        .attr("height", 200)
        .attr("y", 0)
        .selectAll("rect")
        .data(self.legend).enter()
        .append("rect")
            .attr("x", function(e) {
                var value = e.val * 10 * 12;
                value += 200;
                return value; })
            .attr("y", 50)
            .attr("width", 12)
            .attr("height", 50)
            .attr("fill", function(e) { return e.col; })
            .on('mouseover', tipLegend.show)
            .on('mouseout', tipLegend.hide);
    });
}

function getPathFile(orga){
    var result;

    switch(orga){
        case "tair":
            result = getTairPathFile();
            break;

    }

    return result;
}

function getTairPathFile(){
    var pathData = "../data/new_tair.html";

    return pathData;
}
