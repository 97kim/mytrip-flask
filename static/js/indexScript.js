function slide() {
    $(function () {
        // Uncaught TypeError: Cannot read property 'add' of null” 오류 -> slick을 여러번 불러와서 발생
        // .not('.slick-initialized')로 하면 오류가 안 난다.

        // $('.slider-div').slick({
        $('.slider-div').not('.slick-initialized').slick({
            slide: 'div',		//슬라이드 되어야 할 태그 ex) div, li
            infinite: true, 	//무한 반복 옵션
            slidesToShow: 3,		// 한 화면에 보여질 컨텐츠 개수
            slidesToScroll: 1,		//스크롤 한번에 움직일 컨텐츠 개수
            speed: 100,	 // 다음 버튼 누르고 다음 화면 뜨는데까지 걸리는 시간(ms)
            arrows: true, 		// 옆으로 이동하는 화살표 표시 여부
            dots: true, 		// 스크롤바 아래 점으로 페이지네이션 여부
            autoplay: true,			// 자동 스크롤 사용 여부
            autoplaySpeed: 10000, 		// 자동 스크롤 시 다음으로 넘어가는데 걸리는 시간 (ms)
            pauseOnHover: true,		// 슬라이드 이동	시 마우스 호버하면 슬라이더 멈추게 설정
            vertical: false,		// 세로 방향 슬라이드 옵션
            prevArrow: $('#btn_prev'),		// 이전 화살표 모양 설정
            nextArrow: $('#btn_next'),		// 다음 화살표 모양 설정
            dotsClass: "slick-dots", 	//아래 나오는 페이지네이션(점) css class 지정
            draggable: true, 	//드래그 가능 여부
        });
    })
}

function geoInfo() {
    function onGeoOK(position) { //위치 정보 공유 승인 시
        const lat = position.coords.latitude; //위도
        const lng = position.coords.longitude; //경도

        $.ajax({
            type: "POST",
            url: "/near",
            data: {lat_give: lat, lng_give: lng},
            success: function (response) {
                nearList = response['nearList'];
                for (let i = 0; i < nearList.length; i++) {
                    let title = nearList[i]['title'];
                    let address = nearList[i]['addr1'];
                    let image = nearList[i]['firstimage'];

                    let temp_html = `<div class="card h-150">
                                                        <img class="card-img-top" src="${image}" alt="내 위치 근처 여행지">
                                                        <div class="card-body">
                                                            <h5 class="card-title">${title}</h5>
                                                            <p class="card-text">${address}</p>
                                                        </div>
                                                 </div>`
                    $('#nearCard').append(temp_html);
                    slide();
                }
            }
        })
    }

    function onGeoError() { //위치 정보 공유 거부 시
        alert('현재 위치를 찾을 수 없습니다.')
    }

    // 1번째 파라미터: 위치 공유 승인 시, 2번째 파라미터: 위치 공유 거부 시 실행
    navigator.geolocation.getCurrentPosition(onGeoOK, onGeoError);
}