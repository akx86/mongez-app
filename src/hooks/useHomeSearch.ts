import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";

export const useHomeSearch = () => {
  const [searchText, setSearchText] = useState("");

  const debouncedSearch = useDebounce(searchText, 500);

  useEffect(() => {
    if (debouncedSearch.trim().length > 0) {
      console.log("Hitting API with search query:", debouncedSearch);
    }
  }, [debouncedSearch]);

  return {
    searchText,
    setSearchText,
  };
};
