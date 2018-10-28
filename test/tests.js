var fs = require("fs-extra");
var multigrain = require("multigrain");

var chai = require("chai");
var assert = chai.assert;

var editors = multigrain.parse(fs.readFileSync("./source/editors.toml", "utf8"), "toml");

describe("Distributions", function(){
    it("should exist", function(){
        for(var editor in editors){
            if(!editors[editor].bundle){
                assert.equal(fs.existsSync(editors[editor].distDir + "package.json"), true);
            }
            else{
                assert.equal(fs.existsSync(editors[editor].distDir + editors[editor].bundle), true);
            }
        }
    });
    it("should not have undefined folders", function(){
        for(var editor in editors){
            assert.notEqual(fs.existsSync(editors[editor].distDir + "undefined"), true);
        }
    });
});
