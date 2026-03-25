import styled, { keyframes } from "styled-components";
import {theme} from '@/app/styles/theme';

const spin = keyframes`
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: ${theme.colors.gray};
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${theme.colors.gray};
  border-top: 4px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 10px;
`;

const Text = styled.p`
  font-size: 14px;
  margin: 0;
`;

export default function LoadingSpinner({ fullScreen = false, text = "Carregando..." }) {
  return (
    <SpinnerContainer style={fullScreen ? { height: '100vh' } : {}}>
      <Spinner />
      <Text>{text}</Text>
    </SpinnerContainer>
  );
}