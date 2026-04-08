'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #7961d7, #cd7cf0, #ba78e6, #ebc7ff, #f9edff);
  background-size: 400% 400%;
  animation: ${gradientShift} 10s ease infinite;
`;

const Container = styled.div`
  width: 800px;
  height: 500px;
  display: flex;
  position: relative;
  background-color: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
`;

const FormWrapper = styled.div`
  width: 100%;
  overflow: hidden;
`;

const Form = styled.form`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 30px;
  margin-bottom: 20px;
`;

const Text = styled.span`
  font-size: 18px;
  margin-bottom: 15px;
`;

const InputWrapper = styled.div`
  width: 300px;
  height: 50px;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 0 15px;
  background-color: #eee2f7;
  border-radius: 6px;

  input {
    border: none;
    outline: none;
    width: 100%;
    height: 100%;
    background-color: inherit;
    font-size: 16px;
  }
`;

const Button = styled.button<{ $outlined?: boolean }>`
  width: 170px;
  height: 45px;
  font-size: 15px;
  border: ${({ $outlined }) => ($outlined ? "2px solid white" : "none")};
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  background-color: ${({ $outlined }) => ($outlined ? "transparent" : "#b441c5")};
  color: white;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ $outlined }) => ($outlined ? "white" : "#a032b0")};
    color: ${({ $outlined }) => ($outlined ? "#b441c5" : "white")};
    box-shadow: 0 0 15px rgba(184, 65, 197, 0.6);
    transform: scale(1.05);
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
`;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = '/api/auth/login';
      const requestBody = {
        email: formData.email,
        password: formData.password,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Credenciais inválidas');
      }

      const authData = data as typeof data & {
        user?: { role?: string };
      };
      const r = (authData.user?.role ?? '').toLowerCase();
      router.push(r === 'paciente' ? '/paciente' : '/painel-agendamento');
      router.refresh();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao tentar fazer login. Tente novamente';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppWrapper>
      <Container>
        <FormWrapper>
          <Form 
            onSubmit={handleSubmit} 
          >
            <Title>Entrar</Title>
            <Text>Use seu e-mail/usuário e senha</Text>
            <InputWrapper>
              <input type="text" name="email" placeholder="E-mail ou Usuário" value={formData.email} onChange={handleChange} required />
            </InputWrapper>
            <InputWrapper>
              <input type="password" name="password" placeholder="Senha" value={formData.password} onChange={handleChange} required />
            </InputWrapper>
            <Button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'ENTRAR'}
            </Button>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </Form>
        </FormWrapper>
      </Container>
    </AppWrapper>
  );
}