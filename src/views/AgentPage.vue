<template>
  <div class="chat-container">
    <div class="chat-header">
      <h3>金融风险 Agent</h3>
    </div>

    <div class="chat-window" ref="chatWindow">
      <div v-for="(m, i) in messages" :key="i" :class="['message', m.role]">
        <div class="bubble">
          <div class="content" style="white-space: pre-wrap;">{{ m.text }}</div>
        </div>
      </div>
    </div>

    <div class="composer">
      <el-form :inline="true" label-width="80px" style="width: 100%;">
        <el-form-item label="问题">
          <el-input type="textarea" v-model="query" :rows="2" placeholder="例如：查询 2011-11-07 至 2011-11-09 的系统性金融风险，或 今日的相关与溢出矩阵"></el-input>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            :default-time="['00:00:00','23:59:59']"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" :disabled="!query" @click="send">发送</el-button>
        </el-form-item>
      </el-form>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import { askLLM, analyzeWithFunctionCalling } from "@/ai/agentRunner";
const DATE_RE = /\b\d{4}-\d{2}-\d{2}\b/;
export default {
  name: "AgentPage",
  data() {
    return {
      query: "",
      dateRange: null, // [start, end]
      messages: [],
      loading: false,
      error: ""
    };
  },
  methods: {
    detectIntent(text) {
      return /溢出|相关|矩阵|相关系数/.test(text)
        ? "matrices"
        : (/股票|债券|外汇|货币|衍生品/.test(text) ? "market" : "risk");
    },
    async send() {
      this.error = "";
      const userText = this.query || "";
      const userRange = this.dateRange && this.dateRange.length === 2 ? { start: this.dateRange[0], end: this.dateRange[1] } : undefined;
      const intent = this.detectIntent(userText);
      const hasDateInText = DATE_RE.test(userText) || /今日|今天|当日/.test(userText);

      // 先推送用户消息
      this.messages.push({ role: "user", text: userText });
      this.query = "";
      this.$nextTick(this.scrollToBottom);

      this.loading = true;
      try {
        const skipDeterministic = intent !== "matrices" && !userRange && !hasDateInText;
        if (skipDeterministic) {
          // 调用 LLM 生成自然语言答复
          const llm = await askLLM([
            { role: "user", content: userText },
            { role: "assistant", content: "=" }
          ]);
          const text = (llm && llm.text) ? llm.text : "";
          this.messages.push({ role: "assistant", text: text || "抱歉，未能生成答复。" });
          this.$nextTick(this.scrollToBottom);
          if (!userRange && !hasDateInText) {
            this.error = "建议在问题中包含日期（YYYY-MM-DD）或选择日期范围。若要查询矩阵，可直接输入“相关矩阵”。";
          }
          return;
        }

        // 有日期/矩阵意图：调用确定性工具，并通过轻量函数调用解释“为什么这样”
        const { ans, text } = await analyzeWithFunctionCalling({ query: userText, userRange });
        const finalText = text || (ans && ans.answer) || "该问题暂无详细解释。";
        this.messages.push({ role: "assistant", text: finalText });
        this.$nextTick(this.scrollToBottom);
      } catch (e) {
        const msg = e && e.message ? e.message : "请求失败";
        this.error = /数据在所请求区间无覆盖/.test(msg)
          ? msg + "。请选择历史区间，例如 2011-11-07 至 2011-11-09。"
          : msg;
        this.messages.push({ role: "assistant", text: `LLM 错误：${this.error}` });
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
    }
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.chat-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; }
.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 0 12px;
  background: #f5f7fa;
}
.message { display: flex; margin: 8px 0; }
.message.user { justify-content: flex-end; }
.message.assistant { justify-content: flex-start; }
.bubble {
  max-width: 80%;
  border-radius: 16px;
  padding: 10px 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.message.user .bubble { background: #409eff; color: #fff; }
.message.assistant .bubble { background: #fff; color: #303133; }
.content { font-size: 14px; line-height: 1.6; }

.composer {
  position: sticky;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #ebeef5;
  padding: 10px 12px;
}
.error { color: #c00; margin-top: 4px; }
</style>