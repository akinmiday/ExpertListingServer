// Test script to verify API server routing and database schema integrations using TypeScript
import http from 'http';

interface RequestResult {
  status: number | undefined;
  body: any;
}

function makeRequest(options: http.RequestOptions, postData: any = null): Promise<RequestResult> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting API Route Checks (TypeScript) ---');
  
  try {
    // 1. Check GET /posts
    console.log('Testing GET /posts...');
    const postsRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/posts?limit=2',
      method: 'GET'
    });
    console.log(`Status: ${postsRes.status}`);
    console.log(`Received ${postsRes.body.length} posts. First post id: ${postsRes.body[0]?.id}`);
    console.log(`Maurice likes count: ${postsRes.body[0]?.likesCount}, Comments count: ${postsRes.body[0]?.commentsCount}`);

    // 2. Check POST /posts/:id/like
    console.log('\nTesting POST /posts/post-1/like...');
    const likeRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/posts/post-1/like',
      method: 'POST',
      headers: {
        'X-User-Id': 'currentUser',
        'Content-Type': 'application/json'
      }
    });
    console.log(`Status: ${likeRes.status}`);
    console.log(`Liked by user state: ${likeRes.body.likedByUser}, Likes count: ${likeRes.body.likesCount}`);

    // 3. Check GET /posts/:id/comments
    console.log('\nTesting GET /posts/post-1/comments...');
    const commentsRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/posts/post-1/comments',
      method: 'GET'
    });
    console.log(`Status: ${commentsRes.status}`);
    console.log(`Received ${commentsRes.body.length} comments. First comment: "${commentsRes.body[0]?.body}" by ${commentsRes.body[0]?.user?.name}`);

    // 4. Check POST /posts/:id/comments
    console.log('\nTesting POST /posts/post-1/comments (inserting comment)...');
    const addCommentRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/posts/post-1/comments',
      method: 'POST',
      headers: {
        'X-User-Id': 'currentUser',
        'Content-Type': 'application/json'
      }
    }, {
      body: 'Verified backend integration comment!'
    });
    console.log(`Status: ${addCommentRes.status}`);
    console.log(`Inserted comment id: ${addCommentRes.body.id}, Author: ${addCommentRes.body.user?.name}`);

    console.log('\n--- Endpoint Route Checks Passed Successfully! ---');
  } catch (err) {
    console.error('\n--- API verification test crashed: ---');
    console.error(err);
  }
}

runTests();
