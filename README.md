
# 📦 BookReviewHub - Backend (Microservices)

Ce dossier contient les microservices du backend du projet **BookReviewHub**, une plateforme de recommandations et d'avis de livres distribuée.

## 🧱 Architecture

Le backend est composé de plusieurs services organisés autour d'une architecture microservices :
- `api/` : API REST construite avec Express.js
- `graphql/` : Serveur GraphQL utilisant Apollo Server
- `review-service/` : Service gRPC pour gérer les avis
- `reco-service/` : Service (en cours de développement) pour les recommandations
- `kafka/` : Infrastructure de consommation Kafka
- `shared/` : Modèles de données partagés

## 🔗 Technologies Utilisées

- **Node.js**
- **Express.js**
- **Apollo Server (GraphQL)**
- **gRPC**
- **Protocol Buffers**
- **Kafka (KafkaJS)**

## 🚀 Démarrage rapide

### Prérequis

- Node.js >= 14.x
- Kafka en local (ex: via Docker)
- Protoc (pour compiler les fichiers `.proto` si modifiés)

### Installation

```bash
cd server
npm install
```

### Lancer les services

Dans des terminaux séparés :

```bash
# API REST
cd api
npm start

# GraphQL Server
cd ../graphql
npm start

# Review Service gRPC
cd ../review-service
npm start

# Kafka Consumer (reviews)
cd ../review-service
node kafka-consumer.js
```

## 📡 Communication Interservices

- REST API ⇨ utilise gRPC pour déléguer les appels métier
- GraphQL ⇨ interroge le service gRPC
- Kafka ⇨ capte les événements d’ajout de reviews

## 📁 Structure des dossiers

```
server/
├── api/              # API REST
├── graphql/          # API GraphQL
├── kafka/            # Setup Kafka (structure présente)
├── reco-service/     # Service de recommandation (à compléter)
├── review-service/   # Service de gestion des avis via gRPC
├── shared/           # Modèles partagés
```

## ✍️ Auteurs

- [Mazen HAMMOUDA]

## 📝 Licence

Ce projet est à usage académique et pédagogique.
