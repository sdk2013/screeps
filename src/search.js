/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('search');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    /* 
     * Finds least opccupiedflag named after creep task
     * @call {Creep} 
     */
    findPriorityTaskFlags: function(){
        var creep = this;
        var flagType;
        if(creep.memory.task != "combat"){
            flagType = creep.memory.task;
        }else{
            flagType = creep.memory.combatTask;
        }
        var flags = _(creep.room.find(FIND_FLAGS))
                    .filter(f => f.name.startsWith(flagType) )
                    .sortBy(f => f.pos.findInRange(FIND_MY_CREEPS).length)
                    .value();
        return flags;
    },
    /*
     *  This finds all potential energy sources for miners in a room, sorts them into a priority queue, and returns the array
     * Main call object: tasks.mineTargetenergy;
     * @call {object} creep - creep to be calling this ! MUST USE .call()
     * RETURN {collection} sourcelist - list of crurrently untaken sources, sorted by range
     */
    findPriorityEnergyNodes: function(){
        var creep = this;
        var sourceList = _(creep.room.find(FIND_SOURCES))
                            .filter(s => s.pos.findInRange(FIND_MY_CREEPS, 1).length ==0)
                            .sortBy(s => -this.pos.getRangeTo(s.pos) )
                            .value()
        return sourceList
    },
    /*
     *  This pulls cans in a room for miners
     * @param {object} creep - creep to be calling this ! MUST USE .call()
     */
    findEnergyCans: function(){
        var creep = this;
        var targets = _(creep.room.find(FIND_STRUCTURES))
                        .filter(s => s.structureType == "container")
                        .value()
        return targets;
    },
    /*
     *  This finds all construction sites in a room, sorts them into a priority queue, and returns the array
     * @param {object} creep - creep to be calling this ! MUST USE .call()
     */
    findPriorityConstructionSites: function(){
        var creep = this;
        var RCL = creep.room.controller.level;
        var targets = _.sortBy((creep.room.find(FIND_CONSTRUCTION_SITES)), 
            function(s){
                if(RCL < 4){
                    switch(s.structureType){
                        case "spawn":
                            return 100;
                        case "tower":
                            return 70;
                        case "extension":
                            return 70;
                        case "road":
                            return 60;
                        case "wall":
                        case "rampart":
                            return 30;
                        case "road":
                            return -(creep.pos.getRangeTo(s));
                        default:
                            return 50;
                    }
                }else{
                    switch(s.structureType){
                        case "extension":
                            return 100;
                        case "spawn":
                            return 70;
                        case "link":
                            return 80;
                        case "tower":
                            return 70;
                        case "storage":
                            return 60;
                        case "wall":
                        case "rampart":
                            return 50;
                        case "terminal":
                            return 30;
                        case "road":
                            return -(creep.pos.getRangeTo(s));
                        default:
                            return 20;
                    }
                }});
        return _.values(targets);
    },
    /*
     *  This finds all my energy providing structures in a room, sorts them into a
     *      priority queue, and returns the array
     * @param {object} creep - creep to be calling this ! MUST USE .call()
     */
    findPriorityEnergyProviders: function(){
        var creep = this;
        var targets = _(creep.room.find(FIND_STRUCTURES))
                        .filter(s => s.structureType == "container"
                            || s.structureType == "storage")
                        .sortBy(s => s.totalEnergy() )
                        .value()
        return targets;
    },
    /*
     * Finds targets to dismantle and orders by range
     * @param {object} creep - creep to be calling this ! MUST USE .call()
     */
    findPriorityDismantleList: function(){
        var targets = _(this.room.find(FIND_HOSTILE_STRUCTURES))
                        .filter(s => s.structureType == "tower"
                            || s.structureType == "spawn")
                        .sortBy(s => (0 - s.pos.getRangeTo(this)) )
                        .value()
        return targets;
    },
    /*
     *  This finds all my energy needing structures in a room, sorts them into a
     *      priority queue, and returns the array
     * @param {object} creep - creep to be calling this ! MUST USE .call()
     */
    findPriorityEnergyStorage: function(){
        var creep = this;
        var targets = _(creep.room.find(FIND_MY_STRUCTURES))
            .filter(s => s.totalEnergy() == s.capacity)
            .sortBy(function(s){
                if(s.totalEnergy() != null){
                    switch(s.structureType){
                        case "tower":
                            return 100;
                        case "spawn":
                            return 70;
                        case "powerSpawn":
                            return 80;
                        case "extension":
                            return 70;
                        case "storage":
                            return 90;
                        default:
                            return 0;
                    }
                }else{
                    return 0;
                }
            }
            )
            .value()
        return targets;
    },
    /*
     *  finds production structures and returns a list of them in order to
     * be filled. Favors closer extensions, spawns, and powerspawns.
     * @call {object} creep - creep to be calling this ! MUST USE .call()
     * RETURN [array] repairtargets - repair list in ascending priority
     */
    findPriorityFillTargets: function(){
        var creep = this;
        var structures = _(creep.room.find(FIND_STRUCTURES))
                    .filter(s => s.structureType != "container"
                        && s.structureType != "terminal"
                        && s.structureType != "link")
                    .filter(s => s.totalEnergy() < s.capacity() )
                    .sortBy(function(s){
                        if(s.totalEnergy() != null){
                            switch(s.structureType){
                                case "tower":
                                    if(s.energy > (s.energyCapacity * 0.5) ){
                                        return 1;
                                    }else{
                                        return 100;
                                    }
                                case "extension":
                                case "spawn":
                                case "powerSpawn":
                                    return (100 / creep.pos.getRangeTo(s) );
                                case "storage":
                                    return 0;
                                default:
                                    return 10;
                            }
                        }else{
                            return 0;
                        }
                    })
                    .value()
        var creeps = _(creep.room.find(FIND_MY_CREEPS))
                    .filter(c => c.memory.role == "scv")
                    .filter(c => c.totalEnergy() != c.carryCapacity)
                    .sortBy(c => c.totalEnergy()  / (0 - creep.pos.getRangeTo(c.pos)))
                    .value()
        var targets = creeps.concat(structures);
        return targets;
    },
    /*
     *  finds all things that need to be repaired and returns in a priority
     *      sorted list
     * @call {object} creep - creep to be calling this ! MUST USE .call()
     * RETURN [array] repairtargets - repair list in ascending priority
     */
    findPriorityRepairs: function(){
        var creep = this;
        var targets = _.sortBy((creep.room.find(FIND_STRUCTURES, {
            filter: function(s){
                return s.hits < s.hitsMax &&
                (s.structureType != "wall" && s.structureType != "rampart");
            }})) ,
            function(s){
                switch(s.structureType){
                    case "tower":
                        return 100;
                    case "spawn":
                        return 70;
                    case "extension":
                        return 70;
                    case "storage":
                        return 60;
                    default:
                        return 0;
                }
            });
        return _.values(targets);
    },
    /*
     * Finds all walls and ramparts and returns a sorted list based on hits
     * @call {object} creep - creep to call this
     * RETURN [array] targets;
     */
    findPriorityWallRepairs: function(){
        var creep = this;
        if(Memory.wallTargetPercentage == null){
            Memory.wallTargetPercentage = 0.033;
        }
        var targets = _(creep.room.find(FIND_STRUCTURES))
                    .filter(s => s.structureType == "constructedWall"
                        || s.structureType == "rampart")
                    .filter(s => s.hits < (s.hitsMax * Memory.wallTargetPercentage))
                    .sortBy(s => 0 - s.hits)
                    .value()
        return targets;
    },
    /*
     *  Finds all energy storage structures in a room, sorts them into a
     *  priority queue, and returns the array. Weight is percentage based and
     *  includes distance by range
     *
     * @param {object} creep - creep to be calling this ! MUST USE .call()
     */
    findPriorityEnergySources: function(){
        var creep = this
        var rez = _(this.room.find(FIND_DROPPED_RESOURCES))
                    //.filter(r => r.pos.findInRange(FIND_MY_CREEPS).length == 0)
                    .filter(r => r.amount > (creep.carryCapacity / 10))
                    .sortBy(r => Math.min(r.totalEnergy(), creep.carryCapacity) / creep.pos.getRangeTo(r.pos) )
                    .value()
        var cans = _(this.room.find(FIND_STRUCTURES))
                    .filter(s => s.structureType == "container")
                    .filter(s => s.store["energy"] != 0)
                    .sortBy(s => s.store["energy"] )
                    .value()
        var targets = cans.concat(rez)
        return targets;
    },
    /*
     *  Finds viable sources for creep to solo havest
     *
     * @param {object} creep - creep to be calling this ! MUST USE .call()
     */
    findHarvestSources: function(){
        var creep = this
        var sources = _(this.room.find(FIND_SOURCES))
                    .filter(r => r.energy > creep.carryCapacity)
                    .sortBy(r => r.pos.getRangeTo(creep.pos) )
                    .reverse()
                    .value()
        var rez = _(this.room.find(FIND_DROPPED_ENERGY))
                    .filter(r => r.amount > creep.carryCapacity)
                    .value()
        var targets = sources.concat(rez)
        return targets;
    }
};