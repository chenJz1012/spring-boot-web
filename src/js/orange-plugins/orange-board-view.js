/**
 * Created by chenguojun on 8/29/16.
 */

(function ($, window, document, undefined) {
    var BoardView = function (element, options) {
        this._options = options;
        this.$element = $(element);
        var id = element.id;
        if (id === undefined || id === '') {
            id = "orange_board_view_" + new Date().getTime();
            this.$element.attr("id", id);
        }
        this._elementId = id;
        this.load();
        this.init();
    };
    BoardView.examples = {
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
    BoardView.defaults = {
        dataSetUrl: '',
        title: '',
        rows: []
    };
    BoardView.prototype = {
        load: function () {
        },
        init: function () {
            var that = this;
            var mainPanel = $('<div class="panel panel-default">' +
                '<div class="panel-heading">' +
                this._options.title +
                '</div>' +
                '<div class="panel-body"></div>' +
                '</div>');
            that.$element.append(mainPanel);
            if (this._options.rows !== undefined && this._options.rows.length > 0) {
                $.each(this._options.rows, function (i, row) {
                    var rowPanel = $('<div class="panel panel-danger">' +
                        '<div class="panel-heading"></div>' +
                        '<div class="panel-body"></div>' +
                        '</div>');
                    var rowElement = $('<div class="row"></div>');
                    rowPanel.find('.panel-body:eq(0)').append(rowElement);
                    mainPanel.find('.panel-body:eq(0)').append(rowPanel);
                    if (row.cols !== undefined && row.cols.length > 0) {
                        $.each(row.cols, function (j, col) {
                            var spanElement = $('<div class="col-md-' + col.span + ' col-sm-12"></div>');
                            rowElement.append(spanElement);
                            var panel = that.getPanel(col.title, 'info');
                            var requestUrl = App.href + "/api/core/commonQuery/load/" + col.id;
                            spanElement.append(panel);
                            $.ajax({
                                type: "GET",
                                dataType: "json",
                                url: requestUrl,
                                success: function (ddd) {
                                    if (ddd.code === 200) {
                                        panel.find('.panel-body:eq(0)').orangeGrid(eval('(' + ddd.data.jsonContent + ')'), function (grid) {
                                            grid.$gridWrapper.css(
                                                {
                                                    'height': '500px',
                                                    'margin-bottom': '5px',
                                                    'margin-top': '5px',
                                                    'border-bottom': '1px solid #ddd'
                                                }
                                            );
                                        });
                                    } else {
                                        alert(ddd.message)
                                    }
                                },
                                error: function (e) {
                                    alert("请求异常。")
                                }
                            });

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

    var getBoardView = function (options) {
        options = $.extend(true, {}, BoardView.defaults, options);
        var eles = [];
        this.each(function () {
            var self = this;
            var instance = new BoardView(self, options);
            eles.push(instance);
        });
        return eles[0];
    };

    $.fn.extend({
        'orangeBoardView': getBoardView
    });
})(jQuery, window, document);
