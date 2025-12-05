import { useCallback, useLayoutEffect, useState, type Dispatch, type SetStateAction } from "react";

import { getFromPath, setFromPath } from "../../../shared/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const subscriptions = new Map<string, Set<(value: any) => void>>();

// オーバーロードシグネチャ(初期値が指定されている場合)
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>];

// オーバーロードシグネチャ(初期値がオプショナルまたは、undefinedの場合)
export function useLocalStorage<T>(
  key: string,
  initialValue?: T,
): [T | undefined, Dispatch<SetStateAction<T>>];

/**
 * ローカルストレージを利用するカスタムフック
 * @remarks
 * Client Side renderingでのみ対応
 */
export function useLocalStorage<T>(key: string, initialValue?: T) {
  const [inMemoryValue, setInMemoryValue] = useState<T | undefined>(() => {
    try {
      const storedValue = getLocalStorageValue<T>(key);
      return storedValue ?? initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T | undefined) => T)) => {
    const currentValue = getLocalStorageValue<T>(key) ?? initialValue; // undefinedの場合は初期値を使用する
    const newValue = value instanceof Function ? value(currentValue) : value;
    setLocalStorageValue(key, newValue);
    // localStorageの変更を通知する(自身も含む)
    const keys = key.split(".");
    subscriptions.forEach((subscribedSubs, subscribedKey) => {
      const subscribedKeys = subscribedKey.split(".");
      const notice = keys.every((key, index) => subscribedKeys[index] === key);
      if (notice) {
        const noticeValue = getLocalStorageValue(subscribedKey);
        subscribedSubs.forEach((sub) => sub(noticeValue));
      }
    });
    // keyの変更は反映しない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 同一タブでlocalStorageが変更された場合に反映する
  useLayoutEffect(() => {
    const subs = subscriptions.get(key) || new Set();
    subs.add(setInMemoryValue);
    subscriptions.set(key, subs);
    return () => {
      const currentSubs = subscriptions.get(key);
      if (currentSubs) {
        currentSubs.delete(setInMemoryValue);
      }
    };
    // keyの変更は反映しない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 別タブでlocalStorageが変更された場合に反映する
  useLayoutEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      const [rootKey, valuePath] = splitLocalStorageKeys(key);
      if (event.key !== rootKey) return;
      const newRootData = event.newValue;
      const newRootValue = newRootData ? JSON.parse(newRootData) : initialValue;
      if (!valuePath) {
        // キーがネストしていない場合
        setInMemoryValue(newRootValue);
      } else {
        // キーがネストしている場合
        const newValue = getFromPath(newRootValue as object, valuePath as never);
        setInMemoryValue(newValue);
      }
    };
    addEventListener("storage", handleStorageChange);
    return () => removeEventListener("storage", handleStorageChange);
    // keyの変更は反映しない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [inMemoryValue, setValue] as const;
}

const splitLocalStorageKeys = (key: string) => {
  const keys = key.split(".");
  const rootKey = keys[0];
  const valuePath = keys.slice(1).length > 0 ? keys.slice(1).join(".") : undefined;
  return [rootKey, valuePath] as const;
};

function getLocalStorageValue<T>(key: string) {
  const [rootKey, valuePath] = splitLocalStorageKeys(key);
  if (!valuePath) {
    // キーがネストしていない場合
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : undefined;
  } else {
    // キーがネストしている場合
    const rootData = localStorage.getItem(rootKey);
    const rooValue = rootData ? JSON.parse(rootData) : undefined;
    return rooValue ? (getFromPath(rooValue as object, valuePath as never) as T) : undefined;
  }
}

function setLocalStorageValue<T>(key: string, value: T) {
  const [rootKey, valuePath] = splitLocalStorageKeys(key);
  if (!valuePath) {
    // キーがネストしていない場合
    localStorage.setItem(rootKey, JSON.stringify(value));
  } else {
    // キーがネストしている場合
    const rootData = localStorage.getItem(rootKey);
    const rootValue = rootData ? JSON.parse(rootData) : {};
    setFromPath(rootValue as object, valuePath as never, value);
    localStorage.setItem(rootKey, JSON.stringify(rootValue));
  }
}
