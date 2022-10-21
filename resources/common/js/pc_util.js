/**
 * @update 2016.12.01
 * @author Yujin
 */

/**
 * @type   : prototype_function
 * @access : public
 * @desc   : 자바스크립트의 내장 객체인 String 객체에 toDate 메소드를 추가한다. toDate 메소드는 날짜를 표현하는
 *           스트링 값을 자바스크립트의 내장 객체인 Date 객체로 변환한다.
 * <pre>
 *     var date = "20020305".toDate();
 *     or
 *     var date = "20020305".toDate("YYYYMMDD");
 *     or
 *     var date = "2002.03.05".toDate("YYYY.MM.DD");
 * </pre>
 * 위의 예에서 date 변수는 실제로 2002년 3월 5일을 표현하는 Date 오브젝트를 가르킨다.
 * @sig    : [pattern]
 * @param  : pattern optional Date를 표현하고 있는 현재의 String을 pattern으로 표현한다. (default : YYYYMMDD)
 * <pre>
 *     # syntex
 *
 *       YYYY : year(4자리)
 *       YY   : year(2자리)
 *       MM   : month in year(number)
 *       DD   : day in month
 *       HH   : hour in day (0~23)
 *       mm   : minute in hour
 *       ss   : second in minute
 *       SS   : millisecond in second
 *
 *     <font color=red>주의)</font> YYYY(YY)는 반드시 있어야 한다. YYYY(YY) 만 사용할 경우는 1월 1일을 기준으로
 *     하고 YYYY와 MM 만사용할 경우는 1일을 기준으로 한다.
 * </pre>
 * @return : 변환된 Date Object.
 * @author :
 */
String.prototype.toDate = function(pattern) {
	var index = -1;
	var year;
	var month;
	var day;
	var hour = 0;
	var min  = 0;
	var sec  = 0;
	var ms   = 0;
	var newDate;

	if (pattern == null) {
		pattern = "YYYYMMDD";
	}
	
	if ((index = pattern.indexOf("YYYY")) == -1 ) {
		index = pattern.indexOf("YY");
		year = "20" + this.substr(index, 2);
	} else {
		year = this.substr(index, 4);
	}

	if ((index = pattern.indexOf("MM")) != -1 ) {
		month = this.substr(index, 2);
	} else {
		month = 1;
	}

	if ((index = pattern.indexOf("DD")) != -1 ) {
		day = this.substr(index, 2);
	} else {
		day = 1;
	}

	if ((index = pattern.indexOf("HH")) != -1 ) {
		hour = this.substr(index, 2);
	}

	if ((index = pattern.indexOf("mm")) != -1 ) {
		min = this.substr(index, 2);
	}

	if ((index = pattern.indexOf("ss")) != -1 ) {
		sec = this.substr(index, 2);
	}

	if ((index = pattern.indexOf("SS")) != -1 ) {
		ms = this.substr(index, 2);
	}

	newDate = new Date(year, month - 1, day, hour, min, sec, ms);

	if (month > 12) {
		newDate.setFullYear(year + 1);
	} else {
		newDate.setFullYear(year);
	}

	return newDate;
};

/**
 * @type   : prototype_function
 * @object : Date
 * @access : public
 * @desc   : 자바스크립트의 내장 객체인 Date 객체에 format 메소드를 추가한다. format 메소드는 Date 객체가 가진 날짜를
 *           지정된 포멧의 스트링으로 변환한다.
 * <pre>
 *     var dateStr = new Date().format("YYYYMMDD");
 *
 *     참고 : Date 오브젝트 생성자들 - dateObj = new Date()
 *                                   - dateObj = new Date(dateVal)
 *                                   - dateObj = new Date(year, month, date[, hours[, minutes[, seconds[,ms]]]])
 * </pre>
 * 위의 예에서 오늘날짜가 2002년 3월 5일이라면 dateStr의 값은 "20020305"가 된다.
 * default pattern은 "YYYYMMDD"이다.
 * @sig    : [pattern]
 * @param  : pattern optional 변환하고자 하는 패턴 스트링. (default : YYYYMMDD)
 * <pre>
 *     # syntex
 *
 *       YYYY : hour in am/pm (1~12)
 *       MM   : month in year(number)
 *       MON  : month in year(text)  예) "January"
 *       mon  : short month in year(text)  예) "Jan"
 *       DD   : day in month
 *       DAY  : day in week  예) "Sunday"
 *       day  : short day in week  예) "Sun"
 *       hh   : hour in am/pm (1~12)
 *       HH   : hour in day (0~23)
 *       mm   : minute in hour
 *       ss   : second in minute
 *       SS   : millisecond in second
 *       a    : am/pm  예) "AM"
 * </pre>
 * @return : Date를 표현하는 변환된 String.
 */
