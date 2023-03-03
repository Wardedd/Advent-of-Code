var fs = require('fs');

function isNumber(obj){
    return typeof obj ==="number";
}

class PacketUtil{

    /* 
        return values:
        0 = pairs are the same
        1 = right order
        -1 = wrong order 
    */
    static checkPairOrder(packet1,packet2){

        for(var i=0;i<packet1.length;i++){
            var currLeftItem = packet1[i];
            var currRightItem = packet2[i];
            var tmpRes;
            if(currLeftItem!=null&&currRightItem==null) // packet2.length<packet1.length, no difference found yet => bad order
                return -1;
            if(isNumber(currLeftItem)&&isNumber(currRightItem)){
                if(currLeftItem<currRightItem)
                    return 1;
                else if(currLeftItem>currRightItem)
                    return -1;
                else  continue;
            }

            if(isNumber(currLeftItem)){
                currLeftItem=[currLeftItem];
            }
            if(isNumber(currRightItem)){
                currRightItem=[currRightItem];
            }
            /*now currLeftItem and currRightItem are 2 lists*/
            tmpRes=PacketUtil.checkPairOrder(currLeftItem,currRightItem);
            if(tmpRes!=0)
                return tmpRes;
        }
        if(packet1.length==packet2.length){
            return 0;
        }
        // packet2.length>packet1.length, no difference found yet => good order
        return 1;
    }


    parsePacketLog(string){
        if(string[0]!='[')
            return null;
        this.counter=1;
        return this.parsePacketLog_r(string);    
    }

    //each recursive step handles an array [1,2,3,...]
    //at the start of each parseData, this.counter is at pos "[" of the arr being handled + 1 
    parsePacketLog_r(string){ 
        var objectData = new Array(0);

        while(this.counter<string.length){
            var char = string[this.counter];
            
            switch(char){
                case '[':
                    this.counter++;
                    objectData.push(this.parsePacketLog_r(string));
                    break;

                case ']':
                    this.counter++;
                    return objectData;

                case ',':
                    this.counter++;
                    break;

                default:
                    var tmpStringNumber=char+""; //make char a string                        
                    this.counter++;
                    char=string[this.counter];

                    while(char!=']'&&char!=','){
                        tmpStringNumber+=char; //should be a number
                        this.counter++;
                        char=string[this.counter];
                    }                       
                    if(isNaN(tmpStringNumber))
                        console.log("Error during number parsing");
                    else
                        objectData.push(Number(tmpStringNumber));

                    break;
            }
        }
        console.log("Error during parsing, no final ] found");
        return objectData;
    }
}

// retrieve data from "input"
var data=fs.readFileSync("input.txt");
data=data.toString().split("\n");

var parser=new PacketUtil();
var packets=[];
var goodIndexSum=0;
for(var i=0;i<data.length/3;i++){ //line i*3+0=first, line i*3+1=second, line i*3+2=empty line 
    packets.push({first:parser.parsePacketLog(data[i*3+0]),second:parser.parsePacketLog(data[i*3+1])});
}

for(var i=0;i<packets.length;i++){
    let res=PacketUtil.checkPairOrder(packets[i].first,packets[i].second);
    if(res==true)
        goodIndexSum+=i+1;
}

//part2
var flatPackets = packets.reduce(
    (accumulator,item)=>{accumulator.push(item.first);accumulator.push(item.second); return accumulator},
    new Array(0));
var div1=[[2]];
var div2=[[6]];
flatPackets.push(div1);
flatPackets.push(div2);
flatPackets.sort(PacketUtil.checkPairOrder);
flatPackets.reverse();
div1Index=1+
    flatPackets.findIndex(element=>PacketUtil.checkPairOrder(div1,element)==0)
div2Index=1+
    flatPackets.findIndex(element=>PacketUtil.checkPairOrder(div2,element)==0);

console.log("Result of first part is: "+goodIndexSum);
console.log("Result of second part is: "+div1Index*div2Index);
