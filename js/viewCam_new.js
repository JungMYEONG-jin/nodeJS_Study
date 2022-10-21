var sframeChat = null;
var spass = null;

var STATE_BEFORE_CALL = 3;
var STATE_SEND_CALL = 4;
var STATE_START_CALL = 5;

var muteControl = false;

//상담방에 대한 정보
var consultInfoObject = {
    firstStep 			: 1 	// first step index
    , lastStep 			: 6 	// last step index
    , currentStep 		: null 	// current step index
    , startCallDate 	: null 	// consult started time
    , timeoutDate		: null	// guest exited time (mobile user)
    , customer 			: { isLogin : false }
    , msgSendState 		: false	// sended state to application server
    , intervalEventId	: null 	// Interval 이벤트 아이디
    , approvalResult	: null 	// approval disapproval result
    , reqKey			: reqKey 	// req_key (parameter)
    , hwnName           : hwnName 	// hwnname (session info)
    , hwnNo				: hwnNo 	// hwnno (session info)
    , photo             : $("#consultantPhoto").prop("src")
    , state				: STATE_BEFORE_CALL	//상담 상태 코드
    /*spass*/
    , clientVideoWidth	: 320 // 고객 앱의 Video 넓이. 못받아올 경우 기본 값
    , clientVideoHeight : 480 // 고객 앱의 Video 높이. 못받아올 경우 기본 값
    , startRecTime		: null // 녹화 시작 시간
    , recInterval		: null // 녹화용 interval
    , timeoutInterval	: null // 연결 종료용 interval
    , isForceExit		: false // 강제종료 혹은 사용자의 종료 처리 시에는 signaling에서 disconnected 메시지가 오더라도 대기처리를 하지 않도록 함.
    /*spass*/
};

consultInfoObject.currentStep = consultInfoObject.firstStep;

/**
 * 화면 로딩 완료시 초기화
 */
$(document).ready(function(){
    // SIP STACK 타이머 시작
//	timeoutDocumentReady(true);

//	login_user_config.user_type = USER_CONSULTANT;
    consultInfoObject.timeoutInterval = setTimeout(function(){changeUI("timeoutPopup");}, 60 * 1000);
    //get customer Info
    getIdCardImage();

    // bind event function
    bindingFunctionEvents();

    // connect SIP gw & Application Server
//	init();
    initSFrameChat();
    $('.btn_refresh_blue').click(function(){
        getIdCardImage();
    });

    $('#btn_expand_img').click(function(){
        if($('#idCardImg').css("width") == '300px'){
            $('#idCardImg').css('width','500px');
        }else{
            $('#idCardImg').css('width','300px');
        }
    });

    $('#btn_expand_screen').click(function(){
        if($('canvas').css("width") == '240px'){
            $('canvas').css('width','350px');
        }else{
            $('canvas').css('width','240px');
        }
    });

    $(".btn_doubt").on("click", function(e) {
        if($(this).attr("class").indexOf("disable") == -1){
            var top = 0;
            var left = window.innerHeight/2;

            var opt = "width=500,height=300,scrollbars=no,menubar=1,top=" + (e.clientX/5) + ",left=" + (window.screenLeft + (window.innerWidth-349) / 2);
            window.open("/web/popNopass.do?it=4&call=1", "rejectPop", opt);
        }
    });

    $(".btn_send_guide").on("click", function(e) {
        sendJsonMsg("client", "soundGuide", "");
    });
});
/**
 * 이벤트 binding을 처리하는 함수
 */
function bindingFunctionEvents(){
    //이전버튼 클릭이벤트
    $('#prevStepBtn').on({
        click : function(){
            if( this.className.indexOf('focus') > 0 ){return;}

            //AS를 통해 고객에게 스텝변경을 알린다.
            changeStep('prev');
        }
    });
    //다음버튼 클릭이벤트
    $('#nextStepBtn').on({
        click : function(){
            if( this.className.indexOf('focus') > 0 ){return;}

            //AS를 통해 고객에게 스텝변경을 알린다.
            changeStep('next');
        }
    });
    //영상 가리기버튼
    $('#videoBlindBtn').on({
        click : function(){changeUI('blindVideo');}
    });
    //상담사 마이크 음소거 버튼
    $('#micMuteBtn').on({
        click : function(){micOnOff();}
    });
}
/**
 * 영상통화 중 상담사 화면 capture
 */
