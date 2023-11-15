# draw-a-ui

This is an app that uses tldraw and the gpt-4-vision api to generate html based on a wireframe you draw.

> I'm currently working on a hosted version of draw-a-ui. You can join the waitlist at [draw-a-ui.com](https://draw-a-ui.com). The core of it will always be open source and available here.

![A demo of the app](./demo.gif)

This works by just taking the current canvas SVG, converting it to a PNG, and sending that png to gpt-4-vision with instructions to return a single html file with tailwind.

> Disclaimer: This is a demo and is not intended for production use. It doesn't have any auth so you will go broke if you deploy it.

## Getting Started

This is a Next.js app. To get started run the following commands in the root directory of the project. You will need an OpenAI API key with access to the GPT-4 Vision API.

> Note this uses Next.js 14 and requires a version of `node` greater than 18.17. [Read more here](https://nextjs.org/docs/pages/building-your-application/upgrading/version-14).

```bash
echo "OPENAI_API_KEY=sk-your-key" > .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contribution Guidelines

Contribute using `husky` and `lint-staged` for quality commits. Ensure code passes linting (`eslint`, `stylelint`) and tests before committing.

### Husky Setup

To ensure the proper functioning of code commit hooks (like pre-commit), team members should execute the following command after pulling the latest code containing Husky's configuration:

```bash
npx husky install
```

### Commit Message Standards

Use `commitlint` for standardized messages. Format: `<type>(<scope>): <summary>`. Types: feat, fix, docs, style, refactor, test, chore.

### Submitting Changes

1. Make changes in your local branch.
2. `git add` for staging.
3. `git commit -m '<message>'` (follow standards).
4. `git push` for pushing changes.

### Standard Pull Request Process

1. **Fork the Repository**: Start by forking the repository to your GitHub account.
2. **Create a New Branch**: Create a new branch for your changes. Name it appropriately.
3. **Implement Your Changes**: Make your changes in your branch and commit them.
4. **Pull Request**: Go to the original repository and click on "Pull Request". Select your branch and describe the changes you've made.
5. **Review Process**: Wait for the maintainers to review your PR. Be responsive to any comments or requests for changes.
6. **Merging**: Once your PR is approved, it will be merged into the main branch.
