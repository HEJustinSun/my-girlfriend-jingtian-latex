const sections = [
  {
    id: "detail",
    numeral: "壹",
    title: "事件与证据",
    description: "先确认时间线、数字和关键动作。共 5 题，每题 3 分。",
    tagline: "先把发生过的事钉牢，再谈它意味着什么。",
  },
  {
    id: "craft",
    numeral: "贰",
    title: "文笔与修辞",
    description: "辨认白描、列数字、反复、照应、对比与留白。共 5 题，每题 4 分。",
    tagline: "把镜头放慢，去看一句话怎样留下余震。",
  },
  {
    id: "society",
    numeral: "叁",
    title: "人物与社会结构",
    description: "讨论亲密关系、劳动、阶级差异和叙述视角。共 5 题，每题 4 分。",
    tagline: "当浪漫需要很多人劳动，人物关系就有了重量。",
  },
  {
    id: "ai",
    numeral: "肆",
    title: "AI 与真实性",
    description: "区分机器建议、叙事责任、文本证据与现实结论。共 4 题，每题 5 分。",
    tagline: "机器给出答案，人仍要为选择负责。",
  },
  {
    id: "business",
    numeral: "伍",
    title: "传播与商业价值",
    description: "从话题热度推到产品转化、资产波动与长期价值。共 5 题，每题 5 分。",
    tagline: "热度会流向哪里，价值又会在哪一层停下？",
  },
];

