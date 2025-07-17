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
          @input="debouncedFilter"
        />
      </div>
      <div class="filter-group">
        <label>IP地址：</label>
        <input
          type="text"
          v-model="filters.ip"
          placeholder="輸入IP地址"
          @input="debouncedFilter"
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
      <div class="filter-group">
        <label>每頁顯示：</label>
        <select v-model="pageSize" @change="changePageSize">
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
      </div>
    </div>

    <!-- 數據表格 -->
    <div class="data-table-container">
      <div class="table-header">
        <h2>占卜記錄</h2>
        <div class="pagination-info">
          顯示 {{ (currentPage - 1) * pageSize + 1 }} -
          {{ Math.min(currentPage * pageSize, filteredRecords.length) }}
          筆，共 {{ filteredRecords.length }} 筆記錄
        </div>
      </div>

      <!-- 虛擬滾動表格 -->
      <div class="virtual-table-container" ref="tableContainer">
        <table class="data-table">
          <thead>
            <tr>
              <th @click="sortBy('id')">
                ID <i :class="getSortIcon('id')"></i>
              </th>
              <th @click="sortBy('username')">
                用戶ID <i :class="getSortIcon('username')"></i>
              </th>
              <th @click="sortBy('email')">
                Email <i :class="getSortIcon('email')"></i>
              </th>
              <th @click="sortBy('ip')">
                IP地址 <i :class="getSortIcon('ip')"></i>
              </th>
              <th @click="sortBy('play_times_total')">
                累計次數 <i :class="getSortIcon('play_times_total')"></i>
              </th>
              <th @click="sortBy('updated_at')">
                最後占卜時間 <i :class="getSortIcon('updated_at')"></i>
              </th>
              <th @click="sortBy('created_at')">
                註冊時間 <i :class="getSortIcon('created_at')"></i>
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
                <button
                  @click="viewDetails(record)"
                  class="btn btn-sm btn-info"
                >
                  詳細
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 優化的分頁控制 -->
      <div class="pagination-controls">
        <div class="pagination-info">
          共 {{ totalPages }} 頁，{{ filteredRecords.length }} 筆記錄
        </div>
        <div class="pagination">
          <button
            @click="changePage(1)"
            :disabled="currentPage === 1"
            class="btn btn-secondary"
          >
            首頁
          </button>
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="btn btn-secondary"
          >
            上一頁
          </button>

          <!-- 頁碼輸入框 -->
          <div class="page-input-group">
            <input
              type="number"
              v-model.number="pageInput"
              @keyup.enter="goToPage"
              :min="1"
              :max="totalPages"
              class="page-input"
            />
            <span>/ {{ totalPages }}</span>
            <button @click="goToPage" class="btn btn-secondary btn-sm">
              跳轉
            </button>
          </div>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="btn btn-secondary"
          >
            下一頁
          </button>
          <button
            @click="changePage(totalPages)"
            :disabled="currentPage === totalPages"
            class="btn btn-secondary"
          >
            末頁
          </button>
        </div>
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
import { ref, computed, onMounted, watch, nextTick } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

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

// 優化的分頁狀態
const currentPage = ref(1);
const pageSize = ref(20);
const pageInput = ref(1);

// 排序和篩選狀態
const sortField = ref("id");
const sortDirection = ref("desc");
const filters = ref({
  userId: "",
  ip: "",
  playTimes: "",
});

// 彈窗狀態
const showDetailModal = ref(false);
const selectedRecord = ref(null);

// 計算屬性
const totalPages = computed(() =>
  Math.ceil(filteredRecords.value.length / pageSize.value),
);

const displayedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRecords.value.slice(start, end);
});

// 防抖函數
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

const debouncedFilter = debounce(applyFilters, 300);

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

// 優化的獲取記錄函數
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

      // 使用 Web Worker 來處理大量資料
      if (records.value.length > 1000) {
        processDataWithWorker();
      } else {
        filteredRecords.value = [...records.value];
        applySorting();
      }

      // 統計數據處理
      if (response.data.stats) {
        totalUsers.value = response.data.stats.totalUsers;
        totalDivinations.value = response.data.stats.totalDivinations;
        todayDivinations.value = response.data.stats.todayDivinations;
        activeUsers.value = response.data.stats.activeUsers;
      } else {
        updateStats();
      }
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

