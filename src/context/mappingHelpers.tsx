// MappingHelpersContext.ts
import React, { createContext, useContext } from 'react';
import { useMappingHelper as useShopifyMappingHelper } from '@shopify/flash-list';

const MappingHelpersContext = createContext<any>(null);

export const MappingHelpersProvider = ({ children }: { children: React.ReactNode }) => {
  const mappingHelpers = useShopifyMappingHelper();
  return (
    <MappingHelpersContext.Provider value={mappingHelpers}>
      {children}
    </MappingHelpersContext.Provider>
  );
};

export const useMappingHelpers = () => {
  return useContext(MappingHelpersContext);
};
