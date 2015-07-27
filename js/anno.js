var Anno = module.exports = function(obj){
    this.query = obj.query;
    this.locusnme = obj.locusname;
    this.gname = obj.gene;
    this.func = obj.func;
    this.goterms = obj.goterms || [];
}

Anno.prototype.goAsHTML = function(lst){
    if(!lst){
        lst = this.goterms
    }
    var result = "";
    result = "<span>" + lst.toString()
                            .replace(/,/g, "<br>") + "</span>";
    return result;
}

Anno.prototype.asHTMLTable = function(){
    var goparts = null,
        term = "",
        cat = "",
        tname = "",
        split = null,
        html = "<table class='table table-striped' style='width:100%'>";

    //function
    html += "<p>" + this.func + "</p>"
    //column headers
    html += "<tr><td>Identifier</td><td>Category</td><td>Term name</td></tr>";
    //body
    for(var i=0; i<this.goterms.length; i++){
        goparts = this.goterms[i].split(";");
        split = goparts[1].split(":");
        term = goparts[0];
        tname = split[1];
        if(split[0].trim() === "C"){
            cat = "Cellular Compartment";
        }
        else if(split[0].trim() === "F"){
            cat = "Molecular Function";
        }
        else {
            cat = "Biological Process";
        }

        html += "<tr><td>"
                + term
                + "</td><td>"
                + cat
                + "</td><td>"
                + tname
                + "</td></tr>";
    }
    //table end
    html += "</table>";

    return html;
}
