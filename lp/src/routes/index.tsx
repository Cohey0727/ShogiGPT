import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import {
  ChatBubbleIcon,
  ReaderIcon,
  PersonIcon,
  RocketIcon,
  LightningBoltIcon,
  TargetIcon,
  BarChartIcon,
  PlayIcon,
} from "../components/icons/Icons";
import { FloatingPieces } from "../components/FloatingPieces/FloatingPieces";
import { FeatureItem } from "../components/FeatureItem";

export default component$(() => {
  return (
    <>
      {/* Floating Pieces Background */}
      <FloatingPieces />

      {/* Hero Section */}
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-logo">ShogiGPT</h1>
          <p class="hero-tagline">チャットで指す、新しい将棋体験</p>
          <p class="hero-description">
            AIと会話しながら将棋を楽しむ。 手を指すのも、質問するのも、すべてチャットで完結。
          </p>
          <a href="#demo" class="hero-cta">
            デモを見る
          </a>
        </div>
      </section>

      {/* Problem Section */}
      <section class="section problem">
        <div class="container">
          <h2 class="section-title">こんな経験ありませんか？</h2>
          <div class="problem-grid">
            <div class="problem-card">
              <div class="problem-card-icon">
                <ChatBubbleIcon size={40} />
              </div>
              <h3 class="problem-card-title">AIは強いけど無言</h3>
              <p class="problem-card-text">
                将棋ソフトに負けても、なぜその手なのか聞けない。 ただ「最善手」が表示されるだけ。
              </p>
            </div>
            <div class="problem-card">
              <div class="problem-card-icon">
                <ReaderIcon size={40} />
              </div>
              <h3 class="problem-card-title">対局と学習が別々</h3>
              <p class="problem-card-text">
                対局中に疑問が浮かんでも、別のツールで調べる必要がある。 流れが途切れてしまう。
              </p>
            </div>
            <div class="problem-card">
              <div class="problem-card-icon">
                <PersonIcon size={40} />
              </div>
              <h3 class="problem-card-title">一人で黙々と指すのは寂しい</h3>
              <p class="problem-card-text">
                感想戦をしてくれる相手もいない。 自分の上達ポイントがわからない。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section class="section solution">
        <div class="container">
          <h2 class="section-title">ShogiGPTが解決します</h2>
          <div class="solution-main">
            <p class="solution-highlight">チャットで指す + 質問する = 新しい将棋体験</p>
            <p class="solution-text">
              対局しながらAIに質問できる。
              「なぜその手？」「他の選択肢は？」にその場で答えてくれる。
              対局と学習が一体化した、まるで師匠がそばにいるような体験。
            </p>
          </div>
          <div class="solution-visual">
            <img src="/assets/images/solution.png" alt="チャットで手を指している様子" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section class="section features">
        <div class="container">
          <h2 class="section-title">主な機能</h2>
          <p class="section-subtitle">チャット形式だからこそできる、新しい将棋の楽しみ方</p>

          <div class="feature-list">
            {/* Feature 1 */}
            <FeatureItem
              number="01"
              title="チャットで対局"
              description="自然言語で手を指せます。「7六歩」「同飛車」など、普段使う将棋の言葉でそのまま指示。 AIが応手しながら会話してくれます。"
              points={[
                "自然言語で手を指せる",
                "AIの応答がチャットで返ってくる",
                "対局の流れがログとして残る",
              ]}
            >
              <img src="/assets/images/feature_01.png" alt="「7六歩」と入力してAIが応答する様子" />
            </FeatureItem>

            {/* Feature 2 */}
            <FeatureItem
              number="02"
              title="対話しながら学ぶ"
              description="対局中に「この手はなぜ悪い？」「他の候補は？」と質問できます。AIが局面を理解した上で、わかりやすく解説してくれます。"
              points={[
                "「なぜ？」にその場で回答",
                "候補手を評価値付きで提示",
                "読み筋も含めて解説",
              ]}
            >
              <img src="/assets/images/feature_02.png" alt="「この手はどう？」に対するAIの解説" />
            </FeatureItem>

            {/* Feature 3 */}
            <FeatureItem
              number="03"
              title="感想戦も会話で"
              description="対局終了後、AIが自動でターニングポイントを分析。「あの局面どうすればよかった？」にも答えてくれます。"
              points={[
                "ターニングポイントを自動検出",
                "最善手順を提示",
                "改善点をわかりやすく解説",
              ]}
            >
              {/* TODO: 感想戦のスクリーンショット */}
              <div class="feature-visual-placeholder">
                <span class="hero-visual-placeholder-icon">
                  <BarChartIcon size={48} />
                </span>
                <span class="placeholder-label">
                  [スクリーンショット] 感想戦画面（ターニングポイント表示）
                </span>
              </div>
            </FeatureItem>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section class="section comparison">
        <div class="container">
          <h2 class="section-title">従来の将棋ソフトとの違い</h2>
          <div class="comparison-table">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>従来の将棋ソフト</th>
                  <th>ShogiGPT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>操作方法</td>
                  <td>GUIで駒をドラッグ</td>
                  <td>チャットで自然言語入力</td>
                </tr>
                <tr>
                  <td>対局中の質問</td>
                  <td>できない</td>
                  <td>その場で質問・回答</td>
                </tr>
                <tr>
                  <td>解説</td>
                  <td>最善手のみ表示</td>
                  <td>理由も含めて説明</td>
                </tr>
                <tr>
                  <td>感想戦</td>
                  <td>自分で分析</td>
                  <td>AIが自動で分析・解説</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" class="section demo">
        <div class="container">
          <h2 class="section-title">デモ動画</h2>
          <p class="section-subtitle">実際の操作をご覧ください</p>
          <div class="demo-video">
            {/* TODO: デモ動画 */}
            <div class="demo-video-placeholder">
              <div class="demo-play-button">
                <PlayIcon size={32} />
              </div>
              <span class="placeholder-label">[動画] デモ動画（2分程度）</span>
            </div>
          </div>
        </div>
      </section>

      {/* Target Section */}
      <section class="section target">
        <div class="container">
          <h2 class="section-title">こんな方におすすめ</h2>
          <div class="target-grid">
            <div class="target-card">
              <div class="target-card-icon">
                <RocketIcon size={48} />
              </div>
              <h3 class="target-card-title">将棋初心者〜中級者</h3>
              <p class="target-card-text">級位者から初段を目指す方に最適</p>
            </div>
            <div class="target-card">
              <div class="target-card-icon">
                <LightningBoltIcon size={48} />
              </div>
              <h3 class="target-card-title">上達のヒントが欲しい方</h3>
              <p class="target-card-text">「何が悪いかわからない」を解消</p>
            </div>
            <div class="target-card">
              <div class="target-card-icon">
                <TargetIcon size={48} />
              </div>
              <h3 class="target-card-title">一人で効率よく学びたい方</h3>
              <p class="target-card-text">いつでもAI師匠と対局・復習</p>
            </div>
            <div class="target-card">
              <div class="target-card-icon">
                <ChatBubbleIcon size={48} />
              </div>
              <h3 class="target-card-title">AIと会話したい方</h3>
              <p class="target-card-text">チャット形式で楽しく将棋</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="section cta">
        <div class="container">
          <h2 class="section-title">チャットで将棋、始めませんか？</h2>
          <p class="cta-text">AIと会話しながら将棋を楽しむ、新しい体験をお試しください。</p>
          <a href="https://shogi-gpt.example.com" class="cta-button">
            今すぐ始める
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer class="footer">
        <div class="footer-logo">ShogiGPT</div>
        <p>© {new Date().getFullYear()} ShogiGPT. All rights reserved.</p>
      </footer>
    </>
  );
});

export const head: DocumentHead = {
  title: "ShogiGPT - チャットで指す、新しい将棋体験",
  meta: [
    {
      name: "description",
      content:
        "AIと会話しながら将棋を楽しむ。手を指すのも、質問するのも、すべてチャットで完結。対局と学習が一体化した新しい将棋体験。",
    },
    {
      name: "keywords",
      content: "将棋, AI, チャット, ShogiGPT, 将棋AI, オンライン将棋",
    },
    {
      property: "og:title",
      content: "ShogiGPT - チャットで指す、新しい将棋体験",
    },
    {
      property: "og:description",
      content: "AIと会話しながら将棋を楽しむ。手を指すのも、質問するのも、すべてチャットで完結。",
    },
    {
      property: "og:type",
      content: "website",
    },
  ],
};
