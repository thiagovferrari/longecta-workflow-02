
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-6 left-6 z-50 p-3 glass-panel rounded-full hover:scale-110 transition-all duration-300 shadow-xl group"
            title={theme === 'dark' ? 'Modo Azul' : 'Modo Escuro'}
        >
            {theme === 'dark' ? (
                <Sun size={22} className="text-blue-400 group-hover:rotate-90 transition-transform duration-300" />
            ) : (
                <Moon size={22} className="text-gray-300 group-hover:-rotate-12 transition-transform duration-300" />
            )}
        </button>
    );
};
