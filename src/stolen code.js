/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('STOLEN CODE');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    var repairTargets = creep.room.find(FIND_STRUCTURES, {

    filter: object => (

      ( ( object.structureType != STRUCTURE_WALL && object.structureType != STRUCTURE_RAMPART ) && object.hits < ( object.hitsMax * 0.8 ) ) ||

      ( ( object.structureType == STRUCTURE_WALL || object.structureType == STRUCTURE_RAMPART ) && object.hits < Memory.rooms[roomName].max_walls && object.hitsMax != 0)

    )

});

creep.say(`${repairTargets.length} tgts`);

if (repairTargets.length > 0) {

    let repairTarget = creep.pos.findClosestByRange(repairTargets);

    dest = repairTarget.id;

    creep.memory.job = 'repair';

}
};

//888888***************************************
var repairObject = _(creep.room.find(FIND_STRUCTURES))
.filter( s=> (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits <= average);
.sortBy( s=> s.hits)
.first()


// SPARR's TARGET AI FOR TOWERS - DOES NOT ACTUALLY WORK
// EDIT Works now. changed [0] to .first();
      let target = _(tower.room.find(FIND_HOSTILE_CREEPS)).sortBy(c=>
        -(
          c.getActiveBodyparts(HEAL)*20 +
          c.getActiveBodyparts(ATTACK)*10 +
          c.getActiveBodyparts(RANGED_ATTACK)*5 +
          c.getActiveBodyparts(WORK)
        )
      ).first();;
      
//Heilos' find closest unused source code
        _(creep.room.find(FIND_SOURCES))
        .filter(s => s.pos.findInRange(FIND_MY_CREEPS, 1).length ==0)
        .sortBy(s => -this.pos.getRangeTo(s.pos) )
        .value()
        
// Warinternal's observer room targetting code
let set = new Set([start]);    
    set.forEach(function(roomName) {
        let exits = _.values(Game.map.describeExits(roomName));
        let rooms = _.filter(exits, r => Game.map.getRoomLinearDistance(start, r) <= OBSERVER_RANGE);
        _.each(rooms, r => set.add(r));
    });
    return set;
    
// warinternal's roomrange code
/**
 * Uniform screep's world position with E0S0 as origin.
 */
'use strict';
class WorldPosition
{
  /** @property int x */
  /** @property int y */
  
  /**
   * @params {Object} point
   * @params {number} point.x - world position x (-3025 to 3025)
   * @params {number} point.y - world position y (-3025 to 3025)
   */
  constructor(x,y) {
    this.x = x;
    this.y = y;
    Object.seal(this);
  }
  
  /**
   * @params {Object} point
   * @params {number} point.x
   * @params {number} point.y
   */
  getRangeTo(point) {
    return this.getRangeToXY(point.x, point.y);
  }

  /**
   * @params {number} x
   * @params {number} y
   */
  getRangeToXY(x,y) {
    return this.getChebyshevDist(x,y);
  }
  
  inRangeTo(point, range) {
    return this.inRangeToXY(point.x, point.y, range);
  }
  
  inRangeToXY(x,y,range) {
    return (this.getRangeToXY(x,y) <= range);
  }
  
  getDirectionTo(point) {
    return this.getDirectionToXY(point.x, point.y);
  }
  
  /**
   * @params {number} x - world coordinate x
   * @params {number} y - world coordinate y
   *   ..don't question it. don't even think about it.
   */
  getDirectionToXY(x,y) {
    let [dx,dy] = [x - this.x, y - this.y];   
    let arc = Math.atan2(dy, dx) * (180 / Math.PI);   
    let dir = Math.round((arc / 45) + 3);   
    return (dir == 0)?8:dir;
  }
  
  findRouteToWorldPosition(pos, opts) {
    return Game.map.findRoute(this.getRoomName(), pos.getRoomName(), opts);
  }
  
  findPathToWorldPosition(pos, opts) {
    let src = this.toRoomPosition();
    let dst = pos.toRoomPosition();
    return PathFinder.search(src, dst, opts);
  }
  
  /**
   * @params [WorldPosition] - array of other world positions to compare
   */
  findClosestByRange(arr) {
    return _.min(arr, p => this.getRangeTo(p.wpos));
  }
  
  /** @returns String - name of the room this point belongs to */
  getRoomName() {
    let [x,y] = [Math.floor(this.x / 50), Math.floor(this.y / 50)]
    let result = "";
    result += (x < 0 ? "W" + String(~x) : "E" + String(x));
    result += (y < 0 ? "N" + String(~y) : "S" + String(y));
    return result;
  }
    
  /** @returns boolean - do we have visibility in the room this point belongs to? */
  isVisible() {
    let name = this.getRoomName();
    return (Game.rooms[name] !== undefined);      
  }
  
  /** @returns boolean - is this room part of the highways between sectors? */
  isHighway() {
    let roomName = this.getRoomName();
    let parsed = roomName.match(/^[WE]([0-9]+)[NS]([0-9]+)$/);
    return (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
  }
  
  /** @returns boolean - do I own this point in space? */
  isMine() {
    let roomName = this.getRoomName();
    return _.get(Game.rooms, roomName + '.controller.my', false);
  }
  
  /** Distance functions */

  /**
   * @params {Object} point
   * @params {number} point.x
   * @params {number} point.y
   */
  getEuclidDist(pos) {      
    return Math.hypot( pos.x - this.x, pos.y - this.y );
  }
  
  /**
   * @params {Object} point
   * @params {number} point.x
   * @params {number} point.y
   */
  getManhattanDist(pos) {
    return Math.abs(pos.x - this.x) + Math.abs(pos.y - this.y);
  }
  
  // yeah. and with that, it'll give you the correct distance of diagonals, whereas manhattan won't consider that.
  /**
   * @params {Object} point
   * @params {number} point.x
   * @params {number} point.y
   */
  getChebyshevDist(x,y) {
    return Math.max( Math.abs((x-this.x)), Math.abs((y-this.y)) );
  } 
  
  /** serialization */
  serialize() {
    return this.x + "_" + this.y;
  }
  
  static deserialize(str) {
    let [x,y] = str.split('_');
    return new WorldPosition(x,y);
  }
  
  /** [object WorldPosition] */
  get [Symbol.toStringTag]() {
    return 'WorldPosition';
  }
  
  
  /**
   * @params {RoomPosition} roomPos
   * @params {number} roomPos.x
   * @params {number} roomPos.y
   * @params {String} roomPos.roomName
   * @returns {WorldPosition}
   */
  static fromRoomPosition(roomPos) {    
    let {x,y,roomName} = roomPos;
    if(!_.inRange(x, 0, 50)) throw new RangeError('x value ' + x + ' not in range');
    if(!_.inRange(y, 0, 50)) throw new RangeError('y value ' + y + ' not in range');
    if(roomName == 'sim') throw new RangeError('Sim room does not have world position');
    let [name,h,wx,v,wy] = roomName.match(/^([WE])([0-9]+)([NS])([0-9]+)$/);
    if(h == 'W') x = ~x;
    if(v == 'N') y = ~y;        
    return new WorldPosition( (50*wx)+x, (50*wy)+y );
  }
    
  toRoomPosition() {    
    let [rx,x] = [Math.floor(this.x / 50), this.x % 50];
    let [ry,y] = [Math.floor(this.y / 50), this.y % 50];  
    if( rx < 0 && x < 0 ) x = (49 - ~x);
    if( ry < 0 && y < 0 ) y = (49 - ~y);    
    return new RoomPosition(x,y,this.getRoomName());
  }   
    
  /** [world pos 1275,1275] */
  toString() {
    return "[world pos " + this.x + "," + this.y + "]";
  }   
}

Object.defineProperty(RoomObject.prototype, "wpos", {
    get: function () {
    if(!this._wpos)
      this._wpos = WorldPosition.fromRoomPosition(this.pos);
    return this._wpos;
    },  
  configurable: true,
  enumerable: false
});

RoomPosition.prototype.toWorldPosition = function() {
  if(!this._wpos)
      this._wpos = WorldPosition.fromRoomPosition(this);
  return this._wpos;
}

module.exports = WorldPosition;
// Console.log in colors
var x = "<font color='#ff0000'>blah</font>"; console.log(x)

// Webber's spawn management code
  // set beingBuilt to true, add name to watch completion for and move to end of queue
  markQueueItemAsBeingBuiltWithName(creepName) {
    let queue = this.room.memory.buildQueue;
    Object.assign(queue[0], {
      createdThisTick: true,
      beingBuilt: true,
      name: creepName
    });
    queue.push(queue.shift());
  }

// Warinternal's creep part sorter
_.sortBy(body, p => _.indexOf([TOUGH,MOVE,WORK,CARRY,ATTACK,RANGED_ATTACK,HEAL,CLAIM],p))

  //warinternal's constants
global.SOURCE_HARVEST_PARTS = SOURCE_ENERGY_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;
global.SOURCE_HARVEST_PARTS_NEUTRAL = SOURCE_ENERGY_NEUTRAL_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;
global.SOURCE_HARVEST_PARTS_KEEPER = SOURCE_ENERGY_KEEPER_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;