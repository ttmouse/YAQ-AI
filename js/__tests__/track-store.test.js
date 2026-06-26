/**
 * TrackStore 持续跟踪引擎单元测试
 *
 * 测试方式：通过 test-utils 创建 TrackStore 实例，
 * 保持与生产代码实现一致。
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLS } from './test-utils.js';

// ─── TrackStore 工厂 — 与 js/track-store.js 实现一致 ──
function createTrackStore() {
  const ls = createLS();
  const TrackStore = {
    _key: 'yaq_tracks_test',
    _tracks: null,

    getAll() {
      if (!this._tracks) this._load();
      return this._tracks;
    },

    getByStatus(status) {
      return this.getAll().filter(t => t.status === status);
    },

    getActive() {
      return this.getAll().filter(t => t.status !== 'closed');
    },

    add(opts) {
      const tracks = this.getAll();
      const now = new Date();
      const track = {
        id: 'trk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        title: opts.title || '未命名跟踪项',
        source: opts.source || '',
        sourceId: opts.sourceId || '',
        responsibility: opts.responsibility || '',
        status: 'tracking',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        daysTracked: 0,
        progress: 0,
        updates: [{ at: now.toISOString(), text: '已加入持续跟踪' + (opts.initNote ? '：' + opts.initNote : '') }],
        deadline: opts.deadline || '',
        needIntervention: opts.needIntervention || false,
        tags: opts.tags || [],
      };
      tracks.unshift(track);
      this._save();
      return track;
    },

    update(id, opts) {
      const tracks = this.getAll();
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].id === id) {
          const t = tracks[i];
          if (opts.progress !== undefined) t.progress = Math.min(100, Math.max(0, opts.progress));
          if (opts.status) t.status = opts.status;
          if (opts.note) t.updates.push({ at: new Date().toISOString(), text: opts.note });
          if (opts.responsibility) t.responsibility = opts.responsibility;
          t.updatedAt = new Date().toISOString();
          if (t.progress >= 100 && t.status === 'progressing') t.status = 'resolved';
          this._save();
          return t;
        }
      }
      return null;
    },

    resolve(id, note) {
      return this.update(id, { status: 'resolved', progress: 100, note: note || '已闭环确认' });
    },

    close(id, note) {
      return this.update(id, { status: 'closed', progress: 100, note: note || '已归档' });
    },

    remove(id) {
      const tracks = this.getAll();
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].id === id) {
          tracks.splice(i, 1);
          this._save();
          return true;
        }
      }
      return false;
    },

    autoCreateFromContext(title, source, responsibility, deadline) {
      return this.add({
        title,
        source,
        sourceId: '',
        responsibility: responsibility || '',
        deadline: deadline || '',
        initNote: '来自「' + source + '」自动创建',
      });
    },

    stats() {
      const tracks = this.getAll();
      const s = { total: tracks.length, tracking: 0, progressing: 0, resolved: 0, closed: 0 };
      for (const t of tracks) {
        if (s[t.status] !== undefined) s[t.status]++;
      }
      return s;
    },

    recalcDays() {
      const tracks = this.getAll();
      const now = new Date();
      for (const t of tracks) {
        if (t.status !== 'closed') {
          const created = new Date(t.createdAt);
          t.daysTracked = Math.floor((now - created) / 86400000);
        }
      }
      this._save();
    },

    _load() {
      const raw = ls.get(this._key);
      try {
        this._tracks = raw ? JSON.parse(raw) : [];
      } catch {
        this._tracks = [];
      }
    },

    _save() {
      ls.set(this._key, JSON.stringify(this._tracks));
    },
  };
  return TrackStore;
}

// ─── 每个测试前创建干净的 TrackStore 实例 ──
let store;
beforeEach(() => {
  localStorage.clear();
  store = createTrackStore();
});

// ─── 基本操作 ──

describe('TrackStore — 基本 CRUD', () => {
  it('初始应返回空数组', () => {
    expect(store.getAll()).toEqual([]);
  });

  it('add() 应创建一条跟踪记录并返回', () => {
    const t = store.add({ title: '测试跟踪', source: '单元测试' });
    expect(t).toBeDefined();
    expect(t.id).toMatch(/^trk_/);
    expect(t.title).toBe('测试跟踪');
    expect(t.source).toBe('单元测试');
    expect(t.status).toBe('tracking');
    expect(t.progress).toBe(0);
    expect(t.updates).toHaveLength(1);
    expect(t.updates[0].text).toBe('已加入持续跟踪');
  });

  it('add() 默认标题应为"未命名跟踪项"', () => {
    const t = store.add({});
    expect(t.title).toBe('未命名跟踪项');
  });

  it('add() 应支持 initNote', () => {
    const t = store.add({ title: '带备注', initNote: '自动创建' });
    expect(t.updates[0].text).toBe('已加入持续跟踪：自动创建');
  });

  it('add() 应添加到列表开头', () => {
    store.add({ title: '第一条' });
    store.add({ title: '第二条' });
    const all = store.getAll();
    expect(all).toHaveLength(2);
    expect(all[0].title).toBe('第二条');
  });

  it('getAll() 应在调用之间保持数据一致', () => {
    store.add({ title: '持久化测试' });
    const all1 = store.getAll();
    const all2 = store.getAll();
    expect(all1).toBe(all2); // 同一引用
    expect(all1).toHaveLength(1);
  });
});

// ─── 查询/筛选 ──

describe('TrackStore — 查询/筛选', () => {
  beforeEach(() => {
    // 创建 3 条不同状态的记录
    store.add({ title: '跟踪中' }); // status='tracking'
    const p = store.add({ title: '进行中' });
    store.update(p.id, { status: 'progressing' });
    const c = store.add({ title: '已闭环' });
    store.update(c.id, { status: 'closed', progress: 100 });
  });

  it('getByStatus() 应按状态筛选', () => {
    const tracking = store.getByStatus('tracking');
    expect(tracking).toHaveLength(1);
    expect(tracking[0].title).toBe('跟踪中');
  });

  it('getActive() 应排除已关闭', () => {
    const active = store.getActive();
    expect(active).toHaveLength(2);
    expect(active.every(t => t.status !== 'closed')).toBe(true);
  });

  it('stats() 应正确统计各状态数量', () => {
    const s = store.stats();
    expect(s.total).toBe(3);
    expect(s.tracking).toBe(1);
    expect(s.progressing).toBe(1);
    expect(s.closed).toBe(1);
    expect(s.resolved).toBe(0);
  });
});

// ─── 更新操作 ──

describe('TrackStore — 更新', () => {
  let trackId;

  beforeEach(() => {
    const t = store.add({ title: '待更新项' });
    trackId = t.id;
  });

  it('update() 应更新进度', () => {
    store.update(trackId, { progress: 50 });
    expect(store.getActive()[0].progress).toBe(50);
  });

  it('update() 应限制进度在 0-100', () => {
    store.update(trackId, { progress: 150 });
    expect(store.getActive()[0].progress).toBe(100);
    store.update(trackId, { progress: -10 });
    expect(store.getActive()[0].progress).toBe(0);
  });

  it('update() 应添加更新记录', () => {
    store.update(trackId, { note: '已完成50%' });
    const t = store.getAll()[0];
    expect(t.updates).toHaveLength(2);
    expect(t.updates[1].text).toBe('已完成50%');
  });

  it('update() 应更新状态', () => {
    store.update(trackId, { status: 'progressing' });
    expect(store.getAll()[0].status).toBe('progressing');
  });

  it('update() progress=100 且 status=progressing 时应自动变为 resolved', () => {
    store.update(trackId, { status: 'progressing' });
    store.update(trackId, { progress: 100 });
    expect(store.getAll()[0].status).toBe('resolved');
  });

  it('update() 不存在 id 应返回 null', () => {
    expect(store.update('nonexistent', { progress: 50 })).toBeNull();
  });

  it('resolve() 应标记为已解决', () => {
    store.resolve(trackId, '已全部整改完毕');
    const t = store.getAll()[0];
    expect(t.status).toBe('resolved');
    expect(t.progress).toBe(100);
    expect(t.updates[t.updates.length - 1].text).toBe('已全部整改完毕');
  });

  it('close() 应归档', () => {
    store.close(trackId, '已归档');
    const t = store.getAll()[0];
    expect(t.status).toBe('closed');
    expect(t.progress).toBe(100);
    expect(t.updates[t.updates.length - 1].text).toBe('已归档');
  });
});

// ─── 删除 ──

describe('TrackStore — 删除', () => {
  it('remove() 应删除指定记录', () => {
    const t = store.add({ title: '待删除项' });
    expect(store.getAll()).toHaveLength(1);
    expect(store.remove(t.id)).toBe(true);
    expect(store.getAll()).toHaveLength(0);
  });

  it('remove() 不存在 id 应返回 false', () => {
    expect(store.remove('nonexistent')).toBe(false);
  });
});

// ─── autoCreateFromContext ──

describe('TrackStore — autoCreateFromContext', () => {
  it('应创建带上下文的跟踪', () => {
    const t = store.autoCreateFromContext('消防通道堵塞', '智能诊断', '张三', '2026-07-01');
    expect(t.title).toBe('消防通道堵塞');
    expect(t.source).toBe('智能诊断');
    expect(t.responsibility).toBe('张三');
    expect(t.deadline).toBe('2026-07-01');
    expect(t.updates[0].text).toContain('来自「智能诊断」自动创建');
  });
});

// ─── 持久化 ──

describe('TrackStore — 持久化', () => {
  it('数据应通过 localStorage 持久化', () => {
    store.add({ title: '持久化数据' });
    const saved = JSON.parse(localStorage.getItem('yaq_tracks_test'));
    expect(saved).toHaveLength(1);
    expect(saved[0].title).toBe('持久化数据');
  });

  it('新 TrackStore 实例应能读取已保存的数据', () => {
    store.add({ title: '跨实例数据' });
    const store2 = createTrackStore();
    const all = store2.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('跨实例数据');
  });

  it('使用不同 key 的实例不应共享数据', () => {
    store.add({ title: '实例A' });

    const store2 = createTrackStore();
    store2._key = 'yaq_tracks_test_other';
    const all2 = store2.getAll();
    expect(all2).toHaveLength(0);

    store2.add({ title: '实例B' });
    expect(store.getAll()).toHaveLength(1);
  });
});

// ─── recalcDays ──

describe('TrackStore — recalcDays', () => {
  it('应更新活跃跟踪的天数', () => {
    const t = store.add({ title: '天数测试' });
    // 修改 createdAt 为 5 天前
    const past = new Date(Date.now() - 5 * 86400000);
    t.createdAt = past.toISOString();
    store._save();
    store.recalcDays();
    expect(t.daysTracked).toBe(5);
  });

  it('不应更新已关闭跟踪的天数', () => {
    const t = store.add({ title: '已归档' });
    const past = new Date(Date.now() - 10 * 86400000);
    t.createdAt = past.toISOString();
    store.close(t.id);
    store.recalcDays();
    // 关闭状态的记录天数不会更新（但 daysTracked 可能仍为 0）
    expect(store.getByStatus('closed')[0].daysTracked).toBe(0);
  });
});

// ─── 边界情况 ──

describe('TrackStore — 边界情况', () => {
  it('大量记录不应报错', () => {
    for (let i = 0; i < 100; i++) {
      store.add({ title: '批量测试 #' + i });
    }
    expect(store.getAll()).toHaveLength(100);
    expect(store.stats().total).toBe(100);
  });

  it('update 时 opts.progress=0 应正确设置', () => {
    const t = store.add({ title: '零进度' });
    store.update(t.id, { progress: 0 });
    expect(store.getAll()[0].progress).toBe(0);
  });

  it('update 不传 note 不应添加更新记录', () => {
    const t = store.add({ title: '无备注' });
    store.update(t.id, { progress: 50 });
    expect(store.getAll()[0].updates).toHaveLength(1); // 只有初始创建记录
  });

  it('clear 所有数据后 getAll 应返回空数组', () => {
    store.add({ title: '将被清除' });
    localStorage.removeItem('yaq_tracks_test');
    // 新建 TrackStore 实例读取空数据
    const freshStore = createTrackStore();
    expect(freshStore.getAll()).toEqual([]);
  });
});