function shoot(){
    var video = document.getElementById('video_remote');
    var output = document.getElementById('output');
    var scaleFactor = 1;
    var snapshots = [];
    var canvas = capture(video, scaleFactor);
    canvas.onclick = function(){
//		window.open(this.toDataURL());
        var dataURL = canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");

        var link = document.createElement('a');
        link.download = "from_canvas.png";
        link.href = dataURL;
        link.click();
    };
    snapshots.unshift(canvas);
    output.innerHTML = '';

    for(var i = 0; i < 4; i++){
        output.appendChild(snapshots[i]);
    }
}
function capture(video, scaleFactor){
    if(scaleFactor == null){
        scaleFactor = 1;
    }
    var w = video.videoWidth * scaleFactor;
    var h = video.videoHeight * scaleFactor;
    var canvas = document.createElement('canvas');
    canvas.width = w/2;
    canvas.height = h/2;

    var ctx = canvas.getContext('2d');
//	ctx.drawImage(video, 0, 0, w/4, h/4);
    ctx.drawImage(video, 0, 0, w/2, h/2);

    return canvas;
}

/**
 * 영상통화 중 상담사 마이크 On/Off
 */
function micOnOff(isMicOnOff){
    // 음소거 버튼이 클릭되었을 경우 호출
    // 음소거버튼
    var $muteBtn = $('#micMuteBtn');
    // Audio Track 설정
    var audioTrack = {};
    if(spass)
    {
        if(spass.localStream)
        {
            if(spass.localStream.getAudioTracks())
            {
                if(spass.localStream.getAudioTracks().length > 0)
                {
                    audioTrack = spass.localStream.getAudioTracks()[0];
                }
            }
        }
    }
    if(typeof(isMicOnOff) != "undefined" && isMicOnOff != null)
    {
        if(isMicOnOff = "on")
        {
            $muteBtn.addClass('focus');
        }
        else if(isMicOnOff = "off")
        {
            $muteBtn.removeClass('focus');
        }
    }
    if( $muteBtn.hasClass('focus')){
        //음소거 on 되어있을 경우
        //on -> off
        // video 태그 볼륨 설정 최대
        muteControl	= false;
        document.getElementById("video_local").volume = 1.0;
        audioTrack.enabled = true;
        audioTrack.muted = false;
        $muteBtn.removeClass('focus');
    }else{
        //음소거  off 되어있을 경우
        //off -> on
        // video 태그 볼륨 설정 최소
        muteControl	= true;
        document.getElementById("video_local").volume = 0.0;
        audioTrack.enabled = false;
        audioTrack.muted = true;
        $muteBtn.addClass('focus');
    }
}

/**
 * 영상통화 상담 종료 처리 함수
 * @param isEndConsult 상담사의 '상담종료'로 의해 상담이 종료될 때 true
 *                    그외의 예외상황으로 상담화면에서 벗어날 때  false
 */
