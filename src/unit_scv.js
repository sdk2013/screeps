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
        spawner.addToQueue("scv", {role:"scv", oldTask: creep.memory.oldTask, task: creep.memory.task, mode: creep.memory.mode, 
            constructRoomName: creep.memory.constructRoomName, harvestRoomName: creep.memory.harvestRoomName, energyRoomName: creep.memory.energyRoomName}, creep.memory.spawnRoom, true)
    },
    behavior: function(){
        var creep = this.creep;
        var task = creep.memory.task;
        var local = (creep.memory.mode != "remote")
        if(local){
            if(task == null){
                creep.memory.task = "upgrade"
            }
            if(creep.totalEnergy() == 0 && creep.memory.task != "fetchEnergy"){
                delete creep.memory.fortifyTarget;
                creep.memory.oldTask = creep.memory.task;
                creep.memory.task = "fetchEnergy";
            }
            if(creep.memory.task == "fetchEnergy" && creep.totalEnergy() == creep.capacity() ){
                creep.memory.task = creep.memory.oldTask;
            }
        }else{
            if(creep.memory.task == null || (creep.totalEnergy() == 0 && creep.memory.task != "gather" && creep.memory.task != "harvest") ){
                creep.memory.task = "gatherEnergy";
            }
            if(creep.totalEnergy() == creep.carryCapacity && (creep.memory.task == "harvest" || creep.memory.task == "gatherEnergy")){
                delete creep.memory.sourceid;
                creep.memory.task = "construction";
            }
        }
        var result = tasks.runTasks(creep);
        if(local){
            if(result == "ERR_NO_TARGETS" && creep.memory.task != "upgrade"){
                creep.memory.task = "upgrade";
            }
        }else{
            if(result == "ERR_NO_TARGETS" && creep.memory.task == "construction"){
                creep.memory.task = "upgrade";
            }
            if(result == "ERR_NO_TARGETS" && creep.memory.task == "gatherEnergy"){
                creep.memory.task = "harvest";
            }
        }
    },
    partWeights: function(){
        var unitWeight = [["work", 1],["carry", 2],["move",2]];
        return unitWeight;
    },
    /**
     * Calculates the composition of a creep based on extensions in a room
     * @param: {integer} e - Number of extensions availible to spawning spawn
     * returns: [[2darray]] of PARTS and NUMBER OF PARTS in form [[PART, {integer}],[PART, {integer}]]
     */
    partWeightsExt: function(e){
        var unitWeight;
        if(e < 5){                                     // < 300 max energy avail
            unitWeight = [["work", 1],["carry", 2],["move",2]];     // cost: 300
        }else if(e < 10){                              // < 550 max energy avail
            unitWeight = [["work", 2],["carry", 3],["move",3]];     // cost: 500 
        }else if(e < 20){                              // < 800 max energy avail
            unitWeight = [["work", 3],["carry", 5],["move",4]];     // cost: 750
        }else if(e < 30){                                                      // 1300 max energy
            unitWeight = [["work", 5],["carry", 9],["move",7]];     // cost: 1300
        }else{                              //  2300 avail min
            unitWeight = [["work", 8],["carry", 16],["move", 12]];     // cost: 2000
        }
        return unitWeight;
    }
};

module.exports = scv;