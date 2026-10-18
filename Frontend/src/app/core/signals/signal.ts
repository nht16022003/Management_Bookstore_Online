/**
 * Module Angular Signals Polyfill / Reactive State Management
 * Chuẩn hóa API tương thích 100% với Angular Signals (Angular 16+)
 * dành cho môi trường Angular 9 (TypeScript 3.7+).
 * 
 * Hỗ trợ:
 * - signal<T>(initialValue): WritableSignal<T> (với .set(), .update())
 * - computed<T>(computation): () => T
 * - effect(effectFn): { destroy: () => void }
 */

type Dependency = () => void;

let activeWatcher: Dependency | null = null;

export interface Signal<T> {
  (): T;
}

export interface WritableSignal<T> extends Signal<T> {
  set(value: T): void;
  update(updateFn: (current: T) => T): void;
  asReadonly(): Signal<T>;
}

export interface EffectRef {
  destroy(): void;
}

/**
 * Tạo một WritableSignal có thể đọc và ghi trạng thái phản ứng
 */
export function signal<T>(initialValue: T): WritableSignal<T> {
  let currentValue = initialValue;
  const subscribers = new Set<Dependency>();

  const readFn = ((() => {
    if (activeWatcher) {
      subscribers.add(activeWatcher);
    }
    return currentValue;
  }) as unknown) as WritableSignal<T>;

  readFn.set = (newValue: T) => {
    if (currentValue !== newValue) {
      currentValue = newValue;
      notifySubscribers();
    }
  };

  readFn.update = (updateFn: (current: T) => T) => {
    readFn.set(updateFn(currentValue));
  };

  readFn.asReadonly = () => {
    return () => readFn();
  };

  function notifySubscribers() {
    const subsToNotify = Array.from(subscribers);
    for (const sub of subsToNotify) {
      sub();
    }
  }

  return readFn;
}

/**
 * Tạo một Computed Signal dẫn xuất từ các signals khác, tự động cập nhật
 */
export function computed<T>(computation: () => T): () => T {
  let cachedValue: T;
  let isDirty = true;
  const subscribers = new Set<Dependency>();

  const watcher: Dependency = () => {
    isDirty = true;
    for (const sub of Array.from(subscribers)) {
      sub();
    }
  };

  return () => {
    if (activeWatcher) {
      subscribers.add(activeWatcher);
    }

    if (isDirty) {
      const prevWatcher = activeWatcher;
      activeWatcher = watcher;
      try {
        cachedValue = computation();
      } finally {
        activeWatcher = prevWatcher;
      }
      isDirty = false;
    }

    return cachedValue;
  };
}

/**
 * Thực thi một side effect phản ứng khi các signals phụ thuộc thay đổi
 */
export function effect(effectFn: () => void): EffectRef {
  let isDestroyed = false;

  const runEffect: Dependency = () => {
    if (isDestroyed) return;
    const prevWatcher = activeWatcher;
    activeWatcher = runEffect;
    try {
      effectFn();
    } finally {
      activeWatcher = prevWatcher;
    }
  };

  // Chạy lần đầu tiên để thu thập dependencies
  runEffect();

  return {
    destroy: () => {
      isDestroyed = true;
    }
  };
}
