-- PostgreSQL Schema definition for Expert Listing Database

-- 1. Users Table
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  avatar VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  has_status BOOLEAN DEFAULT FALSE
);

-- 2. Posts Table
CREATE TABLE posts (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'Property' | 'General' | 'Request'
  body TEXT NOT NULL,
  location VARCHAR(100) NOT NULL,
  listing_type VARCHAR(20), -- 'For Rent' | 'For Sale' | NULL
  media JSONB DEFAULT NULL, -- Array of media attachments: [{ type, url, thumbnail, duration }]
  bookmarks_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Comments Table
CREATE TABLE comments (
  id VARCHAR(50) PRIMARY KEY,
  post_id VARCHAR(50) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Likes Table (Many-to-Many join table)
CREATE TABLE likes (
  post_id VARCHAR(50) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);
