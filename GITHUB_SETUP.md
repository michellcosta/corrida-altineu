# Configurar repositório no GitHub

O Git já está inicializado e o commit inicial foi feito. Agora você precisa criar o repositório no GitHub e enviar o código.

## Opção 1: Usando GitHub CLI (recomendado)

1. **Autentique-se no GitHub:**
   ```bash
   gh auth login
   ```
   - Escolha "GitHub.com"
   - Escolha HTTPS
   - Siga as instruções para autenticar (browser ou token)

2. **Crie o repositório e envie o código:**
   ```bash
   gh repo create corrida-altineu --public --source=. --push
   ```

Pronto! O repositório será criado em `https://github.com/SEU_USUARIO/corrida-altineu`

---

## Opção 2: Manualmente pelo site

1. Acesse [github.com/new](https://github.com/new)

2. Crie um repositório:
   - **Nome:** `corrida-altineu`
   - **Visibilidade:** Público
   - **Não** marque "Add a README" (o projeto já tem um)

3. Depois de criar, execute no terminal (substitua SEU_USUARIO pelo seu usuário do GitHub):
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/corrida-altineu.git
   git branch -M main
   git push -u origin main
   ```

---

## Verificar

Após o push, acesse `https://github.com/SEU_USUARIO/corrida-altineu` para ver o código no GitHub.
