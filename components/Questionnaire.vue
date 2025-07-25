<template>
  <div class="questionnaire" v-if="isVisible">
    <div class="questionnaire__wrapper">
      <!-- 問卷標題 -->
      <div class="questionnaire__header">
        <h2 class="questionnaire__title">寵物飼主調查問卷</h2>
        <p class="questionnaire__subtitle">
          感謝您參與我們的問卷調查，您的意見對我們非常重要
        </p>
      </div>

      <!-- 問卷表單 -->
      <form @submit.prevent="submitQuestionnaire" class="questionnaire__form">
        <div class="questionnaire__questions">
          <div
            v-for="(question, index) in allQuestionsWithStatus"
            :key="question.id"
            class="question"
            :class="{
              'question--error': hasError(question.id),
              'question--disabled': question.isSkipped,
            }"
          >
            <!-- 分類標題 -->
            <div v-if="question.category" class="question__category">
              {{ question.category }}
            </div>

            <!-- 跳過提示 -->
            <div v-if="question.isSkipped" class="question__skip">
              <span class="question__skip-text">此題目已跳過</span>
            </div>

            <!-- 題目標題 -->
            <div class="question__header">
              <h3 class="question__title">
                {{ index + 1 }}. {{ question.text }}
                <span
                  v-if="question.required && !question.isSkipped"
                  class="question__required"
                  >*</span
                >
              </h3>
            </div>

            <!-- 選項區域 -->
            <div class="question__options">
              <!-- 單選題 -->
              <div v-if="question.type === 'single'" class="options">
                <label
                  v-for="option in question.options"
                  :key="option.value"
                  class="option"
                  :class="{
                    'option--selected': answers[question.id] === option.value,
                    'option--disabled': question.isSkipped,
                  }"
                >
                  <input
                    type="radio"
                    :name="`question_${question.id}`"
                    :value="option.value"
                    v-model="answers[question.id]"
                    @change="handleAnswerChange(question.id, option.value)"
                    :disabled="question.isSkipped"
                    class="option__input"
                  />
                  <span class="option__text">{{ option.text }}</span>
                </label>
              </div>

              <!-- 多選題 -->
              <div v-else-if="question.type === 'multiple'" class="options">
                <label
                  v-for="option in question.options"
                  :key="option.value"
                  class="option option--checkbox"
                  :class="{
                    'option--selected': isOptionSelected(
                      question.id,
                      option.value,
                    ),
                    'option--disabled': question.isSkipped,
                  }"
                >
                  <input
                    type="checkbox"
                    :value="option.value"
                    v-model="answers[question.id]"
                    @change="handleMultipleAnswerChange(question.id)"
                    :disabled="question.isSkipped"
                    class="option__input option__input--checkbox"
                  />
                  <span class="option__text">{{ option.text }}</span>
                </label>
              </div>
            </div>

            <!-- 錯誤提示 -->
            <div v-if="hasError(question.id)" class="question__error">
              {{ getErrorMessage(question.id) }}
            </div>
          </div>
        </div>

        <!-- 提交按鈕區域 -->
        <div class="questionnaire__footer">
          <div class="questionnaire__info">
            <p class="questionnaire__note">
              <span class="questionnaire__required">*</span> 為必填項目
            </p>
            <p class="questionnaire__privacy">
              我們將嚴格保護您的隱私，問卷資料僅用於研究分析
            </p>
          </div>

          <button
            type="submit"
            class="questionnaire__submit"
            :disabled="isSubmitting || !canSubmit"
            :class="{ 'questionnaire__submit--loading': isSubmitting }"
          >
            <span v-if="!isSubmitting">提交問卷</span>
            <span v-else class="questionnaire__loading">
              <span class="questionnaire__spinner"></span>
              提交中...
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: true,
  },
});

// Emits
const emit = defineEmits(["questionnaire-completed"]);

// 響應式數據
const answers = ref({});
const errors = ref({});
const isSubmitting = ref(false);

