/**
 * Created by chenguojun on 8/29/16.
 */

(function ($, window, document, undefined) {
    var Layout = function (element, options) {
        this._options = options;
        this.$element = $(element);
        var id = element.id;
        if (id === undefined || id=='') {
            id = "orange_layout_" + new Date().getTime();
            this.$element.attr("id", id);
        }
        this._elementId = id;
        this.init();
    };
    Layout.examples = {
        rows: [
            {
                cols: [
                    {
                        col: 6,
                        title: '示例1',
                        type: 'panel',
                        content: {
                            plugin: 'tab',
                            option: {
                                tabs: [
                                    {
                                        title: 'tab1',
                                        active: true,
                                        content: {
                                            html: 'tab1'
                                        }
                                    },
                                    {
                                        title: 'tab2',
                                        active: false,
                                        content: {
                                            html: 'tab2'
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    {
                        col: 6,
                        title: '示例2',
                        content: {
                            html: 'aaa'
                        }
                    }
                ]
            }
        ]
    };
    Layout.defaults = {
        title: '',
        rows: []
    };
    Layout.prototype = {
        init: function () {
            var that = this;
            if (this._options.rows !== undefined && this._options.rows.length > 0) {
                $.each(this._options.rows, function (i, row) {
                    var rowElement = $('<div class="row"></div>');
                    that.$element.append(rowElement);
                    if (row.cols !== undefined && row.cols.length > 0) {
                        $.each(row.cols, function (j, col) {
                            var spanElement = $('<div class="col-md-' + col.col + ' col-sm-12"></div>');
                            rowElement.append(spanElement);
                            if (col.type === 'panel') {
                                var panel = that.getPanel(col.title);
                                spanElement.append(panel);
                                panel.find("div.panel-body").attr("id", "pb_" + i + "_" + j);
                                that.renderContent(panel.find("div.panel-body"), col.content);
                            } else {
                                spanElement.attr("id", "pb_" + i + "_" + j);
                                that.renderContent(spanElement, col.content);
                            }

                        });
                    }
                });
            }
        },
        getPanel: function (title) {
            var panelTmpl =
                '<div class="panel panel-default" >' +
                '<div class="panel-heading">${title_}</div>' +
                '<div class="panel-body"></div>' +
                '</div>';
            return $.tmpl(panelTmpl, {
                "title_": title
            });
        },
        renderContent: function (spanElement, content) {
            if (content.plugin !== undefined) {
                switch (content.plugin) {
                    case 'grid':
                        $(spanElement).orangeGrid(content.options);
                        break;
                    case 'form':
                        $(spanElement).orangeForm(content.options);
                        break;
                    case 'tab':
                        $(spanElement).orangeTab(content.options);
                        break;
                    default:
                        $(spanElement).append(content.html);
                }
            } else {
                $(spanElement).append(content.html);
            }
        }
    };

    /**
     * jquery插件扩展 ===================================================
     */

    var getLayout = function (options) {
        options = $.extend(true, {}, Layout.defaults, options);
        var eles = [];
        this.each(function () {
            var self = this;
            var instance = new Layout(self, options);
            eles.push(instance);
        });
        return eles[0];
    };

    $.fn.extend({
        'orangeLayout': getLayout
    });
})(jQuery, window, document);
