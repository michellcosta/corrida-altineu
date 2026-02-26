# 🧭 Guia de Navegação - Corrida de Macuco

Mapa completo de todas as páginas e funcionalidades do sistema.

---

## 🌐 SITE PÚBLICO

### 🏠 Página Inicial
```
URL: http://localhost:3000
```

**O que você verá:**
- 🎬 Hero com vídeo e badge "Inscrições Abertas - 2026"
- ⏰ Contagem regressiva para 24/06/2026
- 🎯 4 Cards de categorias com preços
- 📜 Timeline de 51 anos de história
- 💬 Depoimentos de atletas
- 📰 Últimas notícias
- 🤝 Patrocinadores
- 📢 CTA final "Inscrever-se"

---

### 🏃 Categorias

#### Geral 10K
```
URL: http://localhost:3000/prova-10k

Conteúdo:
├─ Valores e lotes (R$ 20)
├─ Premiação detalhada (R$ 10.000)
├─ Kit incluído
├─ Regulamento
└─ CTA "Inscrever-se na 10K"
```

#### Infantil 2K
```
URL: http://localhost:3000/prova-kids

Conteúdo:
├─ GRATUITO destacado
├─ Regras de idade (até 14 anos)
├─ Benefícios para crianças
├─ Kit kids
├─ Programação especial
├─ Informações para pais
└─ CTA "Inscrever Meu Filho"
```

---

### 📍 Informações

#### Percursos
```
URL: http://localhost:3000/percursos

Conteúdo:
├─ Tabs: 10K / 2K / Kids
├─ Mapa interativo (placeholder)
├─ Altimetria
├─ Postos de hidratação
├─ Logística (estacionamento, transporte)
└─ Download GPX/KML
```

#### Premiações
```
URL: http://localhost:3000/premiacoes

Conteúdo:
├─ Tabs por categoria
├─ Tabelas responsivas
├─ Geral masculino/feminino
├─ Faixas etárias (10K)
├─ Atleta local
└─ Informações importantes
```

#### Programação
```
URL: http://localhost:3000/programacao

Conteúdo:
├─ Sexta-feira (retirada kits)
├─ Sábado (dia da prova)
├─ Horários detalhados
├─ Informações de hospedagem
└─ Restaurantes parceiros
```

#### Guia do Atleta
```
URL: http://localhost:3000/guia-atleta

Conteúdo:
├─ Documentação necessária
├─ Preparação para prova
├─ Checklist do dia
├─ Hospedagem
├─ Alimentação
├─ Política de cancelamento
├─ Recomendações médicas
└─ FAQ (8 perguntas)
```

#### Resultados
```
URL: http://localhost:3000/resultados

Funcionalidades:
├─ Busca por nome/número
├─ Filtros (categoria, sexo)
├─ Tabela de resultados
├─ Download certificado
├─ Exportar PDF/Excel
└─ Estatísticas da prova
```

#### Contato
```
URL: http://localhost:3000/contato

Conteúdo:
├─ Informações de contato
├─ Email, telefone, WhatsApp
├─ Redes sociais
├─ Formulário de mensagem
├─ Mapa (placeholder)
└─ Horário de atendimento
```

---

### ✍️ Sistema de Inscrição

```
URL: http://localhost:3000/inscricao

Fluxo:
Step 1 → Escolher Categoria
  ├─ Card Geral 10K (R$ 20)
  ├─ Card Morador 10K (Grátis)
  ├─ Card 60+ 10K (Grátis)
  └─ Card Infantil 2K (Grátis)

Step 2 → Dados Pessoais
  ├─ Nome completo
  ├─ CPF / RG / Passaporte
  ├─ Data de nascimento (validação)
  ├─ Sexo
  ├─ Email
  ├─ WhatsApp
  ├─ Equipe
  ├─ Tamanho camiseta
  └─ Aceite de termos

Step 3 → Pagamento
  ├─ PIX (só Geral)
  ├─ Cartão (só Geral)
  ├─ Boleto (só Geral)
  └─ Grátis (demais)

Step 4 → Confirmação
  ├─ QR Code
  ├─ Próximos passos
  └─ Links úteis
```

---

## 🔐 PAINEL ADMINISTRATIVO

### 🔑 Login
```
URL: http://localhost:3000/admin/login

Credenciais de Teste:
┌─────────────────────────────────────────┐
│ Site Admin (Controle Total)            │
│ Email: admin@corridamacuco.com.br       │
│ Senha: admin123                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Chip Admin (Cronometragem)              │
│ Email: chip@corridamacuco.com.br        │
│ Senha: admin123                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Org Admin (Relatórios)                  │
│ Email: org@corridamacuco.com.br         │
│ Senha: admin123                         │
└─────────────────────────────────────────┘
```

---

### 👑 SITE ADMIN

#### Dashboard Principal
```
URL: http://localhost:3000/admin/site

Visualize:
├─ Welcome banner
├─ 4 cards de estatísticas
├─ Atividades recentes
├─ Ações rápidas
└─ Performance de conteúdo
```

