import React from 'react';

const Modal = ({ isOpen, onClose, title, children, footer, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${className}`} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="px-6 py-5 border-b border-warmgray-200">
            <h3 className="text-xl font-semibold text-primary-900 font-display">{title}</h3>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-warmgray-200 bg-warmgray-50 flex justify-end gap-3 rounded-b-[20px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
