<template>
  <div class="chat-container" :class="{ 'center-mode': !isActive }">
    <div class="agent-title" v-show="!isActive">与 FinanceAgent 合作</div>
    <div class="chat-window" ref="chatWindow" v-show="isActive">
      <div v-for="(m, i) in messages" :key="i" :class="['message', m.role]">
        <div class="bubble">
          <div class="content" v-html="renderMarkdown(m.text)"></div>
        </div>
      </div>
    </div>

    <div class="composer">
      <div class="input-box">
        <textarea v-model="query" placeholder="请输入文字" rows="5"></textarea>
        <el-popover
          placement="top-start"
          trigger="click"
          popper-class="date-popover"
          :append-to-body="true"
        >
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            :default-time="['00:00:00', '23:59:59']"
            style="width: 260px"
          />
          <i
            slot="reference"
            class="el-icon-date calendar-icon"
            title="选择日期范围"
          ></i>
        </el-popover>
        <button
          class="send-btn"
          :disabled="loading || !query"
          @click="send"
          aria-label="发送"
        >
          <i class="el-icon-top"></i>
        </button>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
/* eslint-disable indent */
import { askLLM, analyzeWithFunctionCalling } from "@/ai/agentRunner";
import { marked } from 'marked';

// 配置 marked 选项
marked.setOptions({
  breaks: true, // 支持换行
  gfm: true, // 启用 GitHub Flavored Markdown
});

const DATE_RE = /\b\d{4}-\d{2}-\d{2}\b/;
export default {
  name: "AgentPage",
  data() {
    return {
      query: "",
      dateRange: null, // [start, end]
      messages: [],
      loading: false,
      error: "",
    };
  },
  computed: {
    isActive() {
      return (
        (this.query && this.query.trim().length > 0) || this.messages.length > 0
      );
    },
  },
  methods: {
    renderMarkdown(text) {
      if (!text) return '';
      return marked(text);
    },
    detectIntent(text) {
      return /溢出|相关|矩阵|相关系数/.test(text)
        ? "matrices"
        : /股票|债券|外汇|货币|衍生品/.test(text)
        ? "market"
        : "risk";
    },
    async send() {
      this.error = "";
      const userText = this.query || "";
      const userRange =
        this.dateRange && this.dateRange.length === 2
          ? { start: this.dateRange[0], end: this.dateRange[1] }
          : undefined;
      const intent = this.detectIntent(userText);
      const hasDateInText =
        DATE_RE.test(userText) || /今日|今天|当日/.test(userText);

      // 先推送用户消息
      this.messages.push({ role: "user", text: userText });
      this.query = "";
      this.$nextTick(this.scrollToBottom);

      this.loading = true;
      try {
        const skipDeterministic =
          intent !== "matrices" && !userRange && !hasDateInText;
        if (skipDeterministic) {
          // 调用 LLM 生成自然语言答复
          const llm = await askLLM([
            { role: "user", content: userText },
            { role: "assistant", content: "=" },
          ]);
          const text = llm && llm.text ? llm.text : "";
          this.messages.push({
            role: "assistant",
            text: text || "抱歉，未能生成答复。",
          });
          this.$nextTick(this.scrollToBottom);
          if (!userRange && !hasDateInText) {
            this.error =
              "建议在问题中包含日期（YYYY-MM-DD）或点击左下角日历选择范围。若要查询矩阵，可直接输入“相关矩阵”。";
          }
          return;
        }

        // 有日期/矩阵意图：调用确定性工具，并通过轻量函数调用解释“为什么这样”
        const { ans, text } = await analyzeWithFunctionCalling({
          query: userText,
          userRange,
        });
        const finalText = text || (ans && ans.answer) || "该问题暂无详细解释。";
        this.messages.push({ role: "assistant", text: finalText });
        this.$nextTick(this.scrollToBottom);
      } catch (e) {
        const msg = e && e.message ? e.message : "请求失败";
        this.error = /数据在所请求区间无覆盖/.test(msg)
          ? msg + "。请选择历史区间，例如 2011-11-07 至 2011-11-09。"
          : msg;
        this.messages.push({
          role: "assistant",
          text: `LLM 错误：${this.error}`,
        });
        this.$nextTick(this.scrollToBottom);
      } finally {
        this.loading = false;
      }
    },
    scrollToBottom() {
      const el = this.$refs.chatWindow;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    },
  },
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.chat-container.center-mode {
  justify-content: center; /* 垂直居中：无输入时 */
}
.chat-header {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}
.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 8px 0; /* 统一使用卡片的内边距，仅保留底部轻微间距 */
  background: transparent; /* 让父级卡片背景生效 */
}
.chat-container.center-mode .chat-window {
  display: none;
}
.message {
  display: flex;
  margin: 8px 0;
}
.message.user {
  justify-content: flex-end;
}
.message.assistant {
  justify-content: flex-start;
}
.bubble {
  max-width: 80%;
  border-radius: 16px;
  padding: 10px 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.message.user .bubble {
  background: #409eff;
  color: #fff;
}
.message.assistant .bubble {
  background: #fff;
  color: #303133;
}
.content {
  font-size: 14px;
  line-height: 1.6;
}

/* Markdown 渲染样式 */
.content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
  margin: 16px 0 8px 0;
  font-weight: 600;
}
.content h1 { font-size: 20px; }
.content h2 { font-size: 18px; }
.content h3 { font-size: 16px; }
.content h4, .content h5, .content h6 { font-size: 14px; }