// 使用 Web Worker 處理大量資料
function processDataWithWorker() {
  const worker = new Worker("/workers/dataProcessor.js");

  worker.postMessage({
    records: records.value,
    filters: filters.value,
    sortField: sortField.value,
    sortDirection: sortDirection.value,
  });

  worker.onmessage = function (e) {
    filteredRecords.value = e.data.filteredRecords;
    worker.terminate();
  };
}

// 優化的篩選函數
function applyFilters() {
  const startTime = performance.now();

  // 使用更高效的篩選方法
  filteredRecords.value = records.value.filter((record) => {
    if (
      filters.value.userId &&
      (!record.username ||
        !record.username
          .toLowerCase()
          .includes(filters.value.userId.toLowerCase()))
    ) {
      return false;
    }

    if (
      filters.value.ip &&
      (!record.ip ||
        !record.ip.toLowerCase().includes(filters.value.ip.toLowerCase()))
    ) {
      return false;
    }

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

  const endTime = performance.now();
  console.log(`篩選耗時: ${endTime - startTime}ms`);

  currentPage.value = 1;
  pageInput.value = 1;
  applySorting();
}

// 優化的排序函數
function applySorting() {
  const startTime = performance.now();

  filteredRecords.value.sort((a, b) => {
    const aVal = a[sortField.value] || "";
    const bVal = b[sortField.value] || "";

    if (sortField.value === "id" || sortField.value === "play_times_total") {
      const aNum = parseInt(aVal) || 0;
      const bNum = parseInt(bVal) || 0;
      return sortDirection.value === "asc" ? aNum - bNum : bNum - aNum;
    }

    if (sortField.value === "updated_at" || sortField.value === "created_at") {
      const aDate = new Date(aVal);
      const bDate = new Date(bVal);
      return sortDirection.value === "asc" ? aDate - bDate : bDate - aDate;
    }

    const comparison = String(aVal).localeCompare(String(bVal));
    return sortDirection.value === "asc" ? comparison : -comparison;
  });

  const endTime = performance.now();
  console.log(`排序耗時: ${endTime - startTime}ms`);
}

// 優化的分頁函數
function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    pageInput.value = page;

    nextTick(() => {
      document.querySelector(".data-table-container").scrollIntoView({
        behavior: "smooth",
      });
    });
  }
}

function changePageSize() {
  currentPage.value = 1;
  pageInput.value = 1;
}

function goToPage() {
  if (pageInput.value >= 1 && pageInput.value <= totalPages.value) {
    changePage(pageInput.value);
  }
}