#### Configurações do Evento ⭐ IMPORTANTE
```
URL: http://localhost:3000/admin/site/settings/event

Edite:
✏️ Ano da Prova: 2026
✏️ Edição: 51ª
✏️ Data: 24/06/2026
✏️ Horários de largada
✏️ Vagas por categoria:
   - Geral: 500
   - Morador: 200
   - 60+: 100
   - Infantil: 300
✏️ Valor Geral: R$ 20,00
✏️ Status inscrições

📊 Visualize:
- Regras de idade (calculadas automaticamente)
- Data de corte: 31/12/2026
- Preview das configurações
```

**Navegação Sidebar**:
- Dashboard
- Conteúdo
  - Páginas
  - Seções
  - Posts
  - Mídia
- Configurações
  - Evento ⭐
  - Lotes
  - Templates
  - SEO
- Regulamentos
- Usuários
- Analytics
- Logs

---

### ⏱️ CHIP ADMIN

#### Dashboard
```
URL: http://localhost:3000/admin/chip

Visualize:
├─ Estatísticas de inscritos
├─ Distribuição por categoria
├─ Alertas e pendências
└─ Ações rápidas
```

**Navegação Sidebar**:
- Dashboard
- Inscritos
- Exportações
- Numeração
- Check-in
- Resultados
- Alertas (badge: 5)

---

### 📊 ORG ADMIN

#### Dashboard
```
URL: http://localhost:3000/admin/org

Visualize:
├─ Métricas gerais
├─ Distribuição por idade/sexo
├─ Principais cidades
├─ Status de pagamentos
├─ Status de documentos
└─ Relatórios disponíveis

⚠️ Aviso de "Somente Leitura"
❌ SEM botões de edição
```

**Navegação Sidebar**:
- Dashboard
- Relatórios
- Mensagens

---

## 🎯 Pontos de Atenção

### ⚠️ Validação de Idade

**Infantil Bloqueado:**
```
Nasceu em 2011?
→ Faz 15 anos em 2026
→ ❌ BLOQUEADO no Infantil
→ Mensagem: "Inscreva-se no Geral 10K"
```

**60+ Aceito:**
```
Nasceu em 1966?
→ Completa 60 em 2026
→ ✅ VÁLIDO para 60+
```

### 📝 Documentos por Categoria

```
Geral:    Nenhum upload
Morador:  Comprovante + Foto
60+:      Foto obrigatória
Infantil: Autorização + RG responsável
```

### 💰 Pagamento

```
Geral:    R$ 20,00 (PIX/Cartão/Boleto)
Morador:  Gratuito
60+:      Gratuito  
Infantil: Gratuito
```

---

## 🔍 Como Explorar

### 1️⃣ Teste o Site Público (5 min)
```
1. Abra http://localhost:3000
2. Navegue por todas as seções da home
3. Clique nos cards das categorias
4. Veja as páginas: Percursos, Premiações, Guia
5. Teste o wizard de inscrição
6. Experimente o formulário de contato
```

### 2️⃣ Teste o Painel Admin (10 min)
```
1. Abra http://localhost:3000/admin/login
2. Faça login com admin@corridamacuco.com.br
3. Explore o dashboard do Site Admin
4. Vá em Configurações > Evento
5. Altere o ano de 2026 para 2027
6. Veja as regras atualizarem automaticamente
7. Faça logout
8. Faça login com chip@corridamacuco.com.br
9. Veja o dashboard do Chip Admin
10. Repita com org@corridamacuco.com.br
```

### 3️⃣ Teste Responsividade (2 min)
```
1. Abra as ferramentas de desenvolvedor (F12)
2. Ative o modo responsivo
3. Teste em tamanhos:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1440px
4. Navegue pelo menu mobile
```

---

## 📚 Leitura Recomendada

### Para Começar
1. **QUICKSTART.md** ← Comece aqui! 🎯
2. **PROJECT_SUMMARY.md** ← Resumo executivo
3. **CATEGORIES.md** ← Entenda as 4 categorias

### Para Desenvolver
4. **ARCHITECTURE.md** ← Arquitetura completa
5. **BACKEND.md** ← Especificação da API
6. **CONTRIBUTING.md** ← Como contribuir

### Para Deploy
7. **DEPLOY.md** ← Guias de deploy
8. **.env.example** ← Variáveis necessárias

---

## 🎊 Checklist de Funcionalidades

### Site Público
- [x] Landing page moderna
- [x] 9 páginas institucionais
- [x] Sistema de inscrição
- [x] Design responsivo
- [x] Animações suaves
- [x] SEO otimizado

### Categorias
- [x] Geral 10K (R$ 20)
- [x] Morador 10K (Grátis)
- [x] 60+ 10K (Grátis)
- [x] Infantil 2K (Grátis)

### Validações
- [x] Idade por categoria
- [x] Bloqueio Infantil (15 anos)
- [x] CPF válido
- [x] WhatsApp brasileiro
- [x] Documentos por categoria

