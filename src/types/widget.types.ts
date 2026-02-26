/**
 * Widget Type Definitions
 * 
 * Defines the complete type system for all draggable/configurable widgets
 * in the LCNC Application Builder. Each widget type has its own property
 * interface extending the base WidgetConfig.
 */

/* ──────────────────────────────────────────────
 * Enumerations
 * ────────────────────────────────────────────── */

/** All supported widget categories for the component panel */
export enum WidgetCategory {
  Layout = 'layout',
  Input = 'input',
  Display = 'display',
  Navigation = 'navigation',
  Media = 'media',
  Data = 'data',
  Feedback = 'feedback',
  Advanced = 'advanced',
}

/** All supported widget type identifiers */
export enum WidgetType {
  // Layout
  Container = 'container',
  Row = 'row',
  Column = 'column',
  Stack = 'stack',
  Grid = 'grid',
  Spacer = 'spacer',
  Divider = 'divider',
  ScrollView = 'scroll-view',
  Card = 'card',
  Accordion = 'accordion',
  Tabs = 'tabs',

  // Input
  TextInput = 'text-input',
  TextArea = 'text-area',
  NumberInput = 'number-input',
  Checkbox = 'checkbox',
  Radio = 'radio',
  Toggle = 'toggle',
  Dropdown = 'dropdown',
  Slider = 'slider',
  DatePicker = 'date-picker',
  TimePicker = 'time-picker',
  FilePicker = 'file-picker',
  ColorPicker = 'color-picker',

  // Display
  Text = 'text',
  Heading = 'heading',
  Paragraph = 'paragraph',
  Badge = 'badge',
  Tag = 'tag',
  Avatar = 'avatar',
  Icon = 'icon',
  Tooltip = 'tooltip',
  ProgressBar = 'progress-bar',
  Chip = 'chip',

  // Navigation
  Button = 'button',
  IconButton = 'icon-button',
  Link = 'link',
  Navbar = 'navbar',
  Sidebar = 'sidebar',
  Breadcrumb = 'breadcrumb',
  Pagination = 'pagination',
  BottomNav = 'bottom-nav',
  Drawer = 'drawer',
  FloatingActionButton = 'fab',

  // Media
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Carousel = 'carousel',
  Map = 'map',
  Lottie = 'lottie',

  // Data
  Table = 'table',
  DataGrid = 'data-grid',
  List = 'list',
  TreeView = 'tree-view',
  Chart = 'chart',
  Form = 'form',

  // Feedback
  Alert = 'alert',
  Toast = 'toast',
  Modal = 'modal',
  Dialog = 'dialog',
  Snackbar = 'snackbar',
  Skeleton = 'skeleton',
  Spinner = 'spinner',
}

/** Layout direction for container widgets */
export enum FlexDirection {
  Row = 'row',
  Column = 'column',
  RowReverse = 'row-reverse',
  ColumnReverse = 'column-reverse',
}

/** Alignment options */
export enum Alignment {
  Start = 'flex-start',
  Center = 'center',
  End = 'flex-end',
  Stretch = 'stretch',
  SpaceBetween = 'space-between',
  SpaceAround = 'space-around',
  SpaceEvenly = 'space-evenly',
  Baseline = 'baseline',
}

/** Text alignment */
export enum TextAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right',
  Justify = 'justify',
}

/** Font weight options */
export enum FontWeight {
  Thin = '100',
  ExtraLight = '200',
  Light = '300',
  Regular = '400',
  Medium = '500',
  SemiBold = '600',
  Bold = '700',
  ExtraBold = '800',
  Black = '900',
}

/** Overflow behavior */
export enum Overflow {
  Visible = 'visible',
  Hidden = 'hidden',
  Scroll = 'scroll',
  Auto = 'auto',
}

/** Position type */
export enum PositionType {
  Static = 'static',
  Relative = 'relative',
  Absolute = 'absolute',
  Fixed = 'fixed',
  Sticky = 'sticky',
}

/** Display type */
export enum DisplayType {
  Block = 'block',
  Flex = 'flex',
  Grid = 'grid',
  InlineBlock = 'inline-block',
  InlineFlex = 'inline-flex',
  None = 'none',
}

