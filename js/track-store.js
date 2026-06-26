/* ═══════════════════════════════════════════════════════════
   持续跟踪引擎 — 诊断即创建，跟踪至闭环
   ═══════════════════════════════════════════════════════════
   独立模块，通过 YAQ.trackStore 暴露。
   从 js/app.js 中提取，减少主文件膨胀 (#89)
   依赖：YAQ.ls（app.js 中定义的 localStorage 封装）
   ═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── localStorage 封装：复用 app.js 中已定义的 YAQ.ls ─────
  var ls = (window.YAQ && window.YAQ.ls) || {
    get: function(key, fallback) {
      try { var v = localStorage.getItem(key); return v !== null ? v : fallback; }
      catch(e) { return fallback !== undefined ? fallback : null; }
    },
    set: function(key, val) {
      try { localStorage.setItem(key, val); return true; }
      catch(e) { console.warn('[YAQ] localStorage 写入失败:', key); return false; }
    },
    remove: function(key) {
      try { localStorage.removeItem(key); } catch(e) {}
    }
  };

  // ═══ 重点跟进事项（共享数据） ══════════════════════════════════
  var FOLLOWUPS = [
    {
      title: '北苑商业综合体重大火灾隐患逾期未闭环',
      status: '已督办 / 待复查', statusCls: 'danger',
      responsibility: '消防线负责人王志安 / 对应组长 / 专家',
      latestProgress: '主体对象已提交整改材料，专家今日待复查',
      nextStep: '今日 17:00 前反馈复查结果',
      deadline: '逾期 3 天',
      overdue: 3,
      needIntervention: true,
      actions: ['继续督办', '要求反馈', '升级处置']
    },
    {
      title: '物流片区仓储场所整改超期',
      status: '跟进中', statusCls: 'warning',
      responsibility: '物流片区组长陈芳',
      latestProgress: '7 家中 3 家已反馈，2 家待现场核查，2 家未响应',
      nextStep: '未响应主体需再次提醒或升级',
      deadline: '2 家今日到期',
      overdue: 0,
      needIntervention: true,
      actions: ['提醒责任人', '要求现场核查', '发起约谈']
    },
    {
      title: '企业安全组专项检查进度滞后',
      status: '已要求说明', statusCls: 'neutral',
      responsibility: '生产企业线负责人张毅',
      latestProgress: '等待条线负责人反馈调整计划',
      nextStep: '今日内提交补充检查安排',
      deadline: '已滞后 19 天',
      overdue: 19,
      needIntervention: false,
      actions: ['提醒履职', '要求反馈']
    },
    {
      title: '云栖高层住宅自动消防设施失效',
      status: '已督办 / 未启动', statusCls: 'danger',
      responsibility: '消防线负责人李明',
      latestProgress: '自动喷淋系统18-25层大面积失效，整改未启动',
      nextStep: '需确认整改方案和启动时间',
      deadline: '逾期 1 天',
      overdue: 1,
      needIntervention: false,
      actions: ['继续督办', '发起约谈']
    }
  ];

  // ════════════════════════════════════════════════════════════════
  // 持续跟踪引擎（第4层闭环）— 诊断即创建，跟踪至闭环
  // ════════════════════════════════════════════════════════════════
  var TrackStore = {
    _key: 'yaq_tracks',
    _tracks: null,

    // 获取所有跟踪记录（惰性加载，支持外部同步更新）
    getAll: function() {
      if (!this._tracks) { this._load(); }
      return this._tracks;
    },

    // 按状态筛选
    getByStatus: function(status) {
      return this.getAll().filter(function(t) { return t.status === status; });
    },

    // 获取活跃跟踪（未关闭）
    getActive: function() {
      return this.getAll().filter(function(t) { return t.status !== 'closed'; });
    },

    // 创建一个跟踪记录
    add: function(opts) {
      var tracks = this.getAll();
      var now = new Date();
      var track = {
        id: 'trk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        title: opts.title || '未命名跟踪项',
        source: opts.source || '',
        sourceId: opts.sourceId || '',
        responsibility: opts.responsibility || '',
        status: 'tracking',           // tracking → progressing → resolved → closed
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        daysTracked: 0,
        progress: 0,                  // 0-100
        updates: [{                    // 第一条更新 = 创建记录
          at: now.toISOString(),
          text: '已加入持续跟踪' + (opts.initNote ? '：' + opts.initNote : '')
        }],
        deadline: opts.deadline || '',
        needIntervention: opts.needIntervention || false,
        tags: opts.tags || []
      };
      tracks.unshift(track);
      this._save();
      return track;
    },

    // 更新进展
    update: function(id, opts) {
      var tracks = this.getAll();
      for (var i = 0; i < tracks.length; i++) {
        if (tracks[i].id === id) {
          var t = tracks[i];
          if (opts.progress !== undefined) t.progress = Math.min(100, Math.max(0, opts.progress));
          if (opts.status) t.status = opts.status;
          if (opts.note) {
            t.updates.push({ at: new Date().toISOString(), text: opts.note });
          }
          if (opts.responsibility) t.responsibility = opts.responsibility;
          t.updatedAt = new Date().toISOString();
          // 自动推进：progress=100 → resolved
          if (t.progress >= 100 && t.status === 'progressing') t.status = 'resolved';
          this._save();
          return t;
        }
      }
      return null;
    },

    // 标记为已解决
    resolve: function(id, note) {
      return this.update(id, { status: 'resolved', progress: 100, note: note || '已闭环确认' });
    },

    // 关闭（归档）
    close: function(id, note) {
      return this.update(id, { status: 'closed', progress: 100, note: note || '已归档' });
    },

    // 删除跟踪
    remove: function(id) {
      var tracks = this.getAll();
      for (var i = 0; i < tracks.length; i++) {
        if (tracks[i].id === id) {
          tracks.splice(i, 1);
          this._save();
          return true;
        }
      }
      return false;
    },

    // 从诊断/处置上下文自动创建跟踪
    autoCreateFromContext: function(title, source, responsibility, deadline) {
      return this.add({
        title: title,
        source: source,
        sourceId: '',
        responsibility: responsibility || '',
        deadline: deadline || '',
        initNote: '来自「' + source + '」自动创建'
      });
    },

    // 计算各状态数量
    stats: function() {
      var tracks = this.getAll();
      var s = { total: tracks.length, tracking: 0, progressing: 0, resolved: 0, closed: 0 };
      for (var i = 0; i < tracks.length; i++) {
        if (s[tracks[i].status] !== undefined) s[tracks[i].status]++;
      }
      return s;
    },

    // 重新计算所有活跃跟踪的天数
    recalcDays: function() {
      var tracks = this.getAll();
      var now = new Date();
      for (var i = 0; i < tracks.length; i++) {
        if (tracks[i].status !== 'closed') {
          var created = new Date(tracks[i].createdAt);
          tracks[i].daysTracked = Math.floor((now - created) / (86400000));
        }
      }
      this._save();
    },

    _load: function() {
      var raw = ls.get(this._key);
      if (raw) {
        try { this._tracks = JSON.parse(raw); } catch(e) { this._tracks = []; }
      } else {
        this._tracks = [];
      }
    },

    _save: function() {
      ls.set(this._key, JSON.stringify(this._tracks));
    }
  };

  // 启动时填充示例跟踪数据（首次使用的用户能看到演示）
  (function() {
    var t = TrackStore.getAll();
    if (t.length === 0) {
      var staticFu = FOLLOWUPS;
      for (var si = 0; si < staticFu.length; si++) {
        var sf = staticFu[si];
        var days = sf.overdue > 0 ? 7 + sf.overdue : 7;
        var progress = sf.statusCls === 'danger' ? 25 : sf.statusCls === 'warning' ? 50 : 75;
        var track = TrackStore.add({
          title: sf.title,
          source: '系统初始化',
          responsibility: sf.responsibility,
          deadline: sf.deadline,
          needIntervention: sf.needIntervention,
          initNote: sf.latestProgress
        });
        // 模拟几天前的创建时间
        var oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - days);
        track.createdAt = oldDate.toISOString();
        track.daysTracked = days;
        track.progress = progress;
        if (progress >= 100) track.status = 'resolved';
        else if (progress >= 50) track.status = 'progressing';
        // 添加模拟更新记录
        if (days > 3) {
          var midDate = new Date(oldDate);
          midDate.setDate(midDate.getDate() + Math.floor(days / 2));
          track.updates.push({ at: midDate.toISOString(), text: '责任方已反馈初步整改方案' });
        }
        TrackStore._save();
      }
    }
    // 每天首次加载时重算天数
    TrackStore.recalcDays();
  })();

  // 暴露给 YAQ 命名空间
  window.YAQ = window.YAQ || {};
  window.YAQ.trackStore = TrackStore;
})();
