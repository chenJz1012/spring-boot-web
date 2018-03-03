/**
 * Created by chenguojun on 8/10/16.
 */
;
(function ($, window, document, undefined) {
    var uploadMapping = {
        "/api/security/role/pageList": "sysRole"
    }
    App.requestMapping = $.extend({}, window.App.requestMapping, uploadMapping);
    App.sysRole = {
        page: function (title) {
            window.App.content.empty();
            window.App.title(title);
            var content = $('<div class="panel-body" id="role_grid"></div>');
            window.App.content.append(content);
            initEvents();
        }
    }
    var initEvents = function () {
        var grid;
        var options = {
            url: App.href + "/api/security/role/pageList",
            pageNum: 1,//当前页码
            pageSize: 15,//每页显示条数
            idField: "id",//id域指定
            headField: "roleName",
            contentType: "table",
            contentTypeItems: "table,card,list",
            showCheck: true,//是否显示checkbox
            checkboxWidth: "3%",
            showIndexNum: true,
            indexNumWidth: "5%",
            pageSelect: [2, 15, 30, 50],
            columns: [
                {
                    title: "id",
                    field: "id",
                    sort: true,
                    width: "5%"
                }, {
                    title: "角色名称",
                    field: "roleName",
                    sort: true
                }
            ],
            actionColumnText: "操作",//操作列文本
            actionColumnWidth: "20%",
            actionColumns: [{
                text: "编辑",
                cls: "btn-primary btn-sm",
                handle: function (index, data) {
                    var modal = $.orangeModal({
                        id: "roleForm",
                        title: "编辑角色",
                        destroy: true
                    });
                    var formOpts = {
                        id: "index_form",//表单id
                        name: "index_form",//表单名
                        method: "POST",//表单method
                        action: App.href + "/api/security/role/update",//表单action
                        ajaxSubmit: true,//是否使用ajax提交表单
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
                            type: 'text',//类型
                            name: 'roleName',//name
                            id: 'roleName',//id
                            label: '角色名',//左边label
                            readonly: true,
                            rule: {
                                required: true
                            },
                            message: {
                                required: "请输入角色名"
                            }
                        }, {
                            type: 'tree',//类型
                            name: 'functions',
                            id: 'functions',//id
                            label: '菜单',//左边label
                            url: App.href + "/api/security/function/treeNodes",
                            expandAll: true,
                            autoParam: ["id", "name", "pId"],
                            chkStyle: "checkbox",
                            chkboxType: {"Y": "ps", "N": "ps"},
                            rule: {
                                required: true
                            },
                            message: {
                                required: "请选择至少一个菜单"
                            }
                        }]
                    };
                    var form = modal.$body.orangeForm(formOpts);
                    form.loadRemote(App.href + "/api/security/role/load/" + data.id);
                    modal.show();
                }
            }, {
                text: "设置用户",
                cls: "btn-primary btn-sm",
                handle: function (index, data) {
                    var userGrid;
                    var modal = $.orangeModal({
                        id: "user_grid",
                        title: "设置用户",
                        destroy: true
                    });
                    var options = {
                        url: App.href + "/api/security/role/hasRoleUserList?roleId=" + data.id,
                        beforeSend: function (request) {
                            request.setRequestHeader("X-Auth-Token", App.token);
                        },
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
                            sort: true
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
                                if (userData.hasRole) {
                                    return "取消";
                                } else {
                                    return "选择";
                                }
                            },
                            clsHandle: function (index, userData) {
                                if (userData.hasRole) {
                                    return "btn-danger btn-sm";
                                } else {
                                    return "btn-primary btn-sm";
                                }
                            },
                            handle: function (index, userData) {
                                var requestUrl = App.href + "/api/security/role/selectUser";
                                if (userData.hasRole) {
                                    requestUrl = App.href + "/api/security/role/cancelUser";
                                }
                                $.ajax({
                                    type: "GET",
                                    beforeSend: function (request) {
                                        request.setRequestHeader("X-Auth-Token", App.token);
                                    },
                                    dataType: "json",
                                    data: {
                                        roleId: data.id,
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
            }, {
                text: "删除",
                cls: "btn-danger btn-sm",
                handle: function (index, data) {
                    bootbox.confirm("确定该操作?", function (result) {
                        if (result) {
                            var requestUrl = App.href + "/api/security/role/delete";
                            $.ajax({
                                type: "POST",
                                beforeSend: function (request) {
                                    request.setRequestHeader("X-Auth-Token", App.token);
                                },
                                dataType: "json",
                                data: {
                                    roleId: data.id
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
                            id: "roleForm",
                            title: "添加角色",
                            destroy: true
                        });
                        var formOpts = {
                            id: "add_role_form",
                            name: "add_role_form",
                            method: "POST",
                            action: App.href + "/api/security/role/insert",//表单action
                            ajaxSubmit: true,//是否使用ajax提交表单
                            rowEleNum: 1,
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
                                type: 'text',
                                name: 'roleName',
                                id: 'roleName',
                                label: '角色名',//左边label
                                rule: {
                                    required: true
                                },
                                message: {//对应验证提示信息
                                    required: "请输入角色名"
                                }
                            }, {
                                type: 'tree',
                                name: 'functions',
                                id: 'functions',
                                label: '菜单',
                                url: App.href + "/api/security/function/treeNodes",
                                expandAll: true,
                                autoParam: ["id", "name", "pId"],
                                chkStyle: "checkbox",
                                chkboxType: {"Y": "ps", "N": "ps"},
                                rule: {
                                    required: true
                                },
                                message: {
                                    required: "请选择至少一个菜单"
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
                items: [
                    {
                        type: "text",
                        label: "角色名",
                        name: "roleName",
                        placeholder: "输入要搜索的角色名"
                    }
                ]
            }
        };
        grid = window.App.content.find("#role_grid").orangeGrid(options);
    }
})(jQuery, window, document);
