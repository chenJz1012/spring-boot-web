/**
 * Created by chenguojun on 8/29/16.
 */

(function ($, window, document, undefined) {
    var Board = function (element, options) {
        this._options = options;
        this.$element = $(element);
        var id = element.id;
        if (id === undefined|| id === '') {
            id = "orange_board_" + new Date().getTime();
            this.$element.attr("id", id);
        }
        this._elementId = id;
        this.load();
        this.init();
    };
    Board.examples = {
        title: '',
        rows: [
            {
                cols: [
                    {
                        span: 6,
                        title: '示例1',
                        id: 1
                    },
                    {
                        span: 6,
                        title: '示例2'
                    }
                ]
            }
        ]
    };
    Board.defaults = {
        dataSetUrl: '',
        title: '',
        rows: []
    };
    Board.prototype = {
        load: function () {
            var that = this;
            this.dataSet = [];
            if (that._options.dataSetUrl != undefined) {
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: that._options.dataSetUrl,
                    async: false,
                    success: function (data) {
                        $.each(data, function (i, d) {
                            that.dataSet.push(d);
                        });
                    },
                    error: function (e) {
                        alert("请求异常。")
                    }
                });
            }
        },
        init: function () {
            var that = this;
            var mainPanel = $('<div class="panel panel-default">' +
                '<div class="panel-heading">' +
                this._options.title +
                '<div class="pull-right"><div class="btn-group"><button type="button" role="row" class="btn btn-default btn-xs">添加行</button></div></div></div>' +
                '<div class="panel-body"></div>' +
                '</div>');
            that.$element.append(mainPanel);
            mainPanel.find('button[role=row]').on("click", function () {
                var row = {
                    cols: []
                };
                that._options.rows.push(row);
                that.reload(that._options);
            });
            var mainPanelName = $(
                '<form>' +
                '<div class="row">' +
                '<div class="col-md-12">' +
                '<div class="form-group">' +
                '<label>仪表盘名称</label>' +
                '<input type="text" name="panelName" value="' + this._options.title + '" class="form-control input-large">' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</form>');
            mainPanel.find('.panel-body:eq(0)').append(mainPanelName);
            mainPanelName.find('input[name=panelName]').on('blur', function () {
                that._options.title = $(this).val();
                that.reload(that._options);
            });
            if (this._options.rows !== undefined && this._options.rows.length > 0) {
                $.each(this._options.rows, function (i, row) {
                    var rowPanel = $('<div class="panel panel-danger">' +
                        '<div class="panel-heading">行' +
                        '<div class="pull-right"><div class="btn-group"><button type="button" role="col" class="btn btn-default btn-xs">添加列</button><button type="button" role="remove" class="btn btn-danger btn-xs">删除</button></div></div></div>' +
                        '<div class="panel-body"></div>' +
                        '</div>');
                    rowPanel.find('button[role=col]').on("click", function () {
                        var col = {
                            span: 12,
                            title: '示例'
                        };
                        that._options.rows[i].cols.push(col);
                        that.reload(that._options);
                    });
                    rowPanel.find('button[role=remove]').on("click", function () {
                        that._options.rows.splice(i, 1);
                        that.reload(that._options);
                    });
                    var rowElement = $('<div class="row"></div>');
                    rowPanel.find('.panel-body:eq(0)').append(rowElement);
                    mainPanel.find('.panel-body:eq(0)').append(rowPanel);
                    if (row.cols !== undefined && row.cols.length > 0) {
                        $.each(row.cols, function (j, col) {
                            var spanElement = $('<div class="col-md-' + col.span + ' col-sm-12"></div>');
                            rowElement.append(spanElement);
                            var panel = that.getPanel(col.title, 'info');
                            var form = $(
                                '<form>' +
                                '<div class="row">' +
                                '<div class="col-md-12">' +
                                '<div class="form-group">' +
                                '<label>标题</label>' +
                                '<input type="text" name="title" value="' + col.title + '" class="form-control input-large">' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="row">' +
                                '<div class="col-md-12">' +
                                '<div class="form-group">' +
                                '<label>宽度[1-12]</label>' +
                                '<input type="text" name="span" value="' + col.span + '" class="form-control input-large">' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="row">' +
                                '<div class="col-md-12">' +
                                '<div class="form-group">' +
                                '<label>数据集</label>' +
                                '<select name="dataset" class="form-control input-large"></select>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '</form>');

                            if (that.dataSet.length > 0) {
                                $.each(that.dataSet, function (i, o) {
                                    var option = $('<option value=' + o.value + '>' + o.text + '</option>');
                                    form.find('select[name=dataset]').append(option);
                                });
                            }
                            panel.find(".panel-body:eq(0)").append(form);
                            spanElement.append(panel);
                            form.find('input[name=title]').on('blur', function () {
                                that._options.rows[i].cols[j].title = $(this).val();
                                that.reload(that._options);
                            });
                            form.find('input[name=span]').on('blur', function () {
                                that._options.rows[i].cols[j].span = $(this).val();
                                that.reload(that._options);
                            });
                            form.find('select[name=dataset]').on('change', function () {
                                that._options.rows[i].cols[j].id = $(this).val();
                                that._options.rows[i].cols[j].title = $(this).find("option:selected").text();
                                that.reload(that._options);
                            });
                            if (col.id > 0) {
                                form.find('select[name=dataset]').val(col.id);
                            } else {
                                form.find('select[name=dataset]').trigger('change');
                            }
                        });
                    }
                });
            }
        },
        getPanel: function (title, theme) {
            if (theme === undefined)
                theme = 'default';
            var panelTmpl =
                '<div class="panel panel-' + theme + '" >' +
                '<div class="panel-heading">${title_}</div>' +
                '<div class="panel-body"></div>' +
                '</div>';
            return $.tmpl(panelTmpl, {
                "title_": title
            });
        },
        reload: function (options) {
            this.$element.empty();
            this._options = options;
            this.init();
        },
        getJson: function () {
            return this._options;
        }
    };

    /**
     * jquery插件扩展 ===================================================
     */

    var getBoard = function (options) {
        options = $.extend(true, {}, Board.defaults, options);
        var eles = [];
        this.each(function () {
            var self = this;
            var instance = new Board(self, options);
            eles.push(instance);
        });
        return eles[0];
    };

    $.fn.extend({
        'orangeBoard': getBoard
    });
})(jQuery, window, document);
