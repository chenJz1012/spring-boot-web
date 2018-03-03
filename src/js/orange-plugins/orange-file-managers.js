/**
 * Created by cgj on 2015/12/9.
 */
;
(function ($, window, document, undefined) {
    'use strict';

    String.prototype.startWith = function (s) {
        if (s === null || s === "" || this.length == 0 || s.length > this.length)
            return false;
        return this.substr(0, s.length) == s;
    };
    String.prototype.endWith = function (s) {
        if (s === null || s === "" || this.length == 0 || s.length > this.length)
            return false;
        return this.substring(this.length - s.length) == s;
    };
    var getSimplePath = function (path) {
        return path;
    };
    var getPrefix = function (name) {
        return name.substring(name.lastIndexOf(".") + 1).toLowerCase();
    };
    var getWithoutPrefix = function (name) {
        return name.substring(0, name.lastIndexOf("."));
    };
    var getShortName = function (name) {
        return name.substring(0, (name.length > 15 ? 15 : name.length)) + (name.length > 15 ? "..." : "");
    };
    var FileManager = function (element, options) {
        options = options || {};
        this.$element = $(element);
        this.options = $.extend(true, {}, FileManager.default, options);
        if (!this.validate()) {
            return;
        }
        this.init();
        return this;
    };

    FileManager.default = {
        "title": "资源管理器",
        "viewType": "icon",//icon list
        "currentPath": "",
        "height": 500,
        "useContextMenu": true,
        "contextMenuOption": {},
        "url": {
            upload: App.href + "/api/fileManager/upload",
            folder: App.href + "/api/fileManager/folder",
            createFolder: App.href + "/api/fileManager/createFolder",
            rename: App.href + "/api/fileManager/rename",
            deleteFile: App.href + "/api/fileManager/deleteFile",
            deleteFolder: App.href + "/api/fileManager/deleteFolder",
            download: App.href + "/api/fileManager/download",
            zip: App.href + "/api/fileManager/zip",
            unCompress: App.href + "/api/fileManager/unCompress"
        }
    };

    FileManager.tpl = {
        pathNav: {
            ul: '<ul class="breadcrumb" style="background: none"></ul>',
            li: '<li><a href="javascript:void(0);"><font style="font-size:20px;font-family: Arial, Helvetica, sans-serif;">${nav_}</font></a></li>',
            rootNavLi: '<li><a href="javascript:void(0);"><font style="font-size:20px;font-family: Arial, Helvetica, sans-serif;">${title_}</font></a></li>'
        },
        Folder: {
            container: '<div class="tiles"></div>',
            folder: '<div class="tile bg-yellow">' +
            '<div class="tile-body"><i class="fa fa-folder-open-o"></i></div>' +
            '<div class="tile-object"><div class="name">返回</div></div>' +
            '</div>'
        },
        TableFolder: {
            container: '<table class="table table-hover"></table>',
            folder: '<tr><td><span class="fa fa-folder-open-o"></span></td>'
            + '<td class="text-right text-nowrap"><button class="btn btn-xs btn-warning">返回</button></td></tr>'
        },
        File: {
            file: '<div class="tile bg-grey" title="${title_}">' +
            '<div class="tile-body"> <i class="fa ${icon_}"></i> </div> ' +
            '<div class="tile-object"> <div class="name">${name_}</div></div> ' +
            '</div>',
            folder: '<div class="tile bg-yellow" title="${title_}">' +
            '<div class="tile-body"> <i class="fa fa-folder-o"></i> </div> ' +
            '<div class="tile-object"> <div class="name">${name_} </div></div> ' +
            '</div>'
        },
        TableFile: {
            file: '<tr><td><span class="fa ${icon_}"></span> ${name_}</td>'
            + '<td class="text-right text-nowrap"><button class="btn btn-xs btn-info">${size_}</button> <button class="btn btn-xs btn-warning">下载</button></td></tr>',
            folder: '<tr><td><span class="fa fa-folder-o"></span> ${name_}</td>'
            + '<td class="text-right"><button class="btn btn-xs btn-warning">进入</button></td></tr>'
        },
        ContextMenu: {
            container: '<div></div>',
            ul: '<ul class="dropdown-menu" role="menu">',
            file: '<li class="file"><a href="javascript:void(0);"><i class="${icon_}"></i> <span>${text_}</span> </a></li>',
            folder: '<li class="folder"><a href="javascript:void(0);"><i class="${icon_}"></i> <span>${text_}</span> </a></li>',
            fileAndFolder: '<li class="file folder"><a href="javascript:void(0);"><i class="${icon_}"></i> <span>${text_}</span> </a></li>',
            desk: '<li class="desk"><a href="javascript:void(0);"><i class="${icon_}"></i> <span>${text_}</span> </a></li>'
        }
    };

    FileManager.prototype = {
        constructor: FileManager,
        validate: function () {
            this.currentPath = this.options.currentPath;
            return true;
        },
        render: function () {
            this.$element.addClass("scroller").attr("data-always-visible", 1).attr("data-rail-visible", 1);
            this.contextMenu = this.getContextMenu();
            if (this.contextMenu != null)
                this.$element.parent().append(this.contextMenu.$element);
            this.$pathNav = this.getPathNav(this.currentPath);
            this.$element.append(this.$pathNav);
            this.currentFolder = this.getFolder(this.currentPath);
            this.$element.append(this.currentFolder.$element);
        },
        getContextMenu: function () {
            return this.options.useContextMenu ? new ContextMenu(this.options.contextMenu, this) : null;
        },
        getPathNav: function (currentPath) {
            var that = this;
            var navUl = $.tmpl(FileManager.tpl.pathNav.ul);
            var path = getSimplePath(currentPath);
            var rootNavLi = $.tmpl(FileManager.tpl.pathNav.rootNavLi, {
                "title_": that.options.title
            });
            rootNavLi.data("path", "");
            navUl.append(rootNavLi);
            if (path === "") {
                rootNavLi.find("i").remove();
                return navUl;
            }
            this.pathNavArray = path.split("/");
            var levelPath = "";
            for (var i = 0; i < this.pathNavArray.length; i++) {
                var navLi = $.tmpl(FileManager.tpl.pathNav.li, {
                    "nav_": this.pathNavArray[i]
                });
                if (i == (this.pathNavArray.length - 1)) {
                    navLi.find("i").remove();
                }
                navUl.append(navLi);
                levelPath += (this.pathNavArray[i] + "/");
                navLi.data("path", levelPath);
            }
            return navUl;
        },
        getFolder: function (currentPath) {
            return new Folder(currentPath, this);
        },
        enterFolder: function (targetPath) {
            this.currentPath = targetPath;
            this.$pathNav.remove();
            this.$pathNav = this.getPathNav(targetPath).hide();
            this.$element.append(this.$pathNav.fadeIn());
            this.currentFolder.$element.fadeOut().remove();
            this.currentFolder = this.getFolder(this.currentPath, this);
            this.currentFolder.$element.hide();
            this.$element.append(this.currentFolder.$element.fadeIn());
            this.listen();
        },
        listen: function () {
            var that = this;
            this.$pathNav.find("li").on("click", function (e) {
                e.stopPropagation();
                that.enterFolder($(this).data("path"));
            });
        },
        init: function () {
            this.render();
            this.listen();
        }
    };

    var Folder = function (currentPath, manager) {
        this.manager = manager;
        this.currentPath = getSimplePath(currentPath);
        if (this.currentPath.indexOf("/") != -1) {
            this.name = currentPath.substring(currentPath.lastIndexOf("/") + 1);
        } else {
            this.name = this.currentPath;
        }
        this.files = [];
        this.init();
        return this;
    };

    Folder.prototype = {
        constructor: Folder,
        init: function () {
            this.render();
            this.listen();
        },
        render: function () {
            var that = this;
            //load return folder
            var tplFolder = FileManager.tpl.Folder;
            if (this.manager.options.viewType == "list") {
                tplFolder = FileManager.tpl.TableFolder;
            }
            this.$element = $.tmpl(tplFolder.container);
            this.$element.css("height", that.manager.options.height);
            if (this.currentPath != "") {
                this.$returnFolder = $.tmpl(tplFolder.folder);
                this.$element.append(this.$returnFolder);
            }
            this.files = [];
            that.manager.$element.block();
            $.ajax({
                type: "POST",
                dataType: "json",
                url: that.manager.options.url.folder,
                beforeSend: function (request) {
                    request.setRequestHeader("X-Auth-Token", App.token);
                },
                data: {
                    "path": this.currentPath
                },
                success: function (data) {
                    if (data.code === 200) {
                        that.currentPath = data.data.currentDirPath;
                        that.parentPath = data.data.moveUpDirPath;
                        if (data.data.files !== undefined && data.data.files.length > 0) {
                            $.each(data.data.files, function (i, file) {
                                var f = new File(file, that);
                                that.$element.append(f.$element);
                                that.files.push(f);
                            });
                        }
                    } else {
                        alert(data.message);
                    }
                    that.manager.$element.unblock();
                }
            });
        },
        enterSubFolder: function (subFolderName) {
            this.manager.enterFolder(this.currentPath + subFolderName)
        },
        returnParent: function () {
            this.manager.enterFolder(this.parentPath);
        },
        getAllFiles: function () {
            return this.files;
        },
        getSelectedFiles: function () {
            var selectedFiles = [];
            $.each(this.getAllFiles(), function (i, file) {
                if (file.selected())
                    selectedFiles.push(file);
            });
            return selectedFiles;
        },
        unSelectAll: function () {
            $.each(this.getAllFiles(), function (i, file) {
                if (file.selected())
                    file.unSelect();
            });
        },
        listen: function () {
            if (this.currentPath != "") {
                this.$returnFolder.on("dblclick", $.proxy(this.returnParent, this));
            }
        },
        createFolder: function () {
            var newFolderData = {
                name: "新建文件夹",
                isDirectory: true
            };
            var folder = new File(newFolderData, this);
            this.$element.prepend(folder.$element);
            folder.namingFolder();
        },
        zip: function (name, zipName) {
            var that = this;
            $.ajax({
                type: "POST",
                dataType: "json",
                url: that.manager.options.url.zip,
                data: {
                    "folderPath": this.currentPath,
                    "name": name.toString(),
                    "zipName": zipName
                },
                success: function (data) {
                    if (data.code === 200) {
                        that.refresh();
                    }
                }
            });
        },
        uploadFile: function () {
            var that = this;
            var modal = $.orangeModal({
                id: "uploadFileForm",
                width: "600",
                height: "200",
                title: "上传",
                destroy: true
            });
            var formOpts = {
                id: "upload_file_form",//表单id
                name: "upload_file_form",//表单名
                method: "POST",//表单method
                action: "",//表单action
                ajaxSubmit: true,//是否使用ajax提交表单
                rowEleNum: 1,
                labelInline: false,
                showSubmit: false,
                submitText: "保存",//保存按钮的文本
                showReset: false,//是否显示重置按钮
                resetText: "重置",//重置按钮文本
                isValidate: true,//开启验证
                buttonsAlign: "center",
                buttons: [{
                    type: 'button',
                    text: '确定',
                    handle: function () {
                        $.ajaxFileUpload(
                            {
                                url: that.manager.options.url.upload  + "&folderPath=" + that.currentPath,
                                type: "POST",
                                secureuri: false,
                                fileElementId: "file_file_manager_file",
                                dataType: "json",
                                success: function (json, status) {
                                    if (json.code === 200) {
                                        that.refresh();
                                        modal.hide();
                                    } else {
                                        alert(json.message);
                                    }
                                },
                                error: function (data, status, e) {
                                    alert(e);
                                }
                            }
                        );
                    }
                }],
                items: [
                    {
                        type: 'file',
                        id: 'file_manager_file',
                        name: 'file_manager_file',
                        label: '上传文件',
                        isAjaxUpload: false
                    }
                ]
            };
            var form = modal.$body.orangeForm(formOpts);
            modal.show();
        },
        refresh: function () {
            this.manager.enterFolder(this.currentPath);
        }
    };

    var File = function (data, folder) {
        this.folder = folder;
        this.data = data;
        this.name = this.data.name;
        this.isDirectory = this.data.isDirectory;
        this.init();
        return this;
    };

    File.icon = {
        ico: "fa-file-image-o",
        gif: "fa-file-image-o",
        png: "fa-file-image-o",
        jpg: "fa-file-image-o",
        jar: "fa-file-zip-o",
        zip: "fa-file-zip-o",
        rar: "fa-file-zip-o",
        css: "fa-css3",
        js: "fa-file-code-o",
        txt: "fa-file-text",
        ftl: "fa-file-text",
        html: "fa-file-text",
        xml: "fa-file-text",
        jsp: "fa-file-text"
    };

    File.prototype = {
        constructor: FileManager,
        init: function () {
            this.render();
            this.listen();
        },
        render: function () {
            var that = this;
            var tplFile = FileManager.tpl.File;
            if (this.folder.manager.options.viewType == 'list') {
                tplFile = FileManager.tpl.TableFile;
            }
            if (this.isDirectory) {
                this.$element = $.tmpl(tplFile.folder, {
                    "name_": getShortName(this.data.name),
                    "title_": this.data.name,
                    "size_": this.data.size
                });
            } else {
                var prefix = getPrefix(this.data.name);
                this.$element = $.tmpl(tplFile.file, {
                    "name_": getShortName(this.data.name),
                    "title_": this.data.name,
                    "size_": this.data.size,
                    "icon_": File.icon[prefix] === undefined ? "fa-file-o" : File.icon[prefix]
                });
            }
            this.$element.data("file", this);
        },
        listen: function () {
            var that = this;
            var TimeFn = null;
            this.$element.on("click", $.proxy(function () {
                clearTimeout(TimeFn);
                TimeFn = setTimeout($.proxy(function () {
                    if (this.selected()) {
                        this.unSelect();
                    } else {
                        this.select();
                    }
                }, this), 200);
            }, this));
            this.$element.on("dblclick", $.proxy(function () {
                clearTimeout(TimeFn);
                if (this.isDirectory) {
                    this.enter();
                } else {
                    //todo file onDblclick event
                }
            }, this));
        },
        select: function () {
            var selectDiv = $('<div class="corner"></div><div class="check"></div>');
            this.$element.addClass("selected");
            this.$element.prepend(selectDiv);
        },
        unSelect: function () {
            this.$element.removeClass("selected");
            this.$element.find(".corner,.check").remove();
        },
        selected: function () {
            return !!this.$element.hasClass("selected");
        },
        open: function () {
            alert("打开->" + this.name);
        },
        enter: function () {
            if (this.isDirectory)
                this.folder.enterSubFolder(this.name);
        },
        namingFolder: function () {
            this.$element.off("click").off("dblclick");
            var text = this.$element.find(".name").text();
            var input = $('<input class="form-control" value="' + text + '">');
            this.$element.find(".name").empty().append(input);
            input.on("blur", $.proxy(this.onNameFolder, this));
            var that = this;
            input.keypress(function (event) {
                var c = (event.keyCode ? event.keyCode : event.which);
                if (c == '13') {
                    that.onNameFolder();
                }
            });
            input.select();
        },
        onNameFolder: function () {
            var folderName = this.$element.find(".name > input").val();
            var that = this;
            var dirPath = getSimplePath(this.folder.currentPath.endWith("/") ? (this.folder.currentPath + folderName) : (this.folder.currentPath + "/" + folderName));
            $.ajax({
                type: "POST",
                dataType: "json",
                url: that.folder.manager.options.url.createFolder,
                beforeSend: function (request) {
                    request.setRequestHeader("X-Auth-Token", App.token);
                },
                data: {
                    "dirPath": dirPath
                },
                success: function (data) {
                    if (data.code === 200) {
                        that.folder.refresh();
                    }
                }
            });
        },
        renaming: function () {
            var that = this;
            this.$element.off("click").off("dblclick");
            var oldName = this.name;
            var input = $('<input class="form-control" value="' + oldName + '">');
            this.$element.find(".name").empty().append(input);
            input.on("blur", $.proxy(this.onRename, this, oldName));
            input.keypress(function (event) {
                var c = (event.keyCode ? event.keyCode : event.which);
                if (c == '13') {
                    that.onRename(oldName)
                }
            });
            input.select();
        },
        onRename: function (oldName) {
            var newName = this.$element.find(".name > input").val();
            var that = this;
            var folderPath = getSimplePath(this.folder.currentPath);
            $.ajax({
                type: "POST",
                dataType: "json",
                url: that.folder.manager.options.url.rename,
                beforeSend: function (request) {
                    request.setRequestHeader("X-Auth-Token", App.token);
                },
                data: {
                    "folderPath": folderPath,
                    "oldName": oldName,
                    "newName": newName
                },
                success: function (data) {
                    if (data.code === 200) {
                        that.folder.refresh();
                    } else {
                        alert(data.message);
                        that.folder.refresh();
                    }
                }
            });
        },
        deleteFile: function () {
            var that = this;
            var filePath = "";
            if (that.folder.currentPath === "") {
                filePath = "/" + that.name;
            } else {
                filePath = getSimplePath("/" + (that.folder.currentPath.endWith("/") ? that.folder.currentPath + that.name : that.folder.currentPath + "/" + that.name));
            }
            $.ajax({
                type: "POST",
                dataType: "json",
                url: that.folder.manager.options.url.deleteFile,
                beforeSend: function (request) {
                    request.setRequestHeader("X-Auth-Token", App.token);
                },
                data: {
                    "filePath": filePath
                },
                success: function (data) {
                    if (data.code === 200) {
                        that.$element.removeData("file");
                        that.$element.remove();
                    }
                }
            });
        },
        deleteFolder: function () {
            var that = this;
            var dirPath = "";
            if (that.folder.currentPath === "") {
                dirPath = "/" + that.name;
            } else {
                dirPath = getSimplePath("/" + (that.folder.currentPath.endWith("/") ? that.folder.currentPath + that.name : that.folder.currentPath + "/" + that.name));
            }
            $.ajax({
                type: "POST",
                dataType: "json",
                url: that.folder.manager.options.url.deleteFolder,
                beforeSend: function (request) {
                    request.setRequestHeader("X-Auth-Token", App.token);
                },
                data: {
                    "dirPath": dirPath
                },
                success: function (data) {
                    if (data.code === 200) {
                        that.$element.removeData("file");
                        that.$element.remove();
                    }
                }
            });
        },
        download: function () {
            var folderPath = getSimplePath(this.folder.currentPath);
            var fileName = this.name;
            var that = this;
            window.open(that.folder.manager.options.url.download  + "&folderPath=" + folderPath + "&fileName=" + fileName);
        },
        unCompress: function () {
            var that = this;
            var folderPath = getSimplePath(that.folder.currentPath);
            $.ajax({
                type: "POST",
                dataType: "json",
                url: that.folder.manager.options.url.unCompress,
                beforeSend: function (request) {
                    request.setRequestHeader("X-Auth-Token", App.token);
                },
                data: {
                    "folderPath": folderPath,
                    "name": that.name
                },
                success: function (data) {
                    if (data.code === 200) {
                        that.folder.refresh();
                    }
                }
            });
        }
    };

    var ContextMenu = function (option, manager) {
        this.manager = manager;
        this.targetFiles = [];
        this.init();
        return this;
    };
    ContextMenu.systemOption = {
        items: [
            {
                text: "打开",
                onClick: function (currentFolder, targetFiles, targetFile) {
                    if (targetFile.isDirectory) {
                        currentFolder.enterSubFolder(targetFile.name);
                    } else {
                        targetFile.open();
                    }
                },
                showType: "fileAndFolder"// file,folder,fileAndFolder,desk
            }, {
                text: "解压到当前文件夹",
                onClick: function (currentFolder, targetFiles, targetFile) {
                    if (!targetFile.isDirectory) {
                        targetFile.unCompress();
                    }
                },
                showType: "file",// file,folder,fileAndFolder,desk
                fileType: "zip,rar"
            }, {
                text: "压缩",
                textHandle: function (currentFolder, targetFiles, targetFile) {
                    if (targetFiles.length == 0) {
                        return "";
                    } else if (targetFiles.length == 1) {
                        if (targetFile.isDirectory) {
                            return "压缩到\"" + targetFile.name + ".zip\"";
                        } else {
                            return "压缩到\"" + getWithoutPrefix(targetFile.name) + ".zip\"";
                        }
                    } else {
                        return "压缩到\"" + (currentFolder.name === "" ? "根目录" : currentFolder.name) + ".zip\"";
                    }
                },
                onClick: function (currentFolder, targetFiles, targetFile) {
                    var zipName;
                    if (targetFiles.length == 0) {
                        return;
                    } else if (targetFiles.length == 1) {
                        if (targetFile.isDirectory) {
                            zipName = targetFile.name;
                        } else {
                            zipName = getWithoutPrefix(targetFile.name);
                        }
                        currentFolder.zip(targetFile.name, zipName);
                    } else {
                        var names = [];
                        $.each(targetFiles, function (i, file) {
                            names.push(file.name);
                        });
                        zipName = currentFolder.name === "" ? "根目录" : currentFolder.name;
                        currentFolder.zip(names, zipName);
                    }
                },
                showType: "fileAndFolder"// file,folder,fileAndFolder,desk
            },
            {
                text: "重命名",
                onClick: function (currentFolder, targetFiles, targetFile) {
                    targetFile.renaming();
                },
                showType: "fileAndFolder"// file,folder,fileAndFolder,desk
            }, {
                text: "删除",
                onClick: function (currentFolder, targetFiles, targetFile) {
                    bootbox.confirm("确定删除吗？", function (result) {
                        if (result) {
                            $.each(targetFiles, function (i, file) {
                                if (file.isDirectory) {
                                    file.deleteFolder();
                                } else {
                                    file.deleteFile();
                                }
                            });
                        }
                    });
                },
                showType: "fileAndFolder"// file,folder,fileAndFolder,desk
            },
            {
                text: "下载",
                onClick: function (currentFolder, targetFiles, targetFile) {
                    targetFile.download();
                },
                showType: "file"
            },
            {
                text: "刷新",
                onClick: function (currentFolder) {
                    currentFolder.refresh();
                },
                showType: "desk"
            },
            {
                text: "新建文件夹",
                onClick: function (currentFolder) {
                    currentFolder.createFolder();
                },
                showType: "desk"
            },
            {
                text: "上传",
                onClick: function (currentFolder) {
                    currentFolder.uploadFile();
                },
                showType: "desk"
            }
        ]
    };

    ContextMenu.prototype = {
        init: function () {
            this.render();
            this.listen();
        },
        render: function () {
            var that = this;
            var option = that.manager.options.contextMenuOption;
            var container = $.tmpl(FileManager.tpl.ContextMenu.container, {
                id: option.id === undefined ? new Date().getTime() : option.id
            });
            var menuUl = $.tmpl(FileManager.tpl.ContextMenu.ul);
            $.each(ContextMenu.systemOption.items, function (i, item) {
                var li = $.tmpl(FileManager.tpl.ContextMenu[item.showType], {
                    "text_": item.text
                });
                li.data("onclick", item.onClick);
                if (item.textHandle !== undefined) {
                    li.data("textHandle", item.textHandle);
                    li.attr("text-handle", true);
                }
                if (item.fileType !== undefined) {
                    li.data("file-type", item.fileType);
                    li.attr("file-type", true);
                }
                menuUl.append(li);
            });
            if (option.items !== undefined && option.items.length > 0) {
                $.each(option.items, function (i, item) {
                    var li = $.tmpl(FileManager.tpl.ContextMenu[item.showType], {
                        "text_": item.text
                    });
                    li.data("onclick", item.onClick);
                    if (item.textHandle !== undefined) {
                        li.data("textHandle", item.textHandle);
                        li.attr("text-handle", true);
                    }
                    if (item.fileType !== undefined) {
                        li.data("file-type", item.fileType);
                        li.attr("file-type", true);
                    }
                    menuUl.append(li);
                });
            }
            container.append(menuUl);
            this.$element = container;
        },
        listen: function () {
            var that = this;
            this.manager.$element.contextmenu({
                target: that.$element,
                before: function (e) {
                    e.preventDefault();
                    var fileElement = $(e.target).parents("div.tile");
                    if (fileElement.length == 1) {
                        var file = fileElement.data("file");
                        if (file === undefined)
                            return false;
                        that.targetFile = file;
                        if (file.selected()) {
                            that.targetFiles = that.manager.currentFolder.getSelectedFiles();
                        } else {
                            that.manager.currentFolder.unSelectAll();
                            that.targetFiles = [file];
                        }
                        if (that.targetFiles.length > 1) {
                            this.getMenu().find("li.folder").hide();
                            this.getMenu().find("li.file").hide();
                        } else {
                            if (file.isDirectory) {
                                this.getMenu().find("li.folder").show();
                                this.getMenu().find("li.file").hide();
                            } else {
                                this.getMenu().find("li.file").show();
                                this.getMenu().find("li.folder").hide();
                                var fileType = getPrefix(file.name);
                                this.getMenu().find("li[file-type=true]").each(function () {
                                    var show = false;
                                    var fileTypes = $(this).data("file-type").split(",");
                                    for (var i in fileTypes) {
                                        if (fileTypes[i] == fileType) {
                                            show = true;
                                        }
                                    }
                                    if (show) {
                                        $(this).show();
                                    } else {
                                        $(this).hide();
                                    }
                                });
                            }
                        }
                        this.getMenu().find("li.folder.file").show();
                        this.getMenu().find("li.desk").hide();
                    } else {
                        that.manager.currentFolder.unSelectAll();
                        this.getMenu().find("li.file,li.folder").hide();
                        this.getMenu().find("li.desk").show();
                    }
                    this.getMenu().find("li[text-handle=true]").each(function () {
                        var handle = $(this).data("text-handle");
                        var text = handle(that.manager.currentFolder, that.targetFiles, that.targetFile);
                        $(this).find("span").text(text);
                    });
                    return true;
                },
                onItem: function (context, e) {
                    var click = $(e.target).parents("li").data("onclick");
                    click(that.manager.currentFolder, that.targetFiles, that.targetFile);
                    that.manager.currentFolder.unSelectAll();
                }
            });
        }
    };

    $.fn.fileManager = function (option, e) {
        var fileManagers = [];
        this.each(function () {
            var instance = new FileManager(this, option);
            fileManagers.push(instance);
        });
        return fileManagers.length > 1 ? fileManagers : fileManagers[0];
    };
    $.fn.fileManager.Constructor = FileManager;
})(jQuery, window, document);
