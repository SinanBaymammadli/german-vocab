export default function Settings({ settings, setLevels }) {
  const { levels } = settings;

  const isB1 = levels.includes('B1') && !levels.includes('B2');
  const isB2 = !levels.includes('B1') && levels.includes('B2');
  const isBoth = levels.includes('B1') && levels.includes('B2');

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Vocabulary level</h3>
        <p className="settings-hint">Choose which word list to study.</p>
        <div className="level-picker">
          <button className={`level-btn${isB1 ? ' active' : ''}`} onClick={() => setLevels(['B1'])}>
            B1
          </button>
          <button className={`level-btn${isB2 ? ' active' : ''}`} onClick={() => setLevels(['B2'])}>
            B2
          </button>
          <button className={`level-btn${isBoth ? ' active' : ''}`} onClick={() => setLevels(['B1', 'B2'])}>
            Both
          </button>
        </div>
      </section>
    </div>
  );
}
