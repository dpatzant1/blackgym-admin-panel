import React from 'react';

interface MonthSelectorProps {
  selectedMonth: number | undefined;
  onChange: (month: number | undefined) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onChange }) => {
  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  return (
    <div className="form-group">
      <label htmlFor="monthSelector" className="small text-light mb-1">Mes</label>
      <select
        id="monthSelector"
        className="form-select"
        value={selectedMonth || ''}
        onChange={(e) => {
          const value = e.target.value;
          onChange(value === '' ? undefined : parseInt(value));
        }}
      >
        <option value="">Todos los meses</option>
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthSelector;