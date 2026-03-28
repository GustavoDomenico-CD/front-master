import { styled } from "styled-components";
import { theme } from '@/app/styles/theme';
import { useEffect } from "react";

const Message = styled.div<{ type: 'success' | 'error' }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: ${theme.radius.md};
  color: ${theme.colors.light};
  background-color: ${({ type }) => type === 'success' ? theme.colors.success : theme.colors.danger};
  box-shadow: ${theme.shadow.md};
  z-index: 1000;
  opacity: 1;
  transform: translateY(0);
`
interface StatusMessageProps {
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
}

export default function StatusMessage({ type, message, onClose }: StatusMessageProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    if (!message) return null;

    return (
        <Message type={type}>
            {message}
        </Message>
    );
}