// 問卷題目數據
const questions = ref([
  // Part.1 飼主基本資訊
  {
    id: 1,
    category: "Part.1 飼主基本資訊",
    text: "您家毛孩是？",
    type: "single",
    required: true,
    options: [
      { value: 1, text: "狗狗" },
      { value: 2, text: "貓咪" },
      { value: 3, text: "狗貓都有" },
      { value: 4, text: "特寵（兔、鳥、鼠、爬蟲類等）" },
    ],
  },
  {
    id: 2,
    text: "您所飼養的寵物隻數？",
    type: "single",
    required: true,
    options: [
      { value: 1, text: "1隻" },
      { value: 2, text: "2隻" },
      { value: 3, text: "3隻" },
      { value: 4, text: "4隻(含)以上" },
    ],
  },
  {
    id: 3,
    text: "您所飼養的寵物年齡為？（可複選）",
    type: "multiple",
    required: true,
    options: [
      { value: 1, text: "0-1歲" },
      { value: 2, text: "1-7歲" },
      { value: 3, text: "7歲以上" },
    ],
  },
  // Part.2 飼主消費習慣
  {
    id: 4,
    category: "Part.2 飼主消費習慣",
    text: "您平均一個月花多少錢在寵物身上？",
    type: "single",
    required: true,
    options: [
      { value: 1, text: "1000元以下" },
      { value: 2, text: "1001-3000元" },
      { value: 3, text: "3001-5000元" },
      { value: 4, text: "5001-10000元" },
      { value: 5, text: "10000元以上" },
    ],
  },
  {
    id: 5,
    text: "您通常在哪些管道購買寵物用品？（可複選）",
    type: "multiple",
    required: true,
    options: [
      { value: 1, text: "寵物實體商店" },
      { value: 2, text: "網路電商平台" },
      { value: 3, text: "超市／量販店／生活百貨" },
      { value: 4, text: "動物醫院售出的商品" },
      { value: 5, text: "寵物展" },
      { value: 6, text: "其他（請說明）" },
    ],
  },
  {
    id: 6,
    text: "您最常購買的貓咪用品類型是？（可複選）",
    type: "multiple",
    required: true,
    options: [
      { value: 1, text: "寵物乾糧" },
      { value: 2, text: "寵物濕糧" },
      { value: 3, text: "寵物零食" },
      { value: 4, text: "寵物居家用品（如貓砂、砂盆、食器、提籠等）" },
      { value: 5, text: "清潔美容用品（洗毛精、指甲剪、毛梳等）" },
      { value: 6, text: "娛樂與玩具（如服飾配件、逗貓棒、跳台、抓板等）" },
      { value: 7, text: "醫療與健康檢查" },
      { value: 8, text: "營養保健食品與藥物" },
      {
        value: 9,
        text: "智能家電（如自動餵食機、自動飲水機、自動貓砂機、寵物攝影機等）",
      },
      { value: 10, text: "寵物保險" },
      { value: 11, text: "寵物美容" },
      { value: 12, text: "寵物旅館" },
      { value: 13, text: "其他（請說明）" },
    ],
    skipIf: { questionId: 1, answerValues: [1, 4] }, // 如果選狗狗或特寵則跳過
  },
  {
    id: 7,
    text: "您最常購買的狗狗用品類型是？（可複選）",
    type: "multiple",
    required: true,
    options: [
      { value: 1, text: "寵物乾糧" },
      { value: 2, text: "寵物濕糧" },
      { value: 3, text: "寵物零食、潔牙骨" },
      { value: 4, text: "寵物居家用品（如狗窩、食器、牽繩、寵物推車等）" },
      { value: 5, text: "清潔美容用品（如洗毛精、潔耳液、毛梳等）" },
      { value: 6, text: "娛樂與玩具（如服飾配件、藏食玩具等）" },
      { value: 7, text: "醫療與健康檢查" },
      { value: 8, text: "營養保健食品與藥物" },
      { value: 9, text: "智能家電（如自動餵食機、自動飲水機、寵物攝影機等）" },
      { value: 10, text: "寵物保險" },
      { value: 11, text: "寵物美容" },
      { value: 12, text: "寵物旅館" },
      { value: 13, text: "其他（請說明）" },
    ],
    skipIf: { questionId: 1, answerValues: [2, 4] }, // 如果選貓咪或特寵則跳過
  },
  {
    id: 8,
    text: "選購寵物產品時，您最重視的因素是？（可複選）",
    type: "multiple",
    required: true,
    options: [
      { value: 1, text: "價格" },
      { value: 2, text: "品質／成分" },
      { value: 3, text: "品牌知名度" },
      { value: 4, text: "好評／網路推薦" },
      { value: 5, text: "國產或進口來源" },
      { value: 6, text: "包裝設計" },
      { value: 7, text: "寵物喜好" },
      { value: 8, text: "其他（請說明）" },
    ],
  },
  {
    id: 9,
    text: "什麼因素會影響您嘗試購買新的產品給毛孩？（可複選）",
    type: "multiple",
    required: true,
    options: [
      { value: 1, text: "獸醫、專業人士推薦" },
      { value: 2, text: "名人、網紅推薦" },
      { value: 3, text: "新聞媒體報導" },
      { value: 4, text: "親友推薦" },
      { value: 5, text: "促銷優惠" },
      { value: 6, text: "其他（請說明）" },
    ],
  },
  // Part.3 寵物保健食品
  {
    id: 10,
    category: "Part.3 寵物保健食品",
    text: "您是否有幫寵物補充營養保健食品？",
    type: "single",
    required: true,
    options: [
      { value: 1, text: "有，正在使用" },
      { value: 2, text: "曾經使用，但現在沒有" },
      { value: 3, text: "從未使用過" },
    ],
  },
  {
    id: 11,
    text: "您提供營養保健食品給寵物的主要原因是什麼？（可複選）",
    type: "multiple",
    required: true,
    options: [
      { value: 1, text: "腸胃道保健" },
      { value: 2, text: "皮毛保健" },
      { value: 3, text: "骨骼關節保健" },
      { value: 4, text: "牙齒保健" },
      { value: 5, text: "心血管保健" },
      { value: 6, text: "視力保健" },
      { value: 7, text: "肝／腎保健" },
      { value: 8, text: "呼吸道保健" },
      { value: 9, text: "情緒舒緩保健" },
      { value: 10, text: "其他（請說明）" },
    ],
    skipIf: { questionId: 10, answerValues: [3] }, // 如果從未使用過則跳過
  },
  {
    id: 12,
    text: "您通常給寵物哪種形式的營養保健食品？（可複選）",
    type: "multiple",
    required: true,
    options: [
      { value: 1, text: "粉末" },
      { value: 2, text: "錠劑" },
      { value: 3, text: "膠囊" },
      { value: 4, text: "藥水" },
      { value: 5, text: "結合飼料型" },
      { value: 6, text: "結合零食型" },
      { value: 7, text: "沒特別偏好，以寵物接受度為主" },
    ],
    skipIf: { questionId: 10, answerValues: [3] }, // 如果從未使用過則跳過
  },
  {
    id: 13,
    text: "您選擇寵物營養保健食品最在意什麼？（可複選）",
    type: "multiple",
    required: true,
    options: [
      { value: 1, text: "寵物品種、年齡、需求" },
      { value: 2, text: "成分標示完整" },
      { value: 3, text: "價格合理" },
      { value: 4, text: "製造地與來源" },
      { value: 5, text: "品牌信任度" },
      { value: 6, text: "飼主社群或網友好評" },
      { value: 7, text: "其他（請說明）" },
    ],
    skipIf: { questionId: 10, answerValues: [3] }, // 如果從未使用過則跳過
  },
  {
    id: 14,
    text: "您會透過哪些方式了解寵物營養保健食品資訊？（可複選）",
    type: "multiple",
    required: true,
    options: [
      { value: 1, text: "醫師／獸醫建議" },
      { value: 2, text: "網路評測文（部落格、寵物媒體網站）" },
      { value: 3, text: "社群媒體（FB/IG等）" },
      { value: 4, text: "飼主社團／論壇內分享" },
      { value: 5, text: "網購平台的用戶評論" },
      { value: 6, text: "親友推薦" },
      { value: 7, text: "廠商廣告" },
      { value: 8, text: "其他（請說明）" },
    ],
    skipIf: { questionId: 10, answerValues: [3] }, // 如果從未使用過則跳過
  },
  {
    id: 15,
    text: "您一個月願意花多少錢買寵物營養保健食品？",
    type: "single",
    required: true,
    options: [
      { value: 1, text: "500元以下" },
      { value: 2, text: "501-1000元" },
      { value: 3, text: "1001-2000元" },
      { value: 4, text: "2000元以上" },
    ],
  },
]);

