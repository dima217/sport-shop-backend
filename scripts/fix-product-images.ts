import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Product } from '../src/modules/products/entities/product.entity';
import * as fs from 'fs';
import * as path from 'path';

const W = (id: string) => `https://images.unsplash.com/photo-${id}?w=500`;

const IMG = {
  tshirt: W('1521572163474-6864f9cf17ab'),
  shorts: W('1591047139829-d91aecb6caea'),
  swimShorts: W('1560272564-c83b66b1ad04'),
  swimsuit: W('1530549387789-4c101726663a'),
  hoodie: W('1556821840-3a63f95609a7'),
  leggings: W('1591088398332-8a7791972843'),
  tracksuit: W('1551028719-00167b16eac5'),
  jacket: W('1594938298603-c8148c4dae35'),
  pullover: W('1434389677669-e08b4cac3105'),
  socks: W('1586350977775-bda9604af96c'),
  thermals: W('1544966484-b7f35e219c35'),
  pants: W('1473960968642-444144002a3d'),
  sneakers: W('1542291026-7eec264c27ff'),
  dumbbells: W('1534438327276-14e5300c3a48'),
  barbell: W('1541534741688-6078c6b33465'),
  bench: W('1581009146145-b5ef050c1494'),
  treadmill: W('1571902943202-507ec2618e8f'),
  exerciseBike: W('1576678927484-cc907957088c'),
  kettlebell: W('1517838277536-f5f99be501cd'),
  elliptical: W('1518611012114-696081aa059e'),
  dipBars: W('1571019614242-c5c5dee9f50'),
  pullUpBar: W('1598971639056-fa247665a547'),
  weightPlate: W('1583454114551-5fe2b5a4cc3e'),
  football: W('1575361204480-aadea25e6e68'),
  basketball: W('1546519638-68e109498ffc'),
  volleyball: W('1619642917158-56a6f73be5f8'),
  tennisBall: W('1622167520715-e65d3ab29226'),
  rugby: W('1589737358914-d6bf10b05fd7'),
  handball: W('1560272564-c83b66b1ad04'),
  waterPolo: W('1530549387789-4c101726663a'),
  exerciseBall: W('1598289431512-83f4a9f8f8a8'),
  shuttlecock: W('1626224583804-3b66efa24ef0'),
  sportBag: W('1553062407-98eeb64c6a62'),
  backpack: W('1622267864933-3b9b1a1d4dc7'),
  waterBottle: W('1602143407151-7111542de6e8'),
  gloves: W('1598971459374-6e4fa54dd2ef'),
  yogaMat: W('1601925260368-ae2f83eb10b5'),
  yoga: W('1506126613408-eca07ce68773'),
  weightBelt: W('1517836357463-d25dfeac343d'),
  wristband: W('1553062407-98eeb64c6a62'),
  sunglasses: W('1511499767150-a67a394687b8'),
  swimGoggles: W('1571902943202-507ec2618e8f'),
  swimCap: W('1588850561407-ed78c282e89b'),
  cap: W('1588850561407-ed78c282e89b'),
  fins: W('1559827260-dc66d56bef19'),
  kickboard: W('1530549387789-4c101726663a'),
  racket: W('1617083937165-25eb8f86d248'),
  jumpRope: W('1476480862122-209a341adc2'),
  ankleWeights: W('1571019614242-c5c5dee9f50'),
  towel: W('1583847261028-c7d9f9a2a2f2'),
  lock: W('1558002032-5437091e8796'),
  supplement: W('1598300042247-d088f8ab3a91'),
  proteinBar: W('1550595638-b99d601b8b5b'),
  energyGel: W('1550595638-b99d601b8b5b'),
  drink: W('1622547740455-91a83b204113'),
  vitamins: W('1559757148-5c350d0d6216'),
  wrap: W('1571019614242-c5c5dee9f50'),
  kneeWrap: W('1571019614242-c5c5dee9f50'),
  chalk: W('1517836357463-d25dfeac343d'),
  timer: W('1518611012114-696081aa059e'),
  yogaBlock: W('1544367567-0f2fcb009e0b'),
  yogaStrap: W('1544367567-0f2fcb009e0b'),
  resistanceBand: W('1598289431512-83f4a9f8f8a8'),
  pilatesRing: W('1518611012114-696081aa059e'),
  foamRoller: W('1518611012114-696081aa059e'),
  medicineBall: W('1571019613454-1cb2f99b2d8b'),
};

