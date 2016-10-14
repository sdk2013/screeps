/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('tasks_combat');
 * mod.thing == 'a thing'; // true
 */
var search = require("search")
var combat = require("combat")
var tasks_combat = {
    runTasks: function(creep){
        creep.toSay("CBT-");
        switch(creep.memory.combatTask){
            /* 
             * Single Room uncoordinated defense, single creep
             * Defaults to current room
             */
            case "watch":
                var watchRoomName = creep.memory.watchRoomName;
                if(watchRoomName == null){watchRoomName = creep.room.name};
                var result = this.watchTargetRoom(creep, watchRoomName);
                break;
            case "dismantle":
                var dismantleRoomName = creep.memory.dismantleRoomName;
                if(dismantleRoomName == null){return "ERR_NO_TARGETS"};
                var result = this.dismantleTargetRoom(creep, dismantleRoomName)
                break;
            case "massWallDismantle":
                var mWDRoomName = creep.memory.mWDRoomName;
                if(mWDRoomName == null){mWDRoomName = creep.room.name};
                var result = this.massWallDismantle(creep, mWDRoomName)
                break;
            case "proximityAttack":
                var pos = Game.flags[creep.memory.flag].pos || creep.pos;
                var result = this.proximityAttack(creep, pos);
                break;
            case "dumbDismantle":
                var result = this.dumbDismantleTargetObject(creep);
                break;
            case "attackFlag":
                var result = this.attackFlag(creep);
                break;
            case "basicHeal":
                var result = this.basicHeal(creep);
                break;
            case "attackController":
                var result = this.attackController(creep);
                break;
            default:
                var result = "ERR_NO_TARGETS"
        }
        return result;
    },
    /*
     *  Goes to flag an attacks any hostiles within a certain radius around it
     *  Radius can be set in memory, defaults to 6;
     */
    proximityAttack: function(creep, pos){
        if(creep.hits < creep.hitsMax){
            creep.heal(creep);
        }
        var range = creep.memory.radius || 6;
        var targets = pos.findInRange(FIND_HOSTILE_CREEPS, range);
        if(targets.length = 0){
            targets = _(pos.findInRange(FIND_HOSTILE_STRUCTURES, range))
                        .filter(s => s.structureType != "storage"
                                && s.structureType != "terminal")
                        .value();

        }
        if(targets.length == 0){
            creep.moveTo(pos)
            return;
        }
        combat.fireEverything.call(creep, target[0]);
        return;
    },
    /*
     *  Dismantles all the walls in a given room
     *  @param {Creep} creep - dismantler
     *  @param {String} roomName - where to dismantle
     */
    massWallDismantle: function(creep, roomName){
        creep.toSay("MS WL DIS-");
        var targets = _(creep.room.find(FIND_STRUCTURES))
                        .filter(s=> s.structureType == STRUCTURE_WALL)
                        .filter(s=> s.hits < 5750000)
                        .value()
        var target = creep.pos.findClosestByRange(targets);
        var result = creep.dismantle(target);
        creep.moveTo(target);
        return result;
    },
    /*
     *  Attacks a room controller
     *  @param {Creep} creep
     */
    attackController: function(creep){
        creep.toSay("ATK CTL-")
        var targetRoomName = creep.memory.attackControllerRoomName;
        if(targetRoomName == null){
            creep.toSay("!R");
            return "ERR_NO_TARGETS";
        }
        if(creep.room != Game.rooms[targetRoomName]){
            creep.toSay(">R");
            creep.goto(Game.rooms[targetRoomName]);
            return "ERR_NOT_IN_ROOM";
        }
        var target = creep.room.controller;
        if(creep.room.controller == null){
            creep.toSay("!T");
            return "ERR_NO_TARGETS";
        }
        var result = creep.attackController(target);
        if(result == ERR_NOT_IN_RANGE){
            creep.toSay(">T");
            creep.moveTo(target);
            return result;
        }

    },
    /*
     *  Dismantles targets in array stored in memory
     *  @param {Creep} creep
     */
    dumbDismantleTargetObject: function(creep){
        creep.toSay("DDI-");
        if(creep.memory.flag){
            if(creep.room != Game.flags[creep.memory.flag]){
                creep.goto(Game.flags[creep.memory.flag]);
            }
        }
        for(var i = 0; i < creep.memory.targetList.length; i++){
            var target = Game.getObjectById(creep.memory.targetList[i]);
            if(target != null){
                break;
            }
        }
        if(target == null){
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: (s => s.structureType != "controller" && s.structureType != "storage")}); 
        }
        creep.moveTo(target);
        creep.dismantle(target);
        return OK;
    },
    /*
     *  Goes to flag heals what it can reach
     *  @param {Creep} creep
     */
    dumbHeal: function(creep){
        creep.toSay("DHE-")
        //Room maneuvering block
        if(creep.memory.healFlag){
            var flag = Game.flags[creep.memory.healFlag];
            if(flag.room != creep.room){
                creep.moveTo(flag);
                return "ERR_NOT_IN_ROOM"
            }
        }else if(creep.memory.healRoomName){
            if(creep.room != Game.rooms[creep.memory.healRoomName]){
                creep.goto(creep.memory.healRoomName);
                return "ERR_NOT_IN_ROOM"
            }
        }
        var result;
        if(creep.hits < creep.hitsMax){
            creep.toSay("$S")
            result = creep.heal(creep);
        }else{
            var healtarget = _(creep.room.find(FIND_MY_CREEPS))
                                .filter(s => s.hits < s.hitsMax)
                                .sortBy(s => s.hits / s.hitsMax)
                                .last();
            if(healtarget != null){
                creep.toSay("$T")
                if(creep.pos.getRangeTo(healtarget) > 1){
                    result = creep.rangedHeal(healtarget);
                }else{
                    result = creep.heal(healtarget);
                }
            }
        }
        if(healtarget == null || creep.memory.healFlag){
            creep.toSay("$F")
            creep.moveTo(Game.flags[creep.memory.healFlag]);
        }
        return result;
    },
    /*
     *  Goes to flag/room and maneuvers to heal friendlies
     *  @param {Creep} creep
     */
    basicHeal: function(creep){
        creep.toSay("BHE-")
        //Room maneuvering block
        if(creep.memory.healFlag){
            var flag = Game.flags[creep.memory.healFlag];
            if(flag != null && flag.room != creep.room){
                creep.moveTo(flag);
                return "ERR_NOT_IN_ROOM"
            }
        }else if(creep.memory.healRoomName){
            if(creep.room != Game.rooms[creep.memory.healRoomName]){
                creep.goto(creep.memory.healRoomName);
                return "ERR_NOT_IN_ROOM"
            }
        }
        var result;
        if(creep.hits < creep.hitsMax){
            creep.toSay("$S")
            result = creep.heal(creep);
        }else{
            var healtarget = _(creep.room.find(FIND_MY_CREEPS))
                                .filter(s => s.hits < s.hitsMax)
                                .sortBy(s => s.hits / s.hitsMax)
                                .last();
            if(healtarget != null){
                creep.toSay("$T")
                if(creep.pos.getRangeTo(healtarget) > 1){
                    creep.moveTo(healtarget);
                    result = creep.rangedHeal(healtarget);
                }else{
                    result = creep.heal(healtarget);
                }
            }
        }
        if(healtarget == null && creep.memory.healFlag){
            creep.toSay("$F")
            creep.moveTo(Game.flags[creep.memory.healFlag]);
        }
        return result;
    },
    /*
     *  Attempts to dismante hostile towers and spawns
     *      Dismantles walls to get to them
     *  @param {Creep} creep - creep running the command
     *  @param {string} targetRoomName - room in which to dismantle
     */
    dismantleTargetRoom: function(creep, targetRoomName){
        creep.toSay("DIS-");
        var targetRoom = Game.rooms[targetRoomName];
        if(creep.room != targetRoom && targetRoom != null){
            creep.toSay(">R")
            return creep.goto(targetRoomName);
        }
        if(creep.memory.dismantleTargetId == null){
            var targets = search.findPriorityDismantleList.call(creep);
            if(targets.length > 0){
                creep.memory.dismantleTargetId = targets.pop().id;
            }else{
                return "ERR_NO_TARGETS"
            }
        }
        var target = Game.getObjectById(creep.memory.dismantleTargetId)
        var moveresult = creep.moveTo(target)
        var result = creep.dismantle(target)
        if(result == ERR_NOT_IN_RANGE && moveresult == ERR_NO_PATH){
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, 
                            {filter: {structureType: STRUCTURE_WALL}});
            creep.dismantle(target);
        }
    },
    /*
     * Moves roughly to the center of the room and protects it against invaders
     * Returns to marked flag or center if possible
     * @param {string} targetRoomName - room in which to stand watch
     * RETURN Errorcode
     */
    watchTargetRoom: function(creep, targetRoomName){
        creep.toSay("WAT-")
        var target = Game.getObjectById(creep.memory.watchTarget)
        if(creep.hits < creep.hitsMax) creep.heal(creep);
        if(target == null || target.room != creep.room){
            delete creep.memory.watchTarget;
            var targetRoom = Game.rooms[targetRoomName];
            if(targetRoom != creep.room){
                creep.toSay(">R")
                creep.goto(targetRoomName)
                return "ERR_NOT_IN_ROOM"
            }
            var hostiles = combat.IFFSafeTargetList.call(creep);
            if(hostiles.length == 0){
                return this.gotoTaskFlag(creep);
            }
            target = creep.pos.findClosestByPath(hostiles)
            creep.memory.watchTarget = target.id
        }
        if(target == null){
            creep.toSay("!T")
            return "ERR_NO_TARGETS"
        }
        if(target.owner == "Dissi"){return;}
        combat.fireEverything.call(creep, target);
        return creep.moveTo(target);        
    },
    /*
     * Moves to flag and attacks hostiles in room
     * @param {string} targetRoomName - room in which to stand watch
     * RETURN Errorcode
     */
    attackFlag: function(creep){
        creep.toSay("AT FL-")
        var target = Game.getObjectById(creep.memory.watchTarget)
        creep.moveTo(Game.flags[creep.memory.flag])
        var target = creep.pos.findClosestByRange(combat.IFFSafeTargetList.call(creep));
        if(creep.hits < creep.hitsMax) creep.heal(creep);
        combat.fireEverything.call(creep, target);        
    },
    /*
     * Command creep to go to nearest untaken flag for its role
     * Defaults to center of a room
     */
    gotoTaskFlag: function(creep){
        var targets = search.findPriorityTaskFlags.call(creep) //TODO: FIX search.findPriorityTaskFlags(creep)
        if(targets.length == 0){
            creep.toSay("$D")
            var target = new RoomPosition(25, 25, creep.room.name)
        }else{
            creep.toSay("$F")
            var target = targets.pop();
        }
        if(target == null){
            creep.toSay("!F")
            return "ERR_NO_TARGETS"
        }
        if(creep.pos != target.pos){
            creep.toSay(">")
            var result = creep.moveTo(target)
            return result
        }else{
            creep.toSay("-OK")
            return OK;
        }
    }
}
module.exports = tasks_combat