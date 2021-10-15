function getId() {
    let get_link = window.location.pathname;
    let do_split = get_link.split('/');
    let trip_id = do_split[do_split.length - 1];

    return trip_id;
}

function getItem() {
    $.ajax({
        type: "POST",
        url: `/trips/place/render`,
        data: {trip_id_give: getId()},
        success: function (response) {
            $('#profile_img').attr('src', `https://dk9q1cr2zzfmc.cloudfront.net/profile/${response['trip']['profile_img']}`);
            $('#nickname').text(response['trip']['nickname']);
            $('#title').text(response['trip']['title']);
            $('#file').attr('src', `https://dk9q1cr2zzfmc.cloudfront.net/trips/${response['trip']['file']}`);
            $('#place').text(response['trip']['place']);
            $('#review').text(response['trip']['review']);
            $('#date').text(response['trip']['date']);
            $('#like').text(response['trip']['like']);
        }
    });
}

function updateTrip(trip_id) {
    $.ajax({
        type: "POST",
        url: '/trips/session',
        data: {trip_id_give: trip_id},
        success: function (response) {
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
        url: `/trips/place/${trip_id}`,
        data: {},
        success: function (response) {
            alert(response['msg'])
            window.location.href = "/trips/list";
        }
    });
}

// 좋아요 기능

function toggle_like(trip_id) {
    let like = parseInt($('#like').text());

    if ($('#like').hasClass("fas")) {

        $.ajax({
            type: "POST",
            url: "/trips/place/like",
            data: {
                trip_id_give: trip_id,
                action_give: "uncheck"
            },
            success: function (response) {
                if (response['result'] == 'success') {
                    $('#like').removeClass("fas").addClass("far")
                    $('#like').text(like - 1);
                }
            }
        })
    } else {
        $.ajax({
            type: "POST",
            url: "/trips/place/like",
            data: {
                trip_id_give: trip_id,
                action_give: "check"
            },
            success: function (response) {
                if (response['result'] == 'success') {
                    $('#like').removeClass("far").addClass("fas")
                    $('#like').text(like + 1);
                }
            }
        });

    }
}

function get_like() {
    $.ajax({
        type: "GET",
        url: `/trips/place/like/${getId()}`,
        data: {},
        success: function (response) {
            if (response['like_status'] == "True") {
                $('#like').removeClass("far").addClass("fas");
            } else {
                $('#like').removeClass("fas").addClass("far")
            }
        }
    });
}