### Painel Admin
- [x] Login com 3 roles
- [x] RBAC implementado
- [x] 3 dashboards diferentes
- [x] Configurações editáveis
- [x] Ano da prova dinâmico

### Documentação
- [x] 8 arquivos .md completos
- [x] Schema do banco
- [x] Especificação da API
- [x] Guias de deploy

---

## ✨ Funcionalidades Premium

### Implementadas
- ✅ Contagem regressiva em tempo real
- ✅ Validação de idade baseada em ano
- ✅ Sugestão automática de categoria
- ✅ Wizard com progress bar
- ✅ Cards interativos com hover
- ✅ Timeline histórica
- ✅ Depoimentos com carrossel
- ✅ FAQ com accordion
- ✅ Filtros em resultados
- ✅ Múltiplos dashboards admin
- ✅ Sidebar dinâmica por role

### Planejadas (Backend)
- ⏳ Upload real de documentos (S3)
- ⏳ Pagamento com Mercado Pago
- ⏳ Email transacional (SendGrid)
- ⏳ WhatsApp API (Twilio)
- ⏳ Geração de certificados (PDF)
- ⏳ Resultados em tempo real
- ⏳ Audit log completo
- ⏳ Exportações avançadas

---

## 🎯 Use Cases Principais

### 1. Atleta se inscrevendo no Geral
```
1. Acessa /inscricao
2. Clica em "Geral 10K - R$ 20"
3. Preenche dados pessoais
4. Sistema valida: nasceu em 2000 → 26 anos em 2026 ✅
5. Escolhe PIX como pagamento
6. Paga R$ 20
7. Recebe QR Code
8. Status: confirmed
```

### 2. Criança tentando Infantil (bloqueio)
```
1. Responsável acessa /inscricao
2. Clica em "Infantil 2K - Grátis"
3. Preenche nascimento: 15/03/2011
4. Sistema calcula: 15 anos em 2026 ❌
5. Mostra: "Você completa 15 anos em 2026"
6. Sugere: "Inscreva-se no Geral 10K"
7. Bloqueia continuar no Infantil
```

### 3. Morador de Macuco (upload)
```
1. Atleta escolhe "Morador 10K"
2. Preenche dados + endereço
3. Valida idade ✅
4. Faz upload de:
   - Conta de luz (comprovante)
   - RG com foto
5. Status: validating
6. Admin revisa e aprova
7. Atleta recebe notificação
8. Status: confirmed
```

### 4. Admin editando ano da prova
```
1. Login como Site Admin
2. Vai em Configurações > Evento
3. Muda ano: 2026 → 2027
4. Sistema atualiza:
   ✅ Data corte: 31/12/2027
   ✅ Geral: nascidos em 2012 ou antes
   ✅ Infantil: bloqueia nascidos em 2012
   ✅ 60+: nascidos em 1967 ou antes
5. Clica "Salvar"
6. Site público atualiza automaticamente
```

---

## 🎨 Elementos Visuais

### Cores por Categoria
```
Geral:    Azul (#0284c7)
Morador:  Verde (#10b981)
60+:      Roxo (#9333ea)
Infantil: Amarelo (#f59e0b)
```

### Badges
```
"Mais Popular"  → Geral
"Gratuito"      → Morador, 60+, Infantil
"Família"       → Infantil
```

### Status
```
✅ Confirmado     → Verde
⏳ Pendente       → Amarelo
🔍 Validando      → Azul
❌ Cancelado      → Vermelho
```

---

## 📱 Responsividade

### Breakpoints
```
Mobile:  < 768px
Tablet:  768px - 1024px
Desktop: > 1024px
```

### Menu Mobile
```
Hamburguer (☰) aparece em < 1024px
Sidebar admin: colapsa em mobile
Cards: 1 coluna em mobile, 4 em desktop
Tabelas: scroll horizontal em mobile
```

---

## 🎬 Demonstração Rápida

### Fluxo Completo (3 minutos)
```
1. Home → Role até categorias
2. Clique "Geral 10K"
3. Veja detalhes e premiação
4. Clique "Inscrever-se"
5. Escolha categoria no wizard
6. Preencha dados (use data 2000-01-01)
7. Veja validação passar ✅
8. Simule pagamento
9. Veja confirmação com QR Code
10. Volte à home
11. Vá para /admin/login
12. Faça login com admin@corridamacuco.com.br
13. Explore o dashboard
14. Vá em Configurações > Evento
15. Altere algum valor
16. Veja preview atualizar
```

---

## 🔗 Links Rápidos

### Desenvolvimento
- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login
- API: http://localhost:4000 (quando backend)

### Documentação
- Categorias: `CATEGORIES.md`
- Backend: `BACKEND.md`
- Deploy: `DEPLOY.md`
- Arquitetura: `ARCHITECTURE.md`

### Suporte
- Email: contato@corridamacuco.com.br
- WhatsApp: (22) 99999-9999

---

**Aproveite a navegação! 🎉**

Qualquer dúvida, consulte a documentação ou os arquivos de código-fonte.








