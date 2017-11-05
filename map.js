let click1 = { x: 0, y: 0};
let click2 = { x: 0, y: 0};
let turn = 0;

var lines = [];

const MAX_X = 800;
const MAX_Y = 600;
const LINE_SPACING = 20;
const onlyAllow90 = true;
var mode = 1; // 0 is wall mode, 1 is slab mode, 2 is roomba placement mode, 3 is wall select mode

let receivedRoombaX = 0;
let receivedRoombaY = 0;

let setRoombaX = 0;
let setRoombaY = 0;

const ws = new WebSocket('ws://localhost:4000');
   
ws.onmessage = function incoming(data) {
    let _data = JSON.parse(data.data);
    receivedRoombaX = _data.x;
    receivedRoombaY = _data.y;
}

function setup() {
    click1 = { x: 0, y: 0};
    click2 = { x: 0, y: 0};
    turn = 0;
    lines = Object.assign([]);
    createCanvas(MAX_X + 1, MAX_Y + 1);
    textSize(12);
}

function draw() {
    // Clear the backgroud every frame
    background(211,211,211);

    // set the stoke to default for making the grid
    strokeWeight(1);
    stroke(126);

    // create the grid
    for (let x = 0; x <= MAX_X; x = x + LINE_SPACING) {
        line(x, 0, x, MAX_Y)
    }

    for (let y = 0; y <= MAX_Y; y = y + LINE_SPACING) {
        line(0, y, MAX_X, y)
    }

    strokeWeight(2);
    if(mode == 0) {
        stroke(255, 0, 0);
    } else if(mode == 1) {
        stroke(0, 255, 0);
    }
    
    let intersection = calculateIntersectionPoint();
    //line(intersection.x - 5, intersection.y + 5, intersection.x + 5, intersection.y - 5);
    //line(intersection.x + 5, intersection.y - 5, intersection.x - 5, intersection.y + 5);

    if(turn == 1) {
        let snap = calculateSnapPoint();
        line(click1.x, click1.y, snap.x, snap.y);
    }

    // for each line we have saved, draw the line and its length
    lines.forEach(l => {
        // set the line color to red for drawing lines
        strokeWeight(2);
        if(l.type == 0) {
            stroke(255, 0, 0);
        } else if(l.type == 1) {
            stroke(0, 255, 0);
        }
        line(l.x1, l.y1, l.x2, l.y2);

        // set the stroke back to default for drawing text
        stroke(126);
        strokeWeight(1);

        // calcuate the text and its position
        if(l.x1 == l.x2) {
            let length = Math.abs(l.y1 - l.y2);
            let middle = Math.round(length / 2);
            text(convertPxToIn(length), l.x1, Math.min(l.y1, l.y2) + middle);
        } else {
            let length = Math.abs(l.x1 - l.x2);
            let middle = Math.round(length / 2);
            text(convertPxToIn(length), Math.min(l.x1, l.x2) + middle, l.y1);
        }
    })

    // draw the roomba at its current position
    strokeWeight(1);
    stroke(0, 150, 0);
    ellipse(setRoombaX + receivedRoombaX, setRoombaY + receivedRoombaY, 50);

    if(mode == 0) {
        // find the line that is closest to the mouse
        let foo = lines.filter(l => {
            return (l.type == 0 && Math.abs(l.x - mouseX) < 50 || Math.abs(l.y - mouseY))
        })

        console.log(foo);
    }
}

/*
* returns a friendly string on length
*/ 
function convertPxToIn(px) {
    // 10 px = 6 inch
    let inches = px * 6 / LINE_SPACING
    let feet = Math.floor(inches / 12);
    let leftoverInches = inches % 12;

    if(feet > 0 && leftoverInches > 0) {
        return feet + " ft " + leftoverInches + " im"
    } else if(feet > 0 ) {
        return feet + " ft"
    } else {
        return inches + "in";
    }   
}

function CreateCSV(){
    if(lines.length === 0) {
        return;
    }
    var csv = [];
    lines.forEach(line => {
        let x1 = line.x1 - (setRoombaX + receivedRoombaX);
        let y1 = line.y1 - (setRoombaY + receivedRoombaY);
        let x2 = line.x2 - (setRoombaX + receivedRoombaX);
        let y2 = line.y2 - (setRoombaY + receivedRoombaY);
        csv.push({
            x: x1,
            y: -1 * y1,
            heading: Math.atan2((y1 - y2), (x2 - x1))
        });
        csv.push({
            x: x2,
            y: -1 * y2,
            heading: Math.atan2((y2 - y1), (x1 - x2))
        });
    })
    console.log(csv);

    ws.send(JSON.stringify(csv));
}

function EnableWallMode(e) {
    turn = 0;
    mode = 0;
    e.preventDefault()
}

function EnableSlabMode(e) {
    turn = 0;
    mode = 1;
    e.preventDefault();
}

function EnableRoombaPlacementMode(e) {
    turn = 0;
    mode = 2;
    e.preventDefault();
}

function mouseClicked() {
    // if we are outside of the canvas, ignore the click
    if(mouseX > MAX_X || mouseY > MAX_Y) {
        return false;
    }

    // If we are in roomba placement mode, dont create a new line
    if(mode == 2) {
        setRoombaX = Math.round(mouseX / LINE_SPACING) * LINE_SPACING - receivedRoombaX;
        setRoombaY = Math.round(mouseY / LINE_SPACING) * LINE_SPACING - receivedRoombaY;
        mode = 0;
        return false;
    }

    // if it is an odd click (1, 3, 5 etc) save that value
    if(turn == 0) {
        click1.x = Math.round(mouseX / LINE_SPACING) * LINE_SPACING;
        click1.y = Math.round(mouseY / LINE_SPACING) * LINE_SPACING ;
        turn = 1

    // if it is an odd click create a new line in our list with the points from the first click and this click
    } else {
        // if we only allow for 90 degree lines, fine the closest intersection point and make that the point
        if(onlyAllow90) {
            click2.x = calculateSnapPoint().x;
            click2.y = calculateSnapPoint().y;
        } else {
            click2.x = Math.round(mouseX / LINE_SPACING) * LINE_SPACING;
            click2.y = Math.round(mouseY / LINE_SPACING) * LINE_SPACING ;
        }
        // if we are in draw mode create a line at that point
        let newLine = { x1: click1.x, y1: click1.y, x2: click2.x, y2: click2.y, type: mode};
        lines.push(newLine);
        turn = 0;
    }

    // prevent default click effect
    return false;
}

function calculateIntersectionPoint() {
    return {
        x: Math.round(mouseX / LINE_SPACING) * LINE_SPACING,
        y: Math.round(mouseY / LINE_SPACING) * LINE_SPACING 
    }   
}

function calculateSnapPoint() {
    // need to determine which direction the user wanted to go
    let xDistance = Math.abs(click1.x - mouseX);
    let yDistance = Math.abs(click1.y - mouseY); 

    let snap = {};
    let intersection = calculateIntersectionPoint();

    snap.x = Math.max(xDistance, yDistance) == xDistance ? intersection.x : click1.x;
    snap.y = Math.max(xDistance, yDistance) == yDistance ? intersection.y : click1.y;

    return snap;
}