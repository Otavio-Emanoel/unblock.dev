# 📚 Guia Completo de Uso do Sistema — Unblock.dev

Bem-vindo ao **Guia Oficial de Uso do Unblock.dev**. Este documento descreve passo a passo como desenvolvedores e mentores utilizam todas as funcionalidades da plataforma de pair programming sob demanda.

---

## 📑 Sumário

1. [Visão Geral e Arquitetura de Papéis](#1-visão-geral-e-arquitetura-de-papéis)
2. [Acesso à Aplicação e Cadastro](#2-acesso-à-aplicação-e-cadastro)
3. [Jornada do Desenvolvedor (Cliente)](#3-jornada-do-desenvolvedor-cliente)
   - [3.1 Recarga e Gestão de Carteira](#31-recarga-e-gestão-de-carteira)
   - [3.2 Abertura de Chamado SOS](#32-abertura-de-chamado-sos)
   - [3.3 Aguardando o Mentor](#33-aguardando-o-mentor)
4. [Jornada do Mentor](#4-jornada-do-mentor)
   - [4.1 Status de Disponibilidade (Online / Offline)](#41-status-de-disponibilidade-online--offline)
   - [4.2 Fila de Chamados em Tempo Real](#42-fila-de-chamados-em-tempo-real)
   - [4.3 Aceite com Trava de Concorrência](#43-aceite-com-trava-de-concorrência)
5. [A Sala Imersiva de Pair Programming (`/room/[id]`)](#5-a-sala-imersiva-de-pair-programming-roomid)
   - [5.1 Privacidade e Controles de Mídia (Câmera & Microfone)](#51-privacidade-e-controles-de-mídia-câmera--microfone)
   - [5.2 Workspace Multi-Arquivo com Abas](#52-workspace-multi-arquivo-com-abas)
   - [5.3 Histórico de Edição e Atalhos de Teclado](#53-histórico-de-edição-e-atalhos-de-teclado)
   - [5.4 Salvamento Automático Inteligente (Auto-Save)](#54-salvamento-automático-inteligente-auto-save)
   - [5.5 Chat ao Vivo P2P](#55-chat-ao-vivo-p2p)
   - [5.6 Compartilhamento de Tela (Screen Share)](#56-compartilhamento-de-tela-screen-share)
6. [Encerramento de Chamada e Liquidação Financeira](#6-encerramento-de-chamada-e-liquidação-financeira)
   - [6.1 Modal Personalizado de Resumo](#61-modal-personalizado-de-resumo)
   - [6.2 Cálculo da Sessão e Divisão de Valores](#62-cálculo-da-sessão-e-divisão-de-valores)
   - [6.3 Avaliação e Feedback por Estrelas](#63-avaliação-e-feedback-por-estrelas)
7. [Perguntas Frequentes (FAQ) & Dicas de Resolução](#7-perguntas-frequentes-faq--dicas-de-resolução)

---

## 1. Visão Geral e Arquitetura de Papéis

O **Unblock.dev** funciona com dois tipos de perfis:

| Papel | Responsabilidades | Modelo Financeiro |
| :--- | :--- | :--- |
| **Desenvolvedor (Client)** | Abre chamados SOS quando trava em bugs, recarrega créditos via Pix/Cartão, edita código ao vivo e avalia mentores. | Pagamento por minuto ativo de mentoria. |
| **Mentor Especialista** | Fica disponível online, aceita chamados da sua stack (Go, React, Docker, SQL, etc.), guia o dev na solução e recebe transferências na carteira. | Recebe 80% do valor da sessão (20% taxa de plataforma). |

---

## 2. Acesso à Aplicação e Cadastro

1. Abra o navegador no endereço `http://localhost:3001` (ou a URL de produção configurada).
2. Na barra de navegação superior, clique em **Entrar** (`/login`) ou **Criar Conta** (`/register`).
3. Ao cadastrar-se:
   - Escolha o tipo de conta: **Desenvolvedor** ou **Mentor**.
   - Se escolher **Mentor**, defina sua **taxa por minuto em R$** (ex: `R$ 3,50/min`) e adicione suas principais tecnologias/skills.
4. Após o registro ou login, você receberá um token JWT seguro e será direcionado automaticamente ao `/dashboard`.

---

## 3. Jornada do Desenvolvedor (Cliente)

### 3.1 Recarga e Gestão de Carteira
Antes de abrir um chamado, o desenvolvedor precisa ter saldo suficiente para cobrir no mínimo 3 minutos de mentoria:
1. Acesse o menu **Carteira** (`/wallet`) no cabeçalho.
2. Escolha um dos pacotes de crédito disponíveis:
   - **Pacote Starter:** R$ 30,00 (~12 minutos).
   - **Pacote Pro:** R$ 60,00 (~24 minutos).
   - **Pacote Senior:** R$ 150,00 (~60 minutos).
3. Selecione a opção desejada e confirme o pagamento instantâneo via **PIX**.
4. O saldo é creditado imediatamente na carteira digital e sincronizado no cabeçalho.
5. Na parte inferior da página, você pode auditar todo o histórico de depósitos e débitos no extrato imutável.

### 3.2 Abertura de Chamado SOS
1. No painel inicial (`/dashboard`), clique no botão vermelho **"Abrir Chamado SOS"** ou acesse `/request`.
2. Preencha os detalhes do problema:
   - **Título do Chamado:** Exemplo: *"Deadlock em canais concorrentes no Go"*.
   - **Tecnologias / Stack:** Exemplo: `Go, Concurrency, Goroutines`.
   - **Descrição do Erro:** Explique o comportamento esperado versus o comportamento atual, mensagens de erro do terminal ou trecho do código que travou.
   - **Taxa Máxima Oferecida (R$/min):** Exemplo: `R$ 4,00/min`.
3. Clique em **"Disparar Chamado SOS Agora"**.

### 3.3 Aguardando o Mentor
- O chamado entra na fila em tempo real e um radar animado sinaliza que os mentores online foram alertados.
- Assim que um mentor especialista aceitar o chamado:
  - Uma notificação WebSocket imediata é disparada para o seu navegador.
  - Como camada de resiliência, existe um polling secundário a cada 1,5 segundos.
  - Você é automaticamente redirecionado para a sala imersiva `/room/[id]`.

---

## 4. Jornada do Mentor

### 4.1 Status de Disponibilidade (Online / Offline)
1. Ao fazer login com perfil de mentor, o painel exibe o **Painel de Mentoria ao Vivo**.
2. No canto superior direito, há o botão de alternância:
   - **ONLINE NA FILA (RECEBENDO):** Cor verde pulsante. O mentor recebe notificações sonoras e visuais instantâneas de novos chamados.
   - **OFFLINE (PAUSADO):** Pausa o recebimento de novos chamados quando o mentor estiver ausente ou em pausa.
3. O status é salvo em tempo real no banco MongoDB através do endpoint `PUT /api/auth/mentor/online`.

### 4.2 Fila de Chamados em Tempo Real
- A seção **"Fila de Chamados SOS em Tempo Real"** atualiza-se automaticamente via WebSocket a cada novo pedido aberto por desenvolvedores.
- Cada cartão exibe o nome do desenvolvedor, stack técnica, tempo decorrido desde a abertura e o valor por minuto oferecido.

### 4.3 Aceite com Trava de Concorrência
- Ao encontrar um chamado da sua especialidade, clique em **"Aceitar Chamado"**.
- O sistema utiliza uma trava distribuída atômica (`SETNX` no Redis):
  - O primeiro mentor a clicar adquire o chamado com exclusividade.
  - Se outro mentor tentar clicar na mesma fração de segundo, receberá um aviso amigável de que o chamado já foi atendido.
- O mentor é imediatamente redirecionado para a sala de pairing `/room/[id]`.

---

## 5. A Sala Imersiva de Pair Programming (`/room/[id]`)

A sala colaborativa é o núcleo da experiência do Unblock.dev. Ela divide a interface em duas grandes áreas:
- **Painel Lateral Esquerdo (4 colunas):** Vídeo WebRTC (Mentor + Aluno), controles de mídia e chat ao vivo.
- **Área Central e Direita (8 colunas):** Workspace multi-arquivo, abas, editor de código e barra de status.

### 5.1 Privacidade e Controles de Mídia (Câmera & Microfone)
- **Privacidade por Padrão:** Ao entrar na sala, sua câmera e microfone começam **desligados/mutados** por segurança e conforto.
- **Banner de Ativação:** No topo da coluna de vídeo, um banner informativo destaca:
  - Botão **"Ligar Mic"**: Habilita o áudio via LiveKit WebRTC.
  - Botão **"Ligar Câmera"**: Inicia a transmissão de vídeo HD.
- **Barra de Acesso Rápido:** Abaixo dos vídeos, você encontra botões dedicados para mutar/desmutar e ligar/desligar o vídeo a qualquer momento.

### 5.2 Workspace Multi-Arquivo com Abas
- O editor suporta múltiplos arquivos simultâneos (ex: `main.go`, `handler.go`, `README.md`).
- Para alternar entre arquivos, clique na aba desejada.
- Para criar um novo arquivo, clique no botão **`+ Novo`**, digite o nome do arquivo (ex: `service.go`) e pressione **OK**. O arquivo é criado e compartilhado instantaneamente com o par via WebSocket.
- Para excluir um arquivo desnecessário, passe o mouse sobre a aba e clique no ícone da lixeira (o sistema exige a confirmação via modal personalizado).

### 5.3 Histórico de Edição e Atalhos de Teclado
O editor possui integração completa com atalhos de produtividade:
- **`Ctrl + S` / `Cmd + S`**: Salva o workspace imediatamente no banco MongoDB.
- **`Ctrl + Z` / `Cmd + Z`**: Desfaz a última alteração (Undo) com pilha de histórico por arquivo.
- **`Ctrl + Y` / `Cmd + Shift + Z`**: Refaz a alteração desfeita (Redo).

### 5.4 Salvamento Automático Inteligente (Auto-Save)
- Além do atalho manual, a sala possui um mecanismo de **Debounced Auto-Save** de 1 segundo:
  - Enquanto você digita, o indicador no cabeçalho exibe `"salvando..."`.
  - 1 segundo após a última tecla digitada, o código é persistido no MongoDB e o indicador muda para `"código salvo (agora)"` na cor verde.

### 5.5 Chat ao Vivo P2P
- Localizado abaixo dos feeds de vídeo.
- Permite trocar links, mensagens de erro longas, comandos de terminal e snippets.
- Cada mensagem possui identificador único (UUID), garantindo que mensagens locais nunca apareçam duplicadas.

### 5.6 Compartilhamento de Tela (Screen Share)
- Clique no botão **"Compartilhar Tela"** na barra de mídia para transmitir seu ambiente local, terminal ou navegador para o mentor.

---

## 6. Encerramento de Chamada e Liquidação Financeira

### 6.1 Modal Personalizado de Resumo
Quando o problema for resolvido:
1. Qualquer um dos participantes pode clicar no botão vermelho **"Encerrar Sessão"** no canto superior direito.
2. O sistema exibe o **CustomModal** escuro com o resumo da chamada:
   - Tempo total decorrido da sessão.
   - Valor acumulado em R$ com base no minuto ativo.
3. Clique em **"Encerrar e Liquidar"** para confirmar.

### 6.2 Cálculo da Sessão e Divisão de Valores
- O backend Go finaliza a sessão através de uma transação multi-documento **MongoDB ACID**:
  - O valor proporcional é debitado da carteira do desenvolvedor.
  - **80% do valor** é creditado diretamente na carteira do mentor.
  - **20%** é retido como comissão da plataforma.
  - Um registro de transação imutável é adicionado ao histórico financeiro de ambos.

### 6.3 Avaliação e Feedback por Estrelas
- Imediatamente após o encerramento, o desenvolvedor vê a tela de avaliação por estrelas (1 a 5 estrelas).
- É possível deixar um comentário descrevendo a experiência (ex: *"Mentor resolveu meu deadlock em 10 minutos com maestria!"*).
- A nota fica vinculada ao perfil público do mentor para futuros chamados.

---

## 7. Perguntas Frequentes (FAQ) & Dicas de Resolução

### O que acontece se o saldo do desenvolvedor zerar durante a chamada?
O `TickerEngine` do backend monitora o saldo em tempo real a cada 5 segundos no Redis. Se o saldo for totalmente consumido, o sistema emite avisos de saldo baixo e encerra a sala graciosamente, salvando o código existente e liquidando os minutos consumidos até aquele instante.

### Os alertas do sistema travam a tela do navegador?
Não. Todos os diálogos utilizam o componente `CustomModal` (dark glassmorphism com animações Tailwind). Nenhum `window.alert()` ou `window.confirm()` nativo é utilizado.

### É possível convidar outra pessoa para a sala?
Sim. No cabeçalho da sala `/room/[id]`, há o botão **"Copiar Link"** que copia a URL direta da sala para a área de transferência com feedback visual instantâneo.

---

*Documentação atualizada em conformidade com a arquitetura Go v1.24, LiveKit WebRTC e Next.js 16 do Unblock.dev.*