function forceExitConsultRoom( exitType ){
    var backUrl = 'https://'+window.location.hostname+':17704/web/viewConsult.do';

    //Video tag source삭제
    $('video').attr('src','');

    switch (exitType) {
        case 'approvalButton':
        {
            //승인 또는 미승인 후 나가는 경우
            //SIP_Bye();
            spass.close();
            location.href = backUrl;
            break;
        }
        case 'exitButton':
        {
            //'상담종료'버튼을 누른 후 나가는 경우
            if($('.btn_exit').hasClass('disable')){return;}

            $('.loedingImagePlay').show();
            spass.stopRecording({
                "succ_yn" : "C"
                , "idcard_msg" : ""
            }, function(data){
                $('.loedingImagePlay').hide();
                //고객에게 bye메세지를 전송
                //sendMessageToAS('sip_bye');
                sendJsonMsg("client", "normalExit", "상담사가 상담을 종료하였습니다.");
                setTimeout( function(){
                        spass.close();
                        location.href = backUrl;
                    } , 0
                );
            }); // End of spass.stopRecording
            break;
        }
        case 'declareButton':
        {
            //'신고'버튼을 누른 후 나가는 경우
            if($('.btn_declare').hasClass('disable')){return;}

            $('.loedingImagePlay').show();
            spass.stopRecording({
                "succ_yn" : "D"
                , "idcard_msg" : ""
            }, function(data){
                $('.loedingImagePlay').hide();

                //고객에게 bye메세지를 전송
                //sendMessageToAS('declare');
                sendJsonMsg("client", "reportExit", "상담사가 상담을 종료하였습니다.");
                setTimeout( function(){
                        spass.close();
                        location.href = backUrl;
                    } , 0
                );
            }); // End of spass.stopRecording
            break;
        }
        case 'exception':
        {
            //예외상황 layer popup의 확인버튼을 눌러 나가는 경우
            //SIP_Bye();
            spass.close();
            location.href = backUrl;
            break;
        }
        case 'exitDefault':
        {
            spass.stopRecording({
                "succ_yn" : "C"
                , "idcard_msg" : ""
            }, function(data){
                spass.close();
                location.href = backUrl;
            }); // End of spass.stopRecording
            break;
        }
    }
}

/**
 * 이전, 다음 스텝 변경 함수
 */
function changeStep( direction ){

    //direction type 확인
    if( direction != "prev" && direction != "next" ){return;}

    //consultInfoObject.currentStep type 확인
    if( typeof consultInfoObject.currentStep !== 'number' ){return;}

    //currentStep확인
    if( direction == "prev" && consultInfoObject.currentStep == consultInfoObject.firstStep ){return;}

    //currentStep확인
    if( direction == "next" && consultInfoObject.currentStep == consultInfoObject.lastStep ){return;}

    //consultInfoObject.currentStep 변경
    if( direction == 'prev' ){
        consultInfoObject.currentStep--;
    }
    if( direction == 'next' ){
        consultInfoObject.currentStep++;
    }

    //Application Server로 step 정보 보내기
    //sendMessageToAS('consulting_status_req');
    changeUI("step");
    sendJsonMsg("client", "step", consultInfoObject.currentStep);
}

/**
 * 승인/미승인 업데이트
 * @param approval
 */
function updateConsultResult( approval ){
    var data;
    consultInfoObject.approvalResult = approval;
    //show loading blockUI
    $('.loedingImagePlay').show();
    spass.stopRecording({
        "succ_yn" : ((approval==true) ? 'Y' : 'N') // 인증 미승인
        , "idcard_msg" : "" // 미승인 사유
        , "etc3": $("#etc3").val()
        , "etc4": $("#etc4").val()
    }, function(data){
        //sendMessageToAS('approval_result_req');
        sendJsonMsg("client", ((approval==true) ? 'approvalExit' : 'disapprovalExit'));
        forceExitConsultRoom("approvalButton");
    }); // End of spass.stopRecording
}
/**
 * 실명증표 이미지 가져오기
 */
function getIdCardImage(){
    ajaxCall(
        '/noface/NF1050.do'
        , 'json'
        , {
            'req_key' : consultInfoObject.reqKey
            , 'hwnno' : consultInfoObject.hwnNo
            , 'hwnname' : consultInfoObject.hwnName
        }
        , function( data ){
            console.log(data);
            if( data['error_code'] == '0000' ){
                $('#idCardImg').attr('src','data:image/png;base64,'+data.data["image_base64_data1"]);
                if(data.data["app_code_data"] != '06'){
                    $('#idCardImg').css('width','300px');
                }
            }else{
                console.log(' # getIdCardImage() Error!');
            }
        }
        , true
    );
}
/**
 * 상태별 UI 변경
 * @param uiCode	UI코드
 * @param data		UI설정시 필요한 parameter
 */
