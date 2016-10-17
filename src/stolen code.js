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

//warinternal's screeps lcgging class
/**
 * Log.js
 *
 * ES6 log class for logging screeps messages with color, where it makes sense.
 * @todo: abbr tag '<abbr title="World Health Organization">WHO</abbr>'
 * @todo: log groups / log levels?
 */ 
'use strict';
 
class Log
{
  constructor() {
    throw new Error("Log is a static class");
  }
  
  /** */
  static info(msg) {
    this.toConsole(msg, 'cyan')
  }
  
  /** */
  static warn(msg) {
    this.toConsole(msg, 'orange');
  }
  
  /** */
  static error(msg) {
    this.toConsole(msg, 'red');
  }
  
  /** */
  static success(msg) {
    this.toConsole(msg, 'green');
  }
  
  /**
   * HTML table in console
   * ex: Log.table(['a','b'], [[1,2],[3,4]])
   */
  static table(headers, rows) {
    
    let msg = '<table>';
    _.each(headers, h => msg += '<th width="50px">' + h + '</th>');
    _.each(rows, row =>  msg += '<tr>' + _.map(row, el => (`<th>${el}</th>`)) + '</tr>');
    msg += '</table>'
    // console.log(msg);
    return msg;
  }

  /** */
  static notify(msg, group=0, color='red') {
    this.toConsole(msg, color);
    Game.notify(msg, group);
  }
  
  /** */
  static toConsole(msg, color) {
    console.log(`<font color=${color}>${msg}</font>`); 
  }
  
  /** */
  static progress(v, m) {
    return `<progress value="${v}" max="${m}"/>`;
  }
  
}

module.exports = Log;


      
//******************************************
//Warinternal's constants
global.RAMPART_UPKEEP    = RAMPART_DECAY_AMOUNT / REPAIR_POWER / RAMPART_DECAY_TIME;
global.ROAD_UPKEEP        = ROAD_DECAY_AMOUNT / REPAIR_POWER /  ROAD_DECAY_TIME;
global.CONTAINER_UPKEEP = CONTAINER_DECAY / REPAIR_POWER / CONTAINER_DECAY_TIME_OWNED;
global.REMOTE_CONTAINER_UPKEEP = CONTAINER_DECAY / REPAIR_POWER / CONTAINER_DECAY_TIME;

//******************* Sparr's tostring
    RoomPosition.prototype.toString = function (html=true) {
    if (html) {
      return `<a href="#!/room/${ this.roomName }">[room ${ this.roomName } pos ${ this.x },${ this.y }]</a>`;
    }
    return `[room ${ this.roomName } pos ${ this.x },${ this.y }]`;
    };
    
//Klapauciu's Tower Roomobject prototype
Object.defineProperty(Room.prototype, "towers", { 
    get: function () {
        if (this._towers === undefined) {
            if ( this.controller && this.controller.my )
                this._towers = this.find(FIND_MY_STRUCTURES, {filter:{structureType:STRUCTURE_TOWER}});
            else
                this._towers = [];
        }
        return this._towers;
    }});
    
//Dissi's cpu calculator
function reportDuration(theMethod, theCpu)
{
    if(Memory.diag === undefined)
    {
        Memory.diag = {};
    }
    if(Memory.diag[theMethod] === undefined)
    {
        Memory.diag[theMethod] = {amount: 0, cpu: 0, lasttick: 0, times: 0};
    }
    if(Memory.diag[theMethod].lasttick == Game.time)
    {
        Memory.diag[theMethod].cpu += theCpu;
        Memory.diag[theMethod].times++;
    }
    else
    {
        Memory.diag[theMethod].times++;
        Memory.diag[theMethod].amount++;
        Memory.diag[theMethod].cpu += theCpu;
        Memory.diag[theMethod].lasttick = Game.time;
    }
}

// AND ALSO

