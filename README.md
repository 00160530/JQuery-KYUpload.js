# KYUpload.js
html5,fileupload,上傳檔案,進度條,ajax,MVC

# 現有功能
1.套用按鈕變成上傳元件

2.選擇檔案後觸發事件

3.上傳檔案時可附加json資料

4.不套用元件可直接把files上傳

PS.上傳的檔案在Sever端要用 "f_"+GroupName 接收

# 預計加入功能(開發日期未定)
1.可選擇檔案是否累積(A.onchange後刷掉 B.onchange後累積)

2.可指定選檔模式(A.單檔 B.多檔 C.資料夾)

3.限定選檔的副檔名

4.選檔後檢核副檔名

5.列出上傳的檔案

6.可分檔上傳或一次上傳，並跑進度條

# index.html範例
現有

1.套用

2.上傳檔案

3.顯示檔名

缺少

1.切換GroupName

2.顯示所有或指定GroupName檔名

3.清除所有或指定GroupName檔案

4.不透過套件的原件只做檔案上傳

# 使用說明
本套件一頁只能套用一個按鈕

請不要重複套用

適用chrome,IE10以上,Edge(僅在以上瀏覽器測試，其餘瀏覽器應該也可以用)

with jquery-3.2.1

# 參數說明：
change為選擇上傳路徑的事件

success,error,progress相對應為ajax事件

progressBar指定進度條容器，若不指定則長在上傳按鈕下面

showBar是否產生進度條，如果要自己設計進度條可以不生成

GroupName預設file，只能傳入string，可以依據不同檔案分類更換，會放入FormData的name，後台用來做檔案分類

check檢查是否有檔案，預設false，無檔案將不做任何動作，無法從回傳值知道是否有執行上傳，要能判斷請自己改

# 範例
你只需要在html上放一個button

    <button id="btn" type="button">upload</button>

套用：
    
    $("#btn").msUpload({
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
		var loaded = evt.loaded;//已經上傳大小情况 
		var tot = evt.total;//附件總大小 
		var per = Math.floor(100 * loaded / tot);//已經上傳的百分比  
    		//...
    	},
    	progressBar: $("#bar"),//指定進度條長在哪個div，不設定就長在按鈕後面
    	showBar: true,
    	GroupName: null,//預設為file
    });
上傳：
$("#btn").msUploadSend({ url: "/ProjectManage/PM_5_U002_save", data: { PK_ID: 123 }, check(檢查是否有檔案): false})
取得上傳檔案：
$("#btn").msUploadFiles()
現在的GroupName：
$("#btn").msUploadGroupName()
更換GroupName：
$("#btn").msUploadGroupName("newName")
清除檔案：
$("#btn").msUploadClearFiles()//clear all
$("#btn").msUploadClearFiles("GroupName")//clear one GroupName
不透過套件的原件只做檔案上傳:
$(input.files).msUploadSendHelper({url: "/ProjectManage/PM_5_U002_GetFileVersion",success: function (msg) {},error: function (xhr) {},filetype: ["exe", "dll"]})
------------------------------------------------------------------------------------------------
UpdateList
2020/04/09:1.修改Sample、UpdateList文字描述 2.修正IE上傳檔案時的錯誤(IE在清空上傳元件時會觸發change導致檔案被清空，改成清空元件時先去把change事件移除)
2019/11/06:修正msUploadSend沒設定事件參數會導致事件遺失的錯誤
2019/10/18:上傳時可以傳入除了change以外的事件複寫要觸發的function了
