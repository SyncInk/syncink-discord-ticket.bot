import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../css/reviews.css';

export default function Reviews({ user }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/reviews')
      .then((res) => {
        setReviews(res.data);
      })
      .catch((err) => {
        console.error('Failed to load reviews:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await axios.post('/api/reviews', { rating, content });
      setReviews([res.data, ...reviews]);
      setContent('');
      setRating(5);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit your review. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTierIcon = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'owner':
        return <img src="https://cdn.discordapp.com/emojis/1513803214674464788.webp?size=48" alt="Owner" style={{ width: '16px', height: '16px' }} />;
      case 'developer':
        return <img src="https://cdn.discordapp.com/emojis/1519379532409344142.webp?size=48" alt="Developer" style={{ width: '16px', height: '16px' }} />;
      case 'admin':
        return <img src="https://cdn.discordapp.com/emojis/1518924309668823160.webp?size=48" alt="Administrator" style={{ width: '16px', height: '16px' }} />;
      case 'moderator':
        return <img src="https://cdn.discordapp.com/emojis/1518924931482779809.webp?size=48" alt="Moderator" style={{ width: '16px', height: '16px' }} />;
      case 'staff':
        return <img src="https://cdn.discordapp.com/emojis/1513328514529624185.webp?size=48" alt="Staff" style={{ width: '16px', height: '16px' }} />;
      case 'member':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
    }
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={14} fill={i < count ? 'currentColor' : 'none'} opacity={i < count ? 1 : 0.3} />
    ));
  };

  return (
    <div className="reviews-page-wrapper">
      <Link to="/" className="back-to-dashboard">
        <ChevronLeft size={20} /> Back to Dashboard
      </Link>

      <div className="reviews-header">
        <h1>SyncInk Ticket Reviews</h1>
        <p>See what the community has to say about our bot</p>
      </div>

      <div className="write-review-section">
        {user ? (
          <form onSubmit={handleSubmit}>
            <h2>Write a Review</h2>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= rating ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  <Star size={28} fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <textarea
              className="review-textarea"
              placeholder="Tell us what you think about SyncInk Ticket..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <button type="submit" className="submit-review-btn" disabled={submitting || !content.trim()}>
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        ) : (
          <div className="login-prompt">
            <p>You must be logged in to write a review.</p>
            <a href="/api/auth/login">Login with Discord</a>
          </div>
        )}
      </div>

      <div className="reviews-container">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94A3B8', gridColumn: '1 / -1' }}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94A3B8', gridColumn: '1 / -1' }}>No reviews yet. Be the first!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-card-header">
                {review.avatar ? (
                  <img
                    className="review-avatar"
                    src={`https://cdn.discordapp.com/avatars/${review.userId}/${review.avatar}.png`}
                    alt={review.username}
                  />
                ) : (
                  <div className="review-avatar-fallback">
                    {review.globalName ? review.globalName.charAt(0) : review.username.charAt(0)}
                  </div>
                )}
                <div className="review-user-info">
                  <span className="review-username">{review.globalName || review.username}</span>
                  {review.highestTier && review.highestTierGuildName && (
                    <span className={`review-tier tier-${review.highestTier.toLowerCase()}`}>
                      <span className="tier-icon">{getTierIcon(review.highestTier)}</span>
                      {review.highestTier} OF {review.highestTierGuildName}
                    </span>
                  )}
                </div>
              </div>
              <div className="review-stars">
                {renderStars(review.rating)}
              </div>
              <div className="review-content">
                {review.content}
              </div>
              <div className="review-date">
                {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
