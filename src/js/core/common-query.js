/**
 * Created by chenguojun on 2017/2/10.
 */
(function ($, window, document, undefined) {
    var mapping = {
        "/api/core/commonQuery/list": "commonQuery"
    };
    App.requestMapping = $.extend({}, window.App.requestMapping, mapping);
    App.commonQuery = {
        page: function (title) {
            window.App.content.empty();
            window.App.title(title);
            var content = $('<div class="panel-body" id="content"></div>');
            window.App.content.append(content);
            App.commonQuery.initEvents();
        }
    };
    var formItems = [
        {
            type: 'hidden',
            name: 'id',
            id: 'id'

        }, {
            type: 'text',
            name: 'queryName',
            id: 'queryName',
            label: '查询名称',
            cls: 'input-xxlarge',
            rule: {
                required: true
            },
            message: {
                required: "请输入查询名称"
            }
        }, {
            type: 'text',
            name: 'tableAlias',
            id: 'tableAlias',
            label: '表别名',
            cls: 'input-xxlarge'
        },
        {
            type: 'textarea',
            name: 'selectQuery',
            id: 'selectQuery',
            label: '选择sql',
            cls: 'input-xxlarge'
        },
        {
            type: 'textarea',
            name: 'exportQuery',
            id: 'exportQuery',
            label: '导出参数',
            cls: 'input-xxlarge'
        },
        {
            type: 'textarea',
            name: 'whereQuery',
            id: 'whereQuery',
            label: 'where参数',
            cls: 'input-xxlarge'
        },
        {
            type: 'textarea',
            name: 'groupQuery',
            id: 'groupQuery',
            label: 'group语句',
            cls: 'input-xxlarge'
        },
        {
            type: 'textarea',
            name: 'orderQuery',
            id: 'orderQuery',
            label: '排序',
            cls: 'input-xxlarge'
        },
        {
            type: 'textarea',
            name: 'htmlContent',
            id: 'htmlContent',
            label: 'html脚本',
            cls: 'input-xxlarge'
        },
        {
            type: 'textarea',
            name: 'scriptContent',
            id: 'scriptContent',
            label: 'javascript脚本',
            cls: 'input-xxlarge',
            code: true,
            rows: 10
        },
        {
            type: 'textarea',
            name: 'jsonContent',
            id: 'jsonContent',
            label: 'json',
            cls: 'input-xxlarge',
            code: true,
            rows: 10
        }
    ];
    App.commonQuery.initEvents = function () {
        var grid = {};
        var options = {
            url: App.href + "/api/core/commonQuery/list",
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
                    title: "查询名称",
                    field: "queryName"
                }, {
                    title: "表别名",
                    field: "tableAlias"
                }
            ],
            actionColumnText: "操作",//操作列文本
            actionColumnWidth: "20%",
            actionColumns: [
                {
                    text: "编辑",
                    cls: "btn-info btn-sm",
                    handle: function (index, data) {
                        var modal = $.orangeModal({
                            id: "edit_modal",
                            title: "添加",
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
                        var formOpts = {
                            id: "edit_form",
                            name: "edit_form",
                            method: "POST",
                            action: App.href + "/api/core/commonQuery/update",
                            ajaxSubmit: true,
                            rowEleNum: 1,
                            ajaxSuccess: function () {
                                modal.hide();
                                grid.reload();
                            },
                            submitText: "提交",//保存按钮的文本
                            showReset: true,//是否显示重置按钮
                            resetText: "重置",//重置按钮文本
                            isValidate: true,//开启验证
                            buttons: [{
                                type: 'button',
                                text: '关闭',
                                handle: function () {
                                    modal.hide()
                                }
                            }],
                            buttonsAlign: "center",
                            items: formItems
                        };
                        var form = modal.$body.orangeForm(formOpts);
                        form.loadRemote(App.href + "/api/core/commonQuery/load/" + data.id)
                    }
                },
                {
                    text: "删除",
                    cls: "btn-danger btn-sm",
                    handle: function (index, data) {
                        bootbox.confirm("确定该操作?", function (result) {
                            if (result) {
                                var requestUrl = App.href + "/api/core/commonQuery/delete";
                                $.ajax({
                                    type: "GET",
                                    dataType: "json",
                                    data: {
                                        id: data.id
                                    },
                                    url: requestUrl,
                                    success: function (data) {
                                        if (data.code === 200) {
                                            grid.reload()
                                        } else {
                                            alert(data.message)
                                        }
                                    },
                                    error: function (e) {
                                        alert("请求异常。")
                                    }
                                });
                            }
                        });
                    }
                },
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
                },
                {
                    text: "共享用户",
                    cls: "btn-warning btn-sm",
                    visible: function (i, d) {
                        return d.jsonContent != '' && d.jsonContent != null;
                    },
                    handle: function (index, data) {
                        var userGrid;
                        var modal = $.orangeModal({
                            id: "user_grid",
                            title: "共享用户",
                            destroy: true
                        });
                        var options = {
                            url: App.href + "/api/core/commonQuery/hasQueryUser?queryId=" + data.id,
                            pageNum: 1,//当前页码
                            pageSize: 15,//每页显示条数
                            idField: "userId",//id域指定
                            showCheck: true,//是否显示checkbox
                            checkboxWidth: "3%",
                            showIndexNum: false,
                            indexNumWidth: "5%",
                            pageSelect: [2, 15, 30, 50],
                            columns: [{
                                title: "用户id",
                                field: "userId",
                                sort: true,
                                width: "5%"
                            }, {
                                title: "登录名",
                                field: "loginName",
                                sort: true
                            }, {
                                title: "昵称",
                                field: "displayName"
                            }],
                            actionColumnText: "操作",//操作列文本
                            actionColumnWidth: "20%",
                            actionColumns: [{
                                textHandle: function (index, userData) {
                                    if (userData.hasQuery) {
                                        return "取消";
                                    } else {
                                        return "选择";
                                    }
                                },
                                clsHandle: function (index, userData) {
                                    if (userData.hasQuery) {
                                        return "btn-danger btn-sm";
                                    } else {
                                        return "btn-primary btn-sm";
                                    }
                                },
                                handle: function (index, userData) {
                                    var requestUrl = App.href + "/api/core/commonQuery/selectUser";
                                    if (userData.hasQuery) {
                                        requestUrl = App.href + "/api/core/commonQuery/cancelUser";
                                    }
                                    $.ajax({
                                        type: "GET",
                                        dataType: "json",
                                        data: {
                                            queryId: data.id,
                                            userId: userData.userId
                                        },
                                        url: requestUrl,
                                        success: function (data) {
                                            if (data.code === 200) {
                                                userGrid.reload();
                                            } else {
                                                alert(data.message);
                                            }
                                        },
                                        error: function (e) {
                                            alert("请求异常。");
                                        }
                                    });
                                }
                            }],
                            search: {
                                rowEleNum: 2,
                                //搜索栏元素
                                items: [{
                                    type: "text",
                                    label: "登录名",
                                    name: "loginName",
                                    placeholder: "输入要搜索的登录名"
                                }, {
                                    type: "text",
                                    label: "昵称",
                                    name: "displayName",
                                    placeholder: "输入要搜索的昵称"
                                }]
                            }
                        };
                        userGrid = modal.$body.orangeGrid(options);
                        modal.show();
                    }
                },
                {
                    text: "共享角色",
                    cls: "btn-warning btn-sm",
                    visible: function (i, d) {
                        return d.jsonContent != '' && d.jsonContent != null;
                    },
                    handle: function (index, data) {
                        var modal = $.orangeModal({
                            id: "role_grid",
                            title: "共享角色",
                            destroy: true
                        });
                        var options = {
                            url: App.href + "/api/core/commonQuery/hasQueryRole?queryId=" + data.id,
                            pageNum: 1,//当前页码
                            pageSize: 15,//每页显示条数
                            idField: "roleId",//id域指定
                            showCheck: true,//是否显示checkbox
                            checkboxWidth: "3%",
                            showIndexNum: false,
                            indexNumWidth: "5%",
                            pageSelect: [2, 15, 30, 50],
                            columns: [
                                {
                                    title: "角色ID",
                                    field: "roleId",
                                    sort: true,
                                    width: "5%"
                                }, {
                                    title: "角色名",
                                    field: "roleName",
                                    sort: true
                                }
                            ],
                            actionColumnText: "操作",//操作列文本
                            actionColumnWidth: "20%",
                            actionColumns: [{
                                textHandle: function (index, d) {
                                    if (d.hasQuery) {
                                        return "取消";
                                    } else {
                                        return "选择";
                                    }
                                },
                                clsHandle: function (index, d) {
                                    if (d.hasQuery) {
                                        return "btn-danger btn-sm";
                                    } else {
                                        return "btn-primary btn-sm";
                                    }
                                },
                                handle: function (index, d, g) {
                                    var requestUrl = App.href + "/api/core/commonQuery/selectRole";
                                    if (d.hasQuery) {
                                        requestUrl = App.href + "/api/core/commonQuery/cancelRole";
                                    }
                                    $.ajax({
                                        type: "GET",
                                        dataType: "json",
                                        data: {
                                            queryId: data.id,
                                            roleId: d.roleId
                                        },
                                        url: requestUrl,
                                        success: function (data) {
                                            if (data.code === 200) {
                                                g.reload();
                                            } else {
                                                alert(data.message);
                                            }
                                        },
                                        error: function (e) {
                                            alert("请求异常。");
                                        }
                                    });
                                }
                            }],
                            search: {
                                rowEleNum: 2,
                                //搜索栏元素
                                items: [{
                                    type: "text",
                                    label: "角色名",
                                    name: "roleName",
                                    placeholder: "输入要搜索的角色名"
                                }]
                            }
                        };
                        modal.$body.orangeGrid(options);
                        modal.show();
                    }
                }
            ],
            tools: [
                {
                    text: " 添 加",//按钮文本
                    cls: "btn btn-primary",//按钮样式
                    handle: function (grid) {
                        var modal = $.orangeModal({
                            id: "add_modal",
                            title: "添加",
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
                        var formOpts = {
                            id: "add_form",
                            name: "add_form",
                            method: "POST",
                            action: App.href + "/api/core/commonQuery/insert",
                            ajaxSubmit: true,
                            rowEleNum: 1,
                            ajaxSuccess: function () {
                                modal.hide()
                                grid.reload()
                            },
                            submitText: "提交",//保存按钮的文本
                            showReset: true,//是否显示重置按钮
                            resetText: "重置",//重置按钮文本
                            isValidate: true,//开启验证
                            buttons: [{
                                type: 'button',
                                text: '关闭',
                                handle: function () {
                                    modal.hide()
                                }
                            }],
                            buttonsAlign: "center",
                            items: formItems
                        };
                        modal.$body.orangeForm(formOpts)
                    }
                }
            ],
            search: {
                rowEleNum: 2,
                //搜索栏元素
                items: [
                    {
                        type: "text",
                        label: "查询名称",
                        name: "queryName",
                        placeholder: "输入查询名称"
                    }, {
                        type: "text",
                        label: "表别名",
                        name: "tableAlias",
                        placeholder: "输入完整表别名"
                    }
                ]
            }
        };
        grid = App.content.find("#content").orangeGrid(options);
    }
})(jQuery, window, document);