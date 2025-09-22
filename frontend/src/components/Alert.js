import React from 'react';
import './Alert.css';

const Alert = ({ 
  isOpen, 
  onClose, 
  type = 'warning', // 'warning', 'error', 'success', 'info'
  title, 
  message, 
  secondaryMessage = '', 
  confirmText = 'Tamam', 
  cancelText = 'İptal',
  showCancel = false,
  onConfirm = null 
}) => {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'error':
        return {
          icon: 'error',
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-500'
        };
      case 'success':
        return {
          icon: 'check_circle',
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-500'
        };
      case 'info':
        return {
          icon: 'info',
          bgColor: 'bg-cyan-500/20',
          textColor: 'text-cyan-500'
        };
      default: // warning
        return {
          icon: 'warning',
          bgColor: 'bg-yellow-500/20',
          textColor: 'text-yellow-500'
        };
    }
  };

  const { icon, bgColor, textColor } = getIconAndColor();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="alert-overlay">
      <div className="alert-container">
        <div className="alert-icon-container">
          <div className={`alert-icon ${bgColor} ${textColor}`}>
            <span className="material-symbols-outlined text-3xl">
              {icon}
            </span>
          </div>
        </div>
        
        <h3 className="alert-title">{title}</h3>
        
        <p className="alert-message">
          {message}
        </p>
        
        {secondaryMessage && (
          <p className="alert-secondary-message">
            {secondaryMessage}
          </p>
        )}
        
        <div className="alert-buttons">
          {showCancel ? (
            <>
              <button 
                className="alert-button alert-button-confirm"
                onClick={handleConfirm}
              >
                <span className="truncate">{confirmText}</span>
              </button>
              <button 
                className="alert-button alert-button-cancel"
                onClick={handleCancel}
              >
                <span className="truncate">{cancelText}</span>
              </button>
            </>
          ) : (
            <button 
              className="alert-button alert-button-confirm alert-button-single"
              onClick={handleConfirm}
            >
              <span className="truncate">{confirmText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;

