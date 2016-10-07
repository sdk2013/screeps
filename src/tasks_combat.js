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
            default:
                var result = "ERR_NO_TARGETS"
        }
        return result;
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
                return this.gotoTaskFlag.call(creep);
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
    gotoTaskFlag: function(){
        var creep = this.creep;
        var targets = search.findPriorityTaskFlags(creep)
        if(targets == null){
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