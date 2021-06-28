(function($){
	$.fn.jTextEffect = function(options){
		'use strict';

		/**------------------ SETTING PARAMETERS ------------------**/
		
		var animTime = 10;
		var interval = 1000;
		var texts = new Array();
		var styles = new Array();
		var currentNews = -1;
		var totalNews = 1;
		var animationType = "type1"
		var intervalController;
		
		var type3Styles = 0;
		var type6Styles = 0;
		var type7Styles = 0;
		var cursorTime;
		var source = "jTextEffect ul.data>li";
		
		var typeStyles = 0;
		var functionOnceCalled = 0;
	
		function createClass(name,rules){

			var style = document.createElement('style');
			style.type = 'text/css';
			document.getElementsByTagName('head')[0].appendChild(style);

			if(!(style.sheet||{}).insertRule){

				(style.styleSheet || style.sheet).addRule(name, rules);
			}else{
//				style.sheet.insertRule("@keyframe bounce"+"{"+rules+"}",0);
				style.innerHTML += name +  "{"+rules+"}";
			}

		}

		
		var config = {};
		if(options){
			$.extend(config, options);
		}
		
		/**------------------ BEGIN FUNCTION BODY ------------------**/
		
		var selector = $(this);
		
		if(config.animationTime)
			animTime = parseInt(config.animationTime);			
		
		if(config.interval)
			interval = parseInt(config.interval);			
		
		if(config.animationType)
			animationType = config.animationType;
		
		if(config.textSource)
			source = config.textSource;

		/**------------------------------------------------  SETTING FUNCTIONS ------------------------------------------------- **/

		totalNews = $(source).length;
		
		for(var i = 0; i < totalNews; i++){
			texts[i] =  $(source).eq(i).html();
			styles[i] = $(source).eq(i).attr("data-anim");
		}
		
		selector.append("<div class = 'textContainer'></div>");
		
		function type1(){

			selector.find(".textContainer").html("");
			
			var length, str1, str2, addSpace = "";
			length = texts[currentNews].length;
			str1 = texts[currentNews].slice(0, length/2);
			str2 = texts[currentNews].slice(length/2, length);
			
			if(str1.charAt(str1.length -1) == " " || str2.charAt(0) == " "){
				addSpace = " ";
			}
			
			selector.find(".textContainer").append("<span class = 'str1'>" + str1 +  "</span>" + addSpace);
			selector.find(".textContainer").append("<span class = 'str2'>" + str2+ "</span>");
			
			selector.find(".textContainer").css({textAlign : 'center' , whiteSpace : 'nowrap'});
			
			selector.find(".textContainer .str1, .textContainer .str2").hide();
			
			var str1Width = selector.find(".textContainer .str1").width();
			var str2Width = selector.find(".textContainer .str2").width();
			
			selector.find(".textContainer .str1").css({textAlign : 'right', display : "inline-block", width : '0' ,  whiteSpace : 'nowrap' , overflow : 'hidden', verticalAlign  : 'top'});
			selector.find(".textContainer .str2").css({textAlign : 'left', display : "inline-block", width : '0' ,  whiteSpace : 'nowrap', overflow : 'hidden', verticalAlign  : 'top'});
			
			selector.find(".textContainer .str1").animate({width : str1Width + 'px'}, 
				{
					duration : animTime, 
					easing : 'easeOutQuart', 
					complete : function(){$(this).css("width", "auto")}
			});

			
			selector.find(".textContainer .str2").animate({width : str2Width + 'px'}, 
				{
					duration : animTime, 
					easing : 'easeOutQuart', 
					complete : function(){$(this).css("width", "auto")}
			});
			
		}
			
		function type2(){
			if(!selector.find(".textContainer .str1, .textContainer .str2").length){
							selector.find(".textContainer").html("");
							
							var length, str1, str2, addSpace = "";
							length = texts[currentNews].length;
							str1 = texts[currentNews].slice(0, length/2);
							str2 = texts[currentNews].slice(length/2, length);
							
							if(str1.charAt(str1.length -1) == " " || str2.charAt(0) == " "){
								addSpace = " ";
							}
							
							selector.find(".textContainer").append("<span class = 'str1'>" + str1 +  "</span>" + addSpace);
							selector.find(".textContainer").append("<span class = 'str2'>" + str2+ "</span>");
							
							selector.find(".textContainer").css({textAlign : 'center', whiteSpace : 'nowrap'});
							
							selector.find(".textContainer .str1, .textContainer .str2").hide();
							
							var str1Width = selector.find(".textContainer .str1").width();
							var str2Width = selector.find(".textContainer .str2").width();
							
							selector.find(".textContainer .str1").css({textAlign : 'right', display : "inline-block", width : '0',  whiteSpace : 'nowrap', overflow : 'hidden', verticalAlign  : 'top'});
							selector.find(".textContainer .str2").css({textAlign : 'left', display : "inline-block", width : '0',  whiteSpace : 'nowrap', overflow : 'hidden', verticalAlign  : 'top'});
							
							selector.find(".textContainer .str1").animate({width : str1Width + 'px'}, 
								{
									duration : animTime/2, 
									easing : 'easeOutQuart', 
									complete : function(){$(this).css("width", "auto")}
							});

							
							selector.find(".textContainer .str2").animate({width : str2Width + 'px'}, 
								{
									duration : animTime/2, 
									easing : 'easeOutQuart', 
									complete : function(){$(this).css("width", "auto")}
							});
			}else{
				selector.find(".textContainer .str1, .textContainer .str2").animate({width : '0px'}, 
					{
						duration : animTime/2, 
						easing : 'easeOutQuart', 
						complete : function(){
										
							selector.find(".textContainer").html("");
							
							var length, str1, str2, addSpace = "";
							length = texts[currentNews].length;
							str1 = texts[currentNews].slice(0, length/2);
							str2 = texts[currentNews].slice(length/2, length);
							
							if(str1.charAt(str1.length -1) == " " || str2.charAt(0) == " "){
								addSpace = " ";
							}
							
							selector.find(".textContainer").append("<span class = 'str1'>" + str1 +  "</span>" + addSpace);
							selector.find(".textContainer").append("<span class = 'str2'>" + str2+ "</span>");
							
							selector.find(".textContainer").css({textAlign : 'center', whiteSpace : 'nowrap'});
							
							selector.find(".textContainer .str1, .textContainer .str2").hide();
							
							var str1Width = selector.find(".textContainer .str1").width();
							var str2Width = selector.find(".textContainer .str2").width();
							
							selector.find(".textContainer .str1").css({textAlign : 'right', display : "inline-block", width : '0',  whiteSpace : 'nowrap', overflow : 'hidden', verticalAlign  : 'top'});
							selector.find(".textContainer .str2").css({textAlign : 'left', display : "inline-block", width : '0',  whiteSpace : 'nowrap', overflow : 'hidden', verticalAlign  : 'top'});
							
							selector.find(".textContainer .str1").animate({width : str1Width + 'px'}, 
								{
									duration : animTime/2, 
									easing : 'easeOutQuart', 
									complete : function(){$(this).css("width", "auto")}
							});

							
							selector.find(".textContainer .str2").animate({width : str2Width + 'px'}, 
								{
									duration : animTime/2, 
									easing : 'easeOutQuart', 
									complete : function(){$(this).css("width", "auto")}
							});

						}
				});
				
			}
			
		}

		function type3(){
			selector.find(".textContainer").html("");
			
			var length, str1, str2, addSpace = "";
			length = texts[currentNews].length;
		
			if(!type3Styles){
				createClass(".type3Hide.spansmall", "-webkit-transform : scale(0, 0);-ms-transform : scale(0, 0);transform : scale(0, 0);");
				createClass(".type3Temp2.type3Hide.spansmall", "-webkit-transform : scale(1, 1);-ms-transform : scale(1, 1);transform : scale(1, 1);");
			}
			
			for(var i = 0; i < length; i++){
				if(texts[currentNews].charAt(i) == " ")
					selector.find(".textContainer").append(" ");
				else
					selector.find(".textContainer").append("<span class = 'type3Hide spansmall'>" + texts[currentNews].charAt(i) + "</span>")
			}
			
			selector.find(".textContainer .spansmall").css({display : "inline-block", transition : ".3s"});
		

			for(var i = 0; i < length; i++){
				(function(index){
					setTimeout(function(){
						selector.find(".textContainer .spansmall").eq(index).addClass("type3Temp2");
					}, index*animTime/length)
				})(i)
			}			
			

		}
		
		function type4(){
			selector.find(".textContainer").html("");
			
			var length, str1, str2, addSpace = "";
			length = texts[currentNews].length;
					
			for(var i = 0; i < length; i++){
				if(texts[currentNews].charAt(i) == " ")
					selector.find(".textContainer").append(" ");
				else
					selector.find(".textContainer").append("<span class = 'spansmall'><span class = 'inners'>" + texts[currentNews].charAt(i) + "</span></span>")
			}
			
			selector.find(".textContainer .spansmall").css({display : "inline-block", transition : ".3s", position : 'relative', overflow : 'hidden', verticalAlign : 'top'});
			var tempHeight = selector.find(".textContainer .spansmall").height();
			selector.find(".textContainer .spansmall .inners:odd").css({display : "block", position : 'relative',  top : "-" +  tempHeight + "px", opacity : '0'});
			selector.find(".textContainer .spansmall .inners:even").css({display : "block", position : 'relative',  top :  tempHeight + "px", opacity : '0'});
		
			selector.find(".textContainer .spansmall .inners").animate({top : "0px", opacity : '1'}, animTime, "easeInOutQuint");

		
			for(var i = 0; i < length; i++){
				(function(index){
					setTimeout(function(){
						selector.find(".textContainer .spansmall").eq(index).addClass("type3Temp2");
					}, index*animTime/length)
				})(i)
			}			

		}
		
		function type5(){
			selector.find(".textContainer").html("");
			var randNum = new Array();
			var randomRange = 20;
			
			function recurseL(xL){
				if(xL.charCodeAt(0) == 65+25){
					return 'A';
				}else{
					return String.fromCharCode(xL.charCodeAt(0) + 1)
				}
			}
			
			var length, str1, str2, addSpace = "";
			length = texts[currentNews].length;
			
			for(var i = 0; i < length; i++){
				randNum[i] = parseInt(Math.random()*randomRange , 10);
				
				if(texts[currentNews].charAt(i) == " "){
					selector.find(".textContainer").append(" <span class = 'spansmall'></span>");
				}else{
					var rand = String.fromCharCode(65 + parseInt(Math.random()*25, 10));
					selector.find(".textContainer").append("<span class = 'spansmall'>" + rand + "</span>");
				}
			}

			for(var i = 0; i < randomRange; i++){	

				(function(count){
					setTimeout(
						function(){
							for(var j = 0; j < length; j++){
								if(randNum[j] && selector.find(".textContainer .spansmall").eq(j)){
									var tChar = recurseL(selector.find(".textContainer .spansmall").eq(j).html())
									selector.find(".textContainer .spansmall").eq(j).html(tChar);
									randNum[j]--;
								}else{
									selector.find(".textContainer .spansmall").eq(j).html(texts[currentNews].charAt(j));
								}
							}
						}, (animTime/randomRange)*count)
				})(i)

	
			}
		}

		function type6(){
			
			selector.find(".textContainer").html("");
			
			var length, str1, str2, addSpace = "";
			length = texts[currentNews].length;
			var charTime = new Array();
			
			if(!type6Styles){
				createClass(".type6hide.spansmall", "opacity : 0; -webkit-transform : scale(0, 0); -ms-transform : scale(0, 0); transform : scale(0, 0)");
				createClass(".type6show.spansmall", "opacity : 1; -webkit-transform : scale(1, 1); -ms-transform : scale(1, 1); transform : scale(1, 1)");
				createClass(".spansmall", "-webkit-transition : .4s; -o-transition : .4s; transition : .4s; display : inline-block;");
				type6Styles = 1;
			}
			
			for(var i = 0; i < length; i++){

				charTime[i] = parseInt(Math.random()*animTime/5, 10);
				
				if(texts[currentNews].charAt(i) == " "){
					selector.find(".textContainer").append(" <span class = 'spansmall type6hide'></span>");
				}else{
					selector.find(".textContainer").append("<span class = 'spansmall type6hide'>" + texts[currentNews].charAt(i) + "</span>");
				}
				
				(function(index){
					setTimeout(function(){	
						selector.find(".textContainer .spansmall").eq(index).removeClass("type6hide").addClass("type6show");
					}, charTime[i]);
				})(i)
			}	
		}
		
		function type7(){
			
			selector.find(".textContainer").html("");
			
			var length, str1, str2, addSpace = "";
			length = texts[currentNews].length;
			var charTime = new Array();
			
			if(!type7Styles){
				createClass(".type6hide.spansmall", "opacity : 0; -webkit-transform : rotate(360deg) scale(0, 0); -ms-transform : rotate(360deg) scale(0, 0); transform : rotate(360deg) scale(0, 0)");
				createClass(".type6show.spansmall", "opacity : 1; -webkit-transform : rotate(0deg) scale(1, 1); -ms-transform : rotate(0deg) scale(1, 1); transform : rotate(0deg) scale(1, 1)");
				createClass(".spansmall", "-webkit-transition : .4s; -o-transition : .4s; transition : .4s; display : inline-block;");
				type7Styles = 1;
			}
			
			for(var i = 0; i < length; i++){

				charTime[i] = parseInt(Math.random()*animTime/5, 10);
				
				if(texts[currentNews].charAt(i) == " "){
					selector.find(".textContainer").append(" <span class = 'spansmall type6hide'></span>");
				}else{
					selector.find(".textContainer").append("<span class = 'spansmall type6hide'>" + texts[currentNews].charAt(i) + "</span>");
				}
				
				(function(index){
					setTimeout(function(){	
						selector.find(".textContainer .spansmall").eq(index).removeClass("type6hide").addClass("type6show");
					}, charTime[i]);
				})(i)
			}	
		}
		
		function type8(){
			
			selector.find(".textContainer").html("");
			
			if(cursorTime)
				clearInterval(cursorTime);
			
			var length, str1, str2, addSpace = "";
			length = texts[currentNews].length;
			
			if(!typeStyles){
				createClass(".cursorT", "-webkit-transition : .2s;-o-transition : .2s;transition : .2s");
				createClass(".cHide", "opacity : 0");
				typeStyles = 1;
			}
			
			selector.find(".textContainer").append(" <span class = 'cursorT'>_</span>");
			
			cursorTime = setInterval(function(){
				selector.find(".textContainer .cursorT").toggleClass("cHide");
			}, 400);
			
			for(var i = 0; i < length; i++){
							
				(function(index){
					setTimeout(function(){	
						if(texts[currentNews].charAt(index) == " "){
							selector.find(".textContainer .cursorT").before(" <span class = 'spansmall'></span>");
						}else{
							selector.find(".textContainer .cursorT").before("<span class = 'spansmall'>" + texts[currentNews].charAt(index) + "</span>");
						}
					}, animTime*index/length);
				})(i)
			}	
		}		
		
		function type9(){
			
			selector.find(".textContainer").html("");
			
			var length, str1, str2, addSpace = "";
			length = texts[currentNews].length;
			
			if(cursorTime)
					clearInterval(cursorTime);

			
			if(!typeStyles){
				createClass(".cursorT", "-webkit-transition : .2s;-o-transition : .2s;transition : .2s");
				createClass(".cHide", "opacity : 0");
				typeStyles = 1;
			}
			
			selector.find(".textContainer").append(" <span class = 'cursorT'>|</span>");
			
			cursorTime = setInterval(function(){
				selector.find(".textContainer .cursorT").toggleClass("cHide");
			}, 400);
			
			for(var i = 0; i < length; i++){
							
				(function(index){
					setTimeout(function(){	
						if(texts[currentNews].charAt(index) == " "){
							selector.find(".textContainer .cursorT").before(" <span class = 'spansmall'></span>");
						}else{
							selector.find(".textContainer .cursorT").before("<span class = 'spansmall'>" + texts[currentNews].charAt(index) + "</span>");
						}
					}, animTime*index/length);
				})(i)
			}	
		}
		
		function type10(){
			
			selector.find(".textContainer").html("<span class = 'tempfill' style = 'opacity : 0'>A</span>");
			
			var length, str1, str2, addSpace = "";
			length = texts[currentNews].length;
	
			if(!typeStyles){

				typeStyles = 1;

				createClass("@-webkit-keyframes bounce", "from, 20%, 53%, 80%, to { -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); -webkit-transform: translate3d(0,0,0); transform: translate3d(0,0,0); } 40%, 43% { -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); -webkit-transform: translate3d(0, -30px, 0); transform: translate3d(0, -30px, 0); } 70% { -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); -webkit-transform: translate3d(0, -15px, 0); transform: translate3d(0, -15px, 0); } 90% { -webkit-transform: translate3d(0,-4px,0); transform: translate3d(0,-4px,0); }");
				createClass("@keyframes bounce", "from, 20%, 53%, 80%, to { -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); -webkit-transform: translate3d(0,0,0); transform: translate3d(0,0,0); } 40%, 43% { -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); -webkit-transform: translate3d(0, -30px, 0); transform: translate3d(0, -30px, 0); } 70% { -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); -webkit-transform: translate3d(0, -15px, 0); transform: translate3d(0, -15px, 0); } 90% { -webkit-transform: translate3d(0,-4px,0); transform: translate3d(0,-4px,0); }");
				createClass(".bounce", "-webkit-animation-name: bounce;  animation-name: bounce;  -webkit-transform-origin: center bottom;  -ms-transform-origin: center bottom;  transform-origin: center bottom");
				
				createClass("@-webkit-keyframes swing", " 20% { -webkit-transform: rotate3d(0, 0, 1, 15deg); transform: rotate3d(0, 0, 1, 15deg); } 40% { -webkit-transform: rotate3d(0, 0, 1, -10deg); transform: rotate3d(0, 0, 1, -10deg); } 60% { -webkit-transform: rotate3d(0, 0, 1, 5deg); transform: rotate3d(0, 0, 1, 5deg); } 80% { -webkit-transform: rotate3d(0, 0, 1, -5deg); transform: rotate3d(0, 0, 1, -5deg); } to { -webkit-transform: rotate3d(0, 0, 1, 0deg); transform: rotate3d(0, 0, 1, 0deg); }");
				createClass("@keyframes swing", " 20% { -webkit-transform: rotate3d(0, 0, 1, 15deg); transform: rotate3d(0, 0, 1, 15deg); } 40% { -webkit-transform: rotate3d(0, 0, 1, -10deg); transform: rotate3d(0, 0, 1, -10deg); } 60% { -webkit-transform: rotate3d(0, 0, 1, 5deg); transform: rotate3d(0, 0, 1, 5deg); } 80% { -webkit-transform: rotate3d(0, 0, 1, -5deg); transform: rotate3d(0, 0, 1, -5deg); } to { -webkit-transform: rotate3d(0, 0, 1, 0deg); transform: rotate3d(0, 0, 1, 0deg); }");
				createClass(".swing", "-webkit-transform-origin: top center;-ms-transform-origin: top center;transform-origin: top center;-webkit-animation-name: swing;animation-name: swing;");

				createClass("@-webkit-keyframes jello", " from, 11.1%, to { -webkit-transform: none; -ms-transform: none; transform: none; } 22.2% { -webkit-transform: skewX(-12.5deg) skewY(-12.5deg); -ms-transform: skewX(-12.5deg) skewY(-12.5deg); transform: skewX(-12.5deg) skewY(-12.5deg); } 33.3% { -webkit-transform: skewX(6.25deg) skewY(6.25deg); -ms-transform: skewX(6.25deg) skewY(6.25deg); transform: skewX(6.25deg) skewY(6.25deg); } 44.4% { -webkit-transform: skewX(-3.125deg) skewY(-3.125deg); -ms-transform: skewX(-3.125deg) skewY(-3.125deg); transform: skewX(-3.125deg) skewY(-3.125deg); } 55.5% { -webkit-transform: skewX(1.5625deg) skewY(1.5625deg); -ms-transform: skewX(1.5625deg) skewY(1.5625deg); transform: skewX(1.5625deg) skewY(1.5625deg); } 66.6% { -webkit-transform: skewX(-0.78125deg) skewY(-0.78125deg); -ms-transform: skewX(-0.78125deg) skewY(-0.78125deg); transform: skewX(-0.78125deg) skewY(-0.78125deg); } 77.7% { -webkit-transform: skewX(0.390625deg) skewY(0.390625deg); -ms-transform: skewX(0.390625deg) skewY(0.390625deg); transform: skewX(0.390625deg) skewY(0.390625deg); } 88.8% { -webkit-transform: skewX(-0.1953125deg) skewY(-0.1953125deg); -ms-transform: skewX(-0.1953125deg) skewY(-0.1953125deg); transform: skewX(-0.1953125deg) skewY(-0.1953125deg); }");
				createClass("@keyframes jello", " from, 11.1%, to { -webkit-transform: none; -ms-transform: none; transform: none; } 22.2% { -webkit-transform: skewX(-12.5deg) skewY(-12.5deg); -ms-transform: skewX(-12.5deg) skewY(-12.5deg); transform: skewX(-12.5deg) skewY(-12.5deg); } 33.3% { -webkit-transform: skewX(6.25deg) skewY(6.25deg); -ms-transform: skewX(6.25deg) skewY(6.25deg); transform: skewX(6.25deg) skewY(6.25deg); } 44.4% { -webkit-transform: skewX(-3.125deg) skewY(-3.125deg); -ms-transform: skewX(-3.125deg) skewY(-3.125deg); transform: skewX(-3.125deg) skewY(-3.125deg); } 55.5% { -webkit-transform: skewX(1.5625deg) skewY(1.5625deg); -ms-transform: skewX(1.5625deg) skewY(1.5625deg); transform: skewX(1.5625deg) skewY(1.5625deg); } 66.6% { -webkit-transform: skewX(-0.78125deg) skewY(-0.78125deg); -ms-transform: skewX(-0.78125deg) skewY(-0.78125deg); transform: skewX(-0.78125deg) skewY(-0.78125deg); } 77.7% { -webkit-transform: skewX(0.390625deg) skewY(0.390625deg); -ms-transform: skewX(0.390625deg) skewY(0.390625deg); transform: skewX(0.390625deg) skewY(0.390625deg); } 88.8% { -webkit-transform: skewX(-0.1953125deg) skewY(-0.1953125deg); -ms-transform: skewX(-0.1953125deg) skewY(-0.1953125deg); transform: skewX(-0.1953125deg) skewY(-0.1953125deg); }");
				createClass(".jello", "-webkit-animation-name: jello;animation-name: jello;-webkit-transform-origin: center;-ms-transform-origin: center;transform-origin: center;");

				createClass("@-webkit-keyframes bounceInRight ", " from, 60%, 75%, 90%, to { -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); } from { opacity: 0; -webkit-transform: translate3d(3000px, 0, 0); transform: translate3d(3000px, 0, 0); } 60% { opacity: 1; -webkit-transform: translate3d(-25px, 0, 0); transform: translate3d(-25px, 0, 0); } 75% { -webkit-transform: translate3d(10px, 0, 0); transform: translate3d(10px, 0, 0); } 90% { -webkit-transform: translate3d(-5px, 0, 0); transform: translate3d(-5px, 0, 0); } to { -webkit-transform: none; -ms-transform: none; transform: none; }");
				createClass("@keyframes bounceInRight ", " from, 60%, 75%, 90%, to { -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); } from { opacity: 0; -webkit-transform: translate3d(3000px, 0, 0); transform: translate3d(3000px, 0, 0); } 60% { opacity: 1; -webkit-transform: translate3d(-25px, 0, 0); transform: translate3d(-25px, 0, 0); } 75% { -webkit-transform: translate3d(10px, 0, 0); transform: translate3d(10px, 0, 0); } 90% { -webkit-transform: translate3d(-5px, 0, 0); transform: translate3d(-5px, 0, 0); } to { -webkit-transform: none; -ms-transform: none; transform: none; }");
				createClass(".bounceInRight ", "-webkit-animation-name: bounceInRight;animation-name: bounceInRight;");

				createClass(".animated", "-webkit-animation-duration: 1s;  animation-duration: 1s;  -webkit-animation-fill-mode: both;  animation-fill-mode: both;");
				
				createClass(".spansmall", "display : inline-block");
				
			}
			
			
			selector.find(".textContainer").css("overflow", "hidden");

			for(var i = 0; i < length; i++){

				(function(index){
					setTimeout(function(){	

						if(texts[currentNews].charAt(index) == " "){
							selector.find(".textContainer").append(" <span class = 'spansmall'> </span>");
						}else{
							selector.find(".textContainer").append("<span class = 'spansmall animated bounceInRight'>" + texts[currentNews].charAt(index) + "</span>");
						}
						selector.find(".textContainer .tempfill").remove();
					}, animTime*index/length);
				})(i)
			}	
		}
		
		function type11(){
			
			selector.find(".textContainer").html("<span class = 'tempfill' style = 'opacity : 0'>A</span>");
			
			var length, str1, str2, addSpace = "";
			length = texts[currentNews].length;
			
			if(!typeStyles){
				typeStyles = 1;
				createClass("@-webkit-keyframes bounce", "from, 20%, 53%, 80%, to { -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); -webkit-transform: translate3d(0,0,0); transform: translate3d(0,0,0); } 40%, 43% { -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); -webkit-transform: translate3d(0, -10px, 0); transform: translate3d(0, -10px, 0); } 70% { -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); -webkit-transform: translate3d(0, -5px, 0); transform: translate3d(0, -5px, 0); } 90% { -webkit-transform: translate3d(0,-2px,0); transform: translate3d(0,-2px,0); }");
				createClass("@keyframes bounce", "from, 20%, 53%, 80%, to { -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); -webkit-transform: translate3d(0,0,0); transform: translate3d(0,0,0); } 40%, 43% { -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); -webkit-transform: translate3d(0, -10px, 0); transform: translate3d(0, -10px, 0); } 70% { -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); -webkit-transform: translate3d(0, -5px, 0); transform: translate3d(0, -5px, 0); } 90% { -webkit-transform: translate3d(0,-2px,0); transform: translate3d(0,-2px,0); }");
				createClass(".bounce", "-webkit-animation-name: bounce;  animation-name: bounce;  -webkit-transform-origin: center bottom;  -ms-transform-origin: center bottom;  transform-origin: center bottom");
				
				createClass("@-webkit-keyframes swing", " 20% { -webkit-transform: rotate3d(0, 0, 1, 15deg); transform: rotate3d(0, 0, 1, 15deg); } 40% { -webkit-transform: rotate3d(0, 0, 1, -10deg); transform: rotate3d(0, 0, 1, -10deg); } 60% { -webkit-transform: rotate3d(0, 0, 1, 5deg); transform: rotate3d(0, 0, 1, 5deg); } 80% { -webkit-transform: rotate3d(0, 0, 1, -5deg); transform: rotate3d(0, 0, 1, -5deg); } to { -webkit-transform: rotate3d(0, 0, 1, 0deg); transform: rotate3d(0, 0, 1, 0deg); }");
				createClass("@keyframes swing", " 20% { -webkit-transform: rotate3d(0, 0, 1, 15deg); transform: rotate3d(0, 0, 1, 15deg); } 40% { -webkit-transform: rotate3d(0, 0, 1, -10deg); transform: rotate3d(0, 0, 1, -10deg); } 60% { -webkit-transform: rotate3d(0, 0, 1, 5deg); transform: rotate3d(0, 0, 1, 5deg); } 80% { -webkit-transform: rotate3d(0, 0, 1, -5deg); transform: rotate3d(0, 0, 1, -5deg); } to { -webkit-transform: rotate3d(0, 0, 1, 0deg); transform: rotate3d(0, 0, 1, 0deg); }");
				createClass(".swing", "-webkit-transform-origin: top center;-ms-transform-origin: top center;transform-origin: top center;-webkit-animation-name: swing;animation-name: swing;");

				createClass("@-webkit-keyframes pulse", "from {-webkit-transform: scale3d(1, 1, 1);transform: scale3d(1, 1, 1);}50% {-webkit-transform: scale3d(1.05, 1.05, 1.05);transform: scale3d(1.05, 1.05, 1.05);}to {-webkit-transform: scale3d(1, 1, 1);transform: scale3d(1, 1, 1);}");
				createClass("@keyframes pulse", "from {-webkit-transform: scale3d(1, 1, 1);transform: scale3d(1, 1, 1);}50% {-webkit-transform: scale3d(1.05, 1.05, 1.05);transform: scale3d(1.05, 1.05, 1.05);}to {-webkit-transform: scale3d(1, 1, 1);transform: scale3d(1, 1, 1);}");
				createClass(".pulse", " -webkit-animation-name: pulse;animation-name: pulse;");

				createClass(".animated", "-webkit-animation-duration: 1s;  animation-duration: 1s;  -webkit-animation-fill-mode: both;  animation-fill-mode: both;");
				
				createClass(".spansmall", "display : inline-block");
			}		

			for(var i = 0; i < length; i++){
							
				(function(index){
					setTimeout(function(){	
						if(texts[currentNews].charAt(index) == " "){
							selector.find(".textContainer").append(" <span class = 'spansmall'> </span>");
						}else{
							selector.find(".textContainer").append("<span class = 'spansmall animated bounce'>" + texts[currentNews].charAt(index) + "</span>");
						}
						selector.find(".textContainer .tempfill").remove();
					}, animTime*index/length);
				})(i)
			}	
		}

		function type12(){

			selector.find(".textContainer").html("<span class = 'tempfill' style = 'opacity : 0'>A</span>");
			selector.find(".textContainer .tempfill").remove();			
			var length, str1, str2, addSpace = "", tickerText = "", wid;
			
			length = texts[currentNews].length;
			
			if(!typeStyles){
				typeStyles = 1;

			}		
			
			selector.find(".textContainer").append("<div class = 'textContainerSlider'></div>");
			
			for(var i = 0; i < totalNews; i++){
				tickerText += "<span class = 'tickerText'>" + texts[i] + "</span>"
				if(!(i == totalNews - 1)){
					tickerText += "<span class = 't12space'>"
					for(var j = 0; j < 5; j++){
						tickerText += "&nbsp;"
					}
					tickerText += "</span>";
				}
			}
			
			
			selector.find(".textContainer .textContainerSlider").append(tickerText);
			
			selector.find(".textContainer").css({position: "relative", overflow : "hidden"});
			selector.find(".textContainer .textContainerSlider").css({position: "relative", whiteSpace : "nowrap", float : "left"});
			selector.find(".textContainer .textContainerSlider .textContainerText").css({position: "relative", display : "inline-block"});
			selector.find(".textContainer .textContainerSlider .t12space").css({position: "relative", display : "inline-block"});
			
			wid = selector.find(".textContainer .textContainerSlider").width();

			function t12Anim(){
				selector.find(".textContainer .textContainerSlider").animate({left: '-' + wid + "px"}, interval, "linear", function(){
					$(this).css("left", selector.find(".textContainer").width());
					t12Anim();
				});
			}
			
			t12Anim();
		}
		
		function type13(){
			
			function type13temp(){
				var length, str1, str2, addSpace = "", wid;
				length = texts[currentNews].length;
				
				if(!typeStyles){
					typeStyles = 1;

				}		
				
				selector.find(".textContainer").html("<span class = 'larText'>" + texts[currentNews] + "</span>");
				wid = selector.find(".textContainer .larText").width();
				selector.find(".textContainer .larText").css({display : 'block', width : '0', whiteSpace : 'nowrap'});
				
				selector.find(".textContainer .larText").animate({width : wid}, animTime/2, function(){$(this).css("width", "auto")});
			}
			if(selector.find(".textContainer .larText").length){
				selector.find(".textContainer .larText").animate({width : '0'}, animTime/2, function(){
					type13temp();
				});
			}else{
				type13temp();
			}
		}

		function type14(){
			
			selector.find(".textContainer").html("<span class = 'tempType' style = 'opacity : 0'>A</span>");
			
			var length, str1, str2, addSpace = "", max = 5;
			length = texts[currentNews].length;
			var charTime = new Array();
			
			if(!typeStyles){
				createClass(".spansmall.type14", "display : inline");
				typeStyles = 1;
			}
			
			for(var i = 0; i < length; i++){
				(function(index){
					setTimeout(function(){
						selector.find(".textContainer").append("<span class = 'spansmall type14'>" + "" + "</span>");
						
						for(var j = 0; j < max; j++){
							(function(ind, count){
								setTimeout(function(){
									selector.find(".textContainer .spansmall").eq(ind).html(String.fromCharCode( texts[currentNews].charCodeAt(ind) + (max - 1 - count) ));
									if(selector.find(".textContainer .tempType"))
										selector.find(".textContainer .tempType").remove();
								},  (animTime/length*2)*count/max);
							})(index, j)
						}
						
					}, animTime*index/length)
				})(i)
			}
			
			
			
		}
		
		function type15(){
			selector.find(".textContainer").html("<span class = 'tempType' style = 'opacity : 0'>A</span>");
			
			var length, str1, str2, addSpace = "", max = 5;
			length = texts[currentNews].length;
			var charTime = new Array();
			
			if(!typeStyles){
				createClass(".spansmall", "display : inline-block; -webkit-transition : .3s; -o-transition : .3s; transition : .3s;");
				createClass(".spansmall.initial", "-webkit-transform : scale(0, 0);-ms-transform : scale(0, 0);transform : scale(0, 0)");
				createClass(".spansmall.rotIt", "-webkit-transform : scale(1, 1);-ms-transform : scale(1, 1);transform : scale(1, 1)");
				var tempsec = 5*animTime/length/1000  + "s";
				createClass("@-webkit-keyframes rotIt", "from { -webkit-transform: rotate(0deg) scale(.5, .5); -ms-transform: rotate(0deg) scale(.5, .5); transform: rotate(0deg) scale(.5, .5); opacity :.50} to { -webkit-transform: rotate(720deg) scale(1, 1); -ms-transform: rotate(720deg) scale(1, 1); transform: rotate(720deg) scale(1, 1); opacity : 1}");
				createClass("@keyframes rotIt", "from { -webkit-transform: rotate(0deg) scale(.5, .5); -ms-transform: rotate(0deg) scale(.5, .5); transform: rotate(0deg) scale(.5, .5); opacity :.50} to { -webkit-transform: rotate(720deg) scale(1, 1); -ms-transform: rotate(720deg) scale(1, 1); transform: rotate(720deg) scale(1, 1); opacity : 1}");
				createClass(".rotIt", "-webkit-animation-name: rotIt; animation-name: rotIt; -webkit-animation-duration : " + tempsec + "; animation-duration : " + tempsec);
				

				typeStyles = 1;
			}
			
			for(var i = 0; i < length; i++){
				(function(index){
					setTimeout(function(){
						
						if(texts[currentNews].charAt(index) != " ")
							selector.find(".textContainer").append("<span class = 'spansmall rotIt'>" + texts[currentNews].charAt(index)+ "</span>");
						else
							selector.find(".textContainer").append(" <span class = 'spansmall rotIt'>" + texts[currentNews].charAt(index)+ "</span>");							
						
						if(selector.find(".textContainer .tempType"))
							selector.find(".textContainer .tempType").remove();
					}, animTime/length*index)
				})(i)

			}
		}
		
		function changeNews(){
			currentNews++;
			
			if(currentNews == totalNews)
				currentNews = 0;
			
			animationType = styles[currentNews];
			
			type3Styles = 0;
			type6Styles = 0;
			type7Styles = 0;
			
			typeStyles = 0;
			functionOnceCalled = 0;
			
			selector.find(".textContainer").removeAttr('style');
			
			switch(animationType){
				case "type1" :
					type1();
					break;
				case "type2" :
					type2();
					break;
				case "type3" :
					type3();
					break;
				case "type4" :
					type4();
					break;
				case "type5" :
					type5();
					break;
				case "type6" :
					type6();
					break;
				case "type7" :
					type7();
					break;
				case "type8" :
					type8();
					break;
				case "type9" :
					type9();
					break;
				case "type10" :
					type10();
					break;
				case "type11" :
					type11();
					break;
				case "type12" :
					if(!functionOnceCalled)
						type12();
					functionOnceCalled = 1;
					break;
				case "type13" :
					type13();
					break;
				case "type14" :
					type14();
					break;
				case "type15" :
					type15();
					break;
			}
		}
		
		changeNews();

		if(interval)
			intervalController = setInterval(changeNews, interval);
		
	}
	
})(jQuery)