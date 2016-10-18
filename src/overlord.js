/*
TODO:
New prototypes to manage Projected Energy will be necessary
creep.pull needs modified with projected energy counter
creep.push needs built to replace creep.transfer

Move direct overlord memory access to prototype module "overlordData"
OR
Switch to an `old` object to handle accessing the overlord data
 
*/

var output = require("output");
var validStances = ["NUKE", "NUKE_THREAT", "UNDER_ASSAULT", "ALERT", "SIEGE", "STANDBY", "NO_STANCE"];
var validModes = ["FORTIFY", "MIL-IND", "EXPAND", "SIEGE_DEFENSE", "STOCKPILE", "BALANCED", "NO_MODE"];
var overlord = {
	/*
	 * returns an array of HQ rooms
	 * @Param {Game.spawns} spawns
	 * RETURN {Set} rooms - names of rooms running overlord AI
	 */
	getRoomsForAnalysis: function(spawns){
		var rooms = [];
		for(var name in spawns){
			var spawn = Game.spawns[name];
			if(spawn.room.controller && spawn.room.controller.my){
				rooms.push(spawn.room.name);
			}
		}
		if(Memory.overlord === undefined){
			Memory.overlord = {};
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
		var errorstring = "Room " + roomName + " encountered an error calculating states";
        try{
            var room = Game.rooms[roomName];
            // 	Initialize room in memory if it doesn't exist
            errorstring = "Room " + roomName + " encountered an error initializing memory";
            this.initOverlordRoomMemory(roomName);
            //	Check the cached data to see if it's up to date;
            errorstring = "Room " + roomName + " encountered an error during data verification";
            this.verifyData(roomName);
            // 	Need to have distances to other rooms for proximity based behavior
            errorstring = "Room " + roomName + " encountered an error finding allied locations";
            findAlliedLocations(roomName);
            // 	Military stance check
            errorstring = "Room " + roomName + " encountered an error determining combat stance";
            this.determineStance(roomName);
            //	Economic stance check
            errorstring = "Room " + roomName + " encountered an error determining economic mode";
            this.determineMode(roomName);
        }catch(e){
            output.log("overlord", 2, errorstring, e); 
        }
	},
	verifyData: function(roomName){
		var old = Memory.overlord[roomName];
		var room = Game.rooms[roomName];

		//	TODO - Do I want to actually _use_ this?
		var creepCache = room.find(FIND_CREEPS);
		//	Construction Site Cache
		var sites = room.find(FIND_CONSTRUCTION_SITES);
		if(sites.length != old.siteCount){
			old.siteCache = _(sites).map(s => s.id);
		}
		//	Structure caches
		if(room.find(FIND_STRUCTURES).length != old.strCount){
			var structureCache = room.find(FIND_STRUCTURES);
			old.strCount = structureCache.length;
			old.roadCache = _(structureCache)
						.remove(s => s.structureType == STRUCTURE_ROAD)
						.map(s => s.id);
			old.wallCache  = _(structureCache)
						.remove(s => s.structureType == STRUCTURE_WALL)
						.map(s => s.id);
			old.rampCache =  _(structureCache)
						.remove(s => s.structureType == STRUCTURE_RAMPART)
						.map(s => s.id);
			old.strCache = _(structureCache)
						.filter(s => s.structureType != STRUCTURE_ROAD)
						.filter(s => s.structureType != STRUCTURE_WALL)
						.filter(s => s.structureType != STRUCTURE_RAMPART)
						.map(s => s.id);
			//	Link Cache
			var links = _(structureCache)
						.filter(s => s.structureType == STRUCTURE_LINK)
						.map(s => s.id);
			if(links.length != old.links){
				old.links = links;
				//this.determineLinkModes(roomName);
			}

		}
		//	Source Cache
		if(old.srcCache.length === 0){
			var sourceCache = room.find(FIND_SOURCES);
			for(var i = sourceCache.length; i-- > 0;){
				var source = sourceCache[i];
				var s = {
					id: 	source.id,
					pos: 	source.pos,
					e: 		source.energy,
					ttr: 	source.ticksToRegeneration
				};
				old.srcCache.push(s);
			}
		}
		//	Mineral Checks
		var liveMineral = room.find(FIND_MINERALS)[0];
		if(old.mineralCache === null){
			console.log(JSON.stringify(liveMineral));
			var m = {
				type: 	liveMineral.mineralType,
				pos: 	liveMineral.pos,
				amt: 	liveMineral.amount,
				ttr: 	liveMineral.ticksToRegeneration
			};
			old.mineralCache = m;
		}
		old.mineralCache.amt = liveMineral.amount;
		old.mineralCache.ttr = liveMineral.ticksToRegeneration;
		return OK;
	},
	/*
	 *	Determines which modes are possible for links (Send, recieve, or both)
	 *		for the given room.
	 *	@param {String} roomName
	 */
	determineLinkModes: function(roomName){
		setLinkProto();
		var old = Memory.overlord[roomName];
		var links = old.links;
		for(var id in links){
			var link = Game.getObjectById(id);
			//	Can't send or recieve means the link hasn't been configured
			if(!link.canRecieve && !link.canSend){
				if(link.pos.findInRange(FIND_SOURCES, 2).length !== 0){
					link.canRecieve = false;
					link.canSend = true;
					old.sndLinks.push(link.id);
					continue;
				}
				if(link.pos.getRangeTo(link.room.controller.pos) <= 4){
					link.canRecieve = true;
					link.canSend = false;
					old.ctlLink = link.id;
					continue;
				}
				if(link.pos.findInRange(link.room.storage) <= 3){
					link.canRecieve = true;
					link.canSend = true;
					continue;
				}
				if(link.pos.findInRange(FIND_EXIT, 5).length !== 0){
					link.canRecieve = false;
					link.canSend = true;
					old.sndLinks.push(link.id);
					continue;
				}
				output.log("overlord", 4, "Error in room " + link.room.name + " : Link mode could not be determined for link - " + link.id);
			}
		}
	},
	/*
	 *	Determines the economic mode of the room
	 *	@param 	{String} roomName
	 *
	 *	FORTIFY:
	 *		Status: 	Room is undergoing rapid fortification
	 *		Trigger: 	RCL >= 5 && Walls below stored limit TODO
	 *					Stance == NUKE;
	 *		Timeout: 	Recalculate on exiting alert status
	 *		Behavior: 	Excess projected resources spent on wall and rampart fortification
	 *					Resource cap doubled
	 *		
	 *
	 *	MIL-IND:
	 *		Status: 	Room is undergoing military build-up
	 *		Trigger: 	Current or nearby (alert range) room UNDER_ASSAULT
	 *					Stance == UNDER_ASSAULT 
	 * 					Stance == ALERT (proximity triggered)
	 *		Timeout: 	No rooms need military assistance (old.stance != alert)
	 *		Behavior: 	Excess projected resources spent on military creep production and wall fortification
	 *					If prox triggered, creeps attempt to move to besieged room via safe rooms
	 *
	 *	EXPAND:
	 *		Status: 	Room is undergoing rapid infrastructure expansion
	 *		Trigger: 	RCL <= old.RCL &&  construction sites / structure count > old.conPer
	 *		Timeout: 	No further structures to build
	 *		Behavior: 	Excess projected resources spent on construction creeps and construction
	 *
	 *	SIEGE_DEFENSE:
	 *		Status: 	Room is under siege and is attempting to survive
	 *		Trigger: 	Stance == SIEGE
	 *		Timeout: 	Trigger no longer valid 
	 *		Behavior: 	Collectors en route to sieged subroom pulled back
	 *					Miner replacements no longer ordered to sieged room
	 *					Depending on incursion threat size:
	 *						Muster strike squad to counter attack
	 *						Shut down remote operations
	 *					Scouts sent to besieged room
	 *					upgrader cap == 1, upgrader size limit minimized
	 *
	 *	STOCKPILE:
	 *		Status: 	Room is storing all availble resources for future use
	 *		Trigger: 	Room projected resources falling below 50k
	 *		Timeout: 	Trigger no longer valid
	 *		Behavior: 	Resource cap removed
	 *
	 *	BALANCED:
	 *		Status: 	Room is operating normally with no changes
	 *		Trigger: 	Default State
	 * 		Timeout: 	None
	 * 		Behavior: 	Maintains an even distribution of civilian creeps
	 * 					
	 */
	determineMode: function(roomName){
		var old = Memory.overlord[roomName];
		initialize(old);
		var room = Game.rooms[roomName];
		//	Nuke check is most important
		if(old.stance == "NUKE"){
			return old.setMode("FORTIFY");
		}
		//	If I'm under attack, military production is vital
		if(old.stance == "UNDER_ASSAULT" || (old.stance == "ALERT" && old.stanceProx === true)){
			return old.setMode("MIL-IND");
		}
		//	Makes sure that I'm not being indirectly attacked
		if(old.stance == "SIEGE"){
			return old.setMode("SIEGE_DEFENSE");
		}
		//	After that, it's important that I don't run out of resources in storage
		if(old.projS !== null && old.RCL >= 5 && old.projS < old.storLo){
			return old.setMode("STOCKPILE");
		}
		//	If I'm stockpiling, I want to get a buffer up before I do other things
		if(old.projS !== null && old.mode == "STOCKPILE" && old.projS < old.storHi){
			return "STOCKPILE";
		}
		//	If I'm not immediately out of resources, rapid expansion is important
		// 		if I have more than a certain percentage of sites to build and RCL
		//		is higher than a certain trigger level
		if(old.RCL >= old.conRCL && (old.siteCount / old.strCount) > old.conHiPer ){
			return old.setMode("EXPAND");
		}
		//	If I recently triggered EXPAND mode, I want to stay in it if reasonable
		if(old.mode == "EXPAND" && (old.siteCount / old.strCount) > old.conLoPer){
			return "EXPAND";
		}
		return old.setMode("BALANCED");
	},
	/* 
	 * Establishes stance for room (typically autogenerated)
	 *  Determined by hostile activity (and determines other behavior)
	 * @param {String} roomName - name of room to determine stance for
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
     *      Timeout:    Indefinite / 10k ticks
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
     *                  ASSAULT stance detected in other room
     *		Timeout: 	2000 ticks (Creep life, plus some wiggle room)
     *		Behavior: 	Stockpile limit increased
     *					Small numbers of defensive ralliers spawn
     *					All ramparts lock
     *
     *	SIEGE:
     *		Status: 	Remote mining operations under attack
     *		Trigger: 	Baron AIs for remote rooms going into SIEGE stance
     *		Timeout: 	Hostile Units Killed
     *					1500 ticks
     *					Rooms clear
     *		Behavior: 	Strike Teams deployed based on hostile threatscore
     *					Remote mining in those rooms halted
     *
     *	STANDBY:
     *		Status: 	Room conducting normal operations
     *		Trigger: 	Default state
     *		Timeout: 	None
     *		Behavior: 	Determined by economic state
	 */
	determineStance: function(roomName, rooms){
		var old = Memory.overlord[roomName];		//	Short for OverlordData
		initialize(old);
	    var room = Game.rooms[roomName];
	    //  Nuke check is most important, so it's first
	    if(room.find(FIND_NUKES).length > 0){
	        return old.setStance("NUKE");
	    }
	    //  Check if anyone else is in NUKE stance
	    var nukeProx = nearbyRoomsInRangeInStance(roomName, old.nukeProxDist, "NUKE");
        if(!!nukeProx){
            return old.setStance("NUKE_THREAT", nukeProx);
        }
	    //  If I'm still in NUKE_THREAT, check for timeout
	    if(old.stance == "NUKE_THREAT"){
	        if(Game.time >= (old.stanceTime + nukeThreatTimeOut)){
	            old.setStance("NO_STANCE");
	        }else{
	            return old.stance;
	        }
	    }
	    //  If I'm under attack, go into UNDER_ASSAULT stance
	    if(roomIsUnderAttack(roomName)){
	        return old.setStance("UNDER_ASSAULT");
        }
        //	If I'm not IMMEDITALY under attack, check the UNDER_ASSAULT timeout
	    if(old.stance == "UNDER_ASSAULT"){
            if(Game.time >= (old.stanceTime + underAssaultTimeOut)){
                return old.setStance("ALERT");
            }else{
            	return old.stance;
            }
	    }
	    //	TODO:
	    //	If I'm under attack, determine the direction of the assault (Possibly under the mode specific functions?)
	    //	If I'm not under attack, check if my neighbors are-
	    var alertProx = nearbyRoomsInRangeInStance(roomName, old.alertProxDist, "UNDER_ASSAULT");
	    if(!!alertProx){
	    	return old.setStance("ALERT", alertProx);
	    }
	    //	If I'm in siege mode, check to see if I'm still being besieged
	    if(supportRoomsAreInStance(roomName, "SIEGE")){
	    	return old.stanceTime("SIEGE");
	    }
	    //	If I'm in standby and there's no need to update, just return, 
	    if(old.stance == "STANDBY"){
	    	return;
	    }
	    return old.setStance("STANDBY");
	},
	/*
	 * 	Part reference module - creates framework for overlord memory use later
	 * 	Doesn't overwrite anything that doesn't exist
	 * 	@param {string} roomName - Name of room for which to initialize memory.
	 */
    initOverlordRoomMemory: function(roomName){
    	if(!Memory.overlord){
    		Memory.overlord = {};
    	}
        if(!Memory.overlord[roomName]){
            var roomData = {
            	//	High Level stuff
	            stance: null,       	//  Determines defensive behavior
	            stanceTime: 0,      	//  When room entered stance
	            stanceProx: false,		//	Whether current stance was triggered by proximity behavior (otherwise the name of the trigger room)
	            mode: null,         	//  Economic mode
	            modeTime: 0,			//	When room entered mode
	            RCL: 0,					// 	Level of room controller
	            wallPerc: 0,			//	Ideal Percentage of wall capacity for room
				remoteRooms: [],   		//  List of remote mining room names
				oRDists: [],			// 	Array of other HQ rooms and the distances to them
				dBuff: 0,				//	Desired energy buffer for the room
				projS: null,			//	Projected Energy storage after completion of actions and creep life

				//	Defense Related Data
				thLim: 0,				//	Enemy threat limit before response
	            dexits: [],				//	Dangerous (attacked) exits (directions not to mine in)
	            tdmode: null,			//	Tower Defense Mode (Determines targetting);
	            tdtarget: null,			//	Id of current target
	            tdlasthits: 0,			//	Hits of target last tick (for stalemate checking);
	            tdprev: null,			//	Id of prevoius target (used when tdtarget is null to prevent reselecting the same target)

	            //	TaskList related data
	            spwnQueue: [],			//	SpawnQueue for the room
	            taskList: [],			//	What needs doing. Objects are {id, amount required, type (extension, storage, military, etc.), pos}

	            //	Caches
	            strCount: 0,			//	Count of ALL structures in room (used to trigger strCacheUpdate)
	            strCache: [],			//	List of all non-wall/rampart structure ids in the room
	            srcCache: [],			//	Cache of source information objects
	            wallCache: [],			//	Cache of all wall ids in room
	            roadCache: [],			// 	Cache of all road ids in room
	            rampCache: [],			// 	Cache of all rampart ids in the room
	            mineralCache: null,		//	Cache of mineral type, location, amount, ticks-to-regen, and density
	            siteCount: 0,			//	Count of construction sites in room
	            siteCache: [],			//	Cache of construction site ids in room
	            creepCount: 0,       	//  Creeps owned by this room
	            creepCache: [],			//	Cache of all creep ids for those based in this room

	            //	Link Related Data
	            links: [],				//	ObjectIds of all links in the room
	            sndLinks: [],			// 	ObjectIds of send only links
	            ctlLink: null,			// 	ObjectId of controller link (essentially receive only)

	            //	Lab Related Data
	            labs: [],				// 	Objects of all labs in the room containing: Id, mode

	            //	Overlord Behavior Defaults
	            nukeThreatTimeout: 10000,     		//	Timeout in ticks for nuke threat
	            nukeProxDist: 5,					//	Default linear range in which nukes will trigger nuke_threat
	    		underAssaultTimeout: 100,			//	Timeout in ticks for room to no longer be under assault
	    		alertTimeout: 1500,					//	Timeout in ticks for a room to stand down from alert
	    		alertProxDist: 5,					//	Default linear range in which an assault will trigger that room's alert
	    		siegeTimeout: 1000,					//	Timeout for siege for HQ room
	    		storLo: 45000,						//	Low energy alert trigger
	    		storHi: 150000,						//	Trigger to go back into regular operations
	    		conHiPer: 0.35,						//	Percentage of construction sites to trigger expand mode
	    		conLoPer: 0.1,						//	Percentage of construction sites to leave expand mode
	    		conRCL: 5 							//	Minimum RCL to trigger expand mode
	        };
	        Memory.overlord[roomName] = roomData;
        }
    },
	/*	TODO
	 * 	This module is supposed to be called when a creep is in "idle" taskstate
	 * 	@param {Creep} creep - creep in idle state
	 */
	getNewTask: function(creep){
		
	}

};
module.exports = overlord;
/*
 *	Initializes setters for the overlord data object's stances
 */
function initialize(overlordDataObject){
	overlordDataObject.setStance = function(stance, proxTriggered = false){
		if(validStances.includes(stance)){
			overlordDataObject.stance = stance;
			overlordDataObject.stanceTime = Game.time;
			overlordDataObject.stanceProx = proxTriggered;
			return stance;
		}else{
			throw new Error("INVALID STANCE");
		}
	};
	overlordDataObject.setMode = function(mode){
		if(validModes.includes(mode)){
			overlordDataObject.mode = mode;
			overlordDataObject.modeTime = Game.time;
			return mode;
		}else{
			throw new Error("INVALID STANCE");
		}
	};
}
/*
 *	Determines if any self-HQs within the given range are in a certain stance
 *	@param {String} roomName
 *	@param {integer} range - linear range between rooms
 *	@param {String} stance
 */
function nearbyRoomsInRangeInStance(roomName, range, stance){
	var old = Memory.overlord[roomName];
	if(!validStances.includes(stance)){
		throw new Error("INVALID STANCE");
	}
	for(var i in old.oRDists){
		if(i.distance <= range && roomIsInStance(i.name, stance)){
			return i.name;
		}
	}
	return false;
}
/*
 *	Determines if any sub rooms within the given range are in a certain stance
 *	@param {String} roomName
 *	@param {String} stance
 */
function supportRoomsAreInStance(roomName, stance){
	var old = Memory.overlord[roomName];
	for(var i in old.remoteRooms){
		if(roomIsInStance(i.name, stance)){
			return true;
		}
	}
	return false;
}
/*
 *	Checks if the room is in the stance. If so, true. Anything else is false.
 *	@param {String} roomName
 * 	@param {String} stance
 */
function roomIsInStance(roomName, stance){
	if(!!Memory.overlord && !!Memory.overlord[roomName] && Memory.overlord[roomName].stance == stance){
		return true;
	}
	return false;
}
/*
* Determines if room is under immediate or threatened attack
*      Checks own room
*      Checks immediately approximate rooms (regardless of if they're mine
*  		but not if they're hostile)
*		TODO: Check for spikes in hostile room creep counts
*/
function roomIsUnderAttack(roomName){
	var combat = require("combat");
	var thisRoomTargetList = combat.IFFSafeTargetList(Game.rooms[roomName], false);
	if(thisRoomTargetList > 0){
	    return true;   
	}
	var nearbyRooms = Game.map.describeExits(roomName);
	for (const key of Object.keys(nearbyRooms)) {
	    const nearbyRoom = nearbyRooms[key];
	    if(Game.rooms[nearbyRoom] === null){
			continue;
		}
	    if((!nearbyRoom.controller || nearbyRoom.controller.my) && (combat.hostileTargetList(nearbyRoom).length !== 0)) {
	    	return true;
	    }
	}
	return false;
}
/*
	 *	Finds the distances to other HQ rooms
	 *	@param {String} roomName - room to calculate distances for
	 */
function findAlliedLocations(roomName){
	var oRDists = [];
	for(var name in Memory.overlord.coreRooms){
		var distance = Game.map.getRoomLinearDistance(roomName, name);
		oRDists.push({name:name, distance:distance});
	}
	Memory.overlord[roomName].oRDists = oRDists;
	return oRDists;
}
function setLinkProto(){
	    Object.defineProperties(StructureLink.prototype, {
        "canSend": {
            get: function(){
                if(!!Memory.objects){
                    var send = Memory.objects[this.id].canSend;
                    if(send === undefined){
                        return false;
                    }
                    return send;
                }
                Memory.objects = {};
                return false;
                
            },
            set: function(mode){
                if(mode === true || mode === false){
                    Memory.objects[this.id].canSend = mode;
                }else{
                    throw "canSend must be boolean";
                }
            },
            configurable: true,
            enumerable: false
        },
        "canRecieve": {
            get: function(){
                if(!!Memory.objects){
                    var recieve = Memory.objects[this.id].canRecieve;
                    if(send === undefined){
                        return false;
                    }
                    return recieve;
                }
                Memory.objects = {};
                return false;
                
            },
            set: function(mode){
                if(mode === true || mode === false){
                    Memory.objects[this.id].canRecieve = mode;
                }else{
                    throw "canRecieve must be boolean";
                }
            },
            configurable: true,
            enumerable: false
        }
    });
}