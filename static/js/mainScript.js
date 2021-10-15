function slide3() {
    $(function () {
        // Uncaught TypeError: Cannot read property 'add' of null” 오류 -> slick을 여러번 불러와서 발생
        // .not('.slick-initialized')로 하면 오류가 안 난다.

        $('.slider-li3').not('.slick-initialized').slick({
            slide: 'li',		//슬라이드 되어야 할 태그 ex) div, li
            infinite: true, 	//무한 반복 옵션
            slidesToShow: 3,		// 한 화면에 보여질 컨텐츠 개수
            slidesToScroll: 1,		//스크롤 한번에 움직일 컨텐츠 개수
            speed: 100,	 // 다음 버튼 누르고 다음 화면 뜨는데까지 걸리는 시간(ms)
            dots: false, 		// 스크롤바 아래 점으로 페이지네이션 여부
            autoplay: true,			// 자동 스크롤 사용 여부
            autoplaySpeed: 5000, 		// 자동 스크롤 시 다음으로 넘어가는데 걸리는 시간 (ms)
            pauseOnHover: true,		// 슬라이드 이동 시 마우스 호버하면 슬라이더 멈추게 설정
            vertical: false,		// 세로 방향 슬라이드 옵션
            arrows: true, 		// 옆으로 이동하는 화살표 표시 여부
            prevArrow: $('#btn_prev3'),		// 이전 화살표 모양 설정
            nextArrow: $('#btn_next3'),		// 다음 화살표 모양 설정
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
            dots: false, 		// 스크롤바 아래 점으로 페이지네이션 여부
            // autoplay: true,			// 자동 스크롤 사용 여부
            autoplaySpeed: 5000, 		// 자동 스크롤 시 다음으로 넘어가는데 걸리는 시간 (ms)
            pauseOnHover: true,		// 슬라이드 이동 시 마우스 호버하면 슬라이더 멈추게 설정
            vertical: false,		// 세로 방향 슬라이드 옵션
            arrows: true, 		// 옆으로 이동하는 화살표 표시 여부
            prevArrow: $('#btn_prev2'),		// 이전 화살표 모양 설정
            nextArrow: $('#btn_next2'),		// 다음 화살표 모양 설정
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
            dots: false, 		// 스크롤바 아래 점으로 페이지네이션 여부
            autoplay: true,			// 자동 스크롤 사용 여부
            autoplaySpeed: 5000, 		// 자동 스크롤 시 다음으로 넘어가는데 걸리는 시간 (ms)
            pauseOnHover: true,		// 슬라이드 이동 시 마우스 호버하면 슬라이더 멈추게 설정
            vertical: false,		// 세로 방향 슬라이드 옵션
            arrows: true, 		// 옆으로 이동하는 화살표 표시 여부
            prevArrow: $('#btn_prev'),		// 이전 화살표 모양 설정
            nextArrow: $('#btn_next'),		// 다음 화살표 모양 설정
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

// 현재 위치 불러와 근처 여행지 조회
function geoInfo() {
    function onGeoOK(position) { //위치 정보 공유 승인 시
        const lat = position.coords.latitude; //위도
        const lng = position.coords.longitude; //경도
        localStorage.setItem("lat", lat)
        localStorage.setItem("lng", lng)
        $.ajax({
                type: "POST",
                url: "/near",
                data: {lat_give: lat, lng_give: lng},
                success: function (response) {
                    $('#near_card').empty();
                    let near_list = response['near_list'];

                    //세션 스토리지 값에 객체 형태로 여러 개 넣기 위해 생성
                    let obj = {};

                    for (let i = 0; i < near_list.length; i++) {
                        let title = near_list[i]['title'];
                        let address = near_list[i]['addr1'];
                        let file = near_list[i]['firstimage'];
                        let distance = near_list[i]['dist'];
                        let place_lat = near_list[i]['mapy'];
                        let place_lng = near_list[i]['mapx'];
                        let content_id = near_list[i]['contentid'];


                        if (!file) {

                            obj[content_id] = {
                                'title': title,
                                'address': address,
                                'file': "../../static/img/noImage.png",
                                'distance': distance,
                                'place_lat': place_lat,
                                'place_lng': place_lng
                            }

                            let temp_html = `<li style="margin: 0 10px; height: 300px;">
                                             <a href="/near/place/${content_id}" class="card">
                                                <img src="../../static/img/noImage.png" class="card__image" alt="이미지 없음"/>
                                                <div class="card__overlay">
                                                    <div class="card__header">
                                                        <svg class="card__arc" xmlns="http://www.w3.org/2000/svg">
                                                            <path/>
                                                        </svg>
                                                        <img class="card__thumb" src="../../static/img/noImage.png" alt="썸네일 이미지 없음"/>
                                                        <div class="card__header-text">
                                                            <h3 class="card__title">${title}</h3>
                                                            <span class="card__status">${distance}m</span>
                                                        </div>
                                                    </div>
                                                    <p class="card__description">${address}</p>
                                                </div>
                                            </a>
                                        </li>`;
                            $('#near_card').append(temp_html);
                        } else {

                            obj[content_id] = {
                                'title': title,
                                'address': address,
                                'file': file,
                                'distance': distance,
                                'place_lat': place_lat,
                                'place_lng': place_lng
                            }

                            let temp_html = `<li style="margin: 0 10px; height: 300px;">
                                             <a href="/near/place/${content_id}" class="card">
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
                            $('#near_card').append(temp_html);
                        }
                        slide();
                    }
                    sessionStorage.setItem('near_object', JSON.stringify(obj));
                }
            }
        )
    }

// 1번째 파라미터: 위치 공유 승인 시, 2번째 파라미터: 위치 공유 거부 시 실행
    navigator.geolocation.getCurrentPosition(onGeoOK, onGeoError);
}

function onGeoError() { //위치 정보 공유 거부 시
    alert('현재 위치를 찾을 수 없습니다.')
}

function showTrips() {
    $.ajax({
        type: "GET",
        url: "/trips",
        data: {},
        success: function (response) {
            let trip_list = response['all_trips'];

            for (let i = 0; i < trip_list.length; i++) {
                let trip_id = trip_list[i]['id'];
                let trip_title = trip_list[i]['title'];
                let trip_place = trip_list[i]['place'];
                let trip_file = trip_list[i]['file'];
                let trip_date = trip_list[i]['date'];
                let trip_like = trip_list[i]['like'];
                let trip_profile_img = trip_list[i]['profile_img'];
                let trip_nickname = trip_list[i]['nickname'];

                let temp_html = `<li style="margin: 0 10px; height: 300px;">
                                        <a href="/trips/place/${trip_id}" class="card">
                                            <img src="../../static/img/${trip_file}" class="card__image" alt="사용자가 올린 여행지 사진"/>
                                            <div class="card__overlay">
                                                <div class="card__header">
                                                    <svg class="card__arc" xmlns="http://www.w3.org/2000/svg">
                                                        <path/>
                                                    </svg>
                                                    <div class="card__thumb2">
                                                        <img src="../../static/img/profile/${trip_profile_img}" alt="프로필 사진"/>
                                                    </div>
                                                    <div class="card__header-text">
                                                        <h3 class="card__title">${trip_title}</h3>
                                                        <i class="far fa-thumbs-up">${trip_like}</i>
                                                        <span class="card__status">${trip_date}</span>
                                                    </div>
                                                </div>
                                                <p class="card__description">${trip_place}</p>
                                                <p class="card__description">by <b>@${trip_nickname}</b></p>
                                            </div>
                                        </a>
                                    </li>`
                $('#trip_card').append(temp_html);
                slide2();
            }
        }
    })
}

function showPopularTrips() {
    $.ajax({
        type: 'POST',
        url: '/popular/trips',
        data: {lat_give: localStorage.getItem("lat"), lng_give: localStorage.getItem("lng")},
        success: function (response) {
            $('#popular_card').empty();
            let popular_list = response['popular_list'];
            let trip_theme = response['trip_theme'];

            // popularListScript 정보 전달용
            let cat1 = response['cat1']
            let cat2 = response['cat2']
            let cat3 = response['cat3']
            let contentTypeId = response['contentTypeId']

            sessionStorage.setItem('cat1', JSON.stringify(cat1));
            sessionStorage.setItem('cat2', JSON.stringify(cat2));
            sessionStorage.setItem('cat3', JSON.stringify(cat3));
            sessionStorage.setItem('contenttypeid', JSON.stringify(contentTypeId));

            //세션 스토리지 값에 객체 형태로 여러 개 넣기 위해 생성
            let obj = {};

            for (let i = 0; i < popular_list.length; i++) {
                let content_id = popular_list[i]['contentid'];
                let title = popular_list[i]['title'];
                let file = popular_list[i]['firstimage'];
                if (!file)
                    file = popular_list[i]['firstimage2'];
                let areacode = parseInt(popular_list[i]['areacode']);
                let address = check_address(areacode)
                let mapx = popular_list[i]['mapx'];
                let mapy = popular_list[i]['mapy'];
                if (!mapx || !mapy) {
                    mapx = 0;
                    mapy = 0;
                }
                obj[content_id] = {
                    'title': title,
                    'address': address,
                    'file': file,
                    'place_lat': mapy,
                    'place_lng': mapx
                }

                let temp_html = `<li style="margin: 0 10px; height: 300px;">
                                 <a href="/popular/place/${content_id}" class="card">
                                    <img src="${file}" class="card__image" alt="내 위치 근처 여행지 사진"/>
                                    <div class="card__overlay">
                                        <div class="card__header">
                                            <svg class="card__arc" xmlns="http://www.w3.org/2000/svg">
                                                <path/>
                                            </svg>
                                            <img class="card__thumb" src="${file}" alt="썸네일"/>
                                            <div class="card__header-text">
                                                <h3 class="card__title">${title}</h3>
                                                <span class="card__status">${address}</span>
                                            </div>
                                        </div>
                                        <p class="card__description" ></p>
                                    </div>
                                </a>
                            </li>`;
                $('#popular_card').append(temp_html);
            }
            $('#popular_thema').prepend(trip_theme)
            slide3();
            sessionStorage.setItem('popular_object', JSON.stringify(obj));
        }
    });
}


function check_address(code) {
    if (code === 1) {
        code = '서울특별시'
    } else if (code === 21) {
        code = '부산광역시'
    } else if (code === 22) {
        code = '대구광역시'
    } else if (code === 23) {
        code = '인천광역시'
    } else if (code === 24) {
        code = '광주광역시'
    } else if (code === 25) {
        code = '대전광역시'
    } else if (code === 26) {
        code = '울산광역시'
    } else if (code === 29) {
        code = '세종특별자치시'
    } else if (code === 31) {
        code = '경기도'
    } else if (code === 32) {
        code = '강원도'
    } else if (code === 33) {
        code = '충청북도'
    } else if (code === 34) {
        code = '충청남도'
    } else if (code === 35) {
        code = '전라북도'
    } else if (code === 36) {
        code = '전라남도'
    } else if (code === 37) {
        code = '경상북도'
    } else if (code === 38) {
        code = '경상남도'
    } else if (code === 39) {
        code = '제주도'
    } else if (code === 2) {
        code = '인천'
    } else if (code === 4) {
        code = '대구'
    } else if (code === 6) {
        code = '부산'
    }
    return code
}