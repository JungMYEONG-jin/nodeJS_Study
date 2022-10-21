document.oncontextmenu = function(e) {
	return false;
}
/**
 * 레이어 팝업 기능
* @param layerPopID - 떠야 할 팝업 레이어
*
 */
function layerPop(layerPopID){
	var layerPop = $(layerPopID);

	if (layerPop.length == 0 ){
		return;
	};
	function init(){
		$('.popup_layer,.pop_layer').hide();
	};
	init();

	layerPop.click(function(){
		var $this = $(this);
		// 각 버튼에 들어가 있는 href = #XXX 는 떠야 할 레이어의 ID XXX 를 뜻한다.
		var	$id = $this.attr('href');

		var btnBox = $('.popup_layer').find('.pop_box_btn a');
		var btnClose = $($id + ' .pop_btnclose,' + $id + ' .btn_close');

		$($id).fadeIn(300, 0);

		//닫기버튼
		btnClose.off('click').on("click",function(){
			$($id).fadeOut(300, 0);
		});

		//확인,취소,수정,삭제 버튼
		btnBox.off('click').on("click",function(){
			$($id).fadeOut(300, 0);
		});
	});
};

function popupSelect(popSelect){
	var popSelect = $(popSelect),
		btnBox = $('.popup_layer').find('.pop_box_btn a'),
		btnClose = $('.pop_btnclose'),
		popCont = $('#pop_progressing');

	if (popSelect.length == 0 ){
		return;
	};
	function init(){
		$('.popup_layer').hide();
	};
	init();

	popSelect.click(function(){
		var $this = $(this),
			$selected = $this.children('option:selected').text();

		if($selected == '불가능' && !$this.hasClass('popupOn')){
			$this.addClass('popupOn');
			popCont.fadeIn(300, 0);
		}

		if($selected == '가능' && $this.hasClass('popupOn')){
			$this.removeClass('popupOn');
		}

		//닫기버튼
		btnClose.unbind('click').bind("click",function(){
			popCont.fadeOut(300, 0);
		});

		//확인,취소,수정,삭제 버튼
		btnBox.unbind('click').bind("click",function(){
			popCont.fadeOut(300, 0);
		});

	});

};

$(document).ready(function(){
	$(".btn_logout").click(function(e) {
		if(!confirm("로그아웃하시면 창이 종료 됩니다. 로그아웃 하시겠습니까?"))
			return false;

		// location.href="/logout.do";
		window.close();
	});

	layerPop(".btn_layer");
	popupSelect(".pop_selcet");
});

//로딩이미지
function loadingImage(loadingImage){
	var loadingImage = $(loadingImage);
	if (loadingImage.length == 0){
		return;
	};

	function init(){
		loadingImage.find('img:first').addClass('focus');
	};
	init();

	loadInterval = setInterval(function(){
						var pop = $('.txt_calling').parent('.pop_layer'),
						loadImg = loadingImage.find('img'),
						imgFocus = loadingImage.find('.focus'),
						imgList = loadImg.length;

						if(pop.is(':hidden') == true){
							clearInterval(loadInterval);
						}else if(imgList-1 == imgFocus.index()){
							imgFocus.removeClass('focus');
							loadImg.eq(0).addClass('focus');
						}else{
							imgFocus.removeClass('focus').next().addClass('focus');
						}
					},65);
};

$(document).ready(function(){
	loadingImage('.loadingIMG');
});
