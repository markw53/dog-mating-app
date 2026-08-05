-- AlterTable
ALTER TABLE "dogs" ADD COLUMN     "rejectionReason" TEXT;

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "dogs_status_createdAt_idx" ON "dogs"("status", "createdAt");

-- CreateIndex
CREATE INDEX "dogs_ownerId_idx" ON "dogs"("ownerId");

-- CreateIndex
CREATE INDEX "dogs_breed_idx" ON "dogs"("breed");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_receiverId_read_idx" ON "messages"("receiverId", "read");

-- CreateIndex
CREATE INDEX "reviews_dogId_idx" ON "reviews"("dogId");

-- CreateIndex
CREATE INDEX "device_push_tokens_userId_idx" ON "device_push_tokens"("userId");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

