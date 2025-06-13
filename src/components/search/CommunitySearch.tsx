
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface CommunitySearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
  totalResults: number;
}

export interface SearchFilters {
  minMembers: number;
  hasActiveGalleries: boolean;
  hasUpcomingEvents: boolean;
}

export const CommunitySearch = ({ onSearch, onFilterChange, totalResults }: CommunitySearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    minMembers: 0,
    hasActiveGalleries: false,
    hasUpcomingEvents: false,
  });

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const clearedFilters = {
      minMembers: 0,
      hasActiveGalleries: false,
      hasUpcomingEvents: false,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.minMembers > 0 || 
    filters.hasActiveGalleries || 
    filters.hasUpcomingEvents;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Topluluk ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>
          Ara
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtrele
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              !
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filtreler</h3>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Temizle
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Üye Sayısı
                </label>
                <Input
                  type="number"
                  min="0"
                  value={filters.minMembers}
                  onChange={(e) => handleFilterChange({ minMembers: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activeGalleries"
                  checked={filters.hasActiveGalleries}
                  onChange={(e) => handleFilterChange({ hasActiveGalleries: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="activeGalleries" className="text-sm font-medium text-gray-700">
                  Aktif galerileri olan
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="upcomingEvents"
                  checked={filters.hasUpcomingEvents}
                  onChange={(e) => handleFilterChange({ hasUpcomingEvents: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="upcomingEvents" className="text-sm font-medium text-gray-700">
                  Yaklaşan etkinlikleri olan
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Info */}
      {totalResults > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{totalResults} topluluk bulundu</span>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span>Aktif filtreler:</span>
              {filters.minMembers > 0 && (
                <Badge variant="outline">Min {filters.minMembers} üye</Badge>
              )}
              {filters.hasActiveGalleries && (
                <Badge variant="outline">Aktif galeriler</Badge>
              )}
              {filters.hasUpcomingEvents && (
                <Badge variant="outline">Yaklaşan etkinlikler</Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
