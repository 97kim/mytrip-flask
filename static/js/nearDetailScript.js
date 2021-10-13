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
        icon: "../../static/img/marker.png"
    });

    let infowindow = new naver.maps.InfoWindow({
        content: `<div style="width: 50px;height: 20px;text-align: center"><h5>here!</h5></div>`,
    });

    naver.maps.Event.addListener(marker, "click", function () {
        console.log(infowindow.getMap()); // 정보창이 열려있을 때는 연결된 지도를 반환하고 닫혀있을 때는 null을 반환
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
            console.log(response['bookmark_status']);
            if (response['bookmark_status'] == "True") {
                $('#bookmark').removeClass("far").addClass("fas");
            } else {
                $('#bookmark').removeClass("fas").addClass("far")
            }
        }
    });
}