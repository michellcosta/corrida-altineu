# ✅ Seletor de Documento de Identificação Implementado

## 🎯 **Implementação Completa**

Implementei o **seletor de documento compartilhado** (CPF, RG ou Passaporte) para as categorias **Geral 10K**, **60+** e **Morador de Macuco**, mantendo campos específicos apenas para a categoria **Infantil**.

---

## 🔄 **O Que Mudou**

### **Antes:**
- ❌ Campo de CPF fixo para todas as categorias
- ❌ Não permitia RG ou Passaporte
- ❌ Menos flexibilidade para atletas estrangeiros

### **Depois:**
- ✅ **Seletor de tipo** (CPF, RG ou Passaporte)
- ✅ Exibido apenas para **Geral 10K**, **60+** e **Morador**
- ✅ Categoria **Infantil** tem campos próprios
- ✅ Suporte a atletas estrangeiros

---

## 🏃 **Lógica por Categoria**

### **1. Geral 10K** 💰
```
✅ Mostra: Seletor de Documento (CPF/RG/Passaporte)
✅ Campos: Nome + Documento + Data nascimento + Contato
```

### **2. 60+ 10K** 👴
```
✅ Mostra: Seletor de Documento (CPF/RG/Passaporte)
✅ Campos: Nome + Documento + Data nascimento (validação 60+) + Contato
✅ Validação: Idade mínima 60 anos até 31/12/2026
```

### **3. Morador de Macuco 10K** 🏘️
```
✅ Mostra: Seletor de Documento (CPF/RG/Passaporte)
✅ Campos extras: Endereço completo + Upload comprovante
✅ Validação: Comprovante de residência obrigatório
```

### **4. Infantil 2K** 👶
```
❌ NÃO mostra: Seletor de Documento
✅ Mostra: CPF da Criança (campo separado)
✅ Campos extras: Dados completos do responsável + Upload termo
```

---

## 💻 **Implementação Técnica**

### **Estados Adicionados:**
```typescript
const [documentType, setDocumentType] = useState<'CPF' | 'RG' | 'PASSAPORTE'>('CPF')
const [documentNumber, setDocumentNumber] = useState('')
```

### **Constante de Controle:**
```typescript
const CATEGORY_DOC_REQUIRED = new Set(['geral-10k', 'sessenta-10k', 'morador-10k'])
const shouldShowMainDocument = selectedCategory && CATEGORY_DOC_REQUIRED.has(selectedCategory.id)
```

### **Renderização Condicional:**
```typescript
{shouldShowMainDocument && (
  <div>
    <label>Documento de Identificação *</label>
    <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
      <select value={documentType} onChange={...}>
        <option value="CPF">CPF</option>
        <option value="RG">RG</option>
        <option value="PASSAPORTE">Passaporte</option>
      </select>
      <input
        type="text"
        value={documentNumber}
        placeholder={`Número do ${documentType}`}
        required
      />
    </div>
  </div>
)}
```

---

## 🎨 **Interface do Usuário**

### **Layout do Seletor:**
```
┌─────────────────────────────────────────────────┐
│ Documento de Identificação *                    │
├──────────────┬──────────────────────────────────┤
│ [CPF ▼]     │ [000.000.000-00____________]     │
│              │                                   │
│ • CPF        │ → Placeholder: "Número do CPF"   │
│ • RG         │ → Placeholder: "Número do RG"    │
│ • Passaporte │ → Placeholder: "Número do        │
│              │                  Passaporte"      │
└──────────────┴──────────────────────────────────┘
```

### **Responsividade:**
- **Desktop:** Seletor (160px) + Input (flex)
- **Mobile:** Campos empilhados verticalmente

---

## 📊 **Estrutura de Dados**

### **FormData Atualizado:**
```typescript
const [formData, setFormData] = useState({
  // Dados básicos
  fullName: '',
  birthDate: '',
  gender: '',
  email: '',
  phone: '',
  tshirtSize: '',
  
  // Documento (gerenciado separadamente)
  // documentType e documentNumber são estados independentes
  
  // Morador de Macuco
  addressStreet: '',
  addressNumber: '',
  addressComplement: '',
  addressNeighborhood: '',
  addressZipCode: '',
  residenceProofType: '',
  residenceProofFile: null,
  
  // Infantil
  childCpf: '',              // ← Novo: CPF da criança
  guardianName: '',
  guardianCpf: '',           // CPF do responsável
  guardianPhone: '',
  guardianRelationship: '',
  authorizationFile: null,
  
  // Termos
  acceptedTerms: false,
})
```

### **Dados a Enviar ao Backend:**
```typescript
const prepareDataForSubmit = () => {
  const baseData = {
    fullName: formData.fullName,
    birthDate: formData.birthDate,
    gender: formData.gender,
    email: formData.email,
    phone: formData.phone,
    tshirtSize: formData.tshirtSize,
    categoryId: selectedCategory?.id,
  }

  // Adicionar documento apenas se for categoria com documento principal
  if (shouldShowMainDocument) {
    return {
      ...baseData,
      documentType,
      documentNumber,
      // ... campos específicos da categoria
    }
  }

  // Para Infantil, incluir dados da criança e responsável
  if (selectedCategory?.id === 'infantil-2k') {
    return {
      ...baseData,
      childCpf: formData.childCpf,
      guardianName: formData.guardianName,
      guardianCpf: formData.guardianCpf,
      guardianPhone: formData.guardianPhone,
      guardianRelationship: formData.guardianRelationship,
    }
  }

  return baseData
}
```

