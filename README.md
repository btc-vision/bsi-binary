# BSI Transaction Builder

![Bitcoin](https://img.shields.io/badge/Bitcoin-000?style=for-the-badge&logo=bitcoin&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![NPM](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Gulp](https://img.shields.io/badge/GULP-%23CF4647.svg?style=for-the-badge&logo=gulp&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Introduction

Bitcoin is a nightmare to work with.

Currently, bitcoin tooling are so unorganized and hard to work with. This project aims to provide a robust and
user-friendly tool for building and managing Bitcoin transactions. This tool is designed to facilitate the creation,
management, and
execution of transactions within Bitcoin. This repository includes all the necessary tooling to easily interact with
contract (BSI). This repository provide a robust code base for building and verifying transactions that comply with the
latest standards and protocols.

## Repository Contents

- **src/**: Contains all source code for the BSI Transaction Builder, including modules for transaction crafting,
  validation, and network communication.
- **docs/**: Documentation detailing setup, usage, API references, and configuration options.
- **tests/**: Automated test suites and testing utilities to ensure the functionality and security of the transaction
  builder.
- **examples/**: Example scripts and usage scenarios that help users understand how to implement the transaction builder
  in various applications.
- **scripts/**: Utility scripts for setup, deployment, and other maintenance tasks.

## Key Features

- **Transaction Crafting**: Tools to construct standard and custom Bitcoin transactions such as smart contract
  deployment, contract interaction, including WBTC wraps and
  unwraps.
- **Script Compatibility**: Full support for Taproot scripts, enabling advanced transaction types that utilize Schnorr
  signatures for enhanced privacy and efficiency.
- **Validation and Testing**: Built-in validation tools to verify the integrity and compliance of transactions before
  broadcasting to the network.
- **User-Friendly API**: A well-documented API (soon...) that allows developers to integrate and automate transaction
  building
  processes in their applications.

## Getting Started

### Prerequisites

- Node.js version 20.x or higher
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/btc-vision/bsi-transaction.git
   ```
2. Navigate to the repository directory:
   ```bash
   cd bsi-transaction
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```

## Usage

Refer to the `docs/` directory for detailed guides on how to use the BSI Transaction Builder. Start
with `getting_started.md` and explore `api_reference.md` for comprehensive information about the functions available.

## Contribution

Contributions are welcome! Please read through the `CONTRIBUTING.md` file for guidelines on how to submit issues,
feature requests, and pull requests. We appreciate your input and encourage you to help us improve the BSI Transaction
Builder.

## License

This project is licensed under a STRICT license - see the `LICENSE.md` file for details.
