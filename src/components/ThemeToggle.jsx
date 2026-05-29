import { useTheme } from '../context/ThemeContext.jsx'
import { Icon } from '../icons.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Icon.Sun /> : <Icon.Moon />}
    </button>
  )
}
