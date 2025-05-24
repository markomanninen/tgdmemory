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
      // Fetch approved comments for the general group
      const response = await api.getComments(pageUrl, null, 'general');
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
      
      // Only add to local state if comment is approved (authenticated users)
      // Anonymous comments won't appear until approved by admin
      if (response.data.status === 'approved') {
        setComments(prev => [response.data, ...prev]);
      }
      
      setNewComment('');
      setTags('');
      if (!user) setAuthorName('');
      if (onCommentSubmit) onCommentSubmit(response.data);
      
      // Show success message
      if (response.data.status === 'pending_approval') {
        setError('Comment submitted successfully! It will appear after admin approval.');
        // Clear the "error" message after 5 seconds
        setTimeout(() => setError(null), 5000);
      }
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
    <div className="bg-gradient-to-br from-white to-sky-50 shadow-xl rounded-xl border border-sky-200/50 h-full overflow-hidden flex flex-col backdrop-blur-sm">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-4 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
            </svg>
            <h3 className="text-lg font-semibold">Discussion Panel</h3>
          </div>
          <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Enhanced Comment Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-sky-200/50 shadow-sm">
          <h4 className="text-sm font-semibold text-sky-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            Add Your Comment
          </h4>
          
          <form ref={formRef} onSubmit={handleSubmitComment} className="space-y-3">
            {savedSelection.text && (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-sky-50 border-l-4 border-blue-400 rounded-r text-sm">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <strong className="text-blue-800">Selected text:</strong>
                    <p className="text-blue-700 italic">"{savedSelection.text}"</p>
                  </div>
                </div>
              </div>
            )}

            {!user && (
              <>
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full p-3 border border-sky-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                />
                <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <span>Anonymous comments require approval before appearing publicly.</span>
                  </div>
                </div>
              </>
            )}

            <textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full p-3 border border-sky-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all resize-none bg-white/70 backdrop-blur-sm"
              required
            />

            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-3 border border-sky-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
              />

              <select
                value={userGroup}
                onChange={(e) => setUserGroup(e.target.value)}
                className="w-full p-3 border border-sky-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
              >
                <option value="general">💬 General Discussion</option>
                <option value="experts">🎓 Expert Analysis</option>
                <option value="students">📚 Student Questions</option>
                <option value="researchers">🔬 Research Notes</option>
              </select>
            </div>

            {user && (
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded border-sky-300 text-sky-600 focus:ring-sky-500 transition-colors"
                />
                <span>🔒 Private comment (only visible to you)</span>
              </label>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:from-sky-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                  </svg>
                  <span>Submit Comment</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Enhanced Message Display (Error or Success) */}
        {error && (
          <div className={`p-4 border rounded-lg text-sm shadow-sm ${
            error.includes('successfully') 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700'
              : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-start space-x-2">
              <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                error.includes('successfully') ? 'text-green-500' : 'text-red-500'
              }`} fill="currentColor" viewBox="0 0 20 20">
                {error.includes('successfully') ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                ) : (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                )}
              </svg>
              <div>
                <h5 className="font-medium">{error.includes('successfully') ? 'Success' : 'Error'}</h5>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Comments Display */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 bg-white/50 rounded-lg border border-sky-200/50">
              <svg className="w-12 h-12 text-sky-300 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
              </svg>
              <p className="text-gray-500 text-sm">No comments yet</p>
              <p className="text-gray-400 text-xs mt-1">Be the first to start the discussion!</p>
            </div>
          ) : (
            comments.map((comment, index) => (
              <div key={comment._id} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-sky-200/50 shadow-sm hover:shadow-md transition-all duration-200 animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
                {comment.selectedText && (
                  <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-sky-50 border-l-4 border-blue-400 rounded-r text-xs">
                    <div className="flex items-start space-x-2">
                      <svg className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                      </svg>
                      <div>
                        <strong className="text-blue-800">Regarding:</strong>
                        <p className="text-blue-700 italic">"{comment.selectedText}"</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                      comment.userId ? 
                        'bg-gradient-to-br from-emerald-400 to-green-500' : // Authenticated user
                        'bg-gradient-to-br from-gray-400 to-gray-500'       // Anonymous user
                    }`}>
                      {(comment.authorDisplayName || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-800">
                        {comment.authorDisplayName || 'Anonymous'}
                        {comment.status === 'pending_approval' && (
                          <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">⏳ Pending</span>
                        )}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatDate(comment.createdAt)}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          comment.userGroup === 'general' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          comment.userGroup === 'experts' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                          comment.userGroup === 'students' ? 'bg-green-100 text-green-700 border-green-200' :
                          comment.userGroup === 'researchers' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          {comment.userGroup === 'general' && '💬 General'}
                          {comment.userGroup === 'experts' && '🎓 Expert'}
                          {comment.userGroup === 'students' && '📚 Student'}
                          {comment.userGroup === 'researchers' && '🔬 Research'}
                          {!['general', 'experts', 'students', 'researchers'].includes(comment.userGroup) && `📝 ${comment.userGroup}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  {comment.isPrivate && (
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">🔒 Private</span>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{comment.commentText}</p>
                
                {comment.tags && comment.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {comment.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-200/50">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSidebar;
