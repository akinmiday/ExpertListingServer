import { Prisma } from '@prisma/client';
import { prisma } from './db';

async function main() {
  console.log('Clearing database tables...');
  
  // Cascade delete starting from users will clear all rows
  await prisma.user.deleteMany();
  
  console.log('Database cleared. Seeding default tables...');

  // 1. Seed Users
  const users = [
    { id: '1', name: 'Maurice U', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'Individual', hasStatus: false },
    { id: '2', name: 'Boyd From', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'Developer', hasStatus: true },
    { id: '3', name: 'Stranger Dan', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', role: 'Agent', hasStatus: false },
    { id: '4', name: 'Felix Okon', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', role: 'Broker', hasStatus: false },
    { id: 'currentUser', name: 'Miracle H', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'Individual', hasStatus: false },

    // Social users who liked posts
    { id: 'alex_j', name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120', role: 'Individual', hasStatus: false },
    { id: 'jordan_s', name: 'Jordan Smith', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120', role: 'Individual', hasStatus: false },
    { id: 'taylor_s', name: 'Taylor Swift', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120', role: 'Individual', hasStatus: false },
    { id: 'jamie_l', name: 'Jamie Lannister', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120', role: 'Individual', hasStatus: false }
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log(`Seeded ${users.length} users successfully.`);

  // 2. Seed Posts
  const posts: Prisma.PostUncheckedCreateInput[] = [
    {
      id: 'post-1',
      userId: '1',
      type: 'General',
      body: 'How is everyone holding up with the flooding in Lekki this week? Stay safe out there — and let me know if anyone needs a temporary place to crash 🙏',
      location: 'Lekki Phase 1, Lagos',
      bookmarksCount: 2
    },
    {
      id: 'post-2',
      userId: '2',
      type: 'Property',
      body: 'Newly serviced 3-bedroom apartment with fitted kitchen, parking for 3 cars, and 24/7 power. Inspection opens this Saturday.',
      location: 'Lekki Phase 1, Lagos',
      listingType: 'For Rent',
      media: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600' }
      ],
      bookmarksCount: 2
    },
    {
      id: 'post-3',
      userId: '3',
      type: 'General',
      body: 'Newly serviced 3-bedroom apartment with fitted kitchen, parking for 3 cars, and 24/7 power. Inspection opens this Saturday.',
      location: 'Lekki Phase 1, Lagos',
      listingType: 'For Sale',
      media: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600' }
      ],
      bookmarksCount: 2
    },
    {
      id: 'post-4',
      userId: '4',
      type: 'Property',
      body: 'New 2-bedroom apartment in Yaba or Akoka. Must have constant water and parking for one car. Moving in by end of next month. serviced apartment with fitted kitchen, parking for 3 cars, and 24/7 power. Inspection opens this Saturday.',
      location: 'Lekki Phase 1, Lagos',
      listingType: 'For Sale',
      media: [
        {
          type: 'video',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-40545-large.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
          duration: '0:20'
        }
      ],
      bookmarksCount: 0
    }
  ];

  for (const p of posts) {
    await prisma.post.create({ data: p });
  }
  console.log(`Seeded ${posts.length} posts successfully.`);

  // 3. Seed Comments
  const comments = [
    { id: 'comment-1-1', postId: 'post-1', userId: '2', body: 'Stay safe Maurice! The flooding is really terrible this year.' },
    { id: 'comment-1-2', postId: 'post-1', userId: '3', body: 'Thanks for looking out for the community.' },
    { id: 'comment-2-1', postId: 'post-2', userId: '1', body: 'What is the pricing on this? DM me.' },
    { id: 'comment-3-1', postId: 'post-3', userId: '4', body: 'Beautiful property Dan!' }
  ];

  for (const c of comments) {
    await prisma.comment.create({ data: c });
  }
  console.log(`Seeded ${comments.length} comments successfully.`);

  // 4. Seed Likes
  const likes = [
    { postId: 'post-1', userId: 'currentUser' },
    { postId: 'post-1', userId: 'alex_j' },
    { postId: 'post-1', userId: 'jordan_s' },
    { postId: 'post-2', userId: 'currentUser' },
    { postId: 'post-2', userId: 'taylor_s' },
    { postId: 'post-3', userId: 'currentUser' },
    { postId: 'post-3', userId: 'jamie_l' },
    { postId: 'post-4', userId: 'currentUser' }
  ];

  for (const l of likes) {
    await prisma.like.create({ data: l });
  }
  console.log(`Seeded ${likes.length} likes successfully.`);

  console.log('Prisma database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
