'use strict';

let draw;
let reqestPending = false;
let pageNo = 1;
let into;

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

function getData(data){
    data = JSON.parse(data);
    if(data.type == "ip"){
        $(".address").html(data.data);

    }else if(data.type == "datas" ){
        if(draw.datas.points.arr.length == 0){
            sendData("clear", false);
            sendData({type : "full", datas : draw.datas});
        }else{
            reqestPending = true;
        }
    }
}

function checkNumber(a, b){
    let val = parseInt(a);
    if(isNaN(val) || val < 0) return b;
    return val; 
}

function insideRect(p1, p2, p){
    return (p.x <= max(p1.x, p2.x)) && (p.x >= min(p1.x, p2.x) ) &&
        (p.y <= max(p1.y, p2.y)) && (p.y >= min(p1.y, p2.y) );
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
        return "INSERT INTO " + name + " VALUES( " + pageNo + ", " + draw.datas.dim.width + 
                ", " + draw.datas.dim.height + "); ";
    },
    pushPath : function(path, pathNo = -1){
        if(pathNo == -1) pathNo = draw.datas.path.length;
        return "INSERT INTO WORKINGPATH VALUES( " + 
            pageNo + ", " + pathNo + ", " + 
            path.width + ", '" + path.color + "', '" + JSON.stringify(path.arr) + "'); "
    },
    deletePath : function(pathNo){
        return "DELETE FROM WORKINGPATH WHERE PATH_NO = " + pathNo + " AND PAGE_NO = " + pageNo;
    },
    clearPage : function(){
        return "DELETE FROM WORKINGPATH WHERE PAGE_NO = " + pageNo + " ;";
    },
    shiftPath : function(from , by, minus = true){
        return "UPDATE WORKINGPATH " +
            "SET PATH_NO = " + "PATH_NO" + (minus ? "-" : "+") 
            + by + " WHERE PAGE_NO = " + pageNo + " AND PATH_NO > " + from; 
    }
}

function initDim(){
    var dim = JSON.parse(runSQL("SELECT * FROM FILES WHERE NAME = 'working' ;"))[0];
    draw.datas.dim.width = parseInt( dim.WIDTH );
    draw.datas.dim.height = parseInt( dim.HEIGHT );
    draw.datas.grid.row = parseInt( dim.ROW );
    draw.datas.grid.col = parseInt( dim.COL );
}

function loadPage(no){
    $(".pageNo .no").html(no + "");
    draw.datas.path = [];
    draw.datas.points.arr = [];
    draw.undos = [];
    draw.redos = [];
    let datas = JSON.parse(runSQL("SELECT * FROM WORKINGPATH WHERE PAGE_NO = " + no + " ORDER BY PATH_NO") );
    for(let i = 0; i < datas.length; i++){
        draw.datas.path.push({
            width : parseFloat(datas[i].WIDTH),
            color : datas[i].COLOR,
            arr : JSON.parse(datas[i].PATH)
        });
    }
    draw.redraw();    
    runDDL("UPDATE SETTINGS SET PAGE_NO = " + no + " ;");
    sendData("clear", false);
    sendData({type : "full", datas : draw.datas});
}

function saveFile(name){
    let res = JSON.parse(runSQL("SELECT (ID+1) as 'VAL' FROM FILES  WHERE (ID+1) NOT IN(SELECT ID FROM FILES) ORDER BY ID ;"));
    let id = res[0].VAL;
    res = JSON.parse(runSQL("SELECT ID FROM FILES WHERE NAME = '" + name + "_FILE_' ;"));
    if(res.length){
        id = res[0].ID;
    }

    beginTransacion();
    runDDL(queries.pathTable("T" + id + "_PATH_"));
    runDDL("DELETE FROM FILES WHERE NAME = '" + name + "_FILE_' ; ");
    runDDL("INSERT INTO FILES VALUES( " + id + ",'" + name + "_FILE_', " + draw.datas.grid.row + ", " +  
        draw.datas.grid.col + ", " + draw.datas.dim.width + ", " + draw.datas.dim.height + ") ;" );
    runDDL("DELETE FROM T" + id + "_PATH_ ;");
    runDDL("INSERT INTO T" + id + "_PATH_ SELECT * FROM WORKINGPATH;");
    runDDL("UPDATE SETTINGS SET OPENED = '" + name + "' ;");
    endTransacion();
}

