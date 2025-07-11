self.onmessage = function (e) {
  const { records, filters, sortField, sortDirection } = e.data;

  // 篩選資料
  const filteredRecords = records.filter((record) => {
    // 用戶ID篩選
    if (
      filters.userId &&
      (!record.username ||
        !record.username.toLowerCase().includes(filters.userId.toLowerCase()))
    ) {
      return false;
    }

    // IP地址篩選
    if (
      filters.ip &&
      (!record.ip ||
        !record.ip.toLowerCase().includes(filters.ip.toLowerCase()))
    ) {
      return false;
    }

    // 占卜次數篩選
    if (filters.playTimes) {
      const playTimes = record.play_times_total || 0;
      switch (filters.playTimes) {
        case "1":
          if (playTimes !== 1) return false;
          break;
        case "2-4":
          if (playTimes < 2 || playTimes > 4) return false;
          break;
        case "5+":
          if (playTimes < 5) return false;
          break;
      }
    }

    return true;
  });

  // 排序資料
  filteredRecords.sort((a, b) => {
    const aVal = a[sortField] || "";
    const bVal = b[sortField] || "";

    // 數字類型的特殊處理
    if (sortField === "id" || sortField === "play_times_total") {
      const aNum = parseInt(aVal) || 0;
      const bNum = parseInt(bVal) || 0;
      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    }

    // 日期類型的特殊處理
    if (sortField === "updated_at" || sortField === "created_at") {
      const aDate = new Date(aVal);
      const bDate = new Date(bVal);
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
    }

    // 字符串比較
    const comparison = String(aVal).localeCompare(String(bVal));
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // 回傳處理後的資料
  self.postMessage({
    filteredRecords: filteredRecords,
  });
};
