import React from 'react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    className = '',
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-content ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="px-6 py-4 border-b border-neutral-200">
                        <h3 className="text-xl font-semibold text-neutral-900">{title}</h3>
                    </div>
                )}
                <div className="px-6 py-4">
                    {children}
                </div>
                {footer && (
                    <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
