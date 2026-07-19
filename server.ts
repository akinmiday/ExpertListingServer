import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './db';

// Extend Express Request interface to hold custom userId property
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Simulation middleware to parse the active user profile from headers
app.use((req: Request, res: Response, next: NextFunction) => {
  req.userId = (req.headers['x-user-id'] as string) || 'currentUser';
  next();
});

// Helper to format timestamps relative to current system time
function formatRelativeTime(date: Date | string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + 'y';
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + 'mo';
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + 'd';
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + 'h';
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + 'm';
  
  return 'Just Now';
}

// -------------------------------------------------------------
// ENDPOINTS
// -------------------------------------------------------------

// Server-side in-memory cache for GET /posts
const postsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 5000; // 5 seconds

// 1. GET /posts - Fetch paginated feeds with query filtering
app.get('/posts', async (req: Request, res: Response, next: NextFunction) => {
  const { tab, type, location, search, limit = 10, offset = 0 } = req.query;
  
  const cacheKey = JSON.stringify({ tab, type, location, search, limit, offset });
  const cached = postsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached.data);
  }

  try {
    
    const whereClause: any = {};
    
    // Tab category filter
    if (tab && tab !== 'All') {
      whereClause.type = tab;
    }
    
    // Listing type filter (For Rent / For Sale)
    if (type && type !== 'All') {
      whereClause.listingType = type;
    }
    
    // Location substring filter
    if (location) {
      whereClause.location = {
        contains: location as string,
        mode: 'insensitive'
      };
    }
    
    // Keyword search filter (body or user name)
    if (search) {
      whereClause.OR = [
        { body: { contains: search as string, mode: 'insensitive' } },
        { user: { name: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    // Fetch posts with associations
    const postsRaw = await prisma.post.findMany({
      where: whereClause,
      include: {
        user: true,
        comments: {
          select: { id: true }
        },
        likes: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });
    
    // Format response matching mobile app requirements
    const posts = postsRaw.map(post => {
      const likesCount = post.likes.length;
      const commentsCount = post.comments.length;
      const likedByUser = post.likes.some(l => l.userId === req.userId);
      const likedBy = post.likes.slice(0, 3).map(l => ({
        name: l.user.name,
        username: l.user.name.toLowerCase().replace(/\s+/g, '.')
      }));

      return {
        id: post.id,
        userId: post.userId,
        user: {
          id: post.user.id,
          name: post.user.name,
          avatar: post.user.avatar,
          role: post.user.role,
          hasStatus: post.user.hasStatus
        },
        type: post.type,
        body: post.body,
        location: post.location,
        listingType: post.listingType,
        media: post.media,
        bookmarksCount: post.bookmarksCount,
        likesCount,
        commentsCount,
        likedByUser,
        likedBy,
        createdAt: formatRelativeTime(post.createdAt)
      };
    });

    postsCache.set(cacheKey, { data: posts, timestamp: Date.now() });
    res.setHeader('X-Cache', 'MISS');
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// 2. POST /posts/:id/like - Toggle liking a post
app.post('/posts/:id/like', async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
  try {
    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userId = req.userId!;

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          postId_userId: {
            postId: id,
            userId
          }
        }
      });
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId: id,
          userId
        }
      });
    }

    // Fetch updated likes state
    const likes = await prisma.like.findMany({
      where: { postId: id },
      include: { user: true }
    });

    const likesCount = likes.length;
    const likedByUser = likes.some(l => l.userId === userId);
    const likedBy = likes.slice(0, 3).map((l: any) => ({
      name: l.user.name,
      username: l.user.name.toLowerCase().replace(/\s+/g, '.')
    }));

    res.json({
      likesCount,
      likedByUser,
      likedBy
    });
  } catch (err) {
    next(err);
  }
});

// 3. GET /posts/:id/comments - Retrieve comments for a post
app.get('/posts/:id/comments', async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentsRaw = await prisma.comment.findMany({
      where: { postId: id },
      include: { user: true },
      orderBy: { createdAt: 'asc' }
    });

    const comments = commentsRaw.map((c: any) => ({
      id: c.id,
      postId: c.postId,
      userId: c.userId,
      body: c.body,
      createdAt: formatRelativeTime(c.createdAt),
      user: {
        id: c.user.id,
        name: c.user.name,
        avatar: c.user.avatar,
        role: c.user.role
      }
    }));

    res.json(comments);
  } catch (err) {
    next(err);
  }
});

// 4. POST /posts/:id/comments - Add comment to a post
app.post('/posts/:id/comments', async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const body = req.body.body || req.body.text;

  if (!body || !body.trim()) {
    return res.status(400).json({ error: 'Comment body is required' });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentId = `comment-user-${Date.now()}`;
    const newComment = await prisma.comment.create({
      data: {
        id: commentId,
        postId: id,
        userId: req.userId!,
        body
      },
      include: { user: true }
    }) as any;

    res.status(201).json({
      id: newComment.id,
      postId: newComment.postId,
      userId: newComment.userId,
      body: newComment.body,
      createdAt: 'Just Now',
      user: {
        id: newComment.user.id,
        name: newComment.user.name,
        avatar: newComment.user.avatar,
        role: newComment.user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// 5. POST /posts - Create a new listing post
app.post('/posts', async (req: Request, res: Response, next: NextFunction) => {
  const { body, location, type, listingType, media } = req.body;

  if (!body || !body.trim()) {
    return res.status(400).json({ error: 'Post body description is required' });
  }
  if (!location || !location.trim()) {
    return res.status(400).json({ error: 'Post location is required' });
  }
  if (!type) {
    return res.status(400).json({ error: 'Post type category is required' });
  }

  try {
    const postId = `post-user-${Date.now()}`;

    await prisma.post.create({
      data: {
        id: postId,
        userId: req.userId!,
        type,
        body,
        location,
        listingType: listingType || null,
        media: media || null
      }
    });

    res.status(201).json({ success: true, id: postId });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// ERROR HANDLER MIDDLEWARE
// -------------------------------------------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled request error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Expert Listing Backend (TypeScript with Prisma) listening on port ${PORT}`);
});
