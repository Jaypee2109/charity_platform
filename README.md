# Decentralized Charity Platform

A blockchain‑powered dApp for instant, transparent donations and timed auctions.

## Demo video

An demonstration video is available at https://youtu.be/0Rd5HCyO9YI?si=HBcdjlsbOfBkkX_T.

## Prerequisites

- Node.js (v16+)
- npm
- MetaMask browser extension
- Hardhat (installed as a dev dependency)

---

## Backend (Smart Contracts)

1. **Install dependencies** (project root):

   ```bash
   npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers chai
   ```

2. **Compile contracts**:

   ```bash
   npx hardhat compile
   ```

3. **Run a local Hardhat node**:

   ```bash
   npx hardhat node
   ```

4. **Deploy contracts** (in a new shell):
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
   Copy the printed address (e.g. `Charity deployed to: 0xAbC1234…`).

---

## Frontend Setup

1. **Copy ABI**

   ```bash
   mkdir -p frontend/src/contracts
   cp artifacts/contracts/Charity.sol/Charity.json frontend/src/contracts/DecentralizedCharity.json
   ```

2. **Configure environment**
   Create `frontend/.env`:

   ```bash
   REACT_APP_CONTRACT_ADDRESS=0xYourDeployedAddressHere
   ```

3. **Install dependencies** (inside `frontend/`):

   ```bash
   cd frontend
   npm install
   ```

4. **Start React app**:
   ```bash
   npm start
   ```

---

## MetaMask Configuration

1. Add a network in MetaMask:

   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency: `ETH`

2. Import one of the Hardhat accounts (private key shown in `npx hardhat node`).

---

## Usage

1. Browse to `http://localhost:3000`.
2. **Donate**: Enter campaign ID and ETH amount, confirm in MetaMask.
3. **Create Auction**: Enter charity address and duration (s), confirm.
4. **Auction List**: View all live auctions.
5. **Finalize Auction**: Enter auction ID after end time, confirm.
6. **Metrics**: Enter campaign ID to see totals, counts, highest & average.

---

## Running Tests

From the project root:

```bash
npx hardhat test
```

---
