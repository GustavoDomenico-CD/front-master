import styled from 'styled-components';
import {theme} from './../styles/theme'

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 32px 0;
  flex-wrap: wrap;
`;

const PageButton = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.radius.sm};
  background: ${theme.colors.primary};
  color: ${theme.colors.gray}
  font-weight: ${({ $active }) => $active ? 600 : 500};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ $active, theme }) => 
      $active ? '#2563eb' : '#f1f5f9'};
    border-color: ${theme.colors.primary};
  }
`;

const Ellipsis = styled.span`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.gray};
  font-weight: 500;
`;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;     // quantas páginas mostrar de cada lado da atual
  boundaryCount?: number;     // quantas mostrar no início/fim
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3 + boundaryCount * 2;
    if (totalNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, boundaryCount + 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - boundaryCount);

    const showLeftDots = leftSiblingIndex > boundaryCount + 1;
    const showRightDots = rightSiblingIndex < totalPages - boundaryCount;

    const firstPages = range(1, boundaryCount);
    const lastPages = range(totalPages - boundaryCount + 1, totalPages);

    if (!showLeftDots && showRightDots) {
      return [...range(1, boundaryCount + siblingCount * 2 + 1), 'dots', ...lastPages];
    }

    if (showLeftDots && !showRightDots) {
      return [...firstPages, 'dots', ...range(totalPages - boundaryCount - siblingCount * 2, totalPages)];
    }

    if (showLeftDots && showRightDots) {
      return [
        ...firstPages,
        'dots',
        ...range(leftSiblingIndex, rightSiblingIndex),
        'dots',
        ...lastPages,
      ];
    }

    return range(1, totalPages);
  };

  const pages = getPageNumbers();

  return (
    <PaginationContainer>
      <PageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ←
      </PageButton>

      {pages.map((page, index) => {
        if (page === 'dots') {
          return <Ellipsis key={`dots-${index}`}>...</Ellipsis>;
        }

        return (
          <PageButton
            key={page}
            $active={page === currentPage}
            onClick={() => onPageChange(Number(page))}
          >
            {page}
          </PageButton>
        );
      })}

      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        →
      </PageButton>
    </PaginationContainer>
  );
}