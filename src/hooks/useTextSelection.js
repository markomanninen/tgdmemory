import { useCallback, useEffect, useState } from 'react';

const useTextSelection = () => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionDetails, setSelectionDetails] = useState(null);

  const getSelectionDetails = useCallback((selection) => {
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const container = range.commonAncestorContainer;
    
    // Get surrounding context
    let contextBefore = '';
    let contextAfter = '';
    
    try {
      // Get the text content of the parent element for context
      const parentElement = container.nodeType === Node.TEXT_NODE 
        ? container.parentElement 
        : container;
      
      if (parentElement) {
        const fullText = parentElement.textContent || '';
        const selectedTextInParent = selection.toString();
        const selectionStart = fullText.indexOf(selectedTextInParent);
        
        if (selectionStart !== -1) {
          // Get 100 characters before and after for context
          const contextStart = Math.max(0, selectionStart - 100);
          const contextEnd = Math.min(fullText.length, selectionStart + selectedTextInParent.length + 100);
          
          contextBefore = fullText.substring(contextStart, selectionStart);
          contextAfter = fullText.substring(selectionStart + selectedTextInParent.length, contextEnd);
        }
      }
    } catch (error) {
      console.warn('Error getting selection context:', error);
    }

    return {
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      containerPath: getElementPath(container),
      boundingRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      },
      contextBefore,
      contextAfter,
      timestamp: new Date().toISOString()
    };
  }, []);

  const getElementPath = (element) => {
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        let selector = current.tagName.toLowerCase();
        
        if (current.id) {
          selector += `#${current.id}`;
        } else if (current.className) {
          const classes = current.className.split(' ').filter(c => c.trim());
          if (classes.length > 0) {
            selector += `.${classes.join('.')}`;
          }
        }
        
        // Add position among siblings if no unique identifier
        if (!current.id && !current.className) {
          const siblings = Array.from(current.parentNode?.children || []);
          const index = siblings.indexOf(current);
          if (index >= 0) {
            selector += `:nth-child(${index + 1})`;
          }
        }
        
        path.unshift(selector);
      }
      current = current.parentNode;
    }
    
    return path.join(' > ');
  };

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text && text.length > 0) {
      // Don't clear selection when clicking inside the comment sidebar
      const sidebarElement = document.querySelector('.comment-sidebar');
      if (sidebarElement) {
        const clickedOnSidebar = event => sidebarElement.contains(event.target);
        if (clickedOnSidebar) return;
      }
      
      setSelectedText(text);
      setSelectionDetails(getSelectionDetails(selection));
    } else {
      // Check if the click was outside the sidebar before clearing the selection
      const isClickInSidebar = document.querySelector('.comment-sidebar:hover');
      if (!isClickInSidebar) {
        setSelectedText('');
        setSelectionDetails(null);
      }
    }
  }, [getSelectionDetails]);

  const clearSelection = useCallback(() => {
    setSelectedText('');
    setSelectionDetails(null);
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  }, []);

  useEffect(() => {
    // Function to handle document mouseup for tracking selection
    const handleMouseUp = (event) => {
      // Delay handling selection to ensure it's captured properly
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        if (text && text.length > 0) {
          setSelectedText(text);
          setSelectionDetails(getSelectionDetails(selection));
        }
      }, 10);
    };
    
    // Function to handle mousedown to detect click location
    const handleMouseDown = (event) => {
      // Check if click is on the comment form or inside the sidebar
      const sidebarElement = document.querySelector('.comment-sidebar');
      const isClickInSidebar = sidebarElement && sidebarElement.contains(event.target);
      
      // Only clear selection if click is outside sidebar
      if (!isClickInSidebar && document.getSelection().toString().length === 0) {
        setSelectedText('');
        setSelectionDetails(null);
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [getSelectionDetails, selectedText]);

  return {
    selectedText,
    selectionDetails,
    clearSelection,
    hasSelection: selectedText.length > 0
  };
};

export default useTextSelection;
