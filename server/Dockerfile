# ========================================
# Stage 1: YaneuraOu ビルド (Ubuntu 24.04)
# ========================================
FROM ubuntu:24.04 AS engine-builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    clang \
    git \
    wget \
    p7zip-full \
    libopenblas-dev \
    libomp-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
RUN git clone --depth 1 https://github.com/yaneurao/YaneuraOu.git

WORKDIR /build/YaneuraOu/source
RUN sed -i 's/-flto//g' Makefile && \
    make clean && \
    make -j4 normal COMPILER=g++ TARGET_CPU=SSE42 YANEURAOU_EDITION=YANEURAOU_ENGINE_NNUE

WORKDIR /build/eval
RUN wget -q -O Suisho5.7z "https://github.com/yaneurao/YaneuraOu/releases/download/suisho5/Suisho5.7z" && \
    7z x Suisho5.7z && \
    find . -name "nn.bin" -exec cp {} /build/eval/nn.bin \;

# ========================================
# Stage 2: Bun + アプリ + YaneuraOu 実行環境
# ========================================
FROM oven/bun:1.3 AS runtime

ENV DEBIAN_FRONTEND=noninteractive

# YaneuraOuのランタイム依存関係（OpenMP, OpenBLAS）
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libopenblas0 \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /engine/eval

COPY --from=engine-builder /build/YaneuraOu/source/YaneuraOu-by-gcc /engine/YaneuraOu
COPY --from=engine-builder /build/eval/nn.bin /engine/eval/nn.bin
RUN chmod +x /engine/YaneuraOu && \
    echo "Suisho5" > /engine/engine_name.txt

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY tsconfig.json drizzle.config.ts ./
COPY src ./src

# SQLiteファイル用のデータディレクトリ
RUN mkdir -p /app/data

ENV NODE_ENV=production \
    PORT=8787 \
    DATABASE_URL=file:/app/data/shogi.db \
    ENGINE_PATH=/engine/YaneuraOu \
    ENGINE_CWD=/engine

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD bun -e "fetch('http://localhost:' + (process.env.PORT || 8787) + '/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "src/index.ts"]
