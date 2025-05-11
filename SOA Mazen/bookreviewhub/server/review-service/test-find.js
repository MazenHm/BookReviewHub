const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/bookhub')
  .then(async () => {
    console.log('Connected to MongoDB ✅');
    const Review = require('../shared/models/review');

    const reviews = await Review.find({});
    console.log('Reviews found:', reviews);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error ❌:', err);
  });
