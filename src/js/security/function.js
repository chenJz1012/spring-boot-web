/**
 * Created by chenguojun on 8/10/16.
 */
;
(function ($, window, document, undefined) {
    /**
     * 菜单菜单 对应 当前的唯一别名
     * @type {{/api/security/function/pageList: string}}
     */
    var uploadMapping = {
        "/api/security/function/pageList": "sysFunction"
    }
    App.requestMapping = $.extend({}, window.App.requestMapping, uploadMapping);
    App.sysFunction = {
        page: function (title) {
            window.App.content.empty();
            window.App.title(title);
            var content = $('<div class="panel-body" id="function_grid"></div>');
            window.App.content.append(content);
            App.sysFunction.initEvents();
        }
    }
    App.sysFunction.initEvents = function () {
        var grid;
        var options = {
            url: App.href + "/api/security/function/pageList",
            beforeSend: function (request) {
                request.setRequestHeader("X-Auth-Token", App.token);
            },
            contentType: "card",
            contentTypeItems : "table,card,list",
            pageNum: 1,//当前页码
            pageSize: 15,//每页显示条数
            idField: "id",//id域指定
            headField: "functionName",
            showCheck: true,//是否显示checkbox
            checkboxWidth: "3%",
            showIndexNum: false,
            indexNumWidth: "5%",
            pageSelect: [2, 15, 30, 50],
            columns: [{
                title: "id",
                field: "id",
                sort: true,
                width: "5%"
            }, {
                title: "父id",
                field: "parentId",
                sort: true,
                width: "5%"
            }, {
                title: "菜单名称",
                field: "functionName",
                sort: true
            }, {
                title: "路径",
                field: "action",
                sort: true
            }, {
                title: "排序号",
                field: "functionDesc"
            }],
            actionColumnText: "操作",//操作列文本
            actionColumnWidth: "20%",
            actionColumns: [{
                text: "编辑",
                cls: "btn-primary btn-sm",
                handle: function (index, data) {
                    var modal = $.orangeModal({
                        id: "functionForm",
                        title: "编辑菜单",
                        destroy: true
                    });
                    var formOpts = {
                        id: "function_form",//表单id
                        name: "function_form",//表单名
                        method: "POST",//表单method
                        action: App.href + "/api/security/function/update",//表单action
                        ajaxSubmit: true,//是否使用ajax提交表单
                        beforeSubmit: function () {
                        },
                        beforeSend: function (request) {
                            request.setRequestHeader("X-Auth-Token", App.token);
                        },
                        ajaxSuccess: function () {
                            modal.hide();
                            grid.reload();
                        },
                        submitText: "保存",//保存按钮的文本
                        showReset: true,//是否显示重置按钮
                        resetText: "重置",//重置按钮文本
                        isValidate: true,//开启验证
                        buttons: [{
                            type: 'button',
                            text: '关闭',
                            handle: function () {
                                modal.hide();
                            }
                        }],
                        buttonsAlign: "center",
                        items: [{
                            type: 'hidden',
                            name: 'id',
                            id: 'id'
                        }, {
                            type: 'tree',//类型
                            name: 'parentId',
                            id: 'parentId',//id
                            label: '父菜单',//左边label
                            url: App.href + "/api/security/function/treeNodes",
                            expandAll: true,
                            autoParam: ["id", "name", "pId"],
                            chkStyle: "radio"
                        }, {
                            type: 'text',//类型
                            name: 'functionName',//name
                            id: 'functionName',//id
                            label: '菜单名',//左边label
                            rule: {
                                required: true
                            },
                            message: {
                                required: "请输入菜单名"
                            }
                        }, {
                            type: 'text',//类型
                            name: 'action',//name
                            id: 'action',//id
                            label: '菜单路径',//左边label
                            rule: {
                                required: true
                            },
                            message: {
                                required: "菜单路径"
                            }
                        }, {
                            type: 'radioGroup',
                            name: 'display',
                            id: 'display',
                            label: '是否显示',
                            inline: true,
                            items: [{
                                value: true,
                                text: '显示'
                            }, {
                                value: false,
                                text: '隐藏'
                            }],
                            rule: {
                                required: true
                            },
                            message: {
                                required: "请选择"
                            }
                        }, {
                            type: 'text',//类型
                            name: 'functionDesc',//name
                            id: 'functionDesc',//id
                            label: '排序号',//左边label
                            rule: {
                                required: true,
                                digits: true
                            },
                            message: {
                                required: "请输入排序号",
                                digits: "必须输入整数"
                            }
                        }]
                    };
                    var form = modal.$body.orangeForm(formOpts);
                    form.loadRemote(App.href + "/api/security/function/load/" + data.id);
                    modal.show();
                }
            }, {
                text: "删除",
                cls: "btn-danger btn-sm",
                handle: function (index, data) {
                    bootbox.confirm("确定该操作?", function (result) {
                        if (result) {
                            var requestUrl = App.href + "/api/security/function/delete";
                            $.ajax({
                                type: "POST",
                                beforeSend: function (request) {
                                    request.setRequestHeader("X-Auth-Token", App.token);
                                },
                                dataType: "json",
                                data: {
                                    functionId: data.id
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
            }],
            tools: [
                {
                    text: " 添 加",//按钮文本
                    cls: "btn btn-sm btn-primary",
                    icon: "fa fa-plus",
                    handle: function (grid) {
                        var modal = $.orangeModal({
                            id: "functionForm",
                            title: "添加菜单",
                            destroy: true
                        });
                        var formOpts = {
                            id: "add_function_form",
                            name: "add_function_form",
                            method: "POST",
                            action: App.href + "/api/security/function/insert",//表单action
                            ajaxSubmit: true,//是否使用ajax提交表单
                            rowEleNum: 1,
                            beforeSubmit: function () {
                            },
                            beforeSend: function (request) {
                            },
                            ajaxSuccess: function () {
                                modal.hide();
                                grid.reload();
                            },
                            submitText: "保存",//保存按钮的文本
                            showReset: true,//是否显示重置按钮
                            resetText: "重置",//重置按钮文本
                            isValidate: true,//开启验证
                            buttons: [{
                                type: 'button',
                                text: '关闭',
                                handle: function () {
                                    modal.hide();
                                }
                            }],
                            buttonsAlign: "center",
                            items: [{
                                type: 'tree',
                                name: 'parentId',
                                id: 'parentId',
                                label: '父菜单',
                                url: App.href + "/api/security/function/treeNodes",
                                expandAll: true,
                                autoParam: ["id", "name", "pId"],
                                chkStyle: "radio"
                            }, {
                                type: 'text',//类型
                                name: 'functionName',//name
                                id: 'functionName',//id
                                label: '菜单名',//左边label
                                rule: {
                                    required: true
                                },
                                message: {
                                    required: "请输入菜单名"
                                }
                            }, {
                                type: 'text',//类型
                                name: 'action',//name
                                id: 'action',//id
                                label: '菜单路径',//左边label
                                rule: {
                                    required: true
                                },
                                message: {
                                    required: "菜单路径"
                                }
                            }, {
                                type: 'radioGroup',
                                name: 'display',
                                id: 'display',
                                label: '是否显示',
                                inline: true,
                                items: [{
                                    value: true,
                                    text: '显示'
                                }, {
                                    value: false,
                                    text: '隐藏'
                                }],
                                rule: {
                                    required: true
                                },
                                message: {
                                    required: "请选择"
                                }
                            }, {
                                type: 'text',//类型
                                name: 'functionDesc',//name
                                id: 'functionDesc',//id
                                label: '排序号',//左边label
                                rule: {
                                    required: true,
                                    digits: true
                                },
                                message: {
                                    required: "请输入排序号",
                                    digits: "必须输入整数"
                                }
                            }]
                        };
                        var form = modal.$body.orangeForm(formOpts);
                        modal.show();
                    }
                }
            ],
            search: {
                rowEleNum: 2,
                //搜索栏元素
                items: [{
                    type: "text",
                    label: "菜单名",
                    name: "functionName",
                    placeholder: "输入要搜索的菜单名"
                }, {
                    type: "text",
                    label: "菜单路径",
                    name: "action",
                    placeholder: "输入要搜索的菜单路径"
                }]
            }
        };
        grid = window.App.content.find("#function_grid").orangeGrid(options);
    }
})(jQuery, window, document);
