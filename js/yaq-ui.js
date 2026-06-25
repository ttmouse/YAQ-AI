(function() {
'use strict';
var YAQ = window.YAQ;
var $dom = YAQ.$dom;
var MOCK = YAQ.MOCK;
var TrackStore = YAQ.TrackStore;
var ls = YAQ.ls;
var safeRender = YAQ.safeRender;
var escapeHtml = YAQ.escapeHtml;  // 使用 app.js 的版本，避免重复定义

var currentDrawerAction = '';

    function openDrawer(action) {
      var content = drawerContent[action];
      if (!content) return;
      currentDrawerAction = action;
      // 恢复确认按钮默认文案
      $dom.drawerConfirm.textContent = '确认生成';
      $dom.drawerTitle.innerHTML = '<i data-lucide="' + getDrawerIcon(action) + '" aria-hidden="true"></i> ' + content.title;

      var bodyHtml = '';
      for (var i = 0; i < content.sections.length; i++) {
        var sec = content.sections[i];
        bodyHtml += '<div class="drawer-section"><div class="drawer-section-label">' + sec.label + '</div><div class="drawer-section-value">' + sec.value.replace(/\n/g, '<br>') + '</div></div>';
        if (i < content.sections.length - 1) bodyHtml += '<div class="drawer-divider"></div>';
      }
      $dom.drawerBody.innerHTML = bodyHtml;
      lucide.createIcons();

      $dom.drawerPanel.classList.add('open');
      $dom.drawerOverlay.classList.add('open');
    }

    function closeDrawer() {
      $dom.drawerPanel.classList.remove('open');
      $dom.drawerOverlay.classList.remove('open');
      $dom.drawerConfirm.textContent = '确认生成';
      $dom.drawerCancel.style.display = '';
    }

    // ════════════════════════════════════════════════════════════════
    // AGENT CONFIG
    // ════════════════════════════════════════════════════════════════

    var agentSceneNames = {
      dashboard: '今日监管工作台',
      'hazard-report': '重大隐患整改日报',
      efficiency: '履职效能统计',
      responsibility: '主体责任评估',
      disposal: '分级处置流程',
      followup: '跟踪事项汇总'
    };

    var agentDefaultPrompts = {
      dashboard: '你是安全监管 AI 助手，为站长生成「今日监管工作台」页面内容。页面由以下四大板块组成：\n\n一、整体安全态势\n展示核心运营数据指标卡，按分组呈现：\n- 监管概况：安全责任主体总数、覆盖户数（累计/期间）、主体覆盖率、风险等级上调数、新增重大/较大风险主体数\n- 监管执法：检查次数（日常+监督）、检查单推送户数/次数、办结数/办结率、未办结数\n- 隐患闭环：新增隐患、累计隐患、未闭环隐患、整改完成（期间/累计）、隐患整改率\n- 重大隐患：新增重大隐患、累计重大隐患、未闭环重大隐患、超期未整改\n同时展示四级风险分布（重大/较大/一般/低风险主体数量）。\nAI 问候语在最顶部，根据时段打招呼，简要说明今日需关注的方向数量。\n\n二、关键风险闭环\n展示当前重大隐患的横向卡片列表，每张卡片包含：\n- 隐患对象名称\n- 隐患描述\n- 来源（政府检查/企业自查/群众举报等）\n- 当前状态（整改中/督办中/已完成等）\n- 逾期天数\n- 发现日期 → 整改截止日期\n顶部有 AI 摘要句，说明当前重大隐患总体情况（如"5 项重大隐患，2 项超期"）。\n\n三、核心任务进展\n展示监管任务的横向卡片列表，每张卡片包含：\n- 任务名称（日常/专项标签）\n- 双环进度图：外环为进度百分比，内环为完成率\n- 覆盖主体数、发现隐患数、未闭环数\n- 起止日期\n顶部有异常任务数量标识。异常任务排在前面，用红/橙色角标标注。\n\n四、待确认行动项\nAI 基于今日数据生成的待确认行动，每项包含：\n- 行动标题\n- 类型标签（督办/约谈/核查等）\n- 法规依据\n- 具体要求\n- 建议动作按钮（主操作+次操作）\n顶部有流程步骤指示（异常识别 → 问题聚合 → 行动生成待确认）和行动总数。\n\n输出语言风格：简洁、专业、面向基层安全管理者，数据驱动，避免过度技术术语。',

      'hazard-report': '你是安全监管 AI 助手，为站长生成重大隐患整改日报。\n\n请按以下结构生成内容：\n\n1. 统计概览：\n   - 重大隐患总数（当前）\n   - 超期未整改数（标红）\n   - 即将到期数（3 天内到期，标橙）\n   - 整改中数\n   - 反复出现数（同一主体同一隐患重复出现）\n\n2. 隐患回头看：对每个重大隐患（状态为危险或预警），列出——\n   - 隐患对象和隐患描述\n   - 所属区域\n   - 当前状态和上期状态（标注改善/恶化/无变化）\n   - 临时管控措施\n   - 整改方案\n   - 时间表和责任人\n\n3. 状态变化表：逐项对比上期与本期状态，标注改善/恶化趋势，对恶化项重点提醒。\n\n4. 整改建议：对超期项给出升级建议（督办、约谈、联合执法），对即将到期项给出催办建议。\n\n输出语言风格：严肃、紧迫感、数据驱动，突出超期和恶化趋势。',

      efficiency: '你是安全监管 AI 助手，为站长生成履职效能分析报告。\n\n请按以下结构生成内容：\n\n1. 分组效能卡片：按监管组别展示以下指标——\n   - 检查完成率（已查/应查）\n   - 复查率（已复查/需复查）\n   - 隐患发现率（发现隐患数/检查数）\n   - 文书合规率（合格文书/总文书）\n   - 闭环率（已闭环隐患/总隐患）\n   每个指标给出达标状态（正常/异常）。\n\n2. 异常偏低提示：列出效能明显偏低的组别和指标，说明偏低原因推测（如"该组检查任务集中在下周"、"新入职人员占比高"等），给出核查建议。\n\n3. 对比分析：与上月同期对比，标注改善/退步的趋势箭头。\n\n4. 改进建议：对落后组别给出具体改进措施（如增加培训、调整排班、优化检查流程等）。\n\n输出语言风格：客观、数据化、可操作，便于站长直接用于组别考核。',

      responsibility: '你是安全监管 AI 助手，为站长生成主体责任评估报告。\n\n请按以下结构生成内容：\n\n1. 主体责任判断矩阵：按两个维度（自查频次 vs 政府检查发现）将主体分为四类——\n   - 主体责任较主动：自查多，政府检查少，安全管理较到位（绿色）\n   - 疑似敷衍自查：自查为 0 或极少，政府检查发现多项隐患（红色）\n   - 管理能力不足：培训低，隐患反复，安全投入不足（橙色）\n   - 触达失败：平台长期不登录，需要培训或依法督促（灰色）\n\n2. 企业主体责任落实表格：逐企业列出——\n   - 企业名称\n   - 自查次数\n   - 政府检查次数\n   - 培训次数\n   - 演练次数\n   - 风险评级（高度关注/需关注/观察）\n   - AI 建议（如"建议约谈"、"纳入重点监管"、"继续观察"等）\n\n3. 统计汇总：自查为 0 的主体数、培训低于 2 次的主体数、高度关注主体数、未演练主体数。\n\n4. 薄弱环节分析：识别共性问题（如"8 家主体自查为 0，占总数 40%"），给出批量处置建议。\n\n输出语言风格：客观、分类清晰、建议具体可执行。',

      disposal: '你是安全监管 AI 助手，为站长生成分级处置闭环报告。\n\n请按以下结构生成内容：\n\n1. 处置建议概览：简要说明当前处置事项总数和各层级分布。\n\n2. 分级处置事项（按三个层级组织）：\n   - L1 内部处置：监管组内部可闭环的事项（如提醒企业自查、补充文书等）\n     每项列出：事项标题、简要描述、建议动作（执行/一键提醒）\n   - L2 外部处置：需跨部门或外部资源的事项（如联合检查、约谈企业负责人等）\n     每项列出：事项标题、涉及部门、简要描述、建议动作\n   - L3 系统性处置：需系统层面优化的事项（如流程优化、制度修订等）\n     每项列出：事项标题、问题分析、优化建议\n\n3. 超期未处置提醒：列出超过处置时限的事项，标注超期天数，给出升级建议。\n\n4. 闭环率统计：各层级的处置闭环率，对比目标值（目标 95%），标识落后层级。\n\n输出语言风格：层次分明、动作导向、便于站长逐项认领和分配。',

      followup: '你是安全监管 AI 助手，为站长生成重点跟进事项汇总。\n\n请按以下结构生成内容：\n\n1. 跟进事项列表：每项包含——\n   - 事项标题\n   - 当前状态（进行中/待处理/已超期/需干预）\n   - 责任人/责任单位\n   - 最新进展描述\n   - 下一步动作建议（如"发起督办"、"升级约谈"、"持续观察"等）\n   - 截止时间和剩余天数\n   - 是否需要站长干预（标红左边框）\n\n2. 状态分类统计：\n   - 进行中 X 项\n   - 待处理 X 项\n   - 已超期 X 项（标红）\n   - 需干预 X 项（标红）\n\n3. 即将到期提醒：3 天内到期的事项单独列出，标注剩余天数。\n\n4. 优先级建议：按紧急程度排序，对需干预项给出具体操作建议（如"建议今日召开专题会议"、"建议联合执法介入"等）。\n\n输出语言风格：紧凑、紧迫感强、每项都有明确的下一步动作，便于站长快速决策。'
    };

    var agentDefaultCron = {
      dashboard: '0 8 * * *',
      'hazard-report': '0 9 * * 1',
      efficiency: '0 8 1 * *',
      responsibility: '0 8 1 * *',
      disposal: '0 8 * * 1-5',
      followup: '0 17 * * 1-5'
    };

    var agentSchedulePresets = [
      { label: '每天早上 8:00',        cron: '0 8 * * *' },
      { label: '每个工作日早上 8:00',   cron: '0 8 * * 1-5' },
      { label: '每个工作日早上 9:00',   cron: '0 9 * * 1-5' },
      { label: '每个工作日下午 5:00',   cron: '0 17 * * 1-5' },
      { label: '每周一早上 9:00',       cron: '0 9 * * 1' },
      { label: '每周五下午 5:00',       cron: '0 17 * * 5' },
      { label: '每月 1 号早上 8:00',    cron: '0 8 1 * *' },
      { label: '每月 15 号早上 8:00',   cron: '0 8 15 * *' }
    ];

    function getDefaultPrompt(sceneId) {
      var saved = ls.get('yaq_agent_prompt_' + sceneId);
      return saved || agentDefaultPrompts[sceneId] || '';
    }

    function openAgentConfig(sceneId) {
      var name = agentSceneNames[sceneId] || sceneId;
      var defaultPrompt = agentDefaultPrompts[sceneId] || '';
      var savedPrompt = ls.get('yaq_agent_prompt_' + sceneId) || '';
      var cron = ls.get('yaq_agent_cron_' + sceneId) || agentDefaultCron[sceneId] || '0 8 * * *';

      $dom.drawerConfirm.style.display = 'none';
      $dom.drawerCancel.textContent = '关闭';
      $dom.drawerTitle.innerHTML = '<i data-lucide="settings-2" aria-hidden="true"></i> Agent 配置 — ' + name;

      var promptOptionsHtml = '';
      for (var p = 0; p < agentSchedulePresets.length; p++) {
        var preset = agentSchedulePresets[p];
        var selected = preset.cron === cron ? ' selected' : '';
        promptOptionsHtml += '<option value="' + escapeHtml(preset.cron) + '"' + selected + '>' + preset.label + '</option>';
      }

      var bodyHtml =
        '<div class="agent-config-section">' +
          '<label><i data-lucide="message-square" width="13" height="13"></i> 提示词</label>' +
          '<textarea class="agent-prompt-ta" id="agentPromptEditable" placeholder="在此编辑提示词…">' + escapeHtml(savedPrompt || defaultPrompt) + '</textarea>' +
          '<div class="agent-config-hint">编辑后点击保存；清空内容并保存可恢复默认提示词</div>' +
        '</div>' +
        '<div class="agent-config-section">' +
          '<label><i data-lucide="clock" width="13" height="13"></i> 执行周期</label>' +
          '<select id="agentScheduleSelect" class="agent-schedule-select">' + promptOptionsHtml + '</select>' +
          '<div class="agent-config-hint">Cron: <code id="agentCronPreview">' + escapeHtml(cron) + '</code></div>' +
        '</div>' +
        '<button class="agent-config-save" onclick="saveAgentPrompt(\'' + sceneId + '\')"><i data-lucide="check" width="14" height="14"></i> 保存配置</button>';

      $dom.drawerBody.innerHTML = bodyHtml;
      lucide.createIcons();

      // 预览 cron 变化
      var selectEl = $dom.agentScheduleSelect;
      if (selectEl) {
        selectEl.addEventListener('change', function() {
          var preview = $dom.agentCronPreview;
          if (preview) preview.textContent = this.value;
        });
      }

      // textarea 自适应高度
      var ta = $dom.agentPromptEditable;
      if (ta) {
        var autoResize = function() {
          this.style.height = 'auto';
          this.style.height = this.scrollHeight + 'px';
        };
        ta.addEventListener('input', autoResize);
        autoResize.call(ta);
      }

      $dom.drawerPanel.classList.add('open');
      $dom.drawerOverlay.classList.add('open');
    }

    function saveAgentPrompt(sceneId) {
      var promptEl = $dom.agentPromptEditable;
      var scheduleEl = $dom.agentScheduleSelect;
      if (promptEl) {
        var val = promptEl.value.trim();
        if (val) {
          ls.set('yaq_agent_prompt_' + sceneId, val);
        } else {
          ls.remove('yaq_agent_prompt_' + sceneId);
        }
      }
      if (scheduleEl) ls.set('yaq_agent_cron_' + sceneId, scheduleEl.value);
      showToast('Agent 配置已保存', 'mock');
      closeDrawer();
    }

    function getDrawerIcon(action) {
      var map = { briefing: 'file-text', supervise: 'megaphone', meeting: 'calendar', inspect: 'search', remind: 'bell' };
      return map[action] || 'file-text';
    }

    // ════════════════════════════════════════════════════════════════
    // TOAST
    // ════════════════════════════════════════════════════════════════

    function showToast(msg, type) {
      var el = $dom.toast;
      el.textContent = type === 'mock' ? '🧪 [演示] ' + msg : msg;
      el.className = 'toast' + (type === 'mock' ? ' mock' : '');
      el.classList.add('show');
      setTimeout(function() { el.classList.remove('show'); }, 2500);
    }

    // ════════════════════════════════════════════════════════════════
    // HAZARD DETAIL
    // ════════════════════════════════════════════════════════════════

    function openHazardDetail(objectName, foundDate) {
      // 先从全部隐患中查找（按对象 + 日期精确定位）
      var h = null;
      for (var si = 0; si < MOCK.hazards.length; si++) {
        if (MOCK.hazards[si].object === objectName) {
          if (foundDate === undefined || MOCK.hazards[si].foundDate === foundDate) {
            h = MOCK.hazards[si]; break;
          }
        }
      }
      if (!h) {
        var arr = window.__majorHazards || [];
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].object === objectName) { h = arr[i]; break; }
        }
      }
      if (!h) { showToast('未找到隐患数据'); return; }
      window.__currentHazard = h;

      var dotColor = h.level.indexOf('重大') > -1 ? 'var(--red)' : '#d97706';
      $dom.hazardModalName.innerHTML = '<a href="#" onclick="openEnterprisePanel(\'' + h.object.replace(/'/g, "\\'") + '\');return false" style="color:var(--text);text-decoration:none;border-bottom:1px dashed var(--blue)">' + escapeHtml(h.object) + '</a>';
      $dom.hazardModalDot.style.background = dotColor;

      // — 顶部状态区 —
      var statusBadge = '<span class="hc-status ' + h.statusCls + '" style="font-size:11px;padding:2px 8px">' + h.status + '</span>';
      var overdueHtml = h.overdue > 0 ? '<span style="color:var(--red);font-weight:700;font-size:13px">⚠ 逾期 ' + h.overdue + ' 天</span>' : '';
      var bodyHtml =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;background:color-mix(in oklch, var(--red) 12%, #fff);color:var(--red)">' + h.level + '</span>' +
          statusBadge +
        '</div>' +
        (overdueHtml ? '<div>' + overdueHtml + '</div>' : '') +
      '</div>' +
      // — 隐患描述（突出）—
      '<div style="font-size:14px;font-weight:600;color:var(--text);line-height:1.5;margin-bottom:12px;padding:10px 12px;background:var(--fg-soft);border-radius:10px">' + h.hazard.replace(/\n/g, '<br>') + '</div>' +
      // — 整改建议（突出）—
      '<div style="font-size:10px;font-weight:600;color:var(--weak);margin-bottom:4px;letter-spacing:0.05em">整改建议</div>' +
      '<div style="font-size:13px;color:#344054;line-height:1.6;margin-bottom:14px;padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">' + (h.suggestion || '—') + '</div>' +
      // — 基础信息（两列简洁）—
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 16px;margin-bottom:10px">' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span style="color:var(--weak)">对象</span> <a href="#" onclick="openEnterprisePanel(\'' + h.object.replace(/'/g, "\\'") + '\');return false" style="color:var(--blue);text-decoration:none;border-bottom:1px dashed var(--blue)">' + escapeHtml(h.object) + '</a></div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span style="color:var(--weak)">责任人</span> ' + (h.person || '—') + '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span style="color:var(--weak)">发现</span> ' + (h.discoverer || '—') + ' / ' + h.foundDate + '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span style="color:var(--weak)">期限</span> ' + h.deadline + '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span style="color:var(--weak)">来源</span> ' + h.source + '</div>' +
        '<div style="font-size:11.5px;color:var(--muted);padding:2px 0"><span style="color:var(--weak)">片区</span> ' + (h.region || '—') + '</div>' +
      '</div>' +
      // — 依据（可折叠）—
      '<div id="regulationWrap" style="margin-bottom:6px">' +
        '<div onclick="toggleRegulation()" style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--weak);cursor:pointer;user-select:none">' +
          '<span id="regArrow">▶</span> 关联法规依据' +
        '</div>' +
        '<div id="regulationBody" style="display:none;margin-top:4px;font-size:11.5px;color:var(--muted);padding:6px 10px;background:#f9fafb;border-radius:8px">' + (h.regulation || '无') + '</div>' +
      '</div>';

      // 现场证据（图片区域单独展示）
      bodyHtml += '<div style="border-bottom:1px solid var(--line);margin:8px 0"></div>';
      bodyHtml += '<div style="font-size:10px;font-weight:600;color:var(--weak);margin-bottom:8px;letter-spacing:0.05em">现场证据</div>';
      // 问题快照
      var photoCount = h.hasPhoto ? 3 : 0;
      bodyHtml += '<div class="hmodal-row" style="align-items:flex-start;padding-top:10px"><div class="hmodal-label">问题快照</div><div class="hmodal-value"><div style="display:flex;gap:8px;flex-wrap:wrap">';
      if (photoCount > 0) {
        for (var pi = 1; pi <= photoCount; pi++) {
          bodyHtml += '<div style="width:80px;height:60px;border-radius:8px;background:#f2f4f7;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--weak)"><i data-lucide="image" width="16" height="16" style="opacity:.4"></i></div>';
        }
      } else {
        bodyHtml += '<span style="font-size:11px;color:var(--weak)">无</span>';
      }
      bodyHtml += '</div></div></div>';
      // 整改结果
      bodyHtml += '<div class="hmodal-row" style="align-items:flex-start;padding-top:10px"><div class="hmodal-label">整改结果</div><div class="hmodal-value">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">' +
        (h.resultPhoto ? '<div style="width:80px;height:60px;border-radius:8px;background:#e8f5e9;border:1px solid #c8e6c9;display:flex;align-items:center;justify-content:center;font-size:10px;color:#2e7d32"><i data-lucide="check-circle" width="16" height="16"></i></div>' : '') +
        '</div>' +
        (h.resultText ? '<div style="font-size:12px;color:var(--text);line-height:1.5">' + h.resultText + '</div>' : '') +
      '</div></div>';

      // 生成 AI 结论
      var aiHtml = '';
      var entData = ENTERPRISE_DB[h.object];
      if (entData) {
        aiHtml =
        '<div style="font-size:12px;line-height:1.65;color:#344054">' +
          generateHazardAnalysis(h, entData) +
        '</div>';
      }

      $dom.hazardModalBody.innerHTML =
        '<div class="hmodal-main">' + bodyHtml + '</div>' +
        '<div class="hmodal-ai">' + aiHtml + '</div>';

      $dom.hazardModalOverlay.style.display = 'block';
      $dom.hazardModal.style.display = 'flex';
    }

    function generateHazardAnalysis(h, entData) {
      var allHaz = MOCK.hazards.filter(function(x) { return x.object === h.object; });
      var prevSame = allHaz.filter(function(x) { return x.hazard.indexOf(h.hazard.slice(0, 6)) > -1 && x !== h; });
      var overdue = h.overdue > 0;
      var si = entData.selfInspections || [];
      var siRate = si.length > 0 ? Math.round(si.filter(function(x) { return x.statusCls === 'done' || x.status === '无异常'; }).length / si.length * 100) : 0;
      var totalHaz = allHaz.length;
      var closedHaz = allHaz.filter(function(x) { return x.statusCls === 'done'; }).length;
      var closedRate = totalHaz > 0 ? Math.round(closedHaz / totalHaz * 100) : 0;

      var summary = '';
      if (overdue) {
        summary = '该隐患已逾期 <strong>' + h.overdue + ' 天</strong>，';
        summary += h.level.indexOf('重大') > -1 ? '属于重大事故隐患，需站长立即介入。' : '需尽快处置。';
      }

      // 综合判断：问题出在哪一端
      var enterpriseWeak = siRate < 60;
      var repeatIssue = prevSame.length > 0;
      if (enterpriseWeak || repeatIssue) {
        summary += '企业自检执行率仅 ' + siRate + '%，隐患闭环率 ' + closedRate + '%，主体责任落实不到位。';
      }
      if (repeatIssue) {
        summary += '同类隐患反复出现 ' + prevSame.length + ' 次，需深挖根因。';
      }
      if (!enterpriseWeak && !repeatIssue && !overdue) {
        summary = '该企业自检执行率 ' + siRate + '%，隐患闭环率 ' + closedRate + '%，整体履职基本到位。详情可查看右侧企业侧边栏。';
      }

      summary += ' 点击上方企业名称查看完整评估报告。';
      return summary;
    }

    function closeHazardModal() {
      $dom.hazardModalOverlay.style.display = 'none';
      $dom.hazardModal.style.display = 'none';
    }

    // ─── 复制隐患信息 ─────────────────────────────────────────
    function copyHazardInfo() {
      var h = window.__currentHazard;
      if (!h) { showToast('无数据可复制'); return; }
      var lines = [
        '【隐患对象】' + h.object,
        '【隐患等级】' + h.level,
        '【隐患描述】' + h.hazard,
        '【整改建议】' + (h.suggestion || '—'),
        '【整改依据】' + (h.regulation || '—'),
        '【当前状态】' + h.status,
        '【责任人】' + (h.person || '—'),
        '【发现人】' + (h.discoverer || '—') + ' / ' + h.foundDate,
        '【整改期限】' + h.deadline,
        '【来源】' + h.source,
        '【片区】' + (h.region || '—'),
        '【整改措施】' + (h.measures || '—'),
        '【整改计划】' + (h.plan || '—')
      ];
      if (h.overdue > 0) lines.splice(5, 0, '⚠ 已逾期 ' + h.overdue + ' 天');
      var text = lines.join('\n');
      copyToClipboard(text, '隐患信息已复制');
    }

    function copyToClipboard(text, msg) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          showToast(msg || '已复制');
        }).catch(function() {
          fallbackCopy(text, msg);
        });
      } else {
        fallbackCopy(text, msg);
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 企业详情面板
    // ════════════════════════════════════════════════════════════════

    function openEnterprisePanel(name) {
      var data = ENTERPRISE_DB[name];
      if (!data) {
        // Fallback: check MOCK.subjects for minimal data
        var subj = null;
        for (var si = 0; si < MOCK.subjects.length; si++) {
          if (MOCK.subjects[si].name === name) { subj = MOCK.subjects[si]; break; }
        }
        if (subj) {
          var riskColor = subj.risk === 'high' ? 'var(--red)' : subj.risk === 'mid' ? '#d97706' : 'var(--green)';
          var riskLabel = subj.risk === 'high' ? '重大风险' : subj.risk === 'mid' ? '一般风险' : '低风险';
          data = {
            region: '—',
            person: '—',
            type: '企业',
            area: '—',
            riskLevel: riskLabel,
            score: subj.risk === 'high' ? 'C' : subj.risk === 'mid' ? 'B' : 'A',
            scorePct: subj.risk === 'high' ? 35 : subj.risk === 'mid' ? 60 : 85,
            summary: '待完善企业安全评估数据。当前自查 ' + (subj.selfCheck || '0 次') + '，政府检查 ' + (subj.govCheck || '—') + '，培训完成率 ' + (subj.training || '—') + '，应急演练 ' + (subj.drill || '0 次') + '。',
            dimensions: [
              { id: 'responsibility', label: '安全责任体系', score: subj.risk === 'high' ? 'C' : subj.risk === 'mid' ? 'B' : 'A', icon: 'shield', text: '待完善。', bar: subj.risk === 'high' ? 'c' : subj.risk === 'mid' ? 'b' : 'a' },
              { id: 'inspection', label: '隐患排查治理', score: subj.risk === 'high' ? 'D' : subj.risk === 'mid' ? 'C' : 'B', icon: 'search', text: '待完善。', bar: 'c' },
              { id: 'training', label: '教育培训', score: subj.risk === 'high' ? 'D' : 'C', icon: 'graduation-cap', text: '培训完成率 ' + (subj.training || '—') + '。', bar: 'c' },
              { id: 'emergency', label: '应急管理能力', score: 'C', icon: 'alert-triangle', text: '应急演练 ' + (subj.drill || '0 次') + '。', bar: 'c' },
              { id: 'history', label: '历史表现评价', score: subj.risk === 'high' ? 'C' : 'B', icon: 'clock', text: '建议完善企业安全管理档案。', bar: 'b' }
            ],
            hazards: [],
            selfInspections: [],
            expertRecords: [],
            trainingRecords: []
          };
        } else {
          showToast('暂无该企业评估数据');
          return;
        }
      }

      // 填充该企业的历史隐患
      data.hazards = [];
      for (var ei = 0; ei < MOCK.hazards.length; ei++) {
        if (MOCK.hazards[ei].object === name) {
          data.hazards.push(MOCK.hazards[ei]);
        }
      }

      $dom.epName.textContent = name;
      $dom.epFixedTop.innerHTML = epRenderFixedTop(data);
      window.__epActiveTab = 'hazards';
      $dom.epTabContent.innerHTML = epRenderTab(data, 'hazards');
      $dom.epPanel.classList.add('open');
      window.__epData = data;
      lucide.createIcons();
    }

    function closeEnterprisePanel() {
      $dom.epPanel.classList.remove('open');
    }

    function epSwitchTab(tab) {
      var data = window.__epData;
      if (!data) return;
      // 更新指标卡高亮
      var cards = document.querySelectorAll('#epFixedTop .ep-tab-card');
      cards.forEach(function(c) { c.classList.remove('mc-active'); });
      cards.forEach(function(c) { if (c.getAttribute('data-tab') === tab) c.classList.add('mc-active'); });
      // 更新内容区
      $dom.epTabContent.innerHTML = epRenderTab(data, tab);
      window.__epActiveTab = tab;
      lucide.createIcons();
    }

    function epRenderFixedTop(data) {
      var riskColor = { '重大风险': 'var(--red)', '较大风险': '#d97706', '一般风险': 'var(--green)', '低风险': '#6b7280' };
      var riskBg = { '重大风险': '#fff1f2', '较大风险': '#fff7e6', '一般风险': '#eaf8f1', '低风险': '#f2f4f7' };
      var rColor = riskColor[data.riskLevel] || 'var(--muted)';
      var rBg = riskBg[data.riskLevel] || '#f2f4f7';
      var unclosedHaz = data.hazards.filter(function(x) { return x.statusCls !== 'done'; }).length;
      var activeTab = window.__epActiveTab || 'hazards';

      var html =
      // 基础信息行：风险标签 + 名称地址 + 责任人
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
        '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:' + rBg + ';color:' + rColor + ';border:1px solid ' + rColor + ';flex-shrink:0">' + (data.riskLevel || '—') + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:700;color:var(--text)">' + data.type + ' · ' + data.region + '</div>' +
          '<div style="font-size:11px;color:var(--muted);margin-top:1px">责任人 ' + (data.person || '—') + ' · ' + (data.area || '—') + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--muted);line-height:1.5;margin-bottom:10px;padding:6px 10px;background:#fafbfc;border-radius:8px">' + data.summary + '</div>' +
      // 指标卡 = Tab
      '<div class="metric-row" style="margin-bottom:6px">' +
        '<div class="metric-card ep-tab-card' + (unclosedHaz > 0 ? ' alert-danger' : '') + (activeTab === 'hazards' ? ' mc-active' : '') + '" style="cursor:pointer;position:relative" data-tab="hazards" onclick="epSwitchTab(\'hazards\')">' +
          (unclosedHaz > 0 ? '<span class="mc-alert-badge">' + unclosedHaz + '</span>' : '') +
          '<div class="mc-value">' + data.hazards.length + '</div><div class="mc-label">隐患数</div></div>' +
        '<div class="metric-card ep-tab-card' + (activeTab === 'expert' ? ' mc-active' : '') + '" style="cursor:pointer" data-tab="expert" onclick="epSwitchTab(\'expert\')"><div class="mc-value">' + (data.expertRecords || []).length + '</div><div class="mc-label">专家履职</div></div>' +
        '<div class="metric-card ep-tab-card' + (activeTab === 'selfinspect' ? ' mc-active' : '') + '" style="cursor:pointer" data-tab="selfinspect" onclick="epSwitchTab(\'selfinspect\')"><div class="mc-value">' + (data.selfInspections || []).length + '</div><div class="mc-label">自检自查</div></div>' +
        '<div class="metric-card ep-tab-card' + (activeTab === 'training' ? ' mc-active' : '') + '" style="cursor:pointer" data-tab="training" onclick="epSwitchTab(\'training\')"><div class="mc-value">' + (data.trainingRecords || []).length + '</div><div class="mc-label">教育培训</div></div>' +
        '<div class="metric-card ep-tab-card' + (activeTab === 'dimensions' ? ' mc-active' : '') + '" style="cursor:pointer" data-tab="dimensions" onclick="epSwitchTab(\'dimensions\')"><div class="mc-value">' + (data.scorePct || '—') + '%</div><div class="mc-label">主体责任</div></div>' +
      '</div>';
      return html;
    }

    function epRenderTab(data, tab) {
      if (tab === 'overview') return epRenderRecentHazards(data.hazards);
      if (tab === 'hazards') return epRenderHazardCards(data.hazards);
      if (tab === 'selfinspect') return epRenderList(data.selfInspections, '自检自查记录', function(s) {
        var dotCls = s.statusCls || 'neutral';
        var issueText = s.issues > 0 ? '<span style="color:' + (s.statusCls === 'danger' ? 'var(--red)' : '#d97706') + ';font-weight:600">问题 ' + s.issues + ' 项</span>' : '<span style="color:var(--green);font-weight:600">无异常</span>';
        return '<div class="ep-hist-item">' +
          '<span class="ep-hist-dot ' + dotCls + '"></span>' +
          '<div style="flex:1;min-width:0;line-height:1.4">' +
            '<div style="font-size:12px;color:var(--text);font-weight:500">' + s.type + '</div>' +
            '<div style="font-size:11px;color:var(--muted)">' + (s.detail || '无异常') + '</div></div>' +
          '<div style="text-align:right;flex-shrink:0">' +
            '<div style="font-size:11px;color:var(--weak)">' + s.date + '</div>' +
            '<div style="font-size:10.5px;margin-top:2px">' + issueText + '</div></div></div>';
      });
      if (tab === 'expert') return epRenderList(data.expertRecords, '专家履职记录', function(e) {
        var dotCls = e.statusCls || 'neutral';
        return '<div class="ep-hist-item">' +
          '<span class="ep-hist-dot ' + dotCls + '"></span>' +
          '<div style="flex:1;min-width:0;line-height:1.4">' +
            '<div style="font-size:12px;color:var(--text);font-weight:500">' + e.expert + ' · ' + e.type + '</div>' +
            '<div style="font-size:11px;color:var(--muted)">' + e.result + '</div></div>' +
          '<div style="text-align:right;flex-shrink:0">' +
            '<div style="font-size:11px;color:var(--weak)">' + e.date + '</div>' +
            '<div style="font-size:10px;margin-top:2px;color:var(--weak)">' + e.org + '</div></div></div>';
      });
      if (tab === 'training') return epRenderList(data.trainingRecords, '培训记录', function(t) {
        return '<div class="ep-hist-item">' +
          '<span class="ep-hist-dot done"></span>' +
          '<div style="flex:1;min-width:0;line-height:1.4">' +
            '<div style="font-size:12px;color:var(--text);font-weight:500">' + t.type + ' · ' + t.instructor + '</div>' +
            '<div style="font-size:11px;color:var(--muted)">' + t.detail + '</div></div>' +
          '<div style="text-align:right;flex-shrink:0">' +
            '<div style="font-size:11px;color:var(--weak)">' + t.date + '</div>' +
            '<div style="font-size:10.5px;margin-top:2px;color:var(--green)">' + t.attendees + ' 人</div></div></div>';
      });
      if (tab === 'dimensions') {
        var html =
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
          '<div style="font-size:14px;font-weight:700">主体责任 7 维度评估</div>' +
          '<button onclick="epSwitchTab(\'overview\')" style="width:24px;height:24px;border:none;border-radius:6px;background:transparent;color:var(--weak);cursor:pointer;display:grid;place-items:center" onmouseover="this.style.background=\'#f2f4f7\'" onmouseout="this.style.background=\'transparent\'"><i data-lucide="x" width="14" height="14"></i></button>' +
        '</div>';
        for (var di = 0; di < data.dimensions.length; di++) {
          var dim = data.dimensions[di];
          html += '<div class="ep-dim-card"><div class="ep-dim-top"><div class="ep-dim-label"><i data-lucide="' + dim.icon + '" width="14" height="14"></i>' + dim.label + '</div><span class="ep-dim-badge ' + dim.score.toLowerCase() + '">' + dim.score + '</span></div><div class="ep-dim-body">' + dim.text + '</div><div class="ep-dim-bar"><i class="' + dim.bar + '"></i></div></div>';
        }
        return html;
      }
      return '';
    }

    function epRenderHazardCards(hazards) {
      var html =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<div style="font-size:14px;font-weight:700">隐患记录（' + hazards.length + '）</div>' +
        '<button onclick="epSwitchTab(\'overview\')" style="width:24px;height:24px;border:none;border-radius:6px;background:transparent;color:var(--weak);cursor:pointer;display:grid;place-items:center" onmouseover="this.style.background=\'#f2f4f7\'" onmouseout="this.style.background=\'transparent\'"><i data-lucide="x" width="14" height="14"></i></button>' +
      '</div>';
      for (var i = 0; i < hazards.length; i++) {
        var h = hazards[i];
        html += '<div class="hazard-card" style="cursor:pointer;margin-bottom:8px" onclick="openHazardDetail(\'' + h.object.replace(/'/g, "\\'") + '\',\'' + h.foundDate + '\')">' +
          '<div class="hc-head"><span class="hc-name">' + escapeHtml(h.object) + '</span></div>' +
          '<div class="hc-desc">' + escapeHtml(h.hazard) + '</div>' +
          '<div class="hc-meta">' +
            '<span>来源 ' + escapeHtml(h.source) + '</span>' +
            '<span class="hc-status ' + h.statusCls + '">' + h.status + '</span>' +
            '<span>逾期 ' + (h.overdue > 0 ? h.overdue + '天' : '—') + '</span>' +
          '</div>' +
          '<div class="hc-time">' + h.foundDate + ' → ' + h.deadline + '</div>' +
          '<div class="hc-actions">' +
            (h.status === '已完成' ?
              '<button class="hc-btn" onclick="event.stopPropagation();showToast(\'复查记录已提交\')"><i data-lucide="check-circle" width="11" height="11"></i> 复查确认</button>' +
              '<button class="hc-btn" onclick="event.stopPropagation();openHazardDetail(\'' + h.object.replace(/'/g, "\\'") + '\',\'' + h.foundDate + '\')"><i data-lucide="file-text" width="11" height="11"></i> 查看详情</button>'
            :
              '<button class="hc-btn" onclick="event.stopPropagation();openDrawer(\'supervise\')"><i data-lucide="megaphone" width="11" height="11"></i> 督办</button>' +
              '<button class="hc-btn" onclick="event.stopPropagation();openDrawer(\'inspect\')"><i data-lucide="search" width="11" height="11"></i> 现场核查</button>' +
              '<button class="hc-btn" data-yaq-track="hc"><i data-lucide="pin" width="11" height="11"></i> 跟踪</button>'
            ) +
          '</div>' +
        '</div>';
      }
      return html;
    }

    function epRenderRecentHazards(hazards) {
      if (!hazards || hazards.length === 0) return '<div style="text-align:center;padding:20px 0;color:var(--weak);font-size:13px">暂无隐患记录</div>';
      var sorted = hazards.slice().sort(function(a, b) { return a.foundDate < b.foundDate ? 1 : -1; });
      var recent = sorted.slice(0, 3);
      var html = '<div style="font-size:13px;font-weight:700;margin-bottom:8px">最近隐患</div>';
      for (var i = 0; i < recent.length; i++) {
        var h = recent[i];
        var overdueLabel = h.overdue > 0 ? '<span style="color:var(--red);font-weight:600">逾期 ' + escapeHtml(h.overdue) + ' 天</span>' : '<span style="color:var(--weak)">—</span>';
        html += '<div class="hazard-card" style="cursor:pointer;margin-bottom:8px" onclick="openHazardDetail(\'' + h.object.replace(/'/g, "\\'") + '\',\'' + h.foundDate + '\')">' +
          '<div class="hc-head"><span class="hc-name">' + escapeHtml(h.object) + '</span></div>' +
          '<div class="hc-desc">' + escapeHtml(h.hazard) + '</div>' +
          '<div class="hc-meta">' +
            '<span>来源 ' + escapeHtml(h.source) + '</span>' +
            '<span class="hc-status ' + h.statusCls + '">' + h.status + '</span>' +
            '<span>逾期 ' + (h.overdue > 0 ? h.overdue + '天' : '—') + '</span>' +
          '</div>' +
          '<div class="hc-time">' + h.foundDate + ' → ' + h.deadline + '</div>' +
          '<div class="hc-actions">' +
            (h.status === '已完成' ?
              '<button class="hc-btn" onclick="event.stopPropagation();showToast(\'复查记录已提交\')"><i data-lucide="check-circle" width="11" height="11"></i> 复查确认</button>' +
              '<button class="hc-btn" onclick="event.stopPropagation();openHazardDetail(\'' + h.object.replace(/'/g, "\\'") + '\',\'' + h.foundDate + '\')"><i data-lucide="file-text" width="11" height="11"></i> 查看详情</button>'
            :
              '<button class="hc-btn" onclick="event.stopPropagation();openDrawer(\'supervise\')"><i data-lucide="megaphone" width="11" height="11"></i> 督办</button>' +
              '<button class="hc-btn" onclick="event.stopPropagation();openDrawer(\'inspect\')"><i data-lucide="search" width="11" height="11"></i> 现场核查</button>' +
              '<button class="hc-btn" data-yaq-track="hc"><i data-lucide="pin" width="11" height="11"></i> 跟踪</button>'
            ) +
          '</div>' +
        '</div>';
      }
      if (hazards.length > 3) {
        html += '<div style="text-align:center;margin-top:4px;font-size:11px;color:var(--weak)">共 ' + hazards.length + ' 条隐患，点击上方「隐患数」查看全部</div>';
      }
      return html;
    }

    function epRenderList(items, title, itemFn) {
      var html =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<div style="font-size:14px;font-weight:700">' + title + '（' + items.length + '）</div>' +
        '<button onclick="epSwitchTab(\'overview\')" style="width:24px;height:24px;border:none;border-radius:6px;background:transparent;color:var(--weak);cursor:pointer;display:grid;place-items:center" onmouseover="this.style.background=\'#f2f4f7\'" onmouseout="this.style.background=\'transparent\'"><i data-lucide="x" width="14" height="14"></i></button>' +
      '</div>';
      for (var i = 0; i < items.length; i++) {
        html += itemFn(items[i]);
      }
      if (items.length === 0) html += '<div style="text-align:center;padding:24px 0;color:var(--weak);font-size:13px">暂无记录</div>';
      return html;
    }

    function fallbackCopy(text, msg) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast(msg || '已复制');
      } catch(e) {
        showToast('复制失败，请手动选择');
      }
      document.body.removeChild(ta);
    }

    YAQ.openHazardDetail = openHazardDetail;
    YAQ.closeHazardModal = closeHazardModal;
    YAQ.copyHazardInfo = copyHazardInfo;


    // ════════════════════════════════════════════════════════════════
    // METRIC DRILLDOWN — 浮动层（左：列表 + 右：AI 分析）
    // ════════════════════════════════════════════════════════════════

    function openMetricDrilldown(el) {
      if (!el) return;
      var drilldownStr = el.getAttribute('data-drilldown');
      if (!drilldownStr) return;
      var items;
      try { items = JSON.parse(drilldownStr); } catch(e) { return; }

      var aiStr = el.getAttribute('data-ai') || null;
      var aiItems;
      if (aiStr) { try { aiItems = JSON.parse(aiStr); } catch(e) {} }

      var labelEl = el.querySelector('.mc-label');
      var label = labelEl ? labelEl.textContent.trim() : '详情';

      $dom.drillTitle.innerHTML = '<i data-lucide="list" aria-hidden="true"></i> ' + label;

      var listHtml = '<div class="drill-list">';
      listHtml += '<div class="drill-list-summary">共 <strong>' + items.length + '</strong> 项</div>';

      // 条线筛选条
      var allLines = [];
      for (var li = 0; li < items.length; li++) {
        var ln = items[li].line || '其他';
        if (allLines.indexOf(ln) === -1) allLines.push(ln);
      }
      if (allLines.length > 1) {
        listHtml += '<div class="drill-filter" id="drillFilter">' +
          '<span class="df-btn active" data-line="all">全部</span>';
        for (var fi = 0; fi < allLines.length; fi++) {
          listHtml += '<span class="df-btn" data-line="' + allLines[fi] + '">' + allLines[fi] + '</span>';
        }
        listHtml += '</div>';
      }

      for (var ii = 0; ii < items.length; ii++) {
        var it = items[ii];
        var statusCls = it.statusCls || 'neutral';
        var overdueHtml = it.overdue > 0 ? '<span class="drill-item-overdue">逾期 ' + it.overdue + '天</span>' : '';
        listHtml += '<div class="drill-item" data-line="' + (it.line || '其他') + '" onclick="openHazardDetail(\'' + it.name.replace(/'/g, "\\'") + '\')" title="点击查看详情" style="cursor:pointer">' +
          '<div class="drill-item-head">' +
            '<span class="drill-item-title">' + it.name + '</span>' +
            (it.line ? '<span class="drill-item-line">' + it.line + '</span>' : '') +
            '<span class="drill-item-badge ' + statusCls + '">' + (it.statusText || it.status || '') + '</span>' +
            overdueHtml +
          '</div>' +
          '<div class="drill-item-desc">' + it.detail + '</div>' +
          '<div class="drill-item-meta">' +
            (it.person ? '<span class="dim-meta"><i data-lucide="user" width="10" height="10" aria-hidden="true"></i>' + it.person + '</span>' : '') +
            (it.source ? '<span class="dim-meta"><i data-lucide="clipboard-check" width="10" height="10" aria-hidden="true"></i>' + it.source + '</span>' : '') +
            (it.region ? '<span class="dim-meta"><i data-lucide="map-pin" width="10" height="10" aria-hidden="true"></i>' + it.region + '</span>' : '') +
          '</div>' +
          '<div class="drill-item-dates">' +
            '<span>发现 ' + (it.foundDate || '—') + ' → 期限 ' + (it.deadline || '—') + '</span>' +
          '</div>' +
        '</div>';
      }
      listHtml += '</div>';

      // 右侧：AI 分析（对话式）
      var labelColors = {
        '关联分析': 'corr', '交叉验证': 'xval', '特征分析': 'trend', '风险推演': 'proj',
        '趋势分析': 'trend', '根因分析': 'xval', '优先级建议': 'corr', '资源评估': 'proj'
      };
      var initialMsgHtml = '';
      if (aiItems && aiItems.length > 0) {
        for (var ai = 0; ai < aiItems.length; ai++) {
          var a = aiItems[ai];
          var cls = labelColors[a.label] || 'corr';
          initialMsgHtml += '<div class="drill-analysis">' +
            '<span class="drill-analysis-label ' + cls + '">' + a.label + '</span>' +
            '<div class="drill-analysis-text">' + a.text.replace(/\n/g, '<br>') + '</div>' +
          '</div>';
        }
      } else {
        initialMsgHtml = '<div style="font-size:12px;color:var(--weak);padding:20px 0;text-align:center">暂无 AI 分析数据</div>';
      }

      // 存储上下文，供追问使用
      window.__drillContext = { label: label, items: items, aiItems: aiItems || [] };

      var aiHtml =
        '<div class="drill-ai">' +
          '<div class="drill-ai-head"><i data-lucide="sparkles" aria-hidden="true"></i> AI 分析</div>' +
          '<div class="drill-ai-conv" id="drillAiConv">' +
            '<div class="dmsg agent"><div class="dmsg-bubble">' + initialMsgHtml + '</div></div>' +
          '</div>' +
          '<div class="drill-ai-bar">' +
            '<input class="dmsg-input" id="dmsgInput" placeholder="追问..." onkeydown="if(event.key==\'Enter\')askAI()">' +
            '<button class="dmsg-send" onclick="askAI()"><i data-lucide="send" width="14" height="14"></i></button>' +
          '</div>' +
        '</div>';

      $dom.drillBody.innerHTML = listHtml + aiHtml;

      // 条线筛选
      var filterEl = $dom.drillFilter;
      if (filterEl) {
        filterEl.onclick = function(e) {
          var btn = e.target.closest('.df-btn');
          if (!btn) return;
          var line = btn.getAttribute('data-line');
          // 高亮当前按钮
          filterEl.querySelectorAll('.df-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          // 显示/隐藏条目
          var items = document.querySelectorAll('.drill-item');
          for (var fi = 0; fi < items.length; fi++) {
            if (line === 'all' || items[fi].getAttribute('data-line') === line) {
              items[fi].style.display = '';
            } else {
              items[fi].style.display = 'none';
            }
          }
        };
      }

      lucide.createIcons();

      $dom.drillFloat.classList.add('open');
      $dom.drillOverlay.classList.add('open');
    }

    function closeDrillFloat() {
      $dom.drillFloat.classList.remove('open');
      $dom.drillOverlay.classList.remove('open');
    }

    // ─── AI 追问 ────────────────────────────────────────────────
    function askAI() {
      var input = document.getElementById('dmsgInput');
      if (!input) return;
      var q = input.value.trim();
      if (!q) return;
      input.value = '';

      var ctx = window.__drillContext || {};
      var label = ctx.label || '';
      var items = ctx.items || [];
      var aiItems = ctx.aiItems || [];

      var conv = $dom.drillAiConv;
      if (!conv) return;

      // 用户消息
      conv.innerHTML += '<div class="dmsg user"><div class="dmsg-bubble">' + q + '</div></div>';
      conv.scrollTop = conv.scrollHeight;

      // 生成上下文相关的 mock 回答
      var answer = generateAIAnswer(q, label, items, aiItems);

      // 模拟 AI 思考延迟
      setTimeout(function() {
        conv.innerHTML += '<div class="dmsg agent"><div class="dmsg-bubble">' + answer + '</div></div>';
        conv.scrollTop = conv.scrollHeight;
        lucide.createIcons();
      }, 600);
    }

    function generateAIAnswer(q, label, items, aiItems) {
      var ql = q.toLowerCase();

      // 提取条线信息
      var lineNames = [];
      var lineMap = {};
      for (var i = 0; i < items.length; i++) {
        var ln = items[i].line || '其他';
        if (lineNames.indexOf(ln) === -1) lineNames.push(ln);
        if (!lineMap[ln]) lineMap[ln] = 0;
        lineMap[ln]++;
      }

      // 按关键词匹配回答
      if (ql.indexOf('人手') > -1 || ql.indexOf('饱和') > -1 || ql.indexOf('人力') > -1) {
        // 人手/饱和类问题
        var parts = [];
        for (var li = 0; li < lineNames.length; li++) {
          var ln = lineNames[li];
          var count = lineMap[ln];
          if (ln === '消防安全组') {
            parts.push(ln + '当前在岗4人，日均需要处理复查+新增约6.8项/人·天。参考行业标准4-5项/人·天，人力已超饱和36%-70%。建议优先从其他条线调配1-2名支援人员，或协商延期非紧急复查任务。');
          } else if (ln === '企业安全组') {
            parts.push(ln + '当前在岗6人，日均处理约4.5项/人·天，处于合理范围。但5家异常主体集中在良渚片区，建议优化巡查路线避免跨片区耗时。');
          } else {
            parts.push(ln + '当前工作量处于正常范围，暂无瓶颈。');
          }
        }
        return parts.join('<br><br>');
      }

      if (ql.indexOf('企业') > -1 || ql.indexOf('配合') > -1 || ql.indexOf('不配合') > -1) {
        // 企业配合度问题
        return '从数据看，' + label + '涉及的企业配合度存在差异：<br><br>' +
          '• ' + items.map(function(it) {
            var status = it.status === '超期' ? '配合度低（超期未响应）' :
                         it.status === '未启动' ? '尚未启动整改' :
                         it.status === '整改中' ? '整改推进中' : '状态待确认';
            return '<strong>' + it.name + '</strong>：' + status;
          }).join('<br>• ') +
          '<br><br>建议：对长期不配合的企业（如北苑商业综合体、余杭天元纺织厂），升级为站长约谈或联合执法，避免单个主体拖累整体指标。';
      }

      if (ql.indexOf('怎么') > -1 || ql.indexOf('建议') > -1 || ql.indexOf('解决') > -1 || ql.indexOf('措施') > -1) {
        // 措施建议
        var sug = [];
        if (lineNames.indexOf('消防安全组') > -1) {
          sug.push('• 消防安全组：优先清理北苑商业综合体（超期最久，逾期3天）和云栖高层住宅，建议今日安排现场核查。同时排查复查人力饱和度问题，必要时申请临时增援。');
        }
        if (lineNames.indexOf('企业安全组') > -1) {
          sug.push('• 企业安全组：杭州恒源化工有限公司已有整改方案建议加快审批，杭州鑫盛机械制造有限公司和余杭天元纺织厂需从企业端推动——建议通知属地村社协助督促。');
        }
        sug.push('• 系统性建议：将良渚片区作为本周重点关注区域，安排一次集中巡查，系统性解决片区企业自查缺失问题。');
        return sug.join('<br><br>');
      }

      if (ql.indexOf('上周') > -1 || ql.indexOf('环比') > -1 || ql.indexOf('趋势') > -1 || ql.indexOf('变化') > -1) {
        return '近一周趋势：<br><br>' +
          '• ' + label + '较上周同期增加' + (items.length > 3 ? '2项' : '1项') + '。<br>' +
          '• 消防安全组超期项从上周的1项增加到2项，恶化趋势明显。<br>' +
          '• 企业安全组整改推进中，暂无新增超期，趋势平稳。<br><br>' +
          '如果超期项下周仍未解决，建议启动二级升级机制（站长约谈）。';
      }

      if (ql.indexOf('谁') > -1 || ql.indexOf('负责') > -1 || ql.indexOf('责任人') > -1) {
        return '当前责任人分布：<br><br>' +
          items.map(function(it) {
            return '• <strong>' + it.name + '</strong> → ' + (it.person || '未指定') + '（' + (it.line || '—') + '）';
          }).join('<br>') +
          '<br><br>其中王志安和李明名下各有1项超期，建议先确认他们当前的复查任务量是否饱和。';
      }

      // 默认回答
      return '这是一个好问题。当前' + label + '共' + items.length + '项，涉及' + lineNames.join('、') + '等条线。' +
        '从数据关联来看，主要矛盾集中在：<br><br>' +
        '1. <strong>复查人力瓶颈</strong>：消防安全组复查闭环率68%，低于站均值6pp，人力已超饱和。<br>' +
        '2. <strong>企业端配合度</strong>：良渚片区多家企业自查为0，安全主体责任落实不到位。<br>' +
        '3. <strong>反复性问题</strong>：北苑商业综合体消防通道堵塞已发生3次，需从管理机制入手。<br><br>' +
        '建议进一步排查具体细节，或者你可以问更具体的问题，如"人手够不够？""企业不配合怎么办？"。';
    }

    function toggleRegulation() {
      var body = $dom.regulationBody;
      var arrow = $dom.regArrow;
      if (!body) return;
      var isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      arrow.textContent = isOpen ? '▶' : '▼';
    }
    YAQ.toggleRegulation = toggleRegulation;

    // ════════════════════════════════════════════════════════════════
    // TASK DETAIL

    // ════════════════════════════════════════════════════════════════
    // TASK DETAIL
    // ════════════════════════════════════════════════════════════════

    function openTaskDetail(taskName) {
      var tasks = MOCK.tasks;
      var task = null;
      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].name === taskName) { task = tasks[i]; break; }
      }
      if (!task) { showToast('未找到任务数据'); return; }

      $dom.taskModalName.textContent = task.name;

      var rateNum = parseInt(task.rate) || 0;
      var statusCls = task.statusCls || 'neutral';
      var riskColor = task.risk === '重大风险' ? 'var(--red)' : task.risk === '较大风险' ? '#d97706' : 'var(--muted)';

      // ── 左栏：任务详情 ──
      var leftHtml = '';

      // 状态 + 进度
      leftHtml += '<div class="task-detail-section">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
          '<span class="td-status-badge ' + statusCls + '">' + (task.status || task.type + '任务') + '</span>' +
          (task.risk !== '-' && task.risk ? '<span class="td-risk-tag high" style="background:color-mix(in oklch, ' + riskColor + ' 12%, transparent);color:' + riskColor + '">' + task.risk + '</span>' : '') +
          (task.lag ? '<span style="font-size:10px;font-weight:600;color:var(--red);background:var(--red-soft);padding:2px 8px;border-radius:999px">滞后</span>' : '') +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
          '<div style="flex:1;height:6px;border-radius:999px;background:#f0f2f5;overflow:hidden">' +
            '<div style="width:' + rateNum + '%;height:100%;border-radius:999px;background:' + (task.lag ? '#dc2626' : (rateNum >= 90 ? 'var(--green)' : '#d97706')) + '"></div>' +
          '</div>' +
          '<span style="font-size:13px;font-weight:700;color:' + (task.lag ? '#dc2626' : (rateNum >= 90 ? 'var(--green)' : '#d97706')) + '">' + task.rate + '</span>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--weak)">完成率 ' + task.rate + ' · 时间进度 ' + (task.progress || '-') + '</div>' +
      '</div>';

      // 任务描述
      if (task.desc) {
        leftHtml += '<div class="task-detail-section">' +
          '<div class="task-detail-label">任务说明</div>' +
          '<div class="task-detail-value">' + task.desc + '</div>' +
        '</div>';
      }

      // 基本信息表
      leftHtml += '<div class="task-detail-section">' +
        '<div class="task-detail-label">基本信息</div>' +
        '<table class="task-detail-table">' +
          '<tr><td>类型</td><td>' + (task.type === '日常' ? '日常任务' : '专项任务') + '</td></tr>' +
          '<tr><td>条线</td><td>' + (task.line || '—') + '</td></tr>' +
          '<tr><td>创建人</td><td>' + (task.creator || '—') + '</td></tr>' +
          '<tr><td>责任人</td><td>' + (task.person || '—') + '</td></tr>' +
          '<tr><td>区域</td><td>' + (task.region || '—') + '</td></tr>' +
          '<tr><td>开始时间</td><td>' + task.startDate + '</td></tr>' +
          '<tr><td>截止时间</td><td>' + task.endDate + '</td></tr>' +
        '</table>' +
      '</div>';

      // 覆盖统计
      leftHtml += '<div class="task-detail-section">' +
        '<div class="task-detail-label">覆盖统计</div>' +
        '<table class="task-detail-table">' +
          '<tr><td>已覆盖</td><td>' + task.covered + ' 家</td></tr>' +
          '<tr><td>隐患总数</td><td>' + (task.hazards !== '-' ? task.hazards : '—') + ' 项</td></tr>' +
          '<tr><td>重大隐患</td><td>' + (task.majorHazards !== '-' ? task.majorHazards : '—') + ' 项</td></tr>' +
        '</table>' +
      '</div>';

      // 关联事项（变为可点击下钻到隐患详情）
      if (task.relatedItems && task.relatedItems.length > 0) {
        leftHtml += '<div class="task-detail-section">' +
          '<div class="task-detail-label">关联事项</div>';
        for (var ri = 0; ri < task.relatedItems.length; ri++) {
          var item = task.relatedItems[ri];
          var hazardName = item.split('·')[0].trim();
          leftHtml += '<div class="td-related-item" style="cursor:pointer" onclick="closeTaskModal();openHazardDetail(\'' + hazardName.replace(/'/g, "\\'") + '\')">' +
            '<i data-lucide="chevron-right" width="12" height="12"></i>' + item +
          '</div>';
        }
        leftHtml += '</div>';
      }

      $dom.taskModalLeft.innerHTML = leftHtml;

      // ── 右栏：AI 分析侧边栏 ──
      var rightHtml = '';

      // 诊断摘要
      if (task.lag) {
        var diagColor = task.statusCls === 'danger' ? 'danger' : 'warning';
        var diagParts = [];
        if (rateNum === 0) diagParts.push('完成率为 0%');
        else if (rateNum < 50) diagParts.push('完成率仅 ' + task.rate);
        if (parseInt(task.progress) >= 100 && rateNum < 50) diagParts.push('时间进度已到但任务未过半');
        diagParts.push('需重点关注');
        rightHtml += '<div class="tma-block ' + diagColor + '">' +
          '<div class="tma-label">AI 诊断</div>' +
          '<div class="tma-item" style="font-weight:600;color:' + (task.statusCls === 'danger' ? 'var(--red)' : '#a75605') + '">⚠ ' + diagParts.join('，') + '</div>' +
        '</div>';
      } else {
        rightHtml += '<div class="tma-block" style="border-color:#c8e6c9;background:#f1faf5">' +
          '<div class="tma-label">AI 诊断</div>' +
          '<div class="tma-item" style="color:var(--green);font-weight:600">✅ 任务推进正常</div>' +
        '</div>';
      }

      // 定位分析：条线 → 区域 → 责任
      rightHtml += '<div class="tma-block">' +
        '<div class="tma-label">定位分析</div>';
      if (task.line) rightHtml += '<div class="tma-item"><span class="tma-dot orange"></span>条线：' + task.line + '</div>';
      if (task.region) rightHtml += '<div class="tma-item"><span class="tma-dot orange"></span>区域：' + task.region + '</div>';
      if (task.person) rightHtml += '<div class="tma-item"><span class="tma-dot orange"></span>责任：' + task.person + '</div>';
      rightHtml += '</div>';

      // 关联对象
      if (task.relatedItems && task.relatedItems.length > 0) {
        rightHtml += '<div class="tma-block">' +
          '<div class="tma-label">关联对象</div>';
        for (var ri = 0; ri < task.relatedItems.length; ri++) {
          var item = task.relatedItems[ri];
          var hazardName = item.split('·')[0].trim();
          rightHtml += '<span class="tma-chip" onclick="closeTaskModal();openHazardDetail(\'' + hazardName.replace(/'/g, "\\'") + '\')">' + item + '</span>';
        }
        rightHtml += '</div>';
      }

      // 建议动作
      rightHtml += '<div class="tma-block">' +
        '<div class="tma-label">建议动作</div>' +
        (task.lag ? '<div class="tma-item"><span class="tma-dot red"></span>发起督办</div>' : '') +
        '<div class="tma-item"><span class="tma-dot ' + (task.lag ? 'red' : 'green') + '"></span>现场核查</div>' +
        '<div class="tma-item"><span class="tma-dot ' + (task.lag ? 'red' : 'green') + '"></span>会议议题</div>' +
        '<div class="tma-item"><span class="tma-dot orange"></span>持续跟踪</div>' +
      '</div>';

      $dom.taskModalRight.innerHTML = rightHtml;

      lucide.createIcons();
      $dom.taskModalOverlay.style.display = 'block';
      $dom.taskModal.style.display = 'flex';
    }

    function closeTaskModal() {
      $dom.taskModalOverlay.style.display = 'none';
      $dom.taskModal.style.display = 'none';
    }
    YAQ.openTaskDetail = openTaskDetail;
    YAQ.closeTaskModal = closeTaskModal;

    // ════════════════════════════════════════════════════════════════
    // SCENE SWITCHING
    // ════════════════════════════════════════════════════════════════

    var _switchTimer = null;  // 场景切换防重入定时器

    function switchScene(sceneId, force) {
      if (sceneId === state.activeScene && !force) return;

      // 取消上一次未完成的切换，防止竞态
      if (_switchTimer !== null) {
        clearTimeout(_switchTimer);
        _switchTimer = null;
      }

      state.activeScene = sceneId;

      // 非月报场景时隐藏侧边栏
      if (sceneId !== 'monthly-report') { hideMrSidebar(); }

      // Tab 管理：如果 sceneId 不在 tab 列表中，自动添加
      var found = false;
      for (var _ti = 0; _ti < tabs.length; _ti++) {
        if (tabs[_ti].id === sceneId) { found = true; break; }
      }
      if (!found) {
        tabs.push({ id: sceneId, label: sceneLabels[sceneId] || sceneId });
      }
      renderTabs();

      var ws = $dom.workspace;
      ws.classList.add('scanning');

      // 同步左栏场景高亮
      document.querySelectorAll('.nav-item[data-scene]').forEach(function(n) {
        n.classList.toggle('active', n.getAttribute('data-scene') === sceneId);
      });
      // 同步系统导航高亮
      document.querySelectorAll('.nav-item[data-page]').forEach(function(n) {
        n.classList.toggle('active', n.getAttribute('data-page') === sceneId);
      });

      // 同步右栏场景提示
      var chatBody = $dom.chatBody;
      var sceneNames = { dashboard: '📊 今日监管工作台', 'hazard-report': '⚠ 重大隐患整改日报', efficiency: '📈 履职效能分析', responsibility: '👥 主体责任评估', disposal: '🔁 分级处置闭环', 'pending-actions': '📋 待确认行动', 'supervision-track': '🔍 督办跟踪', 'monthly-report': '📅 月报' };

      _switchTimer = setTimeout(function() {
        _switchTimer = null;

        // 规则管理页特殊处理
        if (sceneId === 'rules') {
          if (window.renderRulesPage) window.renderRulesPage();
          renderTabs();
          ws.classList.remove('scanning');
          var name = '⚙ 规则引擎';
          chatBody.innerHTML += '<div class="msg agent"><div class="bubble">已切换到「' + name + '」，你可以在这里配置异常判定规则，或直接告诉 AI 你想加的规则。</div></div>';
          chatBody.scrollTop = chatBody.scrollHeight;
          showToast('已切换至「规则引擎」');
          return;
        }

        try {
          YAQ.renderScene(sceneId);
        } catch(e) {
          console.error('[YAQ] switchScene 渲染异常:', e);
          $dom.sceneContent.innerHTML = renderError('渲染异常', '场景切换时发生错误，请刷新页面或重试。' + (e.message ? ' (' + e.message + ')' : ''));
          lucide.createIcons();
        }
        renderTabs();
        ws.classList.remove('scanning');

        // AI 对话追加系统消息
        var name = sceneNames[sceneId] || sceneId;
        chatBody.innerHTML += '<div class="msg agent"><div class="bubble">已切换到「' + name + '」，你需要关注什么？</div></div>';
        chatBody.scrollTop = chatBody.scrollHeight;

        showToast('已切换至「' + name + '」');
      }, 250);
    }

    // ════════════════════════════════════════════════════════════════
    // BIND INTERACTIONS
    // ════════════════════════════════════════════════════════════════

    function bindInteractions() {
      // 左栏侧边导航点击 — 场景
      document.querySelectorAll('.nav-item[data-scene]').forEach(function(item) {
        item.addEventListener('click', function() {
          var scene = this.getAttribute('data-scene');
          if (['review', 'meeting'].indexOf(scene) > -1) {
            showToast('后续能力，敬请期待');
            return;
          }
          switchScene(scene);
        });
      });

      // 左栏侧边导航点击 — 系统页面（规则管理等）
      document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
        item.addEventListener('click', function() {
          var page = this.getAttribute('data-page');
          switchScene(page);
        });
      });

      // Drawer overlay close
      $dom.drawerOverlay.addEventListener('click', closeDrawer);
      $dom.drawerClose.addEventListener('click', closeDrawer);
      $dom.drawerCancel.addEventListener('click', closeDrawer);

      // Drawer confirm — 动态生成处置文案
      $dom.drawerConfirm.addEventListener('click', function() {
        var action = currentDrawerAction;

        // 督办批量确认 — 特殊处理
        if (action === 'supervise') {
          var superviseItems = document.querySelectorAll('.drawer-supervise-item');
          var count = superviseItems.length;
          $dom.drawerTitle.innerHTML = '<i data-lucide="check-circle" aria-hidden="true"></i> 督办已全部发起';
          $dom.drawerConfirm.textContent = '已完成';
          $dom.drawerConfirm.style.display = 'none';

          var resultHtml = '<div class="drawer-generated">' +
            '<div class="dr-gen-banner" style="background:var(--green-bg);color:var(--green)"><i data-lucide="check-circle" width="14" height="14" style="vertical-align:middle;margin-right:4px"></i> 已成功发起 ' + count + ' 条督办</div>' +
            '<div style="font-size:13px;color:var(--muted);line-height:1.6;padding:8px 0">督办通知已发送至各责任人，系统将自动跟踪反馈进度并在超期时提醒升级。</div>' +
            '<div class="dr-gen-actions">' +
              '<button class="dr-action-btn primary" onclick="closeDrawer();switchScene(\'followup\')" style="padding:6px 14px"><i data-lucide="list-checks" width="13" height="13"></i> 查看跟进事项</button>' +
              '<button class="dr-action-btn" onclick="closeDrawer()" style="padding:6px 14px"><i data-lucide="x" width="13" height="13"></i> 关闭</button>' +
            '</div>' +
          '</div>';
          $dom.drawerBody.innerHTML = resultHtml;
          $dom.drawerCancel.style.display = 'none';
          lucide.createIcons();
          showToast('✅ 已发起 ' + count + ' 条督办，通知已发送');
          return;
        }

        var content = drawerContent[action];
        if (!content) {
          closeDrawer();
          showToast('已生成，可继续编辑');
          return;
        }
        // 根据上下文生成处置文案
        var generated = generateDisposalText(action);
        // 替换 Drawer 内容为生成结果
        $dom.drawerTitle.innerHTML = '<i data-lucide="file-check" aria-hidden="true"></i> 已生成 — ' + content.title;
        $dom.drawerConfirm.textContent = '已完成';

        var resultHtml = '<div class="drawer-generated">' +
          '<div class="dr-gen-banner"><i data-lucide="sparkles" width="14" height="14" style="vertical-align:middle;margin-right:4px"></i> 以下文案可复制使用</div>' +
          '<div class="dr-gen-text" id="drawerGenText">' + generated.replace(/\n/g, '<br>') + '</div>' +
          '<div class="dr-gen-actions">' +
            '<button class="dr-action-btn primary" onclick="YAQ.copyDrawerGenerated()" style="padding:6px 14px"><i data-lucide="copy" width="13" height="13"></i> 复制文案</button>' +
            '<button class="dr-action-btn" data-yaq-track="dw" style="padding:6px 14px"><i data-lucide="pin" width="13" height="13"></i> 加入跟踪</button>' +
            '<button class="dr-action-btn" onclick="showToast(\'通知已发送\');closeDrawer()" style="padding:6px 14px"><i data-lucide="send" width="13" height="13"></i> 发送通知</button>' +
          '</div>' +
        '</div>';
        $dom.drawerBody.innerHTML = resultHtml;
        $dom.drawerCancel.style.display = 'none';
        lucide.createIcons();

        // 保存生成的文案供复制
        window.__lastGeneratedText = generated;
      });

      // Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          if ($dom.drawerPanel.classList.contains('open')) {
            closeDrawer();
          }
          // 关闭浮动对话面板
          var chatPanel = $dom.chatPanel;
          if (chatPanel.classList.contains('open')) {
            chatPanel.classList.remove('open');
            $dom.chatFab.style.display = 'flex';
          }
        }
      });

      // Priority item action buttons (delegated)
      $dom.sceneContent.addEventListener('click', function(e) {
        // ── 持续跟踪快捷按钮 ──
        var trackBtn = e.target.closest('[data-yaq-track]');
        if (trackBtn) {
          var kind = trackBtn.getAttribute('data-yaq-track');
          var card = trackBtn.closest('.hazard-card, .ht-actions');
          var drCard = trackBtn.closest('.dr-card');
          var drawerGen = trackBtn.closest('.drawer-generated');
          var trackTitle = '';
          if (card) {
            // 从 hazard-card 提取对象名和隐患描述
            var nameEl = card.querySelector('.hc-name');
            var descEl = card.querySelector('.hc-desc');
            trackTitle = (nameEl ? nameEl.textContent.trim() : '') + (descEl ? ' ' + descEl.textContent.trim() : '');
            // 如果是表格行内按钮(ht)，从表格行提取
            if (!trackTitle && kind === 'ht') {
              var row = trackBtn.closest('tr');
              if (row) {
                var cells = row.querySelectorAll('td');
                trackTitle = (cells[0] ? cells[0].textContent.trim() : '') + ' - ' + (cells[1] ? cells[1].textContent.trim() : '');
                YAQ.addTrack({ title: trackTitle, source: '隐患整改日报', responsibility: (cells[5] ? cells[5].textContent.trim() : '') });
              }
              e.stopPropagation();
              return;
            }
            // 普通 hazard-card：提取已有标题
            if (trackTitle) {
              YAQ.addTrack(trackTitle);
              e.stopPropagation();
              return;
            }
          } else if (drCard) {
            var nameEl = drCard.querySelector('.dr-hazard-name');
            trackTitle = nameEl ? nameEl.textContent.trim() : '跟踪事项';
            YAQ.addTrack({ title: trackTitle, source: '诊断处置' });
            e.stopPropagation();
            return;
          } else if (drawerGen) {
            var drawerPanel = document.getElementById('drawerPanel');
            var titleEl = drawerPanel ? drawerPanel.querySelector('#drawerTitle') : null;
            trackTitle = titleEl ? titleEl.textContent.trim() : '跟踪事项';
            YAQ.addTrack({ title: trackTitle, source: '处置生成' });
            closeDrawer();
            e.stopPropagation();
            return;
          }
          return;
        }

        var btn = e.target.closest('[data-pi-action]');
        if (btn) {
          var action = btn.getAttribute('data-pi-action');
          var actionMap = { '督办': 'supervise', '现场核查': 'inspect', '会议议题': 'meeting', '提醒履职': 'remind', '跟踪': 'briefing' };
          var mapped = actionMap[action];
          if (mapped) openDrawer(mapped);
          else showToast('已记录' + action + '操作');
          e.stopPropagation();
          return;
        }

        // Priority item click → drill down
        var item = e.target.closest('.priority-item');
        if (item) {
          var id = item.getAttribute('data-pi-id');
          showToast('查看#' + id + ' 详情（钻取功能）');
        }
      });
    }

    // ════════════════════════════════════════════════════════════════
    // AGENT ASK — 对话快捷按钮
    // ════════════════════════════════════════════════════════════════

    function agentAsk(sceneId) {
      var chatBody = $dom.chatBody;
      var sceneNames = { dashboard: '📊 今日监管工作台', 'hazard-report': '⚠ 重大隐患整改日报', efficiency: '📈 履职效能分析', responsibility: '👥 主体责任评估', disposal: '🔁 分级处置闭环', 'pending-actions': '📋 待确认行动', 'supervision-track': '🔍 督办跟踪', 'monthly-report': '📅 月报' };
      var name = sceneNames[sceneId] || sceneId;

      // 打开浮动面板
      openChatPanel();

      // 用户消息
      chatBody.innerHTML += '<div class="msg user"><div class="bubble">我想看「' + name + '」</div></div>';
      chatBody.scrollTop = chatBody.scrollHeight;

      // 切换到对应场景
      switchScene(sceneId);
    }

    // ════════════════════════════════════════════════════════════════
    // 发送聊天消息
    // ════════════════════════════════════════════════════════════════

    function sendChatMsg() {
      var input = $dom.chatInput;
      var text = input.value.trim();
      if (!text) return;
      var chatBody = $dom.chatBody;
      openChatPanel();
      chatBody.innerHTML += '<div class="msg user"><div class="bubble">' + escapeHtml(text) + '</div></div>';
      chatBody.scrollTop = chatBody.scrollHeight;
      input.value = '';
      // 模拟 AI 回复
      setTimeout(function() {
        chatBody.innerHTML += '<div class="msg agent"><div class="bubble">已收到你的问题，正在分析「' + escapeHtml(text) + '」…</div></div>';
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 400);
    }

    // ════════════════════════════════════════════════════════════════
    // 浮动对话面板开关
    // ════════════════════════════════════════════════════════════════

    function toggleChatPanel() {
      var panel = $dom.chatPanel;
      var fab = $dom.chatFab;
      var opening = !panel.classList.contains('open');
      panel.classList.toggle('open');
      fab.style.display = opening ? 'none' : 'flex';
    }

    function openChatPanel() {
      var panel = $dom.chatPanel;
      var fab = $dom.chatFab;
      if (!panel.classList.contains('open')) {
        panel.classList.add('open');
        fab.style.display = 'none';
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 指标配置
    // ════════════════════════════════════════════════════════════════

    function renderSelectedMetrics(metrics) {
      var order = window.__metricOrder || [];
      // 按存储顺序排序
      var checked = [];
      for (var i = 0; i < metrics.length; i++) {
        if (metrics[i].checked) checked.push(metrics[i]);
      }
      checked.sort(function(a, b) {
        var ai = order.indexOf(a.id);
        var bi = order.indexOf(b.id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
      var html = '';
      for (var j = 0; j < checked.length; j++) {
        var m = checked[j];
        var periodDisp = m.type === '时点' ? '截至目前' : m.period;
        var bCls = ({'截至目前':'current','今日':'today','本周':'week','本月':'month','本季':'quarter','本年':'year','近30天':'d30','累计':'cum'})[periodDisp] || '';
        var alertCls = m.alert ? ' alert-' + m.alert : '';
        // 卡片 hover 提示信息：desc + 基线对照（如有）
        var tipParts = [m.desc || ''];
        if (m.compare) tipParts.push('vs ' + m.compare.baselineLabel + ' ' + m.compare.baselineValue + '  ' + m.compare.delta);
        var tipText = tipParts.join('\n');
        html += '<div class="metric-card' + alertCls + (m.drilldown ? ' clickable' : '') + '" data-desc="' + (m.desc || '') + '" ' +
          (m.compare ? 'data-compare=\'' + JSON.stringify(m.compare).replace(/'/g,"&#39;") + '\' ' : '') +
          (m.drilldown ? 'data-drilldown=\'' + JSON.stringify(m.drilldown).replace(/'/g,"&#39;") + '\' ' : '') +
          (m.aiAnalysis ? 'data-ai=\'' + JSON.stringify(m.aiAnalysis).replace(/'/g,"&#39;") + '\' ' : '') +
          'onmouseenter="showMetricTip(event,this)" onmouseleave="hideMetricTip()"' +
          (m.drilldown ? ' onclick="openMetricDrilldown(this)"' : '') +
          '>' +
          (m.alert === 'danger' ? '<span class="mc-alert-badge">异常</span>' : (m.alert === 'warning' ? '<span class="mc-alert-badge">预警</span>' : '')) +
          '<div class="mc-value"' + (m.valueColor ? ' style="color:' + m.valueColor + '"' : '') + '>' + m.value +
            (m.compare ? '<span class="mc-delta ' + (m.compare.isBad ? 'bad' : 'good') + '">' + m.compare.delta + '</span>' : '') +
          '</div>' +
          (m.compare ? '<div class="mc-baseline">vs ' + m.compare.baselineLabel + ' ' + m.compare.baselineValue + '</div>' : '') +
          '<div class="mc-label">' + m.label + '</div>' +
          '<div class="mc-period ' + bCls + '">' + periodDisp + '</div>' +
        '</div>';
      }
      return html;
    }

    function cycleMetricPeriod(id) {
      var metrics = window.__allMetrics || [];
      for (var i = 0; i < metrics.length; i++) {
        if (metrics[i].id === id) {
          var m = metrics[i];
          if (!m.periods) return;
          var idx = m.periods.indexOf(m.period);
          m.period = m.periods[(idx + 1) % m.periods.length];
          renderMetricCheckboxes();
          break;
        }
      }
    }

    function openMetricConfig() {
      // 保存当前快照，用于取消时还原
      var metrics = window.__allMetrics || [];
      window.__metricSnapshot = [];
      for (var i = 0; i < metrics.length; i++) {
        window.__metricSnapshot.push({
          id: metrics[i].id,
          checked: metrics[i].checked,
          period: metrics[i].period
        });
      }
      // 清空搜索
      window.__metricSearch = '';
      var input = $dom.metricSearchInput;
      if (input) input.value = '';
      $dom.metricModalOverlay.style.display = 'block';
      $dom.metricModal.style.display = 'flex';
      renderMetricCheckboxes();
      lucide.createIcons();
    }

    function closeMetricConfig() {
      // 取消时还原快照
      var snap = window.__metricSnapshot || [];
      var metrics = window.__allMetrics || [];
      for (var i = 0; i < snap.length; i++) {
        for (var j = 0; j < metrics.length; j++) {
          if (metrics[j].id === snap[i].id) {
            metrics[j].checked = snap[i].checked;
            metrics[j].period = snap[i].period;
            break;
          }
        }
      }
      $dom.metricModalOverlay.style.display = 'none';
      $dom.metricModal.style.display = 'none';
    }

    function renderMetricCheckboxes() {
      var metrics = window.__allMetrics || [];
      var activeFilter = window.__metricFilter || '全部';
      var activePeriod = window.__metricPeriodFilter || '全部周期';
      // 分组筛选（业务视角，非全部分组）
      var filterGroupMap = {
        '全部': null,
        '今日关注': ['今日聚焦'],
        '隐患治理': ['隐患闭环', '重大隐患', '风险分类'],
        '监管执法': ['监管执法', '执法处置'],
        '履职效能': ['履职效能', '主体责任', '区域风险', '风险结构', '专项任务', '监管概况']
      };
      var filterLabels = Object.keys(filterGroupMap);
      var filterHtml = '';
      for (var f = 0; f < filterLabels.length; f++) {
        filterHtml += '<button class="modal-filter-tab' + (filterLabels[f] === activeFilter ? ' active' : '') + '" onclick="setMetricFilter(\'' + filterLabels[f] + '\')">' + filterLabels[f] + '</button>';
      }
      // 周期过滤标签
      var periodFilters = ['全部周期', '截至目前', '今日', '本周', '本月', '本季', '本年', '近30天', '累计'];
      filterHtml += '<span style="width:1px;height:18px;background:var(--line);margin:0 6px;display:inline-block;vertical-align:middle"></span>';
      for (var pf = 0; pf < periodFilters.length; pf++) {
        filterHtml += '<button class="modal-filter-tab' + (periodFilters[pf] === activePeriod ? ' active' : '') + '" onclick="setPeriodFilter(\'' + periodFilters[pf] + '\')">' + periodFilters[pf] + '</button>';
      }
      $dom.metricFilterTabs.innerHTML = filterHtml;

      // 按业务视角 + 周期 + 搜索过滤
      var activeGroups = activeFilter === '全部' ? null : (filterGroupMap[activeFilter] || null);
      var groups = {};
      for (var i = 0; i < metrics.length; i++) {
        var m = metrics[i];
        if (activeGroups && activeGroups.indexOf(m.group) === -1) continue;
        if (activePeriod !== '全部周期') {
          if (activePeriod === '截至目前') {
            if (m.type !== '时点' && m.period !== '截至目前') continue;
          } else if (activePeriod === '累计' && m.type !== '累计') continue;
          else if (m.period !== activePeriod) continue;
        }
        var searchQ = (window.__metricSearch || '').trim().toLowerCase();
        if (searchQ && m.label.toLowerCase().indexOf(searchQ) === -1) continue;
        if (!groups[m.group]) groups[m.group] = [];
        groups[m.group].push(m);
      }
      var html = '';
      var groupOrder = ['今日聚焦', '监管概况', '监管执法', '隐患闭环', '重大隐患', '主体责任', '履职效能', '区域风险', '风险结构', '专项任务', '执法处置', '风险分类'];
      function panelPeriodRange(type, period) {
        if (type === '时点') return '截至目前';
        if (period === '近30天') return '近30天';
        return period;
      }
      for (var g = 0; g < groupOrder.length; g++) {
        var groupName = groupOrder[g];
        var items = groups[groupName];
        if (!items) continue;
        html += '<div style="font-size:11px;font-weight:600;color:var(--weak);margin-bottom:8px;margin-top:' + (g > 0 ? '14px' : '0') + ';letter-spacing:0.03em">' + groupName + '</div>';
        html += '<div class="mc-grid">';
        for (var j = 0; j < items.length; j++) {
          var m = items[j];
          var periodDisp2 = panelPeriodRange(m.type, m.period);
          var bCls = ({'截至目前':'current','今日':'today','本周':'week','本月':'month','本季':'quarter','本年':'year','近30天':'d30','累计':'cum'})[periodDisp2] || '';
          var alertCls = m.alert ? ' alert-' + m.alert : '';
          html += '<div class="metric-card' + alertCls + (m.checked ? ' mc-active' : ' mc-dim') + '" data-id="' + m.id + '" onclick="toggleMiniCard(this)" data-desc="' + (m.desc || '') + '" onmouseenter="showMetricTip(event,this.getAttribute(\'data-desc\'))" onmouseleave="hideMetricTip()">' +
            '<span class="mc-checkmark"><i data-lucide="check" width="10" height="10"></i></span>' +
            '<div class="mc-value"' + (m.valueColor ? ' style="color:' + m.valueColor + '"' : '') + '>' + m.value + '</div>' +
            '<div class="mc-label">' + m.label + '</div>' +
            '<div class="mc-period ' + bCls + '">' + periodDisp2 + '</div>' +
          '</div>';
        }
        html += '</div>';
      }
      $dom.metricCheckboxes.innerHTML = html || '<div style="text-align:center;padding:30px 0;color:var(--weak);font-size:13px">该分组暂无指标</div>';

      // 渲染已选指标列表（拖拽排序）
      renderSelectedMetricsList();

      // 更新已选计数
      var allMet = window.__allMetrics || [];
      var checkedCount = 0;
      for (var ci = 0; ci < allMet.length; ci++) {
        if (allMet[ci].checked) checkedCount++;
      }
      var countEl = $dom.mfootCount;
      if (countEl) countEl.innerHTML = '已选 <strong>' + checkedCount + '</strong> 个指标';
    }

    function renderSelectedMetricsList() {
      var metrics = window.__allMetrics || [];
      var order = window.__metricOrder || [];
      var checked = [];
      for (var i = 0; i < metrics.length; i++) {
        if (metrics[i].checked) checked.push(metrics[i]);
      }
      checked.sort(function(a, b) {
        var ai = order.indexOf(a.id);
        var bi = order.indexOf(b.id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
      var html = '';
      for (var j = 0; j < checked.length; j++) {
        var m = checked[j];
        var periodDisp = m.type === '时点' ? '截至目前' : m.period;
        var bCls = ({'截至目前':'current','今日':'today','本周':'week','本月':'month','本季':'quarter','本年':'year','近30天':'d30','累计':'cum'})[periodDisp] || '';
        var alertCls2 = m.alert ? ' alert-' + m.alert : '';
        html += '<div class="metric-card sel-card-drag' + alertCls2 + '" draggable="true" data-id="' + m.id + '" ondragstart="onDragStart(event)" ondragover="onDragOver(event)" ondrop="onDrop(event)" ondragend="onDragEnd(event)" data-desc="' + (m.desc || '') + '" onmouseenter="showMetricTip(event,this.getAttribute(\'data-desc\'))" onmouseleave="hideMetricTip()">' +
          (m.alert === 'danger' ? '<span class="mc-alert-badge">异常</span>' : (m.alert === 'warning' ? '<span class="mc-alert-badge">预警</span>' : '')) +
          '<span class="sel-hover-remove" onclick="event.stopPropagation();removeSelected(\'' + m.id + '\')"><i data-lucide="x" width="10" height="10"></i></span>' +
          '<div class="mc-value"' + (m.valueColor ? ' style="color:' + m.valueColor + '"' : '') + '>' + m.value + '</div>' +
          '<div class="mc-label">' + m.label + '</div>' +
          '<div class="mc-period ' + bCls + '">' + periodDisp + '</div>' +
        '</div>';
      }
      $dom.selectedMetricsList.innerHTML = html;
      lucide.createIcons();
    }

    // ─── 拖拽排序 ─────────────────────────────────────────────────
    var _dragId = null;

    function onDragStart(e) {
      _dragId = e.target.closest('.sel-card-drag').getAttribute('data-id');
      e.target.closest('.sel-card-drag').classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    }

    function onDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      var target = e.target.closest('.sel-card-drag');
      if (!target) return;
      // 判断鼠标在目标卡片的左半还是右半
      var rect = target.getBoundingClientRect();
      var x = e.clientX - rect.left;
      if (x < rect.width / 2) {
        target.classList.add('drag-before');
        target.classList.remove('drag-after');
      } else {
        target.classList.add('drag-after');
        target.classList.remove('drag-before');
      }
    }

    function onDrop(e) {
      e.preventDefault();
      var target = e.target.closest('.sel-card-drag');
      if (!target || !_dragId) return;
      var targetId = target.getAttribute('data-id');
      if (_dragId === targetId) return;
      var insertBefore = target.classList.contains('drag-before');
      // 更新顺序
      var order = window.__metricOrder || [];
      var idx = order.indexOf(_dragId);
      if (idx > -1) order.splice(idx, 1);
      var targetIdx = order.indexOf(targetId);
      if (targetIdx > -1) {
        order.splice(insertBefore ? targetIdx : targetIdx + 1, 0, _dragId);
      } else {
        order.push(_dragId);
      }
      window.__metricOrder = order;
      renderSelectedMetricsList();
    }

    function onDragEnd(e) {
      document.querySelectorAll('.sel-card-drag.dragging, .sel-card-drag.drag-before, .sel-card-drag.drag-after').forEach(function(c) {
        c.classList.remove('dragging', 'drag-before', 'drag-after');
      });
      _dragId = null;
    }

    function removeSelected(id) {
      var metrics = window.__allMetrics || [];
      for (var i = 0; i < metrics.length; i++) {
        if (metrics[i].id === id) {
          metrics[i].checked = false;
          break;
        }
      }
      renderMetricCheckboxes();
    }

    function setMetricFilter(filter) {
      window.__metricFilter = filter;
      renderMetricCheckboxes();
    }

    function setPeriodFilter(filter) {
      window.__metricPeriodFilter = filter;
      renderMetricCheckboxes();
    }

    function onMetricSearch() {
      var input = $dom.metricSearchInput;
      window.__metricSearch = input ? input.value : '';
      renderMetricCheckboxes();
    }

    // ─── 指标说明浮层 ─────────────────────────────────────────────
    var _tipHideTimer = null;

    function showMetricTip(e, arg) {
      if (!arg) return;
      var tip = $dom.metricTip;
      var html = '';

      if (_tipHideTimer) {
        clearTimeout(_tipHideTimer);
        _tipHideTimer = null;
      }

      if (typeof arg === 'string') {
        html = '<div class="mt-desc">' + arg + '</div>';
      } else {
        var desc = arg.getAttribute('data-desc') || '';
        var compareStr = arg.getAttribute('data-compare') || null;
        var drilldownStr = arg.getAttribute('data-drilldown') || null;

        if (desc) {
          html += '<div class="mt-desc">' + desc + '</div>';
        }

        if (compareStr) {
          try {
            var compare = JSON.parse(compareStr);
            var deltaCls = compare.isBad ? 'bad' : 'good';
            html += '<div class="mt-compare">' +
              '<span class="mt-compare-label">基线对照</span>' +
              '<span class="mt-compare-value">' + compare.baselineLabel + ' ' + compare.baselineValue + '</span>' +
              '<span class="mt-delta ' + deltaCls + '">' + compare.delta + '</span>' +
            '</div>';
          } catch(e) {}
        }

        if (drilldownStr) {
          try {
            var items = JSON.parse(drilldownStr);
            var lineMap = {}, statusMap = {}, typeMap = {};
            for (var di = 0; di < items.length; di++) {
              var it = items[di];
              var ln = it.line || '其他';
              lineMap[ln] = (lineMap[ln] || 0) + 1;
              var st = it.status || '未知';
              statusMap[st] = (statusMap[st] || 0) + 1;
              var tp = it.type || '其他';
              typeMap[tp] = (typeMap[tp] || 0) + 1;
            }
            html += '<div class="mt-dims">';
            var lineKeys = Object.keys(lineMap);
            if (lineKeys.length > 0) {
              html += '<div class="mt-dim"><span class="mt-dim-label">涉及条线</span>';
              for (var li = 0; li < lineKeys.length; li++) {
                html += '<span class="mt-dim-item"><span class="mt-dim-name">' + lineKeys[li] + '</span><span class="mt-dim-count">' + lineMap[lineKeys[li]] + '项</span></span>';
              }
              html += '</div>';
            }
            var statusKeys = Object.keys(statusMap);
            if (statusKeys.length > 0) {
              html += '<div class="mt-dim"><span class="mt-dim-label">超期状态</span>';
              for (var si = 0; si < statusKeys.length; si++) {
                html += '<span class="mt-dim-item"><span class="mt-dim-name">' + statusKeys[si] + '</span><span class="mt-dim-count">' + statusMap[statusKeys[si]] + '项</span></span>';
              }
              html += '</div>';
            }
            var typeKeys = Object.keys(typeMap);
            if (typeKeys.length > 0) {
              html += '<div class="mt-dim"><span class="mt-dim-label">异常类型</span>';
              for (var ti = 0; ti < Math.min(typeKeys.length, 4); ti++) {
                html += '<span class="mt-dim-item"><span class="mt-dim-name">' + typeKeys[ti] + '</span><span class="mt-dim-count">' + typeMap[typeKeys[ti]] + '项</span></span>';
              }
              if (typeKeys.length > 4) html += '<span class="mt-dim-more">等' + typeKeys.length + '类</span>';
              html += '</div>';
            }
            html += '</div>';
          } catch(e) {}
        }

        // — 复制按钮 —
        html += '<button class="mt-copy-btn" onclick="copyTipContent(event)"><i data-lucide="copy" width="11" height="11" aria-hidden="true"></i> 复制</button>';
      }

      if (!html) return;
      tip.innerHTML = html;
      tip.classList.add('show');
      lucide.createIcons();

      // 鼠标进入浮层 → 取消隐藏
      tip.onmouseenter = function() {
        if (_tipHideTimer) { clearTimeout(_tipHideTimer); _tipHideTimer = null; }
      };
      // 离开浮层 → 立即消失
      tip.onmouseleave = function() {
        doHideTip(tip);
      };

      // 相对卡片固定位置（不跟随鼠标）
      if (arg && typeof arg !== 'string') {
        var cardRect = arg.getBoundingClientRect();
        var tipW = tip.offsetWidth || 260;
        var tipH = tip.offsetHeight || 200;
        // 默认在卡片下方居中
        var left = cardRect.left + cardRect.width / 2 - tipW / 2;
        var top = cardRect.bottom + 6;
        // 超出右边界 → 右对齐
        if (left + tipW > window.innerWidth - 8) left = window.innerWidth - tipW - 8;
        // 超出左边界 → 左对齐
        if (left < 8) left = 8;
        // 下方空间不够 → 放上方
        if (top + tipH > window.innerHeight - 8) top = cardRect.top - tipH - 6;
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
      }
    }

    function hideMetricTip() {
      if (_tipHideTimer) { clearTimeout(_tipHideTimer); _tipHideTimer = null; }
      _tipHideTimer = setTimeout(function() {
        var tip = $dom.metricTip;
        doHideTip(tip);
      }, 250);
    }

    function doHideTip(tip) {
      if (!tip) tip = $dom.metricTip;
      tip.onmouseenter = null;
      tip.onmouseleave = null;
      tip.classList.remove('show');
    }

    function copyTipContent(e) {
      if (e) e.stopPropagation();
      var tip = $dom.metricTip;
      if (!tip) return;

      var parts = [];

      // 描述
      var descEl = tip.querySelector('.mt-desc');
      if (descEl) parts.push(descEl.textContent.trim());

      // 基线对照
      var compareEl = tip.querySelector('.mt-compare');
      if (compareEl) {
        var cl = compareEl.querySelector('.mt-compare-label');
        var cv = compareEl.querySelector('.mt-compare-value');
        var cd = compareEl.querySelector('.mt-delta');
        var compareParts = [];
        if (cl) compareParts.push(cl.textContent.trim());
        if (cv) compareParts.push(cv.textContent.trim());
        if (cd) compareParts.push(cd.textContent.trim());
        if (compareParts.length) parts.push(compareParts.join('  '));
      }

      // 维度
      var dimsEl = tip.querySelector('.mt-dims');
      if (dimsEl) {
        var dimEls = dimsEl.querySelectorAll('.mt-dim');
        for (var di = 0; di < dimEls.length; di++) {
          var dim = dimEls[di];
          var labelEl = dim.querySelector('.mt-dim-label');
          var line = labelEl ? labelEl.textContent.trim() : '';
          var items = dim.querySelectorAll('.mt-dim-item');
          for (var ii = 0; ii < items.length; ii++) {
            var nameEl = items[ii].querySelector('.mt-dim-name');
            var countEl = items[ii].querySelector('.mt-dim-count');
            var name = nameEl ? nameEl.textContent.trim() : '';
            var count = countEl ? countEl.textContent.trim() : '';
            line += '\n  ' + name + '  ' + count;
          }
          parts.push(line);
        }
      }

    }


    function toggleMiniCard(el) {
      el.classList.toggle('mc-active');
      el.classList.toggle('mc-dim');
      // 同步更新数据
      var id = el.getAttribute('data-id');
      var metrics = window.__allMetrics || [];
      for (var i = 0; i < metrics.length; i++) {
        if (metrics[i].id === id) {
          metrics[i].checked = el.classList.contains('mc-active');
          break;
        }
      }
      renderSelectedMetricsList();
    }

    function saveMetricConfig() {
      var metrics = window.__allMetrics || [];
      var prefs = {};
      for (var i = 0; i < metrics.length; i++) {
        prefs[metrics[i].id] = metrics[i].checked;
      }
      ls.set('yaq_metric_prefs', JSON.stringify(prefs));
      // 保存排序
      if (window.__metricOrder) {
        ls.set('yaq_metric_order', JSON.stringify(window.__metricOrder));
      }
      ls.set('yaq_metric_ver', YAQ.STORAGE_VERSION);
      closeMetricConfig();
      // 重新渲染当前场景（用 try/catch 包裹，防止白屏）
      var sceneId = state.activeScene;
      var container = $dom.sceneContent;
      try {
        var html = '';
        switch (sceneId) {
        case 'dashboard': html = renderDashboard(); break;
        case 'hazard-report': html = renderHazardReport(); break;
        case 'efficiency': html = renderEfficiency(); break;
        case 'responsibility': html = renderResponsibility(); break;
        case 'disposal': html = renderDisposal(); break;
        case 'followup': html = renderFollowup(); break;
        case 'pending-actions': html = renderPendingActions(); break;
        case 'supervision-track': html = renderSupervisionTrack(); break;
        case 'monthly-report': html = renderMonthlyReport(); break;
      }
      container.innerHTML = html;
      lucide.createIcons();
      } catch(e) {
        console.error('[YAQ] saveMetricConfig 渲染异常:', e);
        container.innerHTML = '<div class="error-state"><i data-lucide="alert-triangle" width="32" height="32" style="color:var(--red)"></i><h3>渲染异常</h3><p>指标配置已保存，但渲染场景时发生错误，请刷新页面。</p></div>';
      }
      showToast('指标配置已保存');
    }

    // ════════════════════════════════════════════════════════════════
    // 全局搜索索引 — 从系统各数据源构建可搜索对象
    // ════════════════════════════════════════════════════════════════

    function $_escapeHtml(s) {
      return escapeHtml(s);
    }
    function $_highlight(s, q) {
      if (!q) return $_escapeHtml(s);
      var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      return $_escapeHtml(s).replace(re, '<mark>$1</mark>');
    }

    // 构建统一搜索索引
    var SEARCH_INDEX = null;
    function buildSearchIndex() {
      if (SEARCH_INDEX) return SEARCH_INDEX;
      SEARCH_INDEX = [];
      var seen = {};

      function add(type, id, label, subtitle, matchTexts, action, meta) {
        if (seen[id]) return;
        seen[id] = true;
        SEARCH_INDEX.push({
          type: type, id: id, label: label, subtitle: subtitle || '',
          matchTexts: typeof matchTexts === 'string' ? [matchTexts] : matchTexts,
          action: action,
          meta: meta || {}
        });
      }

      // ── 1. 人员 ──
      for (var hi = 0; hi < MOCK.hazards.length; hi++) {
        var h = MOCK.hazards[hi];
        if (h.person) {
          add('person', 'p-' + h.person, h.person, '责任人',
            [h.person, h.object],
            function(name) { return function(){ openEnterprisePanel(name); }}(h.object),
            { enterpriseCount: 0, hazardCount: 0 });
        }
        if (h.discoverer) {
          add('person', 'pd-' + h.discoverer, h.discoverer, '检查人',
            [h.discoverer],
            function(name){ return function(){ showToast('检查人：' + name); }}(h.discoverer),
            {});
        }
      }
      for (var ti = 0; ti < MOCK.tasks.length; ti++) {
        var t = MOCK.tasks[ti];
        if (t.person) {
          add('person', 'tp-' + t.person, t.person, '任务负责人',
            [t.person, t.name],
            function(name){ return function(){ showPersonTasks(name); }}(t.person),
            {});
        }
        if (t.creator && t.creator !== t.person) {
          add('person', 'tc-' + t.creator, t.creator, '任务创建人',
            [t.creator],
            function(name){ return function(){ showPersonTasks(name); }}(t.creator),
            {});
        }
      }
      for (var ei = 0; ei < MOCK.abnormalEvents.length; ei++) {
        var ae = MOCK.abnormalEvents[ei];
        if (ae.chain && ae.chain.responsible) {
          add('person', 'ae-' + ae.chain.responsible, ae.chain.responsible, '异常责任人',
            [ae.chain.responsible, ae.subjectName],
            function(name){ return function(){ openEnterprisePanel(name); }}(ae.subjectName),
            {});
        }
      }

      // ── 2. 企业/场所 ──
      for (var hi2 = 0; hi2 < MOCK.hazards.length; hi2++) {
        var h2 = MOCK.hazards[hi2];
        add('enterprise', 'eh-' + h2.object, h2.object,
          (h2.level || '') + (h2.status === '超期未整改' ? ' · 超期未整改' : ''),
          [h2.object, h2.hazard, h2.region],
          function(name){ return function(){ openEnterprisePanel(name); }}(h2.object),
          { region: h2.region || '', level: h2.level || '', status: h2.status || '' });
      }
      for (var si = 0; si < MOCK.subjects.length; si++) {
        var s = MOCK.subjects[si];
        add('enterprise', 'es-' + s.name, s.name,
          '主体责任异常 · ' + (s.risk === 'high' ? '高风险' : s.risk === 'mid' ? '一般风险' : '低风险'),
          [s.name],
          function(name){ return function(){ openEnterprisePanel(name); }}(s.name),
          { risk: s.risk });
      }
      for (var dbKey in ENTERPRISE_DB) {
        if (ENTERPRISE_DB.hasOwnProperty(dbKey)) {
          var ed = ENTERPRISE_DB[dbKey];
          add('enterprise', 'ed-' + dbKey, dbKey,
            ed.type + ' · ' + ed.region,
            [dbKey, ed.type, ed.region, ed.person],
            function(name){ return function(){ openEnterprisePanel(name); }}(dbKey),
            { region: ed.region || '', type: ed.type || '' });
        }
      }

      // ── 3. 专项任务 ──
      for (var ti2 = 0; ti2 < MOCK.tasks.length; ti2++) {
        var t2 = MOCK.tasks[ti2];
        add('task', 'task-' + t2.name, t2.name,
          (t2.type || '日常') + ' · ' + t2.line + ' · ' + (t2.status || ''),
          [t2.name, t2.line, t2.person, t2.creator, t2.region],
          function(name){ return function(){ openTaskDetail(name); }}(t2.name),
          { line: t2.line, status: t2.status, progress: t2.rate, region: t2.region });
      }

      // ── 4. 工作事项 ──
      if (MOCK.priority) {
        for (var pi = 0; pi < MOCK.priority.length; pi++) {
          var p = MOCK.priority[pi];
          add('workItem', 'pri-' + p.id, p.title, (p.riskLevel || '') + ' · ' + (p.status || ''),
            [p.title, p.region || '', p.line || ''],
            function(){ return function(){ switchScene('dashboard'); }}());
        }
      }
      if (typeof FOLLOWUPS !== 'undefined' && FOLLOWUPS) {
        for (var fi2 = 0; fi2 < FOLLOWUPS.length; fi2++) {
          var f = FOLLOWUPS[fi2];
          add('workItem', 'fol-' + f.id, f.title, '重点跟进 · ' + (f.status || ''),
            [f.title, f.responsibility || ''],
            function(){ return function(){ switchScene('dashboard'); }}());
        }
      }
      if (MOCK.pendingActions) {
        for (var pai = 0; pai < MOCK.pendingActions.length; pai++) {
          var pa = MOCK.pendingActions[pai];
          add('workItem', 'pa-' + pa.id, pa.title, '待确认 · ' + (pa.actionType || ''),
            [pa.title],
            function(id){ return function(){ switchScene('pending-actions'); }}(pa.id),
            {});
        }
      }

      // ── 5. 功能入口（保留原有） ──
      for (var gi = 0; gi < LAUNCHER_DATA.length; gi++) {
        var group = LAUNCHER_DATA[gi];
        for (var ai = 0; ai < group.apps.length; ai++) {
          var a = group.apps[ai];
          add('function', 'fn-' + a.id, a.name, a.desc || group.title,
            [a.name, a.desc || '', group.title],
            function(id){ return function(){ launcherGo(id); }}(a.id),
            { icon: a.icon, group: group.title });
        }
      }

      return SEARCH_INDEX;
    }

    // 搜索函数：输入关键词，返回按类型分组的结果
    function globalSearch(query) {
      query = query.trim().toLowerCase();
      if (!query) return {};
      var index = buildSearchIndex();
      var groups = {
        person:    { icon: '👤', label: '人员',     items: [] },
        enterprise:{ icon: '🏢', label: '企业/场所', items: [] },
        task:      { icon: '📋', label: '专项任务',  items: [] },
        workItem:  { icon: '📌', label: '工作事项',  items: [] },
        function:  { icon: '⚡', label: '功能入口',  items: [] }
      };

      for (var i = 0; i < index.length; i++) {
        var entry = index[i];
        var matched = false;
        for (var mi = 0; mi < entry.matchTexts.length; mi++) {
          if (entry.matchTexts[mi].toLowerCase().indexOf(query) > -1) {
            matched = true; break;
          }
        }
        if (!matched) continue;

        var g = groups[entry.type];
        if (g && g.items.length < 8) {
          g.items.push({ entry: entry });
        }
      }

      return { groups: groups, typeOrder: ['person','enterprise','task','workItem','function'] };
    }

    // 查看人员相关任务
    function showPersonTasks(name) {
      closeLauncher();
      var relatedHazards = [];
      for (var i = 0; i < MOCK.hazards.length; i++) {
        if (MOCK.hazards[i].person === name || MOCK.hazards[i].discoverer === name) {
          relatedHazards.push(MOCK.hazards[i]);
        }
      }
      if (relatedHazards.length > 0) {
        openEnterprisePanel(relatedHazards[0].object);
      } else {
        showToast(name + ' 的相关事项');
      }
    }

    // 执行搜索结果点击
    function executeSearchResult(id) {
      var index = buildSearchIndex();
      for (var i = 0; i < index.length; i++) {
        if (index[i].id === id) {
          closeLauncher();
          var fn = index[i].action;
          if (typeof fn === 'function') { fn(); }
          else { showToast('跳转中…'); }
          return;
        }
      }
      showToast('未找到对应操作');
    }
    YAQ.executeSearchResult = executeSearchResult;

    // ════════════════════════════════════════════════════════════════
    // 启动台 · 站点地图
    // ════════════════════════════════════════════════════════════════

    var LAUNCHER_DATA = [
      {
        title: '站长工作台', apps: [
          { id: 'dashboard', name: '今日监管工作台', icon: 'layout-dashboard', desc: '整体安全态势' },
          { id: 'pending-actions', name: '待确认行动', icon: 'clipboard-check', desc: '待确认行动审核与发起' },
          { id: 'hazard-report', name: '重大隐患整改日报', icon: 'shield-alert', desc: '隐患闭环跟踪' },
          { id: 'efficiency', name: '履职效能分析', icon: 'bar-chart-3', desc: '条线绩效评估' },
          { id: 'responsibility', name: '主体责任评估', icon: 'users', desc: '企业风险分级' },
          { id: 'disposal', name: '分级处置闭环', icon: 'git-branch', desc: '内部/外部处置' },
          { id: 'supervision-track', name: '督办跟踪', icon: 'alert-circle', desc: '发起督办的执行情况跟踪' }
        ]
      },
      {
        title: '业务办理', apps: [
          { id: 'daily-supervise', name: '日常监管', icon: 'clipboard-list', desc: '日常巡查检查' },
          { id: 'inspect-check', name: '监督检查', icon: 'search-check', desc: '专项执法检查' },
          { id: 'audit-center', name: '审核中心', icon: 'file-check', desc: '审核流程管理' },
          { id: 'hazard-supervise', name: '隐患监督整改', icon: 'alert-circle', desc: '隐患跟踪闭环' },
          { id: 'work-ticket', name: '作业票报备', icon: 'file-text', desc: '特种作业报备' },
          { id: 'work-assign', name: '工作分配管理', icon: 'list-todo', desc: '任务分派' },
          { id: 'fire-prevention', name: '防消联勤', icon: 'flame', desc: '消防联防' },
          { id: 'micro-station', name: '微型消防站', icon: 'building', desc: '微型消防站管理' },
          { id: 'fire-rescue', name: '火灾救援管理', icon: 'truck', desc: '火灾救援记录' },
          { id: 'emergency-drill', name: '应急演练', icon: 'siren', desc: '演练计划管理' },
          { id: 'resident-unit', name: '驻入单位管理', icon: 'building-2', desc: '入驻单位管理' },
          { id: 'contract-mgmt', name: '合同管理', icon: 'file-signature', desc: '合同台账' },
          { id: 'city-mgmt', name: '城市管理', icon: 'city', desc: '综合管理' },
          { id: 'event-rectify', name: '事件整改', icon: 'refresh-cw', desc: '事件闭环' },
          { id: 'event-accept', name: '事件验收', icon: 'check-circle', desc: '事件验收' }
        ]
      },
      {
        title: '监管对象', apps: [
          { id: 'subject-contacts', name: '责任主体通讯录', icon: 'phone', desc: '主体联系人' },
          { id: 'small-premises', name: '九小场所通讯录', icon: 'store', desc: '九小场所信息' },
          { id: 'enterprise-list', name: '企业场所底数', icon: 'briefcase', desc: '企业台账' },
          { id: 'disaster-prevention', name: '防灾减灾底数管理', icon: 'shield', desc: '防灾底数' }
        ]
      },
      {
        title: '组织架构', apps: [
          { id: 'member-mgmt', name: '成员管理', icon: 'users', desc: '人员信息管理' },
          { id: 'position-mgmt', name: '岗位管理', icon: 'briefcase', desc: '岗位设置' },
          { id: 'admin-change', name: '主管理员变更', icon: 'user-cog', desc: '管理员交接' },
          { id: 'org-settings', name: '组织设置', icon: 'settings', desc: '组织信息配置' },
          { id: 'role-mgmt', name: '角色管理', icon: 'user-check', desc: '角色权限' },
          { id: 'account-mgmt', name: '后台账号管理', icon: 'user-plus', desc: '账号管理' },
          { id: 'home-config', name: '主页配置', icon: 'layout', desc: '首页定制' }
        ]
      },
      {
        title: '数据与分析', apps: [
          { id: 'data-cockpit', name: '数据驾驶舱', icon: 'gauge', desc: '全局态势' },
          { id: 'data-board', name: '数据看板', icon: 'bar-chart-3', desc: '可视化分析' },
          { id: 'work-briefing', name: '工作简报', icon: 'file-bar-chart', desc: '自动生成报告' },
          { id: 'monthly-report', name: '月报', icon: 'calendar', desc: '月度统计分析' },
          { id: 'stats-analysis', name: '统计分析', icon: 'bar-chart-4', desc: '多维数据分析' }
        ]
      },
      {
        title: '宣教与推送', apps: [
          { id: 'edu-training', name: '宣教培训', icon: 'book-open', desc: '安全培训管理' },
          { id: 'precision-push', name: '精准推送', icon: 'send', desc: '消息触达' }
        ]
      },
      {
        title: '系统设置', apps: [
          { id: 'msg-config', name: '消息配置', icon: 'message-square', desc: '消息规则配置' },
          { id: 'tag-mgmt', name: '标签管理', icon: 'tags', desc: '标签体系' },
          { id: 'menu-mgmt', name: '菜单管理', icon: 'menu', desc: '菜单自定义' },
          { id: 'approval-center', name: '审批中心', icon: 'clipboard-check', desc: '审批流程' },
          { id: 'todo-center', name: '待办中心', icon: 'inbox', desc: '待办事项' },
          { id: 'sms-comm', name: '短信通讯', icon: 'message-circle', desc: '短信发送' },
          { id: 'account-open', name: '账号开通', icon: 'user-plus', desc: '新账号开通' },
          { id: 'custom-template', name: '定制台账模板', icon: 'file-plus', desc: '台账模板' },
          { id: 'enterprise-ledger', name: '企业电子台账', icon: 'folder-open', desc: '企业台账' },
          { id: 'town-ledger', name: '镇街电子台账', icon: 'folder', desc: '镇街台账' },
          { id: 'base-assist', name: '底数辅助扣清', icon: 'database', desc: '底数清理' },
          { id: 'private-deploy', name: '服务私有化部署', icon: 'server', desc: '私有化部署' },
          { id: 'foundation-training', name: '固本强基培训', icon: 'graduation-cap', desc: '基础能力培训' }
        ]
      },
      {
        title: '系统服务', apps: [
          { id: 'msg-center', name: '消息中心', icon: 'bell', desc: '站内消息' },
          { id: 'ai-assistant', name: 'AI助手', icon: 'bot', desc: '小安智能客服' },
          { id: 'operation-guide', name: '操作指引', icon: 'book', desc: '使用指南' },
          { id: 'online-cs', name: '在线客服', icon: 'headphones', desc: '在线咨询' },
          { id: 'download-center', name: '下载中心', icon: 'download', desc: '客户端下载' }
        ]
      },
      {
        title: '工作台工具', apps: [
          { id: 'metric-config', name: '指标配置', icon: 'sliders-horizontal', desc: '自定义看板指标' },
          { id: 'rules-engine', name: '规则引擎', icon: 'settings-2', desc: '异常判定规则' }
        ]
      }
    ];

    // ════════════════════════════════════════════════════════════════
    // 收藏功能
    // ════════════════════════════════════════════════════════════════

    function getFavorites() {
      return JSON.parse(ls.get('yaq_v4_launcher_favs', '[]'));
    }

    function toggleFavorite(id) {
      var favs = getFavorites();
      var idx = favs.indexOf(id);
      if (idx > -1) { favs.splice(idx, 1); }
      else { favs.push(id); }
      ls.set('yaq_v4_launcher_favs', JSON.stringify(favs));
      renderLauncher();
    }

    YAQ.toggleFavorite = toggleFavorite;

    // ════════════════════════════════════════════════════════════════
    // 最近使用
    // ════════════════════════════════════════════════════════════════

    function recordRecent(id) {
      var recent = JSON.parse(ls.get('yaq_v4_launcher_recent', '[]'));
      // 移除重复
      for (var i = 0; i < recent.length; i++) {
        if (recent[i].id === id) { recent.splice(i, 1); break; }
      }
      recent.unshift({ id: id, time: Date.now() });
      // 只保留最近 20 条
      if (recent.length > 20) recent.length = 20;
      ls.set('yaq_v4_launcher_recent', JSON.stringify(recent));
    }

    function getRecentApps(allApps, excludeIds) {
      var recent = JSON.parse(ls.get('yaq_v4_launcher_recent', '[]'));
      var result = [];
      var excludeSet = {};
      for (var ei = 0; ei < excludeIds.length; ei++) {
        excludeSet[excludeIds[ei]] = true;
      }
      for (var ri = 0; ri < recent.length; ri++) {
        if (result.length >= 8) break;
        var rid = recent[ri].id;
        if (excludeSet[rid]) continue;
        for (var aj = 0; aj < allApps.length; aj++) {
          if (allApps[aj].id === rid) {
            result.push(allApps[aj]);
            break;
          }
        }
      }
      return result;
    }

    // ════════════════════════════════════════════════════════════════
    // 搜索历史 — 输入框底部横向标签
    // ════════════════════════════════════════════════════════════════

    var SEARCH_HISTORY_KEY = 'yaq_search_history_v1';
    var SEARCH_HISTORY_MOCK = ['王志安', '北苑', '消防通道', '恒源化工', '检查'];

    function getSearchHistory() {
      var h = JSON.parse(ls.get(SEARCH_HISTORY_KEY, 'null'));
      if (!h || !Array.isArray(h) || h.length === 0) {
        h = SEARCH_HISTORY_MOCK.slice();
        ls.set(SEARCH_HISTORY_KEY, JSON.stringify(h));
      }
      return h;
    }

    function recordSearchKeyword(keyword) {
      keyword = keyword.trim();
      if (!keyword || keyword.length < 1) return;
      var h = getSearchHistory();
      var idx = h.indexOf(keyword);
      if (idx > -1) h.splice(idx, 1);
      h.unshift(keyword);
      if (h.length > 12) h.length = 12;
      ls.set(SEARCH_HISTORY_KEY, JSON.stringify(h));
      renderSearchChips();
    }

    function removeSearchKeyword(keyword) {
      var h = getSearchHistory();
      var idx = h.indexOf(keyword);
      if (idx > -1) {
        h.splice(idx, 1);
        ls.set(SEARCH_HISTORY_KEY, JSON.stringify(h));
        renderSearchChips();
      }
    }

    function clearSearchHistory() {
      ls.set(SEARCH_HISTORY_KEY, JSON.stringify([]));
      renderSearchChips();
    }

    // 渲染横向搜索历史标签
    function renderSearchChips() {
      var el = $dom.launchChips;
      if (!el) return;
      var h = getSearchHistory();
      if (!h || h.length === 0) {
        el.classList.remove('show');
        el.innerHTML = '';
        return;
      }
      var html = '';
      for (var i = 0; i < h.length && i < 10; i++) {
        var raw = h[i];
        var jsSafe = raw.replace(/'/g, "\\'");
        html += '<span class="l-chip" onclick="applySearchChip(\'' + jsSafe + '\')" title="搜索「' + $_escapeHtml(raw) + '」">' +
          $_escapeHtml(raw) +
          '<button class="l-chip-del" onmousedown="event.stopPropagation();removeSearchKeyword(\'' + jsSafe + '\')" title="移除">' +
            '<i data-lucide="x" width="10" height="10"></i>' +
          '</button>' +
        '</span>';
      }
      if (h.length > 0) {
        html += '<span class="l-chip l-chip-clear" onclick="clearSearchHistory()" title="清空历史">清空</span>';
      }
      el.innerHTML = html;
      el.classList.add('show');
      if (window.lucide) lucide.createIcons(el);
    }

    // 点击搜索历史标签
    function applySearchChip(keyword) {
      $dom.launcherSearch.value = keyword;
      onLauncherSearch();
      $dom.launcherSearch.focus();
      var len = $dom.launcherSearch.value.length;
      $dom.launcherSearch.setSelectionRange(len, len);
    }

    // ════════════════════════════════════════════════════════════════
    // 渲染启动台
    // ════════════════════════════════════════════════════════════════

    function renderLauncher() {
      var query = ($dom.launcherSearch.value || '').trim().toLowerCase();
      var favs = getFavorites();
      var html = '';

      // ─── 搜索模式：多维分组结果 ────────────────────────────
      if (query) {
        // 搜索时隐藏历史关键词标签
        var chipsEl = $dom.launchChips;
        if (chipsEl) chipsEl.classList.remove('show');
        var result = globalSearch(query);
        var hasAny = false;
        for (var _tgi = 0; _tgi < result.typeOrder.length; _tgi++) {
          var gk = result.typeOrder[_tgi];
          var g = result.groups[gk];
          if (!g || !g.items || g.items.length === 0) continue;
          hasAny = true;
          html += '<div class="sg-group">' +
            '<div class="sg-group-head">' +
              '<span class="sg-group-icon">' + g.icon + '</span>' +
              '<span class="sg-group-title">' + g.label + '</span>' +
              '<span class="sg-group-count">' + g.items.length + '</span>' +
              '<span class="lgh-line"></span>' +
            '</div>' +
            '<div class="sg-list">';
          for (var _ii = 0; _ii < g.items.length; _ii++) {
            var item = g.items[_ii];
            var entry = item.entry;
            html += renderSearchResultItem(entry, query);
          }
          html += '</div></div>';
        }

        if (!hasAny) {
          html = '<div class="launcher-empty">未找到 "<strong>' + $_escapeHtml(query) + '</strong>" 相关的结果</div>';
        }
        $dom.launcherBody.innerHTML = html;
        lucide.createIcons();
        return;
      }

      // ─── 默认模式：常用功能 + 最近使用 + 分类浏览 ────────

      // 收集所有 app 的扁平列表
      var allApps = [];
      for (var gi = 0; gi < LAUNCHER_DATA.length; gi++) {
        for (var ai = 0; ai < LAUNCHER_DATA[gi].apps.length; ai++) {
          var a = LAUNCHER_DATA[gi].apps[ai];
          allApps.push(a);
        }
      }

      // ⭐ 常用功能
      if (favs.length > 0) {
        var favApps = [];
        for (var fi = 0; fi < favs.length; fi++) {
          for (var aj = 0; aj < allApps.length; aj++) {
            if (allApps[aj].id === favs[fi]) {
              favApps.push(allApps[aj]);
              break;
            }
          }
        }
        if (favApps.length > 0) {
          html += '<div class="launcher-group">' +
            '<div class="launcher-group-head">' +
              '<span class="launcher-group-title">⭐ 常用功能</span>' +
              '<span class="launcher-group-count">' + favApps.length + '</span>' +
              '<span class="lgh-line"></span>' +
            '</div>' +
            '<div class="launcher-grid">';
          for (var fk = 0; fk < favApps.length; fk++) {
            html += buildLauncherItem(favApps[fk], true);
          }
          html += '</div></div>';
        }
      }

      // 🕐 最近使用
      var recentApps = getRecentApps(allApps, favs);
      if (recentApps.length > 0) {
        html += '<div class="launcher-group">' +
          '<div class="launcher-group-head">' +
            '<span class="launcher-group-title">🕐 最近使用</span>' +
            '<span class="launcher-group-count">' + recentApps.length + '</span>' +
            '<span class="lgh-line"></span>' +
          '</div>' +
          '<div class="launcher-grid">';
        for (var rk = 0; rk < recentApps.length; rk++) {
          html += buildLauncherItem(recentApps[rk], false);
        }
        html += '</div></div>';
      }

      // 分类浏览
      for (var gi = 0; gi < LAUNCHER_DATA.length; gi++) {
        var group = LAUNCHER_DATA[gi];
        html += '<div class="launcher-group">' +
          '<div class="launcher-group-head">' +
            '<span class="launcher-group-title">' + group.title + '</span>' +
            '<span class="launcher-group-count">' + group.apps.length + '</span>' +
            '<span class="lgh-line"></span>' +
          '</div>' +
          '<div class="launcher-grid">';
        for (var ai = 0; ai < group.apps.length; ai++) {
          html += buildLauncherItem(group.apps[ai], false);
        }
        html += '</div></div>';
      }

      $dom.launcherBody.innerHTML = html;
      lucide.createIcons();
    }

    // 渲染搜索结果项（带类型图标、高亮、摘要）
    function renderSearchResultItem(entry, query) {
      var typeIconMap = {
        person:     '<div class="sri-icon sri-icon-person"><i data-lucide="user" width="16" height="16"></i></div>',
        enterprise: '<div class="sri-icon sri-icon-enterprise"><i data-lucide="building-2" width="16" height="16"></i></div>',
        task:       '<div class="sri-icon sri-icon-task"><i data-lucide="clipboard-list" width="16" height="16"></i></div>',
        workItem:   '<div class="sri-icon sri-icon-workitem"><i data-lucide="flag" width="16" height="16"></i></div>',
        function:   '<div class="sri-icon sri-icon-function"><i data-lucide="zap" width="16" height="16"></i></div>'
      };
      var iconHtml = typeIconMap[entry.type] || '<div class="sri-icon"><i data-lucide="search" width="16" height="16"></i></div>';

      var labelHtml = $_highlight(entry.label, query);
      var subHtml = entry.subtitle ? '<span class="sri-sub">' + $_escapeHtml(entry.subtitle) + '</span>' : '';

      // 附加元信息标签
      var metaHtml = '';
      var meta = entry.meta;
      if (entry.type === 'enterprise') {
        if (meta.region) metaHtml += '<span class="sri-tag sri-tag-region">' + $_escapeHtml(meta.region) + '</span>';
        if (meta.level && meta.level.indexOf('重大') > -1) metaHtml += '<span class="sri-tag sri-tag-danger">重大</span>';
        else if (meta.level && meta.level.indexOf('一般') > -1) metaHtml += '<span class="sri-tag sri-tag-warn">一般</span>';
        if (meta.status === '超期未整改') metaHtml += '<span class="sri-tag sri-tag-danger">超期</span>';
      } else if (entry.type === 'task') {
        if (meta.region) metaHtml += '<span class="sri-tag sri-tag-region">' + $_escapeHtml(meta.region) + '</span>';
        if (meta.status) metaHtml += '<span class="sri-tag sri-tag-info">' + $_escapeHtml(meta.status) + '</span>';
        if (meta.progress) metaHtml += '<span class="sri-tag sri-tag-progress">' + $_escapeHtml(meta.progress) + '</span>';
      } else if (entry.type === 'workItem') {
        if (meta.risk && meta.risk.indexOf('重大') > -1) metaHtml += '<span class="sri-tag sri-tag-danger">重大</span>';
        if (meta.status) metaHtml += '<span class="sri-tag sri-tag-info">' + $_escapeHtml(meta.status) + '</span>';
      } else if (entry.type === 'function') {
        if (meta.group) metaHtml += '<span class="sri-tag sri-tag-group">' + $_escapeHtml(meta.group) + '</span>';
      }

      return '<div class="sri-item" onclick="executeSearchResult(\'' + $_escapeHtml(entry.id) + '\')">' +
        iconHtml +
        '<div class="sri-body">' +
          '<div class="sri-label">' + labelHtml + subHtml + '</div>' +
          '<div class="sri-meta">' + metaHtml + '</div>' +
        '</div>' +
        '<i data-lucide="chevron-right" width="14" height="14" class="sri-arrow"></i>' +
      '</div>';
    }

    function buildLauncherItem(app, isFaved) {
      // 如果未显式标记为收藏，再查一下是否已在收藏列表里
      var faved = isFaved ? ' faved' : '';
      if (!faved) {
        var allFavs = getFavorites();
        for (var fi = 0; fi < allFavs.length; fi++) {
          if (allFavs[fi] === app.id) { faved = ' faved'; break; }
        }
      }
      return '<div class="launcher-item" onclick="launcherGo(\'' + app.id + '\')" title="' + (app.desc || '') + '">' +
        '<button class="li-fav' + faved + '" onclick="event.stopPropagation();toggleFavorite(\'' + app.id + '\')" title="' + (isFaved || faved ? '取消收藏' : '收藏') + '">' +
          '<i data-lucide="star" width="13" height="13"></i>' +
        '</button>' +
        '<div class="li-icon"><i data-lucide="' + app.icon + '" width="22" height="22"></i></div>' +
        '<div class="li-name">' + app.name + '</div>' +
      '</div>';
    }

    function toggleLauncher() {
      var panel = $dom.launcherPanel;
      var overlay = $dom.launcherOverlay;
      var isOpen = panel.classList.contains('open');
      if (isOpen) {
        closeLauncher();
      } else {
        openLauncher();
      }
    }

    function openLauncher() {
      $dom.launcherPanel.classList.add('open');
      $dom.launcherOverlay.classList.add('open');
      $dom.launcherSearch.value = '';
      renderLauncher();
      renderSearchChips();
      setTimeout(function() {
        $dom.launcherSearch.focus();
      }, 100);
    }

    function closeLauncher() {
      $dom.launcherPanel.classList.remove('open');
      $dom.launcherOverlay.classList.remove('open');
      var chipsEl = $dom.launchChips;
      if (chipsEl) chipsEl.classList.remove('show');
    }

    function onLauncherSearch() {
      // 隐藏搜索历史标签
      var chipsEl = $dom.launchChips;
      if (chipsEl) chipsEl.classList.remove('show');
      // 记录搜索关键词（只记录不重新渲染，避免干扰）
      var q = ($dom.launcherSearch.value || '').trim();
      if (q) {
        var h = JSON.parse(ls.get(SEARCH_HISTORY_KEY, 'null'));
        if (!h || !Array.isArray(h) || h.length === 0) h = SEARCH_HISTORY_MOCK.slice();
        var idx = h.indexOf(q);
        if (idx > -1) h.splice(idx, 1);
        h.unshift(q);
        if (h.length > 12) h.length = 12;
        ls.set(SEARCH_HISTORY_KEY, JSON.stringify(h));
      }
      renderLauncher();
    }

    function launcherSearchFirst() {
      var first = document.querySelector('.sri-item:first-child, .launcher-item:first-child');
      if (first) { first.click(); }
    }

    function launcherGo(id) {
      // 记录最近使用
      recordRecent(id);
      closeLauncher();
      // 映射：非场景 ID 转到场景或执行动作
      var actionMap = {
        // 工作台场景（已实现）
        'dashboard': 'dashboard',
        'followup': 'followup',
        'hazard-report': 'hazard-report',
        'efficiency': 'efficiency',
        'responsibility': 'responsibility',
        'disposal': 'disposal',
        'pending-actions': 'pending-actions',
        'supervision-track': 'supervision-track',
        // 月报
        'monthly-report': 'monthly-report',
        // 工具
        'metric-config': '__metric_config__',
        'rules-engine': 'rules',
        'ai-assistant': '__ai_switch__',
        // 占位——后续实现的功能
        'msg-center': '__todo__'
      };
      // 所有未显式映射的 ID 默认用 __todo__
      var target = actionMap[id] || '__todo__';
      if (target === '__metric_config__') {
        if (YAQ.openMetricConfig) YAQ.openMetricConfig();
      } else if (target === '__ai_switch__') {
        document.querySelector('.tab[data-tab="chat"]').click();
      } else if (target === '__todo__') {
        showToast('后续能力，敬请期待');
      } else {
        switchScene(target);
      }
    }

    // ─── 全局键盘快捷键 ─────────────────────────────────────────
    document.addEventListener('keydown', function(e) {
      // Cmd+K / Ctrl+K 打开启动台
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        var panel = $dom.launcherPanel;
        if (panel && panel.classList.contains('open')) {
          closeLauncher();
        } else {
          openLauncher();
        }
      }
      // Escape 关闭启动台
      if (e.key === 'Escape') {
        var panel = $dom.launcherPanel;
        if (panel && panel.classList.contains('open')) {
          closeLauncher();
          return;
        }
      }
    });

    // ═══ 移动端汉堡菜单 ═══════════════════════════════════════════
    function toggleHamburger() {
      var strip = document.getElementById('tabStrip');
      if (strip) {
        strip.classList.toggle('open');
      }
    }

    // 绑定汉堡按钮点击（替代 inline onclick，避免加载时序问题）
    var hBtn = document.getElementById('hamburgerBtn');
    if (hBtn) hBtn.addEventListener('click', toggleHamburger);

    // 移动端：点击遮罩区域关闭侧边栏
    document.addEventListener('click', function(e) {
      var strip = document.getElementById('tabStrip');
      var btn = document.getElementById('hamburgerBtn');
      if (!strip || !strip.classList.contains('open')) return;
      if (strip.contains(e.target) || btn.contains(e.target)) return;
      strip.classList.remove('open');
    });

    // 暴露全局函数
    YAQ.toggleLauncher = toggleLauncher;
    YAQ.openLauncher = openLauncher;
    YAQ.closeLauncher = closeLauncher;
    YAQ.onLauncherSearch = onLauncherSearch;
YAQ.launcherSearchFirst = launcherSearchFirst;
YAQ.launcherGo = launcherGo;

  // ─── 导出 UI 函数到 YAQ 命名空间 ──────────────────────
  YAQ.showToast = showToast;
  YAQ.escapeHtml = escapeHtml;
  window.escapeHtml = escapeHtml;  // 供 agent-init.js 等后续脚本使用
  YAQ.switchScene = switchScene;
  YAQ.openDrawer = openDrawer;
  YAQ.closeDrawer = closeDrawer;
  YAQ.openSuperviseDrawer = YAQ.openSuperviseDrawer;
  YAQ.openAgentConfig = openAgentConfig;
  YAQ.saveAgentPrompt = saveAgentPrompt;
  YAQ.agentAsk = agentAsk;
  YAQ.sendChatMsg = sendChatMsg;
  YAQ.askAI = askAI;
  YAQ.toggleChatPanel = toggleChatPanel;
  YAQ.openChatPanel = openChatPanel;
  YAQ.toggleHamburger = toggleHamburger;
  YAQ.bindInteractions = bindInteractions;
  // doFollowupAction/handle* 由 yaq-scenes.js 导出，无需重复
  YAQ.openMetricConfig = openMetricConfig;
  YAQ.saveMetricConfig = saveMetricConfig;
  YAQ.closeMetricConfig = closeMetricConfig;
  YAQ.toggleMiniCard = toggleMiniCard;
  YAQ.cycleMetricPeriod = cycleMetricPeriod;
  YAQ.setMetricFilter = setMetricFilter;
  YAQ.setPeriodFilter = setPeriodFilter;
  YAQ.onDragStart = onDragStart;
  YAQ.onDragOver = onDragOver;
  YAQ.onDrop = onDrop;
  YAQ.onDragEnd = onDragEnd;
  YAQ.removeSelected = removeSelected;
  YAQ.onMetricSearch = onMetricSearch;
  YAQ.showMetricTip = showMetricTip;
  YAQ.hideMetricTip = hideMetricTip;
  YAQ.openMetricDrilldown = openMetricDrilldown;
  YAQ.copyTipContent = copyTipContent;
  YAQ.openEnterprisePanel = openEnterprisePanel;
  YAQ.closeEnterprisePanel = closeEnterprisePanel;
  YAQ.epSwitchTab = epSwitchTab;
  YAQ.openHazardDetail = openHazardDetail;
  YAQ.closeHazardModal = closeHazardModal;
  YAQ.copyHazardInfo = copyHazardInfo;
  YAQ.openTaskDetail = openTaskDetail;
  YAQ.closeTaskModal = closeTaskModal;
  YAQ.toggleRegulation = toggleRegulation;
  YAQ.toggleLauncher = toggleLauncher;
  YAQ.onLauncherSearch = onLauncherSearch;
  YAQ.executeSearchResult = executeSearchResult;
  YAQ.toggleFavorite = toggleFavorite;
  YAQ.applySearchChip = applySearchChip;
  YAQ.closeDrillFloat = closeDrillFloat;

  // ─── 待确认行动（在 yaq-app.js 中定义，通过 YAQ 转发）──
  YAQ.closePAModal = function() {
    var overlay = document.getElementById('paModalOverlay');
    var modal = document.getElementById('paModal');
    if (overlay) overlay.style.display = 'none';
    if (modal) modal.style.display = 'none';
  };

})();
