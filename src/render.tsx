import {
  Button,
  KeyboardAvoidingView,
  Pressable,
  SectionList,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ImageBackground } from "expo-image";
import { Fragment, useMemo } from "react";
import { FlashList } from "@shopify/flash-list";
import { getCachedStyle } from "smh-rn-styles-cache";
import MaskedView from "@react-native-masked-view/masked-view";
import Checkbox from "expo-checkbox";
import { LinearGradient } from "expo-linear-gradient";
import { GLView } from "expo-gl";
import { LivePhotoView } from "expo-live-photo";
import { MeshGradientView } from "expo-mesh-gradient";
import { StatusBar } from "expo-status-bar";
import { VideoView } from "expo-video";
import Slider from "@react-native-community/slider";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import LottieView from "lottie-react-native";
import DateTimePicker from "react-native-modal-datetime-picker";
import { getComponentEntry, resolvePlaceholders } from "./custom";
import { BlurView } from "expo-blur";
import { CameraView } from "expo-camera";
import PagerView from "react-native-pager-view";
import { Picker } from "@react-native-picker/picker";
import type {PickerItemProps} from "@react-native-picker/picker"
import { JSONUIEnums } from "./types";
import type {UIComponent, UseComponent} from "./types"
import { useMappingHelpers } from "./context/mappingHelpers";

const UseComponentWrapper = ({ ref, props,properties }: UseComponent) => {
  const entry = getComponentEntry(ref);
  if (!entry) return null;

  const resolvedComponent = useMemo(() => {
    const mergedProps = { ...entry.defaultProps, ...props };
    const json = resolvePlaceholders(entry.json,mergedProps)

    if(json.type === JSONUIEnums.ContainerTypes.ViewContainer){
      return {
        ...json,
        properties:properties ?? json.properties
      }
    }
    return json;
  }, [entry, props,properties]);

  return <>{renderUIComponent(resolvedComponent)}</>;
};

const ViewContainerWrappers = {
  View: View,
  SafeAreaView: SafeAreaView,
  KeyboardAvoidingView: KeyboardAvoidingView,
  Pressable: Pressable,
  TouchableHighlight: TouchableHighlight,
  TouchableOpacity: TouchableOpacity,
  TouchableWithoutFeedback: TouchableWithoutFeedback,
  BlurView:BlurView,
  CameraView:CameraView,
  PagerView:PagerView
};

const recursiveRenderUIComponent = (component: any) => {
  return component ? () => renderUIComponent(component) : undefined;
};

const cacheSingleStyle = (style: any) => {
  if (!style) return {};
  return getCachedStyle(style);
};

const renderFlashList = (props: any, components: any) => {
  const {
    headerComponent,
    footerComponent,
    emptyComponent,
    itemSeparatorComponent,
    cellRendererComponent,
    stickyHeaderComponent,
  } = components || {};
  return (
    <FlashList
      {...props}
      ListHeaderComponent={recursiveRenderUIComponent(headerComponent)}
      ListFooterComponent={recursiveRenderUIComponent(footerComponent)}
      ListEmptyComponent={recursiveRenderUIComponent(emptyComponent)}
      ItemSeparatorComponent={recursiveRenderUIComponent(
        itemSeparatorComponent,
      )}
      CellRendererComponent={recursiveRenderUIComponent(cellRendererComponent)}
      StickyHeaderComponent={recursiveRenderUIComponent(stickyHeaderComponent)}
      renderItem={({ item: listItem }) => renderUIComponent(listItem)}
    />
  );
};

const renderSectionList = (props: any, components: any) => {
  const {
    headerComponent,
    footerComponent,
    emptyComponent,
    itemSeparatorComponent,
    sectionHeaderComponent,
    sectionSeparatorComponent,
    cellRendererComponent,
  } = components;

  return (
    <SectionList
      {...props}
      renderItem={({ item }) => renderUIComponent(item)}
      renderSectionHeader={renderUIComponent(sectionHeaderComponent)}
      ListHeaderComponent={recursiveRenderUIComponent(headerComponent)}
      ListFooterComponent={recursiveRenderUIComponent(footerComponent)}
      ListEmptyComponent={recursiveRenderUIComponent(emptyComponent)}
      ItemSeparatorComponent={recursiveRenderUIComponent(
        itemSeparatorComponent,
      )}
      SectionSeparatorComponent={recursiveRenderUIComponent(
        sectionSeparatorComponent,
      )}
      CellRendererComponent={recursiveRenderUIComponent(cellRendererComponent)}
    />
  );
};

