/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('output');
 * mod.thing == 'a thing'; // true
 */
var colorCodes = {  overlord:"blue", 
                    command:"yellow",
                    roleManager:"yellow",
                    search:"yellow",
                    tasks:"yellow",
                    tasks_combat:"orange",
                    defend:"red",
                    combat:"red",
                    collect_stats:"purple",
                    resources:"purple",
                    spawner: "green",
                    produce:"green",
                    main: "white",
                    unknown: "white",
                    utilities: "white",
                    time: "cyan"   };
var levelCodes = {  0:"EMERGENCY",
                    1:"ALERT",
                    2:"CRITICAL",
                    3:"ERROR",
                    4:"WARNING",
                    5:"NOTIFICATION",
                    6:"INFO",
                    7:"DEBUG"   };
var levelColors = { 0:"red",
                    1:"red",
                    2:"red",
                    3:"orange",
                    4:"yellow",
                    5:"green",
                    6:"blue",
                    7:"purple"  };                    
                    
var output = {
    /*
     * Logging function, saves output to string to say at end of tick
     * @param {String} module - Module throwing error
     * @param {String} logString - string to print
     * @param {integer} level - debug level
     * @param {stack} e - error object
     * 
     */
    log: function(module = "unknown", level = 3, logString = "", e){
        if(Memory.debugLevel == null){
            Memory.debugLevel = 3;
        }
        var debugLevel = Memory.debugLevel;
        if(level > debugLevel) return;
        var modstring = "["+module.toUpperCase()+"]"
        var modcolor = colorCodes[module.toLowerCase()]
        var modhtml = "<font color='"+ modcolor + "'>" + modstring + "</font>";
        var levelhtml = "<font color='"+ levelColors[level] + "'>" + levelCodes[level] + "</font>";
        
        var errorstring;
        if(e != null){
            switch(level){
                case 0:
                case 1:
                case 2:
                case 3:
                    errorstring = "... Error Data: " + e.message + " : " + e.stack;
                    break;
                case 4:
                    errorstring = "... Error Data: " + e.message;
                    break;
                default:
                    errorstring = "";
            }
        }else{
            errorstring = "";
        }
        console.log(Game.time, modhtml, levelhtml, logString,  errorstring);
        return OK;
    }
};
module.exports = output;