export default function Settings({ settings, setLevels }) {
  const { levels } = settings;

  function toggle(level) {
    if (levels.includes(level)) {
      if (levels.length === 1) return; // keep at least one selected
      setLevels(levels.filter(l => l !== level));
    } else {
      setLevels([...levels, level]);
    }
  }

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Vocabulary level</h3>
        <p className="settings-hint">Select one or more levels to study.</p>
        <div className="level-picker">
          {['A2', 'B1', 'B2'].map(level => (
            <button
              key={level}
              className={`level-btn${levels.includes(level) ? ' active' : ''}`}
              onClick={() => toggle(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
