spawningConfig = {
    cx: 500,
    cy: 500,
    r1: 25,
    r2: 500
}

function getSpawn(callback, isPlanet){
    let {cx, cy, r1, r2} = spawningConfig;
    if(!isPlanet){
        r1 = 200;
    }
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * (r2 - r1) + r1;
    const [x, y] = 
        [
            Math.cos(angle) * r + cx,
            Math.sin(angle) * r + cy
        ]
    callback({x, y});
}

module.exports = {
    getSpawn
}