import React, { useEffect } from 'react';
import ReactModal from 'react-modal';

interface BootstrapModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  size?: 'sm' | 'lg' | 'xl';
  centered?: boolean;
  scrollable?: boolean;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  topOffset?: string;
  contentMaxHeight?: string;
  bodyMaxHeight?: string;
}

const BootstrapModal: React.FC<BootstrapModalProps> = ({
  show,
  onHide,
  title,
  size,
  centered = true,
  scrollable = true,
  backdrop = true,
  keyboard = true,
  children,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  topOffset,
  contentMaxHeight,
  bodyMaxHeight,
}) => {

  // ESC key (React-Modal: shouldCloseOnEsc=true vẫn cần logic onHide)
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (keyboard && event.key === 'Escape') onHide();
    };
    if (show) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [show, keyboard, onHide]);


  /** 
   * Mapping size giống Bootstrap:
   * modal-sm  →  300px
   * modal-lg  →  800px
   * modal-xl  → 1140px
   */
  const sizeMap: Record<string, string> = {
    sm: '300px',
    lg: '800px',
    xl: '1140px'
  };


  const modalWidth = size && sizeMap[size] ? sizeMap[size] : 'auto';
  const resolvedMaxHeight = scrollable ? (contentMaxHeight ?? '90vh') : 'auto';

  const shouldCenter = centered && !topOffset;
  const resolvedTop = topOffset ?? (centered ? '50%' : '10%');

  const customStyles = {
    content: {
      position: 'absolute' as 'absolute',
      top: resolvedTop,
      left: '50%',
      transform: shouldCenter ? 'translate(-50%, -50%)' : 'translate(-50%, 0)',
      padding: 0,
      border: 'none',
      borderRadius: '0.5rem',
      background: 'transparent',
      boxShadow: 'none',
      maxWidth: '95vw',
      maxHeight: resolvedMaxHeight,
      width: modalWidth,
      height: "fit-content",
      minWidth: modalWidth === 'auto' ? '320px' : modalWidth,
      overflow: scrollable ? 'hidden' : 'visible',
    },
    overlay: {
      backgroundColor: backdrop ? 'rgba(0,0,0,0.5)' : 'transparent',
      zIndex: 1050,
    }
  };

  return (
    <ReactModal
      isOpen={show}
      onRequestClose={backdrop === true ? onHide : undefined} // backdrop='static' → không đóng
      shouldCloseOnOverlayClick={backdrop === true}
      shouldCloseOnEsc={keyboard}
      style={customStyles}
      className={className}
      ariaHideApp={false}
    >
      {/* Modal content giữ nguyên bootstrap */}
      <div className="modal-content border-0" style={{ width: '100%' }}>

        {/* Header */}
        <div className={`modal-header ${headerClassName}`}>
          <h5 className="modal-title">{title}</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onHide}
            aria-label="Close"
          />
        </div>

        {/* Body */}
        <div
          className={`modal-body ${bodyClassName}`}
          style={{
            overflowY: scrollable ? 'auto' : 'visible',
            maxHeight: scrollable ? (bodyMaxHeight ?? '70vh') : 'unset'
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`modal-footer ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>
    </ReactModal >
  );
};

export default BootstrapModal;
