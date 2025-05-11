const mongoose = require('mongoose');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { Kafka } = require('kafkajs'); // ✅ Kafka ajouté

// Kafka setup
const kafka = new Kafka({
  clientId: 'review-service',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();

const PROTO_PATH = path.join(__dirname, '../../proto/review.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const reviewProto = grpc.loadPackageDefinition(packageDefinition).review;

mongoose.connect('mongodb://localhost:27017/bookhub')
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    await producer.connect(); // ✅ Connexion Kafka
    console.log('📡 Kafka producer connected');

    const getReviewModel = require('../shared/models/review');
    const Review = getReviewModel(mongoose);

    const server = new grpc.Server();

    server.addService(reviewProto.ReviewService.service, {
      AddReview: async (call, callback) => {
        console.log('📨 Received AddReview request:', call.request);

        const { book_id, user_id, username, content, rating } = call.request;

        if (
          typeof book_id !== 'string' || book_id.trim() === '' ||
          typeof user_id !== 'string' || user_id.trim() === '' ||
          typeof username !== 'string' || username.trim() === '' ||
          typeof content !== 'string' || content.trim() === '' ||
          typeof rating !== 'number' || isNaN(rating)
        ) {
          console.error('❌ Missing or invalid required fields');
          return callback(null, { 
            status: 'ERROR', 
            message: 'Missing or invalid required fields' 
          });
        }

        try {
          const review = new Review({ 
            book_id: book_id.trim(), 
            user_id: user_id.trim(), 
            username: username.trim(), 
            content: content.trim(), 
            rating 
          });
          await review.save();

          // ✅ Envoyer l'événement Kafka après insertion
          await producer.send({
            topic: 'review-events',
            messages: [
              {
                key: 'review.created',
                value: JSON.stringify({
                  book_id,
                  user_id,
                  username,
                  content,
                  rating,
                  created_at: new Date().toISOString()
                })
              }
            ]
          });

          console.log('📤 Kafka event sent: review.created');

          callback(null, { 
            status: 'OK', 
            message: 'Review added successfully' 
          });
        } catch (err) {
          console.error('❌ MongoDB Error:', err);
          callback(null, { 
            status: 'ERROR', 
            message: err.message 
          });
        }
      },

      GetReviewsByBook: async (call, callback) => {
        const { book_id } = call.request;
        console.log('📨 Received GetReviewsByBook request for book:', book_id);

        try {
          const reviews = await Review.find({ book_id })
            .sort({ created_at: -1 })
            .exec();

          const formatted = reviews.map(r => ({
            user_id: r.user_id,
            username: r.username,
            content: r.content,
            rating: r.rating,
            created_at: r.created_at.toISOString()
          }));

          callback(null, { reviews: formatted });
        } catch (err) {
          console.error('❌ MongoDB Error:', err);
          callback(err);
        }
      }
    });

    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
      if (err) {
        console.error('❌ gRPC Server Error:', err);
        return;
      }
      
      console.log(`🚀 gRPC ReviewService running on port 50051`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
  });
