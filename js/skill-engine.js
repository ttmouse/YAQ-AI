/**
 * skill-engine.js — 统一对话引擎 + 技能路由系统
 *
 * 职责：
 *   1. UnifiedChat：对话流管理、消息渲染、思考过程可视化
 *   2. SkillRouter：技能注册、关键词路由、技能匹配
 *
 * 设计原则：
 *   - 过程步骤是瞬时状态，结果出来后折叠/消失
 *   - 对话流持续追加，不被全量替换
 *   - 每个技能独立注册，逐步迁移旧场景
 */

(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════════
     UnifiedChat — 对话引擎
     ════════════════════════════════════════════════════════════════ */
  var UnifiedChat = {
    initialized: false,
    messages: [],
    container: null, // #sceneContent
    _autoScrollPaused: false, // 快捷输入触发后暂停自动滚动（保留兼容，建议使用 center._autoScrollEnabled）

    /**
     * 初始化对话界面
     * @param {Object} options
     * @param {string}  options.welcomeMessage  - 欢迎语
     * @param {string}  options.initialContent - 初始内容（今日概览 HTML）
     * @param {Array}   options.quickChips     - 快捷芯片 [{label, text}]
     */
    initialize: function (options) {
      if (this.initialized) return;
      this.container = document.getElementById('sceneContent');
      if (!this.container) {
        console.error('[UnifiedChat] #sceneContent 未找到');
        return;
      }

      // 不清空 sceneContent（保留 renderScene 渲染的工作台内容）
      this.messages = [];

      // 接管输入
      this._wireInput();

      // 如果有快速芯片，延迟追加（等 renderScene 的 80ms setTimeout 完成）
      // 否则 renderScene 的 container.innerHTML = html 会清掉刚加的芯片
      if (options && options.quickChips && options.quickChips.length > 0) {
        var self = this;
        setTimeout(function () {
          self._appendQuickChips(options.quickChips);
        }, 200);
      }

      this.initialized = true;
    },

    /**
     * 追加用户消息到对话流
     */
    appendUserMessage: function (text) {
      if (!this.container) return;
      var html =
        '<div class="c-row user">' +
        '<div class="c-bubble user">' + escapeHtml(text) + '</div>' +
        '</div>';
      this.container.insertAdjacentHTML('beforeend', html);
      this._scrollToBottom();

      this.messages.push({ role: 'user', text: text });
    },

    /**
     * 追加纯文本 Agent 消息
     */
    appendAgentMessage: function (html) {
      if (!this.container) return;
      var wrapped =
        '<div class="c-row agent">' +
        '<div class="c-bubble">' + html + '</div>' +
        '</div>';
      this.container.insertAdjacentHTML('beforeend', wrapped);
      this._scrollToBottom();
    },

    /**
     * 显示思考过程（瞬时状态，完成后自动折叠/消失）
     * @param {Object}   steps
     * @param {Array}    steps.thinkChain  - [{icon, text}] 简短思考链
     * @param {Array}    steps.detailSteps - [string] 后台详细步骤
     * @param {number}   options.stepInterval    - 思考链每步间隔(ms)
     * @param {number}   options.detailInterval  - 后台步骤间隔(ms)
     * @param {string}   options.displayMode     - 'collapse' 或 'replace'
     * @param {Function} callback - 所有步骤完成后调用
     */
    showProcessSteps: function (steps, options, callback) {
      if (!this.container) return;
      if (!steps || !steps.thinkChain || steps.thinkChain.length === 0) {
        if (callback) callback();
        return;
      }

      var self = this; // ★ 顶层捕获 UnifiedChat 引用
      var opts = options || {};
      var stepInterval = opts.stepInterval || 1000;
      var detailInterval = opts.detailInterval || 800;
      var displayMode = opts.displayMode || 'collapse'; // 'collapse' 或 'replace'

      var processId = 'process_' + Date.now();
      var startTime = Date.now(); // 记录开始时间

      // ── 创建过程容器 ──
      var processHtml =
        '<div class="c-row agent process" id="' + processId + '">' +
        '<div class="c-bubble process-bubble">' +
        '  <div class="process-chain" id="' + processId + '_chain"></div>' +
        '  <div class="process-detail" id="' + processId + '_detail" style="display:none">' +
        '    <span class="ps-dot"></span>' +
        '    <span class="ps-label" id="' + processId + '_dlabel"></span>' +
        '  </div>' +
        '</div>' +
        '</div>';

      this.container.insertAdjacentHTML('beforeend', processHtml);
      this._scrollToBottom();

      var chainContainer = document.getElementById(processId + '_chain');
      var detailContainer = document.getElementById(processId + '_detail');
      var processRow = document.getElementById(processId);

      if (!chainContainer) {
        if (callback) callback();
        return;
      }

      var thinkChain = steps.thinkChain;
      var detailSteps = steps.detailSteps || [];
      var totalSteps = thinkChain.length;
      var currentThinkIdx = 0;
      var currentDetailIdx = 0;
      var thinkDone = false;
      var detailDone = false;

      // ── 单行展示当前步骤，内容替换不换行 ──
      var stepsHtml = '<div class="process-steps-row" id="' + processId + '_steps">' +
        '<span class="ps-dot active"></span>' +
        '<span class="ps-label" id="' + processId + '_label">' + escapeHtml(thinkChain[0].text) + '</span>' +
        '</div>';
      chainContainer.innerHTML = stepsHtml;

      // ── 逐步替换步骤文字 ──
      var currentThinkIdx = 0;

      function advanceThinkStep() {
        currentThinkIdx++;
        if (currentThinkIdx >= totalSteps) {
          thinkDone = true;
          // 标记完成
          var dot = chainContainer.querySelector('.ps-dot');
          var label = document.getElementById(processId + '_label');
          if (dot) { dot.classList.remove('active'); dot.classList.add('done'); }
          if (label) label.textContent = thinkChain[totalSteps - 1].text;
          // 开始展示后台步骤
          if (detailSteps.length > 0 && detailContainer) {
            detailContainer.style.display = 'block';
            showNextDetailStep.call(self);
          } else {
            detailDone = true;
            finishProcess();
          }
          return;
        }
        // 替换文字
        var label = document.getElementById(processId + '_label');
        if (label) label.textContent = thinkChain[currentThinkIdx].text;

        setTimeout(function () {
          advanceThinkStep();
        }, stepInterval);
      }

      setTimeout(function () {
        advanceThinkStep();
      }, stepInterval);

      // ── 单行逐步替换后台步骤文字 ──
      function showNextDetailStep() {
        if (currentDetailIdx >= detailSteps.length) {
          detailDone = true;
          finishProcess();
          return;
        }

        var dLabel = document.getElementById(processId + '_dlabel');
        if (dLabel) dLabel.textContent = detailSteps[currentDetailIdx];
        currentDetailIdx++;

        setTimeout(function () {
          showNextDetailStep.call(self);
        }, detailInterval);
      }

      // ── 流程完成，折叠或移除 ──
      function finishProcess() {
        if (displayMode === 'replace') {
          // 方案 B：直接移除过程容器
          if (processRow) {
            processRow.style.transition = 'opacity 0.3s';
            processRow.style.opacity = '0';
            setTimeout(function () {
              if (processRow && processRow.parentNode) {
                processRow.parentNode.removeChild(processRow);
              }
              if (callback) callback();
            }, 300);
          } else {
            if (callback) callback();
          }
        } else {
          // 方案 A（默认）：折叠为一行摘要
          if (processRow) {
            processRow.classList.add('collapsed');
            var summary = thinkChain[thinkChain.length - 1] || { text: '完成' };

            // 构建展开后的 HTML（单行，显示所有已完成步骤）
            var chainHtml = '<div class="process-steps-row">' +
              '<span class="ps-dot done"></span>' +
              '<span class="ps-label">' + escapeHtml(summary.text) + '</span>' +
              '</div>';
            var detailHtml = detailSteps.length > 0
              ? '<span class="ps-dot done"></span><span class="ps-label">' + escapeHtml(detailSteps[detailSteps.length - 1]) + '</span>'
              : '';

            var collapsedHtml =
              '<div class="process-collapsed">' +
              '<span class="process-collapsed-text">' + escapeHtml(summary.text) + '</span>' +
              '<span class="process-collapsed-time">' + ((Date.now() - startTime) / 1000).toFixed(1) + 's</span>' +
              '</div>';
            chainContainer.innerHTML = collapsedHtml;
            if (detailContainer) detailContainer.style.display = 'none';
          }
          if (callback) callback();
        }
      }

      // 开始展示第一步（先渲染初始文字，再推进）
      setTimeout(function () {
        advanceThinkStep();
      }, stepInterval);
    },

    /**
     * 渲染结构化回复（分段数组）
     * @param {Array} sections - 段落数组，每项为 HTML 字符串
     */
    renderStructuredReply: function (sections, callback, options) {
      if (!this.container || !sections || sections.length === 0) return;
      // 防止重复渲染（2秒锁）
      if (this._renderingContent) return;
      this._renderingContent = true;

      var opts = options || {};
      var respId = 'resp_' + Date.now();
      var html;
      if (opts.noCard) {
        // 无卡片模式：纯内容，无背景/边框/内边距
        html =
          '<div class="c-row agent reply">' +
          '<div id="' + respId + '" style="flex:1;min-width:0;font-size:14px;line-height:1.7;color:#1e293b">' +
          '</div>' +
          '</div>';
      } else {
        html =
          '<div class="c-row agent reply">' +
          '<div class="c-bubble reply-bubble" id="' + respId + '">' +
          '</div>' +
          '</div>';
      }

      this.container.insertAdjacentHTML('beforeend', html);
      this._scrollToBottom();

      var el = document.getElementById(respId);
      if (!el) { this._renderingContent = false; return; }

      // 逐段追加（带延时，模拟生成效果）
      var idx = 0;
      var self = this;
      var delay = opts.stream ? 120 : 300;
      // 2秒后自动释放渲染锁（防止意外卡死）
      var renderLockTimer = setTimeout(function () { self._renderingContent = false; }, 8000);

      function appendNext() {
        if (idx >= sections.length) {
          if (window.refreshIcons) window.refreshIcons(el);
          self._scrollToBottom();
          clearTimeout(renderLockTimer);
          self._renderingContent = false;
          if (callback) callback();
          return;
        }
        el.insertAdjacentHTML('beforeend', sections[idx]);
        self._scrollToBottom();
        idx++;
        setTimeout(appendNext, delay);
      }

      appendNext();
    },

    /**
     * 触发技能（由 SkillRouter 匹配后调用）
     * @param {Object} skill - 匹配到的技能配置
     * @param {string} text  - 用户输入
     */
    triggerSkill: function (skill, text) {
      var self = this;

      // 追加用户消息
      this.appendUserMessage(text);

      // 移除旧的快捷芯片
      var oldChips = document.querySelector('.quick-chips-row');
      if (oldChips) oldChips.remove();

      // 展示思考过程
      if (skill.demoSteps) {
        // 发送按钮变为暂停
        this._setSendButtonState('pause');
        this.showProcessSteps(
          skill.demoSteps,
          { stepInterval: 500, detailInterval: 350, displayMode: 'collapse' },
          function () {
            // 思考过程完成后，展示结果
            if (skill.generate) {
              try {
                var result = skill.generate(text, { messages: self.messages });
                var done = function () {
                  self._setSendButtonState('send');
                  if (skill.quickChips) {
                    var chips = typeof skill.quickChips === 'function'
                      ? skill.quickChips({})
                      : skill.quickChips;
                    self._appendQuickChips(chips);
                  }
                };
                if (typeof result === 'string') {
                  self.appendAgentMessage(result);
                  done();
                } else if (Array.isArray(result)) {
                  self.renderStructuredReply(result, done, { noCard: skill.noCard, stream: skill.stream });
                }
              } catch (e) {
                console.error('[UnifiedChat] 技能生成失败:', e);
                self.appendAgentMessage('技能执行出错: ' + e.message);
                self._setSendButtonState('send');
              }
            } else {
              self._setSendButtonState('send');
            }
          }
        );
      } else {
        // 没有思考过程，直接展示结果
        if (skill.generate) {
          var sections = skill.generate(text, { messages: self.messages });
          self.renderStructuredReply(sections, null, { noCard: skill.noCard, stream: skill.stream });
        }
      }
    },

    /**
     * 处理用户输入（由全局输入调用）
     */
    handleUserInput: function (text) {
      if (!text || !text.trim()) return;
      text = text.trim();

      // 匹配技能
      var matched = SkillRouter.route(text);
      if (matched) {
        this.triggerSkill(matched, text);
      } else {
        // 未匹配：追加用户消息 + 默认回复
        this.appendUserMessage(text);
        this._defaultReply();
      }
    },

    // ─── 内部方法 ──────────────────────────────────────

    _defaultReply: function () {
      var self = this;
      // 显示简单的思考过程
      this.showProcessSteps(
        {
          thinkChain: [
            { text: '正在分析你的问题…' },
            { text: '正在匹配相关技能' },
            { text: '已就绪' },
          ],
          detailSteps: ['正在解析问题上下文…', '正在检索可用技能…'],
        },
        { stepInterval: 400, detailInterval: 300, displayMode: 'collapse' },
        function () {
          var C = window.CardPrimitives;
          if (C) {
            self.renderStructuredReply([
              C.sectionHead('💡 我可以帮你做什么？'),
              '<div style="font-size:13px;color:#64748b;line-height:1.7;padding:8px 0">' +
                '你可以直接问我以下内容：' +
                '</div>',
              C.statCardRow([
                { label: '隐患分析', value: '试试说', delta: '"查看隐患"', desc: '查看重大隐患和整改情况' },
                { label: '履职效能', value: '试试说', delta: '"履职分析"', desc: '查看团队履职评分' },
                { label: '月报生成', value: '试试说', delta: '"月报"', desc: '生成月度报告草稿' },
              ]),
            ]);
          }
        }
      );
    },

    _appendQuickChips: function (chips) {
      if (!this.container || !chips || chips.length === 0) return;
      var existing = document.querySelector('.quick-chips-row');
      if (existing) existing.remove();

      // 复用 QuickChip 组件保持视觉一致
      if (window.QuickChip && typeof window.QuickChip.render === 'function') {
        var html = window.QuickChip.render(chips, { variant: 'inline' });
        this.container.insertAdjacentHTML('beforeend', html);
      } else {
        // 降级：纯文本芯片
        var html = '<div class="quick-chips-row">';
        for (var i = 0; i < chips.length; i++) {
          html +=
            '<button class="qc-chip" onclick="YAQ.globalChatQuick(\'' +
            escapeHtml(chips[i].text.replace(/'/g, "\\'")) +
            '\')">' +
            escapeHtml(chips[i].label) +
            '</button>';
        }
        html += '</div>';
        this.container.insertAdjacentHTML('beforeend', html);
      }
      this._scrollToBottom();
    },

    _scrollToBottom: function () {
      if (this._autoScrollPaused) return;
      var container = this.container;
      if (!container) return;
      var sc = container.closest('.center');
      if (!sc) return;
      // 同样检查 center 上的统一自动滚动开关
      if (sc._autoScrollEnabled === false) return;
      requestAnimationFrame(function () {
        sc.scrollTop = sc.scrollHeight;
      });
      setTimeout(function () {
        sc.scrollTop = sc.scrollHeight;
      }, 50);
    },

    /**
     * 重置 UnifiedChat（用于首次初始化完成后重新接管）
     */
    reset: function () {
      this.initialized = false;
      this.messages = [];
      this.container = null;
    },
    /**
     * 切换发送按钮状态
     * @param {string} state - 'send' | 'pause'
     */
    _setSendButtonState: function (state) {
      var btn = document.querySelector('.global-chat-btn[data-cmd]');
      if (!btn) return;
      var icon = btn.querySelector('i[data-lucide]');
      if (!icon) return;
      if (state === 'pause') {
        icon.setAttribute('data-lucide', 'pause');
        btn.setAttribute('title', '暂停');
      } else {
        icon.setAttribute('data-lucide', 'arrow-up');
        btn.setAttribute('title', '发送');
      }
      // 刷新 Lucide 图标
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons({ container: btn });
      }
    },
    /**
     * 注册统一对话命令到 YAQ 命名空间
     *（在模块级别执行，确保内联脚本可以覆盖 agent-init.js 的干扰）
     */
    _registerCommands: function () {
      var self = this;
      // 注册 unifiedChatSend
      window.YAQ.unifiedChatSend = function () {
        var input = document.getElementById('globalChatInput');
        if (!input || !input.value.trim()) return;
        self.handleUserInput(input.value.trim());
        input.value = '';
        var evt = document.createEvent('Event');
        evt.initEvent('input', true, false);
        input.dispatchEvent(evt);
      };
      // 注册 unifiedChatQuick
      window.YAQ.unifiedChatQuick = function (text) {
        self._handleChipClick(text);
      };
      // 立即覆盖，确保内联脚本接管前已就绪
      window.YAQ.globalChatSend = window.YAQ.unifiedChatSend;
      window.globalChatSend = window.YAQ.unifiedChatSend;
      window.YAQ.globalChatQuick = window.YAQ.unifiedChatQuick;
      window.globalChatQuick = window.YAQ.unifiedChatQuick;
    },
    _wireInput: function () {
      var self = this;

      // 再次确保命令指向正确（此时 UnifiedChat 已初始化完毕）
      window.YAQ.globalChatSend = window.YAQ.unifiedChatSend;
      window.globalChatSend = window.YAQ.unifiedChatSend;
      window.YAQ.globalChatQuick = window.YAQ.unifiedChatQuick;
      window.globalChatQuick = window.YAQ.unifiedChatQuick;

      // 监听新式快捷芯片点击（data-quick-text）
      document.addEventListener('click', function (e) {
        var chip = e.target.closest('[data-quick-text]');
        if (chip && window.__chatEngineActive) {
          var text = chip.getAttribute('data-quick-text');
          if (text) self._handleChipClick(text);
        }
      });

      // 更新输入栏的 data-cmd
      this._updateInputCmd('unifiedChatSend');

      // 标记引擎已激活
      window.__chatEngineActive = true;
    },

    /**
     * 处理快速芯片点击（统一入口，被 onclick 和事件监听调用）
     */
    _handleChipClick: function (text) {
      if (!text) return;
      // 防止重复触发
      if (this._processingChip) return;
      this._processingChip = true;
      var self = this;

      // 暂停自动滚动：快捷输入后，用户消息置顶，后续生成内容不再自动跟滚
      this._autoScrollPaused = true;
      // 同时禁用 .center 上的 MutationObserver 自动滚动（agent-init.js 的 startConversation）
      var sc = this.container && this.container.closest('.center');
      if (sc) sc._autoScrollEnabled = false;

      // 移除所有芯片行
      var chipsRow = document.querySelector('.quick-chips-row, .qc-chip-wrap');
      if (chipsRow) chipsRow.remove();
      this.handleUserInput(text);

      // ── 快捷输入滚动：两步走 ─────────────────────────
      setTimeout(function () {
        var sc = self.container && self.container.closest('.center');
        var userRows = self.container && self.container.querySelectorAll('.c-row.user');
        var userRow = userRows && userRows.length > 0 ? userRows[userRows.length - 1] : null;
        if (userRow && sc) {
          // 让 .result 透传 overflow，确保滚动发生在 .center 上
          var resultEl = self.container.closest('.result');
          if (resultEl) resultEl.style.overflowY = 'visible';

          // 撑高一屏：min-height 让后续 AI 内容有空间填充
          var curH = sc.scrollHeight;
          self.container.style.minHeight = (curH + sc.clientHeight) + 'px';

          // 自定义平滑滚动（可控速度）
          sc._autoScrollEnabled = false;
          var start = sc.scrollTop;
          var offset = userRow.getBoundingClientRect().top - sc.getBoundingClientRect().top;
          var target = Math.max(0, start + offset - 16);
          var duration = 800; // ms，越大越慢
          var startTime = performance.now();

          function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          }

          function animateScroll(now) {
            var elapsed = now - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = easeInOutCubic(progress);
            sc.scrollTop = start + (target - start) * eased;
            if (progress < 1) {
              requestAnimationFrame(animateScroll);
            } else {
              sc._autoScrollEnabled = false;
            }
          }

          requestAnimationFrame(animateScroll);
        }
      }, 100);

      setTimeout(function () {
        self._processingChip = false;
      }, 1000);
    },

    /**
     * 恢复原始命令（当 agent-init 需要时调用）
     */
    restoreOriginalSend: function () {
      if (window.__originalGlobalChatSend) {
        window.YAQ.globalChatSend = window.__originalGlobalChatSend;
        window.globalChatSend = window.__originalGlobalChatSend;
      }
      if (window.__originalGlobalChatQuick) {
        window.YAQ.globalChatQuick = window.__originalGlobalChatQuick;
        window.globalChatQuick = window.__originalGlobalChatQuick;
      }
      this._updateInputCmd('globalChatSend');
      window.__chatEngineActive = false;
    },

    /**
     * 更新全局输入栏的 data-cmd 属性
     */
    _updateInputCmd: function (cmd) {
      var input = document.getElementById('globalChatInput');
      var sendBtn = document.querySelector('.global-chat-btn');
      if (input) input.setAttribute('data-cmd', cmd || 'unifiedChatSend');
      if (sendBtn) sendBtn.setAttribute('data-cmd', cmd || 'unifiedChatSend');
    },

    /**
     * 切换过程折叠状态（由 onclick 调用）
     */
    _toggleProcess: function (el) {
      var targetId = el.getAttribute('data-target');
      if (!targetId) return;
      var processRow = document.getElementById(targetId);
      if (!processRow) return;

      var isExpanded = processRow.classList.contains('expanded');
      if (isExpanded) {
        processRow.classList.remove('expanded');
        el.querySelector('.process-collapsed-toggle').textContent = '展开';
      } else {
        processRow.classList.add('expanded');
        el.querySelector('.process-collapsed-toggle').textContent = '收起';

        // 恢复详细内容（从 data 属性读取）
        var chainContainer = document.getElementById(targetId + '_chain');
        var detailContainer = document.getElementById(targetId + '_detail');
        var chainHtml = el.getAttribute('data-chain-html');
        var detailHtml = el.getAttribute('data-detail-html');
        if (chainContainer && chainHtml) {
          chainContainer.innerHTML = decodeURIComponent(chainHtml);
          if (detailContainer && detailHtml) {
            detailContainer.innerHTML = decodeURIComponent(detailHtml);
            detailContainer.style.display = 'block';
          }
        }
      }
    },
  };

  /* ════════════════════════════════════════════════════════════════
     SkillRouter — 技能路由
     ════════════════════════════════════════════════════════════════ */
  var SkillRouter = {
    skills: [],
    defaultSkill: null,

    /**
     * 注册一个技能
     * @param {Object} config
     * @param {string}   config.id          - 技能唯一标识
     * @param {string}   config.name        - 技能显示名称
     * @param {string}   [config.description]
     * @param {Array}    config.keywords    - 触发关键词列表
     * @param {number}   [config.priority=10] - 优先级，越高越优先
     * @param {Function} config.generate    - 回复生成器(text, context) → [sections]
     * @param {Object}   [config.demoSteps] - 演示流程步骤
     * @param {Array|Function} [config.quickChips] - 快捷芯片
     * @param {string}   [config.sceneId]   - 对应旧场景ID（向后兼容）
     */
    register: function (config) {
      if (!config || !config.id || !config.keywords) {
        console.error('[SkillRouter] 技能注册失败：缺少 id 或 keywords', config);
        return;
      }

      // 默认优先级 10
      if (typeof config.priority !== 'number') config.priority = 10;

      // 匹配函数：检查文本是否匹配关键词
      config.match = function (text) {
        var lower = text.toLowerCase();
        for (var i = 0; i < config.keywords.length; i++) {
          if (lower.indexOf(config.keywords[i].toLowerCase()) >= 0) {
            return true;
          }
        }
        // 也支持正则
        if (config.patterns) {
          for (var j = 0; j < config.patterns.length; j++) {
            if (config.patterns[j].test(text)) return true;
          }
        }
        return false;
      };

      this.skills.push(config);

      // 按优先级排序（高→低）
      this.skills.sort(function (a, b) {
        return (b.priority || 10) - (a.priority || 10);
      });

      console.log('[SkillRouter] 已注册技能: ' + config.name + ' (id=' + config.id + ', 关键词=' + config.keywords.join(',') + ')');

      // 如果有 sceneId，注册到 scene 映射
      if (config.sceneId) {
        if (!this._sceneMap) this._sceneMap = {};
        this._sceneMap[config.sceneId] = config;
      }
    },

    /**
     * 匹配输入文本，返回最匹配的技能
     * @param {string} text
     * @returns {Object|null} 匹配的技能配置
     */
    route: function (text) {
      if (!text) return null;

      // 按优先级遍历
      for (var i = 0; i < this.skills.length; i++) {
        if (this.skills[i].match(text)) {
          return this.skills[i];
        }
      }
      return null;
    },

    /**
     * 根据 sceneId 查找技能（向后兼容）
     */
    findBySceneId: function (sceneId) {
      if (this._sceneMap && this._sceneMap[sceneId]) {
        return this._sceneMap[sceneId];
      }
      return null;
    },
  };

  /* ════════════════════════════════════════════════════════════════
     HTML 转义工具
     ════════════════════════════════════════════════════════════════ */
  function escapeHtml(s) {
    if (typeof s !== 'string') return String(s);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ════════════════════════════════════════════════════════════════
     Demo 技能 — 内置注册（阶段一先注册几个示例技能）
     ════════════════════════════════════════════════════════════════ */

  // ── 隐患分析技能 ──
  SkillRouter.register({
    id: 'hazard-analysis',
    name: '隐患分析',
    description: '查看重大隐患、超期情况、整改跟踪',
    keywords: ['隐患', '风险', '安全', '整改'],
    priority: 20,
    sceneId: 'hazard-report',
    demoSteps: {
      thinkChain: [
        { text: '正在获取今日隐患数据…' },
        { text: '正在筛选重大隐患和超期项' },
        { text: '正在比对整改进度' },
        { text: '分析完成' },
      ],
      detailSteps: [
        '正在接入今日隐患数据库…',
        '正在提取重大隐患记录…',
        '正在比对超期未整改项…',
        '正在计算整改完成率…',
      ],
    },
    generate: function (text, context) {
      var C = window.CardPrimitives;
      if (!C) return '<div style="padding:16px">内容加载中…</div>';
      return [
        C.sectionHead('当前安全态势'),
        '<div style="font-size:13px;color:#64748b;line-height:1.7;margin-bottom:8px;padding:10px 12px;background:#f8fafc;border-radius:10px">' +
          '截至今日，辖区内共有 <strong>47 条</strong>待处理隐患，其中重大隐患 3 条，较大隐患 8 条。' +
          '</div>',
        C.statCardRow([
          { label: '待处理隐患', value: '47', delta: '+5', desc: '较上周' },
          { label: '重大隐患', value: '3', delta: '+1', desc: '需立即处理' },
          { label: '整改完成率', value: '68.2%', delta: '-3.1%', desc: '较上月下降' },
        ]),
        C.sectionHead('超期隐患清单'),
        C.table({
          headers: ['企业名称', '隐患描述', '状态', '逾期天数'],
          rows: [
            ['杭州物流有限公司', '消防通道堵塞', '<span style="color:#ef4444">● 超期</span>', '5天'],
            ['余杭区良渚包装厂', '危化品存储不当', '<span style="color:#ef4444">● 超期</span>', '2天'],
            ['杭州机械制造公司', '特种设备未年检', '<span style="color:#f59e0b">● 进行中</span>', '—'],
          ],
        }),
      ];
    },
    quickChips: [
      { label: '查看超期隐患', text: '查看超期隐患详情' },
      { label: '督办未整改企业', text: '督办未整改企业' },
    ],
  });

  // ── 履职效能技能 ──
  SkillRouter.register({
    id: 'efficiency',
    name: '履职效能',
    description: '查看团队履职评分、排名分析',
    keywords: ['履职', '效能', '团队', '评分', '排名'],
    priority: 18,
    sceneId: 'efficiency',
    demoSteps: {
      thinkChain: [
        { text: '正在读取团队履职数据…' },
        { text: '正在计算各维度评分' },
        { text: '正在比对历史履职趋势' },
        { text: '分析完成' },
      ],
      detailSteps: [
        '正在加载团队履职记录…',
        '正在计算综合评分和排名…',
        '正在识别异常履职行为…',
        '分析完成',
      ],
    },
    generate: function (text, context) {
      var C = window.CardPrimitives;
      if (!C) return ['<div>内容加载中…</div>'];
      return [
        C.sectionHead('团队履职效能分析'),
        C.statCardRow([
          { label: '综合评分', value: '87.3', delta: '+2.1', desc: '较上月' },
          { label: '履职达标率', value: '94.2%', delta: '+1.8%', desc: '较上月' },
          { label: '异常履职', value: '3', delta: '-2', desc: '较上月减少' },
        ]),
        C.sectionHead('团队履职排名'),
        C.table({
          headers: ['排名', '团队名称', '综合评分', '履职率', '状态'],
          rows: [
            ['1', '良渚片区', '94.5', '98.2%', '<span style="color:#22c55e">优秀</span>'],
            ['2', '物流片区', '88.2', '92.1%', '<span style="color:#22c55e">良好</span>'],
            ['3', '余杭片区', '79.8', '85.3%', '<span style="color:#f59e0b">需提升</span>'],
          ],
        }),
      ];
    },
    quickChips: [
      { label: '查看详细排名', text: '查看详细排名' },
      { label: '分析履职短板', text: '分析履职短板' },
    ],
  });

  // ── 月报生成技能 ──
  SkillRouter.register({
    id: 'monthly-report',
    name: '月报生成',
    description: '生成月度报告草稿',
    keywords: ['月报', '月度报告', '月报告', '月度', '业务组', '片区展示'],
    priority: 22,
    sceneId: 'monthly-report',
    demoSteps: {
      thinkChain: [
        { text: '正在汇总本月监管数据…' },
        { text: '正在统计各维度指标' },
        { text: '分析完成' },
        { text: '正在排版报告内容' },
      ],
      detailSteps: [
        '正在加载本月监管记录…',
        '正在统计隐患排查和整改数据…',
        '正在计算履职效能指标变化…',
        '分析完成',
        '正在排版报告并生成摘要…',
      ],
    },
    generate: function (text, context) {
      var C = window.CardPrimitives;
      if (!C) return ['<div>内容加载中…</div>'];
      return [
        C.sectionHead('月度监管报告（2026年06月）'),
        '<div style="font-size:13px;color:#64748b;line-height:1.7;margin-bottom:8px;padding:10px 12px;background:#f0f9ff;border-radius:10px;border-left:3px solid #3b82f6">' +
          '报告期间：2026-06-01 至 2026-06-28' +
          '</div>',
        C.statCardRow([
          { label: '检查企业数', value: '328', delta: '+12.3%', desc: '环比上月' },
          { label: '隐患发现', value: '156', delta: '+8', desc: '环比上月' },
          { label: '整改完成', value: '142', delta: '+15', desc: '环比上月' },
          { label: '整改率', value: '91.0%', delta: '+3.5%', desc: '持续提升' },
        ]),
        C.sectionHead('本月重点工作'),
        C.table({
          headers: ['工作项', '完成情况', '负责人', '状态'],
          rows: [
            ['夏季消防安全检查', '已完成 45/48 家', '张队长', '<span style="color:#22c55e">进行中</span>'],
            ['危化品专项排查', '已全部完成', '李副队长', '<span style="color:#22c55e">已完成</span>'],
            ['企业主体责任评估', '已完成 82%', '王组长', '<span style="color:#f59e0b">进行中</span>'],
          ],
        }),
      ];
    },
    quickChips: [
      { label: '导出月报', text: '导出月报' },
      { label: '按业务组展示', text: '把安全工作组分拆为业务组，并按多个片区展示' },
    ],
  });

  // ── 行动建议技能 ──
  SkillRouter.register({
    id: 'pending-actions',
    name: '行动建议',
    description: '查看待确认行动项、待办事项',
    keywords: ['行动', '建议', '待确认', '待办', '行动项', '批量确认', '超期项', '未处理'],
    priority: 15,
    sceneId: 'pending-actions',
    demoSteps: {
      thinkChain: [
        { text: '正在获取待办事项列表…' },
        { text: '正在筛选超期和紧急项' },
        { text: '正在汇总行动建议' },
      ],
      detailSteps: [
        '正在接入待办任务系统…',
        '正在识别超期未处理事项…',
        '正在按紧急程度排序…',
        '分析完成',
      ],
    },
    generate: function (text, context) {
      var C = window.CardPrimitives;
      if (!C) return ['<div>内容加载中…</div>'];
      return [
        C.sectionHead('待确认行动项'),
        '<div style="font-size:13px;color:#64748b;line-height:1.7;margin-bottom:8px;padding:10px 12px;background:#fefce8;border-radius:10px;border-left:3px solid #eab308">' +
          '小安已基于当前数据为你汇总了以下需确认的行动项：' +
          '</div>',
        C.statCardRow([
          { label: '待确认行动', value: '5', delta: '+2', desc: '较昨日新增' },
          { label: '超期未处理', value: '2', delta: '', desc: '需重点关注' },
          { label: '今日到期', value: '3', delta: '', desc: '请及时处理' },
        ]),
        C.sectionHead('行动建议清单'),
        C.table({
          headers: ['序号', '行动项', '来源', '期限', '状态'],
          rows: [
            ['1', '督促杭州物流完成消防通道整改', '超期隐患', '已逾期5天', '<span style="color:#ef4444">超期</span>'],
            ['2', '确认良渚包装厂危化品整改方案', '超期隐患', '已逾期2天', '<span style="color:#ef4444">超期</span>'],
            ['3', '审核物流片区月度履职报告', '履职分析', '今日截止', '<span style="color:#f59e0b">待确认</span>'],
            ['4', '确认夏季消防检查计划', '专项任务', '本周五', '<span style="color:#3b82f6">待处理</span>'],
            ['5', '复核余杭片区企业自评结果', '主体责任', '3天后', '<span style="color:#3b82f6">待处理</span>'],
          ],
        }),
      ];
    },
    quickChips: [
      { label: '批量确认', text: '批量确认待办事项' },
      { label: '查看超期项', text: '查看超期未处理事项' },
    ],
  });

  // ── 超期原因分析技能（针对"分析超期未闭环原因"） ──
  SkillRouter.register({
    id: 'overdue-analysis',
    name: '超期原因分析',
    description: '从政府端和企业端两个维度分析超期未闭环原因',
    keywords: ['超期未闭环原因', '闭环未关闭', '超期未整改', '为什么没闭环', '超期原因'],
    priority: 25,
    noCard: true,
    stream: true,
    demoSteps: {
      thinkChain: [
        { text: '正在获取超期隐患数据…' },
        { text: '正在分析政府端跟进情况' },
        { text: '正在分析企业端主体责任' },
        { text: '分析完成' },
      ],
      detailSteps: [
        '正在加载超期隐患清单…',
        '正在逐项分析超期原因…',
        '正在评估政府端监督跟进力度…',
        '正在评估企业端主体责任落实情况…',
        '分析完成',
      ],
    },
    generate: function (text, context) {
      var C = window.CardPrimitives;
      return [
        // 标题
        '<div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:14px">超期未闭环原因分析</div>',
        // 概述
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:16px">' +
          '当前共有 2 项重大隐患超期未整改。以下从政府端（监督跟进）和企业端（主体责任）两个维度逐项研判责任归属。' +
          '</div>',
        // 卡片1
        C.entityCard({
          name: '北苑商业综合体',
          desc: '消防通道堵塞',
          meta: [
            { text: '来源 日常巡查' },
            { text: '逾期 3天', style: 'color:#dc2626;font-weight:600' },
          ],
          time: '06-10 → 06-22',
          footer: '企业主体责任问题为主',
          onclick: "openHazardDetail('北苑商业综合体')",
          title: '点击查看详情',
          variant: 'danger',
        }),
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>初步研判：企业主体责任问题为主</strong></div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px">' +
          '政府端已多次提醒催办，手段基本到位但力度偏软；企业端反复堵塞、不配合整改，是超期的主要原因。建议：政府端升级为现场核查 + 企业约谈，如仍不配合则联合执法。' +
          '</div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>政府端 — 监督跟进</strong></div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:6px">' +
          '已反复提醒：该主体消防通道堵塞本月已发现 3 次，王志安已多次电话督促。已发督办，超期 3 天系统已自动发起督办流程。存在问题：目前仅停留在电话督促层面，未升级实质性措施（如现场核查、临时管控、停业整顿），跟进力度偏软。' +
          '</div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>企业端 — 主体责任</strong></div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:16px">' +
          '反复堵塞：同一问题月内反复 3 次，说明企业未建立长效管理机制，主体责任落实不到位。整改配合度低：超期 3 天仍未提交整改方案，临时管控措施也未确认，企业配合意愿弱。该主体属于屡教不改型，常规督促已失效，需升级为企业约谈或联合执法。' +
          '</div>',
        // 卡片2
        C.entityCard({
          name: '云栖高层住宅',
          desc: '自动消防设施失效',
          meta: [
            { text: '来源 日常巡查' },
            { text: '逾期 1天', style: 'color:#dc2626;font-weight:600' },
          ],
          time: '06-20 → 06-22',
          footer: '政府跟进盲区 + 企业执行不力并存',
          onclick: "openHazardDetail('云栖高层住宅')",
          title: '点击查看详情',
          variant: 'danger',
        }),
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>初步研判：政府跟进盲区 + 企业执行不力并存</strong></div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px">' +
          '超期时间较短（1 天），但政府端对整改证据要求不明确、缺少专业检测手段是重要因素；企业端推进缓慢也需要问责。建议：政府端明确整改验收标准，要求企业提交阶段性修复计划并引入第三方检测。' +
          '</div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>政府端 — 监督跟进</strong></div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:6px">' +
          '已发整改通知：超期 1 天，李明已跟进并下发整改要求。跟进存在盲区：目前仅收到企业口头反馈，未见书面整改方案或修复进度证明，整改证据链未闭环，政府端未对证据完整性提出明确要求。缺少专业支撑：高层消防设施修复涉及专业工程验收，政府端未引入第三方检测机构介入评估。' +
          '</div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>企业端 — 主体责任</strong></div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8">' +
          '整改推进慢：超期 1 天但未见实质性修复进展，企业未主动报告困难和进度。修复能力存疑：18-25 层消防设施全面失效，修复工程量大，企业是否已联系专业消防工程公司未可知。企业配合度一般：有整改意愿但行动迟缓，缺乏紧迫感。' +
          '</div>',
      ];
    },
    quickChips: [
      { label: '生成推进行动', text: '生成推进行动' },
      { label: '分析任务异常', text: '分析一下任务的异常情况' },
    ],
  });

  // ── 任务异常分析技能 ──
  SkillRouter.register({
    id: 'task-anomaly',
    name: '任务异常分析',
    description: '分析任务进度异常、识别滞后风险',
    keywords: ['任务异常', '异常情况', '任务进度', '任务滞后'],
    priority: 24,
    noCard: true,
    stream: true,
    demoSteps: {
      thinkChain: [
        { text: '正在获取任务执行数据…' },
        { text: '正在比对任务进度与时间线' },
        { text: '正在识别异常滞后项' },
        { text: '分析完成' },
      ],
      detailSteps: [
        '正在加载任务清单和进度数据…',
        '正在逐项比对完成率与时间进度…',
        '正在评估滞后风险和影响…',
        '分析完成',
      ],
    },
    generate: function (text, context) {
      var C = window.CardPrimitives;
      return [
        // 标题
        '<div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:14px">任务异常分析</div>',
        // 概述
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:16px">' +
          '当前有 2 项任务存在异常，需重点关注。' +
          '</div>',
        // 卡片1
        C.entityCard({
          name: '2026年第二季度良渚片重大风险检查任务',
          progress: {
            timePct: 91,
            compPct: 42,
            color: '#dc2626',
            stats: [
              '覆盖 <strong>141</strong> 家',
              '隐患 <strong>3</strong> 个 | 未闭环 <strong>0</strong>',
            ],
          },
          time: '06-01 → 06-30',
          badge: '严重滞后 49pp',
          badgeColor: '#dc2626',
          badgeBg: '#fef2f2',
        }),
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>研判：严重滞后，按当前速度无法按期完成</strong></div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px">' +
          '二季度即将结束，剩余 141 家中的 82 家尚未检查，完成率远低于时间进度。建议立即调整资源配置、增加检查频次，或申请延期并制定追赶计划。' +
          '</div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>数据</strong></div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:16px">' +
          '完成率 42% vs 时间进度 91%，差距 49 个百分点。按当前日均检查量推算，至少还需 28 个工作日，远超剩余时间窗口。' +
          '</div>',
        // 卡片2
        C.entityCard({
          name: '片区隐患排查复查',
          progress: {
            timePct: 75,
            compPct: 55,
            color: '#d97706',
            stats: [
              '覆盖 <strong>24</strong> 家',
              '隐患 <strong>2</strong> 个 | 未闭环 <strong>1</strong>',
            ],
          },
          time: '06-10 → 06-30',
          badge: '进度偏低',
          badgeColor: '#d97706',
          badgeBg: '#fff7ed',
        }),
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>研判：进度偏慢但风险可控，优先处理重大隐患</strong></div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px">' +
          '完成率 55%，距月底尚有时间但需加快节奏。含 1 项重大隐患待复查，建议优先完成重大隐患复查，其余任务按风险等级排序推进。' +
          '</div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8;margin-bottom:4px"><strong>数据</strong></div>',
        '<div style="font-size:14px;color:#1e293b;line-height:1.8">' +
          '重大隐患复查为最优先事项，需在 2 个工作日内完成。其余 23 家按风险等级推进，预计可在月底前达成 90%+ 完成率。' +
          '</div>',
      ];
    },
    quickChips: [
      { label: '最近的督办任务进展怎样', text: '最近的督办任务进展怎样' },
      { label: '生成巡查报告', text: '帮我生成今天的巡查报告' },
    ],
  });

  /* ════════════════════════════════════════════════════════════════
     导出到全局
     ════════════════════════════════════════════════════════════════ */
  window.YAQ = window.YAQ || {};
  window.YAQ.UnifiedChat = UnifiedChat;
  window.YAQ.SkillRouter = SkillRouter;
  // 公开方法
  window.YAQ.restoreOriginalSend = function () { UnifiedChat.restoreOriginalSend(); };
  window.YAQ.toggleProcess = function (el) { UnifiedChat._toggleProcess(el); };
  // 兼容简写
  window.UnifiedChat = UnifiedChat;
  window.SkillRouter = SkillRouter;

  // 立即注册命令（模块级别），确保内联脚本在 agent-init.js 之后能覆盖
  UnifiedChat._registerCommands();

  console.log('[skill-engine] 已加载，内置技能: ' + SkillRouter.skills.length + ' 个');
})();
