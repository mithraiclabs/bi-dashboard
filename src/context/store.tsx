import React, { cloneElement } from 'react';

import { ConnectionProvider } from './ConnectionContext';

const _providers: React.ReactElement[] = [
  // eslint-disable-next-line react/no-children-prop
  <ConnectionProvider key="ConnectionProvider" />,
];

// flatten context providers for simpler app component tree

const ProviderComposer: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providers: any[];
}> = ({ providers, children }) =>
  providers.reduceRight(
    (kids, parent) => cloneElement(parent, { children: kids }),
    children,
  );

const Store: React.FC = ({ children }) => (
  <ProviderComposer providers={_providers}>{children}</ProviderComposer>
);

export default Store;
