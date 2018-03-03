/**
 * Created by chenguojun on 8/29/16.
 */
;
(function ($, window, document, undefined) {
    var Grid = function (element, options) {
        this._setVariable(element, options);
        this._setOptions(this._options);
        this._initEmpty();
        if (!this._autoLoad)
            return
        if (this._url != undefined) {
            this._load();
            return
        }
        if (this._data != undefined) {
            this._init();
            return
        }
        console.error("data或url未定义");
    };
    Grid.dateDefaults = {};
    if (typeof(moment) != "undefined") {
        Grid.dateDefaults = {
            showDropdowns: true,
            linkedCalendars: false,
            autoApply: false,
            ranges: {
                '今天': [moment().startOf('day'), moment().startOf('day')],
                '昨天': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                '最近七天': [moment().subtract(6, 'days'), moment()],
                '最近三十天': [moment().subtract(29, 'days'), moment()],
                '最近半年': [moment().subtract(6, 'month').startOf('day'), moment().endOf('day')],
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
            singleDatePicker: false,
            timePicker24Hour: true,
            timePickerSeconds: true
        };
    }
    var getBarOrLineChartOption = function (xData, yData) {
        var mode = xData['selectedMode'] || 'multiple';
        return {
            legend: {
                x: 'center',
                y: 'bottom',
                selectedMode: mode,
                data: xData['legend']
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    animation: false,
                    label: {
                        borderWidth: 1,
                        shadowBlur: 0,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0
                    }
                }
            },
            xAxis: {
                type: 'category',
                data: xData['data']
            },
            yAxis: xData['axis'],
            series: yData
        };
    };
    var getPieChartOption = function (xData, yData) {
        return {
            legend: {
                x: 'center',
                y: 'bottom',
                selectedMode: 'single',
                data: xData['legend']
            },
            tooltip: {
                trigger: 'item',
                formatter: "{b} <br/> {a} : {c} ({d}%)"
            },
            series: yData
        };
    };
    var getFunnelChartOption = function (xData, yData) {
        return {
            tooltip: {
                trigger: 'item',
                formatter: "{a}<br>{b} : {c}"
            },
            legend: {
                selectedMode: 'single',
                data: xData['legend']
            },
            calculable: true,
            series: yData
        };
    };
    var getMapChartOption = function (xData, yData) {
        return {
            tooltip: {
                trigger: 'item',
                formatter: "{a}<br>{b} : {c}"
            },
            legend: {
                selectedMode: 'single',
                data: xData['legend']
            },
            visualMap: {
                min: xData['min'],
                max: xData['max'],
                left: 'left',
                top: 'bottom',
                text: ['高', '低'],
                calculable: true
            },
            series: yData
        };
    };
    var toThousands = function (num) {
        return (num || 0).toString().replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
    };
    Grid.defaults = {
        autoLoad: true,
        pageNum: 1,
        pageSize: 5,
        showCheck: false,
        checkboxWidth: "2%",
        showIndexNum: true,
        indexNumWidth: "2%",
        indexNumText: "序号",
        contentType: "table",
        showContentType: true,
        contentTypeItems: "table,card,list",
        showSearch: true,
        showPaging: true,
        simplePaging: true,
        actionColumnText: "操作",
        actionColumnAlign: "left",
        actionColumnWidth: "20%",
        chartPieType: 0,
        select2: false,
        pageSelect: [10, 15, 20, 50],
        changeLoad: true
    };
    Grid.statics = {
        toolRowTmpl: '<div class="table-toolbar"><div class="row">'
        + '<div ele-type="tools" class="col-md-6"></div>'
        + '<div ele-type="dropdowns" class="col-md-6"></div>'
        + '</div></div>',
        dropdownTmpl: '<div class="btn-group"><button class="btn ${cls_} dropdown-toggle" data-toggle="dropdown"  aria-expanded="true">${text_}<i class="fa fa-angle-down"></i></button>'
        + '<ul class="dropdown-menu" role="menu"></ul></div>',
        liTmpl: '<li><a href="javascript:;">${text_}</a></li>',
        searchRowTmpl: '<div class="form"><form ele-type="search" role="form">'
        + '<div class="form-body"><div role="row" class="row"></div></div>'
        + '<div class="form-actions right" style="border-top: 0px;padding: 0px 0px 0px;background: none;"></div>'
        + '</form></div>',
        searchElementTmpl: '<div class="col-md-${span_}"><div class="form-group">'
        + '</div></div>',
        gridWrapperTmpl: '<div id="${id_}_wrapper" class="table-responsive no-footer"></div>',
        tableRowTmpl: '<div class="row">' +
        '<div role="content" class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></div>' +
        '</div>',
        cardRowTmpl: '<div class="row" style="margin-top: 10px;margin-bottom: 0px;">' +
        '<div role="content" class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></div>' +
        '</div>',
        listRowTmpl: '<div class="row" style="margin-top: 10px;margin-bottom: 0px;">' +
        '<div role="content" class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></div>' +
        '</div>',
        chartRowTmpl: '<div class="row" style="margin-top: 10px;margin-bottom: 0px;">' +
        '<div role="content" class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></div>' +
        '</div>',
        pagingRowTmpl: '<div class="row"><div role="select" class="col-md-3 col-sm-12 hidden-xs hidden-sm"></div><div role="info" class="col-md-4 col-sm-12 hidden-xs hidden-sm"></div><div role="goPage" class="col-md-2 col-sm-12 hidden-xs hidden-sm" style="text-align: right;"></div><div role="page" class="col-md-3 col-sm-12"></div></div>',
        labelTmpl: '<label>${label_}</label>',
        textTmpl: '<input type="text" name="${name_}" id="${id_}" class="form-control ${span_}" placeholder="${placeholder_}" value="${value_}">',
        passwordTmpl: '<input type="password" class="form-control ${class_}">',
        selectTmpl: '<select name="${name_}" id="${id_}" class="form-control ${class_}"></select>',
        optionTmpl: '<option value="${value_}" ${selected}>${text_}</option>',
        checkboxGroupTmpl: '<div class="checkbox-list" id="${id_}" name="${name_}"></div>',
        checkboxTmpl: '<label>'
        + '<input type="checkbox" id="${id_}" name="${name_}" value="${value_}">${text_}</label>',
        inlineCheckboxTmpl: '<label class="checkbox-inline">'
        + '<input type="checkbox" id="${id_}" name="${name_}" value="${value_}">${text_}</label>',
        radioGroupTmpl: '<div class="radio-list" id="${id_}" name="${name_}"></div>',
        radioTmpl: '<label>'
        + '<input type="radio" id="${id_}" name="${name_}" value="${value_}">${text_}</label>',
        inlineRadioTmpl: '<label class="radio-inline">'
        + '<input type="radio" id="${id_}" name="${name_}" value="${value_}">${text_}</label>',
        displayTmpl: '<p class="form-control-static">${text_}</p>',
        buttonTmpl: '<button type="${type_}" class="${class_}" title="${title_}" ${attribute_}>${text_}</button>',
        tableTmpl: '<table class="table table-scrollable table-striped table-bordered table-hover dataTable no-footer" id="${id_}_table"  aria-describedby="${id_}_info"></table>',
        alertTmpl: '<div class="alert alert-${type_} alert-dismissable" role="alert">'
        + '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
        + '<strong>提示:</strong>${alert_}</div>'
    };
    Grid.prototype = {
        reload: function (options) {
            this._reload(options);
        },
        // 获取当前选中节点id
        getSelectIds: function () {
            var ids = [];
            var checkboxs = this.$gridWrapper.find(".checkboxes:checked").each(
                function () {
                    ids.push($(this).val());
                });
            return ids;
        },
        // 获取选中节点的数据集合
        getSelectDatas: function () {
            var datas = [];
            this.$gridWrapper.find("tr.active").each(function () {
                datas.push($(this).data("data"));
            });
            return datas;
        },
        alert: function (alertText) {
            this._alert(alertText, "danger", 5);
        },
        _alert: function (alertText, type, seconds, cb) {
            if (type == undefined) {
                type = "danger";
            }
            if (seconds == undefined) {
                seconds = 3;
            }
            var alertDiv = $.tmpl(Grid.statics.alertTmpl, {
                "type_": type,
                "alert_": alertText
            });
            this.$element.prepend(alertDiv);
            alertDiv.delay(seconds * 1000).fadeOut();
            App.scrollTo(alertDiv, -200);
            if (cb != undefined) {
                cb();
            }
        },
        // 设置变量
        _setVariable: function (element, options) {
            this.$element = $(element);
            var id = element.id;
            if (id == undefined || id == '') {
                id = "orange_grid_" + new Date().getTime() + "_" + (Math.random() * 100);
                this.$element.attr("id", id);
            }
            this._elementId = id;

            this._options = options;

            this.$searchForm = undefined;
            this._total = 0;
            // 搜索栏是否初始化
            this._searchInited = false;
            // 工具栏是否初始化
            this._toolsInited = false;

        },
        // 设置属性
        _setOptions: function (options) {
            this._autoLoad = options.autoLoad;
            this._url = options.url;
            this._type = options.type == undefined ? "GET" : options.type;
            this._beforeSend = options.beforeSend;
            if (options.data != undefined) {
                if (options.data.data == undefined
                    || options.data.total == undefined) {
                    console.error("data格式不正确，必须包含data和total");
                    return;
                }
                this._data = options.data;
                this._html = options.data.html;
                this._grids = options.data.data;
                this._total = options.data.total;
            }
            this._columns = options.columns;
            this._pageNum = options.pageNum;
            this._pageSize = options.pageSize;
            if (options.idField != undefined) {
                this._idField = options.idField;
            } else {
                console.error("idField属性未定义");
                return;
            }
            if (options.headField != undefined) {
                this._headField = options.headField;
            }
            if (options.imgField != undefined) {
                this._imgField = options.imgField;
            }
            this._contentType = options.contentType;
            this._showContentType = options.showContentType;
            this._showCheck = options.showCheckbox;
            this._checkboxWidth = options.checkboxWidth;
            this._showIndexNum = options.showIndexNum;
            this._indexNumWidth = options.indexNumWidth;
            this._indexNumText = options.indexNumText;
            this._showSearch = options.showSearch;
            this._showPaging = options.showPaging;
            this._simplePaging = options.simplePaging;
            this._chartClick = options.chartClick;
            this._showLegend = options.showLegend;
            this._select2 = options.select2;
            if (options.tools != undefined) {
                // 左侧工具栏
                this._tools = options.tools;
            }
            if (options.dropdowns != undefined) {
                // 右侧下拉选项
                this._dropdowns = options.dropdowns;
            }
            if (options.search != undefined) {
                this._search = options.search;
            }
            if (options.actionColumns != undefined) {
                // 操作栏
                this._actionColumns = options.actionColumns;
            }
            if (options.actionColumnWidth != undefined) {
                // 操作栏宽度
                this._actionColumnWidth = options.actionColumnWidth;
            }
            if (options.actionColumnAlign != undefined) {
                // 操作栏宽度
                this._actionColumnAlign = options.actionColumnAlign;
            }
            // 操作栏显示文本
            this._actionColumnText = options.actionColumnText;

            this._sort = options.sort;

            this._pageSelect = options.pageSelect;
            this._afterInit = options.afterInit;

        },
        // 实例启动
        _load: function () {
            this._loadData();
        },
        // 异步加载数据
        _loadData: function () {
            if (this._url != undefined) {
                var that = this;
                var parameters = "";
                if (that._url.indexOf("?") != -1) {
                    parameters = "&";
                } else {
                    parameters = "?";
                }
                parameters += "pageNum=" + this._pageNum;
                parameters += "&pageSize=" + this._pageSize;
                parameters += "&sort_="
                    + (this._sort == undefined ? "" : this._sort);
                this.$element.block(
                    {
                        message: null,
                        css: {
                            backgroundColor: '#ddd',
                            color: '#ddd'
                        }
                    });
                $.ajax({
                    type: that._type,
                    dataType: "json",
                    data: that.$searchForm == undefined ? {} : that.$searchForm
                        .serialize(),
                    beforeSend: function (request) {
                        if (that._beforeSend != undefined) {
                            that._beforeSend(request);
                        }
                    },
                    url: that._url + (parameters == undefined ? "" : parameters),
                    success: function (data) {
                        if (data.code === 200) {
                            that.$element.unblock();
                            that._setData(data.data);
                            that._init();
                        } else if (data.code === 401) {
                            that.$element.unblock();
                            that._alert(data.message + ";请重新登录！", undefined, undefined, App.redirectLogin);
                        } else if (data.code === 403) {
                            that.$element.unblock();
                            that._alert(data.message);
                        } else {
                            that.$element.unblock();
                            that._alert(data.message);
                        }
                    },
                    error: function (jqXHR, textStatus, errorMsg) {
                        that.$element.unblock();
                        console.error("请求异常！");
                    }
                });
            } else {
                this._init();
            }
        },
        _setData: function (data) {
            this._data = data;
            this._html = data.html;
            this._grids = data.data;
            this._total = data.total;
        },
        _initEmpty: function () {
            this._renderEles();
            this._uniform();
        },
        // 初始化
        _init: function () {
            this._remove();
            this._renderEles();
            this._registerEvents();
            this._doAfterInit();
        },
        // 渲染元素
        _renderEles: function () {
            if (this._showSearch && !this._searchInited) {
                this._renderSearch();
                this._searchInited = true;
            }
            if (!this._toolsInited) {
                this._renderTool();
                this._toolsInited = true;
            }
            this._renderGridWrapper();
        },
        // 渲染工具栏
        _renderTool: function () {
            if (this._tools == undefined && this._dropdowns == undefined) {
                return;
            }
            var that = this;
            var toolRow = $.tmpl(Grid.statics.toolRowTmpl, {});
            this.$element.append(toolRow);

            if (this._dropdowns != undefined) {
                var dropdownBtn = $.tmpl(Grid.statics.dropdownTmpl, {
                    "text_": (this._dropdowns.text == undefined ? "更多操作"
                        : this._dropdowns.text),
                    "cls_": (this._dropdowns.cls == undefined ? "default"
                        : this._dropdowns.cls)
                });
                toolRow.find("[ele-type='tools']").append(dropdownBtn);
                dropdownBtn.after("&nbsp;");
                $.each(this._dropdowns.items, function (index, content) {
                    var li = $.tmpl(Grid.statics.liTmpl, {
                        "text_": content.text
                    });
                    if (content.icon != undefined)
                        li.find("a").prepend(
                            "<i class='" + content.icon + "'><i>");
                    dropdownBtn.find("ul").append(li);
                    li.on("click", function () {
                        content.handle(that);
                    });
                });
            }
            if (this._tools != undefined) {
                $.each(this._tools, function (index, content) {
                    var button = $.tmpl(Grid.statics.buttonTmpl, {
                        "class_": content.cls,
                        "type_": "button",
                        "text_": content.text,
                        "title_": (content.title == undefined ? content.text
                            : content.title),
                        "attribute_": (content.attribute == undefined ? ""
                            : content.attribute)
                    });
                    if (content.icon != undefined)
                        button.prepend("<i class='" + content.icon + "'><i>");
                    toolRow.find("[ele-type='tools']").append(button);
                    if (content.handle != undefined) {
                        button.on("click", function () {
                            content.handle(that);
                        });
                    }
                    button.after("&nbsp;");
                });
            }
        },
        // 渲染搜索栏
        _renderSearch: function () {
            var rowEleSpan, items, buttons, hide = false;
            if (this._search == undefined) {
                return;
            } else {
                if (this._search.items != undefined) {
                    items = this._search.items;
                } else {
                    return;
                }
                if (this._search.buttons != undefined) {
                    buttons = this._search.buttons;
                }
                var rowEleNum = this._search.rowEleNum == undefined ? 2
                    : this._search.rowEleNum;
                if (12 % rowEleNum == 0) {
                    rowEleSpan = 12 / rowEleNum;
                }
                if (this._search.hide != undefined) {
                    hide = this._search.hide;
                }
            }
            var that = this;
            var searchFormRow = $.tmpl(Grid.statics.searchRowTmpl, {});
            this._searchEles = {};
            this._searchElesOption = {};
            if (items.length > 0) {
                $
                    .each(
                        items,
                        function (index, item) {
                            var itemDiv = $.tmpl(
                                Grid.statics.searchElementTmpl, {
                                    "span_": (item.rowNum > 0 ? item.rowNum * rowEleSpan : rowEleSpan)
                                }).appendTo(searchFormRow);
                            if (item.label != undefined) {
                                var label = $.tmpl(
                                    Grid.statics.labelTmpl, {
                                        "label_": item.label
                                    });
                                itemDiv.find(".form-group").append(
                                    label);
                            }
                            var ele = {};
                            if (item.type == "text") {
                                ele = $
                                    .tmpl(
                                        Grid.statics.textTmpl,
                                        {
                                            "name_": (item.name == undefined ? ""
                                                : item.name),
                                            "id_": (item.id == undefined ? ""
                                                : item.id),
                                            "placeholder_": (item.placeholder == undefined ? ""
                                                : item.placeholder),
                                            "value_": (item.value == undefined ? ""
                                                : item.value)
                                        });
                                itemDiv.find(".form-group").append(ele);
                            } else if (item.type == "select") {
                                ele = $
                                    .tmpl(
                                        Grid.statics.selectTmpl,
                                        {
                                            "name_": (item.name == undefined ? ""
                                                : item.name),
                                            "id_": (item.id == undefined ? ""
                                                : item.id)
                                        });
                                if (item.items != undefined && item.items.length > 0) {
                                    $.each(
                                        item.items,
                                        function (index, option) {
                                            $
                                                .tmpl(
                                                    Grid.statics.optionTmpl,
                                                    {
                                                        "value_": (option.value == undefined ? ""
                                                            : option.value),
                                                        "text_": (option.text == undefined ? ""
                                                            : option.text)
                                                    })
                                                .appendTo(
                                                    ele);
                                        }
                                    );
                                }
                                itemDiv.find(".form-group").append(ele);
                                if (item.itemsUrl != undefined) {
                                    $.ajax({
                                            type: (item.method == undefined ? "GET" : item.method),
                                            dataType: "json",
                                            async: false,
                                            url: item.itemsUrl,
                                            success: function (data) {
                                                $.each(
                                                    data,
                                                    function (index,
                                                              option) {
                                                        $
                                                            .tmpl(
                                                                Grid.statics.optionTmpl,
                                                                {
                                                                    "value_": (option.value == undefined ? ""
                                                                        : option.value),
                                                                    "text_": (option.text == undefined ? ""
                                                                        : option.text)
                                                                })
                                                            .appendTo(
                                                                ele);
                                                    }
                                                );
                                                that._uniform();
                                            },
                                            error: function (err) {
                                                console
                                                    .error("请求错误");
                                            }
                                        }
                                    );
                                }
                            } else if (item.type == "radioGroup") {
                                ele = $
                                    .tmpl(
                                        Grid.statics.radioGroupTmpl,
                                        {
                                            "name_": (item.name == undefined ? ""
                                                : item.name),
                                            "id_": (item.id == undefined ? ""
                                                : item.id)
                                        });
                                $
                                    .each(
                                        item.items,
                                        function (index, option) {
                                            $
                                                .tmpl(
                                                    Grid.statics.inlineRadioTmpl,
                                                    {
                                                        "name_": (item.name == undefined ? ""
                                                            : item.name),
                                                        "id_": (item.id == undefined ? ""
                                                            : item.id),
                                                        "value_": (option.value == undefined ? ""
                                                            : option.value),
                                                        "text_": (option.text == undefined ? ""
                                                            : option.text)
                                                    })
                                                .appendTo(
                                                    ele);
                                        });
                                itemDiv.find(".form-group").append(ele);
                                if (item.itemsUrl != undefined) {
                                    $
                                        .ajax({
                                            type: "POST",
                                            dataType: "json",
                                            async: false,
                                            url: item.itemsUrl,
                                            success: function (data) {
                                                $
                                                    .each(
                                                        data,
                                                        function (index,
                                                                  option) {
                                                            $
                                                                .tmpl(
                                                                    Grid.statics.inlineRadioTmpl,
                                                                    {
                                                                        "value_": (option.value == undefined ? ""
                                                                            : option.value),
                                                                        "text_": (option.text == undefined ? ""
                                                                            : option.text)
                                                                    })
                                                                .appendTo(
                                                                    ele);
                                                        });
                                                that._uniform();
                                            },
                                            error: function (err) {
                                                console
                                                    .error("请求错误");
                                            }
                                        });
                                }
                            } else if (item.type == "checkboxGroup") {
                                ele = $
                                    .tmpl(
                                        Grid.statics.checkboxGroupTmpl,
                                        {
                                            "name_": (item.name == undefined ? ""
                                                : item.name),
                                            "id_": (item.id == undefined ? ""
                                                : item.id)
                                        });
                                $
                                    .each(
                                        item.items,
                                        function (index, option) {
                                            $
                                                .tmpl(
                                                    Grid.statics.inlineCheckboxTmpl,
                                                    {
                                                        "name_": (item.name == undefined ? ""
                                                            : item.name),
                                                        "id_": (item.id == undefined ? ""
                                                            : item.id),
                                                        "value_": (option.value == undefined ? ""
                                                            : option.value),
                                                        "text_": (option.text == undefined ? ""
                                                            : option.text)
                                                    })
                                                .appendTo(
                                                    ele);
                                        });
                                itemDiv.find(".form-group").append(ele);
                                if (item.itemsUrl != undefined) {
                                    $
                                        .ajax({
                                            type: "POST",
                                            dataType: "json",
                                            async: false,
                                            url: item.itemsUrl,
                                            success: function (data) {
                                                $
                                                    .each(
                                                        data,
                                                        function (index,
                                                                  option) {
                                                            $
                                                                .tmpl(
                                                                    Grid.statics.inlineCheckboxTmpl,
                                                                    {
                                                                        "value_": (option.value == undefined ? ""
                                                                            : option.value),
                                                                        "text_": (option.text == undefined ? ""
                                                                            : option.text)
                                                                    })
                                                                .appendTo(
                                                                    ele);
                                                        });
                                                that._uniform();
                                            },
                                            error: function (err) {
                                                console
                                                    .error("请求错误");
                                            }
                                        });
                                }
                            } else if (item.type == "datepicker") {
                                var dateTmpl = '<div class="input-group">'
                                    + '<input type="text" role="date-input" id="${id_}" name=${name_} value="${value_}" class="form-control">'
                                    + '<span role="icon" class="input-group-addon">'
                                    + '<i class="glyphicon glyphicon-calendar fa fa-calendar"></i>' + '</span></div>';
                                if (typeof(moment) == "undefined") {
                                    return $.tmpl(dateTmpl, {
                                        "id_": (item.id == undefined ? item.name : item.id),
                                        "name_": item.name,
                                        "cls_": item.cls == undefined ? "" : item.cls,
                                        "value_": ""
                                    });
                                }
                                ele = $.tmpl(dateTmpl, {
                                    "id_": (item.id == undefined ? item.name : item.id),
                                    "name_": item.name,
                                    "cls_": item.cls == undefined ? "" : item.cls,
                                    "value_": (item.value == undefined ? moment().format('YYYY-MM-DD HH:mm:ss') : item.value)
                                });
                                itemDiv.find(".form-group").append(ele);
                                var config = (item.config == undefined ? {} : item.config);
                                var option = $.extend(true, Grid.dateDefaults, config);
                                if (item.callback != undefined) {
                                    ele.find('[role="date-input"]').daterangepicker(option, item.callback);
                                } else {
                                    ele.find('[role="date-input"]').daterangepicker(option);
                                }
                                ele.find('span').on("click", function () {
                                    $(this).prev().click();
                                });
                            } else if (item.type == "html") {
                                ele = item.eleHandler();
                                itemDiv.find(".form-group").append(ele);
                            }
                            searchFormRow.find("div[role=row]").append(itemDiv);
                            that._searchEles[item.name] = itemDiv;
                            that._searchElesOption[item.name] = item;
                        });
            }
            searchFormRow.find("[role=form]").append('<input style="display:none">');
            searchFormRow.append("<hr>");
            var showBtn = $.tmpl(Grid.statics.buttonTmpl, {
                "class_": "btn btn-sm btn-primary",
                "text_": "显示搜索面板",
                "title_": "显示",
                "type_": "button"
            });
            var hideBtn = $.tmpl(Grid.statics.buttonTmpl, {
                "class_": "btn btn-sm btn-warning",
                "text_": "隐藏搜索面板",
                "title_": "隐藏",
                "type_": "button"
            });
            if (!hide) {
                showBtn.hide();
                hideBtn.show();
            } else {
                searchFormRow.find('.form-body').hide();
                showBtn.show();
                hideBtn.hide();
            }
            searchFormRow.find('.form-actions').append(showBtn);
            searchFormRow.find('.form-actions').append(hideBtn);
            hideBtn.after("&nbsp;");
            showBtn.on("click", function () {
                searchFormRow.find('.form-body').slideDown();
                showBtn.toggle();
                hideBtn.toggle();
            });
            hideBtn.on("click", function () {
                searchFormRow.find('.form-body').slideUp();
                showBtn.toggle();
                hideBtn.toggle();
            });

            var searchbtn = $.tmpl(Grid.statics.buttonTmpl, {
                "class_": "btn btn-sm btn-primary",
                "text_": " 搜索",
                "title_": "搜索",
                "type_": "button"
            });
            searchbtn.prepend("<i class='fa fa-search'><i>");
            searchbtn.on("click", function () {
                if (that._search.beforeSearch != undefined) {
                    that._search.beforeSearch(that);
                }
                that._reload({
                    pageNum: 1
                });
            });
            searchFormRow.find('.form-actions').append(searchbtn);
            this.$searchbtn = searchbtn;
            searchbtn.after("&nbsp;");
            if (buttons != undefined && buttons.length > 0) {
                $.each(buttons, function (index, button) {
                    var btn = $.tmpl(Grid.statics.buttonTmpl, {
                        "class_": (button.cls == undefined ? "btn btn-default"
                            : button.cls),
                        "text_": (button.text == undefined ? "未定义"
                            : button.text),
                        "title_": (button.title == undefined ? button.text
                            : button.title),
                        "type_": (button.type == undefined ? "button"
                            : button.type)
                    });
                    if (button.icon != undefined)
                        btn.prepend("<i class='" + button.icon + "'><i>");
                    if (button.handle != undefined)
                        btn.on("click", function () {
                            button.handle(that);
                        });
                    searchFormRow.find('.form-actions').append(btn);
                    btn.after("&nbsp;");
                });
            }
            this.$element.append(searchFormRow);
            this._uniform();
            this.$searchForm = searchFormRow.find("form[ele-type='search']");
            this.$searchForm.find("input,select").on("change", function () {
                var name = $(this).attr("name");
                var text = $(this).find("option:selected").text();
                var value = $(this).val();
                if (that._searchElesOption[name].change !== undefined) {
                    that._searchElesOption[name].change(text, value, that);
                }
                if (that._options.changeLoad) {
                    searchbtn.trigger("click");
                }
            });

            if (hide) {
                searchFormRow.find('.form-body').slideUp(1);
            }
        },
        refreshSearchItem: function (name, option) {
            var that = this;
            var itemDiv = this._searchEles[name];
            itemDiv.find(".form-group").empty();
            var item = $.extend(true, {}, that._searchElesOption[name], option);
            that._searchElesOption[name] = item;
            if (item.label != undefined) {
                var label = $.tmpl(
                    Grid.statics.labelTmpl, {
                        "label_": item.label
                    });
                itemDiv.find(".form-group").append(
                    label);
            }
            var ele = {};
            if (item.type == "text") {
                ele = $
                    .tmpl(
                        Grid.statics.textTmpl,
                        {
                            "name_": (item.name == undefined ? ""
                                : item.name),
                            "id_": (item.id == undefined ? ""
                                : item.id),
                            "placeholder_": (item.placeholder == undefined ? ""
                                : item.placeholder),
                            "value_": (item.value == undefined ? ""
                                : item.value)
                        });
                itemDiv.find(".form-group").append(ele);
            } else if (item.type == "select") {
                ele = $
                    .tmpl(
                        Grid.statics.selectTmpl,
                        {
                            "name_": (item.name == undefined ? ""
                                : item.name),
                            "id_": (item.id == undefined ? ""
                                : item.id)
                        });
                if (item.items != undefined && item.items.length > 0) {
                    $.each(
                        item.items,
                        function (index, option) {
                            $
                                .tmpl(
                                    Grid.statics.optionTmpl,
                                    {
                                        "value_": (option.value == undefined ? ""
                                            : option.value),
                                        "text_": (option.text == undefined ? ""
                                            : option.text)
                                    })
                                .appendTo(
                                    ele);
                        }
                    );
                }
                itemDiv.find(".form-group").append(ele);
                if (item.itemsUrl != undefined) {
                    $.ajax({
                            type: (item.method == undefined ? "GET" : item.method),
                            dataType: "json",
                            async: false,
                            url: item.itemsUrl,
                            success: function (data) {
                                $.each(
                                    data,
                                    function (index,
                                              option) {
                                        $
                                            .tmpl(
                                                Grid.statics.optionTmpl,
                                                {
                                                    "value_": (option.value == undefined ? ""
                                                        : option.value),
                                                    "text_": (option.text == undefined ? ""
                                                        : option.text)
                                                })
                                            .appendTo(
                                                ele);
                                    }
                                );
                                that._uniform();
                            },
                            error: function (err) {
                                console
                                    .error("请求错误");
                            }
                        }
                    );
                }
            } else if (item.type == "radioGroup") {
                ele = $
                    .tmpl(
                        Grid.statics.radioGroupTmpl,
                        {
                            "name_": (item.name == undefined ? ""
                                : item.name),
                            "id_": (item.id == undefined ? ""
                                : item.id)
                        });
                $
                    .each(
                        item.items,
                        function (index, option) {
                            $
                                .tmpl(
                                    Grid.statics.inlineRadioTmpl,
                                    {
                                        "name_": (item.name == undefined ? ""
                                            : item.name),
                                        "id_": (item.id == undefined ? ""
                                            : item.id),
                                        "value_": (option.value == undefined ? ""
                                            : option.value),
                                        "text_": (option.text == undefined ? ""
                                            : option.text)
                                    })
                                .appendTo(
                                    ele);
                        });
                itemDiv.find(".form-group").append(ele);
                if (item.itemsUrl != undefined) {
                    $
                        .ajax({
                            type: "POST",
                            dataType: "json",
                            async: false,
                            url: item.itemsUrl,
                            success: function (data) {
                                $
                                    .each(
                                        data,
                                        function (index,
                                                  option) {
                                            $
                                                .tmpl(
                                                    Grid.statics.inlineRadioTmpl,
                                                    {
                                                        "value_": (option.value == undefined ? ""
                                                            : option.value),
                                                        "text_": (option.text == undefined ? ""
                                                            : option.text)
                                                    })
                                                .appendTo(
                                                    ele);
                                        });
                                that._uniform();
                            },
                            error: function (err) {
                                console
                                    .error("请求错误");
                            }
                        });
                }
            } else if (item.type == "checkboxGroup") {
                ele = $
                    .tmpl(
                        Grid.statics.checkboxGroupTmpl,
                        {
                            "name_": (item.name == undefined ? ""
                                : item.name),
                            "id_": (item.id == undefined ? ""
                                : item.id)
                        });
                $
                    .each(
                        item.items,
                        function (index, option) {
                            $
                                .tmpl(
                                    Grid.statics.inlineCheckboxTmpl,
                                    {
                                        "name_": (item.name == undefined ? ""
                                            : item.name),
                                        "id_": (item.id == undefined ? ""
                                            : item.id),
                                        "value_": (option.value == undefined ? ""
                                            : option.value),
                                        "text_": (option.text == undefined ? ""
                                            : option.text)
                                    })
                                .appendTo(
                                    ele);
                        });
                itemDiv.find(".form-group").append(ele);
                if (item.itemsUrl != undefined) {
                    $
                        .ajax({
                            type: "POST",
                            dataType: "json",
                            async: false,
                            url: item.itemsUrl,
                            success: function (data) {
                                $
                                    .each(
                                        data,
                                        function (index,
                                                  option) {
                                            $
                                                .tmpl(
                                                    Grid.statics.inlineCheckboxTmpl,
                                                    {
                                                        "value_": (option.value == undefined ? ""
                                                            : option.value),
                                                        "text_": (option.text == undefined ? ""
                                                            : option.text)
                                                    })
                                                .appendTo(
                                                    ele);
                                        });
                                that._uniform();
                            },
                            error: function (err) {
                                console
                                    .error("请求错误");
                            }
                        });
                }
            } else if (item.type == "datepicker") {
                var dateTmpl = '<div class="input-group">'
                    + '<input type="text" role="date-input" id="${id_}" name=${name_} value="${value_}" class="form-control">'
                    + '<span role="icon" class="input-group-addon">'
                    + '<i class="glyphicon glyphicon-calendar fa fa-calendar"></i>' + '</span></div>';
                if (typeof(moment) == "undefined") {
                    return $.tmpl(dateTmpl, {
                        "id_": (item.id == undefined ? item.name : item.id),
                        "name_": item.name,
                        "cls_": item.cls == undefined ? "" : item.cls,
                        "value_": ""
                    });
                }
                ele = $.tmpl(dateTmpl, {
                    "id_": (item.id == undefined ? item.name : item.id),
                    "name_": item.name,
                    "cls_": item.cls == undefined ? "" : item.cls,
                    "value_": (item.value == undefined ? moment().format('YYYY-MM-DD HH:mm:ss') : item.value)
                });
                itemDiv.find(".form-group").append(ele);
                var config = (item.config == undefined ? {} : item.config);
                var option = $.extend(true, Grid.dateDefaults, config);
                if (item.callback != undefined) {
                    ele.find('[role="date-input"]').daterangepicker(option, item.callback);
                } else {
                    ele.find('[role="date-input"]').daterangepicker(option);
                }
                ele.find('span').on("click", function () {
                    $(this).prev().click();
                });
            } else if (item.type == "html") {
                ele = item.eleHandler();
                itemDiv.find(".form-group").append(ele);
            }
            ele.off("change");
            ele.on("change", function () {
                var name = $(this).attr("name");
                var text = $(this).find("option:selected").text();
                var value = $(this).val();
                if (that._searchElesOption[name].change !== undefined) {
                    that._searchElesOption[name].change(text, value, that);
                }
                if (that._options.changeLoad) {
                    that.$searchbtn.trigger("click");
                }
            });

        },
        _renderGridWrapper: function () {
            var that = this;
            var contentTypeDiv = $('<div class="row">' +
                '<div class="col-lg-4" id="total_count">' +
                '</div>' +
                '<div class="col-lg-8">' +
                '<div id="tab" class="btn-group pull-right">' +
                '<a role="html" class="btn btn-large btn-info" title="HTML" ><i class="fa fa-html5"></i></a>' +
                '<a role="table" class="btn btn-large btn-info" title="表格" ><i class="fa fa-table"></i></a>' +
                '<a role="card" class="btn btn-large btn-info" title="卡片"><i class="fa fa-th"></i></a>' +
                '<a role="list" class="btn btn-large btn-info" title="列表"><i class="fa fa-list"></i></a>' +
                '<a role="timeline" class="btn btn-large btn-info" title="时序"><i class="fa fa-clock-o"></i></a>' +
                '<a role="chart-bar" class="btn btn-large btn-info" title="柱状图"><i class="fa fa-bar-chart-o"></i></a>' +
                '<a role="chart-line" class="btn btn-large btn-info" title="折线图"><i class="fa fa-line-chart"></i></a>' +
                '<a role="chart-pie" class="btn btn-large btn-info" title="饼图"><i class="fa fa-pie-chart"></i></a>' +
                '<a role="chart-funnel" class="btn btn-large btn-info" title="漏斗"><i class="fa fa-filter"></i></a>' +
                '<a role="chart-map" class="btn btn-large btn-info" title="地图"><i class="fa fa-globe"></i></a>' +
                '</div>' +
                '</div></div>');
            this.$element.append(contentTypeDiv);
            this.$contentTypeDiv = contentTypeDiv;
            if (this._options.contentTypeItems != undefined) {
                that.$contentTypeDiv.find("a").each(function (i) {
                    if (that._options.contentTypeItems.indexOf($(this).attr("role")) == -1) {
                        $(this).hide();
                    }
                });
            }
            if (!this._showContentType) {
                that.$contentTypeDiv.find("#tab").hide();
            }
            var gridWrapper = $.tmpl(Grid.statics.gridWrapperTmpl, {
                "id_": that._elementId
            });
            this.$element.append(gridWrapper);
            this.$gridWrapper = gridWrapper;
            this.$contentTypeDiv.find("a[role=" + this._contentType + "]").addClass("active");
            this.$contentTypeDiv.find("a[role!=" + this._contentType + "]").removeClass("active");
            if (/chart-([a-z]+)/.test(this._contentType)) {
                that._renderChart(that._contentType.match('chart-([a-z]+)')[1]);
            } else {
                switch (this._contentType) {
                    case "table":
                        this._renderTable();
                        break;
                    case "card":
                        gridWrapper.removeClass("table-responsive");
                        this._renderCard();
                        break;
                    case "list":
                        gridWrapper.removeClass("table-responsive");
                        this._renderList();
                        break;
                    case "html":
                        this._renderHtml();
                        break;
                    case "timeline":
                        this._renderTimeline();
                        break;
                    default:
                        this._renderCard();
                }
            }
            if (this._showPaging) {
                this._renderPaging();
            }
            this.$contentTypeDiv.find("a").off("click");
            this.$contentTypeDiv.find("a").on("click", function () {
                var role = $(this).attr("role");
                that._reload({
                    contentType: role
                });
            });
        },
        _renderChart: function (chartType) {
            chartType = chartType == undefined ? 'bar' : chartType;
            var that = this;
            var chartRow = $.tmpl(Grid.statics.chartRowTmpl, {});
            var div = $('<div class="col-xs-12" id="' + that._elementId + '_chartDiv" style="height:400px;"></div>');
            chartRow.find("div[role=content]").append(div);
            this.$gridWrapper.append(chartRow);
            var fullData = {};
            var titleMap = {};
            if (that._grids != undefined && that._grids != null) {
                if (that._grids.length > 0) {
                    $.each(that._grids, function (i, grid) {
                        var num = (that._pageNum - 1) * that._pageSize + i + 1;
                        $.each(that._columns, function (j, column) {
                            var field = column.field;
                            var data = grid[field];
                            var title = column.title;
                            if (column.chartFormat != undefined) {
                                data = column.chartFormat(num, grid);
                            } else {
                                if (column.format != undefined) {
                                    data = column.format(num, grid);
                                }
                            }
                            if (column.chartX) {
                                if (fullData['x'] == undefined) {
                                    fullData['x'] = {};
                                }
                                fullData['x'][num] = data;
                            }
                            if (column.chartY) {
                                if (fullData['y'] == undefined) {
                                    fullData['y'] = {};
                                }
                                if (fullData['y'][field] == undefined) {
                                    fullData['y'][field] = {};
                                }
                                if (fullData['y'][field][num] == undefined) {
                                    fullData['y'][field][num] = [];
                                }
                                fullData['y'][field][num].push(data);
                                if (titleMap[field] == undefined) {
                                    titleMap[field] = title;
                                }
                            }
                            if (column.chartY2) {
                                if (fullData['y2'] == undefined) {
                                    fullData['y2'] = {};
                                }
                                if (fullData['y2'][field] == undefined) {
                                    fullData['y2'][field] = {};
                                }
                                if (fullData['y2'][field][num] == undefined) {
                                    fullData['y2'][field][num] = [];
                                }
                                fullData['y2'][field][num].push(data);
                                if (titleMap[field] == undefined) {
                                    titleMap[field] = title;
                                }
                            }
                        });
                    });
                    var chartOption = {};
                    var xData = {};
                    var yData = [];
                    switch (chartType) {
                        case 'pie':
                            if (that._options.chartPieType == 0) {
                                xData['data'] = [];
                                xData['legend'] = [];
                                $.each(fullData['x'], function (f, d) {
                                    xData['data'].push(d);
                                });
                                $.each(fullData['y'], function (f, d) {
                                    xData['legend'].push(titleMap[f]);
                                    var dArr = [];
                                    $.each(fullData['y'][f], function (sk, sv) {
                                        var name = fullData['x'][sk];
                                        dArr.push({
                                            'name': name,
                                            'value': sv[0]
                                        })
                                    });
                                    var s = {
                                        name: titleMap[f],
                                        type: chartType,
                                        data: dArr
                                    };
                                    yData.push(s);
                                });
                                chartOption = getPieChartOption(xData, yData);
                            } else {
                                xData['data'] = [];
                                xData['legend'] = [];
                                $.each(fullData['x'], function (n, d) {
                                    xData['data'].push(d);
                                    xData['legend'].push(d);
                                    var dArr = [];
                                    $.each(fullData['y'], function (f, d) {
                                        $.each(fullData['y'][f], function (sk, sv) {
                                            if (n === sk) {
                                                var name = titleMap[f];
                                                dArr.push({
                                                    'name': name,
                                                    'value': sv[0]
                                                })
                                            }
                                        });
                                    });
                                    var s = {
                                        name: d,
                                        type: chartType,
                                        data: dArr
                                    };
                                    yData.push(s);
                                });
                                chartOption = getPieChartOption(xData, yData);
                            }
                            break;
                        case 'funnel':
                            xData['data'] = [];
                            xData['legend'] = [];
                            $.each(fullData['x'], function (f, d) {
                                xData['data'].push(d);
                            });
                            var i = 0;
                            $.each(fullData['y'], function (f, d) {
                                xData['legend'].push(titleMap[f]);
                                var dArr = [];
                                $.each(fullData['y'][f], function (sk, sv) {
                                    var name = fullData['x'][sk];
                                    dArr.push({
                                        'name': name,
                                        'value': sv[0]
                                    })
                                });
                                var s = {
                                    type: chartType,
                                    name: titleMap[f],
                                    min: 0,
                                    left: '5%',
                                    width: '80%',
                                    minSize: '0%',
                                    maxSize: '100%',
                                    sort: 'descending',
                                    data: dArr
                                };
                                yData.push(s);
                                i++;
                            });
                            chartOption = getFunnelChartOption(xData, yData);
                            break;
                        case 'map':
                            xData['data'] = [];
                            xData['legend'] = [];
                            $.each(fullData['x'], function (f, d) {
                                xData['data'].push(d);
                            });
                            $.each(fullData['y'], function (f, d) {
                                xData['legend'].push(titleMap[f]);
                                var dArr = [];
                                $.each(fullData['y'][f], function (sk, sv) {
                                    var name = fullData['x'][sk];
                                    dArr.push({
                                        'name': name,
                                        'value': sv[0]
                                    })
                                });
                                var s = {
                                    name: titleMap[f],
                                    type: chartType,
                                    mapType: 'china',
                                    label: {
                                        normal: {
                                            show: true
                                        },
                                        emphasis: {
                                            show: true
                                        }
                                    },
                                    data: dArr
                                };
                                yData.push(s);
                            });
                            var max = 0;
                            $.each(yData[0].data, function (i, d) {
                                if (d.value >= max) max = d.value;
                            });
                            xData['min'] = 0;
                            xData['max'] = max;
                            chartOption = getMapChartOption(xData, yData);
                            break;
                        default:
                            xData['data'] = [];
                            xData['axis'] = [];
                            xData['legend'] = [];
                            fullData['x'] !== undefined && $.each(fullData['x'], function (f, d) {
                                xData['data'].push(d);
                            });
                            fullData['y'] !== undefined && $.each(fullData['y'], function (f, d) {
                                xData['legend'].push(titleMap[f]);
                                var axis = {
                                    type: 'value'
                                };
                                xData['axis'].push(axis);
                                var dArr = [];
                                $.each(fullData['y'][f], function (sk, sv) {
                                    dArr.push(sv[0])
                                });
                                var s = {
                                    name: titleMap[f],
                                    type: chartType,
                                    data: dArr
                                };
                                if (that._options.areaStyle === true) {
                                    s.areaStyle = {normal: {}};
                                }
                                if (that._options.stack === true) {
                                    s.stack = '总量';
                                }
                                yData.push(s);
                            });
                            var y2Length = 0;
                            fullData['y2'] !== undefined && $.each(fullData['y2'], function (f, d) {
                                xData['legend'].push(titleMap[f]);
                                var dArr = [];
                                $.each(fullData['y2'][f], function (sk, sv) {
                                    dArr.push(sv[0])
                                });
                                var s = {
                                    name: titleMap[f],
                                    type: (that._options.chartY2Type == undefined ? 'line' : that._options.chartY2Type),
                                    yAxisIndex: 1,
                                    data: dArr
                                };
                                yData.push(s);
                                y2Length++;
                            });
                            if (y2Length > 0) {
                                var axis = {
                                    type: 'value'
                                };
                                xData['axis'].push(axis);
                            }
                            if (chartType === 'line' && that._options.chartLineMode === 'single') {
                                xData['selectedMode'] = 'single';
                            }
                            chartOption = getBarOrLineChartOption(xData, yData);
                    }
                    if (xData['data'].length == 0)
                        return;
                    if (this._showLegend === false) {
                        chartOption.legend = {};
                    }
                    setTimeout($.proxy(function () {
                        var t = this;
                        var chart = echarts.init(document.getElementById(t._elementId + '_chartDiv'));
                        chart.setOption(chartOption);
                        chart.on('click', function (params) {
                            if (t._chartClick != undefined)
                                t._chartClick(params, t);
                        });
                        if (chartOption.visualMap != undefined) {
                            chart.on('legendselectchanged', function (params) {
                                console.log(params);
                                var i = xData['legend'].indexOf(params.name);
                                var max = 0;
                                $.each(yData[i].data, function (i, d) {
                                    if (d.value >= max) max = d.value;
                                });
                                chartOption.visualMap.min = 0;
                                chartOption.visualMap.max = max;
                                chart.setOption(chartOption);
                            });
                        }
                    }, that), 500);

                }
            }
        },
        _renderHtml: function () {
            var tableRow = $.tmpl(Grid.statics.tableRowTmpl, {});
            if (this._html == undefined) {
                tableRow.append('<dl><dd><p style="text-align: center;">还没有数据~请点击搜索！</p></dd></dl>');
            } else {
                tableRow.append(this._html);
            }
            this.$gridWrapper.append(tableRow);
        },
        _renderList: function () {
            var that = this;
            var head_array = [];
            var head_index = [];
            var format_array = [];
            $.each(that._columns, function (index, column) {
                head_array.push(column.field);
                head_index.push(index);
                format_array.push(column.format);
            });
            var listRow = $.tmpl(Grid.statics.listRowTmpl, {});
            if (that._grids != undefined && that._grids != null) {
                if (that._grids.length == 0) {
                    listRow.find("div[role=content]").append('<dl><dd><p style="text-align: center;">暂无数据!</p></dd></dl>');
                }
            }
            $.each(that._grids, function (i, grid) {
                var num = (that._pageNum - 1) * that._pageSize + i + 1;
                var ele =
                    $('<div class="media search-media">' +
                        '<div class="media-left">' +
                        '<a href="javacript:void(0);">' +
                        '<img role="img" class="media-object" alt="72x72" style="width: 72px; height: 72px;" src="../../cdn/img/128.png">' +
                        '</a>' +
                        '</div>' +
                        '<div class="media-body">' +
                        '<div>' +
                        '<h4 class="media-heading">' +
                        '<span role="hd"></span><span role="cb"></span>' +
                        '</h4>' +
                        '</div>' +
                        '<p role="data"></p>' +
                        '<div class="search-actions text-center" role="btn-g">' +
                        '</div>' +
                        '</div>' +
                        '</div>');
                if (that._showCheck) {
                    var checkbox = $('<input type="checkbox" class="checkboxes" style="height: 18px;" value="'
                        + grid[that._idField] + '"/>');
                    ele.find("span[role=cb]").append(checkbox);
                }
                $.each(that._columns, function (j, column) {
                    var title = column.title;
                    var field = column.field;
                    var html = grid[field];
                    if (column.format != undefined) {
                        html = column.format(num, grid);
                    }
                    if (that._headField == undefined) {
                        ele.find("a[role=hd]").text(title + ':' + grid[that._idField]);
                    }
                    if (that._imgField != undefined && that._imgField != null && grid[that._imgField] != undefined) {
                        ele.find("img[role=img]").attr("src", grid[that._imgField]);
                    }
                    if (column.field == that._headField) {
                        ele.find("a[role=hd]").text(title + ':' + html);
                    }
                    if (column.field != that._imgField && column.field != that._headField) {
                        var div = $('<div class="row"><div class="col-lg-4"><strong>' + title + '</strong></div><div class="col-lg-8"><p style="font-size: 12px" class="lead">' + html + '</p></div></div>');
                        ele.find("p[role=data]").append(div);
                    }
                });
                if (that._actionColumns != undefined) {
                    var current_data = grid;
                    $.each(that._actionColumns, function (k, colum) {
                        var visible = true;
                        if (colum.visible != undefined) {
                            visible = colum.visible(num, current_data);
                        }
                        if (visible == false) {
                            return;
                        }
                        var text = colum.text;
                        if (colum.textHandle != undefined) {
                            text = colum.textHandle(num, current_data);
                        }
                        if (colum.clsHandle != undefined) {
                            colum.cls = colum.clsHandle(num, current_data);
                        }
                        var button = $('<button type="button" class="btn ' + colum.cls + '">' + text + '</button>');
                        if (colum.handle != undefined) {
                            button.click(function (e) {
                                colum.handle(num, current_data, that);
                                e.stopPropagation();
                            });
                        }
                        ele.find("div[role=btn-g]").append(button);
                    });
                }
                listRow.find("div[role=content]").append(ele);
            });

            this.$gridWrapper.append(listRow);
        },
        _renderCard: function () {
            var that = this;
            var head_array = [];
            var head_index = [];
            var format_array = [];
            $.each(that._columns, function (index, column) {
                head_array.push(column.field);
                head_index.push(index);
                format_array.push(column.format);
            });
            var cardRow = $.tmpl(Grid.statics.cardRowTmpl, {});
            if (that._grids != undefined && that._grids != null) {
                if (that._grids.length == 0) {
                    var emptyRow = $('<div class="row"></div>');
                    emptyRow.append('<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><div style="text-align: center;" class="thumbnail">暂无数据!</div></div>');
                    cardRow.find("div[role=content]").append(emptyRow);
                } else {
                    var row = {};
                    $.each(that._grids, function (i, grid) {
                        var num = (that._pageNum - 1) * that._pageSize + i + 1;
                        if ((i + 1) % 3 == 1) {
                            row = $('<div class="row"></div>');
                            cardRow.find("div[role=content]").append(row);
                        }
                        var ele = $('<div class="col-xs-12 col-sm-4 col-md-4 col-lg-4">' +
                            '<div class="thumbnail col-lg-12">' +
                            '<div class="caption">' +
                            '<div class="col-lg-12">' +
                            '<span class="puu-left">' + num + '</span>' +
                            '<span class="pull-right" role="cb"></span>' +
                            '</div>' +
                            '<div class="col-lg-12">' +
                            '<h4 role="hd"></h4>' +
                            '</div>' +
                            '<div role="data" class="col-lg-12">' +
                            '</div>' +
                            '<div role="btn-g">' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '</div>');
                        if (that._showCheck) {
                            var checkbox = $('<input type="checkbox" class="checkboxes" style="height: 18px;" value="'
                                + grid[that._idField] + '"/>');
                            ele.find("span[role=cb]").append(checkbox);
                        }
                        $.each(that._columns, function (j, column) {
                            var title = column.title;
                            var field = column.field;
                            var html = grid[field];
                            if (column.format != undefined) {
                                html = column.format(num, grid);
                            }
                            if (that._headField == undefined) {
                                ele.find("h4[role=hd]").text(grid[that._idField]);
                            }
                            if (column.field == that._headField) {
                                ele.find("h4[role=hd]").text(html);
                            }
                            var p = $('<div class="row"><div class="col-lg-4"><strong>' + title + '</strong></div><div class="col-lg-8"><p style="font-size: 12px;word-break: break-all;word-wrap: break-word;" class="lead">' + html + '</p></div></div>');
                            ele.find("div[role=data]").append(p);
                            if (column.dataClick != undefined) {
                                p.find('p').css("text-decoration", "underline");
                                p.find('p').css("cursor", "pointer");
                                p.find('p').css("color", "red");
                                p.find('p').on("click", function () {
                                    column.dataClick(num, grid);
                                })
                            }
                        });
                        if (that._actionColumns != undefined) {
                            var _index = i;
                            var current_data = grid;
                            $.each(that._actionColumns, function (k, colum) {
                                var visible = true;
                                if (colum.visible != undefined) {
                                    visible = colum.visible(_index, current_data);
                                }
                                if (visible == false) {
                                    return;
                                }
                                var text = colum.text;
                                if (colum.textHandle != undefined) {
                                    text = colum.textHandle(num, current_data);
                                }
                                if (colum.clsHandle != undefined) {
                                    colum.cls = colum.clsHandle(num, current_data);
                                }
                                var button = $('<button type="button" class="btn btn-update btn-add-card ' + colum.cls + '">' + text + '</button>');
                                if (colum.handle != undefined) {
                                    button.click(function (e) {
                                        colum.handle(num, current_data, that);
                                        e.stopPropagation();
                                    });
                                }
                                ele.find("div[role=btn-g]").append(button);
                            });
                        }
                        row.append(ele);
                    });
                }
            }
            this.$gridWrapper.append(cardRow);
        },
        _renderTimeline: function () {
            var that = this;
            var head_array = [];
            var head_index = [];
            var format_array = [];
            $.each(that._columns, function (index, column) {
                head_array.push(column.field);
                head_index.push(index);
                format_array.push(column.format);
            });
            var cardRow = $.tmpl(Grid.statics.cardRowTmpl, {});
            if (that._grids != undefined && that._grids != null) {
                if (that._grids.length == 0) {
                    var emptyRow = $('<div class="row"></div>');
                    emptyRow.append('<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><div style="text-align: center;" class="thumbnail">暂无数据!</div></div>');
                    cardRow.find("div[role=content]").append(emptyRow);
                } else {
                    var colDiv = $('<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></div>');
                    cardRow.append(colDiv);
                    var ul = $('<ul class="timeline"></ul>');
                    cardRow.append(ul);
                    $.each(that._grids, function (i, grid) {
                        var num = (that._pageNum - 1) * that._pageSize + i + 1;
                        var ele = $('<li>' +
                            '<div class="timeline-badge">' +
                            //'<i class="fa fa-check"></i>' +
                            '</div>' +
                            '<div class="timeline-panel">' +
                            '    <div class="timeline-heading">' +
                            '        <h4 class="timeline-title" role="hd"></h4>' +
                            '    </div>' +
                            '    <div class="timeline-body" role="data">' +
                            '    </div>' +
                            '</div>' +
                            '</li>');
                        if (num % 2 == 0) {
                            ele.addClass("timeline-inverted")
                        }
                        $.each(that._columns, function (j, column) {
                            var title = column.title;
                            var field = column.field;
                            var html = grid[field];
                            if (column.format != undefined) {
                                html = column.format(num, grid);
                            }
                            if (that._headField == undefined) {
                                ele.find("h4[role=hd]").text(grid[that._idField]);
                            }

                            if (that._options.timeField != undefined && column.field == that._options.timeField) {
                                var time = $('<p><small class="text-muted" role="time"><i class="fa fa-clock-o"></i> </small></p>')
                                time.find("small[role=time]").append(grid[that._options.timeField]);
                                ele.find(".timeline-heading").append(time);
                            }

                            if (column.field == that._headField) {
                                ele.find("h4[role=hd]").text(html);
                            }

                            if (column.check === true) {
                                if (column.checkFormat != undefined) {
                                    if (column.checkFormat(num, grid)) {
                                        ele.find('.timeline-badge').append('<i class="fa fa-check"></i>');
                                    }
                                }
                            }

                            var p = $('<div class="row"><div class="col-lg-4"><strong>' + title + '</strong></div><div class="col-lg-8"><p style="font-size: 12px;word-break: break-all;word-wrap: break-word;" class="lead">' + html + '</p></div></div>');
                            ele.find("div[role=data]").append(p);
                            if (column.dataClick != undefined) {
                                p.find('p').css("text-decoration", "underline");
                                p.find('p').css("cursor", "pointer");
                                p.find('p').css("color", "red");
                                p.find('p').on("click", function () {
                                    column.dataClick(num, grid);
                                })
                            }
                        });
                        if (that._actionColumns != undefined) {
                            ele.find('.timeline-panel').append('<div class="timeline-footer" role="btn-g"></div>');
                            var _index = i;
                            var current_data = grid;
                            $.each(that._actionColumns, function (k, colum) {
                                var visible = true;
                                if (colum.visible != undefined) {
                                    visible = colum.visible(_index, current_data);
                                }
                                if (visible == false) {
                                    return;
                                }
                                var text = colum.text;
                                if (colum.textHandle != undefined) {
                                    text = colum.textHandle(num, current_data);
                                }
                                if (colum.clsHandle != undefined) {
                                    colum.cls = colum.clsHandle(num, current_data);
                                }
                                var button = $('<button type="button" class="btn btn-update btn-add-card ' + colum.cls + '">' + text + '</button>');
                                if (colum.handle != undefined) {
                                    button.click(function (e) {
                                        colum.handle(num, current_data, that);
                                        e.stopPropagation();
                                    });
                                }
                                ele.find("div[role=btn-g]").append(button);
                            });
                        }
                        ul.append(ele);
                    });
                }
            }
            this.$gridWrapper.append(cardRow);
        },
        _renderTable: function () {
            var that = this;
            var head_array = [];
            var head_index = [];
            var format_array = [];
            $.each(that._columns, function (index, column) {
                head_array.push(column.field);
                head_index.push(index);
                format_array.push(column.format);
            });

            var colTmpl = '<col width="${width_}"></col>';
            var trTmpl = '<tr role="row" class="${class_}"></tr>';
            var thTmpl = '<th class="${class_} ${sorting_}" rowspan="1" colspan="1" style="white-space: nowrap;${style_}"></th>';
            var tdTmpl = '<td class="${class_}" style="vertical-align: middle;white-space: nowrap;${style_}"></td>';

            var table = $.tmpl(Grid.statics.tableTmpl, {
                "id_": that._elementId
            });
            // colgrop
            var cols = function (width) {
                return $.tmpl(colTmpl, {
                    "width_": width
                });
            };
            var renderColgroup = function (colgroup) {
                if (that._showCheck == true) {
                    colgroup.append(cols(that._checkboxWidth));
                }
                if (that._showIndexNum == true) {
                    colgroup.append(cols(that._indexNumWidth));
                }
                $.each(that._columns, function (index, column) {
                    colgroup.append(cols(column.width == undefined ? ""
                        : column.width));
                });
                if (that._actionColumns != undefined) {
                    colgroup.append(cols(that._actionColumnWidth));
                }
            };
            var colgroup = $('<colgroup></colgroup>');
            renderColgroup(colgroup);
            table.append(colgroup);

            // thead
            var renderThead = function (thead) {
                var sortField, sortMode;
                if (that._sort != undefined) {
                    if (that._sort.indexOf("_desc") != -1) {
                        sortField = that._sort.replace("_desc", "");
                        sortMode = "desc";
                    } else if (that._sort.indexOf("_asc") != -1) {
                        sortField = that._sort.replace("_asc", "");
                        sortMode = "asc";
                    }
                }
                var tr = $.tmpl(trTmpl, {});
                if (that._showCheck) {
                    var checkboxTh = $.tmpl(thTmpl, {
                        "class_": "table-checkbox",
                        "sorting_": "sorting_disabled"
                    });
                    var checkbox = $('<input type="checkbox" class="group-checkable" data-set="#'
                        + that._elementId + ' .checkboxes"/>');
                    checkboxTh.append(checkbox);
                    tr.append(checkboxTh);
                }
                if (that._showIndexNum) {
                    var indexTh = $.tmpl(thTmpl, {
                        "sorting_": "sorting_disabled"
                    });
                    indexTh.html(that._indexNumText);
                    tr.append(indexTh);
                }
                $.each(that._columns, function (index, column) {
                    var style = "";
                    var sort = "sorting_disabled";
                    if (column.align != undefined) {
                        style += "text-align:" + column.align + ";";
                    }
                    if (column.sort != undefined && column.sort) {
                        sort = "sorting";
                        if (sortField == column.field) {
                            sort = "sorting_" + sortMode;
                        }
                    }
                    var th = $.tmpl(thTmpl, {
                        "style_": style,
                        "sorting_": sort
                    });
                    th.text(column.title == undefined ? "未定义" : column.title);
                    th.data("field", column.field);
                    tr.append(th);
                });
                var actionStyle = "";
                if (that._actionColumns != undefined) {
                    if (that._actionColumnAlign != undefined) {
                        actionStyle += "text-align:" + that._actionColumnAlign
                            + ";";
                    }
                    var actionTh = $.tmpl(thTmpl, {
                        "style_": actionStyle
                    });
                    actionTh.text(that._actionColumnText);
                    tr.append(actionTh);
                }
                thead.append(tr);
            };
            var thead = $('<thead></thead>');
            renderThead(thead);
            table.append(thead);

            // tbody
            var renderTbody = function (tbody, grid, index) {
                var num = (that._pageNum - 1) * that._pageSize + index + 1;
                var tr = $.tmpl(trTmpl, {
                    "class_": "odd gradeX"
                });
                if (that._showCheck == true) {
                    var checkboxTd = $.tmpl(tdTmpl, {});
                    var checkbox = $('<input type="checkbox" class="checkboxes" value="'
                        + grid[that._idField] + '"/>');
                    checkboxTd.append(checkbox);
                    tr.append(checkboxTd);
                }
                if (that._showIndexNum == true) {
                    var indexTd = $.tmpl(tdTmpl, {});
                    indexTd.html(num);
                    tr.append(indexTd);
                }
                $.each(that._columns, function (index, column) {
                    var style = "";
                    if (column.align != undefined) {
                        style += "text-align:" + column.align + ";";
                    }
                    var td = $.tmpl(tdTmpl, {
                        "style_": style
                    });
                    var html = grid[column.field];
                    if (html instanceof Array) {
                        html = html.join(",");
                    }
                    if (column.format != undefined) {
                        html = column.format(num, grid);
                    } else {
                        td.attr("title", html);
                    }
                    if (column.thousand == true) {
                        html = toThousands(html);
                    }
                    td.html(html);
                    tr.append(td);
                    if (column.dataClick != undefined) {
                        td.css("text-decoration", "underline");
                        td.css("cursor", "pointer");
                        td.css("color", "red");
                        td.on("click", function () {
                            column.dataClick(num, grid);
                        })
                    }
                });
                if (that._actionColumns != undefined) {
                    var cltd = $.tmpl(tdTmpl, {});
                    var current_data = grid;
                    $.each(that._actionColumns, function (index, colum) {
                        var visible = true;
                        if (colum.visible != undefined) {
                            visible = colum.visible(num, current_data);
                        }
                        if (visible == false) {
                            return;
                        }
                        var text = colum.text;
                        if (colum.textHandle != undefined) {
                            text = colum.textHandle(num, current_data);
                        }
                        if (colum.clsHandle != undefined) {
                            colum.cls = colum.clsHandle(num, current_data);
                        }
                        var button = $.tmpl(Grid.statics.buttonTmpl, {
                            "class_": "btn " + colum.cls,
                            "text_": text,
                            "type_": "button",
                            "title_": (colum.title == undefined ? text
                                : colum.title)
                        });
                        if (colum.handle != undefined) {
                            button.click(function (e) {
                                colum.handle(num, current_data, that);
                                e.stopPropagation();
                            });
                        }
                        cltd.append(button);
                    });
                }
                tr.append(cltd);
                tbody.append(tr);
                tr.data("data", grid);
            };
            var renderEmptyTbody = function (tbody) {
                var tr = $.tmpl(trTmpl, {
                    "class_": "odd gradeX"
                });
                var cols = that._columns.length + (that._showCheck == true ? 1 : 0) + (that._showIndexNum ? 1 : 0) + (that._actionColumns ? that._actionColumns.length : 0);
                var td = $.tmpl(tdTmpl, {});
                td.css("text-align", "center");
                td.attr("colspan", cols);
                td.html("没有数据！");
                tr.append(td);
                tbody.append(tr);
            };
            var renderLoadingTbody = function (tbody) {
                var tr = $.tmpl(trTmpl, {
                    "class_": "odd gradeX"
                });
                var cols = that._columns.length + (that._showCheck == true ? 1 : 0) + (that._showIndexNum ? 1 : 0) + (that._actionColumns ? that._actionColumns.length : 0);
                var td = $.tmpl(tdTmpl, {});
                td.css("text-align", "center");
                td.attr("colspan", cols);
                td.html("还没有数据~请点击搜索！");
                tr.append(td);
                tbody.append(tr);
            };
            var tbody = $('<tbody></tbody>');
            if (that._grids != undefined && that._grids != null) {
                if (that._grids.length == 0)
                    renderEmptyTbody(tbody);
                $.each(that._grids, function (index, grid) {
                    renderTbody(tbody, grid, index);
                });
            } else {
                renderLoadingTbody(tbody);
            }
            table.append(tbody);
            this.$gridWrapper.append(table);
        },
        // 渲染分页
        _renderPaging: function () {
            var that = this;
            var pagingRow = $.tmpl(Grid.statics.pagingRowTmpl, {});
            // select

            var select = $('<div class="dataTables_length"><select style="height:35px;" id="'
                + this._elementId
                + '_length" class="form-control input-sm input-inline"></select>' +
                '</div>');

            var options = this._pageSelect;
            if (options.indexOf(that._pageSize) == -1) {
                options.push(that._pageSize);
            }
            options.sort(function (a, b) {
                return a > b ? 1 : -1;
            });
            for (var i in options) {
                var option = $.tmpl(Grid.statics.optionTmpl, {
                    "value_": options[i],
                    "text_": options[i],
                    "selected": that._pageSize == options[i] ? "selected" : ""
                });
                select.find("select").append(option);
            }
            pagingRow.find("[role='select']").append(select);

            var info = $('<div class="dataTables_info" id="' + this._elementId
                + '_info" role="status" aria-live="polite"></div>');
            var text = "<label style='font-size: initial;'>当前第" + (this._getTotalPage() == 0 ? 0 : this._pageNum) + "页/共" + this._getTotalPage() + "页 共" + this._total + "条</label>";
            info.html(text);
            pagingRow.find("[role='info']").append(info);
            // page
            var liTmpl = '<li class="${class_}" aria-controls="${pageto_}" id="${id_}" tabindex="0"><a style="${style_}" href="javascript:;">${num_}</a></li>';
            var renderPageEle = function (ul, pageNum, totalP) {
                var firstLi = $.tmpl(liTmpl, {
                    "class_": pageNum == 1 ? "prev disabled" : "prev",
                    "pageto_": 1,
                    "num_": "首页"
                });
                ul.append(firstLi);
                if (totalP <= 5 && totalP > 0) {
                    for (var i = 1; i <= totalP; i++) {
                        var li = $.tmpl(liTmpl, {
                            "class_": pageNum == i ? "paginate_button active"
                                : "paginate_button",
                            "id_": "",
                            "pageto_": i,
                            "num_": i
                        });
                        ul.append(li);
                    }
                } else if (totalP > 5) {
                    if (pageNum <= 3) {
                        for (var i = 1; i <= 5; i++) {
                            var li = $
                                .tmpl(
                                    liTmpl,
                                    {
                                        "class_": pageNum == i ? "paginate_button active"
                                            : "paginate_button",
                                        "id_": "",
                                        "pageto_": i,
                                        "num_": i
                                    });
                            ul.append(li);
                        }
                    } else if (pageNum > 3 && pageNum < (totalP - 2)) {
                        for (var i = pageNum - 2; i <= pageNum + 2; i++) {
                            var li = $
                                .tmpl(
                                    liTmpl,
                                    {
                                        "class_": pageNum == i ? "paginate_button active"
                                            : "paginate_button",
                                        "id_": "",
                                        "pageto_": i,
                                        "num_": i
                                    });
                            ul.append(li);
                        }
                    } else {
                        for (var i = totalP - 4; i <= totalP; i++) {
                            var li = $
                                .tmpl(
                                    liTmpl,
                                    {
                                        "class_": pageNum == i ? "paginate_button active"
                                            : "paginate_button",
                                        "id_": "",
                                        "pageto_": i,
                                        "num_": i
                                    });
                            ul.append(li);
                        }
                    }
                }
                var lastLi = $.tmpl(liTmpl, {
                    "class_": ((pageNum == totalP) || (totalP == 0)) ? "next disabled" : "next",
                    "pageto_": totalP,
                    "num_": "尾页"
                });
                ul.append(lastLi);
            };
            var renderSimplePageEle = function (ul, pageNum, totalP) {
                var pervLi = $.tmpl(liTmpl, {
                    "class_": pageNum == 1 ? "prev disabled" : "prev",
                    "id_": "",
                    "pageto_": pageNum - 1,
                    "num_": '上一页'
                });
                ul.append(pervLi);
                var nextLi = $.tmpl(liTmpl, {
                    "class_": pageNum == totalP ? "next disabled" : "next",
                    "id_": "",
                    "pageto_": pageNum + 1,
                    "num_": '下一页'
                });
                ul.append(nextLi);
            };
            var page = $('<div class="dataTables_paginate" id="'
                + this._elementId + '_paginate"></div>');
            var ul = $('<ul class="pagination" style="visibility: visible;"></ul>');
            page.append(ul);
            var totalP = this._getTotalPage();
            if (!this._simplePaging) {
                renderPageEle(ul, this._pageNum, totalP);
            } else {
                renderSimplePageEle(ul, this._pageNum, totalP);
            }
            pagingRow.find("[role='page']").append(page);
            var goPage = $('<div class="dataTables_paginate input-group">'
                + '			<input type="text" id="goInput" class="form-control input-xs input-inline" style="width: 112px;" placeholder="输入跳转页...">'
                + '			<span class="input-group-btn">'
                + '			<button class="btn btn-primary" id="goBtn" type="button">跳转</button>'
                + '			</span>'
                + '		</div>');
            if (!this._simplePaging)
                pagingRow.find("[role='goPage']").append(goPage);
            this.$element.append(pagingRow);
            this.$pageDiv = pagingRow;
        },
        _getTotalPage: function () {
            var totalP = 0;
            var totalCount = this._total;
            var pagesize = this._pageSize;
            if (totalCount % pagesize != 0) {
                totalP = Math.floor(totalCount / pagesize) + 1;
            } else {
                totalP = Math.floor(totalCount / pagesize);
            }
            return totalP;
        },
        // 注册事件
        _registerEvents: function () {
            var that = this;
            // checkbox相关
            this.$gridWrapper.find('.group-checkable').change(
                function () {
                    var set = $(this).attr("data-set");
                    var checked = $(this).is(":checked");
                    $(set)
                        .each(
                            function () {
                                if (checked) {
                                    $(this).prop("checked", true);
                                    $(this).parent().parent()
                                        .addClass("active");
                                } else {
                                    $(this).prop("checked", false);
                                    $(this).parent().parent()
                                        .removeClass("active");
                                }
                            });
                });
            this.$gridWrapper.find(".checkboxes").change(
                function () {
                    var checked = $(this).is(":checked");
                    if (checked) {
                        $(this).parent().parent()
                            .addClass("active");
                    } else {
                        $(this).parent().parent()
                            .removeClass("active");
                    }
                });
            // 分页相关
            this.$element.find('ul.pagination li').not(".disabled").on(
                "click", function () {
                    var pN = $(this).attr("aria-controls");
                    if (parseFloat(pN)) {
                        that._reload({
                            pageNum: parseFloat(pN)
                        });
                    }
                });
            this.$element.find('.dataTables_length select').on("change",
                function () {
                    var pS = $(this).val();
                    if (parseFloat(pS)) {
                        that._reload({
                            pageNum: 1,
                            pageSize: parseFloat(pS)
                        });
                    }
                });
            // 跳转相关
            this.$element.find("#goInput").val(this._pageNum);
            this.$element.find("#goBtn").on(
                "click",
                function () {
                    var reg = /^[0-9]*[1-9][0-9]*$/;
                    if (reg.test($("#goInput").val())
                        && $("#goInput").val() <= that._getTotalPage()) {
                        that._reload({
                            pageNum: $("#goInput").val()
                        });
                    } else {
                        alert("错误的页码");
                    }
                });
            // 排序相关
            this.$gridWrapper.find('th.sorting').on("click", function () {
                var field = $(this).data("field");
                that._reload({
                    sort: field + "_desc"
                });
            });
            this.$gridWrapper.find('th.sorting_asc').on("click", function () {
                var field = $(this).data("field");
                that._reload({
                    sort: field + "_desc"
                });
            });
            this.$gridWrapper.find('th.sorting_desc').on("click", function () {
                var field = $(this).data("field");
                that._reload({
                    sort: field + "_asc"
                });
            });
            this._uniform();
            this._doSelect2();
        },
        // 执行回调
        _doAfterInit: function () {
            if (this._afterInit != undefined)
                this._afterInit(this);
        },
        _doSelect2: function () {
            var that = this;
            if (this._select2 && $().select2) {
                var selects = this.$element.find("select");
                if (selects.size() > 0) {
                    selects.each(function () {
                        $(this).select2();
                    });
                }
            }
        },
        _uniform: function () {
            this._doSelect2();
            if ($().uniform) {
                var checks = $("input[type=checkbox]:not(.toggle), input[type=radio]:not(.toggle)");
                if (checks.size() > 0) {
                    checks.each(function () {
                        $(this).show();
                        $(this).uniform();
                    });
                }
            }
        }
        ,
        // 销毁
        _remove: function () {
            if (this.$contentTypeDiv != undefined && this.$contentTypeDiv.remove != undefined) {
                this.$contentTypeDiv.remove();
            }
            if (this.$gridWrapper != undefined && this.$gridWrapper.remove != undefined) {
                this.$gridWrapper.remove();
            }
            if (this.$pageDiv != undefined && this.$pageDiv.remove != undefined) {
                this.$pageDiv.remove();
            }
        }
        ,
        // 重新加载
        _reload: function (options) {
            if (this._options.beforeReload != undefined) {
                this._options.beforeReload(this);
            }
            if (options != undefined) {
                this._options = $.extend(true, {}, this._options, options);
                this._setOptions(this._options, this);
            }
            this._load();
        }
    };

    /**
     * jquery插件扩展 ===================================================
     */
    /**
     * 解决ieindexOf问题
     */
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (elt) {
            var len = this.length >>> 0;
            var from = Number(arguments[1]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if (from < 0)
                from += len;

            for (; from < len; from++) {
                if (from in this && this[from] === elt)
                    return from;
            }
            return -1;
        };
    }
    var grid = function (options, callback) {
        if (callback != undefined) {
            options.afterInit = callback;
        }
        options = $.extend(true, {}, Grid.defaults, options);
        var eles = [];
        this.each(function () {
            var self = this;
            var instance = new Grid(self, options);
            eles.push(instance);
        });
        return eles[0];
    };

    $.fn.extend({
        'orangeGrid': grid
    });
})(jQuery, window, document);
