module.exports = (mongoose) => {
  const ReviewSchema = new mongoose.Schema({
    book_id: { type: String, required: true },
    user_id: { type: String, required: true },
    username: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, required: true },
    created_at: { type: Date, default: Date.now }
  });

  return mongoose.model('Review', ReviewSchema);
};
