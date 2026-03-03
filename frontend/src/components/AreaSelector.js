import React, { useState, useEffect } from 'react';
import { useAreas } from '../context/AreaContext';

const AreaSelector = ({ onAreaSelect }) => {
  const { areas, selectedArea, selectArea, getFilteredAreas, filterByAreaType, areaType } = useAreas();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // If there's a selected area, notify parent
    if (selectedArea && onAreaSelect) {
      onAreaSelect(selectedArea.id);
    }
  }, [selectedArea, onAreaSelect]);

  const handleAreaSelect = (area) => {
    selectArea(area);
    if (onAreaSelect) {
      onAreaSelect(area ? area.id : 'all');
    }
    setShowDropdown(false);
  };

  const handleTypeFilter = (type) => {
    filterByAreaType(type);
  };

  const filteredAreas = getFilteredAreas();

  const areaTypes = [
    { value: 'all', label: 'All Areas', color: 'blue' },
    { value: 'estate', label: 'Estates', color: 'green' },
    { value: 'municipality', label: 'Municipalities', color: 'purple' },
    { value: 'complex', label: 'Complexes', color: 'orange' }
  ];

  const getTypeCount = (type) => {
    if (type === 'all') return areas.length;
    return areas.filter(a => a.type === type).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Select Your Area</h2>
          <p className="text-gray-600 mb-4 md:mb-0">
            {selectedArea 
              ? `Currently viewing: ${selectedArea.name} (${selectedArea.type})`
              : 'Choose an estate, municipality, or complex to view local issues'}
          </p>
        </div>

        {/* Area Type Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {areaTypes.map(type => {
            const colorClasses = {
              blue: 'bg-blue-600 text-white',
              green: 'bg-green-600 text-white',
              purple: 'bg-purple-600 text-white',
              orange: 'bg-orange-600 text-white'
            };
            
            const inactiveColorClasses = {
              blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
              green: 'bg-green-100 text-green-800 hover:bg-green-200',
              purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
              orange: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            };
            
            return (
              <button
                key={type.value}
                onClick={() => handleTypeFilter(type.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${areaType === type.value 
                    ? colorClasses[type.color]
                    : inactiveColorClasses[type.color]
                  }`}
              >
                {type.label} ({getTypeCount(type.value)})
              </button>
            );
          })}
        </div>
      </div>

      {/* Area Selection Dropdown */}
      <div className="mt-4 relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full md:w-96 bg-gray-50 border border-gray-300 rounded-lg p-3 text-left flex justify-between items-center hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className={selectedArea ? 'text-gray-900' : 'text-gray-500'}>
            {selectedArea ? selectedArea.name : 'Select an area...'}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full md:w-96 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            <button
              onClick={() => handleAreaSelect(null)}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-200 text-blue-600 font-medium"
            >
              Clear Area Selection
            </button>
            
            {filteredAreas.length === 0 ? (
              <div className="px-4 py-3 text-gray-500">No areas found</div>
            ) : (
              filteredAreas.map(area => (
                <button
                  key={area.id}
                  onClick={() => handleAreaSelect(area)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0
                    ${selectedArea?.id === area.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{area.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full 
                      ${area.type === 'estate' ? 'bg-green-100 text-green-800' : 
                        area.type === 'municipality' ? 'bg-purple-100 text-purple-800' : 
                        'bg-orange-100 text-orange-800'}`}
                    >
                      {area.type}
                    </span>
                  </div>
                  {area.description && (
                    <p className="text-sm text-gray-500 mt-1">{area.description}</p>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="mt-4 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>Select an area to see issues specific to that location, or use "Show All Issues" to see everything.</span>
        </p>
      </div>
    </div>
  );
};

export default AreaSelector;