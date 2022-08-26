const { MapWithDeadLine } = require('./utils.js');


let obj = {
    'map': new MapWithDeadLine(2)
}

setTimeout(()=>obj.map.set("a", 1), 2000)

console.log(obj.m)