const questions = [
  {
    id: "q01", section: "detail", type: "single", points: 3,
    prompt: "文章开篇把哪两种重量并置在一起？",
    options: ["一颗卵子与五千万美元现金", "一枚钻戒与一架飞机", "一张照片与一本调查材料", "三十卷胶带与一箱促排针"],
    answer: [0],
    explanation: "两种重量把生育、金钱与亲密关系同时放进可计算的尺度中，也为全文确立了冷峻的叙事基调。",
  },
  {
    id: "q02", section: "detail", type: "single", points: 3,
    prompt: "下列事件按文中时间顺序排列，正确的是哪一项？",
    options: ["买一百五十元羽绒服→保存 QQ 图片→第一次见面→向 Claude 提问", "保存 QQ 图片→买一百五十元羽绒服→第一次见面→向 Claude 提问", "第一次见面→保存 QQ 图片→向 Claude 提问→买羽绒服", "保存 QQ 图片→第一次见面→买羽绒服→向 Claude 提问"],
    answer: [1],
    explanation: "2007 年保存 QQ 图片，2011 年买羽绒服，此后才有现实相见与关键电话中的 Claude 决策。时间线让十九年的投射与现实关系形成纵深。",
  },
  {
    id: "q03", section: "detail", type: "single", points: 3,
    prompt: "蒙太奇拉古纳海滩的一层酒店被包下三十天，实际住了多少天？",
    options: ["三天", "八天", "十四天", "二十二天"],
    answer: [1],
    explanation: "她住了八天，余下二十二天仍有清洁工照常整理空房。",
  },
  {
    id: "q04", section: "detail", type: "single", points: 3,
    prompt: "为了清空放映厅，当天共有多少名观众领钱离开？",
    options: ["十一人", "二十六人", "三十人", "四十六人"],
    answer: [1],
    explanation: "文中明确写到二十六个人领钱离开，其中包括一对带孩子的夫妻。这个人数让私人浪漫背后的公共成本变得可见。",
  },
  {
    id: "q05", section: "detail", type: "single", points: 3,
    prompt: "结尾哪个细节直接回扣了前文的磨甲教学？",
    options: ["QQ 图片越来越模糊", "胶带痕需要换整块玻璃", "叙述者剪完指甲后发现边缘仍是尖的", "飞机把多余燃油放掉"],
    answer: [2],
    explanation: "“我的指甲现在还是磨人的”把一项曾经被教过、却始终没有学会的照顾带回结尾。",
  },
  {
    id: "q06", section: "craft", type: "single", points: 4,
    prompt: "第八天的电话只写“让我想想”“她没有说话”“我听见她那边有海”“好”。这种写法为什么有力量？",
    options: ["它直接说明女方已经彻底绝望", "它省去心理判断，让短句、停顿和海声共同完成拒绝场面", "它加快情节并暗示两人很快和好", "它主要用于证明电话信号不稳定"],
    answer: [1],
    explanation: "这是克制的白描。作者没有替人物宣布悲伤，只保留对话、十一秒停顿和海声，让读者从可感知的细节中抵达情绪。",
  },
  {
    id: "q07", section: "craft", type: "single", points: 4,
    prompt: "三点五微克与两点五吨、一百五十元与一亿五千万元、八天与二十二天空房，这些精确数字共同承担什么作用？",
    options: ["组成一份可以核销的消费清单", "为叙事钉下具体尺度，并用冷静比例制造生命、金钱与处境的反差", "证明文中每项材料都经过司法核验", "削弱人物关系在全文中的重要性"],
    answer: [1],
    explanation: "数字既是事实锚点，也是情绪装置。它们把巨大落差变成可比较的尺度，语气越冷静，反差越锋利。",
  },
  {
    id: "q08", section: "craft", type: "single", points: 4,
    prompt: "“我说好”反复出现，到关键电话里第一次变成“让我想想”。这一变化最准确的理解是？",
    options: ["机械顺从的节奏突然中断，使真正的拒绝格外刺耳", "叙述者终于学会了更礼貌的表达", "女方已经忘记此前所有承诺", "故事由第一人称改成了第三人称"],
    answer: [0],
    explanation: "重复先建立自动响应般的关系节奏；一句“让我想想”打破惯性。真正的转折藏在句式变化里，无需额外宣告。",
  },
  {
    id: "q09", section: "craft", type: "single", points: 4,
    prompt: "磨甲器和“顺着一个方向磨”在前文出现，结尾又写“我的指甲现在还是磨人的”。这种首尾照应有何作用？",
    options: ["补充完整的磨甲教程", "让物件完成回调，把没有学会的照顾转化为延续至今的遗憾与自省", "证明磨甲器本身存在质量问题", "表示叙述者准备从事美甲行业"],
    answer: [1],
    explanation: "物件回调让抽象遗憾落到身体经验上。关系已经结束，那个没有学会的动作仍然留下后果。",
  },
  {
    id: "q10", section: "craft", type: "multiple", points: 4,
    prompt: "“什么都没有发生”在电影、空房和关系中多次回返，它同时产生了哪些修辞效果？（多选）",
    options: ["形成反复与结构回声", "把巨大投入同最终空缺并置", "带出克制的反讽", "证明前文事件全部虚假", "单纯承担时间过渡"],
    answer: [0, 1, 2],
    explanation: "反复、对比和反讽共同工作：资源调度越宏大，留下的空缺越清晰。句子没有取消事件，也不只承担转场。",
  },
  {
    id: "q11", section: "society", type: "single", points: 4,
    prompt: "关键电话末尾，称谓从“妈妈”重新变为“景甜”，这一细微变化意味着什么？",
    options: ["地点发生变化", "亲密角色停止运作，叙述距离骤然拉开", "叙述者临时忘记了称呼", "女方要求恢复全名"],
    answer: [1],
    explanation: "称谓本身就是关系动作。回到名字，亲密仪式在语言表面结束，人物之间重新出现距离。",
  },
  {
    id: "q12", section: "society", type: "multiple", points: 4,
    prompt: "清洁工、贴胶带女孩、机组和助理被写得很具体，这条劳动线索揭示了什么？（多选）",
    options: ["奢华体验依赖大量被遮蔽的劳动", "私人愿望会转化为他人的时间、体力和技术成本", "劳动者的具体动作让阶级差异可感", "所有服务人员都认同这段关系", "财富能够消除劳动关系"],
    answer: [0, 1, 2],
    explanation: "文本把抽象财富还原成劳动过程。被雇佣者是否认同关系，文中没有证据；财富调度了劳动，也保留了权力差异。",
  },
  {
    id: "q13", section: "society", type: "single", points: 4,
    prompt: "全文对金钱能力的判断，最接近哪一项？",
    options: ["金钱能购买空间、隐私和服务，却无法确保理解与陪伴", "金钱在亲密关系中毫无作用", "投入越高，感情越稳定", "消费规模可以直接衡量爱"],
    answer: [0],
    explanation: "文中的金钱拥有强大执行力，也不断触及边界：它能清场、包楼和调动飞机，无法替双方完成理解与回应。",
  },
  {
    id: "q14", section: "society", type: "single", points: 4,
    prompt: "女方两次问“能来北京吗”，叙述者都沉默。这个细节更接近哪种含义？",
    options: ["他没有听清地点", "他回避进入对方没有明说、也无法用价格解决的现实处境", "他已经订好北京行程", "北京只是转机地点"],
    answer: [1],
    explanation: "他擅长处理可计算的要求，却在一个含义不明的现实请求前保持沉默。人物的能力与情感局限在这里相撞。",
  },
  {
    id: "q15", section: "society", type: "multiple", points: 4,
    prompt: "综合全文，叙述者对女方的情感包含哪些互相冲突的成分？（多选）",
    options: ["长期投射与怀念", "用资源满足和控制关系的倾向", "失去后的遗憾与反事实追问", "迟来的自我审视", "贯穿全文且毫无变化的单一仇恨"],
    answer: [0, 1, 2, 3],
    explanation: "人物情感由怀念、占有、恐惧、遗憾和自省交织而成。用单一仇恨概括，会漏掉叙述中的迟疑和自我暴露。",
  },
  {
    id: "q16", section: "ai", type: "single", points: 5,
    prompt: "Claude 在五千万美元的决定中承担了什么叙事功能？",
    options: ["替叙述者完成法律审判", "提供毫不迟疑的外部声音，促成拒绝并制造人与机器的对照", "证明女方已经不再爱他", "自动向女方发送拒绝消息"],
    answer: [1],
    explanation: "Claude 的确定性压过了人的迟疑，却没有替叙述者说出口。决定、沉默和后果仍由人物承担。",
  },
  {
    id: "q17", section: "ai", type: "multiple", points: 5,
    prompt: "把亲密关系中的重大决定交给 AI，会引出哪些问题？（多选）",
    options: ["模型依据谁提供的事实和价值标准", "建议是否被当成逃避责任的工具", "财务上可承受是否等于关系中应该支付", "机器语气坚定是否代表结论必然正确", "AI 输出可以自动免除使用者的责任"],
    answer: [0, 1, 2],
    explanation: "输入、价值标准和责任归属都需要追问。坚定语气不等于真理，采纳建议的人仍要承担选择后果。",
  },
  {
    id: "q18", section: "ai", type: "multiple", points: 5,
    prompt: "若要判断这篇文章是否由 AI 生成，哪些证据比“读起来像 AI”更可靠？（多选）",
    options: ["文档版本历史与修改轨迹", "作者公开说明和可核验的创作材料", "生成工具或平台留下的元数据", "仅凭句子流畅、数字很多就下结论", "因为出现 Claude 就认定全文由 Claude 写成"],
    answer: [0, 1, 2],
    explanation: "风格只能提供弱线索。版本记录、创作材料、作者说明和技术元数据更接近可核验的证据链。",
  },
  {
    id: "q19", section: "ai", type: "multiple", points: 5,
    prompt: "阅读这篇虚构文本时，哪些边界必须保留？（多选）",
    options: ["区分文本事实、合理推断与现实事实", "区分叙述者形象与现实人物", "称谓、情节和商业符号都要放回语境", "用一道细节判断现实人物违法", "把文学表达当成现实关系的口供"],
    answer: [0, 1, 2],
    explanation: "文本可以承载现实联想，结论仍需证据等级。文学叙述不能直接充当身份、违法或现实关系的证明。",
  },
  {
    id: "q20", section: "business", type: "single", points: 5,
    prompt: "一篇文章突然刷屏后，通常最先、也最容易观察到的“上涨”是什么？",
    options: ["关键词搜索量、社交讨论度与页面访问量", "相关上市公司的长期利润", "大型游戏公司的整体收入", "所有同名资产的内在价值"],
    answer: [0],
    explanation: "传播先改变注意力指标。销量、利润、股价和长期价值需要更多转化环节，不能由热搜直接推出。",
  },
  {
    id: "q21", section: "business", type: "single", points: 5,
    prompt: "假设市场上突然出现未经当事人背书的“景甜币”，哪项判断最严谨？",
    options: ["名字进入热搜就保证长期上涨", "低流动性与迷因叙事可能放大短期波动，同时伴随极高风险和归零可能", "它天然代表文章版权", "它与人物同名，所以必然得到官方认可"],
    answer: [1],
    explanation: "同名、热度和授权是三件不同的事。低流动性资产可能对流量极敏感，波动速度不能证明价值、权利或背书。",
  },
  {
    id: "q22", section: "business", type: "single", points: 5,
    prompt: "若只比较文章提供的传播钩子，张小泉修甲产品与腾讯游戏哪一个更容易做出直接借势内容？",
    options: ["张小泉修甲产品，因为“顺着一个方向磨”和结尾指甲回调能连接具体使用场景", "腾讯游戏，因为文中出现 QQ 就等于出现游戏消费", "两者都已得到文中人物授权", "两者都会因此获得同等收入增长"],
    answer: [0],
    explanation: "修甲工具与文本物件线索的距离更短；腾讯游戏没有直接进入故事。即使关联较近，品牌传播仍需处理授权、语境和实际转化。",
  },
  {
    id: "q23", section: "business", type: "multiple", points: 5,
    prompt: "若要证明文章推动了某家上市公司的股价，至少需要哪些证据？（多选）",
    options: ["明确事件窗口并比较大盘和同行表现", "观察异常成交量及价格变化", "核验搜索、销售或官方营销是否形成转化", "评估相关业务对公司收入是否足够重要", "只截一张上涨分时图"],
    answer: [0, 1, 2, 3],
    explanation: "股价受多重因素影响。事件窗口、基准比较、成交数据、业务转化和重要性共同构成较完整的因果证据；单张截图容易误导。",
  },
  {
    id: "q24", section: "business", type: "multiple", points: 5,
    prompt: "从“文章刷屏”推到“商业价值”，下列路径判断合理的有哪些？（多选）",
    options: ["搜索与讨论热度通常最先变化", "有文本钩子的消费品可能通过合规借势获得转化", "同名迷因币可能波动最剧烈，也可能最快归零", "腾讯游戏等大型业务需要更直接的产品联动才可能产生可测影响", "文章热度可以保证任何相关资产上涨"],
    answer: [0, 1, 2, 3],
    explanation: "注意力、产品转化、资产价格和长期价值属于不同层级。越往后，所需证据越强；高波动也意味着高风险。",
  },
];

