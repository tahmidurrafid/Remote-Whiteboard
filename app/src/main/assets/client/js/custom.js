'use strict';

$(document).ready(function(){
    // $(window).on("on" ,function(){
        async function startToWait(){
            var url = "my.json"
            try{
                let response = await fetch(url);
                if (response.ok) {
                    let json = await response.json();
                    processData(json);
                }
            }catch(err){
            }
            startToWait();
        }
        async function sendData(data){
            const rawResponse = await fetch('/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const content = await rawResponse.json();
        }

        let canvas = document.getElementById("stars");
        var ctx = canvas.getContext("2d");
        let draw = new Draw(canvas, ctx);
        draw.server = false;
//        draw.res = window.devicePixelRatio;
        draw.res = 1;
        ctx.lineCap = "round";
        startToWait();

        function processData(data){
            if(data.type == "empty") return;
            // console.log(data);
            draw.performAction(data);
            if(data.type == "full"){
                if(canvas.width != draw.datas.dim.width || canvas.height != draw.datas.dim.height ){
                    resizeCanvas();
                }                
            }
            draw.redraw();

            if(data.type == "datas"){
                draw.datas = data.data;
                draw.redraw();
                if(canvas.width != draw.datas.dim.width || canvas.height != draw.datas.dim.height ){
                    resizeCanvas();
                }
            }else if(data.type == "point"){
                draw.datas.points.arr.push( data.data );
                draw.datas.points.color = data.data.color;
                draw.datas.points.width = data.data.width;
                var point = draw.transform(data.data.point);
                if(draw.datas.points.arr.length == 1){                                        
                    ctx.beginPath();
                    ctx.lineWidth = draw.datas.points.width;
                    ctx.strokeStyle = draw.datas.points.color;
                    ctx.moveTo(point.x, point.y);
                }
                ctx.lineTo(point.x, point.y);
                ctx.stroke();                
            }else if(data.type == "pushToPath"){
                draw.datas.path.push( JSON.parse(JSON.stringify(data.data)) );
                ctx.beginPath();
                ctx.lineWidth = data.data.width;
                ctx.strokeStyle = data.data.color;
                let point = draw.transform(data.data.arr[0]);
                ctx.moveTo(point.x, point.y);
                for(let i = 1; i < data.data.arr.length; i++){
                    point = draw.transform(data.data.arr[i]);
                    ctx.lineTo(point.x, point.y);                    
                }
                ctx.stroke();
            }else if(data.type == "clearPoints"){
            }
        }

        window.addEventListener('resize', resizeCanvas, false);
        function resizeCanvas() {
            canvas.width = draw.datas.dim.width * draw.res;
            canvas.height = draw.datas.dim.height * draw.res;
            draw.redraw();
        }
        resizeCanvas();
        sendData({type : "datas"});        
    // })
})


function sendData(data, isJson = true) {
    if(typeof Android !== "undefined" && Android !== null) {
        Android.storeInQueue(isJson? JSON.stringify(data) : data);
    }
}

function runSQL(query){
    if(typeof Android !== "undefined" && Android !== null) {
        return Android.runSQL(query);
    }
    return "";
}

function runDDL(query){
    if(typeof Android !== "undefined" && Android !== null) {
        Android.runDDL(query);
    }
}

function beginTransacion(){
    if(typeof Android !== "undefined" && Android !== null) {
        Android.beginTransaction();
    }
}

function endTransacion(){
    if(typeof Android !== "undefined" && Android !== null) {
        Android.successfulTransaction();
        Android.endTransaction();
    }
}

var queries = {
    filesTable : function(){
        return "CREATE TABLE IF NOT EXISTS " + "FILES" + " ( " +
        "ID INTEGER, " + 
        "NAME TEXT PRIMARY KEY, " +
        "ROW INTEGER, " +
        "COL INTEGER, " +
        "WIDTH INTEGER, " +
        "HEIGHT INTEGER );";
    },
    pathTable : function(name){
        return "CREATE TABLE IF NOT EXISTS " + name + " ( " +
        "PAGE_NO INTEGER, " +
        "PATH_NO INTEGER, " +
        "WIDTH REAL, " +
        "COLOR TEXT, " +
        "PATH TEXT " +
        " );";
    },
    blankPage : function(name){
        return "";
    },
    pushPath : function(path, pathNo = -1){
        return "";        
    },
    deletePath : function(pathNo){
        return "";
    },
    clearPage : function(){
        return "";
    },
    shiftPath : function(from , by, minus = true){
        return "";
    }
}
