/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('Empire');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    buildCreep: function(unitType, memoryObject, roomName){
        if(memoryObject == null){
            memoryObject = {role: unitType}
        }
        if(roomName == null){
            roomName = -1
        }
        var spawner = require('spawner')
        try {  
            spawner.addToQueue(unitType, memoryObject, roomName, false)
            return unitType + " added to queue."
        } catch(e) { 
            console.log("Buildcreep requires: unitType, scaling, [memoryObject], [targetRoomId], priority")
        };
    },
    dumpSpawnQueue: function(spawnName){
        Game.spawns[spawnName].memory.Queue = []
    },
    buildDecoy: function(targetflag, origin = -1){
        var u = {};
        u.body = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK]
        u.memoryObject = {role:"basic",flag:targetflag, task:"goto"};
        u.targetRoomName = origin;

        Memory.spawnQueue.unshift(u)
    },
    buildDisassembler: function(targetflag, origin = -1, targetArray){
        var u = {};
        u.body = [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK]
        u.memoryObject = {role:"basic",flag:targetflag, targetList: targetArray, combatTask: "dismantle", task:"goto"};
        u.targetRoomName = origin;

        Memory.spawnQueue.unshift(u)
    },
    buildBigHealer: function(targetflag, origin = -1){
        var u = {};
        u.body = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]
        u.memoryObject = {role:"basic",flag:targetflag, combatTask: "basicHeal", task:"goto"};
        u.targetRoomName = origin;

        Memory.spawnQueue.unshift(u)
    },
    buildSmallHealer: function(targetflag, origin = -1){
        var u = {};
        u.body = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]
        u.memoryObject = {role:"basic",flag:targetflag, combatTask: "basicHeal", task:"goto"};
        u.targetRoomName = origin;

        Memory.spawnQueue.unshift(u)
    }
};