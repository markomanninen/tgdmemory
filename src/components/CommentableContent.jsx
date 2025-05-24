import { useEffect, useState } from 'react';
import useTextSelection from '../hooks/useTextSelection';
import CommentSidebar from './CommentSidebar';

const CommentableContent = ({ children, pageUrl }) => {
  const [showCommentSidebar, setShowCommentSidebar] = useState(false);
  const [currentPageUrl, setCurrentPageUrl] = useState(pageUrl || window.location.pathname);
  const [popupPosition, setPopupPosition] = useState(null);
  const { selectedText, selectionDetails, clearSelection, hasSelection } = useTextSelection();

  // Helper function to calculate optimal popup position (called once when selection is made)
  const calculatePopupPosition = (selectionDetails) => {
    if (!selectionDetails) return null;
    
    const popupHeight = 120; // Approximate height of the popup
    const popupWidth = 320;
    const padding = 16;
    
    const rect = selectionDetails.boundingRect;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Determine if popup should be above or below selection
    const spaceBelow = viewportHeight - (rect.top + rect.height);
    const spaceAbove = rect.top;
    const showAbove = spaceBelow < popupHeight + padding && spaceAbove > popupHeight + padding;
    
    // Calculate position relative to viewport (fixed positioning)
    const top = showAbove 
      ? Math.max(padding, rect.top - popupHeight - 8)
      : Math.max(padding, rect.top + rect.height + 8);
    
    const left = Math.max(padding, Math.min(
      rect.left,
      viewportWidth - popupWidth - padding
    ));
    
    return {
      top: `${top}px`,
      left: `${left}px`,
      showAbove
    };
  };

  // Calculate and store popup position when selection changes
  useEffect(() => {
    if (hasSelection && selectionDetails && !showCommentSidebar) {
      const position = calculatePopupPosition(selectionDetails);
      setPopupPosition(position);
    } else {
      setPopupPosition(null);
    }
  }, [hasSelection, selectionDetails, showCommentSidebar]);

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
      {/* Selection indicator - only show when comment sidebar is NOT open */}
      {hasSelection && !showCommentSidebar && popupPosition && (
        <div 
          className="fixed z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-xs"
          style={{
            top: popupPosition.top,
            left: popupPosition.left
          }}
        >
          {/* Arrow pointing to the selected text */}
          <div 
            className={`absolute w-0 h-0 border-l-4 border-r-4 border-transparent ${
              popupPosition.showAbove 
                ? 'border-t-4 border-t-blue-500' 
                : 'border-b-4 border-b-blue-500'
            }`}
            style={{
              top: popupPosition.showAbove ? 'auto' : '-4px',
              bottom: popupPosition.showAbove ? '-4px' : 'auto',
              left: '16px'
            }}
          ></div>
          
          <div className="text-sm mb-2">
            Text selected: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setShowCommentSidebar(true);
                // Popup will automatically disappear since hasSelection && !showCommentSidebar will be false
              }}
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

      {/* Toggle button - always visible at right edge */}
      <button
        onClick={toggleCommentSidebar}
        className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-l-lg shadow-lg z-50 transition-transform duration-500 ease-in-out"
        title="Toggle Comments"
        style={{
          transform: `translateY(-50%) translateX(${showCommentSidebar ? '-320px' : '0px'})`
        }}
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
        className={`fixed top-0 right-0 w-80 bg-white border-l border-gray-300 h-screen overflow-y-auto shadow-xl transform transition-transform duration-500 ease-in-out z-40 ${
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
