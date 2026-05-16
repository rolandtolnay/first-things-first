/* global React, ReactDOM, FTFProvider, useFTF, Sidebar, Calendar, Rail, WindowChrome, TabPill, Icon, TweaksPanel, useTweaks, TweakSection, TweakColor, TweakToggle, TweakRadio, TweakSlider */
// FTF App — main shell

const { useEffect: useEffectApp, useState: useStateApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentHue": 78,
  "glow": true,
  "density": "comfortable",
  "themeAccent": "amber",
  "themeMode": "dark"
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  amber:  { hue: 78,  label: 'amber'  },
  rose:   { hue: 25,  label: 'rose'   },
  violet: { hue: 295, label: 'violet' },
  mint:   { hue: 160, label: 'mint'   },
  sky:    { hue: 230, label: 'sky'    },
};

function FTFApp() {
  const [t, setT] = useTweaks(TWEAK_DEFAULTS);

  useEffectApp(() => {
    const root = document.documentElement;
    const preset = ACCENT_PRESETS[t.themeAccent];
    const hue = preset ? preset.hue : t.accentHue;
    root.style.setProperty('--ds-accent-h', hue);
    document.body.classList.toggle('ds-no-glow', !t.glow);
    document.body.classList.toggle('ftf-dense', t.density === 'compact');
    document.documentElement.classList.toggle('ds-light', t.themeMode === 'light');
  }, [t]);

  return (
    <FTFProvider>
      <div className="ds-stage">
        <div className="ds-glow" />

        <div className="ftf-window-wrap">
          <div className="ds-window">
            <WindowChrome
              left={null}
              right={<a className="ftf-design-link" href="design-system.html">Design system →</a>}
            />

            <main className="ftf-app">
              <Sidebar />
              <Calendar />
              <Rail />
            </main>
          </div>
        </div>

        {/* Tweaks panel */}
        <TweaksPanel title="Tweaks">
          <TweakSection title="Theme">
            <TweakRadio
              label="Mode"
              value={t.themeMode}
              onChange={(v) => setT('themeMode', v)}
              options={[
                { value: 'dark',  label: 'Dark'  },
                { value: 'light', label: 'Light' },
              ]}
            />
          </TweakSection>
          <TweakSection title="Accent">
            <TweakRadio
              label="Hue"
              value={t.themeAccent}
              onChange={(v) => setT('themeAccent', v)}
              options={[
                { value: 'amber',  label: 'Amber'  },
                { value: 'rose',   label: 'Rose'   },
                { value: 'violet', label: 'Violet' },
                { value: 'mint',   label: 'Mint'   },
                { value: 'sky',    label: 'Sky'    },
              ]}
            />
          </TweakSection>
          <TweakSection title="Atmosphere">
            <TweakToggle
              label="Bottom glow"
              value={t.glow}
              onChange={(v) => setT('glow', v)}
            />
          </TweakSection>
          <TweakSection title="Density">
            <TweakRadio
              label="Spacing"
              value={t.density}
              onChange={(v) => setT('density', v)}
              options={[
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'compact',     label: 'Compact'     },
              ]}
            />
          </TweakSection>
        </TweaksPanel>
      </div>
    </FTFProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<FTFApp />);
