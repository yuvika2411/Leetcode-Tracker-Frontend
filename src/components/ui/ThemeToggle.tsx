import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx'
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-lg hover:scale-105 transition-transform z-50 flex items-center justify-center"
            title="Toggle Theme"
        >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
}