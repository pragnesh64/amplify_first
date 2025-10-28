import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }> = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="theme-toggle-container">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`theme-toggle-btn ${theme === value ? 'active' : ''}`}
          title={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

