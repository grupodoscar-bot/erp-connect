export default function QuickAccessWidget({
  widgetId,
  meta = {},
  icon: ForcedIcon,
  label: forcedLabel,
  onLaunchShortcut,
  isDisabled,
}) {
  const shortcutId = meta.shortcutId;
  const displayLabel = forcedLabel || meta.shortcutLabel || "Acceso rápido";

  const handleLaunch = () => {
    if (!shortcutId || !onLaunchShortcut) return;
    onLaunchShortcut(shortcutId);
  };

  return (
    <article
      className="erp-widget-card erp-widget-card--acceso"
      aria-labelledby={`widget-${widgetId}-title`}
    >
      <button
        type="button"
        className="erp-qa-mini"
        onClick={handleLaunch}
        disabled={!shortcutId || isDisabled}
        aria-label={shortcutId ? `Abrir ${displayLabel}` : "Configura este acceso desde el panel"}
      >
        <span className="erp-qa-mini__icon" aria-hidden="true">
          {ForcedIcon ? <ForcedIcon /> : "⭐"}
        </span>
        <span id={`widget-${widgetId}-title`} className="erp-qa-mini__label">
          {displayLabel}
        </span>
      </button>
    </article>
  );
}

