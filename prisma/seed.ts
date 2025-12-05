import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || "postgresql://crm:crm_password@localhost:5432/crm?schema=public";

const pool = new Pool({
  connectionString,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.communication.deleteMany();
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contactTag.deleteMany();
  await prisma.companyTag.deleteMany();
  await prisma.contactCompany.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.pipelineStage.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("✓ Cleaned existing data");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      email: "admin@firma.ee",
      password: hashedPassword,
      name: "Mart Tamm",
      role: "ADMIN",
    },
  });

  // Create regular users
  const user1 = await prisma.user.create({
    data: {
      email: "kati@firma.ee",
      password: hashedPassword,
      name: "Kati Kask",
      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "priit@firma.ee",
      password: hashedPassword,
      name: "Priit Pärn",
      role: "USER",
    },
  });

  console.log("✓ Created users");

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "VIP", color: "#f59e0b" } }),
    prisma.tag.create({ data: { name: "Kuum lead", color: "#ef4444" } }),
    prisma.tag.create({ data: { name: "Külm", color: "#6366f1" } }),
    prisma.tag.create({ data: { name: "Partner", color: "#10b981" } }),
    prisma.tag.create({ data: { name: "Suur klient", color: "#8b5cf6" } }),
    prisma.tag.create({ data: { name: "Potentsiaalne", color: "#3b82f6" } }),
    prisma.tag.create({ data: { name: "Tarnija", color: "#14b8a6" } }),
    prisma.tag.create({ data: { name: "Konkurent", color: "#ec4899" } }),
  ]);

  console.log("✓ Created tags");

  // Create pipeline stages
  const stages = await Promise.all([
    prisma.pipelineStage.create({ data: { name: "Lead", order: 1, color: "#94a3b8", isDefault: true } }),
    prisma.pipelineStage.create({ data: { name: "Kvalifitseeritud", order: 2, color: "#3b82f6" } }),
    prisma.pipelineStage.create({ data: { name: "Pakkumine", order: 3, color: "#8b5cf6" } }),
    prisma.pipelineStage.create({ data: { name: "Läbirääkimised", order: 4, color: "#f59e0b" } }),
    prisma.pipelineStage.create({ data: { name: "Võidetud", order: 5, color: "#10b981" } }),
    prisma.pipelineStage.create({ data: { name: "Kaotatud", order: 6, color: "#ef4444" } }),
  ]);

  console.log("✓ Created pipeline stages");

  // Create companies
  const companies = await Promise.all([
    // Tech companies
    prisma.company.create({
      data: {
        name: "Eesti Energia AS",
        regNumber: "10421629",
        address: "Lelle 22, 11318 Tallinn",
        sector: "Energy",
        size: "500+",
        website: "https://www.energia.ee",
        phone: "+372 465 2222",
        email: "info@energia.ee",
        description: "Eesti suurim energiaettevõte",
        ownerId: admin.id,
        tags: { create: [{ tagId: tags[0].id }, { tagId: tags[4].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "Bolt Technology OÜ",
        regNumber: "14532901",
        address: "Vana-Lõuna 15, 10134 Tallinn",
        sector: "Technology",
        size: "201-500",
        website: "https://bolt.eu",
        phone: "+372 600 0000",
        email: "info@bolt.eu",
        description: "Rahvusvaheline transpordiplatvorm",
        ownerId: admin.id,
        tags: { create: [{ tagId: tags[0].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "Tallinna Sadam AS",
        regNumber: "10137319",
        address: "Sadama 25, 15051 Tallinn",
        sector: "Logistics",
        size: "201-500",
        website: "https://www.ts.ee",
        phone: "+372 631 8555",
        email: "ts@ts.ee",
        description: "Baltimaade suurim sadamaoperaator",
        ownerId: admin.id,
        tags: { create: [{ tagId: tags[3].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "Cleveron AS",
        regNumber: "11081431",
        address: "Tehnika 2, 75306 Viljandi",
        sector: "Technology",
        size: "51-200",
        website: "https://cleveron.com",
        phone: "+372 435 5050",
        email: "info@cleveron.com",
        description: "Pakiautomaatide tootja",
        ownerId: admin.id,
        tags: { create: [{ tagId: tags[5].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "Nortal AS",
        regNumber: "10443551",
        address: "Lubja 4, 19081 Tallinn",
        sector: "Technology",
        size: "500+",
        website: "https://nortal.com",
        phone: "+372 610 1010",
        email: "info@nortal.com",
        description: "IT-lahenduste ja konsultatsioonifirma",
        ownerId: admin.id,
        tags: { create: [{ tagId: tags[4].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "Pipedrive OÜ",
        regNumber: "11276036",
        address: "Mustamäe tee 3a, 10615 Tallinn",
        sector: "Technology",
        size: "500+",
        website: "https://pipedrive.com",
        phone: "+372 555 5555",
        email: "hello@pipedrive.com",
        description: "CRM tarkvara arendaja",
        ownerId: user1.id,
        tags: { create: [{ tagId: tags[1].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "LHV Pank AS",
        regNumber: "10539549",
        address: "Tartu mnt 2, 10145 Tallinn",
        sector: "Finance",
        size: "500+",
        website: "https://www.lhv.ee",
        phone: "+372 680 0400",
        email: "info@lhv.ee",
        description: "Eesti kapitalil põhinev pank",
        ownerId: admin.id,
        tags: { create: [{ tagId: tags[0].id }, { tagId: tags[4].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "Wise (Transferwise)",
        regNumber: "12022539",
        address: "Veerenni 24, 10135 Tallinn",
        sector: "Finance",
        size: "500+",
        website: "https://wise.com",
        phone: "+372 800 1234",
        email: "support@wise.com",
        description: "Rahvusvaheline fintech ettevõte",
        ownerId: admin.id,
        tags: { create: [{ tagId: tags[0].id }] },
      },
    }),
    // New companies
    prisma.company.create({
      data: {
        name: "Skeleton Technologies",
        regNumber: "12345678",
        address: "Kaare tee 3, 74010 Viimsi",
        sector: "Technology",
        size: "51-200",
        website: "https://skeletontech.com",
        phone: "+372 600 1111",
        email: "info@skeletontech.com",
        description: "Ultrakondensaatorite tootja",
        ownerId: admin.id,
        tags: { create: [{ tagId: tags[5].id }, { tagId: tags[4].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "Tallink Grupp AS",
        regNumber: "10238429",
        address: "Sadama 5/7, 10111 Tallinn",
        sector: "Transportation",
        size: "500+",
        website: "https://www.tallink.com",
        phone: "+372 640 9808",
        email: "info@tallink.ee",
        description: "Läänemere suurim laevandusettevõte",
        ownerId: admin.id,
        tags: { create: [{ tagId: tags[0].id }, { tagId: tags[4].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "Swedbank AS",
        regNumber: "10060701",
        address: "Liivalaia 8, 15040 Tallinn",
        sector: "Finance",
        size: "500+",
        website: "https://www.swedbank.ee",
        phone: "+372 631 0310",
        email: "info@swedbank.ee",
        description: "Üks Eesti suurimaid panku",
        ownerId: user1.id,
        tags: { create: [{ tagId: tags[0].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "Telia Eesti AS",
        regNumber: "10234957",
        address: "Mustamäe tee 3, 10616 Tallinn",
        sector: "Telecommunications",
        size: "500+",
        website: "https://www.telia.ee",
        phone: "+372 697 9797",
        email: "info@telia.ee",
        description: "Eesti suurim telekomiettevõte",
        ownerId: admin.id,
        tags: { create: [{ tagId: tags[4].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "Elisa Eesti AS",
        regNumber: "10178070",
        address: "Sõpruse pst 145, 13417 Tallinn",
        sector: "Telecommunications",
        size: "201-500",
        website: "https://www.elisa.ee",
        phone: "+372 660 0600",
        email: "info@elisa.ee",
        description: "Telekomiettevõte",
        ownerId: user2.id,
        tags: { create: [{ tagId: tags[5].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "Alexela AS",
        regNumber: "10015238",
        address: "Roseni 11, 10111 Tallinn",
        sector: "Energy",
        size: "201-500",
        website: "https://www.alexela.ee",
        phone: "+372 681 0810",
        email: "info@alexela.ee",
        description: "Kütuse- ja energiaettevõte",
        ownerId: admin.id,
        tags: { create: [{ tagId: tags[3].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "Circle K Eesti AS",
        regNumber: "10134339",
        address: "Pärnu mnt 158/1, 11317 Tallinn",
        sector: "Retail",
        size: "201-500",
        website: "https://www.circlek.ee",
        phone: "+372 630 3555",
        email: "info@circlek.ee",
        description: "Tanklakett",
        ownerId: user1.id,
        tags: { create: [{ tagId: tags[5].id }] },
      },
    }),
    prisma.company.create({
      data: {
        name: "Coop Pank AS",
        regNumber: "10237832",
        address: "Narva mnt 4, 15014 Tallinn",
        sector: "Finance",
        size: "201-500",
        website: "https://www.cooppank.ee",
        phone: "+372 669 0900",
        email: "info@cooppank.ee",
        description: "Eesti ühistupank",
        ownerId: admin.id,
        tags: { create: [{ tagId: tags[1].id }] },
      },
    }),
  ]);

  console.log("✓ Created companies");

  // Create contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        name: "Jüri Ratas",
        email: "juri.ratas@energia.ee",
        phone: "+372 5123 4567",
        role: "Müügidirektor",
        notes: "Eelistab hommikusi kohtumisi",
        ownerId: admin.id,
        companies: { create: [{ companyId: companies[0].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[0].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Mari Mets",
        email: "mari.mets@bolt.eu",
        phone: "+372 5234 5678",
        role: "Hankejuht",
        notes: "Väga kiire vastaja",
        ownerId: admin.id,
        companies: { create: [{ companyId: companies[1].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[1].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Andres Lepik",
        email: "andres.lepik@ts.ee",
        phone: "+372 5345 6789",
        role: "IT-juht",
        ownerId: admin.id,
        companies: { create: [{ companyId: companies[2].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[3].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Kristi Tamm",
        email: "kristi.tamm@cleveron.com",
        phone: "+372 5456 7890",
        role: "Tegevjuht",
        notes: "Otsustaja, võtmeisik",
        ownerId: admin.id,
        companies: { create: [{ companyId: companies[3].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[0].id }, { tagId: tags[5].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Peeter Kask",
        email: "peeter.kask@nortal.com",
        phone: "+372 5567 8901",
        role: "Partnerlussuhete juht",
        ownerId: admin.id,
        companies: { create: [{ companyId: companies[4].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[4].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Liisa Saar",
        email: "liisa.saar@pipedrive.com",
        phone: "+372 5678 9012",
        role: "Müügijuht",
        notes: "Huvitatud uutest lahendustest",
        ownerId: user1.id,
        companies: { create: [{ companyId: companies[5].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[1].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Toomas Ilves",
        email: "toomas.ilves@lhv.ee",
        phone: "+372 5789 0123",
        role: "Finantsdirektor",
        ownerId: admin.id,
        companies: { create: [{ companyId: companies[6].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[0].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Kaja Kallas",
        email: "kaja.kallas@wise.com",
        phone: "+372 5890 1234",
        role: "Ärianalüütik",
        notes: "Eelistab suhtlust e-postiga",
        ownerId: admin.id,
        companies: { create: [{ companyId: companies[7].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[5].id }] },
      },
    }),
    // New contacts
    prisma.contact.create({
      data: {
        name: "Taavi Rõivas",
        email: "taavi.roivas@skeleton.com",
        phone: "+372 5111 2222",
        role: "Ärijuht",
        ownerId: admin.id,
        companies: { create: [{ companyId: companies[8].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[1].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Paavo Pettai",
        email: "paavo.pettai@tallink.ee",
        phone: "+372 5222 3333",
        role: "Ostuosakonna juht",
        notes: "Otsib IT-lahendusi laevadele",
        ownerId: admin.id,
        companies: { create: [{ companyId: companies[9].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[0].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Kersti Kaljulaid",
        email: "kersti.k@swedbank.ee",
        phone: "+372 5333 4444",
        role: "Projektijuht",
        ownerId: user1.id,
        companies: { create: [{ companyId: companies[10].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[4].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Alar Karis",
        email: "alar.karis@telia.ee",
        phone: "+372 5444 5555",
        role: "Tehnikadirektor",
        notes: "Tehniline inimene, detaile armastav",
        ownerId: admin.id,
        companies: { create: [{ companyId: companies[11].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[4].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Kristina Kallas",
        email: "kristina.kallas@elisa.ee",
        phone: "+372 5555 6666",
        role: "Müügispetsialist",
        ownerId: user2.id,
        companies: { create: [{ companyId: companies[12].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[5].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Mailis Reps",
        email: "mailis.reps@alexela.ee",
        phone: "+372 5666 7777",
        role: "Äripartnerite juht",
        ownerId: admin.id,
        companies: { create: [{ companyId: companies[13].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[3].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Martin Helme",
        email: "martin.helme@circlek.ee",
        phone: "+372 5777 8888",
        role: "Operatsioonijuht",
        ownerId: user1.id,
        companies: { create: [{ companyId: companies[14].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[5].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Juhan Parts",
        email: "juhan.parts@cooppank.ee",
        phone: "+372 5888 9999",
        role: "IT-juht",
        notes: "Uus kontakt, esimene kohtumine läbi",
        ownerId: admin.id,
        companies: { create: [{ companyId: companies[15].id, isPrimary: true }] },
        tags: { create: [{ tagId: tags[1].id }] },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Siim Karu",
        email: "siim.karu@gmail.com",
        phone: "+372 5901 2345",
        role: "Konsultant",
        notes: "Vabakutseline, töötab mitme firmaga",
        ownerId: admin.id,
        companies: { create: [{ companyId: companies[0].id }, { companyId: companies[4].id }] },
        tags: { create: [{ tagId: tags[3].id }] },
      },
    }),
  ]);

  console.log("✓ Created contacts");

  // Create deals
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in2Weeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 10);
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 5);

  const deals = await Promise.all([
    // Active deals
    prisma.deal.create({
      data: {
        name: "Energia tarkvara litsents",
        value: 45000,
        currency: "EUR",
        probability: 80,
        expectedCloseDate: nextWeek,
        description: "Aastane tarkvara litsents + tugi",
        stageId: stages[3].id,
        companyId: companies[0].id,
        contactId: contacts[0].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Bolt fleet management",
        value: 120000,
        currency: "EUR",
        probability: 60,
        expectedCloseDate: nextMonth,
        description: "Autode halduse tarkvara 3-aastane leping",
        stageId: stages[2].id,
        companyId: companies[1].id,
        contactId: contacts[1].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Sadama logistikasüsteem",
        value: 85000,
        currency: "EUR",
        probability: 40,
        expectedCloseDate: nextMonth,
        description: "Kauba jälgimise süsteem",
        stageId: stages[1].id,
        companyId: companies[2].id,
        contactId: contacts[2].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Cleveron API integratsioon",
        value: 25000,
        currency: "EUR",
        probability: 90,
        expectedCloseDate: nextWeek,
        description: "API liidestus olemasoleva süsteemiga",
        stageId: stages[3].id,
        companyId: companies[3].id,
        contactId: contacts[3].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Nortal konsultatsioon",
        value: 35000,
        currency: "EUR",
        probability: 20,
        expectedCloseDate: nextMonth,
        description: "IT-strateegia konsultatsioon",
        stageId: stages[0].id,
        companyId: companies[4].id,
        contactId: contacts[4].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Pipedrive CRM migratsioon",
        value: 15000,
        currency: "EUR",
        probability: 70,
        expectedCloseDate: nextWeek,
        description: "Andmete migratsioon vanast süsteemist",
        stageId: stages[2].id,
        companyId: companies[5].id,
        contactId: contacts[5].id,
        ownerId: user1.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "LHV pangaliidestus",
        value: 55000,
        currency: "EUR",
        probability: 50,
        expectedCloseDate: nextMonth,
        description: "Makselahenduse integratsioon",
        stageId: stages[1].id,
        companyId: companies[6].id,
        contactId: contacts[6].id,
        ownerId: admin.id,
      },
    }),
    // New deals
    prisma.deal.create({
      data: {
        name: "Skeleton energia monitooring",
        value: 78000,
        currency: "EUR",
        probability: 65,
        expectedCloseDate: in2Weeks,
        description: "Reaalajas energia monitooringu süsteem",
        stageId: stages[2].id,
        companyId: companies[8].id,
        contactId: contacts[8].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Tallink laeva WiFi",
        value: 95000,
        currency: "EUR",
        probability: 45,
        expectedCloseDate: nextMonth,
        description: "WiFi infrastruktuuri uuendamine laevadel",
        stageId: stages[1].id,
        companyId: companies[9].id,
        contactId: contacts[9].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Swedbank mobiilirakendus",
        value: 180000,
        currency: "EUR",
        probability: 30,
        expectedCloseDate: nextMonth,
        description: "Uue mobiilirakenduse arendus",
        stageId: stages[0].id,
        companyId: companies[10].id,
        contactId: contacts[10].id,
        ownerId: user1.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Telia võrguanalüütika",
        value: 67000,
        currency: "EUR",
        probability: 75,
        expectedCloseDate: nextWeek,
        description: "Võrgu jõudluse analüütika platvorm",
        stageId: stages[3].id,
        companyId: companies[11].id,
        contactId: contacts[11].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Elisa klienditeenindus AI",
        value: 42000,
        currency: "EUR",
        probability: 55,
        expectedCloseDate: in2Weeks,
        description: "AI-põhine klienditeeninduse lahendus",
        stageId: stages[2].id,
        companyId: companies[12].id,
        contactId: contacts[12].id,
        ownerId: user2.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Alexela tanklate POS",
        value: 38000,
        currency: "EUR",
        probability: 85,
        expectedCloseDate: nextWeek,
        description: "Kassasüsteemide uuendamine",
        stageId: stages[3].id,
        companyId: companies[13].id,
        contactId: contacts[13].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Circle K lojaalsusprogramm",
        value: 28000,
        currency: "EUR",
        probability: 35,
        expectedCloseDate: nextMonth,
        description: "Kliendi lojaalsusprogrammi tarkvara",
        stageId: stages[1].id,
        companyId: companies[14].id,
        contactId: contacts[14].id,
        ownerId: user1.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Coop Pank turvalisus",
        value: 52000,
        currency: "EUR",
        probability: 60,
        expectedCloseDate: in2Weeks,
        description: "Küberturvalisuse lahendus",
        stageId: stages[2].id,
        companyId: companies[15].id,
        contactId: contacts[15].id,
        ownerId: admin.id,
      },
    }),
    // Won deals
    prisma.deal.create({
      data: {
        name: "Wise raporteerimissüsteem",
        value: 28000,
        currency: "EUR",
        probability: 100,
        status: "WON",
        wonDate: lastMonth,
        description: "Finantsraportite automatiseerimine",
        stageId: stages[4].id,
        companyId: companies[7].id,
        contactId: contacts[7].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Eesti Energia analüütika",
        value: 32000,
        currency: "EUR",
        probability: 100,
        status: "WON",
        wonDate: new Date(today.getFullYear(), today.getMonth(), 5),
        description: "Andmeanalüütika platvorm",
        stageId: stages[4].id,
        companyId: companies[0].id,
        contactId: contacts[0].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Nortal serverid",
        value: 45000,
        currency: "EUR",
        probability: 100,
        status: "WON",
        wonDate: twoMonthsAgo,
        description: "Serverite uuendamine",
        stageId: stages[4].id,
        companyId: companies[4].id,
        contactId: contacts[4].id,
        ownerId: admin.id,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Telia CRM litsents",
        value: 18000,
        currency: "EUR",
        probability: 100,
        status: "WON",
        wonDate: lastMonth,
        description: "CRM tarkvara aastane litsents",
        stageId: stages[4].id,
        companyId: companies[11].id,
        contactId: contacts[11].id,
        ownerId: admin.id,
      },
    }),
    // Lost deals
    prisma.deal.create({
      data: {
        name: "Bolt andmebaas",
        value: 65000,
        currency: "EUR",
        probability: 0,
        status: "LOST",
        lostReason: "Konkurent pakkus odavamalt",
        description: "Andmebaasi migratsioon",
        stageId: stages[5].id,
        companyId: companies[1].id,
        contactId: contacts[1].id,
        ownerId: admin.id,
      },
    }),
  ]);

  console.log("✓ Created deals");

  // Create tasks
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
  const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in4Days = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);
  const in5Days = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.task.create({
      data: {
        title: "Helista Jürile tagasi",
        description: "Arutada lepingu tingimusi",
        dueDate: today,
        priority: "HIGH",
        contactId: contacts[0].id,
        dealId: deals[0].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Saada pakkumine Boltile",
        description: "Lõplik hinnakiri koos allahindlusega",
        dueDate: tomorrow,
        priority: "HIGH",
        contactId: contacts[1].id,
        dealId: deals[1].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Demo ettevalmistus Cleveronile",
        description: "Valmista ette API demo keskkond",
        dueDate: dayAfter,
        priority: "MEDIUM",
        contactId: contacts[3].id,
        dealId: deals[3].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Kohtumine Tallinna Sadamaga",
        description: "Kohtumine kontori konverentsisaalis",
        dueDate: nextWeek,
        priority: "MEDIUM",
        contactId: contacts[2].id,
        dealId: deals[2].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Lepingu ülevaatus LHV-ga",
        description: "Juriidiline ülevaatus enne allkirjastamist",
        dueDate: nextWeek,
        priority: "LOW",
        contactId: contacts[6].id,
        dealId: deals[6].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Pipedrive migratsiooni testimine",
        description: "Testi andmete ülekandmist testkeskkonnas",
        dueDate: tomorrow,
        priority: "MEDIUM",
        contactId: contacts[5].id,
        dealId: deals[5].id,
        assigneeId: user1.id,
        creatorId: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Saada jälgimiskiri Wise'ile",
        description: "Täname koostöö eest ja küsi tagasisidet",
        dueDate: today,
        priority: "LOW",
        contactId: contacts[7].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
    // New tasks
    prisma.task.create({
      data: {
        title: "Helista järgmisel nädalal Marile",
        description: "Järelkontroll pärast pakkumise saatmist",
        dueDate: in3Days,
        priority: "MEDIUM",
        contactId: contacts[1].id,
        dealId: deals[1].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Skeleton demo ettevalmistus",
        description: "Ettevalmistus esmaspäevaseks demoks",
        dueDate: in4Days,
        priority: "HIGH",
        contactId: contacts[8].id,
        dealId: deals[7].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Tallink WiFi tehniline spetsifikatsioon",
        description: "Koosta detailne tehniline dokument",
        dueDate: in5Days,
        priority: "MEDIUM",
        contactId: contacts[9].id,
        dealId: deals[8].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Swedbank esitlus ette valmistada",
        description: "Slaidid ja demo keskkond",
        dueDate: nextWeek,
        priority: "HIGH",
        contactId: contacts[10].id,
        dealId: deals[9].id,
        assigneeId: user1.id,
        creatorId: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Telia leping allkirjastada",
        description: "Digiallkiri lepingule",
        dueDate: tomorrow,
        priority: "HIGH",
        contactId: contacts[11].id,
        dealId: deals[10].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Elisa AI demo",
        description: "Online demo klienditeeninduse AI lahendusest",
        dueDate: in3Days,
        priority: "MEDIUM",
        contactId: contacts[12].id,
        dealId: deals[11].id,
        assigneeId: user2.id,
        creatorId: user2.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Alexela POS paigalduse ajakava",
        description: "Kooskõlasta paigalduse ajakava",
        dueDate: dayAfter,
        priority: "MEDIUM",
        contactId: contacts[13].id,
        dealId: deals[12].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Coop Pank turvalisuse audit",
        description: "Esita auditi tulemused",
        dueDate: in4Days,
        priority: "HIGH",
        contactId: contacts[15].id,
        dealId: deals[14].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
    // Completed tasks
    prisma.task.create({
      data: {
        title: "Esimene kohtumine Nortali tiimiga",
        description: "Tutvustav kohtumine",
        dueDate: lastMonth,
        priority: "MEDIUM",
        status: "DONE",
        completedAt: lastMonth,
        contactId: contacts[4].id,
        dealId: deals[4].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Wise lepingu allkirjastamine",
        description: "Leping allkirjastatud",
        dueDate: twoMonthsAgo,
        priority: "HIGH",
        status: "DONE",
        completedAt: twoMonthsAgo,
        contactId: contacts[7].id,
        assigneeId: admin.id,
        creatorId: admin.id,
      },
    }),
  ]);

  console.log("✓ Created tasks");

  // Create notes
  await Promise.all([
    prisma.note.create({
      data: {
        content: "Jüri mainis, et neil on ka IT-osakond, kes võiks huvi tunda meie teise toote vastu. Tasub uurida.",
        contactId: contacts[0].id,
        authorId: admin.id,
      },
    }),
    prisma.note.create({
      data: {
        content: "Bolt otsib pikaajalisi partnereid. Nad plaanivad laieneda Aafrikasse ja vajavad skaleeritavat lahendust.",
        companyId: companies[1].id,
        authorId: admin.id,
      },
    }),
    prisma.note.create({
      data: {
        content: "Cleveron on väga innovatiivne ettevõte. Tegevjuht Kristi on otsustaja ja eelistab kiireid otsuseid.",
        contactId: contacts[3].id,
        dealId: deals[3].id,
        authorId: admin.id,
      },
    }),
    prisma.note.create({
      data: {
        content: "LHV eelarve kinnitatakse kvartalite kaupa. Praegu on Q1 eelarve veel kinnitamata.",
        dealId: deals[6].id,
        authorId: admin.id,
      },
    }),
    prisma.note.create({
      data: {
        content: "Pipedrive projekti juhtis varem teine inimene. Liisa võttis projekti üle kuu aega tagasi.",
        contactId: contacts[5].id,
        authorId: user1.id,
      },
    }),
    prisma.note.create({
      data: {
        content: "Skeleton on väga ambitsioonikas. Nad plaanivad IPO-t järgmise aasta jooksul.",
        companyId: companies[8].id,
        authorId: admin.id,
      },
    }),
    prisma.note.create({
      data: {
        content: "Tallink vajab lahendust, mis töötab ka offline režiimis merel.",
        contactId: contacts[9].id,
        dealId: deals[8].id,
        authorId: admin.id,
      },
    }),
    prisma.note.create({
      data: {
        content: "Telia on väga rahul praeguse koostööga. Võimalik lisaprojekt tulemas.",
        companyId: companies[11].id,
        authorId: admin.id,
      },
    }),
    prisma.note.create({
      data: {
        content: "Coop Pank on regulaatorite surve all, et turvalisust parandada. Kiire otsus tõenäoline.",
        dealId: deals[14].id,
        authorId: admin.id,
      },
    }),
    prisma.note.create({
      data: {
        content: "Alexela tanklad vajavad uut kassasüsteemi enne jaanipäeva.",
        contactId: contacts[13].id,
        authorId: admin.id,
      },
    }),
  ]);

  console.log("✓ Created notes");

  // Create communications
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.communication.create({
      data: {
        type: "CALL",
        subject: "Läbirääkimised lepingu üle",
        description: "Arutasime hinnatingimusi. Jüri palus 10% allahindlust. Lubasin vastata homme.",
        date: yesterday,
        duration: 25,
        contactId: contacts[0].id,
        dealId: deals[0].id,
        authorId: admin.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: "EMAIL",
        subject: "Pakkumise saatmine",
        description: "Saatsin Marile detailse pakkumise PDF-ina. Ootab vastust.",
        date: twoDaysAgo,
        contactId: contacts[1].id,
        dealId: deals[1].id,
        authorId: admin.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: "MEETING",
        subject: "Esimene kohtumine",
        description: "Kohtusime Tallinna Sadama kontoris. Tutvustasime lahendust IT-juhile. Positiivne tagasiside.",
        date: twoDaysAgo,
        duration: 60,
        contactId: contacts[2].id,
        dealId: deals[2].id,
        authorId: admin.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: "CALL",
        subject: "Demo kokkuleppimine",
        description: "Leppisime kokku demo aja järgmiseks nädalaks.",
        date: yesterday,
        duration: 10,
        contactId: contacts[3].id,
        dealId: deals[3].id,
        authorId: admin.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: "EMAIL",
        subject: "Hinnapäring",
        description: "Peeter saatis hinnapäringu. Vastan homme detailse hinnakirjaga.",
        date: today,
        contactId: contacts[4].id,
        dealId: deals[4].id,
        authorId: admin.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: "MEETING",
        subject: "Tehniline arutelu",
        description: "Online kohtumine migratsiooni tehniliste detailide üle. Liisa kaasas ka oma IT-tiimi.",
        date: yesterday,
        duration: 45,
        contactId: contacts[5].id,
        dealId: deals[5].id,
        authorId: user1.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: "CALL",
        subject: "Eelarve arutelu",
        description: "Toomas selgitas, et eelarve kinnitatakse Q1 alguses.",
        date: threeDaysAgo,
        duration: 15,
        contactId: contacts[6].id,
        dealId: deals[6].id,
        authorId: admin.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: "EMAIL",
        subject: "Tagasiside projekt",
        description: "Kaja saatis positiivse tagasiside lõpetatud projekti kohta.",
        date: lastMonth,
        contactId: contacts[7].id,
        authorId: admin.id,
      },
    }),
    // New communications
    prisma.communication.create({
      data: {
        type: "CALL",
        subject: "Skeleton intro kõne",
        description: "Taavi tutvustas ettevõtte vajadusi. Huvitatud energia monitooringust.",
        date: twoDaysAgo,
        duration: 20,
        contactId: contacts[8].id,
        dealId: deals[7].id,
        authorId: admin.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: "MEETING",
        subject: "Tallink tehniline kohtumine",
        description: "Kohtumine Paavoga sadamas. Vaatasime laeva infrastruktuuri.",
        date: yesterday,
        duration: 90,
        contactId: contacts[9].id,
        dealId: deals[8].id,
        authorId: admin.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: "EMAIL",
        subject: "Swedbank huvi",
        description: "Kersti väljendas huvi mobiilirakenduse arenduse vastu.",
        date: threeDaysAgo,
        contactId: contacts[10].id,
        dealId: deals[9].id,
        authorId: user1.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: "CALL",
        subject: "Telia lõppläbirääkimised",
        description: "Alar kinnitas, et leping on valmis allkirjastamiseks.",
        date: today,
        duration: 15,
        contactId: contacts[11].id,
        dealId: deals[10].id,
        authorId: admin.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: "MEETING",
        subject: "Elisa AI demo",
        description: "Online demo AI lahendusest. Kristina oli rahul, küsis lisafunktsioone.",
        date: yesterday,
        duration: 45,
        contactId: contacts[12].id,
        dealId: deals[11].id,
        authorId: user2.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: "CALL",
        subject: "Alexela kiire kõne",
        description: "Mailis kinnitas, et projekt peab valmis olema enne suve.",
        date: twoDaysAgo,
        duration: 10,
        contactId: contacts[13].id,
        dealId: deals[12].id,
        authorId: admin.id,
      },
    }),
    prisma.communication.create({
      data: {
        type: "EMAIL",
        subject: "Coop Pank pakkumine",
        description: "Saatsin Juhanile turvalisuse auditi pakkumise.",
        date: yesterday,
        contactId: contacts[15].id,
        dealId: deals[14].id,
        authorId: admin.id,
      },
    }),
  ]);

  console.log("✓ Created communications");

  console.log("");
  console.log("🎉 Database seeded successfully!");
  console.log("");
  console.log("📊 Summary:");
  console.log("   - 3 users (admin@firma.ee, kati@firma.ee, priit@firma.ee)");
  console.log("   - 8 tags");
  console.log("   - 6 pipeline stages");
  console.log("   - 16 companies");
  console.log("   - 17 contacts");
  console.log("   - 20 deals (15 active, 4 won, 1 lost)");
  console.log("   - 17 tasks");
  console.log("   - 10 notes");
  console.log("   - 15 communications");
  console.log("");
  console.log("🔐 Login credentials:");
  console.log("   Admin: admin@firma.ee / admin123");
  console.log("   User 1: kati@firma.ee / admin123");
  console.log("   User 2: priit@firma.ee / admin123");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });