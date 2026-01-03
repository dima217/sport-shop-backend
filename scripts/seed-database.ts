/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Category } from '../src/modules/categories/entities/category.entity';
import { Product } from '../src/modules/products/entities/product.entity';
import { OrderItem } from '../src/modules/orders/entities/order-item.entity';
import { CartItem } from '../src/modules/cart/entities/cart-item.entity';
import { Favorite } from '../src/modules/favorites/entities/favorite.entity';
import * as fs from 'fs';
import * as path from 'path';

async function seedDatabase() {
  // Override DB settings for local execution if not in Docker
  if (!process.env.DB_HOST || process.env.DB_HOST === 'postgres') {
    process.env.DB_HOST = 'localhost';
    // Use port from docker-compose.yml (5432) or default config (5555)
    if (!process.env.DB_PORT) {
      process.env.DB_PORT = '5432'; // Docker compose port
    }
    console.log(`📝 Using local database settings (${process.env.DB_HOST}:${process.env.DB_PORT})`);
    console.log('💡 Make sure PostgreSQL is running: docker-compose up -d postgres');
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  // Wait for database connection
  const dataSource = app.get(DataSource);

  // Wait for connection to be established
  console.log('⏳ Waiting for database connection...');
  let retries = 30;
  while (retries > 0) {
    try {
      if (dataSource.isInitialized) {
        console.log('✅ Database connected!');
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      retries--;
      if (retries % 5 === 0 && retries > 0) {
        console.log(`   Still waiting... (${30 - retries}/30)`);
      }
    } catch (error) {
      if (retries === 0) {
        console.error('❌ Failed to connect to database after 30 attempts');
        console.error('💡 Make sure PostgreSQL is running:');
        console.error('   docker-compose up -d postgres');
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      retries--;
    }
  }

  if (!dataSource.isInitialized) {
    console.error('❌ Database connection not initialized');
    console.error('💡 Make sure PostgreSQL is running:');
    console.error('   docker-compose up -d postgres');
    throw new Error('Database connection not initialized');
  }

  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data using DELETE instead of TRUNCATE to avoid FK constraints
    console.log('🗑️  Clearing existing data...');

    // Use DELETE instead of TRUNCATE to avoid foreign key constraint issues
    try {
      await dataSource.getRepository(OrderItem).delete({});
      console.log('   ✓ Cleared order_items');
    } catch {
      // Table might not exist yet, ignore
    }

    try {
      await dataSource.getRepository(CartItem).delete({});
      console.log('   ✓ Cleared cart_items');
    } catch {
      // Table might not exist yet, ignore
    }

    try {
      await dataSource.getRepository(Favorite).delete({});
      console.log('   ✓ Cleared favorites');
    } catch {
      // Table might not exist yet, ignore
    }

    // Use raw SQL with TRUNCATE CASCADE for products and categories
    try {
      await dataSource.query('TRUNCATE TABLE products CASCADE');
      console.log('   ✓ Cleared products');
    } catch {
      // Fallback to DELETE if CASCADE doesn't work
      await dataSource.getRepository(Product).delete({});
      console.log('   ✓ Cleared products (using DELETE)');
    }

    try {
      await dataSource.query('TRUNCATE TABLE categories CASCADE');
      console.log('   ✓ Cleared categories');
    } catch {
      // Fallback to DELETE if CASCADE doesn't work
      await dataSource.getRepository(Category).delete({});
      console.log('   ✓ Cleared categories (using DELETE)');
    }

    // Create Categories
    console.log('📁 Creating categories...');
    const categories = await createCategories(dataSource);

    // Create Products
    console.log('🛍️  Creating products...');
    await createProducts(dataSource, categories);

    console.log('✅ Database seeding completed successfully!');
    console.log(`   - Created ${categories.length} categories`);
    const productCount = await dataSource.getRepository(Product).count();
    console.log(`   - Created ${productCount} products`);

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await app.close();
    process.exit(1);
  }
}

async function createCategories(dataSource: DataSource): Promise<Category[]> {
  const categoryRepository = dataSource.getRepository(Category);

  // Load data from JSON file
  const dataPath = path.join(__dirname, 'products-data.json');
  const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const categories = categoryRepository.create(jsonData.categories);
  return categoryRepository.save(categories);
}

async function createProducts(dataSource: DataSource, categories: Category[]): Promise<void> {
  const productRepository = dataSource.getRepository(Product);

  // Load data from JSON file
  const dataPath = path.join(__dirname, 'products-data.json');
  const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // Create a map of category slugs to category IDs
  const categoryMap = new Map<string, string>();
  categories.forEach((cat) => {
    categoryMap.set(cat.slug, cat.id);
  });

  // Map products from JSON to database format
  const productsData = jsonData.products.map((product: any) => {
    const categoryId = categoryMap.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Category with slug "${product.categorySlug}" not found`);
    }

    return {
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || null,
      images: product.images,
      categoryId: categoryId,
      inStock: product.inStock !== undefined ? product.inStock : true,
      stockQuantity: product.stockQuantity || null,
      sizes: product.sizes || null,
      colors: product.colors || null,
      brand: product.brand || null,
      sku: product.sku,
      rating: product.rating || null,
      reviewCount: product.reviewCount || 0,
    };
  });

  const products = productRepository.create(productsData);
  await productRepository.save(products);
}

seedDatabase();
