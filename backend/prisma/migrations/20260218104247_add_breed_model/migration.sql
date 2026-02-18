-- AlterTable
ALTER TABLE "dogs" ADD COLUMN     "breedId" TEXT;

-- CreateTable
CREATE TABLE "breeds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "height" TEXT,
    "weight" TEXT,
    "color" TEXT NOT NULL DEFAULT 'Various',
    "longevity" TEXT,
    "healthProblems" TEXT,
    "imageUrl" TEXT,
    "officialLink" TEXT,
    "kennelClubCategory" TEXT,
    "size" TEXT,
    "exerciseNeeds" TEXT,
    "grooming" TEXT,
    "temperament" TEXT,
    "goodWithChildren" TEXT,
    "searchKeywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breeds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "breeds_name_key" ON "breeds"("name");

-- CreateIndex
CREATE UNIQUE INDEX "breeds_slug_key" ON "breeds"("slug");

-- AddForeignKey
ALTER TABLE "dogs" ADD CONSTRAINT "dogs_breedId_fkey" FOREIGN KEY ("breedId") REFERENCES "breeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
