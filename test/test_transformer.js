var assert = chai.assert;

var mochaTestFile = ">PRGDB00050106\nMVAKRRFVHDSNKSFPQSVDPSTKSINGATDVNVSVMTIEANTMEEELANMKMLIHKLAKENEEKEEQIKFQSKQLVALTKKLEKRPIGESEGDSGGSKFSMKSKTSAKDGAIHGDSFNFQQIQDMIATAVKRQLGGDFDGNDHYTKPYTKRIDALEMPMGYQPPKFMHFDGIGNPKQHIAHFVETCNNAGTEGDLLVKQFVRSLKGVAFDCTRRIVSMIELTQTTQLEDEPVIEYINRWRTLCLQCKDHLSKASAVELCTQGIHWDLTYILQGIKPNTFQELATRAHEMEMTIANHEENYD";

//Test data transformation functions in VAPoR 
describe("transformer", function(){
    var fasta = null;

    describe("t.blastSearch", function(){
        console.log("test start");
        it("should run without an error", function(done){
            this.timeout(1200000);
            assert.doesNotThrow(function(){
                t.blastSearch(mochaTestFile, "http://localhost:9001/", function(result){
                    fasta = result;
                    console.log(fasta);
                    done();
                });
            });
        });
    });

    describe("t.runClustal", function(){
        var clustalObj = null;
        it("should run without an error", function(done){
            this.timeout(1200000);
            assert.doesNotThrow(function(){
                t.runClustal(fasta, "http://127.0.0.1:9000/localhost:8000", 
                    "0a53aa0a95b3519f5159a9b36a7442f3", function(object){
                        clustalObj = object;

                        done();
                    });
            });
        });
        it("should return a valid output object", function(done){
            assert.ok(clustalObj !== null);

            done();
        });
    });
});