/**
 * Created by chenguojun on 8/10/16.
 */
;
(function ($, window, document, undefined) {
    /**
     * 功能菜单 对应 当前的唯一别名
     * @type {{/api/security/user/pageList: string}}
     */
    var uploadMapping = {
        "/api/security/user/pageList": "sysUser"
    }
    /**
     * 加入全局mapping
     */
    App.requestMapping = $.extend({}, window.App.requestMapping, uploadMapping);
    /**
     * 对应requestMapping值 sysUser page函数为进入页面入口方法
     * @type {{page: App.sysUser.page}}
     */
    App.sysUser = {
        page: function (title) {
            window.App.content.empty();
            window.App.title(title);
            var content = $('<div class="panel-body" id="user_grid"></div>');
            window.App.content.append(content);
            initEvents();
        }
    }
    /**
     * 初始化事件
     */
    var initEvents = function () {
        var grid;
        var options = {
            url: App.href + "/api/security/user/pageList",
            pageNum: 1,
            pageSize: 15,
            idField: "id",
            contentType: "table",
            contentTypeItems: "table,card,list",
            headField: "loginName",
            showCheck: true,//是否显示checkbox
            checkboxWidth: "3%",
            showIndexNum: true,
            indexNumWidth: "5%",
            pageSelect: [2, 15, 30, 50],
            columns: [{
                title: "id",
                field: "id",
                sort: true,
                width: "5%"
            }, {
                title: "登录名",
                field: "loginName",
                sort: true
            }, {
                title: "昵称",
                field: "displayName"
            }, {
                title: "邮箱",
                field: "email"
            }],
            actionColumnText: "操作",
            actionColumnWidth: "25%",
            actionColumns: [
                {
                    text: "编辑",
                    cls: "btn-primary btn-sm",
                    handle: function (index, data) {
                        var modal = $.orangeModal({
                            id: "userForm",
                            title: "编辑用户",
                            destroy: true
                        });
                        var formOpts = {
                            id: "index_form",
                            name: "index_form",
                            method: "POST",
                            action: App.href + "/api/security/user/update",
                            ajaxSubmit: true,
                            ajaxSuccess: function () {
                                modal.hide();
                                grid.reload();
                            },
                            rowEleNum: 2,
                            submitText: "保存",
                            showReset: true,
                            resetText: "重置",
                            isValidate: true,
                            buttons: [{
                                type: 'button',
                                text: '关闭',
                                handle: function () {
                                    modal.hide();
                                }
                            }],
                            buttonsAlign: "center",
                            items: [
                                {
                                    type: 'hidden',
                                    name: 'id',
                                    id: 'id'
                                }, {
                                    type: 'text',
                                    name: 'loginName',
                                    id: 'loginName',
                                    label: '登录名',
                                    readonly: true,
                                    span: 2,
                                    rule: {
                                        required: true
                                    },
                                    message: {
                                        required: "请输入登录名"
                                    }
                                }, {
                                    type: 'text',
                                    name: 'displayName',
                                    id: 'displayName',
                                    label: '昵称',
                                    span: 2,
                                    rule: {
                                        required: true
                                    },
                                    message: {
                                        required: "请输入昵称"
                                    }
                                }, {
                                    type: 'text',
                                    name: 'contactPhone',
                                    span: 2,
                                    id: 'contactPhone',
                                    label: '手机'
                                }, {
                                    type: 'text',
                                    name: 'password',
                                    id: 'password',
                                    label: '新密码',
                                    span: 2,
                                    detail: '不修改则留空'
                                }, {
                                    type: 'text',
                                    name: 'email',
                                    id: 'email',
                                    label: '邮箱',
                                    span: 2,
                                    rule: {
                                        email: true
                                    },
                                    message: {
                                        email: "请输入正确的邮箱"
                                    }
                                }, {
                                    type: 'tree',
                                    name: 'roles',
                                    id: 'roles',
                                    label: '角色',
                                    url: App.href + "/api/security/role/treeNodes",
                                    expandAll: true,
                                    autoParam: ["id", "name", "pId"],
                                    chkStyle: "checkbox",
                                    rule: {
                                        required: true
                                    },
                                    message: {
                                        required: "请选择至少一个角色"
                                    },
                                    change: function (g, v) {
                                        var module = g._module['menus'];
                                        var data = module.data("data");
                                        data.url = App.href + "/api/security/role/functions?roleIds=" + v;
                                        g._module['menus'].data("data", data);
                                        g._refreshItem('menus');
                                    }
                                }, {
                                    type: 'tree',
                                    name: 'menus',
                                    id: 'menus',
                                    label: '功能预览',
                                    url: App.href + "/api/security/role/functions",
                                    expandAll: true,
                                    autoParam: ["id", "name", "pId"],
                                    checkable: false
                                }
                            ]
                        };
                        var form = modal.$body.orangeForm(formOpts);
                        form.loadRemote(App.href + "/api/security/user/load/" + data.id);
                        modal.show();
                    }
                }, {
                    textHandle: function (index, data) {
                        if (data.accountNonLocked) {
                            return "锁定";
                        } else {
                            return "开启";
                        }
                    },
                    clsHandle: function (index, data) {
                        if (data.accountNonLocked) {
                            return "btn-warning btn-sm";
                        } else {
                            return "btn-success btn-sm";
                        }
                    },
                    handle: function (index, data) {
                        var requestUrl = App.href + "/api/security/user/unLock/" + data.id;
                        if (data.accountNonLocked) {
                            requestUrl = App.href + "/api/security/user/lock/" + data.id;
                        }
                        $.ajax({
                            type: "GET",
                            beforeSend: function (request) {
                                request.setRequestHeader("X-Auth-Token", App.token);
                            },
                            dataType: "json",
                            url: requestUrl,
                            success: function (data) {
                                if (data.code === 200) {
                                    grid.reload();
                                } else {
                                    grid.alert(data.message);
                                }
                            },
                            error: function (e) {
                                alert("请求异常。");
                            }
                        });
                    }
                }, {
                    text: "删除",
                    cls: "btn-danger btn-sm",
                    handle: function (index, data) {
                        bootbox.confirm("确定该操作?", function (result) {
                            if (result) {
                                var requestUrl = App.href + "/api/security/user/delete";
                                $.ajax({
                                    type: "POST",
                                    dataType: "json",
                                    data: {
                                        userId: data.id
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
                }, {
                    text: "清除缓存",
                    cls: "btn-info btn-sm",
                    handle: function (index, data) {
                        bootbox.confirm("确定该操作?", function (result) {
                            if (result) {
                                var requestUrl = App.href + "/api/security/user/deleteCache";
                                $.ajax({
                                    type: "GET",
                                    dataType: "json",
                                    data: {
                                        userId: data.id
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
                    text: " 导入",//按钮文本
                    cls: "btn btn-sm btn-primary",
                    icon: "fa fa-upload",
                    handle: function (grid) {
                        var modal = $.orangeModal({
                            id: "importUser",
                            title: "导入用户",
                            destroy: true
                        }).show();
                        modal.$body.orangeForm({
                            method: "post",
                            action: "",
                            ajaxSubmit: true,
                            submitText: "保存",
                            showReset: false,
                            resetText: "重置",
                            showSubmit: false,
                            items: [
                                {
                                    type: 'file',
                                    id: 'file',
                                    name: 'file',
                                    label: '选择文件',
                                    isAjaxUpload: true,
                                    autoUpload: false,
                                    allowTypes: "xls,xlsx",
                                    uploadUrl: App.href + '/api/security/user/import',
                                    onSuccess: function (data, form) {
                                        form._alert('上传成功', 'success');
                                        modal.hide();
                                        grid.reload();
                                    }
                                }
                            ]
                        });
                    }
                },
                {
                    text: " 添 加",//按钮文本
                    cls: "btn btn-sm btn-primary",
                    icon: "fa fa-cubes",
                    handle: function (grid) {
                        var modal = $.orangeModal({
                            id: "userForm",
                            title: "添加用户",
                            destroy: true
                        });
                        var formOpts = {
                            id: "add_user_form",
                            name: "add_user_form",
                            method: "POST",
                            action: App.href + "/api/security/user/insert",//表单action
                            ajaxSubmit: true,//是否使用ajax提交表单
                            rowEleNum: 2,
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
                            items: [
                                {
                                    type: 'hidden',
                                    name: 'id',
                                    id: 'id'
                                }, {
                                    type: 'text',
                                    name: 'loginName',
                                    id: 'loginName',
                                    label: '登录名',
                                    span: 2,
                                    rule: {
                                        required: true,
                                        remote: {
                                            type: "post",
                                            url: App.href + "/api/noneAuth/unique",
                                            data: {
                                                loginName: function () {
                                                    return $("#loginName").val();
                                                }
                                            },
                                            dataType: "json",
                                            dataFilter: function (data, type) {
                                                return data;
                                            }
                                        }
                                    },
                                    message: {//对应验证提示信息
                                        required: "请输入登录名",
                                        remote: "登录名被占用"
                                    }
                                }, {
                                    type: 'password',
                                    name: 'password',
                                    id: 'password',
                                    label: '密码',
                                    rule: {
                                        required: true,
                                        minlength: 8,
                                        maxlength: 64
                                    },
                                    message: {
                                        required: "请输入密码",
                                        minlength: "至少{0}位",
                                        maxlength: "做多{0}位"
                                    }
                                }, {
                                    type: 'password',
                                    name: 'password2',
                                    id: 'password2',
                                    label: '确认密码',
                                    rule: {
                                        required: true,
                                        equalTo: "#password"
                                    },
                                    message: {
                                        required: "请输入确认密码密码",
                                        equalTo: "与密码不一致"
                                    }
                                }, {
                                    type: 'text',
                                    name: 'displayName',
                                    id: 'displayName',
                                    span: 2,
                                    label: '昵称',
                                    rule: {
                                        required: true
                                    },
                                    message: {
                                        required: "请输入昵称"
                                    }
                                }, {
                                    type: 'text',
                                    name: 'contactPhone',
                                    id: 'contactPhone',
                                    span: 2,
                                    label: '手机'
                                }, {
                                    type: 'text',
                                    name: 'email',
                                    id: 'email',
                                    span: 2,
                                    label: '邮箱',
                                    rule: {
                                        email: true
                                    },
                                    message: {
                                        email: "请输入正确的邮箱"
                                    }
                                }, {
                                    type: 'radioGroup',
                                    name: 'enabled',
                                    id: 'enabled',
                                    span: 2,
                                    label: '是否有效',
                                    inline: true,
                                    items: [{
                                        value: true,
                                        text: '有效'
                                    }, {
                                        value: false,
                                        text: '失效'
                                    }],
                                    rule: {
                                        required: true
                                    },
                                    message: {
                                        required: "请选择"
                                    }
                                }, {
                                    type: 'radioGroup',
                                    name: 'accountNonLocked',
                                    id: 'accountNonLocked',
                                    span: 2,
                                    label: '账号锁定状态',
                                    inline: true,
                                    items: [
                                        {
                                            value: true,
                                            text: '开启'
                                        }, {
                                            value: false,
                                            text: '锁定'
                                        }
                                    ],
                                    rule: {
                                        required: true
                                    },
                                    message: {
                                        required: "请选择"
                                    }
                                }, {
                                    type: 'tree',
                                    name: 'roles',
                                    id: 'roles',
                                    label: '角色',
                                    url: App.href + "/api/security/role/treeNodes",
                                    expandAll: true,
                                    autoParam: ["id", "name", "pId"],
                                    chkStyle: "checkbox",
                                    detail: "如何设置角色?<a target='_blank' href='?u=/api/security/role/pageList'>点击设置</a>",
                                    rule: {
                                        required: true
                                    },
                                    message: {
                                        required: "请选择至少一个角色"
                                    },
                                    change: function (g, v) {
                                        var module = g._module['menus'];
                                        var data = module.data("data");
                                        data.url = App.href + "/api/security/role/functions?roleIds=" + v;
                                        g._module['menus'].data("data", data);
                                        g._refreshItem('menus');
                                    }
                                }, {
                                    type: 'tree',
                                    name: 'menus',
                                    id: 'menus',
                                    label: '功能预览',
                                    url: App.href + "/api/security/role/functions",
                                    expandAll: true,
                                    autoParam: ["id", "name", "pId"],
                                    checkable: false
                                }
                            ]
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
        grid = window.App.content.find("#user_grid").orangeGrid(options);
    }
})(jQuery, window, document);
