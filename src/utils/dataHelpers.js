export const filterData = (data, searchText, searchableKeys = null) => {
  if (!searchText || searchText.trim() === "") {
    return data;
  }
  const search = searchText.toLowerCase();

  return data.filter((item) => {
    const valuesToCheck = searchableKeys
      ? searchableKeys.map((key) => item[key])
      : Object.values(item);

    return valuesToCheck.some((value) =>
      String(value).toLowerCase().includes(search)
    );
  });
};

export const sortData = (data, sortKey, sortDirection = "asc") => {
  if (!sortKey) {
    return data;
  }

  return [...data].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (typeof aValue === "string") {
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === "asc" ? comparison : -comparison;
    }

    const comparison = aValue - bValue;
    return sortDirection === "asc" ? comparison : -comparison;
  });
};

export const filterByGroups = (data, selectedGroups, groupKey) => {
  if (!selectedGroups || selectedGroups.length == 0) {
    return data;
  }
  return data.filter((item) => selectedGroups.includes(item[groupKey]));
};

export const paginateData = (data, currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
};
