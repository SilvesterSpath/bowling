interface PlayPageHintProps {
  visible: boolean;
  children: string;
}

/** Reserves vertical space so the score grid does not jump when the hint hides. */
export function PlayPageHint({ visible, children }: PlayPageHintProps) {
  return (
    <p
      className={`play-page__hint${visible ? '' : ' play-page__hint--hidden'}`}
      role="status"
      aria-hidden={!visible}
    >
      {children}
    </p>
  );
}