type Rule = { test: (name: string, slug: string) => boolean; images: string[] };

const RULES: Rule[] = [
  { test: (n) => /кроссовки|кеды/i.test(n), images: [IMG.sneakers] },
  { test: (n) => /футболка|майка/i.test(n), images: [IMG.tshirt] },
  { test: (n) => /шорты.*плаван/i.test(n), images: [IMG.swimShorts] },
  { test: (n) => /шорты/i.test(n), images: [IMG.shorts] },
  { test: (n) => /купальник/i.test(n), images: [IMG.swimsuit] },
  { test: (n) => /толстовка/i.test(n), images: [IMG.hoodie] },
  { test: (n) => /легинсы/i.test(n), images: [IMG.leggings] },
  { test: (n) => /костюм/i.test(n), images: [IMG.tracksuit] },
  { test: (n) => /ветровка|куртка/i.test(n), images: [IMG.jacket] },
  { test: (n) => /пуловер/i.test(n), images: [IMG.pullover] },
  { test: (n) => /носки/i.test(n), images: [IMG.socks] },
  { test: (n) => /термобель/i.test(n), images: [IMG.thermals] },
  { test: (n) => /штаны/i.test(n), images: [IMG.pants] },
  { test: (n) => /гантел/i.test(n), images: [IMG.dumbbells] },
  { test: (n) => /штанга|гриф/i.test(n), images: [IMG.barbell] },
  { test: (n) => /скамья/i.test(n), images: [IMG.bench] },
  { test: (n) => /дорожк/i.test(n), images: [IMG.treadmill] },
  { test: (n) => /велотренаж/i.test(n), images: [IMG.exerciseBike] },
  { test: (n) => /эллипт/i.test(n), images: [IMG.elliptical] },
  { test: (n) => /гиря/i.test(n), images: [IMG.kettlebell] },
  { test: (n) => /блин/i.test(n), images: [IMG.weightPlate] },
  { test: (n) => /турник/i.test(n), images: [IMG.pullUpBar] },
  { test: (n) => /брусь/i.test(n), images: [IMG.dipBars] },
  { test: (n) => /волан/i.test(n), images: [IMG.shuttlecock] },
  { test: (n) => /теннисн.*мяч/i.test(n), images: [IMG.tennisBall] },
  { test: (n) => /баскетбольн/i.test(n), images: [IMG.basketball] },
  { test: (n) => /волейбольн/i.test(n), images: [IMG.volleyball] },
  { test: (n) => /регби/i.test(n), images: [IMG.rugby] },
  { test: (n) => /гандбол/i.test(n), images: [IMG.handball] },
  { test: (n) => /водн.*пол/i.test(n), images: [IMG.waterPolo] },
  { test: (n) => /футбольн/i.test(n), images: [IMG.football] },
  { test: (n) => /мяч.*пилатес|мяч.*фитбол|гимнастическ/i.test(n), images: [IMG.exerciseBall] },
  { test: (n) => /медицинск/i.test(n), images: [IMG.medicineBall] },
  { test: (n, s) => s === 'myachi' || /мяч/i.test(n), images: [IMG.football] },
  { test: (n) => /рюкзак/i.test(n), images: [IMG.backpack] },
  { test: (n) => /сумк/i.test(n), images: [IMG.sportBag] },
  { test: (n) => /бутылк/i.test(n), images: [IMG.waterBottle] },
  { test: (n) => /перчатк/i.test(n), images: [IMG.gloves] },
  { test: (n) => /коврик.*йог/i.test(n), images: [IMG.yogaMat] },
  { test: (n) => /ремн.*атлет|ремн.*тяжел/i.test(n), images: [IMG.weightBelt] },
  { test: (n) => /напульсник/i.test(n), images: [IMG.wristband] },
  { test: (n) => /очки.*плаван/i.test(n), images: [IMG.swimGoggles] },
  { test: (n) => /очки/i.test(n), images: [IMG.sunglasses] },
  { test: (n) => /шапочк.*плаван/i.test(n), images: [IMG.swimCap] },
  { test: (n) => /шапк/i.test(n), images: [IMG.cap] },
  { test: (n) => /ласт/i.test(n), images: [IMG.fins] },
  { test: (n) => /доск.*плаван/i.test(n), images: [IMG.kickboard] },
  { test: (n) => /ракетк/i.test(n), images: [IMG.racket] },
  { test: (n) => /скакалк/i.test(n), images: [IMG.jumpRope] },
  { test: (n) => /утяжелител.*ног/i.test(n), images: [IMG.ankleWeights] },
  { test: (n) => /утяжелител/i.test(n), images: [IMG.ankleWeights] },
  { test: (n) => /полотенц/i.test(n), images: [IMG.towel] },
  { test: (n) => /замок/i.test(n), images: [IMG.lock] },
  { test: (n) => /батончик/i.test(n), images: [IMG.proteinBar] },
  { test: (n) => /гель/i.test(n), images: [IMG.energyGel] },
  { test: (n) => /изотоник|напиток/i.test(n), images: [IMG.drink] },
  { test: (n) => /витамин|омега|мультивит|zma/i.test(n), images: [IMG.vitamins] },
  { test: (n) => /бинт.*колен/i.test(n), images: [IMG.kneeWrap] },
  { test: (n) => /бинт/i.test(n), images: [IMG.wrap] },
  { test: (n) => /мел/i.test(n), images: [IMG.chalk] },
  { test: (n) => /таймер/i.test(n), images: [IMG.timer] },
  { test: (n) => /блок.*йог/i.test(n), images: [IMG.yogaBlock] },
  { test: (n) => /ремн.*йог/i.test(n), images: [IMG.yogaStrap] },
  { test: (n) => /лент.*сопротивл|эластичн.*лент/i.test(n), images: [IMG.resistanceBand] },
  { test: (n) => /кольц.*пилатес/i.test(n), images: [IMG.pilatesRing] },
  { test: (n) => /ролик.*массаж|фоам/i.test(n), images: [IMG.foamRoller] },
  { test: (n) => /протеин|креатин|bcaa|гейнер|предтрен|карнитин|глютамин|изолят|казеин/i.test(n), images: [IMG.supplement] },
  { test: (_, s) => s === 'sportivnoe-pitanie', images: [IMG.supplement] },
  { test: (_, s) => s === 'yoga-i-fitnes', images: [IMG.yoga] },
  { test: (_, s) => s === 'trenazhery', images: [IMG.dumbbells] },
  { test: (_, s) => s === 'aksessuary', images: [IMG.sportBag] },
  { test: (_, s) => s === 'odezhda', images: [IMG.tracksuit] },
  { test: (_, s) => s === 'obuv', images: [IMG.sneakers] },
];

