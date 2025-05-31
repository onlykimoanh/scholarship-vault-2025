import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, startOfWeek } from 'date-fns';
import { useApplicationStore } from '../store/useApplicationStore';
import { Application, FilterOptions } from '../types';
import { Calendar, Clock, ExternalLink, Filter, Edit2, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type TimelineView = 'month' | 'week' | 'day';

const TimelinePage: React.FC = () => {
  const { applications, getFilteredApplications, deleteApplication, filters, setFilters } = useApplicationStore();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [timelineView, setTimelineView] = useState<TimelineView>('month');
  
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  
  const filteredApplications = getFilteredApplications();
  
  const today = new Date();

  // Calculate timeline range - always include current month with good padding
  const timelineRange = useMemo(() => {
    const todayStart = startOfMonth(today);
    const todayEnd = endOfMonth(addDays(today, 365)); // 1 year ahead from today
    
    if (filteredApplications.length === 0) {
      const start = startOfMonth(addDays(today, -180)); // 6 months before
      const end = endOfMonth(addDays(today, 365)); // 1 year ahead
      return { start, end };
    }

    const dates = filteredApplications.flatMap(app => [
      new Date(app.applicationOpen),
      new Date(app.deadline)
    ]);
    
    // Include today's month in the range calculation
    dates.push(todayStart, todayEnd);
    
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    const latest = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const start = startOfMonth(addDays(earliest, -90)); // 3 months before earliest
    const end = endOfMonth(addDays(latest, 90)); // 3 months after latest
    
    return { start, end };
  }, [filteredApplications, today]);

  // Generate timeline days
  // const timelineDays = useMemo(() => {
  //   return eachDayOfInterval({
  //     start: timelineRange.start,
  //     end: timelineRange.end
  //   });
  // }, [timelineRange]);

  const totalDays = differenceInDays(timelineRange.end, timelineRange.start);
  
  // Adjust day width based on view type
  const dayWidth = useMemo(() => {
    switch (timelineView) {
      case 'day': return 48; // pixels per day - calendar-like spacing
      case 'week': return 8;
      case 'month': return 4;
      default: return 4;
    }
  }, [timelineView]);
  
  const timelineWidth = totalDays * dayWidth;

  // Calculate position and width for each application
  const applicationBars = useMemo(() => {
    return filteredApplications.map((app, index) => {
      const openDate = new Date(app.applicationOpen);
      const deadlineDate = new Date(app.deadline);
      
      const startOffset = differenceInDays(openDate, timelineRange.start);
      const duration = differenceInDays(deadlineDate, openDate);
      
      const left = startOffset * dayWidth;
      const width = Math.max(duration * dayWidth, 20); // minimum width for visibility
      
      // Each application gets its own row
      const row = index;
      
      return {
        ...app,
        left,
        width,
        row,
        startOffset,
        duration
      };
    });
  }, [filteredApplications, timelineRange, dayWidth]);

  const getBadgeColor = (stage: string) => {
    switch (stage) {
      case 'To Apply': return 'bg-gray-400';
      case 'In Progress': return 'bg-yellow-500';
      case 'Submitted': return 'bg-blue-500';
      case 'Done': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getCountryFlag = (country: string) => {
    const flagMap: { [key: string]: string } = {
      'Many': '🌍',
      'Australia': '🇦🇺',
      'Austria': '🇦🇹',
      'Belgium': '🇧🇪',
      'Canada': '🇨🇦',
      'China': '🇨🇳',
      'Czech Republic': '🇨🇿',
      'Denmark': '🇩🇰',
      'Estonia': '🇪🇪',
      'Finland': '🇫🇮',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Hong Kong': '🇭🇰',
      'Hungary': '🇭🇺',
      'Iceland': '🇮🇸',
      'Ireland': '🇮🇪',
      'Italy': '🇮🇹',
      'Japan': '🇯🇵',
      'Latvia': '🇱🇻',
      'Lithuania': '🇱🇹',
      'Luxembourg': '🇱🇺',
      'Netherlands': '🇳🇱',
      'New Zealand': '🇳🇿',
      'Norway': '🇳🇴',
      'Poland': '🇵🇱',
      'Portugal': '🇵🇹',
      'Singapore': '🇸🇬',
      'Slovakia': '🇸🇰',
      'Slovenia': '🇸🇮',
      'South Korea': '🇰🇷',
      'Spain': '🇪🇸',
      'Sweden': '🇸🇪',
      'Switzerland': '🇨🇭',
      'Taiwan': '🇹🇼',
      'UK': '🇬🇧',
      'USA': '🇺🇸',
      // Legacy mappings for existing data
      'United Kingdom': '🇬🇧',
      'United States': '🇺🇸'
    };
    return flagMap[country] || '🌍';
  };

  // const getUrgencyColor = (deadline: string) => {
  //   const deadlineDate = new Date(deadline);
  //   const days = differenceInDays(deadlineDate, today);
  //   
  //   if (days < 0) return 'border-gray-300 bg-gray-100 opacity-60';
  //   if (days <= 1) return 'border-red-500 bg-red-50';
  //   if (days <= 7) return 'border-orange-500 bg-orange-50';
  //   if (days <= 30) return 'border-yellow-500 bg-yellow-50';
  //   return 'border-blue-500 bg-blue-50';
  // };

  const allCountries = useMemo(() => {
    return Array.from(new Set(applications.map(app => app.country))).sort();
  }, [applications]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  // Initial scroll to today when component mounts
  useEffect(() => {
    if (timelineScrollRef.current) {
      const todayOffset = differenceInDays(today, timelineRange.start);
      const todayPosition = todayOffset * dayWidth;
      
      // Calculate scroll position to center today in view
      const containerWidth = timelineScrollRef.current.clientWidth;
      const scrollPosition = Math.max(0, todayPosition - containerWidth / 2);
      
      timelineScrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'auto' // Use instant scroll for initial position
      });
    }
  }, []); // Only run once on mount

  // Function to scroll to and center a specific card
  const scrollToCard = (app: any) => {
    if (timelineScrollRef.current) {
      const cardOffset = app.left + (app.width / 2);
      const containerWidth = timelineScrollRef.current.clientWidth;
      const scrollPosition = Math.max(0, cardOffset - containerWidth / 2);
      
      timelineScrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Timeline</h1>
          <p className="text-gray-600 mt-1">
            Total: {filteredApplications.length}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Timeline View Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View by:</span>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setTimelineView('month')}
                className={`px-4 py-2 text-sm transition-colors ${
                  timelineView === 'month'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimelineView('week')}
                className={`px-4 py-2 text-sm transition-colors border-l border-gray-200 ${
                  timelineView === 'week'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimelineView('day')}
                className={`px-4 py-2 text-sm transition-colors border-l border-gray-200 ${
                  timelineView === 'day'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Day
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || Object.keys(filters).some(key => filters[key as keyof FilterOptions]?.length)
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          
          <Link to="/add" className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </Link>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card flex-shrink-0 mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stage Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                <div className="space-y-2">
                  {['To Apply', 'In Progress', 'Submitted', 'Done'].map(stage => (
                    <label key={stage} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.stage?.includes(stage as any) || false}
                        onChange={(e) => {
                          const currentStages = filters.stage || [];
                          if (e.target.checked) {
                            handleFilterChange('stage', [...currentStages, stage]);
                          } else {
                            handleFilterChange('stage', currentStages.filter(s => s !== stage));
                          }
                        }}
                        className="text-primary-600"
                      />
                      <span className="text-sm">{stage}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {allCountries.map(country => (
                    <label key={country} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.country?.includes(country) || false}
                        onChange={(e) => {
                          const currentCountries = filters.country || [];
                          if (e.target.checked) {
                            handleFilterChange('country', [...currentCountries, country]);
                          } else {
                            handleFilterChange('country', currentCountries.filter(c => c !== country));
                          }
                        }}
                        className="text-primary-600"
                      />
                      <span className="text-sm">{country}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="space-y-2">
                  {['scholarship', 'admission'].map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.type?.includes(type as any) || false}
                        onChange={(e) => {
                          const currentTypes = filters.type || [];
                          if (e.target.checked) {
                            handleFilterChange('type', [...currentTypes, type]);
                          } else {
                            handleFilterChange('type', currentTypes.filter(t => t !== type));
                          }
                        }}
                        className="text-primary-600"
                      />
                      <span className="text-sm capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
              <button
                onClick={() => setFilters({})}
                className="btn-secondary"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline Container */}
      <div className="flex-1 overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-4">
              {applications.length === 0 
                ? "Start by adding your first scholarship or admission application."
                : "Try adjusting your filters or add new applications."
              }
            </p>
            <Link to="/add" className="btn-primary">
              Add Application
            </Link>
          </div>
        ) : (
          <div className="card p-4 h-full overflow-hidden flex flex-col">
                          {/* Timeline Header with Dates */}
              <div ref={timelineScrollRef} className="relative flex-1 overflow-auto">
                <div 
                  className="relative h-20 border-b border-gray-200"
                  style={{ width: `${timelineWidth}px` }}
                >
                  {/* Vertical grid lines */}
                  {(() => {
                    const gridLines: JSX.Element[] = [];
                    
                    if (timelineView === 'month') {
                      // Month view - vertical lines for each month
                      let currentMonth = startOfMonth(timelineRange.start);
                      
                      while (currentMonth <= timelineRange.end) {
                        const monthOffset = differenceInDays(currentMonth, timelineRange.start);
                        
                        gridLines.push(
                          <div
                            key={`grid-${currentMonth.toISOString()}`}
                            className="absolute top-0 border-l border-gray-100"
                            style={{ 
                              left: `${monthOffset * dayWidth}px`,
                              height: `${80 + Math.max(filteredApplications.length * 80, 200) + 16}px`,
                              zIndex: 1
                            }}
                          />
                        );
                        
                        currentMonth = addDays(currentMonth, 32);
                        currentMonth = startOfMonth(currentMonth);
                      }
                    } else if (timelineView === 'week') {
                      // Week view - vertical lines every week
                      let currentDate = startOfWeek(timelineRange.start, { weekStartsOn: 1 });
                      
                      while (currentDate <= timelineRange.end) {
                        const weekOffset = differenceInDays(currentDate, timelineRange.start);
                        
                        gridLines.push(
                          <div
                            key={`grid-${currentDate.toISOString()}`}
                            className="absolute top-0 border-l border-gray-100"
                            style={{ 
                              left: `${weekOffset * dayWidth}px`,
                              height: `${80 + Math.max(filteredApplications.length * 80, 200) + 16}px`,
                              zIndex: 1
                            }}
                          />
                        );
                        
                        currentDate = addDays(currentDate, 7);
                      }
                    } else if (timelineView === 'day') {
                      // One week view - vertical lines every day
                      let currentDate = new Date(timelineRange.start);
                      
                      while (currentDate <= timelineRange.end) {
                        const dayOffset = differenceInDays(currentDate, timelineRange.start);
                        
                        gridLines.push(
                          <div
                            key={`grid-day-${currentDate.getTime()}`}
                            className="absolute top-0 border-l border-gray-100"
                            style={{ 
                              left: `${dayOffset * dayWidth}px`,
                              height: `${80 + Math.max(filteredApplications.length * 80, 200) + 16}px`,
                              zIndex: 1
                            }}
                          />
                        );
                        
                        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add exactly 1 day
                      }
                    }
                    
                    return gridLines;
                  })()}

                  {/* Timeline markers based on view type */}
                {(() => {
                  const markers: JSX.Element[] = [];
                  
                  if (timelineView === 'month') {
                    // Month view - show month markers
                    let currentMonth = startOfMonth(timelineRange.start);
                    let lastYear: string | null = null;
                    
                    while (currentMonth <= timelineRange.end) {
                      const monthOffset = differenceInDays(currentMonth, timelineRange.start);
                      const currentYear = format(currentMonth, 'yyyy');
                      const showYear = lastYear !== currentYear;
                      
                      markers.push(
                        <div
                          key={currentMonth.toISOString()}
                          className="absolute top-0 border-l border-gray-300"
                          style={{ left: `${monthOffset * dayWidth}px` }}
                        >
                          <span className="absolute top-2 left-2 text-sm font-medium text-gray-900">
                            {format(currentMonth, 'MMM')}
                          </span>
                          {showYear && (
                            <span className="absolute top-6 left-2 text-xs text-gray-500">
                              {currentYear}
                            </span>
                          )}
                        </div>
                      );
                      
                      lastYear = currentYear;
                      currentMonth = addDays(currentMonth, 32);
                      currentMonth = startOfMonth(currentMonth);
                    }
                  } else if (timelineView === 'week') {
                    // Week view - show week markers
                    let currentDate = startOfWeek(timelineRange.start, { weekStartsOn: 1 }); // Monday
                    let lastMonth: string | null = null;
                    
                    while (currentDate <= timelineRange.end) {
                      const weekOffset = differenceInDays(currentDate, timelineRange.start);
                      const currentMonth = format(currentDate, 'MMM');
                      const isFirstWeekOfMonth = lastMonth !== currentMonth;
                      
                      // Add month header for first week of each month
                      if (isFirstWeekOfMonth) {
                        markers.push(
                          <div
                            key={`month-${currentDate.toISOString()}`}
                            className="absolute top-0"
                            style={{ left: `${weekOffset * dayWidth}px`, width: `${7 * dayWidth}px` }}
                          >
                            <span className="absolute top-1 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-gray-900">
                              {currentMonth}
                            </span>
                          </div>
                        );
                        lastMonth = currentMonth;
                      }
                      
                      // Add week range
                      const weekStart = format(currentDate, 'd');
                      const weekEnd = format(addDays(currentDate, 6), 'd');
                      
                                              markers.push(
                          <div
                            key={`week-${currentDate.toISOString()}`}
                            className="absolute top-0 border-l border-gray-300"
                            style={{ left: `${weekOffset * dayWidth}px`, width: `${7 * dayWidth}px` }}
                          >
                            <span className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-900">
                              {weekStart}-{weekEnd}
                            </span>
                          </div>
                        );
                      
                      currentDate = addDays(currentDate, 7);
                    }
                  } else if (timelineView === 'day') {
                    // One week view - calendar-style layout with day abbreviations
                    let currentDate = new Date(timelineRange.start);
                    let lastMonth: string | null = null;
                    
                    while (currentDate <= timelineRange.end) {
                      const dayOffset = differenceInDays(currentDate, timelineRange.start);
                      const dayNumber = format(currentDate, 'd');
                      const dayAbbrev = format(currentDate, 'EEEEE'); // Single letter: M, T, W, etc.
                      const currentMonth = format(currentDate, 'MMM');
                      const isFirstDayOfMonth = dayNumber === '1' || lastMonth !== currentMonth;
                      const isToday = format(currentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                      
                      // Add month header for first day of each month
                      if (isFirstDayOfMonth && lastMonth !== currentMonth) {
                        markers.push(
                          <div
                            key={`month-${currentDate.getTime()}`}
                            className="absolute top-0"
                            style={{ left: `${dayOffset * dayWidth}px` }}
                          >
                            <span className="absolute top-1 left-2 text-sm font-semibold text-gray-900">
                              {format(currentDate, 'MMM')}
                            </span>
                          </div>
                        );
                        lastMonth = currentMonth;
                      }
                      
                      // Add day with abbreviation and highlighting for today
                      markers.push(
                        <div
                          key={`day-${currentDate.getTime()}`}
                          className="absolute top-0 border-l border-gray-300"
                          style={{ left: `${dayOffset * dayWidth}px`, width: `${dayWidth}px` }}
                        >
                          <div 
                            className={`absolute top-6 left-1/2 transform -translate-x-1/2 w-10 h-8 flex flex-col items-center justify-center rounded ${
                              isToday 
                                ? 'bg-black text-white' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-xs font-medium leading-none">
                              {dayAbbrev}
                            </span>
                            <span className={`text-sm font-semibold leading-none mt-0.5 ${
                              isToday ? 'text-white' : 'text-gray-900'
                            }`}>
                              {dayNumber}
                            </span>
                          </div>
                        </div>
                      );
                      
                      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add exactly 1 day
                    }
                  }
                  
                  return markers;
                })()}
              </div>

              {/* Today marker - consistent style for all views */}
              {(() => {
                const todayOffset = differenceInDays(today, timelineRange.start);
                if (todayOffset >= 0 && todayOffset <= totalDays) {
                  return (
                    <div
                      className="absolute top-0 border-l-4 border-primary-600 bg-primary-600 bg-opacity-10 z-20"
                      style={{ 
                        left: `${todayOffset * dayWidth - 2}px`, 
                        width: '4px',
                        height: `${80 + Math.max(applicationBars.length * 60, 200) + 16}px`
                      }}
                    >
                      <div className="absolute top-0 -left-4 w-8 h-6 bg-primary-600 rounded-full flex items-center justify-center shadow-lg z-30">
                        <span className="text-xs font-bold text-white">
                          {format(today, 'd')}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Application Bars */}
              <div 
                className="relative mt-4"
                style={{ 
                  width: `${timelineWidth}px`,
                  height: `${Math.max(filteredApplications.length * 80, 200)}px`
                }}
              >
                {applicationBars.map((app, index) => {
                  const isExpired = differenceInDays(new Date(app.deadline), today) < 0;
                  
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`absolute cursor-pointer group border rounded-lg p-3 pb-6 hover:shadow-lg transition-all duration-200 ${
                        isExpired ? 'opacity-50' : ''
                      } ${
                        selectedApplication?.id === app.id 
                          ? 'border-primary-500 bg-blue-50 ring-2 ring-primary-500 shadow-lg' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      style={{
                        left: `${app.left}px`,
                        width: `${Math.max(app.width, 120)}px`,
                        top: `${app.row * 60 + 20}px`,
                        height: '64px',
                        zIndex: selectedApplication?.id === app.id ? 30 : 5
                      }}
                                onClick={() => {
            const newSelection = selectedApplication?.id === app.id ? null : app;
            setSelectedApplication(newSelection);
            if (newSelection) {
              scrollToCard(app);
            }
          }}
                    >
                      {/* Application info */}
                      <div className="truncate pr-8">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {app.type === 'scholarship' ? app.scholarshipName : app.programName}
                        </div>
                        <div className="text-xs text-gray-600 truncate mt-1 mb-4">
                          {getCountryFlag(app.country)} {app.country} • {app.region} • {app.type === 'scholarship' ? app.grantedBy : app.school}
                        </div>
                      </div>

                      {/* Type and Timeline Status badges */}
                      <div className="absolute right-3 top-3 flex items-center space-x-2">
                        <span className="text-xs px-1 py-0.5 bg-white bg-opacity-80 rounded">
                          {app.type === 'scholarship' ? 'S' : 'A'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          app.timelineStatus === 'EST' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {app.timelineStatus}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Application Details */}
      <AnimatePresence>
        {selectedApplication && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card border-l-4 border-l-primary-500 mt-6 flex-shrink-0"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedApplication.type === 'scholarship' 
                        ? selectedApplication.scholarshipName 
                        : selectedApplication.programName
                      }
                    </h3>
                    <p className="text-gray-600">
                      {selectedApplication.type === 'scholarship' 
                        ? selectedApplication.grantedBy 
                        : selectedApplication.school
                      } • {getCountryFlag(selectedApplication.country)} {selectedApplication.country} • {selectedApplication.region}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`${getBadgeColor(selectedApplication.stage)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                      {selectedApplication.stage}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedApplication.timelineStatus === 'EST' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedApplication.timelineStatus}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      {selectedApplication.type === 'scholarship' ? 'Scholarship' : 'Admission'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Opens: {format(new Date(selectedApplication.applicationOpen), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      Deadline: {format(new Date(selectedApplication.deadline), 'MMM d, yyyy')}
                      {(() => {
                        const days = differenceInDays(new Date(selectedApplication.deadline), today);
                        if (days < 0) return <span className="ml-2 text-red-600">(Past due)</span>;
                        if (days === 0) return <span className="ml-2 text-red-600 font-medium">(Due today!)</span>;
                        if (days === 1) return <span className="ml-2 text-red-600">(Due tomorrow)</span>;
                        if (days <= 7) return <span className="ml-2 text-orange-600">({days} days left)</span>;
                        return <span className="ml-2 text-gray-500">({days} days left)</span>;
                      })()}
                    </span>
                  </div>
                </div>

                {selectedApplication.notes && (
                  <p className="text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                    {selectedApplication.notes}
                  </p>
                )}

                <div className="flex items-center space-x-4">
                  {((selectedApplication.type === 'scholarship' && selectedApplication.link) ||
                    (selectedApplication.type === 'admission' && selectedApplication.programLink)) && (
                    <a
                      href={selectedApplication.type === 'scholarship' ? selectedApplication.link : selectedApplication.programLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Application</span>
                    </a>
                  )}
                  
                  {selectedApplication.type === 'admission' && selectedApplication.requirementLink && (
                    <a
                      href={selectedApplication.requirementLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Requirements</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Link
                  to={`/edit/${selectedApplication.id}`}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this application?')) {
                      deleteApplication(selectedApplication.id);
                      setSelectedApplication(null);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
};

export default TimelinePage; 