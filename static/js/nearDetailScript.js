function getMap() {
    let get_link = window.location.pathname;
    let do_split = get_link.split('/');
    let content_id = do_split[do_split.length - 1];

    let map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(
            Number(JSON.parse(sessionStorage.getItem('near_object'))[content_id]['place_lat']),
            Number(JSON.parse(sessionStorage.getItem('near_object'))[content_id]['place_lng'])
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
            Number(JSON.parse(sessionStorage.getItem('near_object'))[content_id]['place_lat']),
            Number(JSON.parse(sessionStorage.getItem('near_object'))[content_id]['place_lng'])
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

function getId() {
    let get_link = window.location.pathname;
    let do_split = get_link.split('/');
    let content_id = do_split[do_split.length - 1];

    return content_id;
}

function getItem() {
    $('#title').text(JSON.parse(sessionStorage.getItem('near_object'))[getId()]['title']);
    $('#file').attr('src', JSON.parse(sessionStorage.getItem('near_object'))[getId()]['file'])
    $('#address').text(JSON.parse(sessionStorage.getItem('near_object'))[getId()]['address']);
    $('#distance').text(`여기에서 ${JSON.parse(sessionStorage.getItem('near_object'))[getId()]['distance']}m 거리`);
}

function getDetailIntro() {
    let content_type_id = JSON.parse(sessionStorage.getItem('near_object'))[getId()]['content_type_id']
    console.log(typeof content_type_id)

    $.ajax({
        type: "POST",
        url: '/near/place/intro',
        data: {
            content_id_give: getId(),
            content_type_id_give: content_type_id,
        },
        success: function (response) {
            let detail_intro_list = response['detail_intro_list'];

            if (content_type_id == '12') {
                let usetime = detail_intro_list['usetime'];
                let restdate = detail_intro_list['restdate'];
                let infocenter = detail_intro_list['infocenter'];
                let parking = detail_intro_list['parking'];
                if (!parking) {
                    parking = infocenter + '로 별도 문의'
                };
                let temp_html = `<ul class="list-group list-group-flush">
                                     <li class="list-group-item">이용시간:${usetime}</li>
                                     <li class="list-group-item">휴무일:${restdate}</li>
                                     <li class="list-group-item">문의 및 안내:${infocenter}</li>
                                     <li class="list-group-item">주차시설:${parking}</li>
                                 </ul>`;
                $('#info_card').append(temp_html);
            } else if (content_type_id == '39') {
                let firstmenu = detail_intro_list['firstmenu'];
                let opentimefood = detail_intro_list['opentimefood'];
                let restdatefood = detail_intro_list['restdatefood'];
                let packing = detail_intro_list['packing'];
                let infocenterfood = detail_intro_list['infocenterfood'];
                let parkingfood = detail_intro_list['parkingfood'];

                let temp_html = `<ul class="list-group list-group-flush">
                                     <li class="list-group-item">대표메뉴:${firstmenu}</li>
                                     <li class="list-group-item">영업시간:${opentimefood}</li>
                                      <li class="list-group-item">쉬는날:${restdatefood}</li>
                                       <li class="list-group-item">포장가능여부:${packing}</li>
                                     <li class="list-group-item">문의 및 안내:${infocenterfood}</li>
                                     <li class="list-group-item">주차 시설:${parkingfood}</li>
                                 </ul>`;
                $('#info_card').append(temp_html);
            } else if (content_type_id == '32') {
                let checkintime = detail_intro_list['checkintime'];
                let checkouttime = detail_intro_list['checkouttime'];
                let accomcountlodging = detail_intro_list['accomcountlodging'];
                let chkcooking = detail_intro_list['chkcooking'];
                let infocenterlodging = detail_intro_list['infocenterlodging'];
                let parking = detail_intro_list['parking'];
                let temp_html = `<ul class="list-group list-group-flush">
                                     <li class="list-group-item">입실시간:${checkintime}</li>
                                     <li class="list-group-item">퇴실시간:${checkouttime}</li>
                                     <li class="list-group-item">숙박가능인원:${accomcountlodging}</li>
                                     <li class="list-group-item">객실 내 취사:${chkcooking}</li>
                                     <li class="list-group-item">문의 및 안내:${infocenterlodging}</li>
                                     <li class="list-group-item">주차 시설:${parking}</li>
                                 </ul>`;
                $('#info_card').append(temp_html);
            } else if (content_type_id == '15') {
                let bookingplace = detail_intro_list['bookingplace'];
                let eventstartdate = detail_intro_list['eventstartdate'];
                let eventenddate = detail_intro_list['eventenddate'];
                let program = detail_intro_list['program'];
                let eventplace = detail_intro_list['eventplace'];
                let placeinfo = detail_intro_list['placeinfo'];
                let sponsor1 = detail_intro_list['sponsor1'];
                let sponsor1tel = detail_intro_list['sponsor1tel'];
                let temp_html = `<ul class="list-group list-group-flush">
                                    <li class="list-group-item">예매처:${bookingplace}</li>
                                    <li class="list-group-item">행사시작일:${eventstartdate}</li>
                                    <li class="list-group-item">행사종료일:${eventenddate}</li>
                                    <li class="list-group-item">프로그램:${program}</li>
                                    <li class="list-group-item">행사장소:${eventplace}</li>
                                    <li class="list-group-item">행사장위치안내:${placeinfo}</li>
                                    <li class="list-group-item">주최:${sponsor1}</li>
                                    <li class="list-group-item">주최자 연락처:${sponsor1tel}</li>
                                 </ul>`;
                $('#info_card').append(temp_html);

            }

        }
    });
}

function weather() {
    let place_lat = JSON.parse(sessionStorage.getItem('near_object'))[getId()]['place_lat']
    let place_lng = JSON.parse(sessionStorage.getItem('near_object'))[getId()]['place_lng']

    $.ajax({
        type: "POST",
        url: '/near/place/weather',
        data: {
            place_lat: place_lat,
            place_lng: place_lng
        },
        success: function (response) {
            let icon = response['weather_info']['weather'][0]['icon'];
            let weather = response['weather_info']['weather'][0]['main'];
            let temp = response['weather_info']['main']['temp'];
            temp = Number(temp).toFixed(1); //소수점 둘째자리에서 반올림해 첫째자리까지 표현
            let location = response['weather_info']['name'];
            if (weather == 'Rain') {
                let rain = response['weather_info']['rain']['1h'];
                $('#rain').text(rain + 'mm/h');
            }
            let wind = response['weather_info']['wind']['speed'];

            $('#icon').attr('src', `https://openweathermap.org/img/w/${icon}.png`);
            $('#location').text(location);
            $('#weather').text(weather);
            $('#temp').text(temp + '°C');
            $('#wind').text(wind + 'm/s');
        }
    });
}

function toggle_bookmark(content_id) {

    if ($('#bookmark').hasClass("fas")) {

        $.ajax({
            type: "POST",
            url: "/near/place/bookmark",
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
            url: "/near/place/bookmark",
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

function getBookmark() {
    $.ajax({
        type: "GET",
        url: `/near/place/bookmark/${getId()}`,
        data: {},
        success: function (response) {
            if (response['bookmark_status'] == "True") {
                $('#bookmark').removeClass("far").addClass("fas");
            } else {
                $('#bookmark').removeClass("fas").addClass("far")
            }
        }
    });
}