const STORAGE_KEY = "sun-reading-quiz-v2";
const MAX_SCORE = questions.reduce((sum, question) => sum + question.points, 0);
if (MAX_SCORE !== 100) throw new Error(`题目总分应为 100，当前为 ${MAX_SCORE}`);
const printMode = new URLSearchParams(window.location.search).get("print") === "1";
const answers = loadAnswers();
const intro = document.querySelector("#intro");
const quiz = document.querySelector("#quiz");
const results = document.querySelector("#results");
const form = document.querySelector("#quiz-form");
const sectionRoot = document.querySelector("#question-sections");
const answeredCount = document.querySelector("#answered-count");
const completionCopy = document.querySelector("#completion-copy");
const resumeButton = document.querySelector("#resume-button");
const printAnswerKey = document.querySelector("#print-answer-key");
let currentQuestionIndex = 0;
let sectionIntroVisible = !printMode;

function loadAnswers() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function saveAnswers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

function answeredTotal() {
  return questions.filter((question) => Array.isArray(answers[question.id]) && answers[question.id].length).length;
}

function escapeHTML(value) {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function questionCardHTML(question, number, focusable = false) {
  const selected = answers[question.id] || [];
  const choices = question.options.map((option, index) => {
    const inputType = question.type === "multiple" ? "checkbox" : "radio";
    const checked = selected.includes(index) ? "checked" : "";
    return `
      <label class="choice">
        <input type="${inputType}" name="${question.id}" value="${index}" ${checked} />
        <span class="choice-key">${String.fromCharCode(65 + index)}</span>
        <span class="choice-copy">${escapeHTML(option)}</span>
      </label>`;
  }).join("");
  return `
    <article class="question-card question-${question.type}" role="group" ${focusable ? 'tabindex="-1"' : ""} aria-labelledby="prompt-${question.id}" data-question-id="${question.id}">
      <div class="question-number">
        <span>QUESTION ${String(number).padStart(2, "0")}</span>
        <span class="question-points">${question.points} 分</span>
      </div>
      <h3 class="question-prompt" id="prompt-${question.id}">${escapeHTML(question.prompt)}</h3>
      <div class="choice-list">${choices}</div>
    </article>`;
}

function renderAllQuestions() {
  sectionRoot.innerHTML = sections.map((section) => {
    const cards = questions.filter((question) => question.section === section.id).map((question) => {
      const number = questions.indexOf(question) + 1;
      return questionCardHTML(question, number);
    }).join("");
    return `
      <section class="question-section" id="section-${section.id}">
        <header class="section-heading">
          <span class="section-index">${section.numeral}</span>
          <div><h2>${section.title}</h2><p>${section.description}</p></div>
        </header>
        <div class="questions-grid">${cards}</div>
      </section>`;
  }).join("");
}

function renderCurrentQuestion(focus = false) {
  const question = questions[currentQuestionIndex];
  const section = sections.find((item) => item.id === question.section);
  const isLast = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  sectionRoot.innerHTML = `
    <section class="question-stage" aria-live="polite">
      <header class="stage-header">
        <div>
          <p class="stage-section">第 ${sections.indexOf(section) + 1} 层 / ${sections.length} · ${section.numeral} · ${section.title}</p>
          <p>${escapeHTML(section.description)}</p>
        </div>
        <strong>${String(currentQuestionIndex + 1).padStart(2, "0")} <span>/ ${questions.length}</span></strong>
      </header>
      <div class="stage-track" aria-hidden="true"><span style="width:${progress}%"></span></div>
      <div class="stage-question">${questionCardHTML(question, currentQuestionIndex + 1, true)}</div>
      <footer class="stage-navigation">
        <button class="stage-button stage-previous" type="button" data-action="previous" ${currentQuestionIndex === 0 ? "disabled" : ""}>← 上一题</button>
        <span id="stage-answered">已答 ${answeredTotal()} / ${questions.length}</span>
        <button class="stage-button stage-next" type="button" data-action="${isLast ? "submit" : "next"}">${isLast ? "交卷并评分 →" : "下一题 →"}</button>
      </footer>
    </section>`;

  if (focus) {
    requestAnimationFrame(() => sectionRoot.querySelector(".question-card")?.focus({ preventScroll: true }));
  }
}

function renderSectionIntro() {
  const section = sections.find((item) => item.id === questions[currentQuestionIndex].section);
  const sectionIndex = sections.indexOf(section);
  const sectionQuestions = questions.filter((question) => question.section === section.id);
  const firstQuestion = questions.indexOf(sectionQuestions[0]) + 1;
  const lastQuestion = questions.indexOf(sectionQuestions.at(-1)) + 1;
  const backButton = currentQuestionIndex > 0
    ? '<button class="section-gate-back" type="button" data-action="section-back">← 返回上一题</button>'
    : '<span class="section-gate-spacer" aria-hidden="true"></span>';

  sectionRoot.innerHTML = `
    <section class="section-gate" aria-live="polite" aria-labelledby="section-gate-title">
      <div class="section-gate-number" aria-hidden="true">${section.numeral}</div>
      <div class="section-gate-copy">
        <p class="section-gate-kicker">LEVEL ${String(sectionIndex + 1).padStart(2, "0")} / ${String(sections.length).padStart(2, "0")}</p>
        <p class="section-gate-range">QUESTION ${String(firstQuestion).padStart(2, "0")} - ${String(lastQuestion).padStart(2, "0")}</p>
        <h2 id="section-gate-title">${section.title}</h2>
        <p class="section-gate-tagline">${escapeHTML(section.tagline)}</p>
        <p class="section-gate-description">${escapeHTML(section.description)}</p>
        <div class="section-gate-actions">
          ${backButton}
          <button class="section-gate-enter" type="button" data-action="enter-section">开始这一层 <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </section>`;
}

function renderQuestions(focus = false) {
  quiz.classList.toggle("showing-section-gate", !printMode && sectionIntroVisible);
  if (printMode) {
    renderAllQuestions();
    return;
  }
  if (sectionIntroVisible) {
    renderSectionIntro();
    return;
  }
  renderCurrentQuestion(focus);
}

function returnToQuestionTop() {
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function renderPrintAnswers() {
  const answerRoot = document.querySelector("#print-answer-list");
  answerRoot.innerHTML = sections.map((section) => {
    const items = questions.filter((question) => question.section === section.id).map((question) => {
      const number = questions.indexOf(question) + 1;
      return `
        <article class="print-answer-item">
          <div class="print-answer-number">${String(number).padStart(2, "0")}</div>
          <div>
            <h3>${escapeHTML(question.prompt)}</h3>
            <p class="print-answer-choice">参考答案：${optionLabels(question.answer)}</p>
            <p>${escapeHTML(question.explanation)}</p>
          </div>
        </article>`;
    }).join("");
    return `
      <section class="print-answer-section">
        <header><span>${section.numeral}</span><h2>${section.title}</h2></header>
        ${items}
      </section>`;
  }).join("");
}

function updateProgress() {
  const count = answeredTotal();
  const remaining = questions.length - count;
  answeredCount.textContent = quiz.hidden ? (count ? `已保存 ${count} / ${questions.length}` : "尚未开始") : `已答 ${count} / ${questions.length}`;
  completionCopy.textContent = remaining ? `你还有 ${remaining} 题没有作答，未答题按 0 分计算。` : "24 题已全部作答，可以交卷。";
  const stageAnswered = document.querySelector("#stage-answered");
  if (stageAnswered) stageAnswered.textContent = `已答 ${count} / ${questions.length}`;
  if (!printMode && !quiz.hidden) {
    document.querySelector("#page-progress").style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
  }
}

function showQuiz({ resume = false } = {}) {
  intro.hidden = true;
  results.hidden = true;
  quiz.hidden = false;
  if (resume) {
    const firstUnanswered = questions.findIndex((question) => !answers[question.id]?.length);
    currentQuestionIndex = firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;
  }
  sectionIntroVisible = true;
  renderQuestions(true);
  updateProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function arraysEqual(left, right) {
  return left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function gradeQuiz() {
  const sectionScores = Object.fromEntries(sections.map((section) => [section.id, 0]));
  const outcomes = questions.map((question) => {
    const selected = answers[question.id] || [];
    const correct = arraysEqual(selected, question.answer);
    if (correct) sectionScores[question.section] += question.points;
    return { question, selected, correct };
  });
  return {
    total: outcomes.reduce((sum, outcome) => sum + (outcome.correct ? outcome.question.points : 0), 0),
    sectionScores,
    outcomes,
  };
}

function resultTier(score) {
  if (score >= 90) return ["孙哥叙事首席解码员", "你从事件证据走到了商业传播：数字、沉默、劳动、AI 决策与注意力市场已经连成完整链条。"];
  if (score >= 75) return ["孙学研究员", "你读懂了大部分结构，也能区分热度、转化和价值。再检查修辞与因果证据，就能抵达最后一层。"];
  if (score >= 60) return ["文本侦探", "你抓住了故事主干和人物矛盾。数字背后的劳动、AI 责任与商业转化仍值得再推一步。"];
  if (score >= 40) return ["维港夜行人", "名场面已经记住，事件与解释还需要分开。沿着五层题组重新走一遍，会看见更多隐线。"];
  return ["刚刷到孙哥", "海、飞机、五千万和商业符号还散落在夜色里。先找事实，再判断修辞、人物与价值。"];
}

function optionLabels(indices) {
  return indices.length ? indices.map((index) => String.fromCharCode(65 + index)).join("、") : "未作答";
}

function renderResults(grade) {
  const [level, description] = resultTier(grade.total);
  document.querySelector("#score-value").textContent = grade.total;
  document.querySelector("#result-level").textContent = level;
  document.querySelector("#result-description").textContent = description;

  const sectionMax = Object.fromEntries(sections.map((section) => [
    section.id,
    questions.filter((question) => question.section === section.id).reduce((sum, question) => sum + question.points, 0),
  ]));
  document.querySelector("#score-breakdown").innerHTML = sections.map((section) => `
    <div class="breakdown-item">
      <span>${section.numeral} · ${section.title}</span>
      <strong>${grade.sectionScores[section.id]} / ${sectionMax[section.id]}</strong>
    </div>`).join("");

  document.querySelector("#review-list").innerHTML = grade.outcomes.map((outcome, index) => `
    <article class="review-item ${outcome.correct ? "correct" : "wrong"}">
      <div class="review-badge">${outcome.correct ? `+${outcome.question.points}` : "+0"}</div>
      <div class="review-content">
        <h3>${index + 1}. ${escapeHTML(outcome.question.prompt)}</h3>
        <p class="review-answer">你的答案：${optionLabels(outcome.selected)}　参考答案：${optionLabels(outcome.question.answer)}</p>
        <p class="review-explanation">${escapeHTML(outcome.question.explanation)}</p>
      </div>
    </article>`).join("");

  results.dataset.score = grade.total;
  results.dataset.level = level;
}

function resetQuiz() {
  Object.keys(answers).forEach((key) => delete answers[key]);
  localStorage.removeItem(STORAGE_KEY);
  currentQuestionIndex = 0;
  sectionIntroVisible = true;
  renderQuestions();
  updateProgress();
}

document.querySelector("#start-button").addEventListener("click", () => {
  resetQuiz();
  showQuiz();
});

resumeButton.addEventListener("click", () => showQuiz({ resume: true }));

sectionRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "enter-section") {
    sectionIntroVisible = false;
    renderQuestions(true);
    updateProgress();
    returnToQuestionTop();
  }
  if (action === "section-back" && currentQuestionIndex > 0) {
    currentQuestionIndex -= 1;
    sectionIntroVisible = false;
    renderQuestions(true);
    updateProgress();
    returnToQuestionTop();
  }
  if (action === "previous" && currentQuestionIndex > 0) {
    currentQuestionIndex -= 1;
    sectionIntroVisible = false;
    renderQuestions(true);
    updateProgress();
    returnToQuestionTop();
  }
  if (action === "next" && currentQuestionIndex < questions.length - 1) {
    const currentSection = questions[currentQuestionIndex].section;
    currentQuestionIndex += 1;
    sectionIntroVisible = questions[currentQuestionIndex].section !== currentSection;
    renderQuestions(true);
    updateProgress();
    returnToQuestionTop();
  }
  if (action === "submit") form.requestSubmit();
});

form.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.type === "radio") {
    answers[input.name] = [Number(input.value)];
  } else {
    answers[input.name] = [...form.querySelectorAll(`input[name="${input.name}"]:checked`)].map((item) => Number(item.value));
  }
  saveAnswers();
  updateProgress();
  sectionRoot.querySelector(".question-card")?.classList.add("has-answer");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const grade = gradeQuiz();
  renderResults(grade);
  quiz.hidden = true;
  results.hidden = false;
  updateProgress();
  results.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#clear-button").addEventListener("click", () => {
  if (window.confirm("确定清空当前全部答案吗？")) resetQuiz();
});

