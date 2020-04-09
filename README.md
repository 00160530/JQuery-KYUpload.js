# KYUpload.js
html5,fileupload,上傳檔案,進度條,ajax,MVC

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
