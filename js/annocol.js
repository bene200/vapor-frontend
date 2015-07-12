var _ = require("underscore");
var Anno = require("./anno");

var AnnoCol = module.exports = function(data){
    this.annos = [];
    data = _.filter(data, function(el){ return el !== null; });
    for(var i=0; i<data.length; i++){
        this.annos.push(new Anno(data[i]));
    }
}

AnnoCol.prototype.find = function(id){
    var flag = false,
        self = this;

    var result = _.filter(self.annos, function(el){
        flag = false;
        if(el !== null){
            flag =  el.query.indexOf(id) !== -1;
            if(!flag && el.locusname){
                flag = id.indexOf(el.locusname) !== -1;
            }
        }
        return flag;
    })[0];

    return result;
}
