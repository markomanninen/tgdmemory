// src/components/TableModal.jsx
import ReactDOM from 'react-dom'; // Import ReactDOM for creating a portal

export default function TableModal({ isOpen, onClose, title, headers, rows }) {
  if (!isOpen) {
    return null;
  }

  // JSX for the modal structure
  const modalJsx = (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="table-modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="table-modal-title" className="modal-title">{title}</h3>
          <button onClick={onClose} className="modal-close-button" aria-label="Close modal">&times;</button>
        </div>
        <div className="modal-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.map((header) => (
                      <td key={`${rowIndex}-${header}`}>{row[header]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Use a portal to render the modal at the document.body level
  // This ensures it breaks out of any parent styling that might constrain its fixed positioning
  return ReactDOM.createPortal(modalJsx, document.body);
}
