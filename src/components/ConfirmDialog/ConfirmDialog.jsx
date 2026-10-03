import { useEffect, useRef } from 'react';
import Icon from '../Icon/Icon';

// Native <dialog> gives us focus trapping, Escape to close and an inert background for free.
const ConfirmDialog = ({ open, title, children, confirmLabel, busy = false, onConfirm, onCancel }) => {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby="confirm-title"
      onCancel={(evt) => { evt.preventDefault(); if (!busy) onCancel(); }}
    >
      <span className="confirm-icon" aria-hidden="true"><Icon name="alert" size={22} /></span>
      <h2 id="confirm-title">{title}</h2>
      <div className="confirm-body">{children}</div>
      <div className="confirm-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy} autoFocus>Cancel</button>
        <button type="button" className="btn btn-danger-solid" onClick={onConfirm} disabled={busy}>
          {busy ? <><span className="spinner spinner-white" aria-hidden="true" />Working…</> : confirmLabel}
        </button>
      </div>
    </dialog>
  );
};

export default ConfirmDialog;
