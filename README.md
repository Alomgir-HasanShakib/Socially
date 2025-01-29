
## How to Run This Project Locally

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Alomgir-HasanShakib/Socially.git
    cd Socially
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up environment variables:**
    Create a `.env` file in the root directory and add the following variables:
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    DATABASE_URL=your_database_url
    UPLOADTHING_TOKEN=your_uploadthing_token
    ```

4. **Run the development server:**
    ```bash
    npm run dev
    ```

5. **Open your browser:**
    Navigate to `http://localhost:3000` to see the application running.

## Additional Scripts

- **Build the project:**
  ```bash
  npm run build
  ```

- **Start the production server:**
  ```bash
  npm start
  ```

- **Run tests:**
  ```bash
  npm test
  ```