// 計算屬性：所有題目帶有跳過狀態
const allQuestionsWithStatus = computed(() => {
  return questions.value.map((question) => {
    let isSkipped = false;

    if (question.skipIf) {
      const skipCondition = question.skipIf;
      const relatedAnswer = answers.value[skipCondition.questionId];

      // 如果滿足跳題條件，則標記為跳過
      isSkipped = skipCondition.answerValues.includes(relatedAnswer);
    }

    return {
      ...question,
      isSkipped,
    };
  });
});

// 計算屬性：檢查是否可以提交（只檢查未跳過且必填的題目）
const canSubmit = computed(() => {
  const requiredActiveQuestions = allQuestionsWithStatus.value.filter(
    (q) => q.required && !q.isSkipped,
  );

  return requiredActiveQuestions.every((question) => {
    const answer = answers.value[question.id];

    if (question.type === "multiple") {
      return Array.isArray(answer) && answer.length > 0;
    }

    return answer !== undefined && answer !== null && answer !== "";
  });
});

// 答案變更處理
const handleAnswerChange = (questionId, value) => {
  answers.value[questionId] = value;

  // 清除該題目的錯誤
  if (errors.value[questionId]) {
    delete errors.value[questionId];
  }

  // 檢查是否需要清除後續跳題的答案
  clearDependentAnswers(questionId);
};

