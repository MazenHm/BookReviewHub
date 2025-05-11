const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.json());

const PROTO_PATH = path.join(__dirname, '../../proto/review.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const reviewProto = grpc.loadPackageDefinition(packageDefinition).review;
const client = new reviewProto.ReviewService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Add Review
app.post('/reviews', (req, res) => {
  console.log('📦 Received POST /reviews:', req.body);

  const { book_id, user_id, username, content, rating } = req.body;
  const parsedRating = parseInt(rating, 10);

  // Debugging log to see raw input and parsed result
  console.log('📥 Validating fields:', {
    book_id,
    user_id,
    username,
    content,
    rating,
    type_of_rating: typeof rating,
    parsedRating,
    isRatingNaN: isNaN(parsedRating)
  });

  // Validate that all required fields are present and non-empty
  if (
    typeof book_id !== 'string' || book_id.trim() === '' ||
    typeof user_id !== 'string' || user_id.trim() === '' ||
    typeof username !== 'string' || username.trim() === '' ||
    typeof content !== 'string' || content.trim() === '' ||
    isNaN(parsedRating)
  ) {
    console.error('❌ Missing or invalid required fields');
    return res.status(400).json({
      error: 'Missing or invalid required fields: book_id, user_id, username, content, rating'
    });
  }

  // Use cleaned data only
  const reviewData = {
    book_id: book_id.trim(),
    user_id: user_id.trim(),
    username: username.trim(),
    content: content.trim(),
    rating: parsedRating
  };

  // Confirm the actual data being sent to gRPC
  console.log('✅ Cleaned reviewData to send to gRPC:', reviewData);

  // ✅ Only use the cleaned version here
  client.AddReview(reviewData, (err, response) => {
    if (err) {
      console.error('❌ gRPC Error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(response.status === 'OK' ? 200 : 400).json(response);
  });
});

// Get Reviews by Book
app.get('/reviews/:book_id', (req, res) => {
  const { book_id } = req.params;
  console.log('📦 Received GET /reviews for book:', book_id);

  client.GetReviewsByBook({ book_id }, (err, response) => {
    if (err) {
      console.error('❌ gRPC Error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(response.reviews || []);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 REST API Gateway running on http://localhost:${PORT}`);
});
