
let lastMouse = { x: 0, y: 0 }
let clicksQueue = []

parent.addEventListener("mousemove", (e) => {
    //console.log('mousemove', e);
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY + 10;
});
parent.addEventListener("mousedown", (e) => {
    //console.log('mousedown', e);
    if(e.button == 2) {
        clicksQueue.push({ x: e.clientX, y: e.clientY + 10 })
        setTimeout(() => {clicksQueue.splice(0,1)}, 300)
    }
    //console.log('queue', clicksQueue)
});