/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('produce');
 * mod.thing == 'a thing'; // true
 */
var utilities = require('utilities');
var spawner = require('spawner');
var output = require("output");
module.exports = function(spawns){
    try{
        spawner.assignToSpawner(spawns);
        
        for(var name in spawns){
            var spawn = Game.spawns[name];
            output.log("produce", 7, spawn.room.name + " : " + spawn.name + " Running production cycle.");
            if(spawn.spawning){
                continue;
            }
            if(spawn.memory.Queue==undefined || spawn.memory.Queue[0]==null){
                continue;
            }
            var nextCreepInQueue = utilities.peek(spawn.memory.Queue);
            var nextRole = nextCreepInQueue.unitType;
            var body = nextCreepInQueue.body;
            if(nextRole == null && body == null){spawn.memory.Queue.pop(); continue;};
            var extensionCount = utilities.roomExtCount(spawn);
            output.log("produce", 7, spawn.name + JSON.stringify(nextCreepInQueue));
            if(nextCreepInQueue.body == null){
                var creepParts = utilities.assembleCreep(nextRole, extensionCount);
                var name = "Basic"
            }else{
                var creepParts = nextCreepInQueue.body;
                var name = nextRole;
            }
            var result = spawn.canCreateCreep(creepParts)
            if(result == OK){
                output.log("produce", 5, spawn.name + " is building "+nextRole);
                spawn.createCreep(creepParts, utilities.uid() + " - " + name, nextCreepInQueue.memoryObject);
                spawn.memory.Queue.pop();
            }else if(result == ERR_NOT_ENOUGH_ENERGY){
                output.log("produce", 5, spawn.name + " cannot build " + nextRole + "!  Insufficient funds. " + spawn.room.energyAvailable + "/" + spawn.room.energyCapacityAvailable + ". Cost: " + utilities.creepCost(creepParts));
                output.log("produce", 7, JSON.stringify(nextCreepInQueue));
            }else{
                console.log("produce", 3, "Error: " + result + "   Output: " +creepParts + "   Args: " + nextRole + ", "+nextScaling)
                //console.log(spawn.name+" cannot build " + nextRole + " : Funds availible: "+ spawn.energyAvailable+"/"+ spawn.energyCapacityAvailable + "   Unit Cost: "+ utilities.creepCost(creepParts));
                
            }
        }
    }catch(e){
        console.log("Production Error: " + e + " : " + e.stack)
    }
};