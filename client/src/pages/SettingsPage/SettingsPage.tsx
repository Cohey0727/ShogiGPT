import { Link } from "wouter";
import styles from "./SettingsPage.css";

export function SettingsPage() {
  return (
    <div className={styles.container}>
      <Link href="/">
        <button className={styles.backButton}>← ホームに戻る</button>
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>設定</h1>
        <p className={styles.subtitle}>
          あなたの将棋体験をカスタマイズしましょう
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span>🎮</span>
            <span>ゲーム設定</span>
          </h2>
          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <span className={styles.settingName}>AI難易度</span>
              <span className={styles.settingDescription}>
                AIの強さを選択してください
              </span>
            </div>
            <select className={styles.select}>
              <option>初級</option>
              <option>中級</option>
              <option>上級</option>
              <option>プロ</option>
            </select>
          </div>
          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <span className={styles.settingName}>持ち時間</span>
              <span className={styles.settingDescription}>
                1局あたりの制限時間
              </span>
            </div>
            <select className={styles.select}>
              <option>10分</option>
              <option>20分</option>
              <option>30分</option>
              <option>無制限</option>
            </select>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span>🎨</span>
            <span>表示設定</span>
          </h2>
          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <span className={styles.settingName}>盤面テーマ</span>
              <span className={styles.settingDescription}>
                将棋盤のデザインを選択
              </span>
            </div>
            <select className={styles.select}>
              <option>クラシック</option>
              <option>モダン</option>
              <option>ダーク</option>
            </select>
          </div>
          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <span className={styles.settingName}>駒のデザイン</span>
              <span className={styles.settingDescription}>
                駒の表示スタイル
              </span>
            </div>
            <select className={styles.select}>
              <option>一字駒</option>
              <option>二字駒</option>
              <option>草書体</option>
            </select>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span>🔔</span>
            <span>通知設定</span>
          </h2>
          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <span className={styles.settingName}>効果音</span>
              <span className={styles.settingDescription}>
                駒を動かした時の音
              </span>
            </div>
            <select className={styles.select}>
              <option>ON</option>
              <option>OFF</option>
            </select>
          </div>
          <div className={styles.settingRow}>
            <div className={styles.settingLabel}>
              <span className={styles.settingName}>対局終了通知</span>
              <span className={styles.settingDescription}>
                対局が終了した時の通知
              </span>
            </div>
            <select className={styles.select}>
              <option>ON</option>
              <option>OFF</option>
            </select>
          </div>
        </div>

        <button className={styles.saveButton}>設定を保存</button>
      </div>
    </div>
  );
}
