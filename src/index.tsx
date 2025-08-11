import { Fragment, useEffect, useMemo, useState } from 'react';
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
  const [observableValue, setObservableValue] = useState<UIComponent | UIComponent[]>(
    json || []
  );

  useEffect(()=>{
    if(isObservable(jsonSource)){
      const sub = jsonSource.subscribe(setObservableValue);
      return () => sub.unsubscribe()
    }
    return ()=>{}
  },[jsonSource])

  const resolvedJson = useMemo(()=>{
    if(isObservable(jsonSource)){
      return observableValue ?? [];
    }
    if(typeof jsonSource === "function"){
      return jsonSource();
    }
    if(jsonSource){
      return jsonSource
    }
    return json ?? []
  },[json,jsonSource,observableValue])

  const renderTree = Array.isArray(resolvedJson)
    ? resolvedJson.map((c, idx) => (
        <Fragment key={idx}>{renderUIComponent(c)}</Fragment>
      ))
    : renderUIComponent(resolvedJson);

  return <>{renderTree}</>;
};

export { JSONUI, JSONUIEnums };
export type { UIComponent };
