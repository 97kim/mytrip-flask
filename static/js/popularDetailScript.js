// slick 슬라이드
function slide4() {
    $(function () {
        // Uncaught TypeError: Cannot read property 'add' of null” 오류 -> slick을 여러번 불러와서 발생
        // .not('.slick-initialized')로 하면 오류가 안 난다.

        $('.slider-li4').not('.slick-initialized').slick({
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
            prevArrow: $('#btn_prev_popular_detail'),		// 이전 화살표 모양 설정
            nextArrow: $('#btn_next_popular_detail'),		// 다음 화살표 모양 설정
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

function getMap_popular() {
    let get_link = window.location.pathname;
    let do_split = get_link.split('/');
    let content_id = do_split[do_split.length - 1];

    let map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(
            Number(JSON.parse(sessionStorage.getItem('popular_object'))[content_id]['place_lat']),
            Number(JSON.parse(sessionStorage.getItem('popular_object'))[content_id]['place_lng'])
        ),
        zoom: 16,
        zoomControl: true,
        zoomControlOptions: {
            style: naver.maps.ZoomControlStyle.SMALL,
            position: naver.maps.Position.TOP_RIGHT
        }
    });

    let marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(
            Number(JSON.parse(sessionStorage.getItem('popular_object'))[content_id]['place_lat']),
            Number(JSON.parse(sessionStorage.getItem('popular_object'))[content_id]['place_lng'])
        ),
        map: map,
        icon: {
            content: '<img src="https://dk9q1cr2zzfmc.cloudfront.net/img/marker.png">',
            anchor: new naver.maps.Point(20, 25)
        }
    });

    let infowindow = new naver.maps.InfoWindow({
        content: `<div style="width: 50px;height: 20px;text-align: center"><h5>here!</h5></div>`,
    });

    naver.maps.Event.addListener(marker, "click", function () {
        // infowindow.getMap(): 정보창이 열려있을 때는 연결된 지도를 반환하고 닫혀있을 때는 null을 반환
        if (infowindow.getMap()) {
            infowindow.close();
        } else {
            infowindow.open(map, marker);
        }
    });
}

function getId_popular() {
    let get_link = window.location.pathname;
    let do_split = get_link.split('/');
    let content_id = do_split[do_split.length - 1];

    return content_id;
}

function getItem_popular() {
    $('#title').text(JSON.parse(sessionStorage.getItem('popular_object'))[getId_popular()]['title']);
    $('#file').attr('src', JSON.parse(sessionStorage.getItem('popular_object'))[getId_popular()]['file'])
    $('#address').text(JSON.parse(sessionStorage.getItem('popular_object'))[getId_popular()]['address']);
    $('#distance').text('이곳 근처 여행지는 어때?(기능 추가 예정)');
}

function weather_popular() {
    let place_lat = JSON.parse(sessionStorage.getItem('popular_object'))[getId_popular()]['place_lat']
    let place_lng = JSON.parse(sessionStorage.getItem('popular_object'))[getId_popular()]['place_lng']

    $.ajax({
        type: "POST",
        url: '/popular/place/weather',
        data: {
            place_lat: place_lat,
            place_lng: place_lng
        },
        success: function (response) {
            let icon = response['weather_info_popular']['weather'][0]['icon'];
            let weather = response['weather_info_popular']['weather'][0]['main'];
            let temp = response['weather_info_popular']['main']['temp'];
            temp = Number(temp).toFixed(1); //소수점 둘째자리에서 반올림해 첫째자리까지 표현
            let location = response['weather_info_popular']['name'];
            if (weather == 'Rain') {
                let rain = response['weather_info_popular']['rain']['1h'];
                $('#rain').text(rain + 'mm/h');
            }
            let wind = response['weather_info_popular']['wind']['speed'];

            $('#icon').attr('src', `https://openweathermap.org/img/w/${icon}.png`);
            $('#location').text(location);
            $('#weather').text(weather);
            $('#temp').text(temp + '°C');
            $('#wind').text(wind + 'm/s');
        }
    });
}

function toggle_bookmark_popular(content_id) {
    if ($('#bookmark').hasClass("fas")) {
        $.ajax({
            type: "POST",
            url: "/popular/place/bookmark",
            data: {
                content_id_give: content_id,
                action_give: "uncheck"
            },
            success: function (response) {
                if (response['result'] == 'success') {
                    $('#bookmark').removeClass("fas").addClass("far")
                }
            }
        })
    } else {
        $.ajax({
            type: "POST",
            url: "/popular/place/bookmark",
            data: {
                content_id_give: content_id,
                action_give: "check"
            },
            success: function (response) {
                if (response['result'] == 'success') {
                    $('#bookmark').removeClass("far").addClass("fas")
                }
            }
        });

    }
}

function getBookmark_popular() {
    $.ajax({
        type: "GET",
        url: `/popular/place/bookmark/${getId_popular()}`,
        data: {},
        success: function (response) {
            console.log(response['bookmark_status']);
            if (response['bookmark_status'] == "True") {
                $('#bookmark').removeClass("far").addClass("fas");
            } else {
                $('#bookmark').removeClass("fas").addClass("far")
            }
        }
    });
}