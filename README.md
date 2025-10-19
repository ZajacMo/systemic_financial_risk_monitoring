# Systematic Financial Risk Monitoring

[中文](./README_CN.md)

## Project Overview
This is a front-end system for systematic financial risk data visualization. It provides comprehensive monitoring and analysis of financial market pressure indicators across multiple dimensions including bond market, foreign exchange market, stock market, derivatives market, and money market.

## Features
- Real-time monitoring of systemic financial risk pressure indices
- Interactive visualization of risk trends and distributions
- Correlation analysis between different financial markets
- Risk spillover effect analysis
- Responsive design for various devices
- Docker containerization support

## Technology Stack
- **Framework**: Vue.js 2.x
- **UI Component Library**: Element UI
- **Visualization Libraries**: ECharts, D3.js
- **State Management**: Vuex
- **Routing**: Vue Router
- **Build Tool**: Vue CLI
- **Deployment**: Docker + Nginx

## Project Structure
```
├── public/             # Static assets
├── src/
│   ├── assets/         # Project assets (images, SVGs, data files)
│   ├── components/     # Vue components
│   ├── db/             # Local data files
│   ├── router/         # Vue Router configuration
│   ├── store/          # Vuex store
│   ├── views/          # Vue views/pages
│   ├── App.vue         # Root component
│   └── main.js         # Entry point
├── Dockerfile          # Docker build configuration
├── nginx.conf          # Nginx configuration
└── package.json        # Project dependencies
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Docker (for containerized deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/systemic_financial_risk_monitoring.git
cd systemic_financial_risk_monitoring

# Install dependencies
npm install
```

### Development

```bash
# Compiles and hot-reloads for development
npm run serve

# Open http://localhost:8080 in your browser
```

### Production Build

```bash
# Compiles and minifies for production
npm run build

# The build artifacts will be stored in the `dist/` directory
```

## Docker Deployment

### Build Docker Image

```bash
# Build the Docker image
docker build -t systemic-risk-app .
```

### Run Docker Container

```bash
# Run the container
docker run -d -p 8080:80 --name systematic-risk-container systemic-risk-app

# Access the application at http://localhost:8080
```

## Project Components

### RiskLine
- Displays time series trends of various financial risk indicators
- Supports multiple index comparisons
- Interactive time range selection

### RiskMap
- Visualizes geographical distribution of financial risks
- Heat map representation of risk intensity
- Region-based risk analysis

### RiskSpillover
- Analyzes risk transmission between different financial markets
- Network diagram of risk contagion paths
- Quantitative spillover effect metrics

### RiskValue
- Presents key risk metrics and values
- Color-coded risk level indicators
- Historical comparison of risk values

## Data Sources
The project uses local JSON files for demonstration purposes, including:
- Market indicators data
- Correlation coefficients between markets
- Risk spillover matrix
- Risk index summaries

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License.

## Contact
For questions or suggestions, please contact the project maintainers.
