import { Prisma } from '@prisma/client';
import { prisma } from './db';

async function main() {
  console.log('Clearing database tables...');
  await prisma.user.deleteMany();
  console.log('Database cleared. Seeding...');

  // 1. Users
  const users = [
    { id: '1',           name: 'Maurice U',       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'Individual', hasStatus: false },
    { id: '2',           name: 'Boyd From',        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'Developer',  hasStatus: true  },
    { id: '3',           name: 'Stranger Dan',     avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', role: 'Agent',      hasStatus: false },
    { id: '4',           name: 'Felix Okon',       avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', role: 'Broker',     hasStatus: false },
    { id: 'currentUser', name: 'Miracle H',        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'Individual', hasStatus: false },
    { id: 'alex_j',      name: 'Alex Johnson',     avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120', role: 'Individual', hasStatus: false },
    { id: 'jordan_s',    name: 'Jordan Smith',     avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120', role: 'Individual', hasStatus: false },
    { id: 'taylor_s',    name: 'Taylor Swift',     avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120', role: 'Individual', hasStatus: false },
    { id: 'jamie_l',     name: 'Jamie Lannister',  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120', role: 'Individual', hasStatus: false }
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log(`Seeded ${users.length} users.`);

  // Base time anchor
  const now = Date.now();

  // 2. Posts — ordered chronologically so Property posts with images load first
  const posts: Prisma.PostUncheckedCreateInput[] = [
    // ── PROPERTY posts (Most recent - 2m to 5h ago) ───────────────────────────
    {
      id: 'post-1',
      userId: '2',
      type: 'Property',
      body: 'Newly serviced 3-bedroom apartment with fitted kitchen, parking for 3 cars, and 24/7 power. Inspection opens this Saturday.',
      location: 'Lekki Phase 1, Lagos',
      listingType: 'For Rent',
      media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600' }],
      bookmarksCount: 2,
      createdAt: new Date(now - 1000 * 60 * 2) // 2m ago
    },
    {
      id: 'post-2',
      userId: '4',
      type: 'Property',
      body: 'Premium 4-bedroom detached duplex with BQ, swimming pool, and perimeter fence. Price is negotiable for serious buyers.',
      location: 'Ikoyi, Lagos',
      listingType: 'For Sale',
      media: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600' }
      ],
      bookmarksCount: 5,
      createdAt: new Date(now - 1000 * 60 * 10) // 10m ago
    },
    {
      id: 'post-3',
      userId: '3',
      type: 'Property',
      body: 'Executive 2-bedroom shortlet apartment. Available for daily, weekly and monthly stays. Ideal for corporate guests.',
      location: 'Victoria Island, Lagos',
      listingType: 'For Rent',
      media: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600' }
      ],
      bookmarksCount: 3,
      createdAt: new Date(now - 1000 * 60 * 30) // 30m ago
    },
    {
      id: 'post-4',
      userId: '2',
      type: 'Property',
      body: 'Cozy 1-bedroom self-contain apartment. Tiled floor, prepaid meter, running water. 6 months rent = ₦750,000.',
      location: 'Ikeja, Lagos',
      listingType: 'For Rent',
      media: [{
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-40545-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
        duration: '0:20'
      }],
      bookmarksCount: 1,
      createdAt: new Date(now - 1000 * 60 * 60 * 2) // 2h ago
    },
    {
      id: 'post-5',
      userId: '1',
      type: 'Property',
      body: '3-bedroom terrace duplex in a gated estate. 24/7 security, gym, and rooftop lounge access included.',
      location: 'Yaba, Lagos',
      listingType: 'For Sale',
      media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600' }],
      bookmarksCount: 0,
      createdAt: new Date(now - 1000 * 60 * 60 * 5) // 5h ago
    },

    // ── GENERAL posts (Older - 6h to 10h ago) ─────────────────────────────────
    {
      id: 'post-6',
      userId: '1',
      type: 'General',
      body: 'How is everyone holding up with the flooding in Lekki this week? Stay safe out there — and let me know if anyone needs a temporary place to crash 🙏',
      location: 'Lekki Phase 1, Lagos',
      bookmarksCount: 2,
      createdAt: new Date(now - 1000 * 60 * 60 * 6) // 6h ago
    },
    {
      id: 'post-7',
      userId: '3',
      type: 'General',
      body: 'The Lagos real estate market is finally stabilising after Q1 volatility. If you are a first-time buyer, now is a great time to enter. Happy to share my agent contacts.',
      location: 'Ikoyi, Lagos',
      bookmarksCount: 4,
      createdAt: new Date(now - 1000 * 60 * 60 * 7) // 7h ago
    },
    {
      id: 'post-8',
      userId: '4',
      type: 'General',
      body: 'Quick reminder: always verify your agent on the LSREA portal before paying any commitment fees. Too many people are getting scammed right now.',
      location: 'Victoria Island, Lagos',
      bookmarksCount: 7,
      createdAt: new Date(now - 1000 * 60 * 60 * 8) // 8h ago
    },
    {
      id: 'post-9',
      userId: '2',
      type: 'General',
      body: 'Attended the PropTech Summit in Ikeja yesterday. The short-term rental market is growing at 34% YoY in Lagos. Big opportunity for investors.',
      location: 'Ikeja, Lagos',
      bookmarksCount: 3,
      createdAt: new Date(now - 1000 * 60 * 60 * 9) // 9h ago
    },
    {
      id: 'post-10',
      userId: '1',
      type: 'General',
      body: 'Yaba is quietly becoming the most sought-after tech-hub neighbourhood in Lagos. If you own land here, hold tight — the appreciation is just starting.',
      location: 'Yaba, Lagos',
      bookmarksCount: 6,
      createdAt: new Date(now - 1000 * 60 * 60 * 10) // 10h ago
    },

    // ── REQUEST posts (Oldest - 11h to 15h ago) ───────────────────────────────
    {
      id: 'post-11',
      userId: 'currentUser',
      type: 'Request',
      body: 'Looking for a 3-bedroom apartment in Lekki Phase 1. Budget: ₦3.5M/year. Must have 24/7 power, good security, and covered parking. DM me directly.',
      location: 'Lekki Phase 1, Lagos',
      bookmarksCount: 0,
      createdAt: new Date(now - 1000 * 60 * 60 * 11) // 11h ago
    },
    {
      id: 'post-12',
      userId: '1',
      type: 'Request',
      body: 'Anyone know a reliable plumber in Ikoyi? Need urgent help with burst pipes. Happy to pay same-day rates.',
      location: 'Ikoyi, Lagos',
      bookmarksCount: 1,
      createdAt: new Date(now - 1000 * 60 * 60 * 12) // 12h ago
    },
    {
      id: 'post-13',
      userId: '3',
      type: 'Request',
      body: 'Seeking shared office space in Victoria Island for a team of 6. Flexible lease (month-to-month preferred). Budget ₦500k/month all-in.',
      location: 'Victoria Island, Lagos',
      bookmarksCount: 2,
      createdAt: new Date(now - 1000 * 60 * 60 * 13) // 13h ago
    },
    {
      id: 'post-14',
      userId: '4',
      type: 'Request',
      body: 'Looking for a 1-bedroom shortlet in Ikeja for 3 weeks. Must have strong WiFi and backup power. Starting 1st August.',
      location: 'Ikeja, Lagos',
      bookmarksCount: 0,
      createdAt: new Date(now - 1000 * 60 * 60 * 14) // 14h ago
    },
    {
      id: 'post-15',
      userId: '2',
      type: 'Request',
      body: 'Need a reliable moving company to help relocate furniture from Yaba to Lekki this weekend. Please drop contacts below 🙏',
      location: 'Yaba, Lagos',
      bookmarksCount: 0,
      createdAt: new Date(now - 1000 * 60 * 60 * 15) // 15h ago
    }
  ];

  for (const p of posts) {
    await prisma.post.create({ data: p });
  }
  console.log(`Seeded ${posts.length} posts.`);

  // 3. Comments
  const comments = [
    { id: 'c-1-1', postId: 'post-1',  userId: '1',           body: 'What is the asking price? DM me.' },
    { id: 'c-1-2', postId: 'post-1',  userId: '3',           body: 'Is parking covered or open-air?' },
    { id: 'c-2-1', postId: 'post-2',  userId: 'currentUser', body: 'This is a beautiful property! Is there room to negotiate?' },
    { id: 'c-3-1', postId: 'post-3',  userId: '4',           body: 'Do you offer weekly rates? Asking for a client.' },
    { id: 'c-6-1', postId: 'post-6',  userId: '2',           body: 'Stay safe Maurice! The flooding is really bad this year.' },
    { id: 'c-6-2', postId: 'post-6',  userId: '3',           body: 'Thanks for looking out for the community.' },
    { id: 'c-7-1', postId: 'post-7',  userId: 'currentUser', body: 'Would love those agent contacts if you are sharing!' },
    { id: 'c-11-1', postId: 'post-11', userId: '2',          body: 'I have something that might match. Sending you a DM.' },
    { id: 'c-13-1', postId: 'post-13', userId: '4',          body: 'We have a space in VI that fits. Will share details.' }
  ];

  for (const c of comments) {
    await prisma.comment.create({ data: c });
  }
  console.log(`Seeded ${comments.length} comments.`);

  // 4. Likes
  const likes = [
    { postId: 'post-1',  userId: 'currentUser' },
    { postId: 'post-1',  userId: 'alex_j' },
    { postId: 'post-1',  userId: 'jordan_s' },
    { postId: 'post-2',  userId: 'currentUser' },
    { postId: 'post-2',  userId: 'taylor_s' },
    { postId: 'post-3',  userId: 'currentUser' },
    { postId: 'post-3',  userId: 'jamie_l' },
    { postId: 'post-4',  userId: 'currentUser' },
    { postId: 'post-6',  userId: 'currentUser' },
    { postId: 'post-6',  userId: 'alex_j' },
    { postId: 'post-6',  userId: 'jordan_s' },
    { postId: 'post-7',  userId: 'taylor_s' },
    { postId: 'post-8',  userId: 'currentUser' },
    { postId: 'post-11', userId: 'alex_j' },
    { postId: 'post-13', userId: 'currentUser' }
  ];

  for (const l of likes) {
    await prisma.like.create({ data: l });
  }
  console.log(`Seeded ${likes.length} likes.`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
