var fs = require('fs');

function checkTreeVisibility(data, forestLength,forestWidth,i,j){
    let w;

    /*check top */
    for(w=i-1;w>=0;w--){
        if(data[w][j]>=data[i][j])
            break;
    }
    /* if we exit for without break, tree visible from top */
    if(w==-1){
        return 1;
    }
    /*check bottom */
    for(w=i+1;w<forestLength;w++){
        if(data[w][j]>=data[i][j])
            break;
    }
    /* if we exit for without break, tree visible form bottom */
    if(w==forestLength){
        return 1;
    }
    /*check left */
    for(w=j-1;w>=0;w--){
        if(data[i][w]>=data[i][j])
            break;
    }
    /* if we exit for without break, tree visible form left */
    if(w==-1){
        return 1;
    }
    /*check right */
    for(w=j+1;w<forestWidth;w++){
        if(data[i][w]>=data[i][j])
            break;
    }
    /* if we exit for without break, tree visible form right */
    if(w==forestWidth){
        return 1;
    }
    return 0;
}

function checkTreeScore(data, forestLength,forestWidth,i,j){
    let topScore=0,bottomScore=0,leftScore=0,rightScore=0;
    let w;

    /*check top */
    for(w=i-1;w>=0;w--){
        topScore++;
        if(data[w][j]>=data[i][j])
            break;
    }
    /*check bottom */
    for(w=i+1;w<forestLength;w++){
        bottomScore++;
        if(data[w][j]>=data[i][j])
            break;
    }
    /*check left */
    for(w=j-1;w>=0;w--){
        leftScore++;
        if(data[i][w]>=data[i][j])
            break;
    }
    /*check right */
    for(w=j+1;w<forestWidth;w++){
        rightScore++;
        if(data[i][w]>=data[i][j])
            break;
    }
    return topScore*bottomScore*leftScore*rightScore; 
}

/* retrieve data from "input" */
var data=fs.readFileSync("input");
data=data.toString().split("\n");

var forestWidth=data[1].length;
var forestLength=data.length-1; //file contains empty line at the end
var countVisibleTrees=forestWidth*4-4;


/* compute total visible trees */
for(let i=1;i<forestLength-1;i++){ /* length === height - basically scrolling from top to bottom */
    for(let j=1;j<forestWidth-1;j++){
        if(checkTreeVisibility(data,forestLength,forestWidth,i,j))
            countVisibleTrees++;
    } 
}

/* compute highest score tree*/
var maxScore=0;
for(let i=1;i<forestLength-1;i++){ /* length === height - basically scrolling from top to bottom */
    for(let j=1;j<forestWidth-1;j++){
        let tmpScore;
        if((tmpScore=checkTreeScore(data,forestLength,forestWidth,i,j))>maxScore)
        maxScore=tmpScore;
    } 
}

console.log("Part 1 result: " +countVisibleTrees);
console.log("Part 2 result: " +maxScore);
