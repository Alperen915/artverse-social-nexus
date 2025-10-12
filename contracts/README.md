# Brosverse Smart Contracts

BROS token ve platform için gerekli tüm smart contract'lar.

## 📋 Contract'lar

### 1. BrosToken.sol
Ana platform token'ı - ERC-20 standardı ile 1 milyar BROS token.

**Özellikler:**
- ✅ Fixed supply: 1,000,000,000 BROS
- ✅ ERC-20 Burnable
- ✅ EIP-2612 Permit (gasless approvals)
- ✅ Anti-whale mekanizması (transfer limiti)
- ✅ Token dağılımı:
  - 40% Community Pool
  - 20% Team Vesting
  - 20% Treasury
  - 10% Liquidity
  - 10% Rewards

### 2. BrosTokenFactory.sol
Community DAO'ları için token oluşturma factory'si.

**Özellikler:**
- ✅ BROS token karşılığında yeni token oluşturma
- ✅ Token yaratıcısı takibi
- ✅ Flexible creation fee
- ✅ ERC-20 compatible community tokens

### 3. BrosStaking.sol
BROS token staking ve reward mekanizması.

**Özellikler:**
- ✅ Multiple lock periods (0, 30, 90, 180, 365 gün)
- ✅ APY'ye göre farklı ödüller
- ✅ Flexible reward claiming
- ✅ Emergency withdrawal (penalty ile)
- ✅ Lock period'a göre oranlar:
  - No lock: 5% APY
  - 30 days: 10% APY
  - 90 days: 15% APY
  - 180 days: 20% APY
  - 365 days: 30% APY

### 4. BrosGovernance.sol
BROS token holder'ları için governance sistemi.

**Özellikler:**
- ✅ Proposal oluşturma (100k BROS threshold)
- ✅ Voting mekanizması (For/Against/Abstain)
- ✅ Quorum requirement (1M BROS)
- ✅ Time-based voting periods
- ✅ Proposal execution
- ✅ Vote delegation support

## 🚀 Kurulum

```bash
cd contracts

# Dependencies yükle
npm install

# Contract'ları compile et
npx hardhat compile
```

## 📝 Deploy Etme

### 1. Environment Variables
`.env` dosyası oluştur:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
BROS_TESTNET_RPC_URL=https://testnet-rpc.bros-chain.com
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. Sepolia Testnet'e Deploy

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. Bros Chain Testnet'e Deploy

```bash
npx hardhat run scripts/deploy.js --network brosTestnet
```

### 4. Contract Verification (Sepolia)

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS "CONSTRUCTOR_ARGS"
```

## 🔧 Deploy Sonrası Yapılacaklar

### 1. Contract Adreslerini Güncelle

`src/config/contracts.ts` dosyasını güncelle:

```typescript
export const CHAIN_CONTRACTS: Record<string, ChainContracts> = {
  '0xaa36a7': { // Sepolia
    BROS_TOKEN: 'DEPLOYED_BROS_TOKEN_ADDRESS',
    TOKEN_FACTORY_CONTRACT: 'DEPLOYED_FACTORY_ADDRESS',
    STAKING_CONTRACT: 'DEPLOYED_STAKING_ADDRESS',
    GOVERNANCE_CONTRACT: 'DEPLOYED_GOVERNANCE_ADDRESS',
    // ... diğer contract'lar
  }
};
```

### 2. Platform Token Config Oluştur

`src/config/platform-token.ts` oluştur:

```typescript
export const BROS_TOKEN = {
  name: 'Bros Token',
  symbol: 'BROS',
  decimals: 18,
  addresses: {
    sepolia: 'DEPLOYED_ADDRESS',
    brosTestnet: 'DEPLOYED_ADDRESS',
  }
};
```

### 3. Staking Contract'a Reward Token Transfer Et

```javascript
// Staking ödülleri için BROS transfer et
const rewardAmount = ethers.parseEther("10000000"); // 10M BROS
await brosToken.transfer(stakingAddress, rewardAmount);
```

### 4. Token Factory Fee Ayarla

```javascript
// Factory creation fee'yi ayarla
const newFee = ethers.parseEther("50"); // 50 BROS
await tokenFactory.setCreationFee(newFee);
```

## 📊 Test Etme

```bash
# Tüm testleri çalıştır
npx hardhat test

# Specific test
npx hardhat test test/BrosToken.test.js

# Coverage
npx hardhat coverage
```

## 🔐 Güvenlik Notları

1. **Private Key Güvenliği**: `.env` dosyasını asla commit etme
2. **Multisig Wallets**: Production'da treasury ve önemli poollar için multisig kullan
3. **Audit**: Contract'ları deploy etmeden önce audit ettir
4. **Timelock**: Governance'da kritik işlemler için timelock kullan
5. **Rate Limiting**: Anti-whale mekanizmasını aktif tut

## 🛠️ Geliştirme Araçları

### Hardhat Console

```bash
npx hardhat console --network sepolia
```

### Local Node

```bash
npx hardhat node
```

### Gas Reporting

```bash
REPORT_GAS=true npx hardhat test
```

## 📚 Kaynaklar

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ERC-20 Standard](https://eips.ethereum.org/EIPS/eip-20)
- [EIP-2612 (Permit)](https://eips.ethereum.org/EIPS/eip-2612)

## 🤝 Katkıda Bulunma

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details
