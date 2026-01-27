
import React, { useMemo } from 'react';
import { Demand } from '../types';
import { Zap, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarSidebarProps {
  demandsByDate: Record<string, Demand[]>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  demandsByDate,
  selectedDate,
  onSelectDate
}) => {
  // Parsing da data selecionada para gerenciar o estado do calendário
  const currentDate = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    return new Date(year, month - 1, day);
  }, [selectedDate]);

  const viewMonth = currentDate.getMonth();
  const viewYear = currentDate.getFullYear();

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentDate);
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const daysInMonthCount = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const handlePrevMonth = () => {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    onSelectDate(prev.toISOString().split('T')[0]);
  };

  const handleNextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    onSelectDate(next.toISOString().split('T')[0]);
  };

  const getDemandsForDay = (day: number) => {
    const dateStr = `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return demandsByDate[dateStr] || [];
  };

  const demandsForSelected = demandsByDate[selectedDate] || [];

  return (
    <div className="glass-panel rounded-3xl p-8 h-full flex flex-col backdrop-blur-xl">
      <div className="flex items-center justify-between mb-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-teal-500 tracking-widest uppercase mb-1">Calendário</span>
          <h3 className="text-xl font-light text-gray-400">
            <span className="font-bold text-white">{capitalizedMonth}</span> {viewYear}
          </h3>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <ChevronLeft size={16} />
          </button>
          <button onClick={handleNextMonth} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-4 text-center mb-10">
        {weekDays.map(day => (
          <div key={day} className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">{day}</div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonthCount }).map((_, i) => {
          const day = i + 1;
          const dayStr = `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const isSelected = dayStr === selectedDate;
          const hasDemands = getDemandsForDay(day).length > 0;

          return (
            <div
              key={day}
              className="relative flex items-center justify-center h-8 cursor-pointer group"
              onClick={() => onSelectDate(dayStr)}
            >
              <span className={`text-sm z-10 transition-all ${isSelected ? 'text-black font-extrabold scale-110' : 'text-gray-400 group-hover:text-white'
                }`}>
                {day}
              </span>

              {isSelected && (
                <div className="absolute inset-0 bg-[#00f5d4] rounded-lg shadow-[0_0_20px_rgba(0,245,212,0.4)] animate-in zoom-in duration-200" />
              )}

              {hasDemands && !isSelected && (
                <div className="absolute -bottom-1 w-1 h-1 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.9)]" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-8 border-t border-white/10">
        <div className="bg-black/30 border border-white/5 rounded-2xl p-6 shadow-inner relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
            <Zap size={24} className="text-yellow-500 fill-yellow-500" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-teal-500 tracking-wider uppercase">Resumo do Dia</span>
            <span className="text-[10px] font-mono text-gray-500">{selectedDate.split('-').reverse().join('/')}</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-lg">
              {demandsForSelected.length} demanda{demandsForSelected.length !== 1 ? 's' : ''}
            </h4>

            <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-2">
              {demandsForSelected.map(demand => (
                <div key={demand.id} className="flex items-center gap-2 pl-3 border-l-2 border-teal-500 bg-white/5 py-2 rounded-r animate-in slide-in-from-left-2 duration-300">
                  <span className="text-gray-300 text-xs truncate font-medium">{demand.title}</span>
                </div>
              ))}
              {demandsForSelected.length === 0 && (
                <p className="text-gray-500 text-xs italic py-2">Nenhuma demanda registrada para hoje.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
