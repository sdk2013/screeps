/*
1.1.0 Changelog

Tasks and search modules implemented
Allowed all creeps to sing (Sing module implemented)

TODO: Develop/Finalize Overlord AI


*/
var command = require('command');
var produce = require('produce');
var defend = require('defend');
var spawner = require('spawner');
var statWrapper = require('stat_wrapper');
var output = require("output");
global._ = require('lodash');
global.utilities = require('utilities');
global.Empire = require('Empire');
var badRooms = ["E6N29"];

module.exports.loop = function () {
    Memory.stats = {};
    statWrapper(initialize, "", "initialize");
    statWrapper(command, Game.creeps, "command");
    statWrapper(produce, Game.spawns, "produce");
    statWrapper(defend, Game.structures, "defend");
    Memory.songLine++;
    //CHUMP BLOCKERS
    chumpCheck();

    if(Game.time % 777 === 0){
        gc();
    }
    
    var stats = require("collect_stats");
    stats.run();
    Memory.stats.cpu.used = Game.cpu.getUsed();
};
function gc(){
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
}
function chumpCheck(){
    if(Memory.chumpCount == null || Game.time % 15 !== 0){
        return;
    }
    Empire.buildChump(Memory.chumpWaypoints);
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
    };
    Creep.prototype.repairMoveTo = function(target, args){
        if(!this.hasPart(WORK)){
            this.moveTo(target);
        }
        var road = _(this.pos.lookFor(LOOK_STRUCTURES))
                    .filter(s => s.structureType == "road")
                    .first();
        if(road != null){
            if(this.totalEnergy() > 0){
                this.repair(road);
            }
        }
        var path = 5;
        if(this.memory.reusePath != null){
            path = this.memory.reusePath;
        }
        var ignore = false;
        if(this.memory.ignoreCreeps != null){
            var ignoreCreeps = this.memory.ignoreCreeps;
        }
        if(badRooms.includes(this.room.name)){
            ignore = true;
        }
        if(this.memory.reusePath != null){
            this.moveTo(target, {reusePath: path, ignoreCreeps: ignore});
            return;
        }
        this.moveTo(target, args);
        return;
    };
    Creep.prototype.goto = function(targetName, args){
        var targetPos;
        if(targetName instanceof Flag){
            targetPos = targetName;
        }else if(Game.flags[targetName] != null){
            targetPos = Game.flags[targetName];
        }else{
            targetPos = new RoomPosition(25, 25, targetName);
        }
        this.repairMoveTo(targetPos, args);
    };

    
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
        var creep = this;
        var result;
        if(target instanceof Structure){
            result = creep.withdraw(target, resource);
        }else if(target instanceof Creep){
            result = target.transfer(creep, resource);
        }else if(target instanceof Resource){
            result = creep.pickup(target);
        }else if(target instanceof Source){
            result = creep.harvest(target);
        }
        if(result == -7){
            output.log("command", 3, creep.name + " pull failed. Target: " + target.id + "  Resource: " + resource);
        }
        return result;
    };
    RoomObject.prototype.capacity = function(){
        var s = this;
        if(s instanceof StructureTower || s instanceof StructureExtension || 
            s instanceof StructureLab || s instanceof StructureLink || 
            s instanceof StructureNuker || s instanceof StructurePowerSpawn ||
            s instanceof StructureSpawn){
            return s.energyCapacity;
        }
        if(s instanceof StructureStorage || s instanceof StructureContainer ||
            s instanceof StructureTerminal){
            return s.storeCapacity;
        }
        if(s instanceof Creep){
            return s.carryCapacity;
        }
        return null;
    };
    RoomObject.prototype.totalEnergy = function(){
        var s = this;
        if(s instanceof StructureTower || s instanceof StructureExtension || 
            s instanceof StructureLab || s instanceof StructureLink || 
            s instanceof StructureNuker || s instanceof StructurePowerSpawn ||
            s instanceof StructureSpawn){
            return s.energy;
        }
        if(s instanceof StructureStorage || s instanceof StructureContainer ||
            s instanceof StructureTerminal){
            return s.store["energy"];
        }
        if(s instanceof Creep){
            return s.carry["energy"];
        }
        if(s instanceof Resource){
            return s.amount;
        }
        return null;
    };
    Creep.prototype.toSay = function(thingToSay){
        var creep = this;
        creep.memory.toSay = creep.memory.toSay + thingToSay;
    };
    Creep.prototype.total = function(){
        var creep = this;
        var total = _.sum(creep.carry);
        return total;
    };
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
    };
    /*
     *  Now switching to Object.defineProperty() because I need seperate getters and setters
     */
    Object.defineProperty(RoomObject.prototype, "memory", {
        get: function(){
            if(Memory.objects == null){
                Memory.objects = {};
                return undefined;
            }
            return Memory.objects[this.id];
        },
        set: function(m){
            if(Memory.objects == null){
                Memory.objects = {};
            }
            if(Memory.objects[this.id] == null){
                Memory.objects[this.id] = {};
            }
            return (Memory.objects[this.id] = m);
        },
        configurable: true,
        enumerable: false
    });
    Object.defineProperties(StructureLink.prototype, {
        "canSend": {
            get: function(){
                if(!!Memory.objects && !!Memory.objects[this.id]){
                    var send = Memory.objects[this.id].canSend;
                    if(send === undefined){
                        return false;
                    }
                    return send;
                }
                return false;
                
            },
            set: function(mode){
                if(!Memory.objects){
                    Memory.objects = {};
                }
                if(!Memory.objects[this.id]){
                    Memory.objects[this.id] = {};
                }
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
                if(!!Memory.objects && !!Memory.objects[this.id]){
                    var recieve = Memory.objects[this.id].canRecieve;
                    if(recieve === undefined){
                        return false;
                    }
                    return recieve;
                }
                return false;
                
            },
            set: function(mode){
                if(!Memory.objects){
                    Memory.objects = {};
                }
                if(!Memory.objects[this.id]){
                    Memory.objects[this.id] = {};
                }
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
    Object.defineProperties(Structure.prototype, {
        "projectedHits": {
            get: function(){
                if(!!Memory.objects && !!Memory.objects[this.id]){
                    var hits = Memory.objects[this.id].projectedHits;
                    return hits;
                }
                return undefined;
                
            },
            set: function(hits){
                if(!Memory.objects){
                    Memory.objects = {};
                }
                if(!Memory.objects[this.id]){
                    Memory.objects[this.id] = {};
                }
                if(_.isNumber(hits)){
                    Memory.objects[this.id].projectedHits = hits;
                }else{
                    throw new Exception("projectedHits must be a number");
                }
            },
            configurable: true,
            enumerable: true
        },
        "projectedEnergy": {
            get: function(){
                if(!!Memory.objects && !!Memory.objects[this.id]){
                    var energy = Memory.objects[this.id].projectedEnergy;
                    return energy;
                }
                return undefined;
                
            },
            set: function(energy){
                if(!Memory.objects){
                    Memory.objects = {};
                }
                if(!Memory.objects[this.id]){
                    Memory.objects[this.id] = {};
                }
                if(_.isNumber(energy)){
                    Memory.objects[this.id].projectedEnergy = energy;
                }else{
                    throw new Exception("projectedEnergy must be a number");
                }
            },
            configurable: true,
            enumerable: true
        }
    });

}