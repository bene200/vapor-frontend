var Net = require("./interactions");
var _ = require("underscore");

var InterCol = module.exports = function(data){
    this.nets = [];

    for(var i=0; i<data.length; i++){
        this.nets.push(new Net(data[i]));
    }
}

InterCol.prototype.find = function(id){
    var _ = require("underscore"),
        query = id,
        net = {};

    net = _.filter(this.nets, function(el){
        return el.query === query;
    })[0];

    return net;
}
