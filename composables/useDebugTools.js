// 調試工具功能
import Swal from "sweetalert2";

export const useDebugTools = () => {
  const divinationStore = useDivinationStore();
  const auth = useAuth();
  const apiService = useApiService();

  // 清除轉運記錄 (用於測試)
  const clearPlayRecord = async () => {
    if (typeof window === "undefined") return;

    const udnmember = auth.getCookieValue("udnmember") || "";
    const storageKey = udnmember
      ? `fate2025_last_played_${udnmember}`
      : "fate2025_last_played";

    localStorage.removeItem(storageKey);

    // 重要：立即更新轉運狀態
    divinationStore.clearPlayRecord();
  };

  // 檢查資料庫狀態
  const debugCheckDatabase = async () => {
    try {
      const udnmember = auth.getCookieValue("udnmember") || "";
      const um2 = auth.getCookieValue("um2") || "";
      const isNewUser =
        localStorage.getItem(`fate2025_new_user_${udnmember}`) === "true";
      console.log(`是否為新用戶 (首次註冊當天): ${isNewUser}`);

      if (!udnmember) {
        Swal.fire({
          icon: "warning",
          title: "未登入",
          text: "請先登入以檢查資料庫記錄",
        });
        return;
      }

      // 顯示檢查中訊息
      Swal.fire({
        title: "檢查中...",
        text: "正在檢查資料庫記錄",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await apiService.fetchUserPlayData(udnmember, um2);

      console.log("API 回應:", response);

      // 顯示結果
      Swal.fire({
        icon: "info",
        title: "資料庫檢查結果",
        html: `
          <pre style="text-align: left; margin: 15px 0; padding: 10px; background: #f5f5f5; overflow: auto;">
         ${JSON.stringify(response, null, 2)}
          </pre>
        `,
      });
    } catch (error) {
      console.error("檢查資料庫時發生錯誤:", error);

      let errorMessage = "未知錯誤";

      if (error.response) {
        errorMessage = `服務器回應錯誤 (${error.response.status}): ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMessage = "無法連接到伺服器，請檢查網路連接或API是否可用";
      } else {
        errorMessage = `請求錯誤: ${error.message}`;
      }

      Swal.fire({
        icon: "error",
        title: "檢查失敗",
        text: errorMessage,
        confirmButtonText: "了解",
      });
    }
  };

  // 重置資料庫 - 刪除所有記錄並重置 ID
  const resetDatabase = async () => {
    if (typeof window === "undefined") return;

    const result = await Swal.fire({
      title: "確定要重置資料庫?",
      text: "這將刪除所有記錄並重置 ID！這個操作無法撤銷！",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "是，重置！",
      cancelButtonText: "取消",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiService.resetDatabase();

      if (response.status === "success") {
        Swal.fire({
          title: "重置成功",
          text: "資料庫已成功重置。",
          icon: "success",
          confirmButtonText: "確定",
        });

        localStorage.clear();

        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(response.message || "重置失敗");
      }
    } catch (error) {
      console.error("重置資料庫時發生錯誤:", error);
      Swal.fire({
        title: "重置失敗",
        text: `發生錯誤: ${error.message}`,
        icon: "error",
        confirmButtonText: "確定",
      });
    }
  };

  return {
    clearPlayRecord,
    debugCheckDatabase,
    resetDatabase,
  };
};

