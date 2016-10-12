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
var manager = {
    beforeAge: function(){
        var creep = this.creep;
        var spawner = require('spawner');
        spawner.addToQueue("manager", {role:"manager"}, creep.memory.spawnRoom, true)
        delete creep.memory;
    },
	behavior: function(){
        var creep = this.creep
        var total = _.sum(creep.carry);
        if(total == 0 || creep.memory.task == null){
            creep.memory.task = "fetchEnergy";
        }
        if(total == creep.carryCapacity){
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
        return [["carry",4],["move",2]];
    }
}

module.exports = manager;