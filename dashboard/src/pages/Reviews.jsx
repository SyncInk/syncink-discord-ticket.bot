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
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

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

  const handleReplySubmit = async (reviewId) => {
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await axios.post(`/api/reviews/${reviewId}/reply`, { content: replyContent });
      setReviews(reviews.map(r => {
        if (r._id === reviewId) {
          const newReplies = [...(r.replies || []), res.data];
          return { ...r, replies: newReplies };
        }
        return r;
      }));
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to submit reply:', error);
      alert('Failed to submit your reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (reviewId, replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    try {
      await axios.delete(`/api/reviews/${reviewId}/reply/${replyId}`);
      setReviews(reviews.map(r => {
        if (r._id === reviewId) {
          return { ...r, replies: r.replies.filter(rep => rep.replyId !== replyId) };
        }
        return r;
      }));
    } catch (error) {
      console.error('Failed to delete reply:', error);
      alert('Failed to delete reply.');
    }
  };

  const handlePinReview = async (reviewId, currentState) => {
    try {
      const newState = !currentState;
      await axios.patch(`/api/reviews/${reviewId}/pin`, { pinned: newState });
      setReviews(reviews.map(r => {
        if (r._id === reviewId) {
          return { ...r, pinned: newState };
        }
        return r;
      }).sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      }));
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      alert('Failed to pin/unpin review.');
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
              placeholder="Tell us what you think about SyncInk Ticket... (minimum 60 characters)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minLength={60}
              required
            />
            <div className="char-counter" style={{ color: content.trim().length < 60 ? '#EF4444' : '#2ECC71', fontSize: '0.8rem', textAlign: 'right', marginBottom: '16px' }}>
              {content.trim().length} / 60 minimum characters
            </div>
            <button type="submit" className="submit-review-btn" disabled={submitting || content.trim().length < 60}>
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
                </div>
                {review.pinned && (
                  <div className="pinned-badge" title="Pinned Review">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                  </div>
                )}
              </div>
              <div className="review-stars">
                {renderStars(review.rating)}
              </div>
              <div className="review-content">
                {review.content}
              </div>
              <div className="review-footer">
                <div className="review-meta">
                  {review.highestTier && review.highestTierGuildName && (
                    <>
                      <span className={`review-tier tier-${review.highestTier.toLowerCase()}`}>
                        <span className="tier-icon">{getTierIcon(review.highestTier)}</span>
                        {review.highestTier}
                      </span>
                      <span className="meta-dot">•</span>
                      <span className="meta-server-name">{review.highestTierGuildName}</span>
                    </>
                  )}
                </div>
                <div className="review-date">
                  {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>

              {(review.replies || []).length > 0 && (
                <div className="review-replies-section">
                  <div className="replies-divider" />
                  {review.replies.map(reply => (
                    <div key={reply.replyId} className="review-reply-card">
                      <div className="reply-header">
                        {reply.avatar ? (
                          <img className="reply-avatar" src={`https://cdn.discordapp.com/avatars/${reply.userId}/${reply.avatar}.png`} alt={reply.username} />
                        ) : (
                          <div className="reply-avatar-fallback">{reply.globalName ? reply.globalName.charAt(0) : reply.username.charAt(0)}</div>
                        )}
                        <div className="reply-user-info">
                          <span className="reply-username">{reply.globalName || reply.username}</span>
                          <span className="reply-subtitle">Creator of SyncInk</span>
                          <span className="review-tier tier-owner" style={{marginTop: '4px'}}>
                            <span className="tier-icon">{getTierIcon('owner')}</span>
                            OWNER
                          </span>
                        </div>
                        {user?.isBotOwner && (
                          <button className="delete-reply-btn" onClick={() => handleDeleteReply(review._id, reply.replyId)}>Delete</button>
                        )}
                      </div>
                      <div className="reply-content">
                        {reply.content}
                      </div>
                      <div className="reply-date">
                        {new Date(reply.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {user?.isBotOwner && (
                <div className="owner-reply-actions">
                  {replyingTo === review._id ? (
                    <div className="reply-form">
                      <textarea
                        className="review-textarea"
                        placeholder="Write your official response..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        autoFocus
                      />
                      <div className="reply-form-buttons">
                        <button className="submit-review-btn" onClick={() => handleReplySubmit(review._id)} disabled={submittingReply || !replyContent.trim()}>
                          {submittingReply ? 'Posting...' : 'Post Reply'}
                        </button>
                        <button className="cancel-reply-btn" onClick={() => { setReplyingTo(null); setReplyContent(''); }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="owner-reply-btn" onClick={() => setReplyingTo(review._id)}>
                        Reply as Owner
                      </button>
                      <button className="owner-pin-btn" onClick={() => handlePinReview(review._id, review.pinned)}>
                        {review.pinned ? 'Unpin' : 'Pin'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
