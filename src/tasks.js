/*
 * This is the basic tasks file for screeps. No behavior logic should ever go here, just actions. Behavior logic should be handled in the unit_[name] modules
 * Everything here should be called with this.[functionname].call();
 */
var output = require("output");
var search = require('search');
var tasks = {
    /*
     * Main task function - orders creep to do tasks assigned to it.
     * @param {creep} - creep running function
     */

    runTasks: function(creep){
        var result;
		switch(creep.memory.task){
            /*
             * Long Range energy Collection Module
             * Preferences light storage
             * Defualts to current room
             * @param {string} targetRoomName - Name of room to gather from
             * RETURN Errorcode
             */
            case "gatherEnergy":
                var gatherRoomName = creep.memory.gatherRoomName;
                if(gatherRoomName == null){gatherRoomName = creep.room.name;}
                result = this.gatherEnergyInTargetRoom(creep, gatherRoomName);
                break;
            /*
             * Long Range Energy Return Module
             * Defualts home spawn
             * @param {string} homeRoomName - Name of room to return to
             * RETURN Errorcode
             */
            case "return":
                var returnRoomName = creep.memory.returnRoomName;
                if(returnRoomName == null) {returnRoomName = creep.memory.spawnRoom;}
                result = this.returnEnergyToBase(creep, returnRoomName);
                break;
            /*
             * Local controller upgrade
             * Defualts to current room
             * @param {string} targetRoomName - Name of room to upgrade
             * RETURN Errorcode
             */
            case "upgrade":
                var upgradeRoomName = creep.memory.upgradeRoomName;
                if(upgradeRoomName == null) {upgradeRoomName = creep.room.name;}
                result = this.upgradeRCL(creep, upgradeRoomName);
                break;
            /*
             * Local construct sites
             * Defualts to current room
             * @param {string} constructRoomName - Name of room to construct in
             * RETURN Errorcode
             */
            case "construction":
                var constructRoomName = creep.memory.constructRoomName;
                if(constructRoomName == null) {constructRoomName = creep.room.name;}
                result = this.constructInTargetRoom(creep, constructRoomName);
                break;
            /*
             * Gather energy from room (generally used to provide energy for other objectives)
             * Preferences heavy storage
             * Defualts to current room
             * @param {string} energyRoomName - Name of room to get energy from
             * RETURN Errorcode
             */
            case "fetchEnergy":
                var energyRoomName = creep.memory.energyRoomName;
                if(energyRoomName == null) {energyRoomName = creep.room.name;}
                result = this.fetchEnergyFromRoom(creep, energyRoomName);
                break;
            /*
             * Reserve the target room for security/remote mining
             * No default setting (throws error)
             * @param {string} reserveRoomName - Name of room to reserve
             * RETURN Errorcode
             */
            case "reserve":
                var reserveRoomName = creep.memory.reserveRoomName;
                if(reserveRoomName == null) {return "ERR_NO_TARGETS";}
                result = this.reserveTargetRoom(creep, reserveRoomName);
                break;
            /*
             * Claims the target room
             * No default setting (throws error)
             * @param {string} claimRoomName - Name of room to claim
             * RETURN Errorcode
             */
            case "claim":
                var claimRoomName = creep.memory.claimRoomName;
                if(claimRoomName == null) {return "ERR_NO_TARGETS";}
                result = this.claimTargetRoom(creep, claimRoomName);
                break;
            /*
             * Repairs structures in the target room, ignoring walls and ramparts
             * Defaults to current room
             * @param {string} repairRoomName - Name of room to repair in
             * RETURN Errorcode
             */
            case "repair":
                var repairRoomName = creep.memory.repairRoomName;
                if(repairRoomName == null) {repairRoomName = creep.room.name;}
                result = this.repairTargetRoom(creep, repairRoomName);
                break;
            /*
             * Fortifies walls and ramparts in target room
             * Defaults to current room
             * @param {string} fortifyRoomName - Name of room to fortify
             * RETURN Errorcode
             */
            case "fortify":
                var fortifyRoomName = creep.memory.fortifyRoomName;
                if(fortifyRoomName == null) {fortifyRoomName = creep.room.name;}
                result = this.fortifyTargetRoom(creep, fortifyRoomName);
                break;
            /*
             * Fills production structures and creeps in priority list in room
             * Defaults to current room
             * @param {string} fillRoomName
             * RETURN Errorcode
             */
            case "fill":
                var fillRoomName = creep.memory.fillRoomName;
                if(fillRoomName == null) {fillRoomName = creep.room.name;}
                result =  this.fillTargetRoom(creep, fillRoomName);
                break;
            /*
             * Offloads energy to nearby can, or builds a can at current location
             * No params
             * RETURN Errorcode
             */
            case "offload":
                result = this.offloadEnergyToCan(creep);
                break;
            /*
             * Mines availible resource nodes in target room
             * Defaults to current room if target is blank, otherwise defaults
             *      to target flag
             * Defaulting is done in-function due to specialist behavior, I may regret this
             * @param {string} mineRoomName
             * RETURN Errorcode
             */
            case "mineEnergy":
                result = this.mineTargetEnergy(creep);
                break;
            /*
             *  Goes to room
             *  @param {String} gotoRoomName 
             */
            case "goto":
                var gotoRoomName = creep.memory.gotoRoomName;
                result = this.gotoRoom(creep, gotoRoomName);
                break;
            /*
             *  Attempts to move to each flag in sequence
             *
             */
            case "waypointMove":
                result = this.waypointMove(creep);
                break;
            /*
             * Harvest energy in the target room for self (usually for remote ops)
             * Preferences nearer, unoccupied sources
             * Defualts to current room
             * @param {string} energyRoomName - Name of room to get energy from
             * RETURN Errorcode
             */
            case "harvest":
                var harvestRoomName = creep.memory.harvestRoomName;
                if(harvestRoomName == null) {harvestRoomName = creep.room.name;}
                result = this.harvestTargetRoom(creep, harvestRoomName);
                break;
            /*
             * Directs creeps to the combat module
             */
            case "combat":
                var tasks_combat = require("tasks_combat");
                result = tasks_combat.runTasks(creep);
                break;
            default:
                output.log("tasks", 4, "Creep: " + creep.name + " in room " + creep.room.name +  " has no task.");
                result ="ERR_NO_TASK"
            /**/
        }
        return result;
    },
    /*
     *  Moves via waypoints
     *
     */
    waypointMove: function(creep){
        if(creep.memory.currentStage == null){
            creep.memory.currentStage = 0;
        }
        if(creep.memory.waypoints == null){
            creep.memory.waypoints = Memory.chumpWaypoints;
        }
        var target = Game.flags[creep.memory.waypoints[creep.memory.currentStage]]
        creep.moveTo(target);
        if(creep.pos == target.pos && currentStage < creep.memory.waypoints.length - 1){
            creep.memory.currentStage++;
        }
        if(creep.pos == target.pos && currentStage == creep.memory.waypoints.length - 1){
            return "ERR_NO_TARGETS"
        }
    },
    /*
     *  Goes to room
     *  @param {Creep} creep
     *  @param {string} roomName
     */
    gotoRoom: function(creep, roomName){
        creep.toSay("GO2-");
        if(creep.memory.flag != null){
            creep.toSay("$F-");
            if(creep.pos == Game.flags[creep.memory.flag].pos){
                creep.toSay("OK");
                return OK;
            }else{
                creep.toSay(">F");
                creep.moveTo(Game.flags[creep.memory.flag])
                return "ERR_NOT_IN_ROOM;"
            }
        }
        if(creep.room == Game.rooms[roomName]){
            return OK;
        }
        creep.toSay(">R")
        creep.goto(roomName);
        return "ERR_NOT_IN_ROOM"
    },
    /*
     * Mines the nearest unoccupied source for future use
     * @param {Creep} creep - creep to harvest
     * @param {string} targetRoomName - Room to harvest in
     */
    harvestTargetRoom: function(creep, targetRoomName){
        creep.toSay("HAR-");
        var targetRoom = Game.rooms[targetRoomName];
        if(creep.room != targetRoom){
            creep.toSay(">R")
            return creep.goto(targetRoomName);
        }
        var target = Game.getObjectById(creep.memory.sourceid)
        if(target == null){
            creep.toSay("?T-")
            delete creep.memory.sourceid;
            var sources = search.findHarvestSources.call(creep)

            if(sources.length == 0){
                creep.toSay("!T")
                return "ERR_NO_TARGETS"
            }
            var target = sources.pop();
            creep.memory.sourceid = target.id; 
        }
        var target = Game.getObjectById(creep.memory.sourceid)
        creep.toSay("$T")
        var result = creep.pull(target)
        if(result == ERR_NOT_IN_RANGE){
            creep.moveTo(target)
        }
        return result;
    },
    /*
     * Mines the target, if it exists, if not, navigates to the flag of the target,
     *  if it exists, if not, navigates to the room in memory if it exists, if not,
     *  selects an unoccupied source in the current room. If not, throws an error.
     * @param {object} creep - creep operating this function
     * RETURN Errorcode
     */
    mineTargetEnergy: function(creep){
        creep.toSay("ENE-");
        var target = Game.getObjectById(creep.memory.mineEnergyTarget);
        if(target != null){
            creep.toSay("$T")
            var result = creep.harvest(target)
            if(result == ERR_NOT_IN_RANGE){
                creep.toSay(":->T");
                creep.repairMoveTo(target);
            }
            return result;
        }
        if(target == null){
            target == Game.flags[creep.memory.mineEnergyTarget]
        }
        if(target != null){
            creep.toSay("$T");
            creep.toSay(":->F");
            creep.repairMoveTo(target);
            return "ERR_NOT_IN_ROOM"
        }
        //Ok, now we have to navigate to the room if there is no flag or target
        var targetRoomName = creep.memory.mineEnergyRoomName;
        if(targetRoomName != null && Game.rooms[targetRoomName] != creep.room){
            creep.toSay("!T");
            creep.toSay(":->R");
            creep.goto(targetRoomName);
            return "ERR_NOT_IN_ROOM"
        }
        //This only needs to run if I don't have a source
        var target = Game.getObjectById(creep.memory.mineEnergyTarget);
        if(target == null){
            creep.toSay("?T-")
            creep.memory.mineEnergyRoomName = creep.room.name;
            var search = require("search");
            var sources = search.findPriorityEnergyNodes.call(creep);
            if(sources.length == 0){
                creep.toSay("!T");
                return "ERR_NO_TARGETS";
            }
            var source = sources.pop();
            creep.memory.mineEnergyTarget = source.id;
            creep.room.createFlag(source, source.id);
            var target = source;
        }
        creep.toSay("$T");
        if(Game.flags[target.id] == undefined){
            creep.room.createFlag(target, target.id);
        }
        var result = creep.harvest(target);
        if(result == ERR_NOT_IN_RANGE){
            creep.toSay(">T");
            creep.repairMoveTo(source);
        }
        return result;
    },
    /* 
     * Offloads energy to nearby can. If no can can be found, builds a can.
     * Also preforms maintenence on can to repair each time it dumps
     * @param {object} creep - creep operating this function
     * RETURN Errorcode
     */
    offloadEnergyToCan: function(creep){
        creep.toSay("OFL-");
        var target = Game.getObjectById(creep.memory.can);
        if(target == null){
            var targetlist = search.findEnergyCans.call(creep);
            if(targetlist == null){                
                this.buildLocalCan(creep);
                return "ERR_NOT_IN_ROOM";
            }
            var can = creep.pos.findClosestByRange(targetlist);
            if(creep.pos.getRangeTo(can) <= 2){
                creep.memory.can = can.id;
                target = can;
            }else{
                var result = this.buildLocalCan(creep);
                return "ERR_NOT_IN_ROOM";
            }
        }
        if(target != null){
            creep.toSay("$T");
            if(target.hits < target.hitsMax){
                creep.repair(target);
            }else{
                if(Game.getObjectById(creep.memory.mineEnergyTarget) != null){
                    creep.harvest(target);
                }
                if(creep.pos.getRangeTo(target) == 0){
                    creep.drop("energy");
                }else{
                    var result = creep.transfer(target, "energy");
                    if(result == ERR_NOT_IN_RANGE){
                        creep.toSay(":->T");
                        creep.repairMoveTo(target);
                    }
                    return result;
                }
            }
        }
        return "ERR_NO_TARGETS";
    },
    /*
     * Can builder function for offload task
     * @call {object} - creep to call this
     * RETURN Errorcode
     */
    buildLocalCan: function(creep){
        creep.memory.builtcan == true;
        creep.toSay("C+")
        var target = Game.getObjectById(creep.memory.canToBuild);
        if(target == null){
            creep.toSay("?CS-");
            var potentialsites = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 2);
            var site = creep.pos.findClosestByRange(potentialsites);
            if(site != null){
                creep.memory.canToBuild = site.id;
                target = site
            }
        }
        if(target == null){
            creep.toSay("!CS");
            var result = creep.pos.createConstructionSite("container");
            return result;
        }
        creep.toSay("#B");
        var result = creep.build(target);
        return result;
    },
    /*
     * Builds up walls and ramparts
     * @call {object} creep - Creep to run task
     * @param {string} targetRoomName - room to fortify
     * RETURN Errorcode
     */
    fortifyTargetRoom: function(creep, targetRoomName){
        creep.toSay("FOR-");
        var targetRoom = Game.rooms[targetRoomName];
        if(creep.room != targetRoom){
            creep.toSay(">R");
            creep.goto(targetRoomName);
            return "ERR_NOT_IN_ROOM";
        }
        var targetPercent = Memory.wallTargetPercentage;
        var target = Game.getObjectById(creep.memory.fortifyTarget);
        if(target != null && target.hits >= (target.hitsMax * targetPercent)){
            target = null;
            delete creep.memory.fortifyTarget;
        }
        if(target == null){
            var targetlist = search.findPriorityWallRepairs.call(creep)
            if(targetlist.length == 0){
                creep.toSay("!T");
                return "ERR_NO_TARGETS";
            }
            target = targetlist.pop()
            if(target != null){
                creep.memory.fortifyTarget = target.id;
            }
        }
        creep.toSay("$T")
        var result = creep.repair(target)
        if(result == ERR_NOT_IN_RANGE){
            creep.toSay(":->T")
            creep.repairMoveTo(target)
        }
        if(result == ERR_NOT_ENOUGH_ENERGY){
            delete creep.memory.fortifyTarget;
        }
        creep.toSay(result)
        return result;
    },
    /*
     * Fills production and defense related structures in the current room
     *      Also fills repair units, builders, and upgraders
     * @call {object} creep - Creep to run task
     * @param {string} targetRoomName - room to fill structures in
     * RETURN Errorcode
     */
    fillTargetRoom: function(creep, targetRoomName){
        creep.toSay("FIL-")
        var targetRoom = Game.rooms[targetRoomName]
        if(creep.room != targetRoom){
            creep.toSay(">R")
            creep.goto(targetRoomName)
            return "ERR_NOT_IN_ROOM"
        }
        var target = Game.getObjectById(creep.memory.fillTarget)
        if(creep.carry["energy"] == 0){
            target = creep.room.storage;
        }
        if(target != null && target.totalEnergy() == target.capacity()){
            target == null;
            delete creep.memory.fillTarget;
        }
        if(target == null){
            var targetlist = search.findPriorityFillTargets.call(creep)
            if(targetlist.length == 0){
                creep.toSay("!T")
                return "ERR_NO_TARGETS"
            }
            target = targetlist.pop()
            creep.memory.fillTarget = target.id;
        }
        creep.toSay("$T")
        var result = creep.transfer(target, "energy")
        if(result == ERR_NOT_IN_RANGE){
            creep.toSay(":->T")
            creep.repairMoveTo(target)
        }
        if(target.structureType == "storage"){
            creep.transfer(target, "power")
        }
        if(result == OK){
            delete creep.memory.fillTarget;
            target = null;
        }
        creep.toSay(" " + result)
        return result;
        
    },
    /*
     * Pulls a sorted list of repair targets and repairs the first on the list
     * @call {object} creep - Creep to run task
     * @param {string} targetRoomName - room to do repairs in
     * RETURN Errorcode
     */
    repairTargetRoom: function(creep, targetRoomName){
        creep.toSay("REP-")
        var targetRoom = Game.rooms[targetRoomName]
        if(creep.room != targetRoom){
            creep.toSay(">R")
            creep.goto(targetRoomName)
            return "ERR_NOT_IN_ROOM"
        }
        var target = Game.getObjectById(creep.memory.repairTarget)
        if(target == null){
            var repairtargets = search.findPriorityRepairs.call(creep)
            if(repairtargets == null){
                creep.toSay("!T")
                return "ERR_NO_TARGETS"
            }
            var target = repairtargets.pop();
        }
        creep.toSay("$T")
        var result = creep.repair(target)
        if(result == ERR_NOT_IN_RANGE){
            creep.toSay(":->T")
            creep.repairMoveTo(target)
        }
        creep.toSay(" " + result)
        return result
    },
    /*
     * Pulls energy stored sorted list of storage structures in the room and
     *      pulls energy from the highest energy target
     * @call {object} creep - Creep to run task
     * @param {string} targetRoomName - room to get energy from
     * RETURN Errorcode
     */
    fetchEnergyFromRoom: function(creep, targetRoomName){
        creep.toSay("FET-");
        var targetRoom = Game.rooms[targetRoomName]
        if(creep.room != targetRoom){
            creep.toSay(">R")
            creep.goto(targetRoomName)
            return "ERR_NOT_IN_ROOM"
        }
        var energysources = search.findPriorityEnergyProviders.call(creep)
        if(energysources == null){
            creep.toSay("!T")
            creep.memory.energyRoomName = creep.pos.findClosestSpawn().room.name;
            return "ERR_NOT_IN_ROOM"
        }
        var target = energysources.pop();
        var result = creep.withdraw(target, "energy");
        creep.toSay("$T")
        if(result == ERR_NOT_IN_RANGE){
            creep.repairMoveTo(target);
            creep.toSay(":->T")
        }
        creep.toSay(" " + result)
        return result;
    },
    /*
     * Pulls priority sorted list of construction sites in the room and works on them
     * @call {object} creep - Creep to run task
     * @return {integer} Error code
     */
    constructInTargetRoom: function(creep, targetRoomName){
        creep.toSay("CON-")
        var targetRoom = Game.rooms[targetRoomName]
        var result
        if(creep.room != targetRoom){
            creep.toSay(">R")
            result = creep.goto(targetRoomName)
            return "ERR_NOT_IN_ROOM"
        }
        var target = Game.getObjectById(creep.memory.toBuild)
        if(!target instanceof ConstructionSite){
            target == null;
            delete creep.memory.toBuild;
        }
        if(target == null){
            var constructiontargets = search.findPriorityConstructionSites.call(creep)
            if(constructiontargets.length == 0){
                creep.toSay("!T")
                return "ERR_NO_TARGETS"
            };
            var target = constructiontargets.pop();
            creep.memory.toBuild = target.id
        }
        creep.toSay("$T")
        var result = creep.build(target)
        if(result == ERR_NOT_IN_RANGE){
            creep.repairMoveTo(target)
            creep.toSay(":->T")
        }
        creep.toSay(" " + result)
        return result;
    },
    /*
     * Finds room controller, and upgrades it if it exists
     * @call {object} creep - Creep to run task
     * @param {string} targetRoomName - room to be upgraded
     * RETURN {integer} Error code
     */
    upgradeRCL: function(creep, targetRoomName){
        creep.toSay("UPG-")
        var targetRoom = Game.rooms[targetRoomName]
        var result
        if(creep.room != targetRoom){
            creep.toSay(">R")
            result = creep.goto(targetRoomName);
            return "ERR_NOT_IN_ROOM"
        }
        if(creep.room.controller) {
            result = creep.upgradeController(creep.room.controller)
            creep.toSay("$T")
            if(result == ERR_NOT_IN_RANGE) {
                creep.repairMoveTo(creep.room.controller);
                creep.toSay(":->T")
            }
            creep.toSay(" " + result)
            return result;
        }
        creep.toSay("!T")
        return "ERR_NO_TARGETS"
    },
    /*
     * Goes to target room and gathers energy to return to base
     * @call {object} creep - Creep to run task
     * @param: {string} targetRoomName - Name of room to gather energy from
     * 
     */
    gatherEnergyInTargetRoom: function(creep, targetRoomName){
        creep.toSay("GAT-")
        var targetRoom = Game.rooms[targetRoomName]
        if(creep.room != targetRoom){
            creep.toSay(">R")
            creep.goto(targetRoomName);
            return "ERR_NOT_IN_ROOM"
        }
        var can = Game.getObjectById(creep.memory.potentialEnergySource)
        if(!can == null && can.room.name != targetRoom){
            delete creep.memory.potentialEnergySource;
            can = null;
        }
        if(can == null || can.totalEnergy() == 0){delete creep.memory.potentialEnergySource}
        if(creep.memory.potentialEnergySource == null){
            var sourcelist = search.findPriorityEnergySources.call(creep)

            var source = sourcelist.pop()
            if(source != null){
                creep.memory.potentialEnergySource = source.id
            }
        }
        if(creep.memory.potentialEnergySource != null){
            var can = Game.getObjectById(creep.memory.potentialEnergySource)
            var result = creep.pull(can, "energy")
            creep.toSay("$T")
            if(result == ERR_NOT_IN_RANGE){
                creep.repairMoveTo(can)
                creep.toSay(":->T")
            }
            creep.toSay(" " + result)
            return result;
        }
        creep.toSay("!T")
        return "ERR_NO_TARGETS"
    },
    /*
     * Returns energy to base, internally prioritizing production structures
     * @call {object} creep - Creep to run task
     * @param {string} baseRoomName - Name of room base is located in
     * RETURN Error Code
     */
    returnEnergyToBase: function(creep, baseRoomName){
        creep.toSay("RET-")
        if(creep.memory.returnRoomName == null){
            creep.memory.returnRoomName = baseRoomName;
        }
        var targetRoom = Game.rooms[baseRoomName]
        if(creep.room != targetRoom){
            creep.toSay(">R")
            creep.goto(baseRoomName);
            return "ERR_NOT_IN_ROOM"
        }
        var returnTo = Game.getObjectById(creep.memory.returnTo)
        if(returnTo == null){
            creep.toSay("!T")
            var targetlist = search.findPriorityEnergyStorage.call(creep);
            var target = targetlist.pop()
            if(target != null){
                creep.memory.returnTo = target.id
            }
        }
        returnTo = Game.getObjectById(creep.memory.returnTo)
        if(returnTo != null){
            creep.toSay("$T")
            var result = creep.transfer(returnTo, RESOURCE_ENERGY)
            if(result == ERR_NOT_IN_RANGE){
                creep.toSay(":->T")
                creep.repairMoveTo(returnTo)
                return result;
            }
            if(result == ERR_FULL){
                creep.toSay(":FULL")
                delete creep.memory.returnTo;
            }
            creep.toSay(" " + result)
            return result;
        }
        creep.toSay("!T")
        return "ERR_NO_TARGETS"
    },
    /*
     * Finds room controller and reserves it if it exists
     * @call {object} creep - Creep to run task
     * @param {string} reserveRoomName - room to be upgraded
     * RETURN {integer} Error code
     */
    reserveTargetRoom: function(creep, reserveRoomName){
        creep.toSay("RSV-")
        var targetRoom = Game.rooms[creep.memory.reserveRoomName];
        if(creep.room != targetRoom){
            creep.toSay(">R")
            creep.goto(reserveRoomName);
            return "ERR_NOT_IN_ROOM"
        }
        var target = creep.room.controller
        if(target != null){
            creep.toSay("$T")
            var result = creep.reserveController(target);
            if(result == ERR_NOT_IN_RANGE){
                creep.toSay(":->T")
                creep.repairMoveTo(target)
            }
            creep.toSay(" " + result)
            return result;
        }
        creep.toSay("!T")
        return result;
    },
    /*
     * Finds room controller and claims it if it exists
     * @param {Creep} creep - Creep to run task
     * @param {string} claimRoomName - room to be upgraded
     * RETURN {integer} Error code
     */
    claimTargetRoom: function(creep, claimRoomName){
        creep.toSay("RSV-")
        var targetRoom = Game.rooms[creep.memory.claimRoomName];
        if(creep.room != targetRoom){
            creep.toSay(">R")
            creep.goto(claimRoomName);
            return "ERR_NOT_IN_ROOM"
        }
        var target = creep.room.controller
        if(target != null){
            creep.toSay("$T")
            var result = creep.claimController(target);
            if(result == ERR_NOT_IN_RANGE){
                creep.toSay(":->T")
                creep.moveTo(target)
            }
            if(result == ERR_NOT_IN_RANGE){
                creep.moveTo(target);
            }
            creep.toSay(" " + result)
            return result;
        }
        creep.toSay("!T")
        return result;
    }
    /*
     */
}
module.exports = tasks;