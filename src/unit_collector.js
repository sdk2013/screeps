/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('unit_collector');
 * mod.thing == 'a thing'; // true
 */
var utilities = require('utilities');
var tasks = require('tasks');
var collector = {
    beforeAge: function(){
        var creep = this.creep;
        var spawner = require('spawner');
        spawner.addToQueue("collector", {role:"collector"}, -1, false)
        delete creep.memory;
    },
	
	behavior: function(){
        var creep = this.creep
        var total = _.sum(creep.carry);
        if(total == 0 || creep.memory.task == null){
            creep.memory.task = "gatherEnergy";
        }
        if(total == creep.carryCapacity && creep.memory.task == "gatherEnergy"){
            creep.memory.task = "fill";
        }
        var result = tasks.runTasks(creep);
	},
	
	onSpawn: function(){},

	/**
     * Calculates the composition of a creep based on extensions in a room
     * @param: {integer} extensionCount - Number of extensions availible to spawning spawn
     * returns: [[2darray]] of PARTS and NUMBER OF PARTS in form [[PART, {integer}],[PART, {integer}]]
     */
    partWeightsExt: function(extensionCount){
        if(extensionCount <= 5){                                     // < 300 max energy avail
            var unitWeight = [["carry", 3],["move",3]];     // cost: 300
        }else if(extensionCount <= 10){                              // < 550 max energy avail
            var unitWeight = [["carry", 5],["move",5]];     // cost: 500 
        }else if(extensionCount <= 20){                              // < 800 max energy avail
            var unitWeight = [["carry", 6],["move",6]];     // cost: 600
        }else{                                                      // 1300 max energy
            var unitWeight = [["carry", 10],["move",10]];     // cost: 1000
        }
        return unitWeight;
    }
}

module.exports = collector;