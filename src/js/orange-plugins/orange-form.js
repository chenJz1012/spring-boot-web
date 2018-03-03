/**
 * Created by chenguojun on 8/29/16.
 */

(function ($, window, document, undefined) {

    var KE;
    if (typeof (KindEditor) != "undefined") {
        KindEditor.ready(function (K) {
            KE = K;
        });
    }
    var isArray = function (object) {
        return object && typeof object === 'object' &&
            Array == object.constructor;
    }
    var getLowCaseType = function (string) {
        var postfix = string.substring(string.lastIndexOf("."), string.length);
        return postfix.toLowerCase();
    };
    var dateDefaults = {};
    if (typeof(moment) != "undefined") {
        dateDefaults = {
            showDropdowns: true,
            linkedCalendars: false,
            autoApply: false,
            ranges: {
                '今天': [moment().startOf('day'), moment()],
                '昨天': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                '最近七天': [moment().subtract(6, 'days'), moment()],
                '最近三十天': [moment().subtract(29, 'days'), moment()],
                '本月': [moment().startOf('month'), moment().endOf('month')],
                '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            locale: {
                "format": 'YYYY-MM-DD HH:mm:ss',
                "separator": " 到 ",
                "applyLabel": "确定",
                "cancelLabel": "取消",
                "fromLabel": "从",
                "toLabel": "到",
                "customRangeLabel": "自定义",
                "daysOfWeek": [
                    "周日",
                    "周一",
                    "周二",
                    "周三",
                    "周四",
                    "周五",
                    "周六"
                ],
                "monthNames": [
                    "一月",
                    "二月",
                    "三月",
                    "四月",
                    "五月",
                    "六月",
                    "七月",
                    "八月",
                    "九月",
                    "十月",
                    "十一月",
                    "十二月"
                ],
                "firstDay": 1
            },
            timePicker: true,
            timePicker24Hour: true,
            timePickerSeconds: true,
            singleDatePicker: false
        };
    }
    var Form = function (element, options, callback) {
        this._setVariable(element, options);
        this._setOptions(this._options);
        if (callback !== undefined) {
            this._callback = callback;
        }
        this._init();
    };
    Form.defaults = {
        method: "post",
        labelInline: false,
        rowEleNum: 1,
        ajaxSubmit: true,
        showSubmit: true,
        submitText: "保存",
        resetText: "重置",
        showReset: true,
        isValidate: true,
        viewMode: false
    };
    Form.statics = {
        formTmpl: '<form id="${id_}" name="${name_}" action="${action_}" method="${method_}" enctype="multipart/form-data" class="${cls_}"></form>',
        formBodyTmpl: '<div></div>',
        formActionTmpl: '<div class="form-actions" style="padding-bottom:20px;text-align:${align_};"></div>',
        rowTmpl: '<div data-row=${row_} class="row"></div>',
        eleTmpl: '<div class="col-md-${span_}"><div class="form-group"></div></div>',
        sectionTmpl: '<div class="col-md-12"><h3 class="form-section">${title_}</h3><hr></div>',
        labelTmpl: '<label class="control-label ${cls_}">${label_}</label>',
        blockSpanTmpl: '<span class="help-block">${help_}</span>',
        buttonTmpl: '<button type="${type_}" class="btn ${cls_}" ${attribute_}>${text_}</button>',
        alertTmpl: '<div class="alert alert-${type_} alert-dismissable" role="alert">'
        + '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
        + '<strong>提示!</strong>${alert_}</div>'
    };
    Form.prototype = {
        reload: function (options) {
            this._reload(options);
        },
        reset: function () {
            this._reset();
        },
        setValue: function (name, value) {
            this._loadValue(name, value)
        },
        loadLocal: function (data) {
            var that = this;
            this._data = data;
            $.each(this._data, function (i, value) {
                that._loadValue(i, value);
            });
        },
        loadRemote: function (ajaxUrl, callback, method) {
            var that = this;
            if (method === undefined)
                method = "GET";
            $.ajax({
                type: method,
                dataType: "json",
                url: ajaxUrl,
                beforeSend: function (request) {
                    request.setRequestHeader("X-Auth-Token", App.token);
                },
                success: function (data) {
                    if (data.code === 200) {
                        if (isArray(data.data)) {
                            that._data = {};
                            $.each(data.data, function (i, d) {
                                $.each(d, function (ii, id) {
                                    that._loadValue(ii, id);
                                });
                            });
                        } else {
                            $.each(data.data, function (i, item) {
                                that._loadValue(i, item);
                            });
                            that._data = data.data;
                        }
                        if (callback !== undefined) {
                            callback();
                        }
                    } else {
                        alert(data.message);
                    }
                },
                error: function (e) {
                    alert("异步加载数据异常");
                }
            });
        },
        setAction: function (action) {
            this._action = action;
        },
        alert: function (alertText) {
            this._alert(alertText, "danger", 5);
        },
        _alert: function (alertText, type, seconds) {
            var that = this;
            if (type === undefined) {
                type = "danger";
            }
            if (seconds === undefined) {
                seconds = 3;
            }
            var alertDiv = $.tmpl(Form.statics.alertTmpl, {
                "type_": type,
                "alert_": alertText
            });
            this.$element.append(alertDiv);
            alertDiv.delay(seconds * 1000).fadeOut();
            bootbox.alert(alertText);
        },
        _setVariable: function (element, options) {
            this.$element = $(element);
            var id = element.id;
            if (id === undefined || id !== '') {
                id = "orange_form_" + new Date().getTime();
                this.$element.attr("id", id);
            }
            this._elementId = id;
            this._options = options;
            this._editor = [];
            this._module = [];
            this.$form = undefined;
            this._data = undefined;
        },
        _setOptions: function (options) {
            if (options.id === undefined) {
                this._formId = "form_" + new Date().getTime();
            } else {
                this._formId = options.id;
            }
            if (options.name === undefined) {
                this._formName = "form_" + new Date().getTime();
            } else {
                this._formName = options.name;
            }
            this._method = options.method;
            this._action = options.action;
            this._labelInline = options.labelInline;
            this._rowEleNum = options.rowEleNum;
            this._items = options.items;
            this._buttons = options.buttons;
            this._buttonsAlign = options.buttonsAlign;
            this._ajaxSubmit = options.ajaxSubmit;
            this._ajaxSuccess = options.ajaxSuccess;
            this._beforeSubmit = options.beforeSubmit;
            this._beforeSend = options.beforeSend;
            this._showSubmit = options.showSubmit;
            this._submitText = options.submitText;
            this._resetText = options.resetText;
            this._showReset = options.showReset;
            this._complete = options.complete;
            this._isValidate = options.isValidate;
            if (options.validateOptions !== undefined) {
                this._validateOptions = options.validateOptions;
            } else {
                this._validateOptions = {
                    rules: {},
                    messages: {}
                };
            }
        },
        _init: function () {
            this._renderEles();
            this._registerEvents();
            this._doCallbacks();
        },
        _renderEles: function () {
            var that = this;
            var form = $.tmpl(Form.statics.formTmpl, {
                "id_": that._formId,
                "name_": that._formName,
                "method_": that._method,
                "action_": that._action,
                "cls_": (that._labelInline ? "form-horizontal" : "")
            });
            this.$form = form;
            this.$element.append(form);

            // formBody
            var formBody = $.tmpl(Form.statics.formBodyTmpl, {});
            this.$form.append(formBody);
            this._renderFormElements(formBody);

            // formAction
            var formAction = $.tmpl(Form.statics.formActionTmpl, {
                "align_": that._buttonsAlign === undefined ? "left"
                    : that._buttonsAlign
            });
            this.$form.append(formAction);
            this._renderActionButtons(formAction);
        },
        _renderFormElements: function (formBody) {
            if (this._items === undefined || this._items.length == 0) {
                return;
            }
            var that = this;
            /**
             * 计算行元素span
             */
            var rowEleSpan = 12;
            var rowEleNum = this._rowEleNum;
            if (12 % rowEleNum == 0) {
                rowEleSpan = 12 / rowEleNum;
            }
            var count = 0;
            var row;
            $
                .each(
                    this._items,
                    function (i, item) {
                        if (that._formEles[item.type] !== undefined) {
                            if (item.type == "hidden") {
                                var ele = that._formEles[item.type]
                                (item);
                                formBody.append(ele);
                                return;
                            }
                            var itemSpan = item.span > 1 ? item.span : 1;
                            itemSpan = itemSpan > rowEleNum ? rowEleNum : itemSpan;
                            if (itemSpan > 1) {
                                that._labelInline = false;
                            }
                            // 计算分布
                            if (count % rowEleNum == 0) {
                                row = $.tmpl(Form.statics.rowTmpl, {
                                    "row_": count
                                });
                                formBody.append(row);
                            }
                            count += itemSpan;
                            var wrapper = $.tmpl(Form.statics.eleTmpl,
                                {
                                    "span_": rowEleSpan * itemSpan
                                }
                            );

                            // 构建元素
                            that._buildModuleWrapper(wrapper, item);
                            row.append(wrapper);

                            // validate
                            if (item.rule !== undefined) {
                                that._validateOptions.rules[item.name] = item.rule;
                            }
                            if (item.message !== undefined) {
                                that._validateOptions.messages[item.name] = item.message;
                            }

                        } else {
                            if (item.type == "section") {
                                row = $.tmpl(Form.statics.rowTmpl, {
                                    "row_": count
                                });
                                var section = $.tmpl(
                                    Form.statics.sectionTmpl, {
                                        "title_": item.title
                                    });
                                row.append(section);
                                formBody.append(row);
                                count = 0;
                            }
                        }

                    });

        },
        _buildModuleWrapper: function (wrapper, item) {
            var that = this;
            var ele = this._formEles[item.type](item, this);
            var label = $.tmpl(Form.statics.labelTmpl, {
                "cls_": that._labelInline ? "col-md-3" : "",
                "label_": item.label === undefined ? "" : item.label
            });
            wrapper.find(".form-group").append(label);
            var help;
            if (item.detail !== undefined) {
                help = $.tmpl(Form.statics.blockSpanTmpl, {
                    "help_": ""
                });
                help.append(item.detail);
            }
            if (that._labelInline) {
                var div = $('<div formele="' + item.type + '" class="col-md-9"></div>');
                if (item.showIcon) {
                    item.icon = "";
                }
                if (item.icon !== undefined) {
                    var iconDiv = $('<div class="input-icon '
                        + (item.iconAlign === undefined ? "right"
                            : item.iconAlign) + '"></div>');
                    if (item.cls !== undefined) {
                        iconDiv.addClass(item.cls);
                    }
                    var icon = $('<i class="' + item.icon + '"></i>');
                    iconDiv.append(icon);
                    iconDiv.append(ele);
                    div.append(iconDiv);
                } else {
                    div.append(ele);
                }
                if (help !== undefined) {
                    div.append(help);
                }
                wrapper.find(".form-group").append(div);
            } else {
                if (item.icon !== undefined) {
                    var iconDiv = $('<div formele="' + item.type + '" class="input-icon '
                        + (item.iconAlign === undefined ? "right"
                            : item.iconAlign) + '"></div>');
                    if (item.cls !== undefined) {
                        iconDiv.addClass(item.cls);
                    }
                    var icon = $('<i class="' + item.icon + '"></i>');
                    iconDiv.append(icon);
                    iconDiv.append(ele);
                    wrapper.find(".form-group").append(iconDiv);
                    if (help !== undefined) {
                        wrapper.find(".form-group").append(help);
                    }
                } else {
                    var inputWrapper = $('<div formele="' + item.type + '"></div>')
                    inputWrapper.append(ele);
                    wrapper.find(".form-group").append(inputWrapper);
                    if (help !== undefined) {
                        wrapper.find(".form-group").append(help);
                    }
                }
            }

            if (item.change !== undefined) {
                ele.parent().find('[drole=main]').on('change', function () {
                    var value = $(this).val();
                    item.change(that, value);
                });

                if (ele.parent().find('[drole=main]').is("input[type=text]") || ele.parent().find('[drole=main]').is("textarea")) {
                    ele.parent().find('[drole=main]').on("keypress keyup", function () {
                        var value = $(this).val();
                        item.change(that, value);
                    });
                }
            }
            // 记录元素数据
            wrapper.data("data", item);
            this._module[item.name] = wrapper;
        },
        _renderActionButtons: function (formAction) {
            var that = this;
            if (this._showReset) {
                var resetBtn = $.tmpl(Form.statics.buttonTmpl, {
                    "type_": "button",
                    "attribute_": "role=reset",
                    "cls_": "btn-default ",
                    "text_": that._resetText
                });
                formAction.append(resetBtn);
                resetBtn.on("click", function () {
                    that._reset();
                });
            }
            if (this._showSubmit) {
                var submitBtn = $.tmpl(Form.statics.buttonTmpl, {
                    "type_": that._isValidate ? "submit" : "button",
                    "attribute_": "role=submit",
                    "cls_": "btn-primary ",
                    "text_": that._submitText
                });
                formAction.append(submitBtn);
            }
            if (this._buttons !== undefined && this._buttons.length > 0) {
                $.each(this._buttons, function (i, button) {
                    var btn = $.tmpl(Form.statics.buttonTmpl, {
                        "type_": button.type === undefined ? "button"
                            : button.type,
                        "attribute_": button.attribute === undefined ? ""
                            : button.attribute,
                        "cls_": button.cls === undefined ? "btn-default "
                            : button.cls,
                        "text_": button.text
                    });
                    if (button.handle !== undefined) {
                        btn.on("click", function () {
                            button.handle();
                        });
                    }
                    formAction.append(btn);
                });
            }
        },
        _formEles: {
            'html': function (data, form) {
                var htmlWrapper = '<div id="${id_}" name="${name_}" ${attribute_} ></div>';
                var ele = $.tmpl(htmlWrapper, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name,
                    "attribute_": (data.attribute === undefined ? ""
                        : data.attribute)
                });
                if (data.eleHandler != undefined) {
                    var p = data.eleHandler(data.handleParams);
                    ele.append(p);
                } else {
                    ele.append(data.html);
                }
                if (data.loadHandler !== undefined) {
                    ele.data("load", data.loadHandler);
                }
                return ele;
            },
            'list': function (data, form) {
                var wrapper = '<div role="list" class="row" id="${id_}" name="${name_}" ${attribute_} >' +
                    '<div role="ele" class="col-lg-12"></div>' +
                    '<div role="action" class="col-lg-12 btn-group"></div>' +
                    '</div>';
                var ele = $.tmpl(wrapper, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name,
                    "attribute_": (data.attribute === undefined ? ""
                        : data.attribute)
                });
                var addBtn = $('<button class="btn btn-sm btn-info" type="button">添加</button>');
                ele.children('[role=action]').append(addBtn);
                addBtn.on("click", function () {
                    var itemWrapper = $('<div class="row">' +
                        '<div role="s-ele" class="col-md-12 form-group input-group">' +
                        '</div>' +
                        '</div>');
                    if (data.items != undefined) {
                        $.each(data.items, function (j, jd) {
                            var item = form._formEles[jd.type](jd, form);
                            var iWrapper;
                            if (jd.label != undefined) {
                                iWrapper = $('<div class="form-group"><label class="control-label col-md-offset-1 col-md-2">' + jd.label + '</label><div role="i-ele" class="col-md-9"></div></div>');
                            } else {
                                iWrapper = $('<div class="form-group"><div role="i-ele" class="col-md-offset-1 col-md-11"></div></div>');
                            }
                            iWrapper.children('[role=i-ele]').append(item);
                            itemWrapper.children('[role=s-ele]').append(iWrapper);
                        });
                        itemWrapper.children('[role=s-ele]').append($('<span role="s-action" style="vertical-align: top;" class="input-group-btn"></span>'));
                        var deleteBtn = $('<button class="btn btn-sm btn-danger" type="button"><i class="fa fa-times"></i></button>');
                        itemWrapper.children().children('[role=s-action]').append(deleteBtn);
                        deleteBtn.on("click", function () {
                            itemWrapper.remove();
                        });
                        ele.children('[role=ele]').append(itemWrapper);
                        form._uniform();
                    }

                });
                var cleanBtn = $('<button class="btn btn-sm btn-danger" type="button">清除</button>');
                ele.children('[role=action]').append(cleanBtn);
                cleanBtn.on("click", function () {
                    ele.children('[role=ele]').empty();
                });
                ele.data("data", data);
                return ele;
            },
            'display': function (data, form) {
                var textTmpl = '<p drole="main" style="${style_}" id="${id_}" name="${name_}" ${attribute_} class="form-control-static"></p>';
                var ele = $.tmpl(textTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name,
                    "style_": (data.style === undefined ? ""
                        : data.style)
                });
                if (data.html != undefined)
                    ele.html(data.html);
                ele.data("format", data.format);
                return ele;
            },
            'hidden': function (data, form) {
                var textTmpl = '<input drole="main" type="hidden" id="${id_}" name="${name_}" class="form-control" ${attribute_}>';
                var ele = $.tmpl(textTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name,
                    "attribute_": (data.attribute === undefined ? ""
                        : data.attribute)
                });
                if (data.value != undefined)
                    ele.val(data.value);
                return ele;
            },
            'text': function (data, form) {
                var textTmpl = '<input drole="main" type="text" showicon=${showIcon_} id="${id_}" name="${name_}" class="form-control ${cls_}" ${readonly_} ${disabled_} ${attribute_} placeholder="${placeholder_}">';
                var ele = $.tmpl(textTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name,
                    "showIcon_": data.showIcon === undefined ? false
                        : data.showIcon,
                    "placeholder_": (data.placeholder === undefined ? ""
                        : data.placeholder),
                    "cls_": data.cls === undefined ? ""
                        : (data.icon !== undefined ? "" : data.cls),
                    "readonly_": (data.readonly ? "readonly" : ""),
                    "disabled_": (data.disabled ? "disabled" : ""),
                    "attribute_": (data.attribute === undefined ? ""
                        : data.attribute)
                });
                if (data.value != undefined)
                    ele.val(data.value);
                return ele;
            },
            'password': function (data, form) {
                var passwordTmpl = '<input drole="main" type="password" id="${id_}" name="${name_}" class="form-control ${cls_}" ${readonly_} ${disabled_} ${attribute_} placeholder="${placeholder_}">';
                var ele = $.tmpl(passwordTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name,
                    "placeholder_": (data.placeholder === undefined ? ""
                        : data.placeholder),
                    "cls_": data.cls === undefined ? ""
                        : (data.icon !== undefined ? "" : data.cls),
                    "readonly_": (data.readonly ? "readonly" : ""),
                    "disabled_": (data.disabled ? "disabled" : ""),
                    "attribute_": (data.attribute === undefined ? ""
                        : data.attribute)
                });
                return ele;
            },
            'textarea': function (data, form) {
                var textareaTmpl = '<textarea drole="main" id="${id_}" code="${code_}" name="${name_}" class="form-control ${cls_}" ${readonly_} ${disabled_} ${attribute_} rows="${rows_}"></textarea>';
                var ele = $.tmpl(textareaTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name,
                    "code_": data.code === undefined ? false : data.code,
                    "rows_": (data.rows === undefined ? "3" : data.rows),
                    "cls_": data.cls === undefined ? "" : data.cls,
                    "readonly_": (data.readonly ? "readonly" : ""),
                    "disabled_": (data.disabled ? "disabled" : ""),
                    "attribute_": (data.attribute === undefined ? ""
                        : data.attribute)
                });
                return ele;
            },
            'select': function (data, form) {
                var selectTmpl = '<select drole="main" id="${id_}" name="${name_}" ${attribute_} ${disabled_} class="form-control ${cls_}"></select>';
                var optionTmpl = '<option value=${value_} ${selected}>${text_}</option>';
                var ele = $.tmpl(selectTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name,
                    "cls_": data.cls === undefined ? "col-lg-3" : data.cls,
                    "disabled_": (data.disabled ? "disabled" : ""),
                    "attribute_": (data.attribute === undefined ? ""
                        : data.attribute)
                });
                if (data.items !== undefined && data.items.length > 0) {
                    $.each(data.items, function (i, option) {
                        var opt = $.tmpl(optionTmpl, {
                            "value_": option.value,
                            "text_": option.text,
                            "selected": (option.selected ? "selected" : "")
                        });
                        ele.append(opt);
                    });
                }
                if (data.itemsUrl !== undefined) {
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        async: data.async ? true : false,
                        url: data.itemsUrl,
                        success: function (options) {
                            $.each(options, function (i, option) {
                                var opt = $.tmpl(optionTmpl, {
                                    "value_": option.value,
                                    "text_": option.text,
                                    "selected": (option.selected ? "selected"
                                        : "")
                                });
                                ele.append(opt);
                            });
                        }
                    });
                }
                return ele;
            },
            'checkboxGroup': function (data, form) {
                var inlineCls = "checkbox-inline";
                var wrapperTmpl = '<div id="${id_}_cbg" name="${name_}_cbg" ${attribute_} class="checkbox"></div>';
                var checkboxTmpl = '<label class="${inline_}"><input drole="main" class="ace" name="${name_}" value="${value_}" type="checkbox" ${checked_} ${attribute_} ${disabled_} ><span class="lbl">${text_}</span></label>';
                var ele = $.tmpl(wrapperTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name,
                    "attribute_": (data.attribute === undefined ? ""
                        : data.attribute)
                });
                if (data.items !== undefined && data.items.length > 0) {
                    $.each(
                        data.items,
                        function (i, checkbox) {
                            var cb = $
                                .tmpl(
                                    checkboxTmpl,
                                    {
                                        "inline_": data.inline ? inlineCls
                                            : "",
                                        "name_": data.name,
                                        "value_": checkbox.value,
                                        "text_": checkbox.text,
                                        "checked": (checkbox.checked ? "checked=checked"
                                            : ""),
                                        "disabled_": (checkbox.disabled ? "disabled"
                                            : ""),
                                        "attribute_": (checkbox.attribute === undefined ? ""
                                            : checkbox.attribute)
                                    });
                            ele.append(cb);
                        }
                    );
                }
                if (data.itemsUrl !== undefined) {
                    $
                        .ajax({
                            type: "POST",
                            dataType: "json",
                            async: data.async ? true : false,
                            url: data.itemsUrl,
                            success: function (cbs) {
                                $.each(
                                    cbs,
                                    function (i, checkbox) {
                                        var cb = $
                                            .tmpl(
                                                checkboxTmpl,
                                                {
                                                    "inline_": data.inline ? inlineCls
                                                        : "",
                                                    "name_": data.name,
                                                    "value_": checkbox.value,
                                                    "text_": checkbox.text,
                                                    "checked": (checkbox.checked ? "checked=checked"
                                                        : ""),
                                                    "disabled_": (checkbox.disabled ? "disabled"
                                                        : ""),
                                                    "attribute_": (checkbox.attribute === undefined ? ""
                                                        : checkbox.attribute)
                                                });
                                        ele.append(cb);
                                        Form.prototype
                                            ._uniform();
                                    }
                                );
                            }
                        });
                }
                return ele;

            },
            'radioGroup': function (data, form) {
                var inlineCls = "radio-inline";
                var wrapperTmpl = '<div class="radio"></div>';
                var radioTmpl = '<label class="${inline_}"><input class="ace" drole="main" name="${name_}" value="${value_}" type="radio" ${checked_} ${attribute_}><span class="lbl">${text_}</span></label>';
                var ele = $.tmpl(wrapperTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name,
                    "attribute_": (data.attribute === undefined ? ""
                        : data.attribute)
                });
                if (data.items !== undefined && data.items.length > 0) {
                    $.each(data.items, function (i, radio) {
                        var rd = $.tmpl(radioTmpl, {
                            "inline_": data.inline ? inlineCls : "",
                            "name_": data.name,
                            "value_": radio.value,
                            "text_": radio.text,
                            "checked_": (radio.checked ? "checked=checked" : ""),
                            "attribute_": (radio.attribute === undefined ? ""
                                : radio.attribute)
                        });
                        ele.append(rd);
                    });
                }
                if (data.itemsUrl !== undefined) {
                    $
                        .ajax({
                            type: "POST",
                            dataType: "json",
                            async: data.async ? true : false,
                            url: data.itemsUrl,
                            success: function (rds) {
                                $
                                    .each(
                                        rds,
                                        function (i, radio) {
                                            var rd = $
                                                .tmpl(
                                                    radioTmpl,
                                                    {
                                                        "inline_": data.inline ? inlineCls
                                                            : "",
                                                        "name_": data.name,
                                                        "value_": radio.value,
                                                        "text_": radio.text,
                                                        "checked_": (radio.checked ? "checked=checked"
                                                            : ""),
                                                        "attribute_": (radio.attribute === undefined ? ""
                                                            : radio.attribute)
                                                    });
                                            ele.append(rd);
                                            Form.prototype
                                                ._uniform();
                                        });
                            }
                        });
                }
                return ele;
            },
            'datepicker': function (data, form) {
                var dateTmpl = '<div class="input-group input-xxlarge">'
                    + '<input drole="main" type="text" role="date-input" id="${id_}" name=${name_} value="${value_}" class="form-control">'
                    + '<span role="icon" class="input-group-addon">'
                    + '<i class="glyphicon glyphicon-calendar fa fa-calendar"></i>' + '</span></div>';
                if (typeof(moment) == "undefined") {
                    return $.tmpl(dateTmpl, {
                        "id_": (data.id === undefined ? data.name : data.id),
                        "name_": data.name,
                        "cls_": data.cls === undefined ? "" : data.cls,
                        "value_": ""
                    });
                }
                var config = (data.config == undefined ? {} : data.config);
                config['parentEl'] = '#' + form._elementId;
                var option = $.extend(true, dateDefaults, config);
                var ele = $.tmpl(dateTmpl, {
                    "id_": (data.id == undefined ? data.name : data.id),
                    "name_": data.name,
                    "cls_": data.cls == undefined ? "" : data.cls,
                    "value_": (data.value == undefined ? moment().format(option.locale.format) : data.value)
                });
                if (data.callback !== undefined) {
                    ele.find('[role="date-input"]').daterangepicker(option, data.callback);
                } else {
                    ele.find('[role="date-input"]').daterangepicker(option);
                }
                ele.find('span').on("click", function () {
                    $(this).prev().click();
                });
                return ele;
            },
            'file': function (data, form) {
                var fileTmpl = '<div><div class="fileinput fileinput-new" data-provides="fileinput">'
                    + '<div class="input-group input-xxlarge">'
                    + '<div class="form-control uneditable-input" data-trigger="fileinput">'
                    + '<i class="fa fa-file fileinput-exists"></i>&nbsp; <span class="fileinput-filename "></span>'
                    + '</div>'
                    + '<span class="btn btn-default btn-file input-group-addon">'
                    + '<span class="fileinput-new">选择文件 </span>'
                    + '<span class="fileinput-exists">变更 </span>'
                    + '<input drole="main" type="text" role="file-input" id="${id_}" name="${name_}" value="" style="display:none;"><input type="file" role="file" id="file_${id_}" name="file"/>'
                    + '</span>'
                    + '<a href="javascript:;" class="input-group-addon btn btn-danger fileinput-exists" data-dismiss="fileinput">删除 </a>'
                    + '</div></div></div>';
                var ele = $.tmpl(fileTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name
                });
                if (data.uploadUrl === undefined) {
                    data.uploadUrl = App.href + "/api/upload/uploadFile";
                }
                if (data.isAjaxUpload == undefined) data.isAjaxUpload = true;
                if (data.isAjaxUpload) {

                    var uploadFile = function () {
                        if ($("#file_" + data.id).val() == "") {
                            return;
                        } else {
                            if (data.allowTypes !== undefined) {
                                var file = ele.find("[role='file']").val();
                                var type = file.substring(file.lastIndexOf("."));
                                var allowTypes = data.allowTypes.split(",")
                                var flag = false;
                                for (var i in allowTypes) {
                                    if (type.toLowerCase().replace(".", "") == allowTypes[i].toLowerCase().replace(".", "")) {
                                        flag = true;
                                    }
                                }
                                if (!flag) {
                                    alert("只允许上传" + data.allowTypes);
                                    return;
                                }
                            }
                        }
                        $
                            .ajaxFileUpload({
                                url: data.uploadUrl,
                                type: "POST",
                                secureuri: false,
                                fileElementId: "file_" + data.id,
                                dataType: "json",
                                success: function (json, status) {
                                    if (json.code === 200) {
                                        json = json.data;
                                        if (data.onSuccess !== undefined) {
                                            data.onSuccess(json, form);
                                            successIcon.show();
                                        } else {
                                            if (json.attachmentUrl !== undefined) {
                                                ele.find("[role='file-input']")
                                                    .attr("value", json.attachmentUrl);
                                                successIcon.show();
                                            } else {
                                                console
                                                    .error("返回的json数据中未检测到attachmentUrl值");
                                            }
                                        }
                                    } else {
                                        if (data.onError !== undefined) {
                                            data.onError(json, form);
                                            successIcon.show();
                                        } else {
                                            form.alert(json.message);
                                        }

                                    }
                                },
                                error: function (data, status, e) {
                                    form.alert(e);
                                }
                            });
                    };
                    if (data.autoUpload == undefined) data.autoUpload = true;
                    if (data.autoUpload) {
                        ele.find('[role="file"]').on("change", function () {
                            uploadFile();
                        });
                    } else {
                        var upload = $('<a href="javascript:;" role="upload" class="input-group-addon btn btn-sm btn-primary fileinput-exists">上传 </a>');
                        ele.find(".input-group").append(upload);
                        upload.click(function () {
                            uploadFile();
                        });
                    }
                    var successIcon = $('<a href="javascript:;" class="input-group-addon" style="border-color: white;background:white;cursor:default;"><span class="glyphicon glyphicon-ok" style="color: #45B6AF;cursor:default;"></span></a>');
                    successIcon.hide();
                    ele.find(".input-group").append(successIcon);
                    ele.find('[data-dismiss="fileinput"]').click(function () {
                        form._refreshItem(data.name);
                        if (data.deleteHandle !== undefined) {
                            data.deleteHandle();
                        }
                    });
                }
                return ele;
            },
            'files': function (data, form) {
                var filesTmpl = '<span class="btn btn-sm btn-success fileinput-button">'
                    + '<span class="glyphicon glyphicon-plus"></span>'
                    + '<span>添加附件... </span>'
                    + '  <input type="file" role="fileuploadInput" id="fileupload_${id_}" name="files[]" multiple="">'
                    + '  </span>';
                var btn = $.tmpl(filesTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id)
                });
                btn.find("input[role=fileuploadInput]").data("data", data);
                var tableTmpl = '<table id="file_table_${id_}" name="'
                    + data.name + '" role="presentation" class="table table-striped clearfix"><tbody class="files"></tbody></table>';
                var table = $.tmpl(tableTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id)
                });
                table.data("data", data);
                var eleTmpl = '<div id="files_div_${id_}" name="files_div_${name_}"></div>';
                var ele = $.tmpl(eleTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name,
                });
                ele.append(btn);
                ele.append(table);
                return ele;
            },
            'image': function (data, form) {
                var imageTmpl = '<div><div class="fileinput fileinput-new" data-provides="fileinput">'
                    + '<div class="fileinput-preview thumbnail" role="preview" data-trigger="fileinput" style="width: 200px; height: 150px; line-height: 150px;"></div>'
                    + '<div role="imageDiv">'
                    + '<span class="btn btn-sm btn-default btn-file">'
                    + '<span class="fileinput-new">选择图片 </span>'
                    + '<span class="fileinput-exists">更改</span>'
                    + '<input drole="main" type="text" role="image-input" id="${id_}" name="${name_}" style="display:none;"><input role="file" type="file" id="image_${id_}" name="file"/>'
                    + '</span>'
                    + '<a href="javascript:;" class="btn btn-sm btn-danger fileinput-exists" data-dismiss="fileinput">删除</a>'
                    + '</div></div></div>';
                var ele = $.tmpl(imageTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name
                });
                if (data.readonly == 'readonly') {
                    ele.find(".btn").hide();
                    ele.find("span").hide();
                }
                if (data.uploadUrl === undefined) {
                    data.uploadUrl = App.href + "/api/upload/uploadImage";
                }
                if (data.isAjaxUpload === undefined)
                    data.isAjaxUpload = true;
                if (data.isAjaxUpload) {
                    // 上传符号
                    var successIcon = $('<a href="javascript:;" class="btn" style="border-color: white;background:white;cursor:default;"><span class="glyphicon glyphicon-ok" style="color: #45B6AF;cursor:default;"></span></a>');
                    successIcon.hide();
                    ele.find("[role='imageDiv']").append(successIcon);
                    // 删除事件
                    ele.find('[data-dismiss="fileinput"]').click(function () {
                        form._refreshItem(data.name);
                    });
                    // 上传
                    var uploadFile = function () {
                        if (ele.find("[role='file']").val() == "") {
                            return;
                        } else {
                            var file = ele.find("[role='file']").val();
                            var type = file.substring(file.lastIndexOf("."));
                            if (!(type.toLowerCase() == ".jpg"
                                    || type.toLowerCase() == ".png"
                                    || type.toLowerCase() == ".bmp" || type
                                        .toLowerCase() == ".jpeg")) {
                                alert("必须是.jpp,.png,.bmp,.jpeg格式中的一种");
                                return;
                            }
                        }
                        $
                            .ajaxFileUpload({
                                url: data.uploadUrl,
                                type: "POST",
                                fileElementId: "image_" + data.id,
                                dataType: "json",
                                success: function (json, status) {
                                    if (json.code === 200) {
                                        json = json.data;
                                    } else {
                                        alert(json.message);
                                        return;
                                    }
                                    if (ele.find("[role='preview']").length > 0) {
                                        var preview = ele
                                            .find("[role='preview']");
                                        if (preview.css('height') != 'none') {
                                            var $img = $('<img>');
                                            $img[0].src = json.attachmentUrl;
                                            $img
                                                .css(
                                                    'max-height',
                                                    parseInt(
                                                        preview.css('height'),
                                                        10)
                                                    - parseInt(
                                                    preview
                                                        .css('padding-top'),
                                                    10)
                                                    - parseInt(
                                                    preview
                                                        .css('padding-bottom'),
                                                    10)
                                                    - parseInt(
                                                    preview
                                                        .css('border-top'),
                                                    10)
                                                    - parseInt(
                                                    preview
                                                        .css('border-bottom'),
                                                    10))
                                            preview.html($img);
                                        }

                                    }
                                    if (data.onSuccess !== undefined) {
                                        data.onSuccess(json);
                                    } else {
                                        if (json.attachmentUrl !== undefined) {
                                            ele
                                                .find(
                                                    "[role='image-input']")
                                                .attr("value",
                                                    json.attachmentUrl);
                                        } else {
                                            console
                                                .error("返回的json数据中为检测到fileUrl值");
                                        }
                                    }
                                    successIcon.show();
                                },
                                error: function (data, status, e) {
                                    alert(e);
                                }
                            });
                    };
                    if (data.readonly !== 'readonly') {
                        if (data.autoUpload) {
                            ele.find('[role="file"]').on("change", function () {
                                uploadFile();
                            });
                        } else {
                            var upload = $('<a href="javascript:;" role="upload" data-dismiss="fileinput" class="btn btn-sm btn-primary fileinput-exists">上传 </a>');
                            ele.find("[role='imageDiv']").append(upload);
                            upload.on("click", function () {
                                uploadFile();
                            });
                        }
                    }
                }
                return ele;
            },
            'tree': function (data, form) {
                var treeTmp =
                    '<div class="form-group input-group ${hideSearch_}" style="width: 33%;">'
                    + '<input type="text" id="tree_search_${id_}" class="form-control">'
                    + '<span class="input-group-btn">'
                    + '<button class="btn btn-sm btn-default" id="tree_search_btn_${id_}" type="button"><i class="fa fa-search"></i>'
                    + '</button>'
                    + '</span>'
                    + '</div>'
                    + '<input drole="main" role="tree_${id_}_input" data-type="tree-input" type="text" id="${id_}" name="${name_}" value="" class="hide"/>'
                    + '<ul id="tree_${id_}" role="tree" did="${id_}" class="ztree"></ul>';
                var ele = $.tmpl(treeTmp, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name,
                    "hideSearch_": data.hideSearch != undefined && !data.hideSearch ? '' : 'hide'
                });
                var chkboxType = data.chkboxType === undefined ? {"Y": "p", "N": "p"} : data.chkboxType;
                var beforeCheck = data.beforeCheck === undefined ? function () {
                } : data.beforeCheck;
                var setting = {
                    check: {
                        enable: (data.checkable === undefined ? true : data.checkable),
                        chkStyle: data.chkStyle,
                        radioType: "all",
                        chkboxType: chkboxType
                    },
                    data: {
                        simpleData: {
                            enable: true
                        }
                    },
                    async: {
                        enable: true,
                        url: data.url,
                        type: "POST",
                        data: (data.data === undefined ? {} : data.data),
                        autoParam: data.autoParam
                    },
                    callback: {
                        beforeCheck: function (treeId, treeNode) {
                            beforeCheck(treeId, treeNode, form);
                        },
                        onCheck: function (e, treeId, treeNode) {
                            var zTree = $.fn.zTree.getZTreeObj(treeId);
                            var nodes = zTree.getCheckedNodes(true);
                            var ids = [];
                            if (nodes.length > 0) {
                                for (var i in nodes) {
                                    ids.push(nodes[i].id);
                                }
                                $("[role='" + treeId + "_input']").val(ids)
                                    .attr("value", ids);
                            } else {
                                $("[role='" + treeId + "_input']").val("")
                                    .attr("value", "");
                            }
                            $("[role='" + treeId + "_input']").trigger("change");
                        },
                        onAsyncSuccess: function (event, treeId, treeNode, msg) {
                            var zTree = $.fn.zTree.getZTreeObj(treeId);
                            var value = $("[role='" + treeId + "_input']")
                                .attr("value");
                            if (value != "") {
                                var ids = value.split(",");
                                if (ids.length > 0) {
                                    for (var i in ids) {
                                        var c_node = zTree.getNodeByParam("id",
                                            ids[i], null);
                                        if (c_node) {
                                            zTree
                                                .checkNode(c_node, true,
                                                    false);
                                        }
                                    }
                                }
                            }
                            zTree.expandAll(data.expandAll === undefined ? false
                                : data.expandAll);
                        }
                    }
                };
                ele.data("setting", setting);
                return ele;
            },
            'kindEditor': function (data, form) {
                var kindeditorTmpl = '<textarea drole="main" role="kindEditor" class="form-control" id="${id_}" name="${name_}"></textarea>';
                var ele = $.tmpl(kindeditorTmpl, {
                    "id_": (data.id === undefined ? data.name : data.id),
                    "name_": data.name
                });
                ele.data("width", data.width);
                ele.data("height", data.height === undefined ? "400px"
                    : data.height);
                return ele;
            }
        },
        _registerEvents: function () {
            this._uniform();
            this._initSubmit();
            this._initShowIconText();
            this._initTree();
            this._initKindEditor();
            this._initMultiFileUpload();
            this._initHtmlHandle();
            this._initCodeMirror();
        },
        _uniform: function () {
            var that = this;
            if (this._options.select2 && $().select2) {
                var selects = this.$form.find("select");
                if (selects.size() > 0) {
                    selects.each(function () {
                        $(this).select2({
                            width: "100%"
                        });
                    });
                }
            }
            if (!$().uniform) {
                return;
            }
            var test = $("input[type=checkbox]:not(.toggle), input[type=radio]:not(.toggle, .star)");
            if (test.size() > 0) {
                test.each(function () {
                    $(this).show();
                    $(this).uniform();
                });
            }
        },
        _initTree: function () {
            if (!$.fn.zTree) {
                return;
            }
            $('[role="tree"]').each(function () {
                var tree = $(this);
                var zTreeObj = $.fn.zTree.init(tree, tree.data("setting"));
                var id = $(this).attr("did");
                $("#tree_search_btn_" + id).on('click', function () {
                    var node = zTreeObj.getNodesByParamFuzzy("name", $("#tree_search_" + id).val());
                    zTreeObj.selectNode(node[0]);
                });
            });

        },
        _initKindEditor: function () {
            var that = this;
            if (KE) {
                $('[role="kindEditor"]')
                    .each(
                        function () {
                            var ele = $(this);
                            var edWith = ele
                                .data("width") === undefined ? "100%" : ele.data("width");
                            var editor = KE
                                .create('#' + ele.attr("id"),
                                    {
                                        uploadJson: App.href
                                        + '/api/KE/fileUpload',
                                        fileManagerJson: App.href
                                        + '/api/KE/fileManager',
                                        minWidth: 0,
                                        width: edWith,
                                        height: (ele
                                            .data("height") === undefined ? '400px' : ele.data("height")),
                                        allowFileManager: true,
                                        afterBlur: function () {
                                            this.sync();
                                        },
                                        resizeType: 1
                                    });
                            that._editor[ele.attr("id")] = editor;
                        });
            }
        },
        _initCodeMirror: function () {
            var that = this;
            setTimeout($.proxy(function () {
                $('textarea[code=true]').each(function () {
                    var area = this;
                    var t = document.getElementById($(this).attr("id"));
                    var e = CodeMirror.fromTextArea(t, {
                        lineNumbers: true,
                        matchBrackets: true,
                        mode: "text/typescript"
                    });
                    e.on("change", function (cm) {
                        $(area).val(cm.getValue());
                    });
                });
            }, that), 500);
        },
        _initMultiFileUpload: function () {
            var template = '<tr class="template-upload fade in">'
                + '<td style="width: 20%; border-bottom: 1px solid #ddd;border-left: 1px solid #ddd;">'
                + '<span class="preview"><img alt="${alt_}" style="width: 32px;height: 32px;"></span>'
                + '</td>'
                + '<td style="width: 50%;vertical-align: middle;border-bottom: 1px solid #ddd;">'
                + '<p class="name">${fileName_}</p>'
                + '<p class="size">${fileSize_} KB <span class="progress">0%</span></p>'
                + '</td>'
                + '<td style="width: 30%;vertical-align: middle;border-bottom: 1px solid #ddd;border-right: 1px solid #ddd;">'
                + '    <button type="button" data-loading-text="上传中..." class="btn btn-sm btn-primary btn-sm start">'
                + '       <span class="glyphicon glyphicon-open"></span>'
                + '       <span>上传</span>'
                + '    </button>'
                + '    <button type="button" class="btn btn-warning  btn-sm cancel">'
                + '       <span class="glyphicon glyphicon-remove"></span>'
                + '       <span >取消</span>' + '    </button>        '
                + '</td>'
                + '<input type="hidden" name="${attName_}" class="att"/>'
                + '</tr>';
            var deleteStr = '<span >删除</span>';
            var uploadUrl = App.href + '/api/upload/uploadFiles';
            var files = $("input[role=fileuploadInput]");
            if (files.length > 0) {
                $.each(files, function (i, file) {
                    var element_data = $(this).data("data");
                    var currentData = {};
                    if (element_data.uploadUrl !== undefined)
                        uploadUrl = element_data.uploadUrl;
                    $('#fileupload_' + element_data.id).fileupload(
                        {
                            url: uploadUrl,
                            autoUpload: true,
                            dataType: 'json',
                            previewCrop: true,
                            add: function (e, data) {
                                var type = getLowCaseType(data.files[0].name);
                                var allowType = element_data.allowType === undefined ? "" : element_data.allowType;
                                var flag = false;
                                if (allowType != null && allowType != "") {
                                    var allows = allowType.split(",");
                                    for (var i in allows) {
                                        if (allows != null && allows != "") {
                                            if (allows[i].toLowerCase() == type) {
                                                flag = true;
                                            }
                                        }
                                    }
                                } else {
                                    flag = true;
                                }
                                if (!flag) {
                                    alert("上传格式限制为：" + allowType);
                                    return false;
                                }
                                if (element_data.limit !== undefined) {
                                    var currentLength = $("table[name='" + element_data.fileName + "']").find("tbody.files > tr").length;
                                    if (currentLength >= element_data.limit) {
                                        alert("最多只能上传" + element_data.limit + "个附件！");
                                        return;
                                    }
                                }
                                var templateImpl = $
                                    .tmpl(
                                        template,
                                        {
                                            "alt_": type,
                                            "fileName_": data.files[0].name,
                                            "fileSize_": (data.files[0].size / 1000)
                                                .toFixed(2),
                                            "attName_": (element_data.name === undefined ? "attrIds"
                                                : element_data.name)
                                        });
                                $("#file_table_" + element_data.id).find("tbody.files").append(templateImpl);
                                data.content = templateImpl;
                                $(".start", templateImpl).click(
                                    function () {
                                        currentData.bar = templateImpl;
                                        data.submit();
                                    });
                                $(".cancel", templateImpl).click(
                                    function () {
                                        data.abort();
                                        $(templateImpl).remove();
                                    });

                            },
                            done: function (e, data) {// 设置文件上传完毕事件的回调函数
                                $(".start", data.content).remove();
                                var id = data.result.attachmentId;
                                var name = data.result.attachmentName;
                                var url = data.result.attachmentUrl;
                                if (element_data.convertData !== undefined) {
                                    var arrays = element_data.convertData(data.result);
                                    id = arrays[0];
                                    name = arrays[1];
                                    url = arrays[2];
                                }
                                $(".att", data.content).val(id);
                                if (getLowCaseType(name) == ".jpg") {
                                    $(".preview", data.content).find("img").attr("src", url);
                                }
                                $(".cancel", data.content).html(deleteStr);
                            },
                            progressall: function (e, data) {// 设置上传进度事件的回调函数
                                var progress = parseInt(data.loaded
                                    / data.total * 100, 10);
                                $('.progress', data.content).text(progress + '%');
                            }
                        });
                });
            }
        },
        _renderDivList: function (div, name, values) {
            var that = this;
            var data = $(div).data("data");
            var ele = $(div);
            var value_arr = isArray(values) ? values : values.split(',');
            $.each(value_arr, function (i, id) {
                var itemWrapper = $('<div class="row">' +
                    '<div role="s-ele" class="col-lg-12 form-group input-group"></div>' +
                    '</div>');
                if (data.items != undefined) {
                    if (data.items.length == 1) {
                        var it = data.items[0];
                        var item = that._formEles[it.type](it, that);
                        that._loadValue(it.name, id, item);
                        var iWrapper;
                        if (it.label != undefined) {
                            iWrapper = $('<div class="form-group"><label class="control-label col-md-2">' + it.label + '</label><div role="i-ele" class="col-md-8"></div></div>');
                        } else {
                            iWrapper = $('<div class="form-group"><div role="i-ele" class="col-md-12"></div></div>');
                        }
                        iWrapper.find('[role=i-ele]').append(item);
                        itemWrapper.find('[role=s-ele]').append(iWrapper);
                    } else {
                        $.each(data.items, function (j, jd) {
                            var item = that._formEles[jd.type](jd, that);
                            that._loadValue(jd.name, id[jd.name], item);
                            var iWrapper;
                            if (jd.label != undefined) {
                                iWrapper = $('<div class="form-group"><label class="control-label col-md-offset-1 col-md-2">' + jd.label + '</label><div role="i-ele" class="col-md-9"></div></div>');
                            } else {
                                iWrapper = $('<div class="form-group"><div role="i-ele" class="col-md-offset-1 col-md-11"></div></div>');
                            }
                            iWrapper.find('[role=i-ele]').append(item);
                            itemWrapper.find('[role=s-ele]').append(iWrapper);
                        });
                    }
                    itemWrapper.find('[role=s-ele]').append($('<span role="s-action" style="vertical-align: top;" class="input-group-btn"></span>'));
                    var deleteBtn = $('<button class="btn btn-sm btn-danger" type="button"><i class="fa fa-times"></i></button>');
                    itemWrapper.find('[role=s-action]').append(deleteBtn);
                    deleteBtn.on("click", function () {
                        itemWrapper.remove();
                    });
                    ele.find('[role=ele]').append(itemWrapper);
                    that._uniform();
                }
            });
        },
        _renderMultipleFiles: function (table, fieldName, fileIds) {
            var elementData = $(table).data("data");
            var template = '<tr class="template-upload fade in">'
                + '<td style="width: 20%;">'
                + '<span class="preview"><img alt="${alt_}" width="32" height="32"></span>'
                + '</td>'
                + '<td style="width: 50%;vertical-align: middle;border-bottom: 1px solid #ddd;">'
                + '<p class="name">${fileName_}</p>'
                + '<p class="size">${fileSize_} KB</p>'
                + '</td>'
                + '<td style="width: 30%;vertical-align: middle;">'
                + '    <button type="button" class="btn btn-warning btn-sm cancel">删除</button>        '
                + '</td>'
                + '<input type="hidden" name="' + fieldName + '" value="${fileIds_}" class="att"/>'
                + '</tr>';
            if ($.trim(fileIds) == "")
                return;
            var ids = fileIds.toString().split(",");
            var fileInfoUrl = (elementData.fileInfoUrl === undefined ? (App.href + "/api/upload/attachment") : elementData.fileInfoUrl);
            var dataParam = (elementData.dataParam === undefined ? "attachmentId" : elementData.dataParam);
            for (var i in ids) {
                var dataParamValue = {};
                dataParamValue[dataParam] = ids[i];
                $.ajax({
                    type: "POST",
                    data: dataParamValue,
                    dataType: "json",
                    url: fileInfoUrl,
                    success: function (data) {
                        if (data.code == 200) {
                            var file = $.tmpl(template, {
                                "alt_": data.data.attachmentSuffix,
                                "fileName_": data.data.attachmentName,
                                "fileSize_": (data.data.attachmentSize / 1000)
                                    .toFixed(2),
                                "fileIds_": data.data.attachmentId
                            });
                            if (getLowCaseType(data.data.attachmentName) == ".jpg") {
                                file.find(".preview > img").attr("src", data.data.attachmentUrl);
                            }
                            file.appendTo(table);
                            file.find("button.btn.btn-warning.cancel").bind(
                                "click", function () {
                                    $(this).parent().parent().remove();
                                });
                        }
                    }
                });
            }
        },
        _initHtmlHandle: function () {
            $("div[formele=html]").each(function () {
                var data = $(this).parent().parent().data("data");
                if (data !== undefined && data.eventHandle !== undefined) {
                    data.eventHandle($(this));
                }
            });
        },
        _initValidate: function () {
            var that = this;
            if (!$().validate) {
                console.error("validate.js未引入");
                return;
            }
            var validateOptions = {
                errorElement: 'span',
                errorClass: 'help-block help-block-error',
                focusInvalid: true,
                ignore: "",
                errorPlacement: function (error, element) {
                    if (element.parent(".input-group").size() > 0) {
                        error.insertAfter(element.parent(".input-group"));
                    } else if (element.attr("data-error-container")) {
                        error.appendTo(element);
                    } else if (element.parents('.radio').size() > 0) {
                        error.appendTo(element.parents('.radio'));
                    } else if (element.parents('.radio-list').size() > 0) {
                        error.appendTo(element.parents('.radio-list'));
                    } else if (element.parents('.radio-inline').size() > 0) {
                        error.appendTo(element.parents('.radio-inline'));
                    } else if (element.parents('.checkbox').size() > 0) {
                        error.appendTo(element.parents('.checkbox'));
                    } else if (element.parents('.checkbox-list').size() > 0) {
                        error.appendTo(element.parents('.checkbox-list'));
                    } else if (element.parents('.checkbox-inline').size() > 0) {
                        error.appendTo(element.parents('.checkbox-inline'));
                    } else {
                        error.appendTo(element.parents(".form-group").find(
                            "div:first"));
                    }
                },
                highlight: function (element) {
                    $(element).closest('.form-group').addClass('has-error');
                },

                unhighlight: function (element) {
                    $(element).closest('.form-group').removeClass('has-error');
                    $(element).closest('.form-group').find('.help-block-error')
                        .empty();
                },

                success: function (label) {
                    label.closest('.form-group').removeClass('has-error');
                },
                submitHandler: function (form) {
                    that._submitForm();
                }
            };
            this._validateOptions = $.extend(true, {}, validateOptions,
                this._validateOptions);
            this.$form.validate(this._validateOptions);
        },
        _initSubmit: function () {
            var that = this;
            if (this._isValidate) {
                this._initValidate();
            } else {
                $('button[role="submit"]').on("click", function () {
                    that._submitForm();
                });
            }
        },
        _initShowIconText: function () {
            var that = this;
            $('input[showicon="true"]').bind("input propertychange",
                function () {
                    $(this).prev().attr("class", $(this).val());
                });
        },
        _submitForm: function () {
            var that = this;
            if (this._beforeSubmit !== undefined) {
                var result = that._beforeSubmit();
            }
            if (result == false) {
                return;
            }
            $('#' + that._formId).find("input[type=text]").each(
                function (i, d) {
                    $(this).val($(this).val().replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                }
            );
            if (this._ajaxSubmit) {
                $.ajax({
                    type: that._method,
                    url: that._action,
                    data: $('#' + that._formId).serialize(),
                    beforeSend: function (request) {
                        request.setRequestHeader("X-Auth-Token", App.token);
                        if (that._beforeSend != undefined)
                            that._beforeSend(request);
                    },
                    dataType: "json",
                    success: function (data) {
                        if (data.code === 200) {
                            if (that._ajaxSuccess !== undefined) {
                                that._ajaxSuccess(data);
                            } else {
                                alert("表单提交成功");
                            }
                        } else {
                            that._alert(data.message);
                        }
                    },
                    error: function (data) {
                        alert("异步提交表单错误.");
                    }
                });
            } else {
                that.$form.submit();
            }
        },
        _doCallbacks: function () {
            if (this._complete !== undefined) {
                this._complete();
            }
            if (this._callback !== undefined) {
                this._callback();
            }
        },
        _loadValue: function (name, value, element) {
            var ele = element || this.$form.find("[name='" + name + "']");
            if (ele.is('input[type="text"]')) {
                if (ele.attr("data-type") == "tree-input") {
                    if ($.isArray(value)) {
                        value = value.toString();
                    }
                    ele.attr("value", value);
                    var tree = $.fn.zTree.getZTreeObj("tree_" + ele.attr("id"));
                    if (tree !== undefined) {
                        tree.refresh();
                        tree.reAsyncChildNodes(null, "refresh");
                    }
                    ele.trigger("change");
                } else if (ele.attr("role") == "image-input") {
                    if (value !== undefined && value != '') {
                        ele.attr("value", value);
                        preview = ele.parent().parent().parent().find(
                            "[role='preview']");
                        var $img = $('<img>');
                        $img[0].src = value;
                        if (preview.css('max-height') != 'none')
                            $img.css('max-height', parseInt(preview
                                    .css('max-height'), 10)
                                - parseInt(preview.css('padding-top'), 10)
                                - parseInt(preview.css('padding-bottom'), 10)
                                - parseInt(preview.css('border-top'), 10)
                                - parseInt(preview.css('border-bottom'), 10))
                        preview.html($img);
                        preview.parent().removeClass("fileinput-new").addClass(
                            "fileinput-exists");
                    }
                } else if (ele.attr("role") == "file-input") {
                    if (value != '') {
                        ele.attr("value", value);
                        ele.parent().parent().parent().removeClass("fileinput-new")
                            .addClass("fileinput-exists");
                        ele.parent().parent().parent().find(
                            "span.fileinput-filename ").text(
                            value.substring(value.lastIndexOf("/") + 1));
                    }
                } else if (ele.is('table')) {
                    this._renderMultipleFiles(ele, name, value);
                } else {
                    ele.val(value);
                }
            } else if (ele.is('input[type="radio"]')) {
                this.$form.find(
                    "input[type='radio'][name='" + name + "'][value='"
                    + value + "']").attr("checked", true);
            } else if (ele.is('input[type="checkbox"]')) {
                if (value != null) {
                    var values = value.split(",");
                    for (var i in values) {
                        this.$form.find(
                            "input[type='checkbox'][name='" + name
                            + "'][value='" + values[i] + "']")
                            .attr("checked", true);
                    }
                }
            } else if (ele.is('input[type="hidden"]')) {
                if (value != null && value != "") {
                    if (ele.attr("data-type") == "tree-input") {
                        if ($.isArray(value)) {
                            value = value.toString();
                        }
                        ele.val(value);
                        var tree = $.fn.zTree.getZTreeObj("tree_"
                            + ele.attr("id"));
                        if (tree !== undefined) {
                            tree.refresh();
                            tree.reAsyncChildNodes(null, "refresh");
                        }
                    } else if (ele.attr("role") == "image-input") {
                        if (value !== undefined && value != '') {
                            ele.val(value);
                            var preview = ele.parent().parent().parent().find(
                                "[role='preview']");
                            var $img = $('<img>');
                            $img[0].src = value;
                            if (preview.css('max-height') != 'none')
                                $img.css('max-height',
                                    parseInt(preview.css('max-height'), 10)
                                    - parseInt(preview
                                        .css('padding-top'), 10)
                                    - parseInt(preview
                                        .css('padding-bottom'), 10)
                                    - parseInt(preview
                                        .css('border-top'), 10)
                                    - parseInt(preview
                                        .css('border-bottom'), 10))
                            preview.html($img);
                            preview.parent().removeClass("fileinput-new").addClass(
                                "fileinput-exists");
                        }
                    } else if (ele.attr("role") == "file-input") {
                        ele.val(value);
                        ele.parent().parent().parent().removeClass(
                            "fileinput-new").addClass("fileinput-exists");
                        ele.parent().parent().parent().find(
                            "span.fileinput-filename ").text(
                            value.substring(value.lastIndexOf("/") + 1));
                    } else {
                        ele.val(value);
                    }
                }
            } else if (ele.is('select')) {
                ele.val(value);
            } else if (ele.is('textarea')) {
                if (ele.attr("role") == "kindEditor") {
                    ele.text(value);
                    if (value != null) {
                        var editor = this._editor[ele.attr("id")];
                        editor.html(value);
                        editor.sync();
                    }
                } else {
                    if (value != null) {
                        ele.text(value);
                    }
                }
            } else if (ele.is('p')) {
                var format = ele.data("format");
                if (format !== undefined)
                    value = format(value);
                ele.html(value);
            } else if (ele.is('table')) {
                this._renderMultipleFiles(ele, name, value);
            } else if (ele.is('div[role=list]')) {
                this._renderDivList(ele, name, value);
            } else {
                ele.val(value);
            }
            var loadHandler = ele.data("load");
            if (loadHandler !== undefined) {
                loadHandler(ele, value);
            }
            this._uniform();
        },
        _reset: function () {
            var that = this;
            if (this._data !== undefined) {
                $.each(this._data, function (i, value) {
                    that._loadValue(i, value);
                });
            } else {
                if (this.$form !== undefined)
                    this.$form[0].reset();
            }
        },
        _reload: function (options) {
            if (options !== undefined) {
                this._options = $.extend(true, {}, this._options, options);
                this._setOptions(this._options, this);
            }
            this._remove();
            this._init();
        },
        _remove: function () {
            this.$element.empty();
        },
        _refreshItem: function (name) {
            var module = this._module[name];
            var data = module.data("data");
            module.find(".form-group").empty();
            this._buildModuleWrapper(module, data);
            $('[role="tree"]').each(function () {
                if ($(this).attr("did") == data.id) {
                    var tree = $(this);
                    var zTreeObj = $.fn.zTree.init(tree, tree.data("setting"));
                    var id = $(this).attr("did");
                    $("#tree_search_btn_" + id).on('click', function () {
                        var node = zTreeObj.getNodesByParamFuzzy("name", $("#tree_search_" + id).val());
                        zTreeObj.selectNode(node[0]);
                    });
                }
            });
        }
    };

    /**
     * jquery插件扩展 ===================================================
     */

    var form = function (options, callback) {
        options = $.extend(true, {}, Form.defaults, options);
        var eles = [];
        this.each(function () {
            var self = this;
            var instance = new Form(self, options, callback);
            eles.push(instance);
        });
        return eles[0];
    };

    $.fn.extend({
        'orangeForm': form
    });
})(jQuery, window, document);