global.printDiagWithPrefix = function(thePrefix)
{
    var widthSize = 0;
    for(var d in Memory.diag )
    {
        if(d.indexOf(thePrefix) == -1)
        {
            continue;
        }
        if(d.length > widthSize)
        {
            widthSize = d.length;
        }
    }
    for(var d in Memory.diag )
    {
        if(d.indexOf(thePrefix) == -1)
        {
            continue;
        }
        var avgCpu = Memory.diag[d].cpu / Memory.diag[d].amount;
        var avgTimesReported = Memory.diag[d].times / Memory.diag[d].amount;
        var avgActionTime = avgCpu / avgTimesReported;
        log('Method ['+pad(widthSize, d, ' ')+']\t'+avgCpu.toFixed(2) + '\tAvg times/tick reported: '+avgTimesReported.toFixed(2)+' ticks: ' + Memory.diag[d].amount + ' Avg/action: ' + avgActionTime.toFixed(2), "diagnose");
    } 
}

/// AND ALSO


function doGameLoopMethod(theMethod)
{
    var cpuNow = Game.cpu.getUsed();
    try
    {
        theMethod();
    }
    catch (err)
    {
        if(!isNullOrUndefined(err))
        {
            Game.notify("Error in main loop logic: \n" + err + "\n On line " + err.lineNumber);
            log("Error in main loop logic\n" +err + "\n" + err.stack, "error");
        }
    }
    var cpuSpend = Game.cpu.getUsed() - cpuNow;
    reportDuration("GL_" + theMethod.name, cpuSpend);

}


// warinternal's code for caching FIND_STRUCTURES
Object.defineProperty(Room.prototype, 'structures', {
    get: function() {
        if(this == undefined || this.name == undefined)
            return;
        if(!this._structures || _.isEmpty(this._structures)) {
            // console.log('generating on tick ' + this.name + ' at ' + Game.time);
            this._structures = this.find(FIND_STRUCTURES);
        }
        return this._structures;
    },
    enumerable: false,
    configurable: true
});    

Object.defineProperty(Room.prototype, 'structuresByType', {
    get: function() {
        if(this == undefined || this.name == undefined)
            return;
        if(!this._structuresByType || _.isEmpty(this._structuresByType)) {
            this._structuresByType = _.groupBy(this.structures, 'structureType');
        }
        return this._structuresByType;
    },
    enumerable: false,
    configurable: true
});

// Warinternal's time to degredation
global.ticksTillDead = (level, currentTimer) => _.sum(_.slice(_.values(CONTROLLER_DOWNGRADE), 0, level-1)) + currentTimer;

// Warinternal's find stuff outside room 
/**
 * @param {Object} goals - collection of RoomPositions or targets
 * @param {function} itr - iteratee function, called per goal object
 */
RoomPosition.prototype.findClosestByPathFinder = function(goals, itr=_.identity) {
    let mapping = _.map(goals, itr);
    if(_.isEmpty(mapping))
        return {goal: null};
    let result = PathFinder.search(this, mapping, {maxOps: 16000});
    let last = _.last(result.path);
    let goal = _.min(goals, g => last.getRangeTo(g.pos));
    return {
        goal: (Math.abs(goal)!==Infinity)?goal:null,
        cost: result.cost,
        ops: result.ops,
        incomplete: result.incomplete
    }
};

RoomPosition.prototype.findClosestSpawn = function() {
    return this.findClosestByPathFinder(Game.spawns, (spawn) => ({pos: spawn.pos, range: 1})).goal;
};

RoomPosition.prototype.findClosestConstructionSite = function() {
    return this.findClosestByPathFinder(Game.constructionSites,
        (cs) => ({pos: cs.pos, range: 3})).goal;
};


//  Prototype for giving spawns access to roomqueue;
StructureSpawn.prototype.getQueue = function() {
    if(!this.room.memory.queue)
        this.room.memory.queue = [];
    return this.room.memory.queue;
}