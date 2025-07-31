import { JSONUIEnums } from "./types";
import type { UIComponent, UseComponent } from "./types";


type ComponentEntry<Props extends object = any> = {
  ref: string,
  json: UIComponent
  propsType?: Props;
  defaultProps?: Partial<Props>
}

const registry = new Map<string, ComponentEntry>();

const registerJSONComponent = <Props extends object>(ref: string, json: UIComponent,props: Partial<Props> = {} ): void => {
  const entry: ComponentEntry<Props> = { ref, json, propsType: {} as Props,defaultProps: props, }
  registry.set(ref, entry)
}

const getComponentEntry = (ref: string): ComponentEntry | null => registry.get(ref) ?? null;

const resolvePlaceholders = (
  template: any,
  props: Record<string, any>
): any => {
  if (typeof template === "string") {
    return template.replace(/{{(.*?)}}/g, (_, key) => {
      const value = props?.[key.trim()];
      return value !== undefined ? String(value) : "";
    });
  }
  if (typeof template === "object" && template !== null) {
    const result: any = Array.isArray(template) ? [] : {};
    for (const k in template) {
      result[k] = resolvePlaceholders(template[k], props);
    }
    return result;
  }
  return template;
};
const defineUseComponent = <TRef extends string, TProps extends Record<string, any>>(ref: TRef, props: TProps, json: UIComponent): UseComponent<TRef, TProps> => {
  registerJSONComponent<TProps>(ref, json,props);
  return {
    type: JSONUIEnums.CustomTypes.useComponent,
    ref,
    props,
  }
}
export { registerJSONComponent, getComponentEntry, resolvePlaceholders, defineUseComponent }
