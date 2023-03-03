/* 
    file format (rock index not in file, file doesn't seem to include negative numbers):
    rock1      503,4 => -3,7 => 3,5
    rock2      2,5 => 7,0
    data format: 
                [
                  [{x:503,y:4},{x:-3,y:7},{x:3,y:5}],
                  [{x:2,y=5},{7,0}]
                ] 
    improvements:
    creating a mat without wasting space using max, min of x and y
*/
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
const { time } = require('console');
const { create } = require('domain');
var fs = require('fs');

function printMat(mat,width,height){
var string="";
for(var i=0;i<height;i++){
    for(var j=0;j<width;j++){
        string+=mat[i][j]+"";
    }
    string+="\n";        
}
console.log(string);
}

function printMatFile(fileName,mat,width,height){
    var string="";
    for(var i=0;i<height;i++){
        for(var j=0;j<width;j++){
            string+=mat[i][j]+"";
        }
        string+="\n";        
    }
    fs.writeFileSync(fileName,string);        
}

/* 
    return values
    null=sand out of bound
    {x:xval,y:yval}=sand resting Coord
*/
//Bijection algorithm https://www.cs.upc.edu/~alvarez/calculabilitat/enumerabilitat.pdf
//Gives unique hashcode of <a,b>. in this case <coord.x,coord.y> 
function coordHashCode(coord){ 
    return coord.x+(coord.y+(((coord.x+1)/2)*((coord.x+1)/2)));
}

function coordCmp(a,b){
    return coordHashCode(a)-coordHashCode(b);
}

function shiftCoordMat(mat,coordDiff){
    for(i=0;i<mat.length;i++){
        for(j=0;j<mat[i].length;j++){
            mat[i][j].x+=coordDiff.x;
            mat[i][j].y+=coordDiff.y;
        }
    }
}

function createMat(width,height){
    var mat = new Array(height);
    for(var i=0;i<mat.length;i++)
        mat[i]=new Array(width);
    return mat;
}

/* returns maxRockY */
function fillMat(mat,rockData,sandGenCoord,floorCoordY){

    //draw air
    for(var i=0;i<mat.length;i++)
        mat[i].fill(".");
    //draw sand gen point
    mat[sandGenCoord.y][sandGenCoord.x]="+";
    
    //draw floor
    mat[floorCoordY].fill("#");
    
    //draw stones, compute maxRockY
    var maxRockY=-1;
    for(rockNum=0;rockNum<rockData.length;rockNum++){
        var rockCoords=rockData[rockNum];
    
        for(coordNum=0;coordNum<rockData[rockNum].length-1;coordNum++){
            var start=rockCoords[coordNum];
            var end=rockCoords[coordNum+1];
    
            if(start.x==end.x){
                //rock moves vertically
                for(y=start.y;y<=end.y;y++){
                    //console.log("y "+y +" x "+x+ "cordx "+(rockCoords[coordNum].x+minMax.xMin)+" cordy "+(rockCoords[coordNum].y+minMax.yMin));
                    mat[y][start.x]="#";
                }
                for(y=start.y;y>=end.y;y--){
                    //console.log("y "+y +" x "+x+ "cordx "+(rockCoords[coordNum].x+minMax.xMin)+" cordy "+(rockCoords[coordNum].y+minMax.yMin));
                    mat[y][start.x]="#";
                }
                //rock only moves downwards, so end.y>start.y (because y is distance from the top)
                if(end.y>maxRockY)
                    maxRockY=end.y;
                if(start.y>maxRockY)
                    maxRockY=start.y;
            }
            else if(start.y==end.y){
                //rock moves orizontally on the right
                for(x=start.x;x<=end.x;x++){
                    mat[start.y][x]="#";
                }
                //or on the left
                for(x=start.x;x>=end.x;x--){
                    mat[start.y][x]="#";
                }
    
                if(start.y>maxRockY)
                    maxRockY=start.y;
            }
        }
    }
    return maxRockY;
    };

