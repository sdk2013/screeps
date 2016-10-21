var unit_claimer = {
	beforeAge: function(){
		var spawner = require("spawner")
		var creep = this.creep;
		if(creep.memory.task == "reserve" || creep.memory.renew == true){
			var timeToBuild = creep.room.controller.reservation.ticksToEnd + Game.time - 300;
			spawner.addToDelayedQueue(timeToBuild, "claimer", {role:"claimer", task: creep.memory.task, reserveRoomName: creep.memory.reserveRoomName}, 
				creep.memory.spawnRoom, false);
		}
		
	},
	
	behavior: function(){
		var creep = this.creep;
		require('tasks').runTasks(creep);
	},
	
	onSpawn: function(){},
	
    partWeightsExt: function(extensionCount){
        if(extensionCount <= 18){                              // < 550 max energy avail
            var unitWeight = null;     // cost: 500 
        }else if(extensionCount <= 21){                              // < 800 max energy avail
            var unitWeight = [["claim", 1],["move",2]];     // cost: 600
        }else{                                                      // 1300 max energy
            var unitWeight = [["claim", 2],["move",4]];     // cost: 1000
        }
        return unitWeight;
    }
}
module.exports = unit_claimer;