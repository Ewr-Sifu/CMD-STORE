# 📦 Installation Guide

## Prerequisites

- **Node.js** >= 14.0.0
- **npm** >= 6.0.0 or **yarn** >= 1.22.0
- **MongoDB** (Cloud or Local)
- **Git**

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Ewr-Sifu/CMD-STORE.git
cd CMD-STORE
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net
DB_NAME=SIZUKA
API_TIMEOUT=5000
API_RETRIES=3
PORT=3000
NODE_ENV=development
FB_ACCESS_TOKEN=your_facebook_token
```

### 4. Create Required Directories

```bash
mkdir -p assets/fonts cache logs
```

### 5. Add Font Files (Optional)

Place your font files in the `assets/fonts/` directory:

- `NotoSans-Bold.ttf`
- `NotoSans-SemiBold.ttf`
- `NotoSans-Regular.ttf`
- `BeVietnamPro-Bold.ttf`
- `BeVietnamPro-SemiBold.ttf`

### 6. Verify Installation

```bash
npm run test
```

## Development Setup

```bash
npm run dev
```

This will start the application with hot-reload using nodemon.

## Production Setup

```bash
npm run lint:fix
npm run build
npm start
```

## Troubleshooting

### MongoDB Connection Issues

- Verify your MongoDB URI is correct
- Check if IP whitelist includes your server IP
- Ensure network connectivity to MongoDB cluster

### Canvas Library Issues

- On Windows: Install Visual C++ Build Tools
- On macOS: Install Xcode Command Line Tools
- On Linux: Install build-essential and other dependencies

```bash
# Ubuntu/Debian
sudo apt-get install build-essential python3

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
```

### Font Registration Issues

- Verify font files are in the correct format (TTF)
- Ensure font files have read permissions
- Check logs for specific font loading errors

## Next Steps

- Read the [README.md](README.md) for feature overview
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for development guidelines
- Join our community discussions
