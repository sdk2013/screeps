/*
 */
var tasks = require("tasks")
var guard = {
    beforeAge: function(){},
	
	behavior: function(){
	    var creep = this.creep;
	    if(creep.memory.task == null){
	    	creep.memory.task = "combat";
	    }
	    if(creep.memory.combatTask == null){
	    	creep.memory.combatTask = "watch";
	    }
	    tasks.runTasks(creep);

        if(creep.ticksToLive == 200 && creep.memory.combatTask == "watch"){
            var spawner = require('spawner')
            var creep = this.creep;
            spawner.addToQueue("guard", {role:"guard", watchRoomName: creep.memory.watchRoomName}, creep.memory.spawnRoom, false);
        }
	},
	
	onSpawn: function(){},

	partWeights: function(){
	    return [[MOVE, 1]]
	},
	/**
     * Calculates the composition of a creep based on extensions in a room
     * @param: {integer} Number of extensions availible to spawning spawn
     * returns: [[2darray]] of PARTS and NUMBER OF PARTS in form [[PART, {integer}],[PART, {integer}]]
     */
    partWeightsExt: function(extensionCount){
        if(extensionCount < 5){                                     // < 300 max energy avail
            var unitWeight = [["attack", 1],["move",1]];     // cost: 300
        }else if(extensionCount < 10){                              // < 550 max energy avail
            var unitWeight = [["tough", 2],["move", 3],["attack",4]];     // cost: 500 
        }else if(extensionCount < 20){                              // < 800 max energy avail
            var unitWeight = [["move", 4],["attack", 2],["ranged_attack",1],["heal", 1]];     // cost: 760
        }else if (extensionCount < 30){                                                      // 1250 max energy
            var unitWeight = [["move", 4],["attack", 3],["ranged_attack",2],["heal", 1],["move",2]];     // cost: 1090
        }else if (extensionCount < 40){                              // 1800 avail
            var unitWeight = [["move", 4],["attack", 3],["ranged_attack",2],["heal", 1],["move",2]];     // cost: 1090
            //var unitWeight = [["move", 8],["attack", 6],["ranged_attack",2],["heal", 2],["move",2]];     // cost: 1780
        }else{          // 2250 energy avail
            var unitWeight = [["move", 8],["attack", 6],["ranged_attack",2],["heal", 2],["move",2]];     // cost: 1780
            //var unitWeight = [["move", 11],["attack", 8],["ranged_attack",3],["heal", 2],["move",2]];     // cost: 2240
        }
        return unitWeight;
    }
}
module.exports = guard