/**
 * Created by chenguojun on 8/29/16.
 */

(function ($, window, document, undefined) {
    var Tab = function (element, options) {
        this._options = options;
        this.$element = $(element);
        var id = element.id;
        if (id === undefined || id == '') {
            id = "topie_tab_" + new Date().getTime();
            this.$element.attr("id", id);
        }
        this._elementId = id;
        this.init();
    };
    Tab.examples = {
        tabs: [
            {
                title: 'tab1',
                active: true,
                content: {
                    plugin: 'form',
                    options: {}
                }
            },
            {
                title: 'tab2',
                active: true,
                content: {
                    html: ''
                }
            }
        ]
    };
    Tab.defaults = {
        lazy: true,
        tabs: [],
        hideOtherTab: false,
        buttons: []
    };
    Tab.prototype = {
        init: function () {
            var that = this;
            if (this._options.tabs !== undefined && this._options.tabs.length > 0) {
                var ul = $('<ul class="nav nav-tabs"></ul>');
                that.$element.append(ul);
                that.$ul = ul;
                var tabContent = $('<div style="border-left: 1px solid #ddd;' +
                    'border-right: 1px solid #ddd;' +
                    'border-bottom: 1px solid #ddd;' +
                    'padding: 5px 12px 5px 12px;"' +
                    ' class="tab-content"></div>');
                that.$element.append(tabContent);
                $.each(that._options.tabs, function (i, tab) {
                    var tId = that._elementId + "_tab" + i;
                    var li = $('<li ' + (tab.active === true ? 'class="active"' : '') + '>' +
                        '<a href="#' + tId + '" data-toggle="tab" ' +
                        'aria-expanded="' + (tab.active === true ? 'true' : 'false') + '">' +
                        tab.title + '</a>' +
                        '</li>');
                    ul.append(li);
                    var pane = $('<div id="' + tId + '" class="tab-pane fade' + (tab.active === true ? ' active in ' : '') + '"><div role="content"></div></div>');
                    tabContent.append(pane);
                    if (!that._options.lazy) {
                        that.renderContent(pane.find('div[role=content]'), tab.content);
                    } else {
                        if (tab.active === true) {
                            that.renderContent(pane.find('div[role=content]'), tab.content);
                            li.find("a").addClass("init")
                        } else {
                            li.find("a").on("click.init", function (e) {
                                var $t = $(this);
                                if (!$(this).hasClass("init")) {
                                    that.renderContent(pane.find('div[role=content]'), tab.content);
                                    $t.off("click.init");
                                    $t.addClass("init");
                                }
                            })
                        }
                    }

                });
            }
            if (this._options.hideOtherTab) {
                this.$ul.find('a').on("click", function () {
                    var li = $(this).parent('li');
                    li.show();
                    li.siblings().each(function () {
                        $(this).hide();
                    });
                });
            }
        },
        renderContent: function (spanElement, content) {
            var rObject = $(spanElement);
            if (content.plugin !== undefined) {
                switch (content.plugin) {
                    case 'grid':
                        rObject = $(spanElement).orangeGrid(content.options);
                        break;
                    case 'form':
                        rObject = $(spanElement).orangeForm(content.options);
                        break;
                    case 'tab':
                        rObject = $(spanElement).orangeTab(content.options);
                        break;
                    default:
                        $(spanElement).append(content.html);
                }
            } else {
                $(spanElement).append(content.html);
            }
            if (content.afterRender != undefined) {
                content.afterRender(rObject);
            }
        },
        next: function () {
            var li = this.$element.find('li.active').next();
            if (li.length > 0) {
                li.find('a').trigger('click');
            }
        },
        prev: function () {
            var li = this.$element.find('ul.nav').find('li.active').prev();
            if (li.length > 0) {
                li.find('a').trigger('click');
            }
        },
        go: function (i) {
            var li = this.$element.find('ul.nav').find('li:eq(' + i + ')');
            if (li.length > 0) {
                li.find('a').trigger('click');
            }
        }
    };

    /**
     * jquery插件扩展 ===================================================
     */

    var getTab = function (options) {
        options = $.extend(true, {}, Tab.defaults, options);
        var eles = [];
        this.each(function () {
            var self = this;
            var instance = new Tab(self, options);
            eles.push(instance);
        });
        return eles[0];
    };

    $.fn.extend({
        'orangeTab': getTab
    });
})(jQuery, window, document);
