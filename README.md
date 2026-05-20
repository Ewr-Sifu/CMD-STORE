# 🎵 SIZUKA - CMD Store

> **Sizuka** – A powerful, feature-rich command & configuration store built with modern JavaScript, designed for seamless content management and advanced data orchestration.

---

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
  - [Core Modules](#core-modules)
  - [Configuration Files](#configuration-files)
- [Architecture](#architecture)
- [API Integration](#api-integration)
- [Data Management](#data-management)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Capabilities
- 🎯 **Command Management** – Store and organize custom commands with metadata
- 💾 **Persistent Storage** – JSON-based configuration for reliability
- 🎨 **Font Management** – Support for multiple font families and styles
- 📊 **Balance Tracking** – Integrated balance calculation and monitoring system
- 🔗 **API Integration** – Flexible API endpoint configuration for external services
- 📦 **Album Categories** – Organized content categorization system
- 🎪 **Multi-format Support** – PNG string handling and asset management

### Advanced Features
- **Modular Architecture** – Cleanly separated concerns for maintainability
- **Dynamic Configuration** – Real-time configuration updates without restart
- **Scalable Data Structure** – Optimized JSON schemas for performance
- **Extensible Command System** – Add custom commands with minimal overhead

---

## 📁 Project Structure

```
CMD-STORE/
├── README.md                 # Project documentation (this file)
├── ApiUrl.json              # API endpoint configurations
├── balance.js               # Balance management module
├── mvdo.js                  # Core command handler
├── xfont.json               # Font configuration (X-axis)
├── yfont.json               # Font configuration (Y-axis)
├── cmdsinfo.json            # Command metadata and descriptions
├── cmdsurl.json             # Command URL mappings
├── albumcategory.json       # Album categorization schema
│
├── cmd/                     # Command storage directory
│   └── [command files]
│
├── fonts/                   # Font asset storage
│   └── [font files]
│
└── pngstr/                  # PNG string resources
    └── [image assets]
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** ≥ 12.x
- **npm** or **yarn** package manager
- Basic JavaScript knowledge

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Ewr-Sifu/CMD-STORE.git
cd CMD-STORE

# Install dependencies (if package.json exists)
npm install

# Run the application
node mvdo.js
```

---

## 💡 Usage

### Core Modules

#### **1. balance.js** – Balance Management System
Handles financial or resource tracking with advanced calculations:

```javascript
const Balance = require('./balance.js');

// Initialize balance tracker
const tracker = new Balance();

// Perform balance operations
tracker.add(100);
tracker.subtract(50);
const currentBalance = tracker.getBalance();
```

**Features:**
- Real-time balance updates
- Transaction history tracking
- Balance validation and constraints
- Multi-account support (if configured)

#### **2. mvdo.js** – Main Command Handler
Core command execution engine:

```javascript
const MVDO = require('./mvdo.js');

// Execute commands
MVDO.execute('command_name', parameters);

// Get command info
const info = MVDO.getCommandInfo('command_name');
```

**Capabilities:**
- Command routing and execution
- Parameter validation
- Error handling and logging
- Command chaining support

### Configuration Files

#### **ApiUrl.json** – API Integration
Configure external API endpoints:

```json
{
  "baseURL": "https://api.example.com",
  "endpoints": {
    "users": "/api/v1/users",
    "products": "/api/v1/products"
  },
  "timeout": 5000,
  "retryPolicy": {
    "maxRetries": 3,
    "backoffMultiplier": 2
  }
}
```

#### **cmdsinfo.json** – Command Metadata
Define command descriptions and configurations:

```json
{
  "commands": {
    "balance": {
      "description": "Get current balance",
      "parameters": []
    },
    "transfer": {
      "description": "Transfer funds",
      "parameters": ["amount", "destination"]
    }
  }
}
```

#### **cmdsurl.json** – Command URL Mappings
Map commands to their endpoints:

```json
{
  "balance": "/cmd/balance",
  "transfer": "/cmd/transfer",
  "history": "/cmd/history"
}
```

#### **albumcategory.json** – Content Categories
Organize content hierarchically:

```json
{
  "categories": [
    {
      "id": "music",
      "name": "Music",
      "subcategories": ["pop", "rock", "jazz"]
    }
  ]
}
```

#### **Font Configuration** – xfont.json & yfont.json
Define font rendering parameters:

```json
{
  "fonts": {
    "primary": "Arial",
    "secondary": "Helvetica",
    "mono": "Courier New"
  },
  "sizes": [12, 14, 16, 18, 20]
}
```

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────┐
│         User Interface / CLI             │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│    Command Router (mvdo.js)             │
├──────────────────────────────────────────┤
│ • Command Parsing                        │
│ • Route Resolution                       │
│ • Parameter Validation                   │
└──────────────────┬──────────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
   ┌──▼──┐    ┌───▼───┐   ┌───▼───┐
   │ API │    │Balance│   │ Font  │
   │Config   │System │   │Config│
   └──────┘    └───────┘   └───────┘
      │            │            │
      └────────────┼────────────┘
                   │
┌──────────────────▼──────────────────────┐
│      Storage Layer (JSON Files)         │
├──────────────────────────────────────────┤
│ • Persistent Configuration               │
│ • Command Definitions                    │
│ • Category Schemas                       │
└──────────────────────────────────────────┘
```

### Data Flow

1. **Input** → User provides command with parameters
2. **Parse** → Command router analyzes and validates input
3. **Route** → Appropriate handler is identified
4. **Execute** → Command logic executes with configuration
5. **Store** → Results persist in JSON storage
6. **Output** → Response returned to user

---

## 🔌 API Integration

### Configuring External APIs

Modify `ApiUrl.json` to connect external services:

```json
{
  "services": {
    "paymentGateway": {
      "url": "https://payment.api.com",
      "key": "your_api_key",
      "version": "v2"
    },
    "dataStore": {
      "url": "https://data.api.com",
      "headers": {
        "Authorization": "Bearer token"
      }
    }
  }
}
```

### Making API Calls

```javascript
const API = require('./ApiUrl.json');

fetch(API.services.paymentGateway.url, {
  headers: { 'API-Key': API.services.paymentGateway.key }
})
.then(response => response.json())
.catch(error => console.error('API Error:', error));
```

---

## 📊 Data Management

### Working with JSON Schemas

All data is stored in JSON format for easy manipulation:

```javascript
const fs = require('fs');

// Read configuration
const config = JSON.parse(fs.readFileSync('cmdsinfo.json', 'utf8'));

// Modify configuration
config.commands.newCommand = {
  description: "New command",
  parameters: ["param1", "param2"]
};

// Write back
fs.writeFileSync('cmdsinfo.json', JSON.stringify(config, null, 2));
```

### Directory Management

- **cmd/** – Store custom command implementations
- **fonts/** – Place font files here for rendering
- **pngstr/** – Store image assets and graphics

---

## 🛠️ Development

### Adding New Commands

1. Create command file in `cmd/` directory
2. Define command metadata in `cmdsinfo.json`
3. Map URL in `cmdsurl.json`
4. Implement handler in `mvdo.js`

### Example Command Implementation

```javascript
// cmd/customCommand.js
module.exports = {
  name: 'customCommand',
  description: 'A custom command',
  
  execute: (params) => {
    console.log('Executing with params:', params);
    return { status: 'success', data: params };
  }
};
```

### Best Practices

✅ **Do:**
- Keep commands modular and single-responsibility
- Validate all input parameters
- Document complex logic
- Use consistent naming conventions
- Handle errors gracefully

❌ **Don't:**
- Mix concerns in command handlers
- Ignore configuration updates
- Hardcode values that should be in config
- Skip error handling

---

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Support & Community

- **Issues** – Report bugs and request features [here](https://github.com/Ewr-Sifu/CMD-STORE/issues)
- **Discussions** – Join community discussions [here](https://github.com/Ewr-Sifu/CMD-STORE/discussions)
- **Wiki** – Check out our [Wiki](https://github.com/Ewr-Sifu/CMD-STORE/wiki) for advanced topics

---

## 📊 Project Stats

- **Language:** JavaScript (100%)
- **Repository:** [Ewr-Sifu/CMD-STORE](https://github.com/Ewr-Sifu/CMD-STORE)
- **Stars:** ⭐ 4
- **Last Updated:** May 2026

---

<div align="center">

**Made with ❤️ by [Ewr-Sifu](https://github.com/Ewr-Sifu)**

[⬆ back to top](#-sizuka---cmd-store)

</div>