function changeUI( uiCode , data ){
    var error_num = 1000;
    switch ( uiCode ) {
        case 'blindVideo':
        {
            // 가리기버튼이 클릭되었을 경우 호출
            // 가리기버튼
            var $blindBtn = $('#videoBlindBtn');
            // 화면가리기이미지
            var $blindImg = $('.box_video img');
            var $customerVideo = $('#video_remote');

            if( $blindBtn.hasClass('focus') ){
                //가리기버튼이 on되어있을 경우
                //on -> off
                $blindBtn.removeClass('focus');
                $blindImg.addClass('dis_n');
                $customerVideo.removeClass('dis_n');
            }else{
                //가리기버튼이 off 되어있을 경우
                //off -> on
                $blindBtn.addClass('focus');
                $blindImg.removeClass('dis_n');
                $customerVideo.addClass('dis_n');
            }
            break;
        }
        case 'disconnectCall':
        {
            // video 태그 볼륨 설정 최대
            document.getElementById("video_remote").volume = 0.0;
            // 상담사 마이크  mute on
            //muteMicrophone(true);
            //micOnOff("off");

            //통화 재연결 상태일 경우,
            $('#waiting span').html('재연결 대기 중...');
            $('#waiting').removeClass('dis_n');
            $('#prevStepBtn').addClass('focus');
            $('#nextStepBtn').addClass('focus');
            break;
        }
        case 'connectCall':
        {
//			if(!(ASConnection&&ASConnection.readyState == 1)||
//				(xfinger_session && (xfinger_session.o_pc.iceConnectionState == "failed"||
//									 xfinger_session.o_pc.iceConnectionState == "disconnected"||
//									 xfinger_session.o_pc.iceConnectionState == "closed")) ){
//				return;
//			}

            // 상담사 마이크  mute off
//			if(oSipSessionCall
//            && oSipSessionCall.o_session.o_stream_local
//            && oSipSessionCall.o_session.o_stream_local.getAudioTracks()[0]
//            && oSipSessionCall.o_session.o_stream_local.getAudioTracks()[0].enabled == false) {
//				if(!muteControl){
//					muteMicrophone(false);
//					micOnOff("on");
//				}
//            }

            //영상통화 연결이 되었을 경우
            $('.btn_exit').removeClass('disable');
            $('.btn_exit').attr('href','#pop_end');

            $('.btn_declare').removeClass('disable');
            $('.btn_declare').attr('href','#pop_declare');

            $('.btn_doubt').removeClass('disable');

            $('#waiting').addClass('dis_n');
            if( consultInfoObject.currentStep != consultInfoObject.lastStep ){
                $('#prevStepBtn').removeClass('focus');
                $('#nextStepBtn').removeClass('focus');
            }

            if( consultInfoObject.startCallDate == null ){
                consultInfoObject.startCallDate = new Date();
                clearInterval( consultInfoObject.intervalEventId );
                consultInfoObject.intervalEventId = setInterval( function(){changeUI('callTime')} , 1000 );
            }
            //고객 앱에 상담사 명 및 이미지 전송
            sendJsonMsg("client", "consultantName", consultInfoObject.hwnName);
            sendJsonMsg("client", "consultantPhoto", $("#consultantPhoto").prop("src"));
            break;
        }
        case 'step':
        {
            var $mentGuideDiv = $('.cont_progress');

            // top 단계 표시 변경
            $('.lst_progress').find('li').removeClass('focus');
            $('.lst_progress').find('li[data-step="'+consultInfoObject.currentStep+'"]').addClass('focus');

            // middle 진행 멘트 안내 변경
            $mentGuideDiv.children('img').addClass('dis_n');
            $mentGuideDiv.find('img[data-step="'+consultInfoObject.currentStep+'"]').removeClass('dis_n');

            // 승인, 미승인과 이전, 다음 버튼 조절
            if( consultInfoObject.currentStep == consultInfoObject.lastStep ){
                //승인단계인 경우, 승인버튼 show
                $mentGuideDiv.find('.btn_box').removeClass('dis_n');
                //이전, 다음버튼 disable 처리
                $('#prevStepBtn').addClass('focus');
                $('#nextStepBtn').addClass('focus');
            }else{
                //승인단계인 경우, 승인버튼 hide
                $mentGuideDiv.find('.btn_box').addClass('dis_n');
            }

            //실명인증단계인 경우, 실명인증사진을 보여준다.
            if( consultInfoObject.currentStep == 4 ){
                if( $('#pop_detail').css('display') == 'none' ){
                    $('a.btn_click').click();
                }
            }else{
                $('#pop_detail a.btn_close').click();
            }
            break;
        }
        case 'callTime':
        {
            //통화 시간 설정
            if( consultInfoObject.startCallDate == null || typeof consultInfoObject.startCallDate !== 'object'){ return; }

            var now = new Date();
            var diff_sec = ( now.getTime() - consultInfoObject.startCallDate.getTime() ) / 1000 ;
            setTimeInfo( '#callTimeSpan' , diff_sec , 'hour' );
            break;
        }
        case 'failToRegisterSipId':
        case 'failToInit' :
        case 'failToStart' :
        case 'cancelPopup':
        case 'timeoutPopup':
        case 'connectErrorPopup':
        case 'unknownErrorPopup':
        case 'alreadyConsultingPopup':
        case 'noCustomerPopup':
        case 'disconnectASPopup':
        case 'unauthorizedSipIdPopup':
        {
            console.log('layer popup code='+uiCode );
            if( consultInfoObject.intervalEventId != null ){
                clearInterval( consultInfoObject.intervalEventId );
            }
//			if( periodic_stats ){
//			    clearInterval(periodic_stats);
//			}

            var text = '';
            switch (uiCode) {
                case 'cancelPopup':
                    text = '고객님이 영상통화 연결을<br/>취소하였습니다.';
                    break;
                case 'timeoutPopup':
                    text = '고객님이 응답이 없습니다.';
                    ajaxCall(
                        '/noface/NF1042.do'
                        , 'json'
                        , {
                            'req_key' : consultInfoObject.reqKey
                            , 'hwnno' : consultInfoObject.hwnNo
                            , 'hwnname' : consultInfoObject.hwnName
                        }
                        , function( data ){
                            console.log('%c/noface/NF1042.do complete! result.', "color: green");
                            console.log(data);
                        }
                        , false
                    );
                    break;
                case 'connectErrorPopup':
                    text = '고객님과 영상통화 연결에 실패하였습니다.';
                    break;
                case 'unknownErrorPopup':
                    text = '알 수 없는 오류가 발생했습니다.';
                    break;
                case 'alreadyConsultingPopup':
                    text = '다른 상담사에 의해 상담이 진행중입니다.';
                    break;
                case 'noCustomerPopup':
                    text = '고객님과 영상통화 연결에 실패하였습니다.';
                    break;
                case 'failToRegisterSipId':
                    error_num++;
                case 'failToInit' :
                    error_num++;
                case 'failToStart' :
                    error_num++;
                case 'unauthorizedSipIdPopup':
                    error_num++;
                case 'disconnectASPopup':
                    text = '통신상태 불안정으로 영상통화 진행이 중단되었습니다. (' + error_num + ')';
                    break;
            }

            $('#waiting').addClass('dis_n');
            $('video').attr('src','');

            //고객이 취소상태로 돌아갈 수 있는 경우에는 팝업창을 띄움과 동시에 녹화영상을 업로드한다.
            spass.stopRecording({
                "succ_yn" : "I" // 인증 미승인
                , "idcard_msg" : "" // 미승인 사유
            }, function(data){
                null
            }); // End of spass.stopRecording

            //show layer popup
            changeUI('exceptionPopup', {text : text} );

            //10초후 상담현황화면으로 이동
            setTimeout(function(){ sendJsonMsg("client", "errorException", text); forceExitConsultRoom('exception');}, 10*1000 );
            break;
        }
        case 'exceptionPopup':
        {
            popupId = 'pop_exit';
            if($("#" + popupId).css("display") == "none")
            {
                $tempAnchor = $("<a>", {"href": "#" + popupId, "class":"btn_layerpop"});
                $('#'+popupId).find('p>span').html(data.text);

                $('body').append( $tempAnchor );
                layerPop(".btn_layerpop");
                $tempAnchor.click();
            }
            break;
        }
    }
}

