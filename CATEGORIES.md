# Categorias da Corrida de Macuco - 2026

Este documento descreve as 4 categorias oficiais da 51ª Corrida Rústica de Macuco.

## 📅 Informações Gerais

- **Ano da Prova**: 2026
- **Data**: 24 de Junho de 2026
- **Edição**: 51ª
- **Data de Corte de Idade**: 31 de Dezembro de 2026

> **Importante**: Todas as idades são calculadas com base no último dia do ano da prova (31/12/2026), não na data específica da corrida.

---

## 🏃 1. Geral 10K

### Informações Básicas
- **Distância**: 10 quilômetros
- **Valor**: R$ 22,00
- **Vagas**: 500

### Elegibilidade
- **Regra de Idade**: Quem completa 15 anos até 31/12/2026
- **Cálculo**: Se `ano_nascimento <= (2026 - 15) = 2011` → **VÁLIDO**
- **Mínimo**: 15 anos
- **Máximo**: Sem limite

### Documentação Necessária
- ✅ RG **OU** CPF **OU** Passaporte (qualquer um é válido)
- ✅ Nome da Equipe
- ✅ Número de WhatsApp
- ✅ Sexo
- ✅ Data de Nascimento

### Observações
- Categoria paga (única categoria com valor)
- Não requer documentos adicionais além dos básicos
- Participantes que fazem 15 anos em 2026 podem se inscrever

---

## 🏘️ 2. Morador de Macuco 10K

### Informações Básicas
- **Distância**: 10 quilômetros
- **Valor**: **GRATUITO** 🎁
- **Vagas**: 200

### Elegibilidade
- **Regra de Idade**: Mesma do Geral 10K (15 anos até 31/12/2026)
- **Residência**: Deve comprovar que mora em Macuco/RJ

### Documentação Necessária
- ✅ RG **OU** CPF **OU** Passaporte
- ✅ **Comprovante de residência** em Macuco (obrigatório)
  - Conta de luz, água, telefone, etc
  - Deve estar em nome do atleta ou responsável
- ✅ Documento com foto
- ✅ Nome da Equipe
- ✅ Número de WhatsApp
- ✅ Sexo
- ✅ Data de Nascimento

### Observações
- **Categoria gratuita** exclusiva para moradores
- Validação manual do comprovante de residência
- Upload do documento obrigatório durante inscrição

---

## 👴👵 3. 60+ 10K

### Informações Básicas
- **Distância**: 10 quilômetros
- **Valor**: **GRATUITO** 🎁
- **Vagas**: 100

### Elegibilidade
- **Regra de Idade**: 60 anos ou mais até 31/12/2026
- **Cálculo**: Se `ano_nascimento <= (2026 - 60) = 1966` → **VÁLIDO**
- **Mínimo**: 60 anos
- **Máximo**: Sem limite

### Documentação Necessária
- ✅ RG **OU** CPF **OU** Passaporte
- ✅ **Documento com foto** (obrigatório)
- ✅ Atestado médico (recomendado, não obrigatório)
- ✅ Nome da Equipe
- ✅ Número de WhatsApp
- ✅ Sexo
- ✅ Data de Nascimento

### Observações
- **Categoria gratuita**  para incentivar participação de idosos
- Recomenda-se atestado médico para segurança
- Mesma distância do Geral (10K)

---

## 👶 4. Infantil 2K

### Informações Básicas
- **Distância**: 2 quilômetros
- **Valor**: **GRATUITO** 🎁
- **Vagas**: 300

### Elegibilidade
- **Regra de Idade**: Até 14 anos completos em 2026
- **Bloqueio**: Quem faz **15 anos em 2026** é **BLOQUEADO**
- **Cálculo**: 
  - Se `ano_nascimento === (2026 - 15) = 2011` → **BLOQUEADO** (sugerir Geral)
  - Se `ano_nascimento >= 2012` → **VÁLIDO**
- **Mínimo**: 5 anos
- **Máximo**: 14 anos

### Documentação Necessária

**Da Criança:**
- ✅ Certidão de nascimento **OU** RG
- ✅ Nome da Equipe
- ✅ Número de WhatsApp (do responsável)
- ✅ Sexo
- ✅ Data de Nascimento

**Do Responsável:**
- ✅ **Autorização assinada** (obrigatório)
- ✅ RG do responsável
- ✅ Nome completo do responsável
- ✅ CPF do responsável
- ✅ Telefone de contato

### Observações
- **Categoria gratuita** para incentivar crianças
- **Bloqueio automático** para quem completa 15 anos em 2026
- Mensagem de sugestão: "Você completa 15 anos em 2026. Por favor, inscreva-se na categoria Geral 10K."
- Distância menor (2K) adequada para crianças
- Responsável deve estar presente no dia da prova

---

## 🔐 Validação de Idade - Lógica

### Função de Validação