/** Border style */
export enum BorderStyle {
  None = 'none',
  Solid = 'solid',
  Dashed = 'dashed',
  Dotted = 'dotted',
  Double = 'double',
}

/** Button variant */
export enum ButtonVariant {
  Solid = 'solid',
  Outline = 'outline',
  Ghost = 'ghost',
  Link = 'link',
  Gradient = 'gradient',
}

/** Input variant */
export enum InputVariant {
  Outlined = 'outlined',
  Filled = 'filled',
  Underlined = 'underlined',
  Borderless = 'borderless',
}

/** Size variants */
export enum SizeVariant {
  XSmall = 'xs',
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
  XLarge = 'xl',
}

/* ──────────────────────────────────────────────
 * Core Value Types
 * ────────────────────────────────────────────── */

/** Represents a CSS dimension value with unit */
export interface DimensionValue {
  readonly value: number;
  readonly unit: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'auto' | 'fr';
}

/** Represents spacing (padding/margin) on each side */
export interface SpacingValue {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

/** Border radius for each corner */
export interface BorderRadiusValue {
  readonly topLeft: number;
  readonly topRight: number;
  readonly bottomRight: number;
  readonly bottomLeft: number;
}

/** Border configuration */
export interface BorderValue {
  readonly width: number;
  readonly style: BorderStyle;
  readonly color: string;
}

/** Shadow configuration */
export interface ShadowValue {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly blurRadius: number;
  readonly spreadRadius: number;
  readonly color: string;
  readonly inset: boolean;
}

/** Gradient stop */
export interface GradientStop {
  readonly color: string;
  readonly position: number; // 0-100
}

/** Background configuration */
export interface BackgroundValue {
  readonly type: 'solid' | 'gradient' | 'image';
  readonly color?: string;
  readonly gradientType?: 'linear' | 'radial' | 'conic';
  readonly gradientAngle?: number;
  readonly gradientStops?: readonly GradientStop[];
  readonly imageUrl?: string;
  readonly imageSize?: 'cover' | 'contain' | 'auto';
  readonly imagePosition?: string;
  readonly imageRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
}

/** Transform configuration */
export interface TransformValue {
  readonly translateX: number;
  readonly translateY: number;
  readonly rotate: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly skewX: number;
  readonly skewY: number;
}

/** Transition configuration */
export interface TransitionValue {
  readonly property: string;
  readonly duration: number; // ms
  readonly timingFunction: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  readonly delay: number; // ms
}

/* ──────────────────────────────────────────────
 * Style Interface
 * ────────────────────────────────────────────── */

/** Complete style definition applied to any widget */
export interface WidgetStyle {
  // Dimensions
  readonly width?: DimensionValue;
  readonly height?: DimensionValue;
  readonly minWidth?: DimensionValue;
  readonly maxWidth?: DimensionValue;
  readonly minHeight?: DimensionValue;
  readonly maxHeight?: DimensionValue;

  // Spacing
  readonly padding?: SpacingValue;
  readonly margin?: SpacingValue;

  // Layout
  readonly display?: DisplayType;
  readonly position?: PositionType;
  readonly flexDirection?: FlexDirection;
  readonly justifyContent?: Alignment;
  readonly alignItems?: Alignment;
  readonly alignSelf?: Alignment;
  readonly flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  readonly flexGrow?: number;
  readonly flexShrink?: number;
  readonly flexBasis?: DimensionValue;
  readonly gap?: number;
  readonly order?: number;
  readonly gridTemplateColumns?: string;
  readonly gridTemplateRows?: string;

  // Positioning
  readonly top?: DimensionValue;
  readonly right?: DimensionValue;
  readonly bottom?: DimensionValue;
  readonly left?: DimensionValue;
  readonly zIndex?: number;

  // Background
  readonly background?: BackgroundValue;
  readonly opacity?: number;

  // Border
  readonly border?: BorderValue;
  readonly borderTop?: BorderValue;
  readonly borderRight?: BorderValue;
  readonly borderBottom?: BorderValue;
  readonly borderLeft?: BorderValue;
  readonly borderRadius?: BorderRadiusValue;

  // Shadow
  readonly boxShadow?: readonly ShadowValue[];
  readonly textShadow?: readonly ShadowValue[];