/**
 * seconds를 '분:초' 또는 '시:분:초'로 시간을 표시하는 함수
 * @param div		시간을 설정할 영역의 selector(JQuery)
 * @param seconds	초단위
 * @param range		'hour' or other ('분:초' 또는 '시:분:초'로 표시한다.)
 */
function setTimeInfo( div , seconds , range ){
    var $timeDiv = $(div);
    var h = parseInt( seconds/(60*60) );
    var m = parseInt( seconds%(60*60)/60 );
    var s = parseInt( seconds%60 );

    if($timeDiv.length == 0 ){ console.log('# $("'+div+'") Tag not Found.'); return;}

    h = ( h < 0 ) ? 0 : h;
    m = ( m < 0 ) ? 0 : m;
    s = ( s < 0 ) ? 0 : s;

    if( range == 'hour' ){
        $timeDiv.html(h.appendZero()+':'+m.appendZero()+':'+s.appendZero());
    }else{
        m += ( h*60 );
        $timeDiv.html(m.appendZero()+':'+s.appendZero());
    }
}

/**
 * 9이하의 숫자에 '0'을 붙여주는 함수
 * @returns 00~10
 */
Number.prototype.appendZero = function(){
    return (this < 10) ? '0'+this : this;
}

function initSFrameChat() {
    // 클라이언트 아이디 생성
    var roomId = consultInfoObject.reqKey;
    var userId = "consult";
    var wssUrl = "wss://"+window.location.hostname+":19200";

    sframeChat = new SFrameChat(roomId, userId, recvDataProcess);
    sframeChat.connect(wssUrl);

//	sendJsonMsg("client", "onWaitCustomerConfirm", "");
    //getImageList();

    var turnUrl = 'turn:'+window.location.hostname+':19100';

    spass = new SPass(sframeChat, turnUrl, onSpassCallBack);
    spass.isRecord = true;		// 녹화 시작
    spass.movieInfo = consultInfoObject;	// 사용자로그인 정보
}

