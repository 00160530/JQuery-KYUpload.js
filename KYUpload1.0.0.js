/* 
使用說明：
本套件一頁只能套用一個按鈕
請不要重複套用
適用chrome,IE10以上,Edge(僅在以上瀏覽器測試，其餘瀏覽器應該也可以用)
with jquery-3.2.1

參數說明：
change為選擇上傳路徑的事件
success,error,progress相對應為ajax事件
progressBar指定進度條容器，若不指定則長在上傳按鈕下面
showBar是否產生進度條，如果要自己設計進度條可以不生成
GroupName預設file，只能傳入string，可以依據不同檔案分類更換，會放入FormData的name，後台用來做檔案分類
check檢查是否有檔案，預設false，無檔案將不做任何動作，無法從回傳值知道是否有執行上傳，要能判斷請自己改

----------------------------------Sample--------------------------------------------------------
套用：
$("#btn").KYUpload({
	change: function (files) {
		//...
	},
	success: function (msg) {
		//...
	},
	error: function (xhr) {
		//...
	},
	progress: function (evt) {
		//...
	},
	progressBar: $("#bar"),
	showBar: true,
	GroupName: null,
});
上傳：
$("#btn").KYUploadSend({ url: "/ProjectManage/PM_5_U002_save", data: { PK_ID: 123 }, check(檢查是否有檔案): false})
取得上傳檔案：
$("#btn").KYUploadFiles()
現在的GroupName：
$("#btn").KYUploadGroupName()
更換GroupName：
$("#btn").KYUploadGroupName("newName")
清除檔案：
$("#btn").KYUploadClearFiles()//clear all
$("#btn").KYUploadClearFiles("GroupName")//clear one GroupName
不透過套件的原件只做檔案上傳:
$(input.files).KYUploadSendHelper({url: "/ProjectManage/PM_5_U002_GetFileVersion",success: function (msg) {},error: function (xhr) {},filetype: ["exe", "dll"]})
------------------------------------------------------------------------------------------------
UpdateList
2020/04/09:1.修改Sample、UpdateList文字描述 2.修正IE上傳檔案時的錯誤(IE在清空上傳元件時會觸發change導致檔案被清空，改成清空元件時先去把change事件移除)
2019/11/06:修正KYUploadSend沒設定事件參數會導致事件遺失的錯誤
2019/10/18:上傳時可以傳入除了change以外的事件複寫要觸發的function了

Last Update:2020/04/09
by KUN
 */

