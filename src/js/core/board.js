/**
 * Created by chenguojun on 8/10/16.
 */
;
(function ($, window, document, undefined) {
    var requestMapping = {
        "/api/core/boardIndex": "coreBoardIndex"
    };
    App.requestMapping = $.extend({}, App.requestMapping, requestMapping);
    App.coreBoardIndex = {
        page: function (title) {
            App.content.empty();
            App.title(title);
            var content = $('<div class="panel-body">' +
                '<div class="row">' +
                '<div class="col-md-12" >' +
                '<div class="panel panel-default" >' +
                '<div class="panel-heading">选择' +
                '</div>' +
                '<div class="panel-body">' +
                '<select name="board" class="form-control input-sm"></select>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="col-md-12" id="content">' +
                '</div>' +
                '</div>' +
                '</div>');
            App.content.append(content);
            initEvents();
        }
    };
    /**
     * 初始化事件
     */
    var initEvents = function () {

        $.ajax({
            type: "GET",
            dataType: "json",
            url: App.href + '/api/core/board/options',
            success: function (data) {
                if (data.length > 0) {
                    $.each(data, function (i, d) {
                        var option = $('<option value="' + d.value + '">' + d.text + '</option>');
                        App.content.find("select[name=board]").append(option);
                    });
                    $.ajax({
                        type: "GET",
                        dataType: "json",
                        url: App.href + '/api/core/board/load/' + data[0].value,
                        success: function (d) {
                            App.content.find("#content").empty();
                            App.content.find("#content").orangeBoardView(JSON.parse(d.data.layoutJson));
                        }
                    });
                    App.content.find("select[name=board]").on("change", function () {
                        var id = $(this).val();
                        $.ajax({
                            type: "GET",
                            dataType: "json",
                            url: App.href + '/api/core/board/load/' + id,
                            success: function (d) {
                                App.content.find("#content").empty();
                                App.content.find("#content").orangeBoardView(JSON.parse(d.data.layoutJson));
                            }
                        });
                    });
                }
            },
            error: function (e) {
                alert("请求异常。")
            }
        });


    };


})(jQuery, window, document);