  // Typography
  readonly fontSize?: number;
  readonly fontWeight?: FontWeight;
  readonly fontFamily?: string;
  readonly lineHeight?: number;
  readonly letterSpacing?: number;
  readonly textAlign?: TextAlign;
  readonly textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  readonly textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  readonly color?: string;

  // Overflow
  readonly overflow?: Overflow;
  readonly overflowX?: Overflow;
  readonly overflowY?: Overflow;

  // Transforms
  readonly transform?: TransformValue;
  readonly transformOrigin?: string;

  // Transitions
  readonly transitions?: readonly TransitionValue[];

  // Cursor
  readonly cursor?: string;

  // Filters
  readonly backdropBlur?: number;
  readonly blur?: number;
  readonly brightness?: number;
  readonly contrast?: number;
  readonly saturate?: number;

  // Custom CSS
  readonly customCSS?: string;
}

/* ──────────────────────────────────────────────
 * Event & Action Types
 * ────────────────────────────────────────────── */

/** Supported event types on widgets */
export enum WidgetEventType {
  OnClick = 'onClick',
  OnDoubleClick = 'onDoubleClick',
  OnHover = 'onHover',
  OnHoverEnd = 'onHoverEnd',
  OnFocus = 'onFocus',
  OnBlur = 'onBlur',
  OnChange = 'onChange',
  OnSubmit = 'onSubmit',
  OnLoad = 'onLoad',
  OnScroll = 'onScroll',
  OnSwipe = 'onSwipe',
  OnLongPress = 'onLongPress',
  OnDrag = 'onDrag',
  OnDrop = 'onDrop',
}

/** Action types that can be triggered by events */
export enum ActionType {
  Navigate = 'navigate',
  SetState = 'setState',
  CallAPI = 'callAPI',
  ShowModal = 'showModal',
  HideModal = 'hideModal',
  ShowToast = 'showToast',
  ToggleVisibility = 'toggleVisibility',
  SetVariable = 'setVariable',
  RunFunction = 'runFunction',
  PlayAnimation = 'playAnimation',
  ScrollTo = 'scrollTo',
  CopyToClipboard = 'copyToClipboard',
  DownloadFile = 'downloadFile',
  OpenURL = 'openURL',
  GoBack = 'goBack',
  Custom = 'custom',
}

/** An event handler binding on a widget */
export interface WidgetEventHandler {
  readonly id: string;
  readonly eventType: WidgetEventType;
  readonly actions: readonly WidgetAction[];
  readonly condition?: string; // Expression to evaluate
}

/** An action to execute */
export interface WidgetAction {
  readonly id: string;
  readonly type: ActionType;
  readonly params: Record<string, unknown>;
  readonly delay?: number; // ms
  readonly condition?: string;
}

/* ──────────────────────────────────────────────
 * Data Binding Types
 * ────────────────────────────────────────────── */

/** Types of data sources */
export enum DataSourceType {
  Static = 'static',
  Variable = 'variable',
  APIResponse = 'api-response',
  Formula = 'formula',
  UserInput = 'user-input',
  LocalStorage = 'local-storage',
  URLParam = 'url-param',
}

/** A data binding definition */
export interface DataBinding {
  readonly id: string;
  readonly sourceType: DataSourceType;
  readonly sourcePath: string; // JSONPath or expression
  readonly targetProperty: string; // Widget property to bind to
  readonly transform?: string; // Optional transform expression
  readonly defaultValue?: unknown;
  readonly twoWay?: boolean;
}

/* ──────────────────────────────────────────────
 * Widget Configuration
 * ────────────────────────────────────────────── */

/** Responsive breakpoint overrides */
export interface ResponsiveOverrides {
  readonly mobile?: Partial<WidgetStyle>;
  readonly tablet?: Partial<WidgetStyle>;
  readonly desktop?: Partial<WidgetStyle>;
}

/** Accessibility attributes */
export interface A11yConfig {
  readonly ariaLabel?: string;
  readonly ariaRole?: string;
  readonly ariaDescribedBy?: string;
  readonly ariaLabelledBy?: string;
  readonly ariaHidden?: boolean;
  readonly tabIndex?: number;
  readonly altText?: string;
  readonly semanticTag?: string;
}

/** Animation preset names */
export enum AnimationPreset {
  None = 'none',
  FadeIn = 'fade-in',
  FadeOut = 'fade-out',
  SlideUp = 'slide-up',
  SlideDown = 'slide-down',
  SlideLeft = 'slide-left',
  SlideRight = 'slide-right',
  ScaleIn = 'scale-in',
  ScaleOut = 'scale-out',
  Bounce = 'bounce',
  Shake = 'shake',
  Rotate = 'rotate',
  Pulse = 'pulse',
  Flip = 'flip',
  Pop = 'pop',
}

/** Animation config */
export interface AnimationConfig {
  readonly preset: AnimationPreset;
  readonly duration: number;
  readonly delay: number;
  readonly easing: string;
  readonly iterationCount: number | 'infinite';
  readonly direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  readonly fillMode: 'none' | 'forwards' | 'backwards' | 'both';
  readonly triggerOnScroll?: boolean;
  readonly scrollThreshold?: number;
}

/** Conditional visibility config */
export interface VisibilityConfig {
  readonly visible: boolean;
  readonly condition?: string;
  readonly hideOnMobile?: boolean;
  readonly hideOnTablet?: boolean;
  readonly hideOnDesktop?: boolean;
}

/**
 * Base configuration for all widgets.
 * Every widget instance on the canvas extends this interface.
 */
export interface WidgetConfig {
  /** Unique identifier for this widget instance */
  readonly id: string;
  
