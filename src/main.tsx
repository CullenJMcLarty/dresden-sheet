import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/saira-stencil-one/400.css'
import '@fontsource/barlow-condensed/400.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/800.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/600.css'
import '@fontsource/permanent-marker/400.css'
import './styles.css'
import '@fontsource/special-elite/400.css'
import '@fontsource/courier-prime/400.css'
import '@fontsource/courier-prime/700.css'
import '@fontsource/caveat/500.css'
import '@fontsource/caveat/700.css'
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/space-grotesk/wght.css'
import '@fontsource/cinzel-decorative/700.css'
import '@fontsource/cinzel/500.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import './themes/casefile.css'
import './themes/modern.css'
import '@fontsource/unifrakturmaguntia/400.css'
import '@fontsource/eb-garamond/400.css'
import '@fontsource/eb-garamond/500.css'
import '@fontsource/eb-garamond/600.css'
import '@fontsource/eb-garamond/400-italic.css'
import '@fontsource/eb-garamond/500-italic.css'
import '@fontsource/eb-garamond/600-italic.css'
import '@fontsource/im-fell-english/400.css'
import '@fontsource/im-fell-english/400-italic.css'
import '@fontsource/im-fell-english-sc/400.css'
import './themes/fey.css'
import './themes/holy.css'
import './themes/ghost.css'
import App from './App'
import { ThemeProvider } from './themes/ThemeContext'
import { THEMES, themeById } from './themes/themes'

// Apply the saved theme before first paint so it doesn't flash the default.
try {
  const t = themeById(localStorage.getItem('steel-city-casefile:theme') ?? THEMES[0].id)
  document.documentElement.dataset.theme = t.family
  if (t.variant) document.documentElement.dataset.variant = t.variant
  if (localStorage.getItem('steel-city-casefile:ambient') === 'off') document.documentElement.dataset.ambient = 'off'
} catch {
  /* storage unavailable */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
