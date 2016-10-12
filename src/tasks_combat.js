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
            case "dumbDismantle":
                var result = this.dumbDismantleTargetObject(creep);
                break;
            case "basicHeal":
                var result = this.basicHeal(creep);
                break;
            default:
                var result = "ERR_NO_TARGETS"
        }
        return result;
    },
    dumbDismantleTargetObject: function(creep){
        creep.toSay("DDI-");
        for(var i = 0; i < creep.memory.targetList.length; i++){
            var target = Game.getObjectById(creep.memory.targetList[i]);
            if(target != null){
                break;
            }
        }
        if(target == null){
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES); 
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
        combat.fireEverything.call(creep, target);
        return creep.moveTo(target);        
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