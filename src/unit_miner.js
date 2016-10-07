/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('unit_miner');
 * mod.thing == 'a thing'; // true
 */
var tasks = require("tasks");
var miner = {
    beforeAge: function(){
        var creep = this.creep;
        var spawner = require('spawner');
        spawner.addToQueue("miner", {"role":"miner", "target": creep.memory.target}, -1, false);
        delete Memory.creeps[creep.name];
    },
	behavior: function(){
	    var creep = this.creep;
	    if(creep.carry["energy"] == creep.carryCapacity){
            creep.memory.task = "offload";
        }
        if(creep.carry["energy"] == 0){
            creep.memory.task = "mine";
        }
        tasks.runTasks(creep);
	},
	
	onSpawn: function(){},

	partWeights: function(){
	    var unitWeight = [["work", 4],["carry",1],["move",2]];
	    return unitWeight;
	},
	/**
     * Calculates the composition of a creep based on extensions in a room
     * @param: {integer} Number of extensions availible to spawning spawn
     * returns: [[2darray]] of PARTS and NUMBER OF PARTS in form [[PART, {integer}],[PART, {integer}]]
     */
    partWeightsExt: function(extensionCount){
        var unitWeight;
        if(extensionCount <= 5){                                     // < 300 max energy avail
            unitWeight = [["work", 2],["carry", 1],["move",1]];     // cost: 300
        }else if(extensionCount <= 10){                              // < 550 max energy avail
            unitWeight = [["work", 3],["carry", 1],["move",3]];     // cost: 500 
        }else if(extensionCount <= 20){                              // < 800 max energy avail
            unitWeight = [["work", 5],["carry", 1],["move",3]];     // cost: 700
        }else{                                                      // 1300 max energy
            unitWeight = [["work", 5],["carry", 1],["move",3]];     // cost: 700
        }
        return unitWeight;
    }
};

module.exports = miner;