function simSandNextRestCoord(mat,sandGenCoord,maxRockY){
    var sandCoord={x:sandGenCoord.x,y:sandGenCoord.y};

    while(sandCoord.y<maxRockY){
        if(mat[sandCoord.y+1][sandCoord.x]==".")//down
            sandCoord.y++;
        else{ //if down is blocked
            
            if(mat[sandCoord.y+1][sandCoord.x-1]=="."){//down left
                sandCoord.y++;
                sandCoord.x--;
            }
            else if(mat[sandCoord.y+1][sandCoord.x+1]=="."){ //down right
                sandCoord.y++;
                sandCoord.x++;
            }
            //this is basically a messy way to not deal with out of bound indexes (to not deal with borders)
            else if((mat[sandCoord.y+1][sandCoord.x+1]=="o"||mat[sandCoord.y+1][sandCoord.x+1]=="#")
                    &&(mat[sandCoord.y+1][sandCoord.x-1]=="o"||mat[sandCoord.y+1][sandCoord.x-1]=="#"))
            { 
                //all 3 destinations are blocked, sand rests here
                return {x:sandCoord.x,y:sandCoord.y};
            }
            else //out of bound
                return null;

        }
    }
}
var file=fs.readFileSync("input.txt");

var lines=file.toString().split("\n");
var data=lines.slice(0,lines.length-1)
    .map(strLine=>strLine.split("->"))
    .map(strRockCoords=>
        strRockCoords.map(strRockCoord=>{
            var rockCoord=strRockCoord.trim().split(",");
            return {x:Number(rockCoord[0]),y:Number(rockCoord[1])};
            }
        )
    );

var sandGenCoord={x:500,y:0};
var minMax={xMin:sandGenCoord.x,xMax:sandGenCoord.x,yMin:sandGenCoord.y,yMax:sandGenCoord.y}; 
for(var rockNum=0;rockNum<data.length;rockNum++){
    for(var j=0;j<data[rockNum].length;j++){
        if(data[rockNum][j].x<minMax.xMin)
            minMax.xMin=data[rockNum][j].x;
        if(data[rockNum][j].x>minMax.xMax)
            minMax.xMax=data[rockNum][j].x;
        if(data[rockNum][j].y<minMax.yMin)
            minMax.yMin=data[rockNum][j].y;
        if(data[rockNum][j].y>minMax.yMax)
            minMax.yMax=data[rockNum][j].y;
    }
}

shiftCoordMat(data,{x:0-minMax.xMin,y:0-minMax.yMin});
sandGenCoord.x-=minMax.xMin;
sandGenCoord.y-=minMax.yMin;
console.log(minMax);

var height=minMax.yMax-minMax.yMin+1;
var heightInclFloor=height+2;
var width=minMax.xMax-minMax.xMin+1;
var floorCoordY=heightInclFloor-1;

//allocate mat
var mat=createMat(width,heightInclFloor);
var maxRockY=fillMat(mat,data,sandGenCoord,floorCoordY);
console.log("maxRockY: "+maxRockY);
var sandCounter1=0;
var sandCounter2=0;
var sandRestCoord;
//sim 1
while((sandRestCoord=simSandNextRestCoord(mat,sandGenCoord,maxRockY))!=null){
    mat[sandRestCoord.y][sandRestCoord.x]="o";
    sandCounter1++;
}
//printMatFile("visual.txt",mat,width,heightInclFloor);
//[{x:2,y:0},{x:-1,y:-1},{x:0,y:0},{x:0,y:2},{x:1,y:1}].forEach(coord=>console.log(coordHashCode(coord))); //hashcode test

var realWidth=width;
var width=500;
var midWidthPoint=Math.floor(width/2);
var diffX=midWidthPoint-sandGenCoord.x;
sandGenCoord.x+=diffX;
shiftCoordMat(data,{x:diffX,y:0});
mat=createMat(width,heightInclFloor);
maxRockY=fillMat(mat,data,sandGenCoord,floorCoordY);

//sim 2

while((sandRestCoord=simSandNextRestCoord(mat,sandGenCoord,floorCoordY))!=null 
        && coordCmp(sandRestCoord,sandGenCoord)!=0){
    mat[sandRestCoord.y][sandRestCoord.x]="o";
    sandCounter2++;
}

//printMatFile("visual.txt",mat,width,heightInclFloor);
console.log("Part 1 result is: "+sandCounter1);
console.log("Part 2 result is: "+(sandCounter2+1));
//condizione fine: sabbia cade nel vuoto -> sabbia.y == rockMinY