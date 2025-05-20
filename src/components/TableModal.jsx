// src/components/TableModal.jsx

export default function TableModal({ isOpen, onClose, title, headers, rows }) {
  if (!isOpen) {
    return null;
  }

  return (
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
}
