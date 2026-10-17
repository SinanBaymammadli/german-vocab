export default function Settings({ settings, setLevels }) {
  const { levels } = settings;

  function toggle(level) {
    const has = levels.includes(level);
    if (has && levels.length === 1) return; // keep at least one
    setLevels(has ? levels.filter(l => l !== level) : [...levels, level]);
  }

  const active = l => levels.includes(l) ? 'level-btn active' : 'level-btn';

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Vocabulary level</h3>
        <p className="settings-hint">Choose which word lists to study.</p>
        <div className="level-picker">
          <button className={active('B1')} onClick={() => toggle('B1')}>B1</button>
          <button className={active('B2')} onClick={() => toggle('B2')}>B2</button>
        </div>
        <p className="settings-note">
          {levels.includes('B1') && levels.includes('B2')
            ? 'Studying all B1 + B2 words together.'
            : levels.includes('B2')
              ? 'Studying B2 words only.'
              : 'Studying B1 words only.'}
        </p>
      </section>
    </div>
  );
}
