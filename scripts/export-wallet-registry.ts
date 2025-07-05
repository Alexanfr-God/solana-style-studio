import { writeFileSync } from 'fs';
import path from 'path';
import { DETAILED_WALLET_ELEMENTS_REGISTRY } from '../src/components/wallet/DetailedWalletElementsRegistry';

const outPath = path.resolve('public/wallet-registry.json');
writeFileSync(outPath, JSON.stringify(DETAILED_WALLET_ELEMENTS_REGISTRY, null, 2));
console.log(`Wallet registry written to ${outPath}`);



