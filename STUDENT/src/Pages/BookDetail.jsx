import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation} from 'react-router-dom';
import { FaArrowLeft, FaStar, FaFlag } from 'react-icons/fa';
import "../CSS/LibraryHome.css";
import '../CSS/BookDetail.css';
import '../CSS/Loading.css';
import NavHeader from '../components/NavHeader';
import Dialog from '../components/Dialog';
import { fetchResourceById, fetchPopularResources, createTransaction, createComment, fetchComments, reportComment } from '../utils/api';
import { useUser } from '../utils/userContext';
import LoadingSpinner from '../components/LoadingSpinner';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const { user } = useUser();
  const userId = user?.id;

  // New state for comments and ratings
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [reportedComments, setReportedComments] = useState(new Set());
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [reportReason, setReportReason] = useState('');

  // Fetch book data
  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const bookData = await fetchResourceById(id);
        if (!bookData) {
          throw new Error('Book not found');
        }
        
        setBook(bookData);
        
      } catch (err) {
        setError(err.message || 'Failed to load book');
        setBook(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookData();
  }, [id]);

  useEffect(()=>{
    const fetchCommentsFromDb = async () => {
      try{
        setIsLoading(true);
        const comments = await fetchComments(id);
        if(!comments){
          throw new Error('comments not found')
        }
        setComments(comments);

      } catch (e){
        setError(err.message || 'Failed to load book');
        setComments(null);
      }
      finally {
        setIsLoading(false);
      }
    };
    fetchCommentsFromDb();
  },[]);

  // Function to show error message
  const showError = (message) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  // Function to show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showError('Please login to leave a comment');
      return;
    }
    if (!newComment.trim() || rating === 0) {
      showError('Please provide both a comment and a rating');
      return;
    }

    try {
      setIsSubmittingComment(true);
      const newCommentObj = {
        userId: user.id,
        resourceId: id,
        comment: newComment,
        rating,
        date: new Date().toISOString()
      };
      
      await createComment(newCommentObj);
      showSuccess('Your comment was added successfully');
      
      // Clear the form
      setNewComment('');
      setRating(0);
      
      // Refresh comments
      const updatedComments = await fetchComments(id);
      setComments(updatedComments);
      
    } catch (err) {
      showError('Failed to submit comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    try {
      setIsBooking(true);
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (user.status === 0) {
        throw new Error('Your account is not active, please contact the library');
      }
      
      if (!book) {
        throw new Error('Book information not available');
      }

      if(book.status === 0){
        throw new Error('Book is not available');
      }
      
      const payload = {
        readerId: userId,
        bookId: book.id,
        transactiontype: "borrow"
      };
      
      await createTransaction(payload);
      showSuccess('Booking created successfully');
      setShowPopup(false);
      
      // Refresh book data
      const updatedBook = await fetchResourceById(id);
      setBook(updatedBook);
      
    } catch (err) {
      showError(err.message || 'Failed to create booking');
      setShowPopup(false);
    } finally {
      setIsBooking(false);
    }
  };

  // Extract data with fallbacks
  const title = book?.title || 'Unknown Title';
  const author = book?.author || 'Unknown Author';
  const editor = book?.editor || 'Unknown Editor';
  const description = book?.description || 'No description available.';
  const cote = book?.cote || 'N/A';
  const cover = book?.image_url || '/assets/books/yellow_cpp.png';

  // Get static cover image
  const getStaticCoverImage = () => {
    const bookId = book?.id || 1;
    const coverImages = [
      '/assets/books/yellow_cpp.png',
      '/assets/books/cpp_stevens.jpg'
    ];
    return coverImages[bookId % coverImages.length];
  };

  // Update the handleReportComment function
  const handleReportComment = async (commentId) => {
    if (!user) {
      showError('Please login to report a comment');
      return;
    }
    setSelectedCommentId(commentId);
    setShowReportDialog(true);
  };

  const handleConfirmReport = async () => {
    if (!reportReason.trim()) {
      showError('Please provide a reason for reporting');
      return;
    }

    try {
      await reportComment(user.id, selectedCommentId, reportReason);
      setReportedComments(prev => new Set([...prev, selectedCommentId]));
      showSuccess('Comment reported successfully');
      setShowReportDialog(false);
      setReportReason('');
    } catch (error) {
      showError('Failed to report comment');
    }
  };

  // Only show error state if we're not loading and there's an error
  if (!isLoading && error) {
    return (
      <div className="book-detail-page">
        <NavHeader />
        <div className="page-content">
          <div className="back-button1" onClick={() => navigate('/library')}>
            <FaArrowLeft /> Back to Library
          </div>
          <div className="error-toast">
            <p>{error}</p>
          </div>
          <div className="book-detail-container">
            {isLoading ? (
              <div className="loading-overlay">
                <LoadingSpinner size="large" />
              </div>
            ) : (
              <div className="book-detail-content">
                <div className="book-detail-left">
                  <img 
                    src={cover} 
                    alt={title} 
                    className="book-cover-large" 
                  />
                </div>
                
                <div className="book-detail-right">
                  <div className="book-breadcrumb">
                    Editor: {editor} / Cote: {cote}
                  </div>
                  
                  <h1 id="book-title-desc">{title}</h1>
                  <h3 id="book-author-desc">{author}</h3>
                </div>
              </div>
            )}
          </div>
          
          <div className="book-description-container">
            <p className="book-description">{description}</p>
            <button 
              className="book-now-button" 
              onClick={() => setShowPopup(true)}
              disabled={isLoading}
            >
              Book Now
            </button>
          </div>

          {/* Comments and Ratings Section */}
          <div className="comments-section">
            <h2 className="section-title">Reviews</h2>
            
            {/* Rating Input */}
            <div className="rating-input">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            {/* Comment Form */}
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this book..."
                rows="3"
              />
              <button 
                type="submit" 
                disabled={isSubmittingComment || !user}
                className="submit-comment-button"
              >
                {isSubmittingComment ? <LoadingSpinner size="small" /> : 'Submit Review'}
              </button>
            </form>

            {/* Comments List */}
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No reviews yet. Be the first to review!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <span className="comment-user">{comment.User.u_name}</span>
                      <div className="comment-actions">
                        <div className="comment-rating">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`star ${i < comment.rating ? 'active' : ''}`}
                            />
                          ))}
                        </div>
                        <button 
                          className={`report-button ${reportedComments.has(comment.rat_id) ? 'reported' : ''}`}
                          onClick={() => handleReportComment(comment.rat_id)}
                          disabled={reportedComments.has(comment.rat_id)}
                        >
                          <FaFlag /> {reportedComments.has(comment.rat_id) ? 'Reported' : 'Report'}
                        </button>
                      </div>
                    </div>
                    <p className="comment-text">{comment.comment}</p>
                    <span className="comment-date">
                      {new Date(comment.rat_date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success message as a toast notification
  if (successMessage) {
    return (
      <div className="book-detail-page">
        <NavHeader />
        <div className="page-content">
          <div className="back-button1" onClick={() => navigate('/library')}>
            <FaArrowLeft /> Back to Library
          </div>
          <div className="success-toast">
            <p>{successMessage}</p>
          </div>
          <div className="book-detail-container">
            {isLoading ? (
              <div className="loading-overlay">
                <LoadingSpinner size="large" />
              </div>
            ) : (
              <div className="book-detail-content">
                <div className="book-detail-left">
                  <img 
                    src={cover} 
                    alt={title} 
                    className="book-cover-large" 
                  />
                </div>
                
                <div className="book-detail-right">
                  <div className="book-breadcrumb">
                    Editor: {editor} / Cote: {cote}
                  </div>
                  
                  <h1 id="book-title-desc">{title}</h1>
                  <h3 id="book-author-desc">{author}</h3>
                </div>
              </div>
            )}
          </div>
          
          <div className="book-description-container">
            <p className="book-description">{description}</p>
            <button 
              className="book-now-button" 
              onClick={() => setShowPopup(true)}
              disabled={isLoading}
            >
              Book Now
            </button>
          </div>

          {/* Comments and Ratings Section */}
          <div className="comments-section">
            <h2 className="section-title">Reviews</h2>
            
            {/* Rating Input */}
            <div className="rating-input">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            {/* Comment Form */}
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this book..."
                rows="3"
              />
              <button 
                type="submit" 
                disabled={isSubmittingComment || !user}
                className="submit-comment-button"
              >
                {isSubmittingComment ? <LoadingSpinner size="small" /> : 'Submit Review'}
              </button>
            </form>

            {/* Comments List */}
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No reviews yet. Be the first to review!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <span className="comment-user">{comment.User.u_name}</span>
                      <div className="comment-actions">
                        <div className="comment-rating">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`star ${i < comment.rating ? 'active' : ''}`}
                            />
                          ))}
                        </div>
                        <button 
                          className={`report-button ${reportedComments.has(comment.rat_id) ? 'reported' : ''}`}
                          onClick={() => handleReportComment(comment.rat_id)}
                          disabled={reportedComments.has(comment.rat_id)}
                        >
                          <FaFlag /> {reportedComments.has(comment.rat_id) ? 'Reported' : 'Report'}
                        </button>
                      </div>
                    </div>
                    <p className="comment-text">{comment.comment}</p>
                    <span className="comment-date">
                      {new Date(comment.rat_date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="book-detail-page">
        <NavHeader />
        <div className="page-content">
          <div className="back-button1" onClick={() => navigate('/library')}>
            <FaArrowLeft /> Back to Library
          </div>

          <div className="page-title-container">
            <h1 className="page-title">{author} - {title}</h1>
          </div>

          <div className="book-detail-container">
            {isLoading ? (
              <div className="loading-overlay">
                <LoadingSpinner size="large" />
              </div>
            ) : (
              <div className="book-detail-content">
                <div className="book-detail-left">
                  <img 
                    src={cover} 
                    alt={title} 
                    className="book-cover-large" 
                  />
                </div>
                
                <div className="book-detail-right">
                  <div className="book-breadcrumb">
                    Editor: {editor} / Cote: {cote}
                  </div>
                  
                  <h1 id="book-title-desc">{title}</h1>
                  <h3 id="book-author-desc">{author}</h3>
                </div>
              </div>
            )}
          </div>
          
          <div className="book-description-container">
            <p className="book-description">{description}</p>
            <button 
              className="book-now-button" 
              onClick={() => setShowPopup(true)}
              disabled={isLoading}
            >
              Book Now
            </button>
          </div>

          {/* Comments and Ratings Section */}
          <div className="comments-section">
            <h2 className="section-title">Reviews</h2>
            
            {/* Rating Input */}
            <div className="rating-input">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            {/* Comment Form */}
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this book..."
                rows="3"
              />
              <button 
                type="submit" 
                disabled={isSubmittingComment || !user}
                className="submit-comment-button"
              >
                {isSubmittingComment ? <LoadingSpinner size="small" /> : 'Submit Review'}
              </button>
            </form>

            {/* Comments List */}
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No reviews yet. Be the first to review!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <span className="comment-user">{comment.User.u_name}</span>
                      <div className="comment-actions">
                        <div className="comment-rating">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`star ${i < comment.rating ? 'active' : ''}`}
                            />
                          ))}
                        </div>
                        <button 
                          className={`report-button ${reportedComments.has(comment.rat_id) ? 'reported' : ''}`}
                          onClick={() => handleReportComment(comment.rat_id)}
                          disabled={reportedComments.has(comment.rat_id)}
                        >
                          <FaFlag /> {reportedComments.has(comment.rat_id) ? 'Reported' : 'Report'}
                        </button>
                      </div>
                    </div>
                    <p className="comment-text">{comment.comment}</p>
                    <span className="comment-date">
                      {new Date(comment.rat_date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {showPopup && (
            <div className="popup-overlay">
              <div className="booking-popup">
                <h2>Confirm Booking</h2>
                <div className="booking-details">
                  <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
                  <p><strong>Book Title:</strong> {title}</p>
                  <p><strong>Book Code:</strong> {cote}</p>
                </div>
                <div className="popup-actions">
                  <button 
                    className="popup-button confirm-button" 
                    onClick={handleConfirmBooking}
                    disabled={isBooking}
                  >
                    {isBooking ? <LoadingSpinner size="small" color="#ffffff" /> : 'Confirm'}
                  </button>
                  <button 
                    className="popup-button cancel-button" 
                    onClick={() => setShowPopup(false)}
                    disabled={isBooking}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        isOpen={showReportDialog}
        onClose={() => {
          setShowReportDialog(false);
          setReportReason('');
        }}
        title="Report Comment"
        onConfirm={handleConfirmReport}
        confirmText="Submit Report"
      >
        <div className="report-form">
          <label htmlFor="reportReason">Reason for reporting:</label>
          <textarea
            id="reportReason"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Please explain why you are reporting this comment..."
            rows="4"
          />
        </div>
      </Dialog>
    </>
  );
};

export default BookDetail;
