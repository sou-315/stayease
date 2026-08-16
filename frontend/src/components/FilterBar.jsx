function FilterBar({
  searchTerm, setSearchTerm,
  maxPrice, setMaxPrice,
  minRating, setMinRating,
  locationFilter, setLocationFilter,
  locations,
  sortBy, setSortBy
}) {
  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Search by hotel name or location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="filter-search"
      />

      <label className="filter-field">
        Max price: ${maxPrice}
        <input
          type="range"
          min="50"
          max="300"
          step="5"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
      </label>

      <label className="filter-field">
        Min rating
        <input
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value) || 0)}
          placeholder="e.g. 4.5"
        />
      </label>

      <label className="filter-field">
        Location
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        Sort by
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="none">Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Rating: High to Low</option>
        </select>
      </label>
    </div>
  )
}

export default FilterBar