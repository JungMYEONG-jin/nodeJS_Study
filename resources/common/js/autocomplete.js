 

let autocomplete = (function(){

 let _inp = null;

 let _arr = [];

 let _currentFocus;

 

 let _setAutocomplete = function (inp, arr){

  _arr = arr;

  if(_inp === inp){

   return;

  }

  _removeListener();

  

  _inp = inp;

  _inp.addEventListener("input", inputEvent);

  _inp.addEventListener("keydown", keydownEvent);

 };

 

 let inputEvent = function (e) { 

  var a, b, i, val = this.value; 

  // 이전 생성된 div 제거

  closeAllLists(); 

  // 요소 확인

  if (!val) { 

   return false; 

   

  } 

  // 현재의 포커스의 위치는 없음.

  _currentFocus = -1; 

  // autocomplet에서 항목을 보여줄 div 생성

  a = document.createElement("DIV"); 

  // 

  a.setAttribute("id", this.id + "autocomplete-list");
  // css 적용

  a.setAttribute("class", "autocomplete-items");

  var titleNm = $("#nt_list_all").children().attr("title");
  var nWidth = "";
  var nLeft = "";

  if(titleNm == "ppt"){
	  nWidth = "149px";
	  nLeft = "37.1%";
  }else if(titleNm == "mppt"){
	  nWidth = "149px";
	  nLeft = "50.4%";
  }else{
	  nWidth = "181px";
	  nLeft = "49%";
  }

  a.style.width = nWidth;
  a.style.left = nLeft;
  
// input 아래의 div 붙이기.

  this.parentNode.appendChild(a); 

  // autocomplet할 요소 찾기

  var cnt = 0;
  
  for (i = 0; i < _arr.length; i++) { 

   // 배열의 요소를 현재 input의 value의 값만큼 자른 후, 같으면 추가한다.

   if (_arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) { 

    b = document.createElement("DIV"); 
    b.setAttribute("id", "ntNum_"+cnt);
    b.setAttribute("value", $("#nt_"+i).attr("value"));
    b.setAttribute("onclick", "setNtInput('t')");
    // value의 값 만큼 굵게 표시
    
    b.innerHTML += _arr[i];

    b.innerHTML += "<input type='hidden' value='" + $("#nt_"+i).attr("value")+"-"+_arr[i].split("-")[1] + "'>";

   
    // 생성된 div에서 이벤트 발생시 hidden으로 생성된 input안의 value의 값을

    // autocomplete할 요소에 넣기

    b.addEventListener("click", function (e) { 

     _inp.value = this.getElementsByTagName("input")[0].value; 

     closeAllLists(); 
     
     $("#ppt_nationality").val(_inp.value.split("-")[0]);
	 $("#ntCd").html(_inp.value.split("-")[1]);
     

    }); 

    // autocomplete 리스트를 붙이기.

    a.appendChild(b);

    
    cnt++;
   } 

   

  }

  

  

 }; 

 let keydownEvent = function (e) { 

  // 

  var x = document.getElementById(this.id + "autocomplete-list"); 
  
  var cpLen = '';
  if($("#autoInputautocomplete-list").css("width") != 'undefined' && $("#autoInputautocomplete-list").css("width") != "" && $("#autoInputautocomplete-list").css("width") != undefined){ 
	  cpLen = $("#autoInputautocomplete-list").css("width").split("p")[0] > 180 ? 20 : 11;
  }else{
	  cpLen = 20;
  }

  if (x) { 

   // 태그 네임을 가지는 엘리먼트의 유요한 html 컬렉션을 반환.

   // div의 값을 htmlCollection의 값으로 받아옴.

   x = x.getElementsByTagName("div"); 

   

  } if (e.keyCode == 40) { 

    // down

    // 현재위치 증가

    _currentFocus++; 

    // 현재위치의 포커스 나타내기
    
    
    addActive(x);
    
    
    var scHeight = 80;
    
    if($("#ntNum_"+_currentFocus).html().split("<")[0].length > cpLen){
    	scHeight += 20;
    }
    
    console.log(scHeight);
    
    if(_currentFocus != 0 && _currentFocus % 4 == 0){
    	$(".autocomplete-items").animate({scrollTop : $(".autocomplete-items").scrollTop()+scHeight}, 400); 	
    }

  } else if (e.keyCode == 38) { 

     // up

     // 현재위치 감소

     _currentFocus--; 

     // 현재위치의 포커스 나타내기

     addActive(x); 

     var scHeight = 80;
     
     if($("#ntNum_"+_currentFocus).html().split("<")[0].length > cpLen){
     	scHeight += 20;
     }
     
     if(_currentFocus != 0 && _currentFocus % 4 == 0){
     	$(".autocomplete-items").animate({scrollTop : $(".autocomplete-items").scrollTop()-scHeight}, 400); 	
     }  

  } else if (e.keyCode == 13) { 

   // enter

   e.preventDefault(); 

   // 현재위치가 아이템 선택창내에 있는 경우

   if (_currentFocus > -1) { 

    // 현재 위치의 값 클릭

    if (x) 

     x[_currentFocus].click(); 

    

   } 
   $("#ppt_nationality").val(_inp.value.split("-")[0]);
   

  } 

   

 };

 

 let addActive = function (x) { 

  if (!x) return false; 

  removeActive(x); 

/*  if (_currentFocus >= x.length) _currentFocus = 0; 

  if (_currentFocus < 0) _currentFocus = (x.length - 1); */

  if (_currentFocus >= x.length) _currentFocus = (x.length - 1); 

  if (_currentFocus < 0) _currentFocus = 0; 
  
  x[_currentFocus].classList.add("autocomplete-active"); 

 };

 

 let removeActive = function (x) { 

  for (var i = 0; i < x.length; i++) { 

   x[i].classList.remove("autocomplete-active"); 

  } 

  

 };

 let closeAllLists = function (elmnt) { 

  var x = document.getElementsByClassName("autocomplete-items"); 

  for (var i = 0; i < x.length; i++) { 

   if (elmnt != x[i] && elmnt != _inp) { 

    x[i].parentNode.removeChild(x[i]); 

   } 

  } 

 };

 

 let _removeListener = function () { 

  if (_inp !== null) { 

   console.log(_inp) 

   _inp.removeEventListener("input", inputEvent, false);

   _inp.removeEventListener("keydown", keydownEvent, false); 

  } 

  

 }; 

 

 return { 

   setAutocomplete: function (inp, arr) { 

   _setAutocomplete(inp, arr); 

   }, 

   

 } 

})();

 

