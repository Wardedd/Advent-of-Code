var fs = require('fs');

function areKnotsClose(knot1,knot2){
    var xdiff=knot1.posX-knot2.posX;
    var ydiff=knot1.posY-knot2.posY;
    if(xdiff<-1||xdiff>1)
        return false;
    if(ydiff<-1||ydiff>1)
        return false;
    return true;
}

/* function that determines how the "knot" moves in order to follow "knotToReach" */
function getBestPos(knotToReach,knot){ 
    var xdiff=knotToReach.posX-knot.posX;
    var ydiff=knotToReach.posY-knot.posY;
    
    if(xdiff>0) xdiff=1;
    else if(xdiff<0) xdiff=-1;
    else xdiff=0;

    if(ydiff>0) ydiff=1;
    else if(ydiff<0) ydiff=-1;
    else ydiff=0;

    return {posX:knot.posX+xdiff,posY:knot.posY+ydiff};
}

/* retrieve data from "input" */
var data=fs.readFileSync("input");
data=data.toString().split("\n");

var startPosX=0,startPosY=0;
var numKnots=10;
var numKnotsNoHead=numKnots-1; /* -1 because head not in here, whilst tail is */

var knotsPos=[];
var knotsPosHistory=[];

for(let i=0;i<numKnotsNoHead;i++){
    knotsPos.push({posX:startPosX,posY:startPosY});
    knotsPosHistory.push([{posX:startPosX,posY:startPosY}]);
}

var headPos={posX:startPosX,posY:startPosY};
  

for(let i=0;i<data.length-1;i++){
    let array=data[i].split(" ");
    let newXDiff=0;
    let newYDiff=0;

    /* determine HEAD movement */
    switch(array[0][0]){
        case "L":
            newXDiff=-1;
            break;
        case "R":
            newXDiff=1;
            break;
        case "U":
            newYDiff=-1;
            break;
        case "D":
            newYDiff=1;
            break;
    }

    for(let j=0;j<Number(array[1]);j++){
        /* move head knot */
        headPos.posX+=newXDiff;
        headPos.posY+=newYDiff;

        /* propagate and log changes through other knots */
        for(let k=0;k<numKnotsNoHead;k++)/* from knot closes to tail (number 1 - i=0), to farthest (tail - number 9 - i=8) */
            if(k==0){ /* check with head */
                if(!areKnotsClose(headPos,knotsPos[k])){
                    let bestNewPos=getBestPos(headPos,knotsPos[k]);
                    knotsPos[k].posX=bestNewPos.posX;
                    knotsPos[k].posY=bestNewPos.posY;
                    knotsPosHistory[k].push({posX:knotsPos[k].posX,posY:knotsPos[k].posY});
                }
            }else{ /* check between knot k-1 and k=[1,numKnotsNohead-1]*/
                if(!areKnotsClose(knotsPos[k-1],knotsPos[k])){
                    let bestNewPos=getBestPos(knotsPos[k-1],knotsPos[k]);
                    knotsPos[k].posX=bestNewPos.posX;
                    knotsPos[k].posY=bestNewPos.posY;
                    knotsPosHistory[k].push({posX:knotsPos[k].posX,posY:knotsPos[k].posY});
                }
            }

    }
}

var secondKnotPosArrUnique=knotsPosHistory[0].filter(function(item,pos){ /* second knot after head */
    for(let i=pos-1;i>=0;i--){
        if(item.posX==knotsPosHistory[0][i].posX && item.posY==knotsPosHistory[0][i].posY)
            return false;
    }
    return true;
});

var tailPosArrUnique=knotsPosHistory[numKnotsNoHead-1].filter(function(item,pos){
    for(let i=pos-1;i>=0;i--){
        if(item.posX==knotsPosHistory[numKnotsNoHead-1][i].posX && item.posY==knotsPosHistory[numKnotsNoHead-1][i].posY)
            return false;
    }
    return true;
});

console.log("Part 1 result: "+secondKnotPosArrUnique.length); 
console.log("Part 2 result: "+tailPosArrUnique.length); 
