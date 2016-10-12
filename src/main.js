/*
1.1.0 Changelog

Tasks and search modules implemented
Allowed all creeps to sing (Sing module implemented)

TODO: Develop/Finalize Overlord AI


*/
var command = require('command')
var produce = require('produce')
var defend = require('defend')
var spawner = require('spawner')
var statWrapper = require('stat_wrapper')
var output = require("output")
global._ = require('lodash')
global.utilities = require('utilities')
global.Empire = require('Empire')

module.exports.loop = function () {
    Memory.stats = {};
    statWrapper(initialize, "", "initialize");
    statWrapper(command, Game.creeps, "command");
    statWrapper(produce, Game.spawns, "produce");
    statWrapper(defend, Game.structures, "defend");
    Memory.songLine++;
    //CHUMP BLOCKERS
    chumpCheck();


    //GARBAGE COLLECTION
    try{
        for(var i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
        if(Memory.objects){
            for(var id in Memory.objects){
                if(Game.getObjectById(id) == null){
                    delete Memory.objects[id];
                }
            }
        }
    }catch(e){
        output.log("main", 4, "Garbage Collection Failure: ", e);
    }
    var stats = require("collect_stats");
    stats.run();
    Memory.stats.cpu.used = Game.cpu.getUsed();
}
function chumpCheck(){
    if(Memory.chumpCount == null){
        return;
    }
    Empire.buildChump(Memory.chumpTargetRoom);
    Memory.chumpCount--;
    if(Memory.chumpCount < 1){
        delete Memory.chumpCount;
    }
    return;
}

function initialize(){
    Creep.prototype.hasPart = function(type){
        for(let i = this.body.length; i-- > 0;){
            if(this.body[i].hits > 0){
                if(this.body[i].type == type){
                    return true;
                }
            }else{
                break;
            }
        }
        return false;
    }
    Creep.prototype.repairMoveTo = function(target){
        if(!this.hasPart(WORK)){
            this.moveTo(target);
        }
        var road = _(this.pos.lookFor(LOOK_STRUCTURES))
                    .filter(s => s.structureType == "road")
                    .first()
        if(road != null){
            if(this.totalEnergy() > 0){
                this.repair(road);
            }
        }
        this.moveTo(target)
    }
    Creep.prototype.goto = function(targetRoomName, arguments){
        var targetPos = new RoomPosition(25, 25, targetRoomName)
        this.repairMoveTo(targetPos, arguments);
    }

    
    // remove lodash and function call overhead from original
    // also short cicuit past dead parts
    Creep.prototype.getActiveBodyparts = function(type) {
    let count = 0;
    for (let i = this.body.length; i-- > 0;) {
      if (this.body[i].hits > 0) {
        if (this.body[i].type === type) {
          count++;
        }
      } else {
        break;
      }
    }
    return count;
    };
    Creep.prototype.pull = function(target, resource = RESOURCE_ENERGY){
        var creep = this
        if(target instanceof Structure){
            var result = creep.withdraw(target, resource)
        }else if(target instanceof Creep){
            var result = target.transfer(creep, resource)
        }else if(target instanceof Resource){
            var result = creep.pickup(target);
        }else if(target instanceof Source){
            var result = creep.harvest(target);
        }
        if(result == -7){
            output.log("command", 3, creep.name + " pull failed. Target: " + target.id + "  Resource: " + resource);
        }
        return result;
    }
    RoomObject.prototype.capacity = function(){
        var s = this;
        if(s instanceof StructureTower || s instanceof StructureExtension || 
            s instanceof StructureLab || s instanceof StructureLink || 
            s instanceof StructureNuker || s instanceof StructurePowerSpawn ||
            s instanceof StructureSpawn){
            return s.energyCapacity
        }
        if(s instanceof StructureStorage || s instanceof StructureContainer ||
            s instanceof StructureTerminal){
            return s.storeCapacity
        }
        if(s instanceof Creep){
            return s.carryCapacity
        }
        return null;
    }
    RoomObject.prototype.totalEnergy = function(){
        var s = this;
        if(s instanceof StructureTower || s instanceof StructureExtension || 
            s instanceof StructureLab || s instanceof StructureLink || 
            s instanceof StructureNuker || s instanceof StructurePowerSpawn ||
            s instanceof StructureSpawn){
            return s.energy
        }
        if(s instanceof StructureStorage || s instanceof StructureContainer ||
            s instanceof StructureTerminal){
            return s.store["energy"]
        }
        if(s instanceof Creep){
            return s.carry["energy"]
        }
        if(s instanceof Resource){
            return s.amount;
        }
        return null;
    }
    Creep.prototype.toSay = function(thingToSay){
        var creep = this
        creep.memory.toSay = creep.memory.toSay + thingToSay
    }
    Creep.prototype.total = function(){
        var creep = this;
        var total = _.sum(creep.carry);
        return total;
    }
    RoomPosition.prototype.findClosestSpawn = function() {
        var result = PathFinder.search(this, _.map(Game.spawns, s => ({pos: s.pos, range: 0})), {maxOps: 8000});
        if(result && result.path) {
            var path = result.path;
            var steps = path.length;
            var target = path[path.length-1];
            return _.find(Game.spawns, 'pos', _.create(RoomPosition.prototype, target));
        } else {
            output.log("command", 3, "FindClosestSpawn failed to find closest spawn. Data: " + this.room.name + this);
            return _.sample(Game.spawns);
        }
    }
}
/*KNOWN BUGS:

Spawning a creep using priority queue deletes memory
*/