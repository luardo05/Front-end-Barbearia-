# Web App da Barbearia - Frontend

Este diretório contém todo o código-fonte da interface do usuário (frontend) para o sistema de agendamento e gerenciamento da barbearia. A aplicação é dividida em duas áreas principais: um portal para **Clientes** e um painel de controle para **Administradores**.

O projeto foi construído com HTML, CSS e JavaScript puros ("Vanilla JS"), utilizando uma arquitetura modular para facilitar a manutenção e a escalabilidade.

## ✨ Funcionalidades Principais

### Portal do Cliente
- **Visualização de Serviços:** Cards responsivos com imagens, nomes e preços dos serviços oferecidos.
- **Autenticação:** Telas de login e registro de novos clientes.
- **Agendamento Dinâmico:** Um fluxo guiado por modal que permite ao cliente:
  - Visualizar um calendário com os dias disponíveis.
  - Selecionar um dia e ver os horários vagos em tempo real.
  - Ver o preço final do serviço, incluindo descontos de aniversário.
- **Perfil do Usuário:** Uma página onde o cliente pode:
  - Visualizar e editar suas informações pessoais (nome, senha).
  - Atualizar sua foto de perfil.
  - Ver seu histórico de agendamentos.
  - Cancelar agendamentos futuros.
- **Centro de Notificações:** Uma página dedicada para visualizar o histórico de notificações (agendamentos confirmados, cancelados, lembretes, etc.).
- **Notificações em Tempo Real:** Alertas visuais (toasts) para atualizações importantes, como a confirmação de um agendamento.

### Painel do Administrador
- **Dashboard Analítico:**
  - Cards com resumos de faturamento (líquido, bruto, estornos), taxas e contagem de agendamentos.
  - Filtros para análise por período (diário, semanal, mensal).
  - Gráficos responsivos de faturamento e volume de agendamentos por dia.
- **Gerenciamento de Disponibilidade:**
  - Um calendário interativo onde o administrador pode marcar dias como disponíveis ou indisponíveis.
  - Interface para editar os intervalos de horário de trabalho de cada dia.
- **Gerenciamento de Agendamentos:**
  - Lista paginada de todos os agendamentos (passados e futuros).
  - Funcionalidade para alterar o status de um agendamento (confirmar, concluir, cancelar).
  - Formulário para criar agendamentos manualmente em nome de clientes.
- **Gerenciamento de Serviços (CRUD):** Interface completa para criar, visualizar, atualizar e deletar serviços, incluindo upload de imagens.
- **Gerenciamento de Usuários (CRUD):** Lista paginada de todos os usuários com a capacidade de criar, editar e deletar contas.
- **Notificações em Tempo Real:** Alertas visuais para novas ações de clientes (novos agendamentos, cancelamentos).

## 🚀 Como Executar Localmente

Para testar e desenvolver o frontend, você precisará de um servidor de desenvolvimento local para servir os arquivos HTML e evitar erros de CORS com os módulos JavaScript.

1.  **Pré-requisitos:**
    *   Ter o [Node.js](https://nodejs.org/) instalado (opcional, mas recomendado para ferramentas).
    *   Ter o [Visual Studio Code](https://code.visualstudio.com/) com a extensão **Live Server** de Ritwick Dey.

2.  **Executando com o Live Server:**
    *   Abra a pasta raiz do projeto (`cabelereiro-app/`) no VS Code.
    *   Navegue até o arquivo `frontend/login.html`.
    *   Clique com o botão direito no arquivo e selecione **"Open with Live Server"**.
    *   Seu navegador abrirá automaticamente no endereço `http://127.0.0.1:5500/frontend/login.html` (ou uma porta similar).

3.  **Conexão com o Backend:**
    *   Certifique-se de que o servidor backend esteja rodando (geralmente na porta `3000`).
    *   No arquivo `frontend/assets/js/services/api.js`, verifique se a constante `BASE_URL` está apontando para o endereço correto do seu backend:
      ```javascript
      const BASE_URL = 'http://localhost:3000/api/v1';
      ```

## 📂 Estrutura de Arquivos

```
frontend/
├── 📄 index.html
├── 📄 register.html
├── 📁 admin/                # Páginas e scripts exclusivos do painel de administração
│   ├── 📄 home.html        (Dashboard)
│   ├── 📄 gerenciar-agendamentos.html
│   └── 📁 js/
│       ├── 📄 dashboard.js
│       └── ...
├── 📁 client/                # Páginas e scripts exclusivos do portal do cliente
│   ├── 📄 home.html         (Serviços)
│   ├── 📄 agendamento.html
│   └── 📁 js/
│       ├── 📄 home.js
│       └── ...
└── 📁 assets/                 # Recursos compartilhados
    ├── 📁 css/
    │   ├── 📄 base.css
    │   └── 📁 components/
    │       └── 📄 menu.css
    ├── 📁 js/
    │   ├── 📄 main.js        (Scripts globais, como o listener de socket)
    │   └── 📁 services/
    │       ├── 📄 api.js     (Central de comunicação com o backend)
    │       └── 📄 socket-client.js
    └── 📁 img/                # Imagens estáticas (logos, etc.)
```