(function ($) {
    var uploadDOM = null;
    var progressDOM = null;
    var showBar = true;
    var fileGroupName = "file";
    var filesList = {};
    var change = null;
    var success = null;
    var error = null;
    var progress = null;
		
	$.fn.KYUploadClearFiles = function (GroupName) {
        if (GroupName && typeof (GroupName) === "string" && GroupName.replace(/\s+/g, '') != "") {
            filesList[GroupName.replace(/\s+/g, '')] = null;
            delete filesList[GroupName.replace(/\s+/g, '')];
        }
        else
            filesList = {};
        return filesList;
    }
    $.fn.KYUploadFiles = function (GroupName) {
        if (GroupName && typeof (GroupName) === "string" && GroupName.replace(/\s+/g, '') != "") {
            return filesList[GroupName.replace(/\s+/g, '')];
        }
        else
			return filesList;
    }
    $.fn.KYUploadGroupName = function (GroupName) {
        if (GroupName && typeof (GroupName) === "string" && GroupName.replace(/\s+/g, '') != "")
            fileGroupName = GroupName.replace(/\s+/g, '');
        return fileGroupName;
    }
    $.fn.KYUpload = function (options) {
        // object入參預設
        var settings = $.extend({
            change: null,
            success: null,
            error: null,
            progress: null,
            progressBar: null,
            showBar: true,
            GroupName: null,
        }, options);
        change = settings.change;
        success = settings.success;
        error = settings.error;
        progress = settings.progress;
        showBar = settings.showBar;
        if (settings.GroupName && typeof (settings.GroupName) === "string" && settings.GroupName.replace(/\s+/g, '') != "")
            fileGroupName = settings.GroupName.replace(/\s+/g, '');
        // 生成上傳元件
        uploadDOM = document.createElement("input"); //<input type="file" webkitdirectory />
        uploadDOM.type = "file";
        //uploadDOM.setAttribute("webkitdirectory", "");
        uploadDOM.setAttribute("class", "KYUpload");
        uploadDOM.setAttribute("style", "display:none;");
        $(uploadDOM).insertAfter(this);
        if (showBar) {
            progressDOM = document.createElement("div");
            progressDOM.setAttribute("class", "KYUpload");
            var progressHTML = '<div class="progressBorder" style="width:300px; height:30px; border:2px solid #09F;margin:5px;">';
            progressHTML += '<div class="progressContent" style="width:0; height:100%; padding-top:3%;background-color:#09F; text-align:center; line-height:10px; font-size:20px; font-weight:bold;color: #8e0000;"></div>';
            progressHTML += '</div>';
            $(progressDOM).html(progressHTML);
            if (settings.progressBar)
                $(progressDOM).appendTo(settings.progressBar);
            else
                $(progressDOM).insertAfter(this);
        }

        //綁定事件
        $(this).on("click", function (e) {
            uploadDOM.click();
        });
        //定義change事件觸發
        $(uploadDOM).on("change", { e: this }, changeEvent);
        //因為IE會重複觸發，為了可以移除再綁定事件，所以改寫法
        //$(uploadDOM).on("change", function (e) {
        //    filesList[fileGroupName] = [];
        //    filesList[fileGroupName].push.apply(filesList[fileGroupName], e.target.files);
        //    this.value = '';
        //    if (change && typeof (change) === "function")
        //        change(filesList[fileGroupName]);//change event
        //});

        return this.addClass("KYUpload");
    };
    function changeEvent(e) {
        filesList[fileGroupName] = [];
        filesList[fileGroupName].push.apply(filesList[fileGroupName], e.target.files);
        //IE不拿掉事件[this.value = '']會重複觸發change事件
        $(this).unbind("change", changeEvent);
        this.value = '';
        $(this).on("change", { e: this }, changeEvent);
        if (change && typeof (change) === "function")
            change(filesList[fileGroupName]);//change event
    }
    $.fn.KYUploadSend = function (options) {
        // object入參 預設{}
        var settings = $.extend({
            url: null,
            data: {},
            check: false,
            success: null,
            error: null,
            progress: null,

        }, options);
        if (settings.success)success = settings.success;
        if (settings.error) error = settings.error;
        if (settings.progress)progress = settings.progress;

        if (filesList.length == 0 && check)
            return this;

        //declare value
        var formData = new FormData();
        var url = settings.url;
        // 檔案
        Object.keys(filesList).map(function (objectKey, index) {
            var files = filesList[objectKey];
            for (var i = 0; i < files.length; i++) {
                formData.append("f_" + objectKey, files[i]);
            }
        });
        // 入參
        Object.keys(settings.data).map(function (objectKey, index) {
            var value = settings.data[objectKey];
            formData.append(objectKey, value);
        });
        $.ajax({
            url: url,
            method: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (msg) {
                if (showBar) $(progressDOM).find(".progressContent").addClass("uploadEnd").html("上傳成功!!");
                if (success && typeof (success) === "function")
                    success(msg);//success event
            },
            error: function (xhr) {
                if (showBar) $(progressDOM).find(".progressContent").addClass("uploadEnd").html("上傳失敗 ˊˋ");
                if (error && typeof (error) === "function")
                    error(xhr);//error event
            },
            xhr: function () {
                var xhr = $.ajaxSettings.xhr();
                if (onprogress && xhr.upload) {
                    xhr.upload.addEventListener("progress", onprogress, false);
                    return xhr;
                }
            }

        });
        return this;
    };
    var onprogress = function onprogress(evt) {
        if (showBar) {
            var loaded = evt.loaded;                  //已經上傳大小情况 
            var tot = evt.total;                      //附件總大小 
            var per = Math.floor(100 * loaded / tot);     //已經上傳的百分比  
            var bar = $(progressDOM).find(".progressContent");
            $(bar).html(per + "%").removeClass("uploadEnd");
            $(bar).css("width", per + "%");
            if (per == 100) {
                setTimeout(function () { $(bar).not(".uploadEnd").html("伺服器處理中請勿關閉視窗...") }, 1000);
            }
        }
        if (progress && typeof (progress) === "function")
            progress(evt);//progress event
}

    //幫你寫好 給檔案就可以傳了，事件觸發、檔案都用吃入參
    $.fn.KYUploadSendHelper = function (options) {
        // object入參 預設{}
        var settings = $.extend({
            url: null,
            data: {},
            success: null,
            error: null,
            progress: new function () { },
            filetype: [],
            check: false,
        }, options);

        if (this.length == 0 && check)
            return this;

        //declare value
        var formData = new FormData();
        var url = settings.url;
        // 檔案
        for (var i = 0; i < this.length; i++) {
            if (settings.filetype.length > 0 && settings.filetype.includes(getFileExtension(this[i].name)))
                formData.append("file", this[i]);
            else if (settings.filetype.length == 0)
                formData.append("file", this[i]);
        }
        // 入參
        Object.keys(settings.data).map(function (objectKey, index) {
            var value = settings.data[objectKey];
            formData.append(objectKey, value);
        });
        $.ajax({
            url: url,
            method: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (msg) {
                if (settings.success && typeof (settings.success) === "function")
                    settings.success(msg);
            },
            error: function (xhr) {
                if (settings.error && typeof (settings.error) === "function")
                    settings.error(xhr);
            },
            xhr: function () {
                var xhr = $.ajaxSettings.xhr();
                if (settings.progress && xhr.upload) {
                    xhr.upload.addEventListener("progress", settings.progress, false);
                    return xhr;
                }
            }

        });
        return this;
    };
    function getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
    }
    function getFileWithoutExtension(filename) {
        return filename.substr(0, (filename.lastIndexOf(".") - 1 >>> 0) + 1);
    }
}(jQuery));
    