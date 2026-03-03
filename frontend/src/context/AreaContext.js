import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AreaContext = createContext();

export const useAreas = () => {
  return useContext(AreaContext);
};

export const AreaProvider = ({ children }) => {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaType, setAreaType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await api.areas.getAll();
      setAreas(response.areas || []);
      
      // Set default selected area from localStorage if exists
      const savedArea = localStorage.getItem('selectedArea');
      if (savedArea) {
        setSelectedArea(JSON.parse(savedArea));
      }
    } catch (error) {
      console.error('Failed to fetch areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectArea = (area) => {
    setSelectedArea(area);
    if (area) {
      localStorage.setItem('selectedArea', JSON.stringify(area));
    } else {
      localStorage.removeItem('selectedArea');
    }
  };

  const filterByAreaType = (type) => {
    setAreaType(type);
  };

  const getFilteredAreas = () => {
    if (areaType === 'all') return areas;
    return areas.filter(area => area.type === areaType);
  };

  const value = {
    areas,
    selectedArea,
    areaType,
    loading,
    selectArea,
    filterByAreaType,
    getFilteredAreas
  };

  return (
    <AreaContext.Provider value={value}>
      {children}
    </AreaContext.Provider>
  );
};