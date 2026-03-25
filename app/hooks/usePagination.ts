import {useState, useCallback} from 'react'

interface PaginationState{
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

interface UsePaginationReturn{
    pagination: PaginationState;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    setTotalItems: (total: number) => void;
    reset: () => void;
}

export function usePagination({
  initialPage = 1,
  pageSize = 20,
  initialTotalItems = 0,
}: {
  initialPage?: number;
  pageSize?: number;
  initialTotalItems?: number;
} = {}): UsePaginationReturn {
  const [state, setState] = useState<PaginationState>({
    currentPage: initialPage,
    pageSize,
    totalItems: initialTotalItems,
    totalPages: Math.ceil(initialTotalItems / pageSize) || 1,
  });

  const updateTotalPages = useCallback((total: number, size: number) => {
    return Math.max(1, Math.ceil(total/size))
  }, [])

  const goToPage = useCallback((page: number) => {
    setState(prev => {
        const newPage = Math.max(1, Math.min(page, prev.totalPages))
         return {...prev, currentPage: newPage}   
    })
  }, [])

const nextPage = useCallback(() => {
    setState(prev => {
      if (prev.currentPage >= prev.totalPages) return prev;
      return { ...prev, currentPage: prev.currentPage + 1 };
    });
  }, []);
  
  const prevPage = useCallback(() => {
    setState(prev => {
      if (prev.currentPage <= 1) return prev;
      return { ...prev, currentPage: prev.currentPage - 1 };
    });
  }, []);

  const setTotalItems = useCallback((total: number) => {
    setState(prev => ({
        ...prev,
        totalItems: total,
        totalPages: updateTotalPages(total, prev.pageSize),
        currentPage: Math.min(prev.currentPage, updateTotalPages(total, prev.pageSize))
    }),)
  }, [updateTotalPages])

  const reset = useCallback(() => {
      setState({
        currentPage: initialPage,
        pageSize,
        totalItems: initialTotalItems,
        totalPages: Math.ceil(initialTotalItems / pageSize) || 1,
      })
  }, [initialPage, pageSize, initialTotalItems])

  return{
    pagination: state,
    goToPage,
    nextPage,
    prevPage,
    setTotalItems,
    reset
  }
}