/**
 * Created by chenguojun on 2017/2/10.
 */
(function ($, window, document, undefined) {
    var mapping = {
        "/api/core/exportTask/list": "sysExportTask"
    };
    App.requestMapping = $.extend({}, window.App.requestMapping, mapping);
    App.sysExportTask = {
        page: function (title) {
            window.App.content.empty();
            window.App.title(title);
            var content = $('<div class="panel-body" id="content"></div>');
            window.App.content.append(content);
            App.sysExportTask.initEvents();
        }
    };

    App.sysExportTask.initEvents = function () {
        var options = {
            url: App.href + "/api/core/exportTask/list",
            contentType: "table",
            showContentType: true,
            contentTypeItems: "table,card",
            pageNum: 1,//当前页码
            pageSize: 15,//每页显示条数
            idField: "id",//id域指定
            headField: "id",
            showCheck: true,//是否显示checkbox
            checkboxWidth: "3%",
            showIndexNum: false,
            indexNumWidth: "5%",
            sort: 'exportTime_desc',
            pageSelect: [2, 15, 30, 50],
            columns: [
                {
                    title: "任务名称",
                    field: "taskName"
                }, {
                    title: "导出用户",
                    field: "exportUser"
                }, {
                    title: "导出时间",
                    field: "exportTime",
                    sort: true
                }, {
                    title: "耗时",
                    field: "costTime"
                }, {
                    title: "状态",
                    field: "status",
                    width: "10%",
                    format: function (i, data) {
                        if (data.status == 2) {
                            return '<span class="label label-success">完成</span>'
                        } else if (data.status == 1) {
                            return '<span class="label label-warning">进行中</span>'
                        } else {
                            return '<span class="label label-danger">停止</span>'
                        }
                    }
                }
            ],
            actionColumnText: "操作",//操作列文本
            actionColumnWidth: "20%",
            actionColumns: [
                {
                    text: "下载",
                    cls: "btn-danger btn-sm",
                    visible: function (i, data) {
                        return data.status == 2;
                    },
                    handle: function (index, data) {
                        window.location.href = data.attachmentUri;
                    }
                }, {
                    text: "删除",
                    cls: "btn-danger btn-sm",
                    handle: function (index, data) {
                        bootbox.confirm("确定该操作?", function (result) {
                            if (result) {
                                var requestUrl = App.href + "/api/core/exportTask/delete";
                                $.ajax({
                                    type: "POST",
                                    dataType: "json",
                                    data: {
                                        id: data.id
                                    },
                                    url: requestUrl,
                                    success: function (data) {
                                        if (data.code === 200) {
                                            grid.reload();
                                        } else {
                                            alert(data.message);
                                        }
                                    },
                                    error: function (e) {
                                        alert("请求异常。");
                                    }
                                });
                            }
                        });
                    }
                }
            ],
            tools: [
                {
                    type: 'button',
                    text: '刷新',
                    cls: "btn btn-warning",
                    handle: function (g) {
                        g.reload();
                    }
                }
            ],
            search: {
                rowEleNum: 2,
                //搜索栏元素
                items: [
                    {
                        type: "text",
                        label: "导出用户",
                        name: "exportUser",
                        placeholder: "输入导出用户"
                    }
                ]
            }
        };
        grid = App.content.find("#content").orangeGrid(options);
    }
})(jQuery, window, document);