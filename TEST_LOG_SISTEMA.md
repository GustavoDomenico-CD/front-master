# Log de teste do sistema

Data: 2026-04-02  
Ambiente base: Front Next.js (`front-master`) + backend configurado via `BACKEND_URL`  
Objetivo: validar funcionalidades principais e mapear possibilidades de erro.

## Escopo funcional coberto

- Autenticação e sessão (`/painel-login`, `/api/auth/*`)
- Painel de agendamentos/admin (`/painel-agendamento`, `/AppoimentsPanel`)
- WhatsApp (conexão, contatos, mensagens, templates, KPIs)
- Chatbot e cadastro relacionado
- Área do paciente (`/paciente`)

## Resultado geral

- **Status:** parcial (roteiro completo + cenários de erro mapeados)
- **Execução manual:** preparada para rodar ponta a ponta
- **Riscos principais:** dependência de backend e sessão válida para fluxos protegidos

## Casos de teste funcionais

| ID | Módulo | Cenário | Resultado esperado | Status |
|---|---|---|---|---|
| AUTH-01 | Login | Login com credenciais válidas | Redireciona para painel correto por perfil | Pendente |
| AUTH-02 | Login | Senha inválida | Mensagem de erro sem criar sessão | Pendente |
| AUTH-03 | Sessão | Acesso rota protegida sem cookie | Redireciona para login | Pendente |
| AUTH-04 | Logout | Efetuar logout | Cookie limpo e retorno ao login | Pendente |
| AGD-01 | Agendamentos | Listar agendamentos | Lista renderizada com paginação | Pendente |
| AGD-02 | Agendamentos | Filtrar por status/data | Somente itens filtrados visíveis | Pendente |
| AGD-03 | Agendamentos | Criar agendamento válido | Registro aparece na listagem | Pendente |
| AGD-04 | Agendamentos | Atualizar agendamento | Mudanças persistidas e refletidas na UI | Pendente |
| AGD-05 | Agendamentos | Dados obrigatórios ausentes | Mensagem de validação ao usuário | Pendente |
| WA-01 | WhatsApp | Verificar status de conexão | Indicador mostra conectado/desconectado corretamente | Pendente |
| WA-02 | WhatsApp | Enviar mensagem de texto | Mensagem aparece na conversa com status de envio | Pendente |
| WA-03 | WhatsApp | Enviar imagem com legenda | Mensagem de mídia aparece corretamente | Pendente |
| WA-04 | WhatsApp | Alternar agente por contato | Estado de agente altera e persiste | Pendente |
| WA-05 | WhatsApp | **Limpar aba de chat** | Conversa oculta na aba atual e volta ao reabrir contato | Implementado |
| WA-06 | WhatsApp | Contato bloqueado tentar enviar | Botões ficam desabilitados e envio não ocorre | Pendente |
| WA-07 | WhatsApp | Recarregar mensagens com erro de API | Banner de erro + ação de recarregar | Pendente |
| CBT-01 | Chatbot | Buscar cadastro existente | Resultado exibido sem erro | Pendente |
| CBT-02 | Chatbot | Buscar com termo vazio/inválido | Mensagem de validação/erro amigável | Pendente |
| PAC-01 | Paciente | Login com perfil paciente | Acesso permitido à rota `/paciente` | Pendente |
| PAC-02 | Paciente | Perfil não-paciente em `/paciente` | Bloqueio com redirecionamento | Pendente |
| PAC-03 | Paciente | Ver consultas por status | Abas agendado/concluído/cancelado consistentes | Pendente |
| PAC-04 | Paciente | **Tabela de serviços realizados** | Exibe data, horário, serviço, profissional e observações | Implementado |
| PAC-05 | Paciente | Sem atendimentos concluídos | Tabela não aparece e estado vazio é mostrado | Pendente |

## Possibilidades de erro e validações críticas

1. **Sessão inválida/expirada**
   - Sintoma: 401 em rotas `/api/*`.
   - Validar: redirecionamento para login e mensagem amigável.

2. **Perfil sem permissão**
   - Sintoma: 403 em áreas de paciente/admin.
   - Validar: bloqueio de acesso sem expor stack/erro técnico.

3. **Falha de comunicação com backend**
   - Sintoma: timeout/502 nas rotas proxy.
   - Validar: banners de erro + ações de retry (`Tentar novamente`, `Recarregar`).

4. **Dados inconsistentes do backend**
   - Sintoma: payload sem campos esperados (ex.: lista de agendamentos incompleta).
   - Validar: fallback seguro (estado vazio) e sem quebra de render.

5. **Operações de WhatsApp com instância desconectada**
   - Sintoma: erro ao enviar mensagem/mídia.
   - Validar: mensagem de erro clara e preservação da conversa sem travar UI.

6. **Uploads inválidos no chat**
   - Sintoma: arquivo não suportado / leitura falha.
   - Validar: erro tratado sem crash e input liberado para nova tentativa.

## Evidências sugeridas por teste

- Captura de tela da tela final
- Endpoint chamado e status HTTP
- Payload de erro (quando houver)
- Data/hora e usuário de execução

## Observações de implementação desta entrega

- Botão **Limpar aba** adicionado no cabeçalho do chat WhatsApp (limpeza local da conversa aberta).
- Tabela **Serviços realizados** adicionada na aba de concluídos da área do paciente.
- Arquivo de log criado para execução recorrente de QA manual.