// 批量處理的匯出函數
async function exportData() {
  if (filteredRecords.value.length > 10000) {
    const result = await Swal.fire({
      title: "大量資料匯出",
      text: `即將匯出 ${filteredRecords.value.length} 筆資料，這可能需要較長時間。`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "繼續匯出",
      cancelButtonText: "取消",
    });

    if (!result.isConfirmed) return;
  }

  try {
    const progressSwal = Swal.fire({
      title: "正在匯出...",
      html: "進度: <b>0%</b>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const batchSize = 1000;
    let csvContent = "\uFEFF"; // BOM for UTF-8

    // 優化標題行，避免特殊字符
    const headers = [
      "ID",
      "用戶ID",
      "Email",
      "IP地址",
      "累計占卜次數",
      "最後占卜時間",
      "註冊時間",
    ];
    csvContent += headers.join(",") + "\n";

    for (let i = 0; i < filteredRecords.value.length; i += batchSize) {
      const batch = filteredRecords.value.slice(i, i + batchSize);

      batch.forEach((record) => {
        // 格式化時間字段，確保正確顯示
        const formatTimeForCsv = (dateString) => {
          if (!dateString) return "";
          try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            // 使用 ISO 格式的本地時間字符串
            return date.toLocaleString("zh-TW", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });
          } catch (error) {
            return dateString;
          }
        };

        const row = [
          record.id || "",
          record.username || "",
          record.email || "",
          record.ip || "",
          record.play_times_total || 0,
          formatTimeForCsv(record.updated_at),
          formatTimeForCsv(record.created_at),
        ];

        // 處理 CSV 字段，確保正確轉義
        const processedRow = row.map((field) => {
          const fieldStr = String(field);
          // 如果包含逗號、雙引號或換行符，需要用雙引號包裹
          if (
            fieldStr.includes(",") ||
            fieldStr.includes('"') ||
            fieldStr.includes("\n") ||
            fieldStr.includes("\r")
          ) {
            return `"${fieldStr.replace(/"/g, '""')}"`;
          }
          return fieldStr;
        });

        csvContent += processedRow.join(",") + "\n";
      });

      const progress = Math.round(
        ((i + batchSize) / filteredRecords.value.length) * 100,
      );
      Swal.update({
        html: `進度: <b>${Math.min(progress, 100)}%</b>`,
      });

      // 讓 UI 有時間更新
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // 創建並下載文件
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // 生成包含時間戳的文件名
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    link.setAttribute("download", `占卜記錄_${timestamp}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    progressSwal.close();

    Swal.fire({
      icon: "success",
      title: "匯出成功",
      text: `已匯出 ${filteredRecords.value.length} 筆資料`,
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("匯出錯誤:", error);
    Swal.fire({
      icon: "error",
      title: "匯出失敗",
      text: error.message,
    });
  }
}

// 監聽器
watch(pageInput, (newVal) => {
  if (newVal > totalPages.value) {
    pageInput.value = totalPages.value;
  } else if (newVal < 1) {
    pageInput.value = 1;
  }
});

// 其他現有函數保持不變
function sortBy(field) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDirection.value = "asc";
  }
  applySorting();
}

function getSortIcon(field) {
  if (sortField.value !== field) return "fas fa-sort";
  return sortDirection.value === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
}

function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (error) {
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

function updateStats() {
  totalUsers.value = records.value.length;
  totalDivinations.value = records.value.reduce(
    (sum, record) => sum + (record.play_times_total || 0),
    0,
  );

  const today = new Date().toISOString().split("T")[0];
  todayDivinations.value = records.value.filter((record) => {
    if (!record.updated_at) return false;
    const recordDate = record.updated_at.split(" ")[0];
    return recordDate === today;
  }).length;

  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekDate = lastWeek.toISOString().split("T")[0];
  activeUsers.value = records.value.filter((record) => {
    if (!record.updated_at) return false;
    const recordDate = record.updated_at.split(" ")[0];
    return recordDate >= lastWeekDate;
  }).length;
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

onMounted(() => {
  fetchRecords();
});
</script>

<style lang="scss" scoped>
@use "sass:color";

$primary-purple: rgb(109, 39, 234);
$light-purple: color.adjust($primary-purple, $lightness: 10%);
$dark-purple: color.adjust($primary-purple, $lightness: -10%);
$purple-bg: color.adjust($primary-purple, $lightness: 45%);
$accent-purple: rgba(109, 39, 234, 0.1);

.admin-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  min-height: 100vh;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
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

// 按鈕樣式
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
  text-decoration: none;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.5;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(109, 39, 234, 0.2);
  }

  &.btn-primary {
    background: linear-gradient(135deg, $primary-purple 0%, $light-purple 100%);
    color: white;
    border: 1px solid $primary-purple;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(109, 39, 234, 0.3);
      background: linear-gradient(
        135deg,
        $dark-purple 0%,
        $primary-purple 100%
      );
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(109, 39, 234, 0.2);
    }
  }

  &.btn-secondary {
    background: #f8f9fa;
    color: #666;
    border: 1px solid #e0e0e0;

    &:hover {
      background: #e9ecef;
      border-color: #ccc;
      color: #333;
    }

    &:active {
      background: #dee2e6;
    }
  }

  &.btn-success {
    background: linear-gradient(135deg, #28a745 0%, #34ce57 100%);
    color: white;
    border: 1px solid #28a745;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
      background: linear-gradient(135deg, #218838 0%, #28a745 100%);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
    }
  }

  &.btn-info {
    background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%);
    color: white;
    border: 1px solid #17a2b8;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
      background: linear-gradient(135deg, #138496 0%, #17a2b8 100%);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(23, 162, 184, 0.2);
    }
  }

  &.btn-warning {
    background: linear-gradient(135deg, #ffc107 0%, #ffca2c 100%);
    color: #212529;
    border: 1px solid #ffc107;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
      background: linear-gradient(135deg, #e0a800 0%, #ffc107 100%);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
    }
  }

  &.btn-danger {
    background: linear-gradient(135deg, #dc3545 0%, #e85d75 100%);
    color: white;
    border: 1px solid #dc3545;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
      background: linear-gradient(135deg, #c82333 0%, #dc3545 100%);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
    }
  }

  &.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 6px;
  }

  &.btn-lg {
    padding: 12px 24px;
    font-size: 16px;
    border-radius: 10px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;

    &:hover {
      transform: none;
      box-shadow: none;
    }
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

.data-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px 8px;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
    word-wrap: break-word;
    overflow: hidden;
  }

  th {
    background: #f8f6ff;
    font-weight: 600;
    color: $primary-purple;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease;

    &:hover {
      background: color.adjust($purple-bg, $lightness: 5%);
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

  table-layout: fixed;

  th:nth-child(1) {
    width: 60px;
  }
  th:nth-child(2) {
    width: 180px;
  }
  th:nth-child(3) {
    width: 220px;
  }
  th:nth-child(4) {
    width: 130px;
  }
  th:nth-child(5) {
    width: 90px;
  }
  th:nth-child(6) {
    width: 140px;
  }
  th:nth-child(7) {
    width: 140px;
  }
  th:nth-child(8) {
    width: 80px;
  }
}

.data-table {
  td {
    &:nth-child(2),
    &:nth-child(3) {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;

      &:hover {
        white-space: normal;
        word-break: break-all;
        overflow: visible;
        position: relative;
        z-index: 10;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        padding: 12px;
        max-width: 300px;
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

.virtual-table-container {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
}

.pagination-controls {
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;

  .pagination-info {
    color: #6c757d;
    font-size: 14px;
  }

  .pagination {
    display: flex;
    align-items: center;
    gap: 10px;

    .page-input-group {
      display: flex;
      align-items: center;
      gap: 5px;

      .page-input {
        width: 60px;
        padding: 5px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        text-align: center;
      }

      span {
        color: #6c757d;
        font-size: 14px;
      }
    }
  }
}

// 徽章樣式
.play-count-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;

  &.low {
    background: #e3f2fd;
    color: #1976d2;
  }

  &.medium {
    background: #fff3e0;
    color: #f57c00;
  }

  &.high {
    background: #ffebee;
    color: #d32f2f;
  }
}

// 彈窗樣式
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
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;

      &:hover {
        opacity: 0.7;
        background: rgba(255, 255, 255, 0.1);
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

    .play-count-badge {
      margin-left: auto;
      margin-right: auto;
      display: block;
      text-align: center;
      min-width: 60px;
    }
  }
}

// 載入動畫
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
    font-size: 11px;
    min-width: 800px;

    th,
    td {
      padding: 8px 4px;
    }

    th:nth-child(1) {
      width: 50px;
    }
    th:nth-child(2) {
      width: 160px;
    }
    th:nth-child(3) {
      width: 200px;
    }
    th:nth-child(4) {
      width: 120px;
    }
    th:nth-child(5) {
      width: 80px;
    }
    th:nth-child(6) {
      width: 130px;
    }
    th:nth-child(7) {
      width: 130px;
    }
    th:nth-child(8) {
      width: 70px;
    }
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .pagination-controls {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .virtual-table-container {
    max-height: 400px;
  }
}

@media (max-width: 1200px) {
  .data-table {
    th,
    td {
      font-size: 13px;
    }
  }
}

@media (min-width: 1400px) {
  .data-table {
    th:nth-child(1) {
      width: 80px;
    }
    th:nth-child(2) {
      width: 200px;
    }
    th:nth-child(3) {
      width: 250px;
    }
    th:nth-child(4) {
      width: 140px;
    }
    th:nth-child(5) {
      width: 100px;
    }
    th:nth-child(6) {
      width: 160px;
    }
    th:nth-child(7) {
      width: 160px;
    }
    th:nth-child(8) {
      width: 90px;
    }
  }
}
</style>
