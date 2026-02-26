# Guia de Contribuição

Obrigado por considerar contribuir para a 51ª Corrida Rústica de Macuco! 🎉

## 📋 Como Contribuir

### 1. Fork e Clone

```bash
# Fork o projeto no GitHub
# Depois clone seu fork
git clone https://github.com/SEU-USUARIO/corrida-altineu.git
cd corrida-altineu
```

### 2. Configure o Ambiente

```bash
# Instale as dependências
npm install

# Copie o arquivo de exemplo de variáveis de ambiente
cp .env.example .env.local

# Execute o projeto
npm run dev
```

### 3. Crie uma Branch

```bash
# Use o padrão: feature/nome-da-feature ou fix/nome-do-bug
git checkout -b feature/nova-funcionalidade
```

### 4. Faça suas Alterações

- Escreva código limpo e comentado
- Siga os padrões de código do projeto
- Teste suas alterações
- Atualize a documentação se necessário

### 5. Commit e Push

```bash
# Adicione os arquivos
git add .

# Commit com mensagem descritiva
git commit -m "feat: adiciona nova funcionalidade X"

# Push para seu fork
git push origin feature/nova-funcionalidade
```

### 6. Abra um Pull Request

1. Acesse seu fork no GitHub
2. Clique em "Compare & pull request"
3. Preencha o template do PR
4. Aguarde a revisão

## 📝 Padrões de Código

### Convenção de Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nova funcionalidade
fix: correção de bug
docs: alterações na documentação
style: formatação, ponto-e-vírgula, etc
refactor: refatoração de código
test: adiciona ou modifica testes
chore: atualização de build, dependências, etc
```

**Exemplos:**

```bash
feat: adiciona página de resultados
fix: corrige bug no formulário de inscrição
docs: atualiza README com instruções de deploy
style: ajusta formatação do componente Header
refactor: reorganiza estrutura de pastas
test: adiciona testes para componente Card
chore: atualiza dependências do projeto
```

### TypeScript

- Use TypeScript em todos os componentes
- Defina interfaces para props
- Evite `any` sempre que possível

```typescript
// ✅ Bom
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export default function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  // ...
}

// ❌ Evite
export default function Button(props: any) {
  // ...
}
```

### Componentes React

- Use componentes funcionais
- Prefira hooks nativos do React
- Mantenha componentes pequenos e focados

```typescript
// ✅ Bom
'use client'

import { useState } from 'react'

interface CounterProps {
  initialValue?: number
}

export default function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue)

  return (
    <div>
      <p>Contagem: {count}</p>
      <button onClick={() => setCount(count + 1)}>Incrementar</button>
    </div>
  )
}
```

### Tailwind CSS

- Use classes utilitárias do Tailwind
- Agrupe classes relacionadas
- Use classes personalizadas em globals.css quando necessário

```tsx
// ✅ Bom
<button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
  Clique aqui
</button>

// ❌ Evite estilos inline
<button style={{ backgroundColor: '#0284c7', color: 'white' }}>
  Clique aqui
</button>
```

### Estrutura de Arquivos

```
componente/
├── MeuComponente.tsx      # Componente principal
├── MeuComponente.test.tsx # Testes (opcional)
└── types.ts               # Tipos (se necessário)
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Modo watch
npm test -- --watch

# Cobertura
npm test -- --coverage
```

### Escrever Testes

```typescript
import { render, screen } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  it('renderiza o label corretamente', () => {
    render(<Button label="Clique aqui" onClick={() => {}} />)
    expect(screen.getByText('Clique aqui')).toBeInTheDocument()
  })

  it('chama onClick quando clicado', () => {
    const handleClick = jest.fn()
    render(<Button label="Clique" onClick={handleClick} />)
    
    screen.getByText('Clique').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## 📚 Documentação

### Comentários

Use comentários para explicar código complexo:

```typescript
// ✅ Bom
/**
 * Calcula o valor total da inscrição baseado na categoria e lote atual
 * @param categoria - Categoria da prova (10K, 2K, Kids, etc)
 * @param lote - Número do lote atual (1, 2, 3)
 * @returns Valor em reais
 */
function calcularValorInscricao(categoria: string, lote: number): number {
  // ...
}

// ❌ Desnecessário
// Incrementa o contador
setCount(count + 1)
```

### README

Ao adicionar novas funcionalidades, atualize o README.md:

- Adicione na seção "Funcionalidades"
- Atualize screenshots se necessário
- Documente novas variáveis de ambiente

## 🐛 Reportando Bugs

### Template de Issue

```markdown
**Descrição do Bug**
Uma descrição clara do que está errado.

**Como Reproduzir**
1. Vá para '...'
2. Clique em '....'
3. Role até '....'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 120]
- Versão: [ex: 1.0.0]

**Informações Adicionais**
Qualquer outra informação relevante.
```

## 💡 Sugerindo Funcionalidades

### Template de Feature Request

```markdown
**Qual problema essa funcionalidade resolve?**
Uma descrição clara do problema.

**Solução Proposta**
Como você imagina que isso deveria funcionar.

**Alternativas Consideradas**
Outras soluções que você considerou.

**Informações Adicionais**
Contexto adicional, screenshots, mockups, etc.
```

## ✅ Checklist do Pull Request

Antes de abrir um PR, certifique-se de:

- [ ] O código compila sem erros (`npm run build`)
- [ ] Os testes passam (`npm test`)
- [ ] O código segue os padrões do projeto
- [ ] Adicionei/atualizei testes se necessário
- [ ] Atualizei a documentação se necessário
- [ ] Não há console.logs ou debuggers no código
- [ ] Os commits seguem o padrão Conventional Commits
- [ ] A branch está atualizada com a main

## 🏗️ Áreas que Precisam de Ajuda

### Alta Prioridade

- [ ] Sistema de inscrição completo (backend)
- [ ] Integração com gateway de pagamento
- [ ] Sistema de autenticação e área do atleta
- [ ] Painel administrativo
- [ ] Resultados em tempo real

### Média Prioridade

- [ ] Testes automatizados
- [ ] Otimização de performance
- [ ] Acessibilidade (WCAG)
- [ ] Internacionalização (i18n)
- [ ] PWA capabilities

### Baixa Prioridade

- [ ] Animações e microinterações
- [ ] Dark mode
- [ ] Gamificação
- [ ] App mobile nativo

## 🤝 Código de Conduta

### Nosso Compromisso

Estamos comprometidos em proporcionar uma experiência acolhedora e inspiradora para todos.

### Comportamento Esperado

- Use linguagem acolhedora e inclusiva
- Seja respeitoso com diferentes pontos de vista
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros

### Comportamento Inaceitável

- Uso de linguagem ou imagens sexualizadas
- Comentários insultuosos ou depreciativos
- Assédio público ou privado
- Publicar informações privadas de terceiros
- Outras condutas consideradas inapropriadas

## 📞 Contato

Dúvidas sobre contribuição?

- **Email**: dev@corridamacuco.com.br
- **GitHub Issues**: Para questões técnicas
- **Discussions**: Para discussões gerais

## 🙏 Reconhecimento

Todos os contribuidores serão reconhecidos no README.md do projeto!

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).

---

**Obrigado por contribuir para a 51ª Corrida Rústica de Macuco! 🏃‍♂️💨**