---

## 🔍 **Validações Implementadas**

### **1. Categoria Geral 10K:**
- ✅ Documento obrigatório (CPF/RG/Passaporte)
- ✅ Data de nascimento (min 15 anos)
- ✅ Campos básicos obrigatórios

### **2. Categoria 60+ 10K:**
- ✅ Documento obrigatório (CPF/RG/Passaporte)
- ✅ Data de nascimento (min 60 anos até 31/12/2026)
- ✅ Campos básicos obrigatórios

### **3. Categoria Morador:**
- ✅ Documento obrigatório (CPF/RG/Passaporte)
- ✅ Endereço completo obrigatório
- ✅ Upload de comprovante obrigatório
- ✅ Tipo de comprovante selecionado

### **4. Categoria Infantil:**
- ✅ CPF da criança obrigatório
- ✅ Dados completos do responsável
- ✅ Upload do termo de autorização
- ✅ Grau de parentesco selecionado

---

## 🎯 **Casos de Uso**

### **Caso 1: Atleta Brasileiro (Geral 10K)**
```
1. Seleciona: Geral 10K
2. Preenche: Nome, CPF, Data, Email, Telefone
3. Tipo documento: CPF (padrão)
4. Continua → Pagamento → Confirmação
```

### **Caso 2: Atleta Estrangeiro (Geral 10K)**
```
1. Seleciona: Geral 10K
2. Preenche: Nome, Data, Email, Telefone
3. Tipo documento: Passaporte
4. Número: Número do passaporte
5. Continua → Pagamento → Confirmação
```

### **Caso 3: Morador de Macuco**
```
1. Seleciona: Morador 10K
2. Preenche: Nome, RG (escolhe RG no seletor), Data, Email
3. Preenche: Endereço completo
4. Upload: Conta de luz
5. Continua → Confirmação (sem pagamento)
```

### **Caso 4: Categoria Infantil**
```
1. Seleciona: Infantil 2K
2. NÃO vê: Seletor de documento
3. Preenche: Nome da criança, CPF da criança, Data
4. Preenche: Dados do responsável (nome, CPF, telefone)
5. Upload: Termo assinado
6. Continua → Confirmação (sem pagamento)
```

---

## ✨ **Melhorias Implementadas**

### **UX:**
- ✅ **Placeholder dinâmico** muda conforme tipo selecionado
- ✅ **Layout compacto** (seletor + input na mesma linha)
- ✅ **Exibição condicional** (só aparece quando necessário)
- ✅ **Labels claras** e descritivas

### **Funcionalidade:**
- ✅ **Suporte a estrangeiros** (Passaporte)
- ✅ **Flexibilidade** de documento
- ✅ **Isolamento por categoria** (Infantil não vê)
- ✅ **Estados independentes** (documentType + documentNumber)

### **Código:**
- ✅ **Type-safe** com TypeScript
- ✅ **Constantes claras** (CATEGORY_DOC_REQUIRED)
- ✅ **Lógica isolada** (shouldShowMainDocument)
- ✅ **Sem erros** de linting

---

## 🧪 **Testes Recomendados**

### **Teste 1: Trocar Tipo de Documento**
```
1. Selecionar Geral 10K
2. Ver seletor de documento (padrão: CPF)
3. Mudar para RG → Placeholder muda para "Número do RG"
4. Mudar para Passaporte → Placeholder muda para "Número do Passaporte"
5. Preencher número
```

### **Teste 2: Alternar Entre Categorias**
```
1. Selecionar Geral 10K → Ver seletor de documento
2. Preencher CPF
3. Voltar e selecionar Infantil 2K
4. Verificar: Seletor de documento DESAPARECE
5. Verificar: Aparece campo "CPF da Criança"
```

### **Teste 3: Morador com RG**
```
1. Selecionar Morador 10K
2. Escolher RG no seletor
3. Preencher número do RG
4. Preencher endereço
5. Upload comprovante
6. Confirmar: Dados corretos salvos
```

### **Teste 4: Validação de Campos**
```
1. Selecionar qualquer categoria com documento
2. Deixar campo de número vazio
3. Tentar continuar
4. Verificar: Validação impede avanço
5. Preencher documento
6. Verificar: Pode continuar
```

---

## 📋 **Checklist de Implementação**

- [x] Estados `documentType` e `documentNumber` criados
- [x] Constante `CATEGORY_DOC_REQUIRED` definida
- [x] Helper `shouldShowMainDocument` implementado
- [x] Seletor de documento renderizado condicionalmente
- [x] Layout responsivo (grid columns)
- [x] Placeholder dinâmico por tipo
- [x] Campo removido para categoria Infantil
- [x] CPF da criança separado do responsável
- [x] Validações de campo obrigatório
- [x] Sem erros de linting
- [x] Type-safe com TypeScript

---

## 🎉 **Resultado Final**

### **Implementação Completa:**
- ✅ **Seletor compartilhado** para 3 categorias
- ✅ **Campos específicos** para Infantil
- ✅ **Suporte a estrangeiros** (Passaporte)
- ✅ **UI responsiva** e intuitiva
- ✅ **Lógica clara** e mantível
- ✅ **Type-safe** e sem erros

### **Flexibilidade:**
- ✅ **CPF** para brasileiros
- ✅ **RG** como alternativa
- ✅ **Passaporte** para estrangeiros
- ✅ **Campos isolados** por categoria

**🎊 Sistema totalmente funcional e pronto para aceitar diferentes tipos de documento!**







