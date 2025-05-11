import React from "react";
import ReviewHub from "../src/components/ReviewHub";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <div className="top-bar">
        <span className="date">Fri, 9 May 2025</span>
        <span className="breaking">📢 Breaking: Book of the Month announced!</span>
      </div>

      <header className="main-header">
        <h1>BookReviewHub</h1>
        <p className="tagline">Where readers rate and review.</p>

        <nav className="nav-links">
          <a href="#">Home</a>
          <a href="#">Books</a>
          <a href="#">Authors</a>
          <a href="#">Genres</a>
          <a href="#">Top Rated</a>
        </nav>
      </header>

      <main>
        <ReviewHub bookId="123" />
      </main>
    </div>
  );
}

export default App;