// 多選題答案變更處理
const handleMultipleAnswerChange = (questionId) => {
  // 確保答案是數組格式
  if (!Array.isArray(answers.value[questionId])) {
    answers.value[questionId] = [];
  }

  // 清除錯誤
  if (errors.value[questionId]) {
    delete errors.value[questionId];
  }

  clearDependentAnswers(questionId);
};

// 清除依賴題目的答案
const clearDependentAnswers = (changedQuestionId) => {
  questions.value.forEach((question) => {
    if (question.skipIf && question.skipIf.questionId === changedQuestionId) {
      // 清除依賴此題目的答案
      delete answers.value[question.id];
      delete errors.value[question.id];
    }
  });
};

// 檢查多選題選項是否被選中
const isOptionSelected = (questionId, optionValue) => {
  const answer = answers.value[questionId];
  return Array.isArray(answer) && answer.includes(optionValue);
};

// 檢查題目是否有錯誤
const hasError = (questionId) => {
  return !!errors.value[questionId];
};

// 獲取錯誤訊息
const getErrorMessage = (questionId) => {
  return errors.value[questionId] || "";
};

// 驗證答案（只驗證未跳過的題目）
const validateAnswers = () => {
  errors.value = {};
  let isValid = true;

  allQuestionsWithStatus.value.forEach((question) => {
    // 只驗證未跳過且必填的題目
    if (question.required && !question.isSkipped) {
      const answer = answers.value[question.id];

      if (question.type === "multiple") {
        if (!Array.isArray(answer) || answer.length === 0) {
          errors.value[question.id] = "請至少選擇一個選項";
          isValid = false;
        }
      } else if (answer === undefined || answer === null || answer === "") {
        errors.value[question.id] = "此為必填項目，請選擇答案";
        isValid = false;
      }
    }
  });

  return isValid;
};

