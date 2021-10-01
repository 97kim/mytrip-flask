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

let near_dict = {};

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
                $('#near_card').empty();
                near_list = response['near_list'];
                for (let i = 0; i < near_list.length; i++) {
                    let title = near_list[i]['title'];
                    let address = near_list[i]['addr1'];
                    let file = near_list[i]['firstimage'];
                    let distance = near_list[i]['dist'];
                    let place_lat = near_list[i]['mapy'];
                    let place_lng = near_list[i]['mapx'];
                    let content_id = near_list[i]['contentid'];

                    let noImage = "../../static/img/noImage.png";

                    if (!file) {
                        near_dict[i] = [title, address, noImage, distance, place_lat, place_lng, content_id];

                        let temp_html = `<li style="margin: 0 10px; height: 300px;">
                                             <a href="/near/place/${content_id}" class="card" onclick="getDetail(${i})">
                                                <img src="../static/img/noImage.png" class="card__image" alt="이미지 없음"/>
                                                <div class="card__overlay">
                                                    <div class="card__header">
                                                        <svg class="card__arc" xmlns="http://www.w3.org/2000/svg">
                                                            <path/>
                                                        </svg>
                                                        <img class="card__thumb" src="../static/img/noImage.png" alt="썸네일 이미지 없음"/>
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
                        near_dict[i] = [title, address, file, distance, place_lat, place_lng, content_id];

                        let temp_html = `<li style="margin: 0 10px; height: 300px;">
                                             <a href="/near/place/${content_id}" class="card" onclick="getDetail(${i})">
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
            }
        })
    }

    function onGeoError() { //위치 정보 공유 거부 시
        alert('현재 위치를 찾을 수 없습니다.')
    }

    // 1번째 파라미터: 위치 공유 승인 시, 2번째 파라미터: 위치 공유 거부 시 실행
    navigator.geolocation.getCurrentPosition(onGeoOK, onGeoError);
}

function getDetail(i) {
    // near_dict = {
    //              i: [title, address, file, distance, placeLat, placeLng, contentId]
    //             }

    $.ajax({
        type: "POST",
        url: '/near/place',
        data: {
            title_give: near_dict[i][0],
            address_give: near_dict[i][1],
            file_give: near_dict[i][2],
            distance_give: near_dict[i][3],
            place_lat_give: near_dict[i][4],
            place_lng_give: near_dict[i][5],
            content_id_give: near_dict[i][6]
        },
        success: function (response) {
            if (response['result'] == 'success') {
                window.location.href = `/near/place/${near_dict[i][6]}`;
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
            trip_list = response['all_trips'];
            for (let i = 0; i < trip_list.length; i++) {
                let trip_id = trip_list[i]['id'];
                let trip_title = trip_list[i]['title'];
                let trip_place = trip_list[i]['place'];
                let trip_file = trip_list[i]['file'];
                let trip_date = trip_list[i]['date'];

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
                                                        <span onclick="updateTrip(${trip_id})">수정</span>
                                                        <span onclick="delTrip(${trip_id})">삭제</span>
                                                    </div>
                                                </div>
                                                <p class="card__description">${trip_place}</p>
                                            </div>
                                        </a>
                                    </li>`
                $('#trip_card').prepend(temp_html);
                slide2();
            }
        }
    })
}

function updateTrip(trip_id) {
    $.ajax({
        type: "GET",
        url: `/trips/update?id=${trip_id}`,
        data: {},
        success: function (response) {
            sessionStorage.setItem('id', trip_id);
            sessionStorage.setItem('title', response['title']);
            sessionStorage.setItem('place', response['place']);
            sessionStorage.setItem('review', response['review']);
            sessionStorage.setItem('file', response['file']);

            window.location.href = `/trips/form?id=${trip_id}`;
        }
    });
}


// 사용자가 올린 여행지 리뷰 삭제
function delTrip(trip_id) {
    $.ajax({
        type: "DELETE",
        url: "/trips",
        data: {trip_id_give: trip_id},
        success: function (response) {
            alert(response['msg'])
            window.location.reload();
        }
    });
}