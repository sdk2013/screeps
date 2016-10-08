var overlord = {
	/*
	 * returns an array of HQ rooms
	 * @Param {Game.spawns} spawns
	 * RETURN [Array] room names
	 */
	getRoomsForStates: function(spawns){
		var rooms;
		for(var name in spawns){
			var spawn = Game.spawns[name];
			if(rooms[spawn.room.name] == null){
				rooms[spawn.room.name] = {};
			}
		}
	}
	/*
	 *
	 *
	 */
	runRoomStates: function()
	/*
	 * This module is supposed to be called when a creep is in "idle" taskstate
	 * @param {Creep} creep - creep in idle state
	 */
	getNewTask: function(creep){
		
	}

}
module.exports = overlord;