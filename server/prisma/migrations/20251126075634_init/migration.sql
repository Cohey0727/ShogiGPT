-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('ONGOING', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "PlayerType" AS ENUM ('HUMAN', 'AI');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'ONGOING',
    "playerSente" TEXT,
    "playerGote" TEXT,
    "senteType" "PlayerType" NOT NULL DEFAULT 'HUMAN',
    "goteType" "PlayerType" NOT NULL DEFAULT 'HUMAN',

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_states" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "usiMove" TEXT NOT NULL,
    "sfen" TEXT NOT NULL,
    "thinkingTime" INTEGER,

    CONSTRAINT "match_states_pkey" PRIMARY KEY ("matchId","index")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "contents" JSONB NOT NULL,
    "isPartial" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sfen" TEXT NOT NULL,
    "engineName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "variations" JSONB NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "matches_createdAt_idx" ON "matches"("createdAt");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "chat_messages_matchId_idx" ON "chat_messages"("matchId");

-- CreateIndex
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- CreateIndex
CREATE INDEX "evaluations_sfen_idx" ON "evaluations"("sfen");

-- CreateIndex
CREATE INDEX "evaluations_engineName_idx" ON "evaluations"("engineName");

-- CreateIndex
CREATE UNIQUE INDEX "evaluations_sfen_engineName_key" ON "evaluations"("sfen", "engineName");

-- AddForeignKey
ALTER TABLE "match_states" ADD CONSTRAINT "match_states_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