/**
 * Spass 영상관련 콜백 함수
 *
 * @param type
 * @param data
 * @param userId
 * @returns
 */
function onSpassCallBack(type, data, userId) {
    if (type == spass.TYPE_LOCAL_STREAM) {
        var videoObj = $("#video_local");
        var video = videoObj[0];
        try {
            video.srcObject = data;
        } catch (e) {
            video.src = window.URL.createObjectURL(data);
        }
        video.volume = 1;
        sendJsonMsg("client", "onWaitCustomerConfirm", "");// 혹시?
    } else if (type == spass.TYPE_REMOTE_STREAM) {
        var videoObj = $("#video_remote");
        var video = videoObj[0];
        try {
            video.srcObject = data;
        } catch (e) {
            video.src = window.URL.createObjectURL(data);
        }
        video.volume = 1;
    } else if (type == spass.TYPE_PEER_EVENT) {
        // 영상 상태에 대한 이벤트 발생
        if (data == "checking") {
            // 접속 체크
        } else if (data == "connected") {
            // 연결됨
            // bindingElementEvents();
            changeUI("connectCall"); // 영상 시작됐을 때의 상담사용 UI 처리 (대기/로딩 영역 가림, 영상 영역 표시 등)
        } else if (data == "disconnected") {
            // 끈김
            changeUI("disconnectCall");
        } else if (data == "failed" || data == 'close') {
            // 접속 실패
        }
    } else if (type == spass.TYPE_ERR) {
        // 캠 또는 마이크 없음음
        alert(data.errMsg);
    }
}

/**
 * 메시지 전송 (고객 앱으로 메시지 전송) (2018.09.19 김경수)
 * @param msgType : Message Type으로 어느 서버에서 전송되는지 구별. 해당 화면에서는 주로 client 로 설정
 * @param cmd : 동작/상태. 해당 화면에서는 주로 msg로 설정
 * @param contents : 메시지 내용. 주로 단계별 고객 안내 메시지 전송
 * @returns
 */
function sendJsonMsg(msgType, cmd, contents) {
    msg_object = {"msgType": msgType, "cmd": cmd, "contents": contents}
    sframeChat.sendMsg(msg_object);
}

