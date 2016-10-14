var output = require("output")
var overlord = {
	/*
	 * returns an array of HQ rooms
	 * @Param {Game.spawns} spawns
	 * RETURN {Set} rooms - names of rooms running overlord AI
	 */
	getRoomsForAnalysis: function(spawns){
		var rooms;
		for(var name in spawns){
			var spawn = Game.spawns[name];
			if(spawn.room.controller && spawn.room.controller.my){
				rooms.push(spawn.room.name);
			}
		}
		Memory.overlord.coreRooms = rooms;
		return rooms;
	},
	/*
	 * Calculates the state of a room
	 * @param {String} roomName - room to run analysis for
	 * @param {Set} rooms - Set of all rooms running analytics
	 *                      Needed for reactive behavior
	 */
	calculateRoomStates: function(roomName){
		var errorstring = "Room " + roomName + "Encountered an error initializing memory";
        try{
            var room = Game.rooms[roomName]
            if()
            // 	Initialize room in memory if it doesn't exist
            this.initOverlordRoomMemory(roomName);
            // 	Need to have distances to other rooms for proximity based behavior
            errorstring = "Room " + roomName + "Encountered an error finding allied locations";
            this.findAlliedLocations(roomName);
            // 	Military stance check
            errorstring = "Room " + roomName + "Encountered an error determining combat stance";
            this.determineStance(roomName);
            //	Econonomic stance check
        }catch(e){
            output.log("overlord", 2, errorstring, e); 
        }
        
	    
	},
	/*
	 *	Finds the distances to other HQ rooms
	 *	@param {String} roomName - room to calculate distances for
	 */
	findAlliedLocations: function(roomName){
		var oRDists = [];
		for(var name in Memory.overlord.coreRooms){
			var distance = Game.map.getRoomLinearDistance(roomName, name);
			oRDists.push({name:name, distance:distance})
		}
		Memory.overlord[roomName].oRDists = oRDists;
		return oRDists;
	},
	/* TODO
	 * Establishes stance for room (typically autogenerated)
	 *  Determined by hostile activity (and determines other behavior)
	 * @param {String} roomName - name of room to determine stance for
	 * @param {Set} rooms - set of all HQ rooms (for reactive behavior)
	 * Stance States:
	 *
	 *  NUKE:
	 *      Status:     Room is under nuclear attack
     *      Trigger:    Nuke(s) detected in room
     *      Timeout:    No nuke detected
     *      Behavior:   Build ramparts over critical structures under nuke
     *                  Move Sub-critical structures under nuke
     *                  Dump Lab energy/resources to storage
     *					TODO: Write calculator for which structures to move
     *  NUKE_THREAT:
     *      Status:     Room is under threat of nuclear attack
     *      Trigger:    Manually set
     *                  NUKE Stance detected in nearby rooms
     *      Timeout:    Indefinite/(40 000 ticks?)
     *      Behavior:   Build Ramparts over critical structures
     *                  Dump Lab energy/resources to storage
     *                      TODO: create critical structure priority list
     *                          Focus spawns, storages, towers, terminals
     *  UNDER_ASSAULT:
     *      Status:     Room is currently under direct assault (not by invaders)
     *      Trigger:    Hostile creeps (not on IFF) in room
     *                  Hostile creeps (not on IFF) approaching from prox. rooms
     *                  TODO: Units killed in this or proximate rooms when hostiles detected
     *      Timeout:    100 ticks (Drops to alert state)
     *      Behavior:   Upgrading stops (blocks modes expand, resourcing, and GCL)
     *                  Remote mining in direction of attack paused
     *                  Locks ramparts and stations creeps in them
     *                  SCV Priority shifts to: Military Construction > Fortify > Else
     *                  
     *  ALERT:
     *      Status:     Room under immediate threat of attack
     *      Trigger:    Room exiting assault status
     *                  ASSAULT stance detected in other rooms
	 *                  
	 */
	determineStance: function(roomName, rooms){
	    //  CONFIG DEFAULTS
	    var nukeThreatTimeout = 40000;     
	    var underAssaultTimeout = 100;
	    var alertTimeout = 1500;
	    //  END CONFIG
	    var room = Game.rooms[roomName];
	    //  Nuke check is most important, so it's first
	    if(room.find(FIND_NUKES).length > 0){
	        Memory.overlord[roomName].stance = "NUKE";
	        Memory.overlord[roomName].stanceTime = Game.time;
	        return;
	    }
	    //  Check if anyone else is in NUKE stance
        for (let otherRoomName of rooms){
            if(Memory.overlord[otherRoomName].stance && Memory.overlord[roomName].stance == "NUKE"){
                Memory.overlord[roomName].stance = "NUKE_THREAT";
                Memory.overlord[roomName].stanceTime = Game.time;
                return;
            }
        }
	    //  If I'm still in NUKE_THREAT, check for timeout
	    if(Memory.overlord[roomName].stance = "NUKE_THREAT"){
	        if(Game.time >= (Memory.overlord[roomName].stanceTime + nukeThreatTimeOut)){
	            Memory.overlord[roomName].stance = null;
	        }else{
	            return;
	        }
	    }
	    //  If I'm under attack, go into UNDER_ASSAULT stance
	    if(this.roomIsUnderAttack(roomName)){
	        Memory.overlord[roomName].stance = "UNDER_ASSAULT";
            Memory.overlord[roomName].stanceTime = Game.time;
            return;
        //	If I'm not IMMEDITALY under attack, check the UNDER_ASSAULT timeout
	    }else if(Memory.overlord[roomName].stance == "UNDER_ASSAULT"){
            if(Game.time >= (Memory.overlord[roomName].stanceTime + underAssaultTimeOut))){
                Memory.overlord[roomName].stance = "ALERT";
                Memory.overlord[roomName].stanceTime = Game.time;
            }
	    }
	    //	TODO:
	    //	If I'm under attack, determine the direction of the assault (Possibly under the mode specific functions?)
	},
	/*
	 * Determines if room is under immediate or threatened attack
	 *      Checks own room
	 *      Checks immediately approximate rooms (regardless of if they're mine
	 *  		but not if they're hostile)
	 *		TODO: Check for spikes in hostile room creep counts
	 */
	roomIsUnderAttack: function(roomName){
	    var combat = require("combat");
	    var thisRoomTargetList = combat.IFFSafeTargetList(Game.rooms[roomName], false);
	    if(thisRoomTargetList > 0){
            return true;   
	    }
        var nearbyRooms = Game.map.describeExits(roomName);
        for (const key of Object.keys(nearbyRooms)) {
		    const nearbyRoom = obj[key];
		    if((!nearbyRoom.controller || nearbyRoom.controller.my)
		    	&& (combat.IFFSafeTargetList(nearbyRoom, false).length != 0)) {
		    	return true;
		    }
		}
		return false;
	},
	/*
	 * 	Part reference module - creates framework for overlord memory use later
	 * 	Doesn't overwrite anything that doesn't exist
	 * 	@param {string} roomName - Name of room for which to initialize memory.
	 */
    initOverlordRoomMemory: function(roomName){
        if(!Memory.overlord[roomName]){
            var roomData = {
            	//	High Level stuff
	            stance: null,       	//  Determines defensive behavior
	            stanceTime: 0,      	//  When room entered stance
	            mode: null,         	//  Economic mode
	            modeTime: 0,			//	When room entered mode
	            RCL: 0,					// 	Level of room controller
	            wallPerc: 0				//	Ideal Percentage of wall capacity for room
				remoteRooms: [],   		//  List of remote mining rooms
				oRDists: [],			// 	List of other HQ rooms and the distances to them
	            
	            //	TaskList related data
	            taskList: [],			//	What needs building. Objects are {id, amountrequired, type (extension, storage, military, etc.)}
	            strucList: [],			//	List of all structures in the room

				//	Creep related Data
	            creepCount: 0,       	//  Creeps owned by this room
	            creepIds: [],			//	Ids of all creeps based in this room

	            //	Link Related Data
	            links: [],				//	ObjectIds of all links in the room
	            sndLinks: [],			// 	ObjectIds of send only links
	            ctlLink: null,			// 	ObjectId of controller link (essentially recieve only)


	        }
	        Memory.overlord[roomName] = roomData;
        }
    },
	/*	TODO
	 * 	This module is supposed to be called when a creep is in "idle" taskstate
	 * 	@param {Creep} creep - creep in idle state
	 */
	getNewTask: function(creep){
		
	}

}
module.exports = overlord;