  /** Widget type discriminator */
  readonly type: WidgetType;
  
  /** User-visible name in the layer tree */
  readonly name: string;
  
  /** Whether this widget is locked from editing */
  readonly locked: boolean;
  
  /** Visibility configuration */
  readonly visibility: VisibilityConfig;
  
  /** Parent widget ID (null for root-level widgets) */
  readonly parentId: string | null;
  
  /** Ordered list of child widget IDs */
  readonly childIds: readonly string[];
  
  /** Style properties */
  readonly style: WidgetStyle;
  
  /** Responsive overrides per breakpoint */
  readonly responsive: ResponsiveOverrides;
  
  /** Event handlers */
  readonly events: readonly WidgetEventHandler[];
  
  /** Data bindings */
  readonly bindings: readonly DataBinding[];
  
  /** Accessibility config */
  readonly a11y: A11yConfig;
  
  /** Animation configuration */
  readonly animation?: AnimationConfig;
  
  /** Widget-specific properties (varies by type) */
  readonly props: Record<string, unknown>;
  
  /** Canvas position (absolute x, y for free-form mode) */
  readonly position: {
    readonly x: number;
    readonly y: number;
  };
  
  /** Creation timestamp */
  readonly createdAt: number;
  
  /** Last modified timestamp */
  readonly updatedAt: number;
}

/* ──────────────────────────────────────────────
 * Widget-Specific Property Interfaces
 * ────────────────────────────────────────────── */

export interface ButtonProps {
  readonly label: string;
  readonly variant: ButtonVariant;
  readonly size: SizeVariant;
  readonly disabled: boolean;
  readonly loading: boolean;
  readonly icon?: string;
  readonly iconPosition: 'left' | 'right';
  readonly fullWidth: boolean;
}

export interface TextProps {
  readonly content: string;
  readonly variant: 'body' | 'caption' | 'overline' | 'label';
  readonly truncate: boolean;
  readonly maxLines?: number;
  readonly selectable: boolean;
}

export interface HeadingProps {
  readonly content: string;
  readonly level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ImageProps {
  readonly src: string;
  readonly alt: string;
  readonly objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  readonly lazy: boolean;
  readonly placeholder?: string;
  readonly fallback?: string;
}

export interface ContainerProps {
  readonly direction: FlexDirection;
  readonly wrap: boolean;
  readonly scrollable: boolean;
  readonly clipContent: boolean;
}

export interface TextInputProps {
  readonly placeholder: string;
  readonly label: string;
  readonly helperText: string;
  readonly errorText: string;
  readonly variant: InputVariant;
  readonly inputType: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  readonly maxLength?: number;
  readonly pattern?: string;
  readonly required: boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly autoFocus: boolean;
  readonly leadingIcon?: string;
  readonly trailingIcon?: string;
}

export interface TextAreaProps {
  readonly placeholder: string;
  readonly label: string;
  readonly helperText: string;
  readonly errorText: string;
  readonly variant: InputVariant;
  readonly rows: number;
  readonly maxLength?: number;
  readonly required: boolean;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly resizable: boolean;
}

export interface CheckboxProps {
  readonly label: string;
  readonly checked: boolean;
  readonly indeterminate: boolean;
  readonly disabled: boolean;
  readonly size: SizeVariant;
  readonly color: string;
}

export interface RadioProps {
  readonly label: string;
  readonly value: string;
  readonly groupName: string;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly size: SizeVariant;
}

export interface ToggleProps {
  readonly label: string;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly size: SizeVariant;
  readonly onLabel?: string;
  readonly offLabel?: string;
}

export interface DropdownProps {
  readonly label: string;
  readonly placeholder: string;
  readonly options: readonly { label: string; value: string; icon?: string }[];
  readonly multiple: boolean;
  readonly searchable: boolean;
  readonly clearable: boolean;
  readonly disabled: boolean;
  readonly required: boolean;
  readonly variant: InputVariant;
}

export interface SliderProps {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly value: number;
  readonly label: string;
  readonly showValue: boolean;
  readonly showMarks: boolean;
  readonly disabled: boolean;
  readonly color: string;
}

export interface CardProps {
  readonly elevation: 0 | 1 | 2 | 3 | 4;
  readonly hoverable: boolean;
  readonly clickable: boolean;
  readonly outlined: boolean;
}

export interface NavbarProps {
  readonly variant: 'solid' | 'transparent' | 'glass';
  readonly fixed: boolean;
  readonly showShadow: boolean;
  readonly height: number;
  readonly logo?: string;
  readonly title?: string;
}

export interface ListProps {
  readonly dataSource: string;
  readonly itemTemplate: string; // Widget ID of template
  readonly direction: 'vertical' | 'horizontal';
  readonly dividers: boolean;
  readonly emptyMessage: string;
  readonly loading: boolean;
  readonly infiniteScroll: boolean;
  readonly pageSize: number;
}

export interface FormProps {
  readonly action: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly submitOnEnter: boolean;
  readonly resetOnSubmit: boolean;
  readonly validateOnBlur: boolean;
  readonly validateOnChange: boolean;
}

export interface TableProps {
  readonly columns: readonly TableColumn[];
  readonly dataSource: string;
  readonly sortable: boolean;
  readonly filterable: boolean;
  readonly pagination: boolean;
  readonly pageSize: number;
  readonly selectable: boolean;
  readonly striped: boolean;
  readonly bordered: boolean;
  readonly compact: boolean;
  readonly stickyHeader: boolean;
}

export interface TableColumn {
  readonly id: string;
  readonly header: string;
  readonly accessor: string;
  readonly width?: number;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly align?: TextAlign;
  readonly renderAs?: 'text' | 'badge' | 'image' | 'link' | 'custom';
}

export interface ModalProps {
  readonly title: string;
  readonly closable: boolean;
  readonly closeOnOverlayClick: boolean;
  readonly closeOnEsc: boolean;
  readonly size: SizeVariant;
  readonly position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  readonly animation: 'fade' | 'slide' | 'scale' | 'none';
  readonly showOverlay: boolean;
}

export interface ChartProps {
  readonly chartType: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar';
  readonly dataSource: string;
  readonly title: string;
  readonly showLegend: boolean;
  readonly showGrid: boolean;
  readonly showTooltip: boolean;
  readonly animated: boolean;
  readonly colors: readonly string[];
}

export interface IconProps {
  readonly name: string;
  readonly size: number;
  readonly color: string;
  readonly strokeWidth: number;
}

export interface BadgeProps {
  readonly content: string;
  readonly variant: 'solid' | 'outline' | 'dot';
  readonly color: string;
  readonly size: SizeVariant;
}

export interface AvatarProps {
  readonly src?: string;
  readonly name: string;
  readonly size: SizeVariant;
  readonly shape: 'circle' | 'square' | 'rounded';
  readonly showBorder: boolean;
  readonly showStatus: boolean;
  readonly status: 'online' | 'offline' | 'busy' | 'away';
}

export interface AlertProps {
  readonly title: string;
  readonly message: string;
  readonly severity: 'info' | 'success' | 'warning' | 'error';
  readonly closable: boolean;
  readonly showIcon: boolean;
}

export interface ProgressBarProps {
  readonly value: number;
  readonly max: number;
  readonly showLabel: boolean;
  readonly color: string;
  readonly size: SizeVariant;
  readonly animated: boolean;
  readonly striped: boolean;
  readonly indeterminate: boolean;
}

export interface CarouselProps {
  readonly autoplay: boolean;
  readonly interval: number;
  readonly showArrows: boolean;
  readonly showDots: boolean;
  readonly loop: boolean;
  readonly slidesPerView: number;
  readonly direction: 'horizontal' | 'vertical';
  readonly effect: 'slide' | 'fade' | 'cube' | 'coverflow';
}

export interface TabsProps {
  readonly activeTab: number;
  readonly variant: 'underline' | 'pills' | 'enclosed' | 'unstyled';
  readonly orientation: 'horizontal' | 'vertical';
  readonly tabs: readonly { id: string; label: string; icon?: string; disabled?: boolean }[];
}

export interface AccordionProps {
  readonly allowMultiple: boolean;
  readonly defaultExpanded: readonly number[];
  readonly variant: 'default' | 'bordered' | 'separated';
  readonly items: readonly { id: string; title: string; disabled?: boolean }[];
}

export interface DrawerProps {
  readonly position: 'left' | 'right' | 'top' | 'bottom';
  readonly size: DimensionValue;
  readonly closable: boolean;
  readonly showOverlay: boolean;
  readonly closeOnOverlayClick: boolean;
}

export interface MapProps {
  readonly latitude: number;
  readonly longitude: number;
  readonly zoom: number;
  readonly style: 'streets' | 'satellite' | 'dark' | 'light';
  readonly showMarker: boolean;
  readonly interactive: boolean;
}

/* ──────────────────────────────────────────────
 * Widget Registry Definition
 * ────────────────────────────────────────────── */

/** Metadata describing a widget for the component panel */
export interface WidgetDefinition {
  readonly type: WidgetType;
  readonly displayName: string;
  readonly description: string;
  readonly category: WidgetCategory;
  readonly icon: string;
  readonly isContainer: boolean;
  readonly acceptsChildren: boolean;
  readonly maxChildren?: number;
  readonly allowedChildTypes?: readonly WidgetType[];
  readonly defaultProps: Record<string, unknown>;
  readonly defaultStyle: Partial<WidgetStyle>;
  readonly propertySchema: readonly PropertyDefinition[];
  readonly tags: readonly string[];
}

/** Defines a single configurable property for the property panel */
export interface PropertyDefinition {
  readonly key: string;
  readonly label: string;
  readonly type: PropertyFieldType;
  readonly defaultValue: unknown;
  readonly required: boolean;
  readonly group: string;
  readonly description?: string;
  readonly options?: readonly { label: string; value: string }[];
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly placeholder?: string;
  readonly condition?: string; // Show only when expression is true
}

/** Types of property editor fields */
export enum PropertyFieldType {
  Text = 'text',
  TextArea = 'textarea',
  Number = 'number',
  Boolean = 'boolean',
  Color = 'color',
  Select = 'select',
  MultiSelect = 'multi-select',
  Slider = 'slider',
  Image = 'image',
  Icon = 'icon',
  Code = 'code',
  JSON = 'json',
  Expression = 'expression',
  Action = 'action',
  Spacing = 'spacing',
  BorderRadius = 'border-radius',
  Shadow = 'shadow',
  Gradient = 'gradient',
  Font = 'font',
  Dimension = 'dimension',
}

/* ──────────────────────────────────────────────
 * Utility Types
 * ────────────────────────────────────────────── */

/** Deeply partial version of a type */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
      ? readonly DeepPartial<U>[]
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P];
};

/** Make specific keys required and rest optional */
export type RequireKeys<T, K extends keyof T> = Omit<Partial<T>, K> & Pick<T, K>;

/** Widget config creation input (auto-generated fields excluded) */
export type WidgetCreateInput = RequireKeys<
  DeepPartial<WidgetConfig>,
  'type'
>;

/** Widget update payload */
export type WidgetUpdatePayload = {
  readonly id: string;
} & DeepPartial<Omit<WidgetConfig, 'id' | 'type' | 'createdAt'>>;