const renderUIComponent = (item: any) => {
  const {getMappingKey} = useMappingHelpers()
  const { ContainerTypes, LeafTypes, ViewWrapperTypes,CustomTypes } = JSONUIEnums;
  const {
    // Common
    type,
    showIf,
    props,

    // TextComponent
    value,

    // ViewContainerComponent
    wrapperComponent,

    // ListContainerComponent, ViewListContainerComponent
    components,

    // ViewListContainerComponent
    listProps,
  } = item;

  if (showIf && typeof showIf === "function" && !showIf(item)) return null;
  if (showIf === false) return null;

  switch (type) {
    case LeafTypes.Button:
      return <Button {...props} />;
    case LeafTypes.Text:
      return <Text style={cacheSingleStyle(props?.style)}>{value}</Text>;
    case LeafTypes.Image:
      return <Image {...props} style={cacheSingleStyle(props?.style)} />;
    case LeafTypes.ImageBackground:
      return (
        <ImageBackground
          {...props}
          style={cacheSingleStyle(props?.style)}
          imageStyle={cacheSingleStyle(props?.style)}
        />
      );
    case LeafTypes.TextInput:
      return <TextInput {...props} style={cacheSingleStyle(props?.style)} />;
    case LeafTypes.SectionList:
      return renderSectionList(props, components);
    case LeafTypes.Checkbox:
      return <Checkbox {...props} style={cacheSingleStyle(props?.style)} />;
    case LeafTypes.LinearGradient:
      return (
        <LinearGradient {...props} style={cacheSingleStyle(props?.style)}>
          {(item.children || []).map(
            (child: UIComponent, idx: number) => (
              <Fragment key={getMappingKey(JSON.stringify(child),idx)}>{renderUIComponent(child)}</Fragment>
            ),
          )}
        </LinearGradient>
      );
    case LeafTypes.GLView:
      return <GLView {...props} style={cacheSingleStyle(props?.style)} />;
    case LeafTypes.LivePhotoView:
      return (
        <LivePhotoView {...props} style={cacheSingleStyle(props?.style)} />
      );
    case LeafTypes.MeshGradientView:
      return (
        <MeshGradientView {...props} style={cacheSingleStyle(props?.style)} />
      );
    case LeafTypes.StatusBar:
      return <StatusBar {...props} style={cacheSingleStyle(props?.style)} />;
    case LeafTypes.VideoView:
      return <VideoView {...props} style={cacheSingleStyle(props?.style)} />;
    case LeafTypes.DateTimePicker:
      return (
        <DateTimePicker {...props} style={cacheSingleStyle(props?.style)} />
      );
    case LeafTypes.Slider:
      return <Slider {...props} style={cacheSingleStyle(props?.style)} />;
    case LeafTypes.MaskedView:
      const maskElement = renderUIComponent(item.maskElement);
      if (!maskElement) {
        throw new Error("MaskedView requires a valid maskElement.");
      }
      return (
        <MaskedView maskElement={maskElement}>
          {(item.children || []).map(
            (child: UIComponent, idx: number) => (
              <Fragment key={getMappingKey(JSON.stringify(child),idx)}>{renderUIComponent(child)}</Fragment>
            ),
          )}
        </MaskedView>
      );
    case LeafTypes.SegmentedControl:
      return (
        <SegmentedControl
          {...props}
          style={cacheSingleStyle(props?.style)}
          tabStyle={cacheSingleStyle(props?.tabStyle)}
          fontStyle={cacheSingleStyle(props?.fontStyle)}
          sliderStyle={cacheSingleStyle(props?.sliderStyle)}
          activeFontStyle={cacheSingleStyle(props?.activeFontStyle)}
        />
      );
    case LeafTypes.Picker:
      return (
        <Picker
          {...props}
          style={cacheSingleStyle(props?.style)}
          itemStyle={cacheSingleStyle(props?.itemStyle)}
        >
          {item.items.map((child: PickerItemProps, idx: number) => (
            <Picker.Item {...child} key={idx} />
          ))}
        </Picker>
      );
    case LeafTypes.LottieView:
      return <LottieView {...props} style={cacheSingleStyle(props?.style)} />;

    case ContainerTypes.ViewContainer:
      return (
        <View {...props} style={cacheSingleStyle(props?.style)}>
          {item.properties.map((item: UIComponent, idx: number) => (
            <Fragment key={getMappingKey(JSON.stringify(item),idx)}>{renderUIComponent(item)}</Fragment>
          ))}
        </View>
      );
    case ContainerTypes.ListContainer:
      return renderFlashList(props, components);
    case ContainerTypes.ViewListContainer:
      console.log("ViewList container");
      const wrapperKey = (wrapperComponent ||
        ViewWrapperTypes.View) as keyof typeof ViewContainerWrappers;
      const Wrapper = ViewContainerWrappers[wrapperKey] as React.ComponentType<any>;
      return (
        <Wrapper {...props} style={cacheSingleStyle(props?.style)}>
          {renderFlashList(listProps, components)}
        </Wrapper>
      );
    case CustomTypes.useComponent:
      return <UseComponentWrapper {...item}/>

    default:
      console.warn("Unknown UI component type", type);
      return null;
  }
};

export default renderUIComponent;
