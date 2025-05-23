import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const CommentModeration = () => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, user } = useAuth(); // For sending token in requests

  const fetchCommentsToModerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("CommentModeration: Fetching comments for moderation");
      console.log("CommentModeration: Auth token exists:", !!token);
      console.log("CommentModeration: User:", user?.username || user?.email || 'Not available');
      
      const response = await api.getAdminComments(); // Assuming this endpoint fetches all comments for moderation
      console.log("CommentModeration: Admin comments response:", response);
      
      // Handle different response structures
      if (response && response.data) {
        const commentsData = response.data.comments || response.data || [];
        console.log(`CommentModeration: Retrieved ${commentsData.length} comments`);
        setComments(commentsData);
      } else {
        console.error("CommentModeration: Unexpected response format:", response);
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("CommentModeration: Error fetching comments for moderation:", err);
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           "Failed to load comments.";
      setError(errorMessage);
      
      // Additional error details for debugging
      console.log("CommentModeration: Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
    }
    setIsLoading(false);
  }, [token, user]);

  useEffect(() => {
    fetchCommentsToModerate();
  }, [fetchCommentsToModerate]);

  const handleUpdateStatus = async (commentId, status) => {
    try {
      console.log(`CommentModeration: Updating comment ${commentId} to status: ${status}`);
      await api.updateCommentStatus(commentId, status);
      console.log("CommentModeration: Comment status updated successfully");
      
      // Refresh comments list or update locally
      setComments(prevComments => 
        prevComments.map(comment => 
          comment._id === commentId ? { ...comment, status } : comment
        )
      );
    } catch (err) {
      console.error("CommentModeration: Error updating comment status:", err);
      const errorMessage = err.response?.data?.message || "Failed to update status.";
      alert(errorMessage);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      console.log(`CommentModeration: Deleting comment ${commentId}`);
      await api.deleteAdminComment(commentId);
      console.log("CommentModeration: Comment deleted successfully");
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
    } catch (err) {
      console.error("CommentModeration: Error deleting comment:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete comment.";
      alert(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-4">
        <p className="mb-2">Loading comments...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <h3 className="font-semibold mb-1">Error loading comments</h3>
        <p>{error}</p>
        <button 
          onClick={fetchCommentsToModerate}
          className="mt-3 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {comments.length === 0 ? (
        <p>No comments awaiting moderation.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map(comment => (
            <li key={comment._id} className="p-4 border rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">Page: {comment.pageUrl}</p>
              {comment.selectedText && (
                <blockquote className="my-2 p-2 border-l-4 border-gray-300 bg-gray-100">
                  Selected: "{comment.selectedText}"
                </blockquote>
              )}
              <p className="mb-2"><strong>{comment.authorDisplayName}:</strong> {comment.commentText}</p>
              <p className="text-xs text-gray-500">Status: <span className={`font-semibold ${comment.status === 'approved' ? 'text-green-600' : comment.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{comment.status}</span></p>
              <p className="text-xs text-gray-500">Posted: {new Date(comment.createdAt).toLocaleString()}</p>
              
              <div className="mt-3 space-x-2">
                {comment.status !== 'approved' && (
                  <button 
                    onClick={() => handleUpdateStatus(comment._id, 'approved')}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                )}
                {comment.status !== 'rejected' && (
                  <button 
                    onClick={() => handleUpdateStatus(comment._id, 'rejected')}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                )}
                 {comment.status !== 'pending' && (
                  <button 
                    onClick={() => handleUpdateStatus(comment._id, 'pending')}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Set to Pending
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteComment(comment._id)} 
                  className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommentModeration;