```typescript
function validateAge(birthDate: Date, categoryId: CategoryId) {
  const birthYear = birthDate.getFullYear()
  const cutoffYear = 2026 // Ano da prova
  const ageAtYearEnd = cutoffYear - birthYear
  
  // Regras por categoria
  switch(categoryId) {
    case 'geral':
    case 'morador':
      if (ageAtYearEnd < 15) return { 
        valid: false, 
        message: "Você precisa completar 15 anos até 31/12/2026",
        suggestedCategory: 'infantil'
      }
      break
      
    case 'sessenta':
      if (ageAtYearEnd < 60) return {
        valid: false,
        message: "Você precisa ter 60 anos ou mais até 31/12/2026",
        suggestedCategory: 'geral'
      }
      break
      
    case 'infantil':
      if (ageAtYearEnd === 15) return {
        valid: false,
        message: "Você completa 15 anos em 2026. Por favor, inscreva-se na categoria Geral 10K.",
        suggestedCategory: 'geral'
      }
      if (ageAtYearEnd > 14) return {
        valid: false,
        message: "Idade acima do permitido para categoria Infantil.",
        suggestedCategory: 'geral'
      }
      if (ageAtYearEnd < 5) return {
        valid: false,
        message: "Idade mínima para categoria Infantil é 5 anos."
      }
      break
  }
  
  return { valid: true }
}
```

---

## 📊 Resumo

| Categoria | Distância | Valor | Idade | Vagas | Documentos Extras |
|-----------|-----------|-------|-------|-------|-------------------|
| **Geral 10K** | 10 km | R$ 22 | 15+ anos | 500 | Nenhum |
| **Morador 10K** | 10 km | Gratuito | 15+ anos | 200 | Comprovante residência |
| **60+ 10K** | 10 km | Gratuito | 60+ anos | 100 | Documento com foto |
| **Infantil 2K** | 2 km | Gratuito | 5-14 anos | 300 | Autorização responsável |

---

## 🎯 Campos Comuns do Formulário

Todos os atletas devem preencher:

1. **Identificação**
   - Nome Completo
   - Data de Nascimento
   - Sexo (M/F)
   - Documento (RG, CPF ou Passaporte)
   - Tipo do Documento

2. **Contato**
   - Email
   - WhatsApp (formato: (XX) 9XXXX-XXXX)

3. **Corrida**
   - Nome da Equipe (opcional mas recomendado)
   - Tamanho da Camiseta (PP, P, M, G, GG, XG)

4. **Termos**
   - Aceite dos Termos e Condições
   - Aceite de Uso de Imagem

---

## 🔄 Migração Automática

### Infantil → Geral

Quando uma criança que participou da categoria Infantil completa 15 anos no ano seguinte, o sistema deve:

1. **Bloquear** inscrição automática na Infantil
2. **Sugerir** categoria Geral 10K
3. **Manter** histórico de participações anteriores
4. **Oferecer** desconto ou cortesia (se aplicável)

---

## 🛠️ Painel do Admin

### Configurações Editáveis

O painel administrativo deve permitir editar:

```typescript
{
  anoProva: 2026,              // ← Editável
  dataProva: '2026-06-24',     // ← Editável
  dataCorteIdade: '2026-12-31', // Calculado automaticamente
  edicao: 51,                  // ← Editável
  
  // Vagas por categoria
  vagasGeral: 500,
  vagasMorador: 200,
  vagasSessenta: 100,
  vagasInfantil: 300,
  
  // Valores
  valorGeral: 22.00,           // ← Editável
  
  // Status
  inscricoesAbertas: true,
  dataAberturaInscricoes: '2025-12-01',
  dataEncerramentoInscricoes: '2026-06-20',
}
```

### Ao alterar o ano da prova:

- ✅ Atualiza automaticamente data de corte (31/12/ano)
- ✅ Recalcula todas as validações de idade
- ✅ Atualiza textos dinâmicos no site
- ✅ Mantém histórico de edições anteriores

---

## ❓ FAQ - Casos Específicos

### "Nasci em 2011. Posso me inscrever no Infantil?"
**NÃO.** Quem nasce em 2011 completa 15 anos em 2026, portanto deve se inscrever no Geral 10K.

### "Tenho 59 anos. Posso me inscrever no 60+?"
**NÃO.** Você deve completar 60 anos até 31/12/2026. Se fizer aniversário só em 2027, não é elegível.

### "Sou morador de Macuco. O que posso usar como comprovante?"
Qualquer documento oficial que comprove residência:
- Conta de luz, água, telefone
- Contrato de aluguel
- Declaração de residência
- IPTU

### "Posso me inscrever em mais de uma categoria?"
**NÃO.** Cada atleta pode se inscrever em apenas uma categoria por edição.

---

**Última atualização**: Janeiro de 2025  
**Versão do documento**: 1.0  
**Próxima revisão**: Após definição final com organização








