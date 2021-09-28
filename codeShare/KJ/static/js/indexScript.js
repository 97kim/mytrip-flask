// slick 슬라이드
function slide() {
    $(function () {
        // Uncaught TypeError: Cannot read property 'add' of null” 오류 -> slick을 여러번 불러와서 발생
        // .not('.slick-initialized')로 하면 오류가 안 난다.

        // $('.slider-li').slick({
        $('.slider-li').not('.slick-initialized').slick({
            slide: 'li',		//슬라이드 되어야 할 태그 ex) div, li
            infinite: true, 	//무한 반복 옵션
            slidesToShow: 3,		// 한 화면에 보여질 컨텐츠 개수
            slidesToScroll: 1,		//스크롤 한번에 움직일 컨텐츠 개수
            speed: 100,	 // 다음 버튼 누르고 다음 화면 뜨는데까지 걸리는 시간(ms)
            dots: true, 		// 스크롤바 아래 점으로 페이지네이션 여부
            autoplay: true,			// 자동 스크롤 사용 여부
            autoplaySpeed: 5000, 		// 자동 스크롤 시 다음으로 넘어가는데 걸리는 시간 (ms)
            pauseOnHover: true,		// 슬라이드 이동 시 마우스 호버하면 슬라이더 멈추게 설정
            vertical: false,		// 세로 방향 슬라이드 옵션
            arrows: true, 		// 옆으로 이동하는 화살표 표시 여부
            prevArrow: $('#btn_prev'),		// 이전 화살표 모양 설정
            nextArrow: $('#btn_next'),		// 다음 화살표 모양 설정
            dotsClass: "slick-dots", 	//아래 나오는 페이지네이션(점) css class 지정
            draggable: true, 	//드래그 가능 여부

            responsive: [ // 반응형 웹 구현 옵션
                {
                    breakpoint: 1500, //화면 사이즈 1500px 보다 작을 시
                    settings: {
                        //위에 옵션이 디폴트 , 여기에 추가하면 그걸로 변경
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 800, //화면 사이즈 800px 보다 작을 시
                    settings: {
                        //위에 옵션이 디폴트 , 여기에 추가하면 그걸로 변경
                        slidesToShow: 1
                    }
                }
            ]

        });
    })
}

let nearDict = {};

// 현재 위치 불러와 근처 여행지 조회
function geoInfo() {
    function onGeoOK(position) { //위치 정보 공유 승인 시
        const lat = position.coords.latitude; //위도
        const lng = position.coords.longitude; //경도

        $.ajax({
            type: "POST",
            url: "/near",
            data: {lat_give: lat, lng_give: lng},
            success: function (response) {
                $('#nearCard').empty();
                nearList = response['nearList'];
                for (let i = 0; i < nearList.length; i++) {
                    let title = nearList[i]['title'];
                    let address = nearList[i]['addr1'];
                    let file = nearList[i]['firstimage'];
                    let distance = nearList[i]['dist'];
                    let placeLat = nearList[i]['mapy'];
                    let placeLng = nearList[i]['mapx'];
                    let contentId = nearList[i]['contentid'];

                    let noImage = "../../static/img/No-Image.png";

                    if (!file) {
                        nearDict[i] = [title, address, noImage, distance, placeLat, placeLng, contentId];
                        let temp_html = `<li style="margin: 0 10px; height: 300px;">
                                            <a href="/near/place/${contentId}" class="card" onclick="get_detail(${i})">
                                                <img src="../static/img/No-Image.png" class="card__image" alt="이미지 없음"/>
                                                <div class="card__overlay">
                                                    <div class="card__header">
                                                        <svg class="card__arc" xmlns="http://www.w3.org/2000/svg">
                                                            <path/>
                                                        </svg>
                                                        <img class="card__thumb" src="../static/img/No-Image.png" alt="썸네일 이미지 없음"/>
                                                        <div class="card__header-text">
                                                            <h3 class="card__title">${title}</h3>
                                                            <span class="card__status">${distance}m</span>
                                                        </div>
                                                    </div>
                                                    <p class="card__description">${address}</p>
                                                </div>
                                            </a>
                                        </li>`;
                        $('#nearCard').append(temp_html);
                    } else {
                        nearDict[i] = [title, address, file, distance, placeLat, placeLng, contentId];

                        let temp_html = `<li style="margin: 0 10px; height: 300px;">
                                            <a href="/near/place/${contentId}" class="card" onclick="get_detail(${i})">
                                                <img src="${file}" class="card__image" alt="내 위치 근처 여행지 사진"/>
                                                <div class="card__overlay">
                                                    <div class="card__header">
                                                        <svg class="card__arc" xmlns="http://www.w3.org/2000/svg">
                                                            <path/>
                                                        </svg>
                                                        <img class="card__thumb" src="${file}" alt="썸네일"/>
                                                        <div class="card__header-text">
                                                            <h3 class="card__title">${title}</h3>
                                                            <span class="card__status">${distance}m</span>
                                                        </div>
                                                    </div>
                                                    <p class="card__description">${address}</p>
                                                </div>
                                            </a>
                                        </li>`;
                        $('#nearCard').append(temp_html);
                    }
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

function get_detail(i) {
    // nearDict = {
    //              i: [title, address, file, distance, placeLat, placeLng, contentId]
    //             }

    $.ajax({
        type: "POST",
        url: '/near/place',
        data: {
            title_give: nearDict[i][0],
            address_give: nearDict[i][1],
            file_give: nearDict[i][2],
            distance_give: nearDict[i][3],
            placeLat_give: nearDict[i][4],
            placeLng_give: nearDict[i][5],
            contentId_give: nearDict[i][6],
        },
        success: function (response) {
            if (response['result'] == 'success') {
                window.location.href = `/near/place/${nearDict[i][6]}`;
            }
        }
    });
}


function slide2() {
    $(function () {
        // Uncaught TypeError: Cannot read property 'add' of null” 오류 -> slick을 여러번 불러와서 발생
        // .not('.slick-initialized')로 하면 오류가 안 난다.

        // $('.slider-li2').slick({
        $('.slider-li2').not('.slick-initialized').slick({
            slide: 'li',		//슬라이드 되어야 할 태그 ex) div, li
            infinite: true, 	//무한 반복 옵션
            slidesToShow: 3,		// 한 화면에 보여질 컨텐츠 개수
            slidesToScroll: 1,		//스크롤 한번에 움직일 컨텐츠 개수
            speed: 100,	 // 다음 버튼 누르고 다음 화면 뜨는데까지 걸리는 시간(ms)
            dots: true, 		// 스크롤바 아래 점으로 페이지네이션 여부
            // autoplay: true,			// 자동 스크롤 사용 여부
            autoplaySpeed: 5000, 		// 자동 스크롤 시 다음으로 넘어가는데 걸리는 시간 (ms)
            pauseOnHover: true,		// 슬라이드 이동 시 마우스 호버하면 슬라이더 멈추게 설정
            vertical: false,		// 세로 방향 슬라이드 옵션
            arrows: true, 		// 옆으로 이동하는 화살표 표시 여부
            prevArrow: $('#btn_prev2'),		// 이전 화살표 모양 설정
            nextArrow: $('#btn_next2'),		// 다음 화살표 모양 설정
            dotsClass: "slick-dots", 	//아래 나오는 페이지네이션(점) css class 지정
            draggable: true, 	//드래그 가능 여부

            responsive: [ // 반응형 웹 구현 옵션
                {
                    breakpoint: 1500, //화면 사이즈 1500px 보다 작을 시
                    settings: {
                        //위에 옵션이 디폴트 , 여기에 추가하면 그걸로 변경
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 800, //화면 사이즈 800px 보다 작을 시
                    settings: {
                        //위에 옵션이 디폴트 , 여기에 추가하면 그걸로 변경
                        slidesToShow: 1
                    }
                }
            ]

        });
    })
}

function showTrips() {
    $.ajax({
        type: "GET",
        url: "/trips",
        data: {},
        success: function (response) {
            tripList = response['all_trips'];
            for (let i = 0; i < tripList.length; i++) {
                let trip_title = tripList[i]['title'];
                let trip_place = tripList[i]['place'];
                let trip_file = tripList[i]['file'];
                let trip_date = tripList[i]['date'];

                let temp_html = `<li style="margin: 0 10px; height: 300px;">
                                        <a href="#" class="card">
                                            <img src="../static/img/${trip_file}" class="card__image" alt="사용자가 올린 여행지 사진"/>
                                            <div class="card__overlay">
                                                <div class="card__header">
                                                    <svg class="card__arc" xmlns="http://www.w3.org/2000/svg">
                                                        <path/>
                                                    </svg>
                                                    <img class="card__thumb" src="../static/img/${trip_file}" alt="썸네일"/>
                                                    <div class="card__header-text">
                                                        <h3 class="card__title">${trip_title}</h3>
                                                        <span class="card__status">${trip_date}</span>
                                                    </div>
                                                </div>
                                                <p class="card__description">${trip_place}</p>
                                            </div>
                                        </a>
                                    </li>`
                $('#tripCard').append(temp_html);
                slide2();
            }
        }
    })
}