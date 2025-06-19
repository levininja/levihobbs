import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm,
  onSearchChange,
  placeholder = "Search by title, author, or genre..." 
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
  };

  return (
    <div className="search-bar" data-testid="search-bar">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="search-input"
        data-testid="search-input"
      />
      {searchTerm.length > 0 && searchTerm.length < 3 && (
        <div className="search-hint">
          Please enter at least 3 characters to search
        </div>
      )}
    </div>
  );
}; 