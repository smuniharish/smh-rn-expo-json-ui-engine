import { Fragment, useEffect, useState } from 'react';
import renderUIComponent from './render';
import type { UIComponent } from './types';
import { JSONUIEnums } from './types';

type JSONSource =
  | UIComponent
  | UIComponent[]
  | (() => UIComponent | UIComponent[])
  | { subscribe: (cb: (val: any) => void) => { unsubscribe: () => void } };
interface JSONUIProps {
  json?: UIComponent | UIComponent[];
  jsonSource?: JSONSource;
}
const isObservable = (
  obj: any
): obj is {
  subscribe: (cb: (val: any) => void) => { unsubscribe: () => void };
} => {
  return !!obj && typeof obj.subscribe === 'function';
};
const JSONUI = ({ json, jsonSource }: JSONUIProps) => {
  const [resolvedJson, setResolvedJson] = useState<UIComponent | UIComponent[]>(
    json || []
  );

  useEffect(() => {
    if (typeof jsonSource === 'function') {
      const val = jsonSource();
      setResolvedJson(val);
    } else if (isObservable(jsonSource)) {
      const sub = jsonSource.subscribe(setResolvedJson);
      return () => sub.unsubscribe();
    } else if (jsonSource) {
      setResolvedJson(jsonSource);
    } else if (json) {
      setResolvedJson(json);
    }
    return () => {};
  }, [jsonSource, json]);
  const renderTree = Array.isArray(resolvedJson)
    ? resolvedJson.map((c, idx) => (
        <Fragment key={idx}>{renderUIComponent(c)}</Fragment>
      ))
    : renderUIComponent(resolvedJson);

  return <>{renderTree}</>;
};

export { JSONUI, JSONUIEnums };
export type { UIComponent };
