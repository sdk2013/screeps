/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('unit_scv');
 * mod.thing == 'a thing'; // true
 */

/*
NAME: SCV
ROLE: Multirole Worker
COST: Low
Characteristics:

WIP:
Gathers resources and brings them back to spawn 

Planned:
Execute Build Orders - DONE (SORT OF)
Return to extensions & Storage
 */
var _ = require('lodash')
var utilities = require('utilities')
var tasks = require('tasks')
var scv = {
    beforeAge: function(){
        var spawner = require('spawner')
        var creep = this.creep
        spawner.addToQueue("scv", {role:"scv", oldTask: creep.memory.oldTask}, -1, true)
        delete Memory.creeps[creep.name];
    },
    behavior: function(){
        var creep = this.creep;
        var task = creep.memory.task;
        if(task == null){
            creep.memory.task = "construction"
        }
        if(creep.totalEnergy() == 0 && creep.memory.task != "fetchEnergy"){
            delete creep.memory.fortifyTarget;
            creep.memory.oldTask = creep.memory.task;
            creep.memory.task = "fetchEnergy";
        }
        if(creep.memory.task == "fetchEnergy" && creep.totalEnergy() == creep.capacity() ){
            creep.memory.task = creep.memory.oldTask;
        }
        var result = tasks.runTasks(creep);
        if(result == "ERR_NO_TARGETS" && creep.memory.task == "construction"){
            creep.memory.task == "fortify"
        }else if(result == "ERR_NO_TARGETS" && creep.memory.task != "upgrade"){
            creep.memory.task = "upgrade";
        }
    },
    partWeights: function(){
        var unitWeight = [["work", 1],["carry", 2],["move",2]];
        return unitWeight;
    },
    /**
     * Calculates the composition of a creep based on extensions in a room
     * @param: {integer} extensionCount - Number of extensions availible to spawning spawn
     * returns: [[2darray]] of PARTS and NUMBER OF PARTS in form [[PART, {integer}],[PART, {integer}]]
     */
    partWeightsExt: function(extensionCount){
        if(extensionCount <= 5){                                     // < 300 max energy avail
            var unitWeight = [["work", 1],["carry", 2],["move",2]];     // cost: 300
        }else if(extensionCount <= 10){                              // < 550 max energy avail
            var unitWeight = [["work", 3],["carry", 2],["move",3]];     // cost: 550 
        }else if(extensionCount <= 20){                              // < 800 max energy avail
            var unitWeight = [["work", 3],["carry", 3],["move",5]];     // cost: 700
        }else{                                                      // 1300 max energy
            var unitWeight = [["work", 4],["carry", 4],["move",8]];     // cost: 1000
        }
        return unitWeight;
    }
}

module.exports = scv