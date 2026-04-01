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
  background: linear-gradient(135deg, #b861d7, #cd7cf0, #ba78e6, #ebc7ff, #f9edff);
  background-size: 400% 400%;
  animation: ${gradientShift} 10s ease infinite;
`;

const Container = styled.div<{ $toggled: boolean }>`
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

const Form = styled.form<{ $toggled: boolean; $isSignUp?: boolean }>`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: transform 0.5s ease-in;
  transform: ${({ $toggled, $isSignUp }) => {
    if ($isSignUp) return $toggled ? "translateX(0)" : "translateX(-100%)";
    return $toggled ? "translateX(100%)" : "translateX(0)";
  }};
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

const WelcomeContainer = styled.div<{ $toggled: boolean }>`
  position: absolute;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  transform: ${({ $toggled }) => ($toggled ? "translateX(0)" : "translateX(100%)")};
  background-color: ${({ $toggled }) => ($toggled ? "#9520a5" : "#ce4de8")};
  transition: transform 0.5s ease-in-out, border-radius 0.5s ease-in-out;
  overflow: hidden;
  border-radius: ${({ $toggled }) => ($toggled ? "0 50% 50% 0" : "50% 0 0 50%")};
`;

const WelcomeContent = styled.div<{ $show: boolean }>`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 0 50px;
  color: white;
  transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
  transform: ${({ $show }) => ($show ? "translateX(0)" : "translateX(100%)")};
  opacity: ${({ $show }) => ($show ? "1" : "0")};
`;

const WelcomeTitle = styled.h3`
  font-size: 40px;
`;

const WelcomeText = styled.p`
  font-size: 20px;
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
`;

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    avatarUrl: '', 
    phone: '' 
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
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const requestBody = isRegister ? {
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim() || undefined,
        avatarUrl: formData.avatarUrl.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      } : {
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
        throw new Error(data.message || (isRegister ? 'Falha ao criar conta' : 'Credenciais inválidas'));
      }

      const authData = data as typeof data & {
        user?: { role?: string };
      };
      const r = (authData.user?.role ?? '').toLowerCase();
      router.push(r === 'paciente' ? '/paciente' : '/painel-agendamento');
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : `Erro ao tentar ${isRegister ? 'criar conta' : 'fazer login'}. Tente novamente`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppWrapper>
      <Container $toggled={isRegister}>   {/* ← Corrigido */}
        <FormWrapper>
          <Form 
            onSubmit={handleSubmit} 
            $toggled={isRegister}
            $isSignUp={false}            
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

        <FormWrapper>
          <Form 
            onSubmit={handleSubmit} 
            $toggled={isRegister}
            $isSignUp={true}            
          >
            <Title>Registrar</Title>
            <Text>Use seu e-mail para se registrar</Text>
            {/* ... resto dos inputs ... */}
            <InputWrapper>
              <input type="text" name="name" placeholder="Nome" value={formData.name} onChange={handleChange} />
            </InputWrapper>
            <InputWrapper>
              <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} required />
            </InputWrapper>
            <InputWrapper>
              <input type="password" name="password" placeholder="Senha" value={formData.password} onChange={handleChange} required minLength={8} />
            </InputWrapper>
            <InputWrapper>
              <input type="tel" name="phone" placeholder="Telefone (opcional)" value={formData.phone} onChange={handleChange} />
            </InputWrapper>
            <InputWrapper>
              <input type="url" name="avatarUrl" placeholder="Avatar URL (opcional)" value={formData.avatarUrl} onChange={handleChange} />
            </InputWrapper>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'REGISTRAR'}
            </Button>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </Form>
        </FormWrapper>

        <WelcomeContainer $toggled={isRegister}>   {/* ← Corrigido */}
          <WelcomeContent $show={!isRegister}>
            <WelcomeTitle>Bem-vindo!</WelcomeTitle>
            <WelcomeText>Digite seus dados pessoais para usar todas as funções do site</WelcomeText>
            <Button type="button" $outlined onClick={() => setIsRegister(true)}>
              Registrar
            </Button>
          </WelcomeContent>

          <WelcomeContent $show={isRegister}>
            <WelcomeTitle>Olá!</WelcomeTitle>
            <WelcomeText>Registre-se com seus dados pessoais para usar todas as funções do site</WelcomeText>
            <Button type="button" $outlined onClick={() => setIsRegister(false)}>
              Entrar
            </Button>
          </WelcomeContent>
        </WelcomeContainer>
      </Container>
    </AppWrapper>
  );
}