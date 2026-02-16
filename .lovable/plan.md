

## MoveAí — Plano de Exercícios com IA para Alívio de Dores

### Visão Geral
App em português (BR) com tradução automática para qualquer idioma via Google Translate. Usa IA para conversar com o usuário sobre dores/desconfortos e gerar planos semanais de exercícios personalizados a partir de um catálogo gerenciado pelo admin. Design clean e moderno.

---

### 1. Painel Administrativo (protegido por login admin)
- **Login do admin** (email/senha, com role de admin no banco)
- **CRUD de exercícios** com os campos:
  - Nome, imagem (upload), região do corpo (joelho, lombar, ombro, cervical, quadril, tornozelo, etc.)
  - Tipo (alongamento, fortalecimento, mobilidade, relaxamento)
  - Nível de dificuldade (iniciante, intermediário, avançado)
  - Equipamentos necessários (nenhum, faixa elástica, bola, halteres, etc.)
  - Passo a passo da execução, séries/repetições, duração estimada
  - Benefícios e contraindicações
- **Listagem com filtros** por região, tipo, dificuldade e equipamento
- **Dashboard simples** com contagem de exercícios por categoria

### 2. Frontend — Experiência do Usuário

#### 2.1 Página Inicial
- Explicação do app, disclaimer médico visível
- Botão para iniciar conversa com a IA
- Espaços reservados para anúncios (banners)
- **Widget Google Translate** para tradução automática em qualquer idioma

#### 2.2 Chat com IA
- Conversa interativa: o usuário relata sintomas/dores
- IA faz perguntas de acompanhamento (localização da dor, causa, duração, equipamentos, local de treino, tempo disponível, nível físico)
- Disclaimer antes de gerar o plano
- Acesso livre sem conta

#### 2.3 Plano de Exercícios Gerado
- Plano semanal organizado por dias
- Cada exercício: imagem, nome, séries/repetições, passo a passo
- Avisos de contraindicação, disclaimer de segurança
- Botão para salvar (requer login)

#### 2.4 Área do Usuário (login opcional)
- **Login com email OU login social (Google / Facebook)**
- Histórico de planos salvos
- Marcar exercícios como feitos (acompanhamento diário)
- Progresso da semana

### 3. Inteligência Artificial
- Conectada ao catálogo de exercícios do banco de dados
- Monta planos somente com exercícios cadastrados
- Considera região da dor, equipamentos, tempo, local e nível
- Tom acolhedor em português (tradução automática cuida do resto)

### 4. Tradução Automática
- Widget do Google Translate integrado no site
- Conteúdo cadastrado em português, traduzido automaticamente para o idioma que o visitante escolher
- Suporte a qualquer idioma sem esforço adicional

### 5. Espaço para Anúncios
- Áreas de banner na página inicial, chat e plano gerado
- Preparado para futura integração com AdSense ou anunciantes diretos

### 6. Infraestrutura
- **Backend:** Lovable Cloud (banco de dados, autenticação com email + Google + Facebook, storage para imagens)
- **IA:** Integração com IA para o chat inteligente
- **Roles:** Tabela separada de roles para controle de admin
- **Idioma base:** Português (BR) + Google Translate

