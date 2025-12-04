# ========================================
# Stage 1: YaneuraOu Build Stage
# ========================================
FROM ubuntu:24.04 AS builder

# 非対話モードに設定
ENV DEBIAN_FRONTEND=noninteractive

# ビルドに必要な依存関係をインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    clang \
    git \
    wget \
    unzip \
    libopenblas-dev \
    libomp-dev \
    && rm -rf /var/lib/apt/lists/*

# YaneuraOuをクローンしてビルド
WORKDIR /build
RUN git clone https://github.com/yaneurao/YaneuraOu.git

WORKDIR /build/YaneuraOu/source

# SSE42でノーマルビルドを実行（LTOを無効化してビルド時間を短縮）
# Apple Silicon MacのRosetta 2エミュレーションではAVX2が動作しないためSSE42を使用
# 本番環境（x86）ではAVX2に変更することでパフォーマンス向上可能
# MakefileからLTOフラグを削除してビルド
RUN sed -i 's/-flto//g' Makefile && \
    make clean && \
    make -j4 normal COMPILER=g++ TARGET_CPU=SSE42 YANEURAOU_EDITION=YANEURAOU_ENGINE_NNUE

# 水匠5の評価関数ファイルをダウンロード
WORKDIR /build/eval
# suisho5タグから直接ダウンロード
RUN wget -O Suisho5.7z "https://github.com/yaneurao/YaneuraOu/releases/download/suisho5/Suisho5.7z" && \
    apt-get update && apt-get install -y p7zip-full && \
    7z x Suisho5.7z && \
    find . -name "nn.bin" -exec cp {} /build/eval/nn.bin \; && \
    rm -rf /var/lib/apt/lists/*

# ========================================
# Stage 2: 実行環境（Ubuntu 24.04 + Python 3.14 + uv）
# ========================================
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# ランタイムライブラリとPython 3.14（Ubuntu 24.04デフォルト）をインストール
RUN apt-get update && apt-get install -y \
    libgomp1 \
    libopenblas0 \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# uvをインストール
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

# 非rootユーザーを作成
RUN useradd -m shogi && \
    mkdir -p /app /engine /engine/eval && \
    chown -R shogi:shogi /app /engine

# YaneuraOuバイナリと評価関数をコピー
COPY --from=builder --chown=shogi:shogi /build/YaneuraOu/source/YaneuraOu-by-gcc /engine/YaneuraOu
COPY --from=builder --chown=shogi:shogi /build/eval/nn.bin /engine/eval/nn.bin

# エンジン名ファイルを作成
RUN echo "Suisho5" > /engine/engine_name.txt && \
    chown shogi:shogi /engine/engine_name.txt

# 非rootユーザーに切り替え
USER shogi

# uvをユーザー環境にもインストール
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/home/shogi/.local/bin:$PATH"

# エンジンに実行権限を付与
RUN chmod +x /engine/YaneuraOu

# Python依存関係をインストール
WORKDIR /app
COPY --chown=shogi:shogi pyproject.toml uv.lock ./
RUN uv sync --frozen

# アプリケーションコードをコピー
COPY --chown=shogi:shogi app/ /app/

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Uvicornでサーバーを起動
# venvをアクティベートしてからuvicornを実行
CMD ["/bin/sh", "-c", "cd /app && . .venv/bin/activate && python -m uvicorn main:app --host 0.0.0.0 --port 8000"]
