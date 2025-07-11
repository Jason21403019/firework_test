<template>
  <div class="admin-container">
    <!-- 頁面標題 -->
    <div class="admin-header">
      <h1>占卜活動後台管理</h1>
      <div class="header-actions">
        <button @click="refreshData" class="btn btn-primary">重新整理</button>
        <button @click="exportData" class="btn btn-success">匯出資料</button>
      </div>
    </div>

    <!-- 統計面板 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ totalUsers }}</div>
        <div class="stat-label">總用戶數</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ totalDivinations }}</div>
        <div class="stat-label">總占卜次數</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ todayDivinations }}</div>
        <div class="stat-label">今日占卜次數</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ activeUsers }}</div>
        <div class="stat-label">活躍用戶</div>
      </div>
    </div>

    <!-- 篩選控制 -->
    <div class="filter-panel">
      <div class="filter-group">
        <label>用戶ID：</label>
        <input
          type="text"
          v-model="filters.userId"
          placeholder="輸入用戶ID"
          @input="applyFilters"
        />
      </div>
      <div class="filter-group">
        <label>IP地址：</label>
        <input
          type="text"
          v-model="filters.ip"
          placeholder="輸入IP地址"
          @input="applyFilters"
        />
      </div>
      <div class="filter-group">
        <label>占卜次數：</label>
        <select v-model="filters.playTimes" @change="applyFilters">
          <option value="">全部</option>
          <option value="1">1次</option>
          <option value="2-4">2-4次</option>
          <option value="5+">5次以上</option>
        </select>
      </div>
    </div>

    <!-- 數據表格 -->
    <div class="data-table-container">
      <div class="table-header">
        <h2>占卜記錄</h2>
        <div class="pagination-info">
          顯示 {{ (currentPage - 1) * pageSize + 1 }} -
          {{ Math.min(currentPage * pageSize, totalRecords) }}
          筆，共 {{ totalRecords }} 筆記錄
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th @click="sortBy('id')">
              ID
              <i :class="getSortIcon('id')"></i>
            </th>
            <th @click="sortBy('username')">
              用戶ID
              <i :class="getSortIcon('username')"></i>
            </th>
            <th @click="sortBy('email')">
              Email
              <i :class="getSortIcon('email')"></i>
            </th>
            <th @click="sortBy('ip')">
              IP地址
              <i :class="getSortIcon('ip')"></i>
            </th>
            <th @click="sortBy('play_times_total')">
              累計次數
              <i :class="getSortIcon('play_times_total')"></i>
            </th>
            <th @click="sortBy('updated_at')">
              最後占卜時間
              <i :class="getSortIcon('updated_at')"></i>
            </th>
            <th @click="sortBy('created_at')">
              註冊時間
              <i :class="getSortIcon('created_at')"></i>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in displayedRecords" :key="record.id">
            <td>{{ record.id }}</td>
            <td>{{ record.username }}</td>
            <td>{{ record.email }}</td>
            <td>{{ record.ip || "-" }}</td>
            <td>
              <span
                class="play-count-badge"
                :class="getPlayCountClass(record.play_times_total)"
              >
                {{ record.play_times_total }}
              </span>
            </td>
            <td>{{ formatDate(record.updated_at) }}</td>
            <td>{{ formatDate(record.created_at) }}</td>
            <td>
              <button @click="viewDetails(record)" class="btn btn-sm btn-info">
                詳細
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分頁控制 -->
      <div class="pagination">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="btn btn-secondary"
        >
          上一頁
        </button>
        <span class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="changePage(page)"
            :class="[
              'btn',
              page === currentPage ? 'btn-primary' : 'btn-secondary',
            ]"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </span>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="btn btn-secondary"
        >
          下一頁
        </button>
      </div>
    </div>

    <!-- 詳細資訊彈窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>用戶詳細資訊</h3>
          <button @click="closeDetailModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>用戶ID：</label>
              <span>{{ selectedRecord?.username }}</span>
            </div>
            <div class="detail-item">
              <label>Email：</label>
              <span>{{ selectedRecord?.email }}</span>
            </div>
            <div class="detail-item">
              <label>IP地址：</label>
              <span>{{ selectedRecord?.ip || "-" }}</span>
            </div>
            <div class="detail-item">
              <label>累計占卜次數：</label>
              <span
                class="play-count-badge"
                :class="getPlayCountClass(selectedRecord?.play_times_total)"
              >
                {{ selectedRecord?.play_times_total }}
              </span>
            </div>
            <div class="detail-item">
              <label>最後占卜時間：</label>
              <span>{{ formatDate(selectedRecord?.updated_at) }}</span>
            </div>
            <div class="detail-item">
              <label>註冊時間：</label>
              <span>{{ formatDate(selectedRecord?.created_at) }}</span>
            </div>
            <div class="detail-item">
              <label>更新時間：</label>
              <span>{{ formatDate(selectedRecord?.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 載入中遮罩 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

// 設定頁面標題和meta
useSeoMeta({
  title: "占卜活動後台管理",
  description: "占卜活動後台管理系統",
});

// 基本狀態
const loading = ref(false);
const records = ref([]);
const filteredRecords = ref([]);

// 統計數據
const totalUsers = ref(0);
const totalDivinations = ref(0);
const todayDivinations = ref(0);
const activeUsers = ref(0);

// 分頁
const currentPage = ref(1);
const pageSize = ref(20);
const totalRecords = computed(() => filteredRecords.value.length);
const totalPages = computed(() =>
  Math.ceil(totalRecords.value / pageSize.value),
);

// 排序
const sortField = ref("id");
const sortDirection = ref("desc");

// 篩選 - 加入 IP 篩選
const filters = ref({
  userId: "",
  ip: "",
  playTimes: "",
});

// 彈窗狀態
const showDetailModal = ref(false);
const selectedRecord = ref(null);

// 計算屬性
const displayedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRecords.value.slice(start, end);
});

const visiblePages = computed(() => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (
    let i = Math.max(2, currentPage.value - delta);
    i <= Math.min(totalPages.value - 1, currentPage.value + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage.value - delta > 2) {
    rangeWithDots.push(1, "...");
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (currentPage.value + delta < totalPages.value - 1) {
    rangeWithDots.push("...", totalPages.value);
  } else {
    rangeWithDots.push(totalPages.value);
  }

  return rangeWithDots.filter((v, i, a) => a.indexOf(v) === i);
});

// 方法
const config = useRuntimeConfig();

function getApiUrl(endpoint) {
  const baseUrl = (() => {
    if (config.public.domain?.includes("lab-event")) {
      return "https://lab-event.udn.com/bd_fate2025_test/fate2025php";
    } else if (config.public.domain?.includes("event.udn")) {
      return "https://event.udn.com/bd_fate2025/fate2025php";
    } else {
      return "https://lab-event.udn.com/bd_fate2025_test/fate2025php";
    }
  })();

  return `${baseUrl}/${endpoint}`;
}

async function fetchRecords() {
  loading.value = true;
  try {
    const response = await axios.post(
      getApiUrl("checkPlayStatus.php"),
      {
        admin_mode: true,
      },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      },
    );

    if (response.data.status === "success") {
      if (Array.isArray(response.data.records)) {
        records.value = response.data.records;
      } else {
        records.value = [response.data];
      }

      // 除錯：顯示原始資料
      console.log("API 回傳資料:", response.data);
      console.log("處理後記錄:", records.value);

      filteredRecords.value = [...records.value];

      // 使用 PHP 端計算的統計數據
      if (response.data.stats) {
        totalUsers.value = response.data.stats.totalUsers;
        totalDivinations.value = response.data.stats.totalDivinations;
        todayDivinations.value = response.data.stats.todayDivinations;
        activeUsers.value = response.data.stats.activeUsers;

        console.log("PHP 端統計數據:", response.data.stats);
      } else {
        // 如果沒有統計數據，使用前端計算（備用）
        updateStats();
      }

      applySorting();
    } else {
      throw new Error(response.data.message || "獲取資料失敗");
    }
  } catch (error) {
    console.error("獲取記錄失敗:", error);
    Swal.fire({
      icon: "error",
      title: "獲取資料失敗",
      text: error.message,
    });
  } finally {
    loading.value = false;
  }
}

// 保留原有的 updateStats 函數作為備用
function updateStats() {
  totalUsers.value = records.value.length;
  totalDivinations.value = records.value.reduce(
    (sum, record) => sum + (record.play_times_total || 0),
    0,
  );

  // 修正今日占卜次數統計
  const today = new Date().toISOString().split("T")[0]; // 格式：YYYY-MM-DD
  console.log("今天日期:", today);

  todayDivinations.value = records.value.filter((record) => {
    if (!record.updated_at) return false;

    // 提取日期部分進行比較
    const recordDate = record.updated_at.split(" ")[0]; // 取得日期部分
    console.log("記錄日期:", recordDate, "今天:", today);

    return recordDate === today;
  }).length;

  console.log("今日占卜次數:", todayDivinations.value);

  // 修正活躍用戶計算（最近7天內有占卜記錄的用戶）
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekDate = lastWeek.toISOString().split("T")[0];

  activeUsers.value = records.value.filter((record) => {
    if (!record.updated_at) return false;

    const recordDate = record.updated_at.split(" ")[0];
    return recordDate >= lastWeekDate;
  }).length;

  console.log("活躍用戶數:", activeUsers.value);
}

// 簡化後的篩選函數 - 加入 IP 篩選
function applyFilters() {
  filteredRecords.value = records.value.filter((record) => {
    // 用戶ID篩選
    if (filters.value.userId) {
      if (
        !record.username ||
        !record.username
          .toLowerCase()
          .includes(filters.value.userId.toLowerCase())
      ) {
        return false;
      }
    }

    // IP地址篩選
    if (filters.value.ip) {
      if (
        !record.ip ||
        !record.ip.toLowerCase().includes(filters.value.ip.toLowerCase())
      ) {
        return false;
      }
    }

    // 占卜次數篩選
    if (filters.value.playTimes) {
      const playTimes = record.play_times_total || 0;
      switch (filters.value.playTimes) {
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

  currentPage.value = 1;
  applySorting();
}

function sortBy(field) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDirection.value = "asc";
  }
  applySorting();
}

function applySorting() {
  filteredRecords.value.sort((a, b) => {
    const aVal = a[sortField.value] || "";
    const bVal = b[sortField.value] || "";

    if (aVal < bVal) return sortDirection.value === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection.value === "asc" ? 1 : -1;
    return 0;
  });
}

function getSortIcon(field) {
  if (sortField.value !== field) return "fas fa-sort";
  return sortDirection.value === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
}

function changePage(page) {
  if (page >= 1 && page <= totalPages.value && page !== "...") {
    currentPage.value = page;
  }
}

function formatDate(dateString) {
  if (!dateString) return "-";

  try {
    let date;
    if (dateString.includes(" ")) {
      date = new Date(dateString);
    } else {
      date = new Date(dateString + " 00:00:00");
    }

    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (error) {
    console.error("日期格式化錯誤:", error);
    return dateString;
  }
}

function getPlayCountClass(count) {
  if (count >= 5) return "high";
  if (count >= 2) return "medium";
  return "low";
}

function viewDetails(record) {
  selectedRecord.value = record;
  showDetailModal.value = true;
}

function closeDetailModal() {
  showDetailModal.value = false;
  selectedRecord.value = null;
}

async function refreshData() {
  await fetchRecords();
  Swal.fire({
    icon: "success",
    title: "資料已更新",
    text: "最新資料已載入",
    timer: 1500,
    showConfirmButton: false,
  });
}

async function exportData() {
  try {
    const csvContent = generateCSV(filteredRecords.value);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `占卜記錄_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    Swal.fire({
      icon: "success",
      title: "匯出成功",
      text: "資料已下載",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("匯出失敗:", error);
    Swal.fire({
      icon: "error",
      title: "匯出失敗",
      text: "無法匯出資料",
    });
  }
}

// 修正 CSV 匯出功能 - 加入 IP 欄位
function generateCSV(data) {
  const headers = [
    "ID",
    "用戶ID",
    "Email",
    "IP地址",
    "累計占卜次數",
    "最後占卜時間",
    "註冊時間",
    "更新時間",
  ];
  const csvRows = [];

  csvRows.push(headers.join(","));

  data.forEach((record) => {
    const row = [
      record.id || "",
      record.username || "",
      record.email || "",
      record.ip || "",
      record.play_times_total || 0,
      record.updated_at || "",
      record.created_at || "",
      record.updated_at || "",
    ];
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
}

// 修正除錯功能 - 加入 IP 欄位
function debugData() {
  console.log("所有記錄:", records.value);
  console.log("今天日期:", new Date().toISOString().split("T")[0]);

  records.value.forEach((record, index) => {
    console.log(`記錄 ${index + 1}:`, {
      id: record.id,
      username: record.username,
      email: record.email,
      ip: record.ip,
      updated_at: record.updated_at,
      created_at: record.created_at,
      play_times_total: record.play_times_total,
    });
  });
}

// 移除日期初始化相關的邏輯
onMounted(() => {
  fetchRecords();

  // 加入除錯按鈕（開發時使用）
  if (process.env.NODE_ENV === "development") {
    window.debugAdminData = debugData;
    console.log("除錯功能已啟用，請在控制台輸入 debugAdminData() 查看資料");
  }
});
</script>

<style lang="scss" scoped>
// 定義主要的紫色系顏色變數
$primary-purple: rgb(109, 39, 234);
$light-purple: lighten($primary-purple, 10%);
$dark-purple: darken($primary-purple, 10%);
$purple-bg: lighten($primary-purple, 45%);
$accent-purple: rgba(109, 39, 234, 0.1);

.admin-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, $purple-bg 0%, #f8f6ff 100%);
  min-height: 100vh;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 25px 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(109, 39, 234, 0.1);
  border-left: 5px solid $primary-purple;

  h1 {
    margin: 0;
    color: $primary-purple;
    font-size: 28px;
    font-weight: 700;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  .stat-card {
    background: white;
    padding: 25px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(109, 39, 234, 0.1);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    border-top: 4px solid $primary-purple;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(109, 39, 234, 0.15);
    }

    .stat-number {
      font-size: 36px;
      font-weight: 700;
      color: $primary-purple;
      margin-bottom: 8px;
    }

    .stat-label {
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.filter-panel {
  background: white;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(109, 39, 234, 0.1);
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
  align-items: end;

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-weight: 600;
      color: $primary-purple;
      font-size: 14px;
    }

    input,
    select {
      padding: 10px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s ease;

      &:focus {
        outline: none;
        border-color: $primary-purple;
        box-shadow: 0 0 0 3px rgba(109, 39, 234, 0.1);
      }
    }
  }
}

.data-table-container {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(109, 39, 234, 0.1);
  overflow: hidden;

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px;
    background: linear-gradient(135deg, $primary-purple 0%, $light-purple 100%);
    color: white;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .pagination-info {
      font-size: 14px;
      opacity: 0.9;
    }
  }
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px 8px; // 稍微減少padding以容納更多欄位
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }

  th {
    background: #f8f6ff;
    font-weight: 600;
    color: $primary-purple;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease;

    &:hover {
      background: lighten($purple-bg, 5%);
    }

    i {
      margin-left: 8px;
      opacity: 0.7;
      color: $primary-purple;
    }
  }

  tr:nth-child(even) {
    background: #fafafa;
  }

  tr:hover {
    background: $accent-purple;
  }
}

.play-count-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;

  &.low {
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  }

  &.medium {
    background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
  }

  &.high {
    background: linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%);
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 25px;
  gap: 8px;

  .page-numbers {
    display: flex;
    gap: 5px;
  }
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &.btn-primary {
    background: linear-gradient(135deg, $primary-purple 0%, $light-purple 100%);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(109, 39, 234, 0.3);
    }
  }

  &.btn-secondary {
    background: #f8f9fa;
    color: #666;
    border: 1px solid #e0e0e0;

    &:hover {
      background: #e9ecef;
      border-color: #ccc;
    }
  }

  &.btn-success {
    background: linear-gradient(135deg, #28a745 0%, #34ce57 100%);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }
  }

  &.btn-info {
    background: linear-gradient(135deg, $primary-purple 0%, $light-purple 100%);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(109, 39, 234, 0.3);
    }
  }

  &.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(109, 39, 234, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(109, 39, 234, 0.3);

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px;
    background: linear-gradient(135deg, $primary-purple 0%, $light-purple 100%);
    color: white;
    border-radius: 15px 15px 0 0;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: white;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 0.7;
      }
    }
  }

  .modal-body {
    padding: 25px;
  }
}

.detail-grid {
  display: grid;
  gap: 20px;

  .detail-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: #f8f6ff;
    border-radius: 8px;
    border-left: 4px solid $primary-purple;

    label {
      font-weight: 600;
      color: $primary-purple;
      min-width: 140px;
    }

    span {
      color: #555;
      font-weight: 500;
    }

    // 特別針對包含 play-count-badge 的項目進行置中
    .play-count-badge {
      margin-left: auto;
      margin-right: auto;
      display: block;
      text-align: center;
      min-width: 60px;
    }
  }
}

// 或者，您也可以使用這個更精確的方式，只針對累計占卜次數這個項目
.detail-item:has(.play-count-badge) {
  justify-content: space-between;

  span {
    flex: 1;
    display: flex;
    justify-content: center;
  }
}

// 如果上面的 :has() 選擇器不被支援，可以使用這個替代方案
.detail-item {
  &:nth-child(4) {
    // 假設累計占卜次數是第4個項目
    justify-content: space-between;

    span {
      flex: 1;
      display: flex;
      justify-content: center;
    }
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  backdrop-filter: blur(4px);

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid $primary-purple;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    margin-top: 15px;
    color: $primary-purple;
    font-weight: 600;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 響應式設計
@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .filter-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .data-table {
    font-size: 11px; // 在手機上使用更小字體

    th,
    td {
      padding: 8px 4px;
    }
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

// 更大螢幕的響應式調整
@media (max-width: 1200px) {
  .data-table {
    th,
    td {
      font-size: 13px;
    }
  }
}
</style>
