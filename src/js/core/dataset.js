/**
 * Created by chenguojun on 2017/2/10.
 */
(function ($, window, document, undefined) {
    var mapping = {
        "/api/core/dataSet/list": "dataSet"
    };
    App.requestMapping = $.extend({}, window.App.requestMapping, mapping);
    App.dataSet = {
        page: function (title) {
            window.App.content.empty();
            window.App.title(title);
            var content = $('<div class="panel-body" id="content"></div>');
            window.App.content.append(content);
            initEvents();
        }
    };
    var initEvents = function () {
        var options = {
            url: App.href + "/api/core/dataSet/list",
            contentType: "table",
            showContentType: true,
            contentTypeItems: "table,card",
            pageNum: 1,//当前页码
            pageSize: 15,//每页显示条数
            idField: "id",//id域指定
            headField: "uri",
            showCheck: true,//是否显示checkbox
            checkboxWidth: "3%",
            showIndexNum: false,
            indexNumWidth: "5%",
            pageSelect: [2, 15, 30, 50],
            sort: 'id_desc',
            columns: [
                {
                    title: "工作表",
                    field: "queryName"
                }
            ],
            actionColumnText: "操作",//操作列文本
            actionColumnWidth: "20%",
            actionColumns: [
                {
                    text: "查看",
                    visible: function (i, d) {
                        return d.jsonContent != '' && d.jsonContent != null;
                    },
                    cls: "btn-success btn-sm",
                    handle: function (index, data) {
                        if (data.jsonContent != '' && data.jsonContent != null) {
                            var modal = $.orangeModal({
                                id: "view_modal",
                                title: "查看",
                                buttons: [
                                    {
                                        type: 'button',
                                        text: '关闭',
                                        cls: "btn-default",
                                        handle: function (m) {
                                            m.hide()
                                        }
                                    }
                                ],
                                destroy: true
                            }).show();
                            modal.$body.orangeGrid(eval('(' + data.jsonContent + ')'));
                        } else {
                            alert("无效的json");
                        }
                    }
                }
            ],
            search: {
                rowEleNum: 2,
                //搜索栏元素
                items: [
                    {
                        type: "text",
                        label: "工作表名称",
                        name: "queryName",
                        placeholder: "输入工作表名称"
                    }
                ]
            }
        };
        App.content.find("#content").orangeGrid(options);
    }
})(jQuery, window, document);