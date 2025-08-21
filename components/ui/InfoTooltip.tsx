'use client';
import * as React from 'react';

type Side = 'top' | 'bottom' | 'left' | 'right';
interface InfoTooltipProps {
  text: string;
  side?: Side;
  className?: string;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}

/** Tooltip: hover/focus on desktop (pointer:fine), tap/click toggle on mobile (no-hover). */
export default function InfoTooltip({ text, side = 'top', className, open: openProp, onOpenChange }: InfoTooltipProps) {
  const [isOpenUncontrolled, setIsOpenUncontrolled] = React.useState(false);
  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? !!openProp : isOpenUncontrolled;
  const setOpen = (v: boolean) => (isControlled ? onOpenChange?.(v) : setIsOpenUncontrolled(v));

  const [hasHover, setHasHover] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setHasHover(!!mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const tipRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!btnRef.current?.contains(t) && !tipRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [isOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };

  const hoverHandlers = hasHover ? {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
  } : {};

  const clickHandler = !hasHover ? {
    onClick: (e: React.MouseEvent) => { e.preventDefault(); setOpen(!isOpen); },
  } : {};

  const id = React.useId();

  return (
    <span className={`itw inline-flex items-center relative ${className || ''}`} onKeyDown={onKeyDown}>
      <button
        type="button"
        ref={btnRef}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={id}
        className="itw-btn"
        {...hoverHandlers}
        {...clickHandler}
      >
        ⓘ
      </button>
      <div
        ref={tipRef}
        id={id}
        role="tooltip"
        aria-hidden={!isOpen}
        className={`itw-tip itw-${side} ${isOpen ? 'itw-open' : ''}`}
      >
        {text}
      </div>
    </span>
  );
}


