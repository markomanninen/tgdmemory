import { useEffect, useState } from 'react';
import useTextSelection from '../hooks/useTextSelection';
import CommentSidebar from './CommentSidebar';

const CommentableContent = ({ children, pageUrl }) => {
  const [showCommentSidebar, setShowCommentSidebar] = useState(false);
  const [currentPageUrl, setCurrentPageUrl] = useState(pageUrl || window.location.pathname);
  const { selectedText, selectionDetails, clearSelection, hasSelection } = useTextSelection();

  useEffect(() => {
    if (!pageUrl) {
      setCurrentPageUrl(window.location.pathname);
    }
  }, [pageUrl]);

  const handleCommentSubmit = (comment) => {
    // Clear selection after successful comment submission
    clearSelection();
    // Optionally show a success message
    console.log('Comment submitted:', comment);
  };

  const toggleCommentSidebar = () => {
    setShowCommentSidebar(!showCommentSidebar);
  };

  return (
    <div className="relative">
      {/* Selection indicator */}
      {hasSelection && (
        <div className="fixed top-20 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="text-sm mb-2">
            Text selected: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCommentSidebar(true)}
              className="bg-white text-blue-500 px-3 py-1 rounded text-sm hover:bg-gray-100"
            >
              Comment on this
            </button>
            <button
              onClick={clearSelection}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Toggle button for comment sidebar */}
      <button
        onClick={toggleCommentSidebar}
        className={`fixed top-1/2 right-0 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-l-lg shadow-lg z-40 transition-transform duration-300 ease-in-out ${
          showCommentSidebar ? 'mr-80' : 'mr-0'
        }`}
        title="Toggle Comments"
      >
        {showCommentSidebar ? (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-6 h-6"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" 
            />
          </svg>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-6 h-6"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" 
            />
          </svg>
        )}
      </button>

      {/* Main content */}
      <div className={`transition-all duration-500 ease-in-out ${showCommentSidebar ? 'mr-80' : 'mr-0'}`}>
        {children}
      </div>

      {/* Comment sidebar */}
      <div
        className={`comment-sidebar fixed top-0 right-0 w-80 bg-white border-l border-gray-300 h-screen overflow-y-auto shadow-lg transform transition-transform duration-500 ease-in-out ${
          showCommentSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {showCommentSidebar && (
          <CommentSidebar
            pageUrl={currentPageUrl}
            selectedText={selectedText}
            selectionDetails={selectionDetails}
            onCommentSubmit={handleCommentSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default CommentableContent;
