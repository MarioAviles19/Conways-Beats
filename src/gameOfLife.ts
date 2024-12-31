type vector2 = {x : number, y : number};


export class GameOfLife{
    
    static offsets = [
        // up     
        {x: 0, y: -1},
        // down   
        {x: 0, y: 1},
        // left 
        {x: -1, y: 0},
        // right 
        {x: 1, y: 0},
        //  up left
        {x: -1, y: -1},
        // up right
        {x: 1, y: -1},
        // down left
        {x: -1, y: 1},
        // down right
        {x: 1, y: 1},
    ]
    
    dimensions = {x: 0, y: 0};
    grid : boolean[][] = [];
    nextPos : boolean[][] = [];
    lockedPositions : vector2[] = []
    
    constructor(dimensions : vector2){
        this.dimensions = dimensions
    }
    
    /**
    * SetPosition
    */
    public SetPosition(arr : vector2[]) {
        this.grid = [];
        arr.forEach(vec=>{
            if(!this.grid[vec.x]){
                this.grid[vec.x] = []
            }
            this.grid[vec.x][vec.y] = true;
        })
    }
    public GetPosition(){
        return this.grid
    }
    public ExportPosition(){
        let binary = ""
        for(let x = 0; x < this.dimensions.x; x++){
            for(let y = 0; y < this.dimensions.y; y++){

                if(this.grid[x]?.[y]){
                    binary += "1"
                } else{
                    binary +="0"
                }
            }
        }
        return parseInt(binary, 2).toString(16)
    }
    public AdvancePosition(){
        
        this.grid = this.PeekNextPosition();
        
        
    }
    
    public PeekNextPosition(){
        this.nextPos = [];
        let potentialNewborns : vector2[] = [];
        //Loop over each element to determine which existing cells will live or die
        for (let x = 0; x < this.grid.length; x++) {
            if(!this.grid[x]){
                this.grid[x] = [];
            }
            for (let y = 0; y < this.grid[x].length; y++) {
                if(!this.grid[x][y]){
                    //We will calculate Reproduction, later
                    continue
                }
                //Get the number of pieces surrounding
                const surroundingInfo = this.GetSurroundingPieces(x, y)
                potentialNewborns = [...potentialNewborns, ...surroundingInfo.empties]
                
                //If the current square is locked, apply the 
                
                //If the position is locked, don't change the position
                if(this.lockedPositions.some(val=>{return (val.x == y && val.y == x)})){
                    if(!this.nextPos[x]){
                        this.nextPos[x] = [];
                    }
                    this.nextPos[x][y] = this.grid[x][y];
                    continue;
                }
                
                
                //If there are two or three neighbors, the cell survives
                if(surroundingInfo.count === 2 || surroundingInfo.count === 3){
                    if(!this.nextPos[x]){
                        this.nextPos[x] = [];
                    }
                    this.nextPos[x][y] = true;
                } 
            }
        }
        //Loop over all adjacent pieces to determine birth
        potentialNewborns.forEach(vec=>{
            
            //If the position is locked, don't change the position
            if(this.lockedPositions.some(val=>{return (val.x == vec.y && val.y == vec.x)})){
                if(!this.nextPos[vec.x]){
                    this.nextPos[vec.x] = [];
                }
                this.nextPos[vec.x][vec.y] = this.grid[vec.x][vec.y];
                return;
            }
            
            
            const {count} = this.GetSurroundingPieces(vec.x, vec.y);
            
            if(count === 3){
                if(!this.nextPos[vec.x]){
                    this.nextPos[vec.x] = [];
                }
                
                this.nextPos[vec.x][vec.y] = true;
            }
        })
        return this.nextPos;
    }
    GetSurroundingPieces(x : number, y : number){
        let numAround = 0;
        let rejects : vector2[] = []
        GameOfLife.offsets.forEach(offset=>{
            
            if(x + offset.x > this.dimensions.x - 1 || y + offset.y > this.dimensions.y - 1){
                return;
            }
            if(x + offset.x < 0 || y + offset.y < 0){
                return
            }
            
            if(this.grid[x + offset.x]?.[y + offset.y]){
                numAround++;
            } else{
                rejects.push({x : x + offset.x, y : y + offset.y})
            }
        })
        
        return {count : numAround, empties : rejects};
    }

    
}