// 提交問卷
const submitQuestionnaire = async () => {
  if (!validateAnswers()) {
    // 滾動到第一個錯誤
    const firstErrorElement = document.querySelector(".question--error");
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  isSubmitting.value = true;

  try {
    // 整理提交數據
    const activeQuestions = allQuestionsWithStatus.value.filter(
      (q) => !q.isSkipped,
    );
    const skippedQuestions = allQuestionsWithStatus.value.filter(
      (q) => q.isSkipped,
    );

    const submitData = {
      answers: answers.value,
      completedQuestions: activeQuestions.map((q) => q.id),
      skippedQuestions: skippedQuestions.map((q) => q.id),
    };

    console.log("提交問卷數據:", submitData);

    // 這裡之後會調用 API 保存到資料庫
    // await saveQuestionnaireData(submitData)

    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 通知父組件
    emit("questionnaire-completed", submitData);
  } catch (error) {
    console.error("提交問卷失敗:", error);
    // 這裡可以顯示錯誤提示
  } finally {
    isSubmitting.value = false;
  }
};

// 初始化多選題答案
onMounted(() => {
  questions.value.forEach((question) => {
    if (question.type === "multiple") {
      answers.value[question.id] = [];
    }
  });
});
</script>

<style lang="scss" scoped>
.questionnaire {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
  box-sizing: border-box;
}

.questionnaire__wrapper {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.questionnaire__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 30px;
  text-align: center;
}

.questionnaire__title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.questionnaire__subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.questionnaire__form {
  padding: 40px 30px;
}

.questionnaire__questions {
  margin-bottom: 40px;
}

.question {
  margin-bottom: 40px;
  padding: 30px;
  border: 2px solid #f0f0f0;
  border-radius: 15px;
  background: #fafafa;
  transition: all 0.3s ease;
  position: relative;

  &:hover:not(&--disabled) {
    border-color: #e0e0e0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }

  &--error {
    border-color: #ff4d4f;
    background: #fff2f2;
  }

  &--disabled {
    opacity: 0.5;
    background: #f8f8f8;
    border-color: #e8e8e8;
    pointer-events: none;

    .question__title {
      color: #999;
    }

    .option__text {
      color: #999;
    }
  }
}

.question__category {
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.question__skip {
  position: absolute;
  top: 15px;
  right: 20px;
  background: #f0f0f0;
  padding: 6px 12px;
  border-radius: 15px;
  border: 1px solid #d9d9d9;
}

.question__skip-text {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

.question__header {
  margin-bottom: 20px;
}

.question__title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
}

.question__required {
  color: #ff4d4f;
  margin-left: 4px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option {
  display: flex;
  align-items: flex-start;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(&--disabled) {
    border-color: #1890ff;
    background: #f6f9ff;
  }

  &--selected:not(&--disabled) {
    border-color: #1890ff;
    background: #e6f7ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
  }

  &--disabled {
    background: #f5f5f5;
    border-color: #d9d9d9;
    cursor: not-allowed;

    .option__text {
      color: #bbb;
    }
  }
}

.option__input {
  margin-right: 12px;
  margin-top: 2px;
  width: 18px;
  height: 18px;
  accent-color: #1890ff;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--checkbox {
    border-radius: 4px;
  }
}

.option__text {
  flex: 1;
  font-size: 16px;
  color: #333;
  line-height: 1.4;
}

.question__error {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fff2f2;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  color: #ff4d4f;
  font-size: 14px;
}

.questionnaire__footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 30px;
  text-align: center;
}

.questionnaire__info {
  margin-bottom: 30px;
}

.questionnaire__note {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.questionnaire__required {
  color: #ff4d4f;
}

.questionnaire__privacy {
  font-size: 12px;
  color: #999;
  margin: 0;
  line-height: 1.4;
}

.questionnaire__submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 18px 50px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  min-width: 200px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &--loading {
    cursor: wait;
  }
}

.questionnaire__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.questionnaire__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
  .questionnaire {
    padding: 20px 10px;
  }

  .questionnaire__header {
    padding: 30px 20px;
  }

  .questionnaire__title {
    font-size: 24px;
  }

  .questionnaire__subtitle {
    font-size: 14px;
  }

  .questionnaire__form {
    padding: 30px 20px;
  }

  .question {
    padding: 20px;
    margin-bottom: 30px;
  }

  .question__title {
    font-size: 16px;
  }

  .option {
    padding: 12px 15px;
  }

  .option__text {
    font-size: 14px;
  }

  .questionnaire__submit {
    padding: 15px 40px;
    font-size: 16px;
  }

  .question__skip {
    position: static;
    margin-bottom: 15px;
    display: inline-block;
  }
}
</style>
