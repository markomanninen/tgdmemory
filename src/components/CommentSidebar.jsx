import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const CommentSidebar = ({ pageUrl, selectedText, selectionDetails, onCommentSubmit }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [tags, setTags] = useState('');
  const [userGroup, setUserGroup] = useState('general');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSelection, setSavedSelection] = useState({ text: '', details: null });
  const { user } = useAuth();
  const formRef = useRef(null);

  // Save selection to state when it changes
  useEffect(() => {
    if (selectedText && selectedText.length > 0) {
      setSavedSelection({
        text: selectedText,
        details: selectionDetails
      });
    }
  }, [selectedText, selectionDetails]);

  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getComments(pageUrl);
      setComments(response.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (pageUrl) {
      fetchComments();
    }
  }, [pageUrl]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const commentData = {
        pageUrl,
        selectedText: savedSelection.text || selectedText,
        selectionDetails: savedSelection.details || selectionDetails,
        commentText: newComment,
        authorDisplayName: user ? user.username : (authorName || 'Anonymous'),
        userGroup,
        isPrivate,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await api.createComment(commentData);
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      setTags('');
      if (!user) setAuthorName('');
      if (onCommentSubmit) onCommentSubmit(response.data);
    } catch (err) {
      console.error('Error creating comment:', err);
      setError(err.response?.data?.message || 'Failed to submit comment');
    }
    setIsSubmitting(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      
      {/* Comment Form */}
      <form ref={formRef} onSubmit={handleSubmitComment} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3">Add Comment</h4>
        
        {savedSelection.text && (
          <div className="mb-3 p-2 bg-blue-50 border-l-4 border-blue-400 text-sm">
            <strong>Selected text:</strong> "{savedSelection.text}"
          </div>
        )}

        {!user && (
          <input
            type="text"
            placeholder="Your name (optional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full p-2 border rounded mb-2 text-sm"
          />
        )}

        <textarea
          placeholder="Write your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="w-full p-2 border rounded mb-2 text-sm"
          required
        />

        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full p-2 border rounded mb-2 text-sm"
        />

        <select
          value={userGroup}
          onChange={(e) => setUserGroup(e.target.value)}
          className="w-full p-2 border rounded mb-2 text-sm"
        >
          <option value="general">General</option>
          <option value="experts">Experts</option>
          <option value="students">Students</option>
          <option value="researchers">Researchers</option>
        </select>

        {user && (
          <label className="flex items-center mb-2 text-sm">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mr-2"
            />
            Private comment
          </label>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Comment'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <div key={comment._id} className="p-3 bg-gray-50 rounded border">
              {comment.selectedText && (
                <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-400 text-xs">
                  <strong>Regarding:</strong> "{comment.selectedText}"
                </div>
              )}
              
              <div className="text-sm mb-2">
                <strong>{comment.authorDisplayName}:</strong>
                <span className="text-gray-600 ml-2 text-xs">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              
              <p className="text-sm mb-2">{comment.commentText}</p>
              
              {comment.tags && comment.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {comment.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Group: {comment.userGroup}</span>
                {comment.isPrivate && <span className="text-red-500">Private</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSidebar;
