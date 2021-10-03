// 리뷰 작성
function update() {
    let get_link = window.location.search;
    let do_split = get_link.split('=');
    let get_id = do_split[1];

    let review_title = $('#title').val()
    let review_place = $('#place').val()
    let review_content = $('#review').val()
    let review_file = $('#file')[0].files[0]

    let form_data = new FormData()

    form_data.append("review_id_give", get_id)
    form_data.append("review_file_give", review_file)
    form_data.append("review_title_give", review_title)
    form_data.append("review_place_give", review_place)
    form_data.append("review_content_give", review_content)

    $.ajax({
        type: "POST",
        url: `/trips/${get_id}`,
        data: form_data,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            alert(response["msg"])
            window.location.href = '/';
        }
    });
}

// 파일 업로더 js

function readURL(input) {
    if (input.files && input.files[0]) {

        var reader = new FileReader();

        reader.onload = function (e) {
            $('.image-upload-wrap').hide();

            $('.file-upload-image').attr('src', e.target.result);
            $('.file-upload-content').show();

            $('.image-title').html(input.files[0].name);
        };

        reader.readAsDataURL(input.files[0]);

    } else {
        removeUpload();
    }
}

function removeUpload() {
    $('.file-upload-input').replaceWith($('.file-upload-input').clone());
    $('.file-upload-content').hide();
    $('.image-upload-wrap').show();
}

$('.image-upload-wrap').bind('dragover', function () {
    $('.image-upload-wrap').addClass('image-dropping');
});
$('.image-upload-wrap').bind('dragleave', function () {
    $('.image-upload-wrap').removeClass('image-dropping');
});