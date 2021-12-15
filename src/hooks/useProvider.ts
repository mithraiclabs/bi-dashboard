import { Provider } from '@project-serum/anchor';
import { useMemo } from 'react';
import useConnection from '../hooks/useConnection';
import { Keypair } from '@solana/web3.js';
import { NodeWallet } from '@project-serum/anchor/dist/cjs/provider';

/**
 * Get provider based on current RPC connection and wallet.
 *
 * @returns Provider | null
 */
export const useProvider = (): Provider | null => {
  const { connection } = useConnection();
  // const wallet = useConnectedWallet();

  return useMemo(() => {
    if (connection) {
      // must default to a wallet so provider exists.
      // Not sure if this is best practice, open to suggestions.

      return new Provider(connection, new NodeWallet(new Keypair()), {});
    }
    return null;
  }, [connection]);
};