function resolveImages(name: string, categorySlug: string): string[] {
  for (const rule of RULES) {
    if (rule.test(name, categorySlug)) {
      return rule.images;
    }
  }
  return [IMG.sportBag];
}

interface ProductSeed {
  name: string;
  categorySlug: string;
  sku: string;
  images: string[];
}

async function main() {
  if (!process.env.DB_HOST || process.env.DB_HOST === 'postgres') {
    process.env.DB_HOST = 'localhost';
    if (!process.env.DB_PORT) {
      process.env.DB_PORT = '5432';
    }
  }

  const dataPath = path.join(__dirname, 'products-data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as {
    products: ProductSeed[];
  };

  let changed = 0;
  for (const product of data.products) {
    const next = resolveImages(product.name, product.categorySlug);
    const prev = product.images.join(',');
    const nextStr = next.join(',');
    if (prev !== nextStr) {
      product.images = next;
      changed++;
    }
  }

  fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
  console.log(`Updated ${changed} products in products-data.json`);

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  let dbUpdated = 0;
  for (const product of data.products) {
    const result = await dataSource
      .getRepository(Product)
      .update({ sku: product.sku }, { images: product.images });
    if (result.affected) {
      dbUpdated += result.affected;
    }
  }

  console.log(`Updated ${dbUpdated} products in database`);
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
