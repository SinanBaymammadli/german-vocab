const PRESETS = [
  { label: 'A2',       levels: ['A2'] },
  { label: 'B1',       levels: ['B1'] },
  { label: 'B2',       levels: ['B2'] },
  { label: 'A2 + B1', levels: ['A2', 'B1'] },
  { label: 'B1 + B2', levels: ['B1', 'B2'] },
  { label: 'All',      levels: ['A2', 'B1', 'B2'] },
];

function sameSet(a, b) {
  return a.length === b.length && a.every(x => b.includes(x));
}

export default function Settings({ settings, setLevels }) {
  const { levels } = settings;

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Vocabulary level</h3>
        <p className="settings-hint">Choose which word lists to study.</p>
        <div className="level-picker">
          {PRESETS.map(p => (
            <button
              key={p.label}
              className={`level-btn${sameSet(levels, p.levels) ? ' active' : ''}`}
              onClick={() => setLevels(p.levels)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
