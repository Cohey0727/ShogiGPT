import { useMemo, useRef, useState } from "react";

interface ModalActions<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

/**
 * モーダルの表示状態とPromiseベースの制御を提供するカスタムフック
 *
 * @template T モーダルから返される値の型
 * @returns [isOpen, controller] - モーダルの表示状態と制御オブジェクト
 *
 * @example
 * // 使用例
 * const [isModalOpen, modalController] = useModalController<string>();
 *
 * // モーダルを開き、結果を待つ
 * const handleOpenModal = async () => {
 *   try {
 *     const result = await modalController.open();
 *     console.log('モーダル結果:', result);
 *   } catch (error) {
 *     console.error('モーダルがキャンセルされました', error);
 *   }
 * };
 *
 * // モーダル内で値を返して閉じる
 * const handleConfirm = () => {
 *   modalController.close('選択された値');
 * };
 */
export const useModal = <T>() => {
  const [promise, setPromise] = useState<Promise<T | undefined>>();
  const resolversRef = useRef<ModalActions<T | undefined>>(undefined);

  const controller = useMemo(
    () => ({
      open: () => {
        const { promise, ...resolvers } = Promise.withResolvers<T | undefined>();
        resolversRef.current = resolvers;
        setPromise(promise);
        return promise;
      },
      close: (value?: T) => {
        if (!resolversRef.current) return;
        resolversRef.current.resolve(value);
        setPromise(undefined);
      },
      reject: (reason?: unknown) => {
        throw new Error(String(reason));
      },
    }),
    [],
  );
  return [!!promise, controller] as const;
};