$(document).ready(function(){
    // $(window).on("load" , function(){
        let canvas = document.getElementById("stars");
        var ctx = canvas.getContext("2d");
        var strokeWidth = 1;
        var strokeColor = "#000";
        draw = new Draw(canvas, ctx);
        draw.server = true;
        draw.res = window.devicePixelRatio;
        var moving = false;
        var start, end;
        var prevPoint = {x : 0, y : 0};
        var tZoom = 1;
        var tPos = {x : 0, y : 0};

        try {
            runDDL(queries.filesTable());
            runDDL(queries.pathTable("WORKINGPATH"));
            runDDL("CREATE TABLE IF NOT EXISTS SETTINGS ( SHOW_ON_START INTEGER, OPENED TEXT, PAGE_NO INTEGER ) ");
            runDDL("CREATE INDEX IF NOT EXISTS sorted_path ON WORKINGPATH(PAGE_NO, PATH_NO);")
            if(JSON.parse(runSQL("SELECT * FROM SETTINGS")).length == 0 ){
                runDDL("INSERT INTO SETTINGS VALUES(1, '', 1)")
            }
            if(JSON.parse(runSQL("SELECT * FROM FILES")).length == 0 ){
                runDDL("INSERT INTO FILES VALUES(1 , 'working', 12, 1, 1200 , 1000 ) ; ");
            }
            // console.log(JSON.parse(runSQL("SELECT * FROM FILES")));
            // console.log(JSON.parse(runSQL("SELECT * FROM SETTINGS")));
            // console.log( runSQL("SELECT name FROM sqlite_master WHERE type='table' ") );            
            // console.log( JSON.parse(runSQL("SELECT * FROM WORKINGPATH")) );
            if(JSON.parse( runSQL("SELECT * FROM SETTINGS"))[0].SHOW_ON_START == "1"){
                $(".connectPC").show();
            }
            initDim();
            pageNo = parseInt(JSON.parse(runSQL("SELECT PAGE_NO FROM SETTINGS;"))[0].PAGE_NO);
            loadPage(pageNo);
            sendData("ip", false);
        }
        catch(err) {
        }

        $('#stars').on({ 'touchstart' : function(e){
            if(e.cancelable)
                e.preventDefault();
            var x = e.originalEvent.touches[0].pageX;
            var y = e.originalEvent.touches[0].pageY;
            start = e.originalEvent.touches;
            draw.setStrokeWidth(strokeWidth);
            draw.setStrokeColor(strokeColor);
            let point = draw.revTransform({x : x, y : y});
            point = {x : parseInt(point.x*100)/100, y : parseInt(point.y*100)/100};
            draw.datas.points.arr.push(point);            
            draw.datas.points.width = strokeWidth;
            draw.datas.points.color = strokeColor;
            draw.undoDatas = [];
            prevPoint = {x : x, y : y};
            if(draw.tool == "pencil"){
                ctx.beginPath();
                ctx.lineCap = "round";
                ctx.moveTo(x*draw.res, y*draw.res);
            }else if(draw.tool == "select"){
                if( (draw.selected.length && 
                insideRect(draw.select.from, draw.select.to, {x : x, y : y})) ||
                e.originalEvent.touches.length > 1){
                    if(e.originalEvent.touches.length == 1){
                        let toPush = {type : "replace", datas : []};
                        for(let i = 0; i < draw.selected.length; i++){
                            if(draw.selected[i] == true){
                                toPush.datas.push({index : i , path : JSON.parse(JSON.stringify(draw.datas.path[i]))});
                            }
                        }
                        if(toPush.datas.length){
                            draw.pushUndo(toPush);
                        }
                    }
                    draw.moveFrom = {x : x, y : y};
                    moving = true;
                }else{
                    draw.select.from.x = draw.select.to.x = x;
                    draw.select.from.y = draw.select.to.y = y;
                    moving = false;
                    draw.selected = [];
                }
            }
        }});
        
        $('#stars').on({ 'touchend' : function(e){
            if(draw.datas.points.arr.length && draw.tool == "pencil"){
                draw.pushUndo({type : "splice", datas : [draw.datas.path.length] })
                draw.pushPath();
                let index = draw.datas.path.length-1;
                sendData({type : "insert", datas : [{index : index, path : draw.datas.path[index]}] });
            }

            draw.datas.points.arr = [];
            if(draw.tool == "eraser" && draw.undoDatas.length){
                draw.pushUndo({type : "insert", datas : draw.undoDatas});
                draw.undoDatas = [];
            }

            if(draw.tool == "select" && !moving){
                draw.selected = [];
                let from = draw.revTransform(draw.select.from);
                let to = draw.revTransform(draw.select.to);

                for(let i = 0; i < draw.datas.path.length; i++){
                    let inside = false;
                    for(let j = 0; j < draw.datas.path[i].arr.length; j++){
                        if(insideRect(from, to ,draw.datas.path[i].arr[j])){
                            inside = true;                            
                            break;
                        }
                    }
                    draw.selected.push(inside);
                }
            }else if(draw.tool == "select" && moving){
                let toPush = {type : "replace", datas : []};
                for(let i = 0; i < draw.selected.length; i++){
                    if(draw.selected[i] == true){
                        toPush.datas.push({index : i , path : draw.datas.path[i] });
                    }
                }
                if(toPush.datas.length){
                    sendData(toPush);
                }
                draw.handleMove();
            }
            draw.redraw();
            tZoom = 1;
            tPos.x = tPos.y = 0;
            if(reqestPending){
                sendData("clear", false);
                sendData({type : "full", datas : draw.datas});    
                reqestPending = false;
            }
            return true;
        }});

        // $("body").on({ 'touchmove' : function(e){
        //     if(e.cancelable)
        //         e.preventDefault();
        // }});
        // $("body").on({ 'touchstart' : function(e){
        //     if(e.cancelable)
        //         e.preventDefault();
        // }});
        
        $('#stars').on({ 'touchmove' : function(e){

            if(e.cancelable)
                e.preventDefault();

            var x = e.originalEvent.touches[0].pageX;
            var y = e.originalEvent.touches[0].pageY;
            end = e.originalEvent.touches;
            if(e.originalEvent.touches.length == 1){
                if(draw.tool == "pencil"){
                    if(draw.datas.points.arr.length){
                        let point = draw.revTransform({x : x, y : y});
                        point = {x : parseInt(point.x*100)/100, y : parseInt(point.y*100)/100};
                        draw.datas.points.arr.push(point);
                        ctx.lineTo(x * draw.res, y * draw.res);
                        ctx.stroke();
                    }
                }else if(draw.tool == "eraser"){
                    let curPoint = {x : x , y : y};
                    for(let i = 0; i < draw.datas.path.length; i++){
                        let from =  draw.transform(draw.datas.path[i].arr[0], false);
                        for(let j = 1; j < draw.datas.path[i].arr.length; j++){
                            let to = draw.transform(draw.datas.path[i].arr[j], false);
                            if(draw.intersect(from, to, prevPoint, curPoint)){
                                draw.pushUndo({type : "insert", datas : 
                                    [{index : i, path :draw.datas.path[i]}]
                                });
                                draw.splicePath(i);
                                draw.redraw();
                                sendData({type : "splice", datas : [i] });
                                break;
                            }
                            from = to;
                        }
                    }
                    prevPoint = curPoint;
                }else if(draw.tool == "select"){
                    if(!moving){
                        draw.select.to.x = x;
                        draw.select.to.y = y;
                    }else{
                        let move = {x : (x - draw.moveFrom.x)/draw.zoom , y : (y - draw.moveFrom.y)/draw.zoom };
                        for(var i = 0; i < draw.datas.path.length; i++){
                            if(draw.selected[i]){
                                for(var j = 0; j < draw.datas.path[i].arr.length; j++){
                                    draw.datas.path[i].arr[j].x += move.x;
                                    draw.datas.path[i].arr[j].y += move.y;
                                }
                            }
                        }
                        draw.moveFrom = {x : x, y : y};
                        draw.select.from.x += move.x*draw.zoom;
                        draw.select.to.x += move.x*draw.zoom;
                        draw.select.from.y += move.y*draw.zoom;
                        draw.select.to.y += move.y*draw.zoom;
                    }
                    draw.redraw();
                }
            }else{
                draw.datas.points.arr = [];

                var move = {
                    x : ((end[1].pageX + end[0].pageX) - (start[0].pageX + start[1].pageX) )/2,
                    y : ((end[1].pageY + end[0].pageY) - (start[0].pageY + start[1].pageY) )/2
                }
                var center1 = {
                    x : ((start[1].pageX + start[0].pageX))/(2),
                    y : ((start[1].pageY + start[0].pageY))/(2)
                }
                var center2 = {
                    x : ((end[1].pageX + end[0].pageX))/(2),
                    y : ((end[1].pageY + end[0].pageY))/(2)
                }
                move.x = move.x/draw.zoom;
                move.y = move.y/draw.zoom;

                var times = draw.distance(end[0], end[1])/ draw.distance(start[0], start[1]);
                let z1 = draw.zoom;
                draw.zoom = draw.zoom*times;
                let z2 = draw.zoom;

                let init1 = JSON.parse(JSON.stringify(draw.init));

                draw.init.x = draw.init.x + center1.x/z1 - center2.x/z2;
                draw.init.y = draw.init.y + center1.y/z1 - center2.y/z2;

                tPos = { x: center2.x - times*(center1.x - tPos.x) , 
                         y: center2.y - times*(center1.y - tPos.y) }
                tZoom = tZoom*times;

                if(draw.tool == "select" && draw.select.to.x != -1){
                    changeDim(draw.select.from, z1, z2, init1, draw.init );
                    changeDim(draw.select.to, z1, z2, init1, draw.init );
                }

                $("canvas").css("transform", "matrix(" + tZoom + ", 0, 0, " + tZoom + ", " + tPos.x + ", " + tPos.y + ")");
                start = end;
            }
            return true;
        }});

        $("#nav .pencil").on("click", function(){
            draw.tool = "pencil";
            $(".selectOption").removeClass("show");
            draw.redraw();
        })

        $("#nav .eraser").on("click", function(){
            draw.tool = "eraser";
            $(".selectOption").removeClass("show");
            draw.redraw();
        })

        $("#nav .pencil-more").on("click", function(){
            $("#nav .pencil-more").toggleClass("selected");
            $("#nav .pencil-more").parent().toggleClass("selected");
        })

        $("#nav .pencil-sub .color").on('click' , function(e){
            $("#nav .pencil-sub .color").removeClass("taken");
            $(this).addClass("taken");
            strokeColor = $(this).attr("data-color");
        });

              
        $("#nav .pencil-sub .slider").on({ 'touchstart' : function(e){
            var x = e.originalEvent.touches[0].pageX;
            var offset = $(".slider").offset().left;
            var width = $(".slider").width();
            strokeWidth = 10*(x - offset)/width;
            if(strokeWidth > 10) strokeWidth = 10;
            if(strokeWidth < 1) strokeWidth = 1;
            strokeWidth = Math.round(strokeWidth*10)/10;
            $(".pencil-sub .slider .vert").css("left", (strokeWidth*10) + "%" );
            $(".pencil-sub .stroke").html(strokeWidth + "");
        } });

        $("#nav .pencil-sub .slider").on({ 'touchmove' : function(e){
            var x = e.originalEvent.touches[0].pageX;
            var offset = $(".slider").offset().left;
            var width = $(".slider .hori").width();
            strokeWidth = 10*(x - offset)/width;
            if(strokeWidth > 10) strokeWidth = 10;
            if(strokeWidth < 1) strokeWidth = 1;
            strokeWidth = Math.round(strokeWidth*10)/10;
            $(".pencil-sub .slider .vert").css("left", (strokeWidth*10) + "%" );
            $(".pencil-sub .stroke").html(strokeWidth + "");
        }});

        $("#nav .undo").on("click", function(){
            draw.performUndo();
        })

        $("#nav .redo").on("click", function(){
            draw.performRedo();
        })

        $(".connectPC .button a").on("click", function(){
            $(".connectPC").hide();
        })

        $("#nav .more").on("click", function(){
            $(this).toggleClass("selected");
            $(this).parent().toggleClass("selected");
        })

        $("#nav .clear").on("click", function(){
            draw.pushUndo({type : "full", datas : JSON.parse(JSON.stringify(draw.datas)) })
            draw.datas.path = [];
            draw.datas.points.arr = [];
            runDDL("DELETE FROM WORKINGPATH WHERE PAGE_NO = " + pageNo + " ; ");            
            draw.redraw();
            sendData("clear", false);
            sendData({type : "full", datas : draw.datas });
        })

        $("#nav .select").on("click", function(){
            draw.tool = "select"
            draw.selected = [];
            moving = false;
            draw.select.to.x = -1;
            $(".selectOption").addClass("show");
        })

        $(".major").on("click", function(){
            $(".major.selected").removeClass("selected");
            $(this).addClass("selected");
        })


        $(".selectOption .copy").on("click", function(){
            draw.clipBoard = [];
            for(let i = draw.selected.length-1; i >= 0; i--){
                if(draw.selected[i]){
                    draw.clipBoard.push(JSON.parse(JSON.stringify(draw.datas.path[i])));
                }
            }
        })

        $(".selectOption .cut").on("click", function(){
            draw.clipBoard = [];
            let toSend = [];
            for(let i = draw.selected.length-1; i >= 0; i--){
                if(draw.selected[i]){
                    draw.clipBoard.push(JSON.parse(JSON.stringify(draw.datas.path[i])));
                    draw.undoDatas.push({index : i, path : draw.datas.path[i]});
                    draw.splicePath(i);
                    toSend.push(i);
                }
            }
            draw.selected = [];
            draw.pushUndo({type : "insert", datas : draw.undoDatas});

            toSend.reverse();
            sendData({type : "splice", datas : toSend});
            draw.undoDatas = [];
            draw.redraw();
        })

        $(".selectOption .paste").on("click", function(){
            if(draw.clipBoard.length){
                var mn = {x : 1000000000, y : 1000000000};
                var mx = {x : -1000000000, y : -1000000000};
                for(let i = 0; i < draw.clipBoard.length; i++){
                    for(let j = 0; j < draw.clipBoard[i].arr.length; j++){
                        let point = draw.clipBoard[i].arr[j];
                        mn.x = min(mn.x, point.x), mn.y = min(mn.y, point.y);
                        mx.x = max(mx.x, point.x), mx.y = max(mx.y, point.y);
                    }
                }
                for(let i = 0; i < draw.clipBoard.length; i++){
                    for(let j = 0; j < draw.clipBoard[i].arr.length; j++){
                        let point = draw.clipBoard[i].arr[j];
                        point.x -= mn.x - draw.init.x-200, point.y -= mn.y - draw.init.y-50;
                    }
                }
                draw.selected = [];
                for(var i = 0; i < draw.datas.path.length; i++) draw.selected.push(false);
                let toSend = [];
                for(let i = 0; i < draw.clipBoard.length; i++){
                    draw.undoDatas.push(draw.datas.path.length);
                    draw.pushPath( JSON.parse( JSON.stringify( draw.clipBoard[i] ) ) );
                    toSend.push({index : draw.selected.length, path : draw.clipBoard[i]});                    
                    draw.selected.push(true);
                }
                draw.pushUndo({type : "splice", datas : draw.undoDatas});
                sendData({type : "insert", datas : toSend});
                draw.undoDatas = [];
                mx.x = (mx.x - mn.x) + draw.init.x+200, mx.y = (mx.y - mn.y) + draw.init.y+50;
                mn.x = draw.init.x+200, mn.y = draw.init.y+50;
                draw.select.from = draw.transform(mn, false);
                draw.select.to = draw.transform(mx, false);
                draw.redraw();
            }
        })

        $("#nav .settings").on("click", function(){
            $(".settings.popup").show();
            $(".overlay").show();
            $(".dimWidth").val(draw.datas.dim.width);
            $(".dimHeight").val(draw.datas.dim.height);
            $(".gridRow").val(draw.datas.grid.row);
            $(".gridCol").val(draw.datas.grid.col);
            let val = (JSON.parse(runSQL("SELECT SHOW_ON_START FROM SETTINGS"))[0].SHOW_ON_START == "1");
            $(".settings.popup .startPopup").prop("checked", val);
        });

        $(".settings.popup .button a").on("click", function(){
            $(".settings.popup").hide();
            $(".overlay").hide();
            draw.datas.dim.width = checkNumber($(".dimWidth").val(), draw.datas.dim.width);
            draw.datas.dim.height = checkNumber( $(".dimHeight").val(), draw.datas.dim.height);
            draw.datas.grid.row = checkNumber( $(".gridRow").val(), draw.datas.grid.row );
            draw.datas.grid.col = checkNumber( $(".gridCol").val(), draw.datas.grid.col );
            let val = $(".settings.popup .startPopup").prop("checked") ? 1 : 0;
            runDDL("UPDATE SETTINGS SET SHOW_ON_START = " + val + "; ");
            runDDL("UPDATE FILES SET WIDTH = " + draw.datas.dim.width + 
                    ", HEIGHT = " + draw.datas.dim.height + 
                    ", ROW = " + draw.datas.grid.row + 
                    ", COL = " + draw.datas.grid.col + " WHERE ID = 1")
            draw.redraw();
            sendData("clear", false);
            sendData({type : "full", datas : draw.datas});        
        })

        $("#nav .next").on("click", function(){
            pageNo++;
            draw.datas.path = [];
            draw.datas.points.arr = [];
            loadPage(pageNo);
            draw.redraw();
        })

        $("#nav .prev").on("click", function(){
            if(pageNo == 1) return;
            pageNo--;
            draw.datas.path = [];
            draw.datas.points.arr = [];
            loadPage(pageNo);
            draw.redraw();
        })

        $("#nav .new").on("click", function(){
            var currentFile = JSON.parse( runSQL("SELECT OPENED FROM SETTINGS; ") )[0].OPENED;
            if(currentFile != "")
                saveFile(currentFile);
            beginTransacion();
            runDDL("DELETE FROM WORKINGPATH ;");
            runDDL("UPDATE SETTINGS SET OPENED = '', PAGE_NO = 1;");
            endTransacion();
            pageNo = 1;
            initDim();
            loadPage(pageNo);

            draw.redraw();
        })

        $("#nav .save").on("click", function(){
            $(".saveDialog").show();
            $(".overlay").show();

        })
        $("#nav .open").on("click", function(){
            var data = JSON.parse(runSQL("SELECT NAME FROM FILES WHERE NAME LIKE '%_FILE_' ; "));
            $(".openDialog .list").html("");
            for(let i = 0; i < data.length; i++){
                var str = '<div class = "item"><div class = "name">' + data[i].NAME.substring(0, data[i].NAME.length - 6) + 
                '</div><div class = "options"><a href = "#" class = "open">OPEN</a><a href = "#" class = "delete">DELETE</a></div></div>';
                $(".openDialog .list").append(str);
            }
            $(".openDialog").show();
            $(".overlay").show();
        })

        $("#nav .pdf").on("click", function(){
            sendData("pdf", false);
        })

        $(".saveDialog .button a").on("click", function(){
            let name = $(".saveDialog .name input").val().trim();
            if(name.trim() == ""){
                $(".saveDialog .message").html("File name can not be empty!");
            }else{
                saveFile(name);
                $(".saveDialog").hide();            
                $(".overlay").hide();                
            }
        })

        $(".openDialog").on("click", ".delete", function(){
            if($(this).hasClass("warn")){
                var name = $(this).closest(".item").find(".name").html();
                var dim = JSON.parse( runSQL("SELECT * FROM FILES WHERE NAME  = '" + name + "_FILE_' ;") )[0];
                beginTransacion();
                runDDL("DROP TABLE T" + dim.ID + "_PATH_");
                runDDL("DELETE FROM FILES WHERE NAME = '" + name + "_FILE_' ; ");
                $(this).closest(".item").remove();
                endTransacion();                
            }else{
                $(this).addClass("warn");
                $(this).html("sure?");
            }
        })

        $(".openDialog").on("click", ".open", function(){
            var name = $(this).closest(".item").find(".name").html();

            var currentFile = JSON.parse( runSQL("SELECT OPENED FROM SETTINGS; ") )[0].OPENED;
            if(currentFile != "")
                saveFile(currentFile);
            var dim = JSON.parse( runSQL("SELECT * FROM FILES WHERE NAME  = '" + name + "_FILE_' ;") )[0];
            beginTransacion();
            runDDL("DELETE FROM WORKINGPATH ;");
            runDDL("INSERT INTO WORKINGPATH SELECT * FROM T" + dim.ID + "_PATH_ ;");
            runDDL("UPDATE SETTINGS SET OPENED = '" + name + "', PAGE_NO = 1;");
            runDDL("UPDATE FILES SET ROW = " + dim.ROW + ", COL = " + dim.COL + ", WIDTH = " + 
                dim.WIDTH + ", HEIGHT = " + dim.HEIGHT + " WHERE NAME = 'working'; ");
            endTransacion();
            pageNo = 1;
            initDim();
            loadPage(pageNo);
            $(".openDialog").hide();
            $(".overlay").hide();
        })
        
        $(".closeIt").on("click", function(e){
            $(this).parent().hide();            
            $(".overlay").hide();
        })

        $(document).on("click", "a" , function(e){
            e.preventDefault();
        })
        function resizeCanvas() {
            canvas.width = window.innerWidth * draw.res;
            canvas.height = window.innerHeight * draw.res;
            draw.redraw();
            let height = $("#nav>div").height();
            $("#nav>div").width(height + "px");
            $("#nav .sub-more .item").width(height + "px");
            $("#nav .sub-more .item").height(height + "px");

        }
        window.addEventListener('resize', resizeCanvas, false);        
        resizeCanvas();
    // })
})

function changeDim(point, z1, z2, init1, init2){
    let actual = { x : (point.x + init1.x*(z1) )/(z1),
                    y : (point.y + init1.y*(z1) )/(z1) } ;
    let changed = { x : (actual.x - init2.x)*z2 ,
                    y : (actual.y - init2.y)*z2 };
    point.x = changed.x;
    point.y = changed.y;
}

