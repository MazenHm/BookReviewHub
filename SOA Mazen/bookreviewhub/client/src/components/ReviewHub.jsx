import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { format } from "date-fns";
import "./ReviewHub.css";

const GET_REVIEWS = gql`
  query GetReviews($bookId: String!) {
    reviews(bookId: $bookId) {
      user_id
      username
      content
      rating
      created_at
    }
  }
`;

const ReviewHub = ({ bookId }) => {
  const { loading, error, data } = useQuery(GET_REVIEWS, {
    variables: { bookId },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState(0);

  if (loading) return <p className="loader">Loading reviews...</p>;
  if (error) return <p className="error">Error: {error.message}</p>;

  const filtered = data.reviews.filter((r) => {
    const matchesText =
      r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = r.rating >= minRating;
    return matchesText && matchesRating;
  });

  return (
    <div className="review-container">
      <h1 className="title">Reader Reviews</h1>
      <p className="subtitle">Browse insights from readers just like you.</p>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or content"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
        >
          <option value={0}>All Ratings</option>
          <option value={3}>3 stars & up</option>
          <option value={4}>4 stars & up</option>
          <option value={5}>5 stars only</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="no-results">No matching reviews found.</p>
      ) : (
        filtered.map((review, index) => (
          <div className="review-card" key={index}>
            <div className="review-header">
              <strong>{review.username}</strong>
              <span>{format(new Date(review.created_at), "PPP")}</span>
            </div>
            <p className="review-content">"{review.content}"</p>
            <div className="stars">
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewHub;
