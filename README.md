# GridConnect 🔌⚡

Geospatial Intelligence Platform for UK Grid Connections

A comprehensive open-source platform to help renewable energy projects understand grid connection feasibility, queue positions, and connection timelines.

<img width="1280" height="720" alt="image" src="https://github.com/user-attachments/assets/1363f358-06d7-4b26-b212-35eedb4427f5" />
## 🌟 Features

**Three-Layer Intelligence Model**

- 🗺️ **Infrastructure Discovery** - Identify nearby substations, power lines, and transformers
- 📍 **Network Accessibility** - Calculate distance to grid and accessibility scores (0-100)
- ⏱️ **Capacity & Queue Intelligence** - Estimate grid congestion and connection timelines
- 📊 **Probability Forecasting** - 6-year connection likelihood projections
- 🚀 **Open-Source & Free** - MIT licensed, fully accessible, no restrictions

## 🎯 The Problem We Solve

Renewable energy projects face massive uncertainty:
- **"Will we get a connection?"** - No feasibility assessment
- **"When will we connect?"** - Queue timelines hidden
- **"Is this location viable?"** - No spatial analysis
- **"What's network capacity?"** - No public visibility

GridConnect provides transparency and intelligence to accelerate renewable deployment.

## 🚀 Quick Start

### Docker (Recommended)
```bash
git clone https://github.com/Kalitch/gridconnect.git
cd gridconnect
docker-compose up -d
```

Access:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Prerequisites
- Docker & Docker Compose
- OpenStreetMap UK data (auto-imported)

## 🏗️ Architecture
```
gridconnect/
├── app/                    # FastAPI backend
│   ├── api.py             # REST endpoints
│   ├── analyzer.py        # Geospatial engine
│   ├── models.py          # Database models
│   └── schemas.py         # Data validation
├── frontend/              # React + TypeScript
│   └── src/
│       ├── components/    # Map, form, analysis
│       └── App.tsx
└── docker-compose.yml     # Full stack
```

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Leaflet, Recharts |
| **Backend** | FastAPI, Python, SQLAlchemy |
| **Database** | PostgreSQL, PostGIS |
| **Deployment** | Docker, Docker Compose |
| **License** | MIT |

## 📈 Roadmap

### Phase 1: UK Grid Intelligence ✅
- [x] Interactive grid mapping
- [x] Connection feasibility analysis
- [x] Queue estimation
- [x] Capacity assessment
- [ ] UKPN real data (in progress)
- [ ] Production deployment

### Phase 2: Industry Standard (2024)
- [ ] Real UKPN queue data
- [ ] Network capacity visibility
- [ ] Grid reinforcement plans
- [ ] Assessment standards by DNO

### Phase 3: US Expansion (2024)
- [ ] FERC data integration
- [ ] Multi-RTO support (PJM, MISO, CAISO)
- [ ] US interconnection process mapping

### Phase 4: Global Platform (2025)
- [ ] European grids
- [ ] Standardized data format
- [ ] Community modules

## 📊 Data Sources

- **Grid Infrastructure:** [OpenStreetMap](https://www.openstreetmap.org/) contributors 🙏
- **Electricity Data:** ESO (Electricity System Operator)
- **Historical Data:** OpenGovernance
- **Queue Estimation:** Historical patterns (UKPN partnership in development)

## 🤝 Current Partnerships

- 🏫 University of Cambridge - Academic supervision
- 🌐 [OpenSite.energy](https://opensite.energy) - Platform integration
- 🔌 UK Power Networks - Data partnership (in development)
- 🌱 Community Energy England - Collaboration

## 📝 License

MIT License - See [LICENSE](./LICENSE)

## 🤝 Contributing

Contributions welcome from:
- Power system engineers
- GIS specialists
- Data scientists
- Web developers
- Energy economists

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/Kalitch/gridconnect/issues)
- **API Docs:** http://localhost:8000/docs (when running)
- **Discussions:** [GitHub Discussions](https://github.com/Kalitch/gridconnect/discussions)

## 🌟 Show Your Support

- ⭐ Star this repository
- 🐛 Report bugs
- 💡 Suggest features
- 🔀 Contribute code

---

Built with ❤️ for the UK renewable energy transition 🌱⚡