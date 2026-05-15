import React, { useState, useRef, useEffect } from 'react';
import './PhoneInput.css';

const COUNTRIES = [
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳', format: '##### #####' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸', format: '(###) ###-####' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧', format: '#### ######' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦', format: '(###) ###-####' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺', format: '### ### ###' },
  { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪', format: '## ### ####' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬', format: '#### ####' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪', format: '### #######' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷', format: '# ## ## ## ##' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱', format: '## ### ####' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹', format: '### ### ####' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸', format: '### ### ###' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷', format: '(##) #####-####' },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽', format: '## #### ####' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵', format: '##-####-####' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷', format: '##-####-####' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳', format: '### #### ####' },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰', format: '### #######' },
  { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩', format: '#### ######' },
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬', format: '### ### ####' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦', format: '## ### ####' },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪', format: '### ######' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦', format: '## ### ####' },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭', format: '### ### ####' },
  { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩', format: '### #### ####' },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾', format: '##-### ####' },
  { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭', format: '##-###-####' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿', format: '## ### ####' },
  { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷', format: '### ###-####' },
  { code: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬', format: '### ### ####' },
];

export default function PhoneInput({ value, onChange, name = 'phone' }) {
  const [selected, setSelected] = useState(COUNTRIES[0]); // India default
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [localNumber, setLocalNumber] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (country) => {
    setSelected(country);
    setOpen(false);
    setSearch('');
    onChange({ target: { name, value: localNumber ? `${country.dial} ${localNumber}` : '' } });
  };

  const handleNumber = (e) => {
    const num = e.target.value.replace(/[^0-9\s\-().]/g, '');
    setLocalNumber(num);
    onChange({ target: { name, value: num ? `${selected.dial} ${num}` : '' } });
  };

  const filtered = search
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dial.includes(search) ||
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

  return (
    <div className="phone-input-wrap" ref={dropdownRef}>
      <div className="phone-input-row">
        {/* Country selector */}
        <button
          type="button"
          className="country-btn"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="country-flag">{selected.flag}</span>
          <span className="country-dial">{selected.dial}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* Number input */}
        <input
          className="phone-number-input form-input"
          type="tel"
          placeholder={selected.format.replace(/#/g, '0')}
          value={localNumber}
          onChange={handleNumber}
          autoComplete="tel-national"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="country-dropdown">
          <div className="country-search-wrap">
            <input
              className="country-search"
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="country-list">
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                className={`country-option ${c.code === selected.code ? 'country-option-active' : ''}`}
                onClick={() => handleSelect(c)}
              >
                <span className="country-flag">{c.flag}</span>
                <span className="country-option-name">{c.name}</span>
                <span className="country-option-dial">{c.dial}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="country-empty">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
