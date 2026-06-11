/**
 * Validates and recalculates product.rating / product.reviewCount
 * from actual rows in the reviews table.
 *
 * Usage (local DB):
 *   npm run recalculate-ratings
 *   npm run recalculate-ratings -- --dry-run
 *
 * Usage (Railway prod via TCP proxy):
 *   $env:DATABASE_URL="postgresql://user:pass@host:port/mydatabase"
 *   npm run recalculate-ratings -- --dry-run
 *   npm run recalculate-ratings
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Product } from '../src/modules/products/entities/product.entity';
import { Review } from '../src/modules/reviews/entities/review.entity';

interface ReviewStatsRow {
  productId: string;
  reviewCount: string;
  avgRating: string | null;
}

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  rating: string | null;
  reviewCount: number;
}

interface OrphanReviewRow {
  id: string;
  productId: string;
  userId: number;
  rating: number;
}

interface InvalidReviewRow {
  id: string;
  productId: string;
  userId: number;
  rating: number;
}

function roundRating(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

function parseRating(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? roundRating(num) : null;
}

function ratingsEqual(a: number | null, b: number | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return Math.abs(a - b) < 0.005;
}

function prepareDatabaseEnv(): void {
  if (process.env.DATABASE_URL) {
    console.log('📝 Using DATABASE_URL for connection');
    return;
  }

  if (!process.env.DB_HOST || process.env.DB_HOST === 'postgres') {
    process.env.DB_HOST = 'localhost';
    if (!process.env.DB_PORT) {
      process.env.DB_PORT = '5432';
    }
    console.log(`📝 Using local database settings (${process.env.DB_HOST}:${process.env.DB_PORT})`);
    console.log('💡 For Railway prod, set DATABASE_URL or DB_HOST/DB_PORT/...');
    return;
  }

  console.log(
    `📝 Using DB settings: ${process.env.DB_HOST}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_DATABASE ?? '?'}`,
  );
}

async function waitForDatabase(dataSource: DataSource): Promise<void> {
  console.log('⏳ Waiting for database connection...');
  let retries = 30;

  while (retries > 0) {
    if (dataSource.isInitialized) {
      console.log('✅ Database connected!');
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    retries--;
  }

  throw new Error('Database connection not initialized after 30 attempts');
}

async function recalculateProductRatings(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');

  prepareDatabaseEnv();

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    await waitForDatabase(dataSource);

    console.log('\n🔍 Checking product ratings against reviews...\n');

    const invalidReviews = await dataSource.query<InvalidReviewRow[]>(`
      SELECT id, "productId", "userId", rating
      FROM reviews
      WHERE rating < 1 OR rating > 5
      ORDER BY "createdAt" ASC
    `);

    const orphanReviews = await dataSource.query<OrphanReviewRow[]>(`
      SELECT r.id, r."productId", r."userId", r.rating
      FROM reviews r
      LEFT JOIN products p ON p.id = r."productId"
      WHERE p.id IS NULL
      ORDER BY r."createdAt" ASC
    `);

    const reviewStats = await dataSource.query<ReviewStatsRow[]>(`
      SELECT
        "productId",
        COUNT(*)::text AS "reviewCount",
        AVG(rating::numeric)::text AS "avgRating"
      FROM reviews
      GROUP BY "productId"
    `);

    const statsByProductId = new Map(
      reviewStats.map((row) => [
        row.productId,
        {
          reviewCount: Number(row.reviewCount),
          rating: row.avgRating ? roundRating(Number(row.avgRating)) : null,
        },
      ]),
    );

    const products = await dataSource.query<ProductRow[]>(`
      SELECT id, name, sku, rating::text AS rating, "reviewCount"
      FROM products
      ORDER BY name ASC
    `);

    const mismatches: Array<{
      id: string;
      name: string;
      sku: string;
      oldRating: number | null;
      newRating: number | null;
      oldReviewCount: number;
      newReviewCount: number;
    }> = [];

    for (const product of products) {
      const actual = statsByProductId.get(product.id) ?? {
        reviewCount: 0,
        rating: null,
      };

      const currentRating = parseRating(product.rating);
      const currentReviewCount = Number(product.reviewCount) || 0;

      const needsUpdate =
        currentReviewCount !== actual.reviewCount || !ratingsEqual(currentRating, actual.rating);

      if (needsUpdate) {
        mismatches.push({
          id: product.id,
          name: product.name,
          sku: product.sku,
          oldRating: currentRating,
          newRating: actual.rating,
          oldReviewCount: currentReviewCount,
          newReviewCount: actual.reviewCount,
        });
      }
    }

    const productsWithReviewsButNoProduct = [...statsByProductId.keys()].filter(
      (productId) => !products.some((product) => product.id === productId),
    );

    console.log(`📦 Products checked: ${products.length}`);
    console.log(`⭐ Products with reviews in DB: ${statsByProductId.size}`);
    console.log(`⚠️  Mismatched products: ${mismatches.length}`);
    console.log(`🚫 Invalid reviews (rating not 1-5): ${invalidReviews.length}`);
    console.log(`👻 Orphan reviews (product missing): ${orphanReviews.length}`);

    if (invalidReviews.length > 0) {
      console.log('\n--- Invalid reviews ---');
      for (const review of invalidReviews) {
        console.log(
          `  review ${review.id}: product=${review.productId}, user=${review.userId}, rating=${review.rating}`,
        );
      }
    }

    if (orphanReviews.length > 0) {
      console.log('\n--- Orphan reviews ---');
      for (const review of orphanReviews) {
        console.log(
          `  review ${review.id}: missing product=${review.productId}, user=${review.userId}, rating=${review.rating}`,
        );
      }
    }

    if (productsWithReviewsButNoProduct.length > 0) {
      console.log('\n--- Reviews linked to missing products ---');
      for (const productId of productsWithReviewsButNoProduct) {
        const stats = statsByProductId.get(productId)!;
        console.log(
          `  product ${productId}: ${stats.reviewCount} review(s), avg=${stats.rating ?? 'null'}`,
        );
      }
    }

    if (mismatches.length > 0) {
      console.log('\n--- Products to update ---');
      for (const item of mismatches) {
        console.log(`  [${item.sku}] ${item.name}`);
        console.log(`    rating: ${item.oldRating ?? 'null'} -> ${item.newRating ?? 'null'}`);
        console.log(`    reviewCount: ${item.oldReviewCount} -> ${item.newReviewCount}`);
      }
    } else {
      console.log('\n✅ All product ratings already match actual reviews.');
    }

    if (mismatches.length === 0) {
      await app.close();
      process.exit(0);
    }

    if (dryRun) {
      console.log('\n🛑 Dry run only. Re-run without --dry-run to apply changes.');
      await app.close();
      process.exit(0);
    }

    console.log('\n✏️  Applying updates...');

    await dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);

      for (const item of mismatches) {
        await productRepo.update(item.id, {
          reviewCount: item.newReviewCount,
          rating: item.newRating,
        });
      }
    });

    console.log(`✅ Updated ${mismatches.length} product(s).`);

    const totalReviews = await managerCountReviews(dataSource);
    console.log(`📊 Total reviews in DB: ${totalReviews}`);
  } catch (error) {
    console.error('❌ Failed to recalculate product ratings:');
    console.error(error);
    await app.close();
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

async function managerCountReviews(dataSource: DataSource): Promise<number> {
  const result = await dataSource.getRepository(Review).count();
  return result;
}

recalculateProductRatings().catch((error) => {
  console.error('❌ Critical error:');
  console.error(error);
  process.exit(1);
});