document.querySelector("#review-button").addEventListener("click", () => {
  const review = document.querySelector("#review");
  review.hidden = !review.hidden;
  if (!review.hidden) review.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#restart-button").addEventListener("click", () => {
  resetQuiz();
  showQuiz();
});

document.querySelector("#copy-button").addEventListener("click", async (event) => {
  const text = `《我的女友景甜》互动读懂测试：${results.dataset.score} 分，等级「${results.dataset.level}」。你有没有读懂孙哥？`;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }
  const button = event.currentTarget;
  const original = button.textContent;
  button.textContent = "成绩已复制";
  window.setTimeout(() => { button.textContent = original; }, 1600);
});

window.addEventListener("scroll", () => {
  if (!printMode && !quiz.hidden) return;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const percent = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
  document.querySelector("#page-progress").style.width = `${percent}%`;
}, { passive: true });

if (!printMode) document.body.classList.add("single-question-mode");
renderQuestions();
updateProgress();
resumeButton.hidden = answeredTotal() === 0;

if (printMode) {
  document.body.classList.add("print-mode");
  intro.hidden = false;
  quiz.hidden = false;
  results.hidden = true;
  resumeButton.hidden = true;
  document.querySelectorAll("#quiz-form input").forEach((input) => {
    input.checked = false;
  });
  renderPrintAnswers();
  printAnswerKey.hidden = false;
}
