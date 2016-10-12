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
        };
    },
    dumpSpawnQueue: function(spawnName){
        Game.spawns[spawnName].memory.Queue = []
    },
    buildDecoy: function(targetflag, origin = -1){
        if(Memory.spawnQueue == undefined){
            Memory.spawnQueue = [];
        }
        var u = {};
        u.body = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK]
        u.memoryObject = {role:"basic",flag:targetflag, task:"goto"};
        u.targetRoomName = origin;

        Memory.spawnQueue.unshift(u)
    },
    buildDismantler: function(targetflag, origin = -1, targetArray){
        if(Memory.spawnQueue == undefined){
            Memory.spawnQueue = [];
        }
        var u = {};
        u.body = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK]
        u.memoryObject = {role:"basic",flag:targetflag, targetList: targetArray, combatTask: "dumbDismantle", task:"goto"};
        u.targetRoomName = origin;

        Memory.spawnQueue.unshift(u)
    },
    buildBigHealer: function(targetflag, origin = -1){
        if(Memory.spawnQueue == undefined){
            Memory.spawnQueue = [];
        }
        var u = {};
        u.body = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]
        u.memoryObject = {role:"basic",flag:targetflag, combatTask: "basicHeal", task:"goto"};
        u.targetRoomName = origin;

        Memory.spawnQueue.unshift(u)
    },
    buildSmallHealer: function(targetflag, origin = -1){
        if(Memory.spawnQueue == undefined){
            Memory.spawnQueue = [];
        }
        var u = {};
        u.body = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]
        u.memoryObject = {role:"basic",flag:targetflag, combatTask: "basicHeal", task:"goto"};
        u.targetRoomName = origin;

        Memory.spawnQueue.unshift(u)
    },
    debug: function(){
        if(Memory.debugMode == true){
            Memory.debugMode = false;
            return "Debug Mode Disabled";
        }else{
            Memory.debugMode = true;
            return "Debug Mode Enabled";
        }
    },
    /*
     *  Builds a little guy to burn tower energy
     *  @param {String} targetRoomName
     */
    buildChump: function(targetRoomName){
        var u = {};
        u.body = [MOVE]
        u.memoryObject = {role:"basic", reusePath: 50, gotoRoomName: targetRoomName, task:"goto"};
        u.targetRoomName = -1;

        Memory.spawnQueue.unshift(u) 
    },
    queueChumps: function(number, room){
        Memory.chumpTargetRoom = room;
        Memory.chumpCount = number;
        return "For the swarm.";
    }
};