/**
 * 메시지가 수신되었을 때 처리 프로세스
 * @param recvData : 수신된 메시지 JSON 객체
 * @returns
 */
function recvDataProcess(recvData){
    if (recvData.type == sframeChat.TYPE_ERR) {
        // 에러 발생
        alert(recvData.errMsg+"["+recvData.errCode+"]");
        if(recvData.errCode == "9001"){
            window.history.back();
        }
    } else if (recvData.type == sframeChat.TYPE_CLOSE) {
        // 사용자 접속 해제
        changeUI("timeoutPopup");
    } else if (recvData.type == sframeChat.TYPE_CONN) {
        // 사용자 접속
        //changeUI("connectCall");
    } else if (recvData.type == sframeChat.TYPE_MSG) {
        recvData = recvData.data;
        switch(recvData.msgType)
        {
            // Message Type이 client(상담사 화면/고객 앱 간)에서 주고 받을 경우
            case "client":
            {
                switch(recvData.cmd)
                {
                    case "onLoadPage":
                    {
                        sendJsonMsg("client", "onWaitCustomerConfirm", "");
                        break;
                    }
                    // 진행 단계에 따른 UI 처리 (연결 끊긴 후 재연결됐을 때 고객의 앱이 끊기기 전까지 진행한 단계를 넘겨주면 그에 따라 상태와 UI, 버튼 활성화/비활성화 처리)
                    case "step":
                    {
                        consultInfoObject.currentStep = parseInt(recvData.contents); // 고객 앱이 넘겨준 진행 단계
                        changeUI("step");
                        break;
                    } // End of case "step":
                    // 고객 앱의 Size
                    case "video_size":
                    {
                        consultInfoObject.clientVideoWidth = (recvData.contents).split("|")[0];
                        consultInfoObject.clientVideoHeight = (recvData.contents).split("|")[1];
                        break;
                    } // End of case "video_size":
                    // 고객의 상담 취소
                    case "exit":
                    {
                        changeUI("cancelPopup");
                        break;
                    } // End of case "exit":
                    case "onWaitCustomerConfirmOK" :
                    {
                        clearInterval(consultInfoObject.timeoutInterval);
                        //changeUI("connectCall");
                    }
                    default:
                    {
                        break;
                    } // End of default:
                } // End of switch(recvData.cmd)
                break;
            } // End of case "client":
        } // End of switch(recvData.msgType)
    }
}
/**
 * 영상 종료 처리(영상 및 비대면인증 결과의 DB 저장)가 성공했을 경우 처리
 * 고객 앱에 종료 구분과 메시지를 전송하고, 상담사 화면의 로딩바를 숨기고 타이머 시간 이후 URL 이동
 * @param msgCmd 고객 앱에 전송할 Command 구분(normalExit, reportExit, approvalExit, disapprovalExit)
 * @param msgContents 고객 앱에 전송할 메시지 내용
 * @param goToUrl 이동할 URL
 * @param exitTimer 메시지 표시 후 종료할 타이머 시간
 * @returns
 */
function afterStopRecordingSuccess(msgCmd, msgContents, goToUrl, exitIimer)
{
    //고객 앱에 종료 구분과 메시지 전송
    sendJsonMsg("client", msgCmd, msgContents);
    // 일정시간 후 로딩 바 숨기고 이동
    setTimeout( function(){$(".loadingImagePlay").hide();$(location).attr("href", goToUrl);}, exitTimer * 1000 ); // 지정된 시간 이후 로딩 이미지 숨기고 상담현황으로 이동
}
/**
 * 영상 종료 처리(영상 및 비대면인증 결과의 DB 저장)가 실패했을 경우 처리
 * @param msgContents 상담사에게 보여줄 실패 메시지
 * @param goToUrl 이동할 URL
 * @param exitTimer 타이머 시간
 * @returns
 */
function afterStopRecordingFail(msgContents, goToUrl, exitTimer)
{
    $("#waiting").removeClass("dis_n"); // 대기 화면으로 전환
    $("#waitloader_message").html(msgContents); // 메시지 보여줌
    disconnect_timeout(exitTimer, goToUrl); // 지정된 시간 동안 카운트다운
}