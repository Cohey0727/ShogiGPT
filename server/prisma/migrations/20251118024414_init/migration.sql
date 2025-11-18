-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('ONGOING', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "Player" AS ENUM ('SENTE', 'GOTE');

-- CreateEnum
CREATE TYPE "PlayerType" AS ENUM ('HUMAN', 'AI');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

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
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "moveNotation" TEXT,
    "player" "Player" NOT NULL,
    "sfen" TEXT NOT NULL,
    "thinkingTime" INTEGER,

    CONSTRAINT "match_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "isPartial" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "matches_createdAt_idx" ON "matches"("createdAt");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "match_states_matchId_idx" ON "match_states"("matchId");

-- CreateIndex
CREATE INDEX "match_states_matchId_index_idx" ON "match_states"("matchId", "index");

-- CreateIndex
CREATE INDEX "chat_messages_matchId_idx" ON "chat_messages"("matchId");

-- CreateIndex
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- AddForeignKey
ALTER TABLE "match_states" ADD CONSTRAINT "match_states_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
