import React, { useState } from 'react';
import './ReviewModal.css';

interface ReviewModalProps {
    menuItemId: string;
    menuItemName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
    menuItemId,
    menuItemName,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            const token = localStorage.getItem('auth_token');
            if (!token) {
                setError('Please login to submit a review');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    menuItemId,
                    rating,
                    comment: comment.trim() || undefined,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to submit review');
            }

            // Success
            setRating(0);
            setComment('');
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1;
            const isFilled = starValue <= (hoverRating || rating);

            return (
                <button
                    key={i}
                    type="button"
                    className={`star-btn ${isFilled ? 'filled' : ''}`}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                >
                    ⭐
                </button>
            );
        });
    };

    if (!isOpen) return null;

    return (
        <div className="review-modal-overlay" onClick={onClose}>
            <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Rate this dish</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <p className="modal-subtitle">{menuItemName}</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Your rating *</label>
                        <div className="star-rating">
                            {renderStars()}
                        </div>
                        {rating > 0 && (
                            <p className="rating-text">
                                {rating === 1 && 'Poor'}
                                {rating === 2 && 'Fair'}
                                {rating === 3 && 'Good'}
                                {rating === 4 && 'Very Good'}
                                {rating === 5 && 'Excellent'}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Your review (optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this dish..."
                            maxLength={500}
                            rows={4}
                        />
                        <span className="char-count">{comment.length}/500</span>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting || rating === 0} className="btn-submit">
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
