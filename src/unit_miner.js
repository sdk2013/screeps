var tasks = require("tasks");
var miner = {
    beforeAge: function(){
        var creep = this.creep;
        var spawner = require('spawner');
        spawner.addToQueue("miner", {"role":"miner", mineEnergyTarget: creep.memory.mineEnergyTarget, mineEnergyRoomName: creep.memory.mineEnergyRoomName}, creep.memory.spawnRoom, false);
        delete Memory.creeps[creep.name];
    },
	behavior: function(){
	    var creep = this.creep;
        if(creep.carry["energy"] == 0){
            creep.memory.task = "mineEnergy";
        }
        var result = tasks.runTasks(creep);
        if(result == "ERR_NOT_IN_ROOM" && creep.memory.task == "offload"){
            creep.memory.builtcan == true;
        }
        if(creep.carry["energy"] >=  creep.carryCapacity - (creep.getActiveBodyparts(WORK)*2)){
            creep.memory.task = "offload";
            tasks.runTasks(creep);
        }
        if(creep.memory.builtcan == true && creep.memory.supportOrdered != true){
            creep.memory.supportOrdered = true;
            var spawner = require("spawner");
            spawner.addToQueue("collector", {role:"collector", gatherRoomName: creep.room.name}, creep.memory.spawnRoom, false)
        }
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
        if(extensionCount < 5){                                     // < 300 max energy avail
            unitWeight = [["work", 2],["carry", 1],["move",1]];     // cost: 300
        }else if(extensionCount < 10){                              // < 550 max energy avail
            unitWeight = [["work", 4],["carry", 1],["move",2]];     // cost: 550
        }else if(extensionCount < 20){                              // < 800 max energy avail
            unitWeight = [["work", 5],["carry", 1],["move",3]];     // cost: 700
        }else{                                                      // 1300 max energy
            unitWeight = [["work", 5],["carry", 1],["move",5]];     // cost: 700
        }
        return unitWeight;
    }
};

module.exports = miner;