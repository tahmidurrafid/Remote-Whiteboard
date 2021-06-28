let Draw = function(canvas, ctx){
    this.init = {x : 0, y : 0};
    this.zoom = 1;
    this.res = 2;
    this.datas = {
        path : [],
        points : {
            width : 3,
            color : "#000",
            arr : [],
        },
        lineWidth : 3,
        dim : {width : 1000, height : 1000},
        grid : {row : 12, col : 1}
    };
    this.server = true;
    this.tool = "pencil";
    this.undos = [];
    this.redos = [];
    this.select = {
        from : {x:0, y:0},
        to : {x : -1, y:-1}
    };
    this.selected = [];
    this.clipBoard = [];
    this.undoDatas = [];
    this.moveFrom;

    this.distance = function (point1, point2){
        return Math.sqrt( (point2.pageX- point1.pageX)*(point2.pageX- point1.pageX) + 
                            (point2.pageY- point1.pageY)*(point2.pageY- point1.pageY) );
    }
    
    this.transform = function(point, usingRes = true){
        return {
            x : (point.x - this.init.x)*this.zoom* (usingRes ? this.res : 1),
            y : (point.y - this.init.y)*this.zoom* (usingRes ? this.res : 1)
        }
    }

    this.revTransform = function(point){
        return {
            x : (point.x + this.init.x*(this.zoom) )/(this.zoom),
            y : (point.y + this.init.y*(this.zoom) )/(this.zoom)
        }
    }

    this.intersect = function(p1, p2, p3, p4){
        var m1 = Infinity, m2 = Infinity;
        if(p1.x != p2.x) m1 = (p2.y - p1.y)/(p2.x - p1.x);
        if(p3.x != p4.x) m2 = (p4.y - p3.y)/(p4.x - p3.x);
        if(m1 == m2) return false;
        if(m1 == Infinity || m2 == Infinity){
            return false;
        }
        var x = ((p1.y - p3.y) - (p1.x*m1 - p3.x*m2) )/(m2-m1);
        
        if( (x >= min(p1.x, p2.x) && x <= max(p1.x, p2.x)) && 
        (x >= min(p3.x, p4.x) && x <= max(p3.x, p4.x)) ) return true;
        else return false;
    }

    this.pushUndo = function(action){
        this.undos.push(action);
        this.redos = [];
    }

    this.performUndo = function(){
        if(this.undos.length){
            let action = this.undos.pop();
            this.redos.push(this.reverseAction(action));
            this.performAction(action);
            this.redraw();
        }
    }

    this.performRedo = function(){
        if(this.redos.length){
            let action = this.redos.pop();
            this.undos.push(this.reverseAction(action));
            this.performAction(action);
            this.redraw();
        }
    }

    this.performAction = function(action){
        if(this.server){
            sendData(action);
        }
        if(action.type == "insert"){
            for(let i = action.datas.length-1; i >= 0; i--){
                this.pushPath(action.datas[i].path, action.datas[i].index);
            }
        }else if(action.type == "splice"){
            for(let i = action.datas.length-1; i >= 0; i--){
                this.splicePath(action.datas[i]);
            }
        }else if(action.type == "replace"){
            beginTransacion();
            for(let i = 0; i < action.datas.length; i++){
                let index = action.datas[i].index;
                this.datas.path[index] =  action.datas[i].path;
                runDDL(queries.deletePath(index+1));
                runDDL(queries.pushPath(action.datas[i].path , index+1));
            }
            endTransacion();
        }else if(action.type == "full"){
            this.datas = action.datas;
            beginTransacion();
            runDDL(queries.clearPage() );
            for(let i = 0; i < this.datas.path.length; i++){
                runDDL(queries.pushPath(this.datas.path[i], i+1));                
            }
            endTransacion();
        }

    }

    this.reverseAction = function(action){
        let ret = {type : "", datas : []};
        if(action.type == "insert"){
            ret.type = "splice";
            for(let i = action.datas.length-1; i >= 0; i--){
                ret.datas.push(action.datas[i].index);
            }
        }else if(action.type == "splice"){
            ret.type = "insert";
            for(let i = action.datas.length-1; i >= 0; i--){
                let index = action.datas[i];
                ret.datas.push({index : index, path : JSON.parse(JSON.stringify( this.datas.path[index] ))});
            }
        }else if(action.type == "replace"){
            ret.type = "replace";
            for(let i = action.datas.length-1; i >= 0; i--){
                let index = action.datas[i].index;
                ret.datas.push({index : index, path : JSON.parse(JSON.stringify( this.datas.path[index] ))});
            }
        }else if(action.type == "full"){
            ret.type = "full";
            ret.datas = JSON.parse(JSON.stringify(this.datas));
        }
        return ret;
    }

    this.pushPath = function(path = null, index = -1){
        if(!path){
            path = JSON.parse(JSON.stringify(this.datas.points) );
        }
        if(index == -1){
            this.datas.path.push( path );
            runDDL(queries.pushPath(path));
        }else{
            this.datas.path.splice( index, 0 , path );
            beginTransacion();
            runDDL(queries.shiftPath(index, 1, false));
            runDDL(queries.pushPath( path, index+1 ));
            endTransacion();
        }
    }

    this.splicePath = function(i){
        this.datas.path.splice(i, 1);
        beginTransacion();
        runDDL(queries.deletePath(i+1));
        runDDL(queries.shiftPath(i+1, 1));    
        endTransacion();
    }


    this.handleMove = function(){
        beginTransacion();
        for(let i = 0; i < this.selected.length; i++){
            if(this.selected[i]){
                runDDL(queries.deletePath(i+1));
                runDDL(queries.pushPath(this.datas.path[i] , i+1));
            }
        }
        endTransacion();
    }

    this.setStrokeWidth = function(width){
        ctx.lineWidth = width* this.zoom * this.res;
    }
    this.setStrokeColor = function(color){
        ctx.strokeStyle = color;
    }
    
    this.redraw = function(){
        $("canvas").css("transform", "matrix(1, 0, 0, 1, 0, 0)");
        ctx.clearRect(0, 0 , canvas.width, canvas.height);
        if(this.server){
            let gap = (this.datas.dim.height)/(this.datas.grid.row + 1);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#aaa";
            for(let i = 1; i <= this.datas.grid.row; i++){
                ctx.beginPath();
                let from = this.transform({x : 0, y : gap*i});            
                let to = this.transform({x : this.datas.dim.width, y : gap*i});            
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
            }
            gap = (this.datas.dim.width)/(this.datas.grid.col + 1);
            for(let i = 1; i <= this.datas.grid.col; i++){
                ctx.beginPath();
                let from = this.transform({x : gap*i, y : 0});            
                let to = this.transform({x : gap*i , y : this.datas.dim.height});            
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
            }    
        }

        for(var i = 0; i < this.datas.path.length; i++){
            this.setStrokeWidth(this.datas.path[i].width);
            this.setStrokeColor(this.datas.path[i].color);
            if(this.tool == "select" && this.selected.length > i && this.selected[i]){
                ctx.save();
                ctx.setLineDash([10*this.res, 10*this.res]);
            }
            ctx.beginPath();
            var point = this.transform(this.datas.path[i].arr[0]);
            ctx.moveTo(point.x, point.y);
            for(var j = 1; j < this.datas.path[i].arr.length; j++){
                var point = this.transform(this.datas.path[i].arr[j]);                    
                ctx.lineTo(point.x , point.y );
            }
            ctx.stroke();
            if(this.tool == "select" && this.selected.length > i && this.selected[i]){
                ctx.restore();                
            }

        }
        ctx.fillStyle = "#EEEEEE";        
        if(this.init.x < 0){
            var to = (-this.init.x)*(this.zoom*this.res);
            ctx.fillRect(0, 0, to, canvas.height);
        }
        if(this.init.y < 0){
            var to = (-this.init.y)*(this.zoom*this.res);
            ctx.fillRect(0, 0, canvas.width, to);
        }
        var from = this.transform({x : this.datas.dim.width, y : this.datas.dim.height});
        if( from.x < canvas.width ){
            ctx.fillRect(from.x, 0, canvas.width, canvas.height);
        }
        if( from.y < canvas.height){
            ctx.fillRect(0, from.y, canvas.width, canvas.height);
        }

        let st = (this.init.x/this.datas.dim.width);
        let en = (this.init.x + (canvas.width/(this.zoom*this.res))) /this.datas.dim.width;
        let steps = 5;
        let fontSize = 10*this.res;
        ctx.font = fontSize + "px Arial";   
        ctx.fillStyle = "#000";     
        for(let i = 0; i <= steps; i++){
            let pos = st + i*(en - st)/steps;
            pos = pos*100;
            let x = i*canvas.width/steps;
            let y = 20;
            ctx.fillText( Math.round(pos*10)/10 + "%", x, y);
        }
        if(this.select.to.x != -1 && this.tool == "select"){
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1*this.res;
            ctx.setLineDash([10*this.res, 10*this.res]);
            ctx.rect(this.select.from.x * this.res, this.select.from.y * this.res, 
                        (this.select.to.x - this.select.from.x) * this.res, 
                        (this.select.to.y - this.select.from.y) * this.res);            
            ctx.stroke();
            ctx.restore();
        }
    }
    
}

function max(a, b){ return a > b ? a : b;}
function min(a, b){ return a < b ? a : b;}


function memorySizeOf(obj) {
    var bytes = 0;

    function sizeOf(obj) {
        if(obj !== null && obj !== undefined) {
            switch(typeof obj) {
            case 'number':
                bytes += 8;
                break;
            case 'string':
                bytes += obj.length * 2;
                break;
            case 'boolean':
                bytes += 4;
                break;
            case 'object':
                var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                if(objClass === 'Object' || objClass === 'Array') {
                    for(var key in obj) {
                        if(!obj.hasOwnProperty(key)) continue;
                        sizeOf(obj[key]);
                    }
                } else bytes += obj.toString().length * 2;
                break;
            }
        }
        return bytes;
    };

    function formatByteSize(bytes) {
        if(bytes < 1024) return bytes + " bytes";
        else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
        else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
        else return(bytes / 1073741824).toFixed(3) + " GiB";
    };

    return formatByteSize(sizeOf(obj));
};
