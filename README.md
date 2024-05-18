# draw-a-ui

This is an app that uses tldraw and the gpt-4-vision api to generate html based on a wireframe you draw.

> I'm currently working on a hosted version of draw-a-ui. You can join the waitlist at [draw-a-ui.com](https://draw-a-ui.com). The core of it will always be open source and available here.

![A demo of the app](./demo.gif)

This works by just taking the current canvas SVG, converting it to a PNG, and sending that png to gpt-4-vision with instructions to return a single html file with tailwind.

> Disclaimer: This is a demo and is not intended for production use. It doesn't have any auth so you will go broke if you deploy it.

## Getting Started

> You will need an OpenAI API key with access to the GPT-4 Vision API.

### Running Locally

> Note this uses Next.js 14 and requires a version of `node` greater than 18.17. [Read more here](https://nextjs.org/docs/pages/building-your-application/upgrading/version-14).

Before you begin, clone the project repository to your local machine:
```bash
git clone https://github.com/SawyerHood/draw-a-ui.git
cd draw-a-ui
```

1. **Set Up Your OpenAI API Key**  
   Create a `.env.local` file in the root directory with your OpenAI API key:
   ```bash
   echo "OPENAI_API_KEY=<YOUR_API_KEY>" > .env.local
   ```

2. **Install Dependencies**  
   Install all the necessary dependencies:
   ```bash
   npm install
   ```

3. **Start the Development Server**  
   Launch your development server:
   ```bash
   npm run dev
   ```

4. **View Your Application**  
   Access your app by visiting [http://localhost:3000](http://localhost:3000) in your web browser.

### Running with Docker

To run the `draw-a-ui` app with Docker, first clone the project and navigate into the project directory:
```bash
git clone https://github.com/SawyerHood/draw-a-ui.git
cd draw-a-ui
```

Replace the API key in the docker-compose.yml file:
```
environment:
    - OPENAI_API_KEY="OPENAI_API_KEY"
```

Then, simply build and start your application with Docker Compose:
```bash
docker-compose up -d
```

After the containers are up, you can access the app by visiting [http://localhost:3000](http://localhost:3000) in your browser.

> Remember to replace `<YOUR_API_KEY>` with your actual OpenAI API key.