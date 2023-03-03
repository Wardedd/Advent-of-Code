class File{
    /* type, name, size, subdir */
    constructor (type,name,size=0,parent=null){
        this.type=type;
        this.name=name;
        this.size=size;
        this.parent=parent;

        if(type==="d")
            this.internalFiles=new Map(); /* if directory, start files hashMap */
        else
            this.internalFiles=null;
    }
}

var fs = require('fs');
const { isBuffer } = require('util');

/* retrieve data from "input" */
var data=fs.readFileSync("input");
array=data.toString().split("\n");

/* organize data into "root" */
var root=new File("d","/",0,null);
var currDir=root;

for(let line of array) {    
    
    //console.log("######################################################"+line);
    let split=line.split(" ");

    if(split.length>=2){

        if(split[1]==="cd"){
            if(split[2]==="/"){

                currDir=root;
            }
            else if(split[2]!==".."){

                let newDirName=split[2];
                let newDir=currDir.internalFiles.get(newDirName);

                if(newDir==null){/* if dir wasn't found */
                    newDir=new File("d",newDirName,0,currDir);
                    currDir.internalFiles.set(newDirName,newDir);
                }
                currDir=newDir;
            }

            else{
                currDir=currDir.parent;
            }
        }
        else if(split[1]==="ls"){
            
        }
        else if(split[0]==="dir"){
            let newDirName=split[1];
            let newDir=currDir.internalFiles.get(newDirName);

            if(newDir==null){/* if dir wasn't found */
                newDir=new File("d",newDirName,0,currDir);
                currDir.internalFiles.set(newDirName,newDir);
            }
            
        }
        else if(!isNaN(split[0])){
            /* check if its a number */
            let newFileName=split[1];
            let size=Number(split[0]);
            let newFile=currDir.internalFiles.get(newFileName);

            if(newFile==null){/* if file wasn't found */

                newFile=new File("f",newFileName,size,currDir);
                currDir.internalFiles.set(newFileName,newFile);
                

            }
        }
        else{
            console.log("Parsing error on this line: "+line+".");
        }
    }

}  
/* calculate dir size */
function computeDirSizesR(file){
    if(file.type==="d"){
        //console.log("a");
        file.size=0;
        for(let [subFileName, subFile] of file.internalFiles){
            file.size+=computeDirSizesR(subFile);
        }
    }
    return file.size;
}

computeDirSizesR(root);
/*
console.log("-----------------");
console.log(root);
console.log(root.internalFiles.get("a"));
console.log(root.internalFiles.get("a").internalFiles.get("e"));
console.log(root.internalFiles.get("d"));
console.log("-----------------");*/


/* sum all dirs less than 100000*/
function sumAllDirsLessThanNum(file,num){
    let val=0;
    if(file.type==="d"){
        for(let [subFileName, subFile] of file.internalFiles){
            val+=sumAllDirsLessThanNum(subFile,num);
        }
    }
    if(file.type==="d" && file.size<=num)
        val+=file.size;
    return val;
}
console.log(sumAllDirsLessThanNum(root,100000));


var diskSize=70000000;
var memForUpdate=30000000;
var currStorageSize=root.size;
var memCurrAvailable=diskSize-currStorageSize;
var memNeededForUpdate=memForUpdate-memCurrAvailable;

function searchSmallestEligibleDirSize(file,memNeededForUpdate){
    let currMin=root.size;
    if(file.type==="d"){
        for(let [subFileName, subFile] of file.internalFiles){
            if(subFile.type==="d"){
                if(subFile.size>memNeededForUpdate){
                    /* elegible to be deleted */
                        if(subFile.size-memNeededForUpdate<currMin-memNeededForUpdate)
                            currMin=subFile.size;
                }
                /* ask that dir if it has an even better directory */
                let tmpMin=searchSmallestEligibleDirSize(subFile,memNeededForUpdate);
                if(tmpMin-memNeededForUpdate<currMin-memNeededForUpdate)
                    currMin=tmpMin;
            }
        }
    }else{
        return -1;
    }
    return currMin;
}

if(memForUpdate>0){
    /* we need to find mem */
    console.log(searchSmallestEligibleDirSize(root,memNeededForUpdate));
}