Date.prototype.format = function(pattern) {
	var GLB_MONTH_IN_YEAR = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
	var GLB_DAY_IN_WEEK   = new Array("Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday");

	var year      = this.getFullYear();
	var month     = this.getMonth() + 1;
	var day       = this.getDate();
	var dayInWeek = this.getDay();
	var hour24    = this.getHours();
	var hour12    = (hour24 > 12) ? (hour24 - 12) : hour24;
	var min       = this.getMinutes();
	var sec       = this.getSeconds();
	var YYYY = "" + year;
	var YY   = YYYY.substr(2);
	var MM   = (("" + month).length == 1) ? "0" + month : "" + month;
	var MON  = GLB_MONTH_IN_YEAR[month-1];
	var DD   = (("" + day).length == 1) ? "0" + day : "" + day;
	var DAY  = GLB_DAY_IN_WEEK[dayInWeek];
	var HH   = (("" + hour24).length == 1) ? "0" + hour24 : "" + hour24;
	var hh   = (("" + hour12).length == 1) ? "0" + hour12 : "" + hour12;
	var mm   = (("" + min).length == 1) ? "0" + min : "" + min;
	var ss   = (("" + sec).length == 1) ? "0" + sec : "" + sec;
	var a    = (a == 0) ? "AM" : "PM";

	var dateStr;

	if (typeof(pattern) == "undefined") {
		dateStr = "YYYYMMDD";
	} else {
		dateStr = pattern;
	}

	dateStr = dateStr.replace(/a/g,    a);
	dateStr = dateStr.replace(/YYYY/g, YYYY);
	dateStr = dateStr.replace(/YY/g,   YY);
	dateStr = dateStr.replace(/MM/g,   MM);
	dateStr = dateStr.replace(/MON/g,  MON);
	dateStr = dateStr.replace(/DD/g,   DD);
	dateStr = dateStr.replace(/DAY/g,  DAY);
	dateStr = dateStr.replace(/hh/g,   hh);
	dateStr = dateStr.replace(/HH/g,   HH);
	dateStr = dateStr.replace(/mm/g,   mm);
	dateStr = dateStr.replace(/ss/g,   ss);

	return dateStr;
};

function fnIsNull(value) {
	if (value == null || (typeof(value) == "string" && value.trim() == ""))
		return true;

	return false;
}

function fnIsvalidDate(param) {
	try{
		param = param.replace(/-/g,'');
		
		/* 자리수가 맞지 않을때 */
		if (fnIsNull(param) || param.length != 8 ) {
			return false;
		}
		
		var year = Number(param.substring(0,4));
		var month = Number(param.substring(4,6));
		var day = Number(param.substring(6,8));
		
		var dd = day / 0;
		
		
		if (month < 0  || month > 12) {
			return false;
		}	
		
		var maxDaysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
		var maxDay = maxDaysInMonth[month-1];
		
		/* 윤달 */
		if (month==2 && (year%4==0 && year%100!=0 ||year%400==0)) {
			maxDay = 29;
		}
		
		if(day <= 0 || day > maxDay){
			return false;
		}
		
		return true;
		
	} catch(err) {
		return false;
	}
}