.content p {
  margin: 8px 0;
}

.content code {
  background: rgba(175, 184, 193, 0.2);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.content pre {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 12px;
  margin: 12px 0;
  overflow-x: auto;
}

.content pre code {
  background: none;
  padding: 0;
  border-radius: 0;
}

.content ul, .content ol {
  margin: 8px 0;
  padding-left: 20px;
}

.content li {
  margin: 4px 0;
}

.content blockquote {
  border-left: 4px solid #dfe2e5;
  padding-left: 12px;
  margin: 12px 0;
  color: #6a737d;
}

.content a {
  color: #409eff;
  text-decoration: none;
}

.content a:hover {
  text-decoration: underline;
}

.content table {
  border-collapse: collapse;
  margin: 12px 0;
  width: 100%;
}

.content th, .content td {
  border: 1px solid #dfe2e5;
  padding: 6px 12px;
  text-align: left;
}

.content th {
  background: #f6f8fa;
  font-weight: 600;
}

.content strong {
  font-weight: 600;
}

.content em {
  font-style: italic;
}
.composer {
  position: sticky;
  bottom: 0;
  background: transparent; /* 与卡片背景一致 */
  border-top: none;
  padding: 0;
}
.chat-container.center-mode .composer {
  position: relative;
  bottom: auto;
  align-self: center; /* 水平居中 */
  width: 90%;
  max-width: 640px;
}
.error {
  color: #c00;
  margin-top: 4px;
}

.input-box {
  position: relative;
  border: 1.5px solid #dcdfe6; /* 浅灰矩形边框 */
  border-radius: 8px; /* 略带圆角 */
  background: #fff;
  padding: 12px 12px 68px 12px; /* 底部为图标和按钮预留空间 */
}
.input-box textarea {
  width: 100%;
  min-height: 120px;
  border: none;
  outline: none;
  resize: vertical;
  font-size: 14px;
  color: #303133;
}
.input-box textarea::placeholder {
  color: #c0c4cc;
}
.calendar-icon {
  position: absolute;
  left: 16px;
  bottom: 16px;
  font-size: 24px;
  color: #c0c4cc; /* 左下角日历图标 */
  cursor: pointer;
}
.date-popover {
  padding: 8px;
}
.send-btn {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px; /* 方形且略圆角 */
  background-color: #2ecc71; /* 亮绿色按钮 */
  box-shadow: 0 0 0 2px #409eff inset; /* 轻微描边以贴近示意图 */
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.send-btn i {
  color: #000;
  font-size: 20px;
}
.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.agent-title {
  display: flex; /* 启用 Flexbox */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 12px;
}
</style>
