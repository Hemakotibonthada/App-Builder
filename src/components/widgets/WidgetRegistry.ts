/**
 * Widget Registry
 * 
 * Complete registry of all available widgets with metadata,
 * default properties, configuration schemas, and source type.
 * 
 * Widgets are segregated into:
 * - DEFAULT: Built-in widgets shipped with AppBuilder
 * - USER_CREATED: Custom widgets created by the user
 */

import {
  WidgetType,
  WidgetCategory,
  WidgetDefinition,
  PropertyFieldType,
  ButtonVariant,
  SizeVariant,
  InputVariant,
  FlexDirection,
  BorderStyle,
  DisplayType,
  FontWeight,
  TextAlign,
  Overflow,
} from '@/types/widget.types';

/* ──────────────────────────────────────────────
 * Source Types
 * ────────────────────────────────────────────── */

export type WidgetSourceType = 'default' | 'user-created';

export interface ExtendedWidgetDefinition extends WidgetDefinition {
  readonly source: WidgetSourceType;
}

/* ── shorthand helper ── */
const def = (w: Omit<ExtendedWidgetDefinition, 'source'>): ExtendedWidgetDefinition => ({ ...w, source: 'default' } as ExtendedWidgetDefinition);

/* ──────────────────────────────────────────────
 * DEFAULT WIDGETS — Layout  (12)
 * ────────────────────────────────────────────── */

const LAYOUT_WIDGETS: ExtendedWidgetDefinition[] = [
  def({ type: WidgetType.Container, displayName: 'Container', description: 'Flexible box container', category: WidgetCategory.Layout, icon: 'Square', isContainer: true, acceptsChildren: true, defaultProps: { direction: 'column' }, defaultStyle: { display: DisplayType.Flex, flexDirection: FlexDirection.Column, width: { value: 100, unit: '%' }, height: { value: 200, unit: 'px' }, padding: { top: 16, right: 16, bottom: 16, left: 16 }, gap: 8 }, propertySchema: [{ key: 'direction', label: 'Direction', type: PropertyFieldType.Select, defaultValue: 'column', required: false, group: 'Layout', options: [{ label: 'Row', value: 'row' }, { label: 'Column', value: 'column' }] }], tags: ['layout', 'container', 'flex', 'div'] }),
  def({ type: WidgetType.Row, displayName: 'Row', description: 'Horizontal layout', category: WidgetCategory.Layout, icon: 'Columns', isContainer: true, acceptsChildren: true, defaultProps: {}, defaultStyle: { display: DisplayType.Flex, flexDirection: FlexDirection.Row, width: { value: 100, unit: '%' }, height: { value: 60, unit: 'px' }, gap: 8 }, propertySchema: [], tags: ['layout', 'row', 'horizontal'] }),
  def({ type: WidgetType.Column, displayName: 'Column', description: 'Vertical layout', category: WidgetCategory.Layout, icon: 'Rows', isContainer: true, acceptsChildren: true, defaultProps: {}, defaultStyle: { display: DisplayType.Flex, flexDirection: FlexDirection.Column, width: { value: 100, unit: '%' }, height: { value: 200, unit: 'px' }, gap: 8 }, propertySchema: [], tags: ['layout', 'column', 'vertical'] }),
  def({ type: WidgetType.Stack, displayName: 'Stack', description: 'Layered z-axis container', category: WidgetCategory.Layout, icon: 'Layers', isContainer: true, acceptsChildren: true, defaultProps: {}, defaultStyle: { width: { value: 200, unit: 'px' }, height: { value: 200, unit: 'px' } }, propertySchema: [], tags: ['layout', 'stack', 'overlay'] }),
  def({ type: WidgetType.Grid, displayName: 'Grid', description: 'CSS Grid layout', category: WidgetCategory.Layout, icon: 'LayoutGrid', isContainer: true, acceptsChildren: true, defaultProps: { columns: 2 }, defaultStyle: { display: DisplayType.Grid, gridTemplateColumns: 'repeat(2, 1fr)', width: { value: 100, unit: '%' }, height: { value: 200, unit: 'px' }, gap: 8 }, propertySchema: [{ key: 'columns', label: 'Columns', type: PropertyFieldType.Number, defaultValue: 2, required: false, group: 'Layout', min: 1, max: 12 }], tags: ['layout', 'grid'] }),
  def({ type: WidgetType.ScrollView, displayName: 'Scroll View', description: 'Scrollable area', category: WidgetCategory.Layout, icon: 'ScrollText', isContainer: true, acceptsChildren: true, defaultProps: { direction: 'vertical' }, defaultStyle: { display: DisplayType.Flex, flexDirection: FlexDirection.Column, width: { value: 100, unit: '%' }, height: { value: 300, unit: 'px' }, overflow: Overflow.Auto }, propertySchema: [], tags: ['layout', 'scroll'] }),
  def({ type: WidgetType.Card, displayName: 'Card', description: 'Elevated card with shadow', category: WidgetCategory.Layout, icon: 'CreditCard', isContainer: true, acceptsChildren: true, defaultProps: { elevation: 1 }, defaultStyle: { display: DisplayType.Flex, flexDirection: FlexDirection.Column, width: { value: 320, unit: 'px' }, height: { value: 200, unit: 'px' }, padding: { top: 16, right: 16, bottom: 16, left: 16 }, borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 }, background: { type: 'solid', color: '#1a1a25' }, border: { width: 1, style: BorderStyle.Solid, color: 'rgba(255,255,255,0.06)' }, boxShadow: [{ offsetX: 0, offsetY: 4, blurRadius: 16, spreadRadius: 0, color: 'rgba(0,0,0,0.2)', inset: false }] }, propertySchema: [{ key: 'elevation', label: 'Elevation', type: PropertyFieldType.Slider, defaultValue: 1, required: false, group: 'Appearance', min: 0, max: 4, step: 1 }], tags: ['layout', 'card', 'panel'] }),
  def({ type: WidgetType.Accordion, displayName: 'Accordion', description: 'Expandable sections', category: WidgetCategory.Layout, icon: 'ChevronDown', isContainer: true, acceptsChildren: true, defaultProps: { items: [{ id: '1', title: 'Section 1' }, { id: '2', title: 'Section 2' }] }, defaultStyle: { width: { value: 100, unit: '%' }, height: { value: 160, unit: 'px' } }, propertySchema: [], tags: ['layout', 'accordion', 'collapse'] }),
  def({ type: WidgetType.Tabs, displayName: 'Tabs', description: 'Tab navigation', category: WidgetCategory.Layout, icon: 'PanelTop', isContainer: true, acceptsChildren: true, defaultProps: { activeTab: 0, tabs: [{ id: '1', label: 'Tab 1' }, { id: '2', label: 'Tab 2' }, { id: '3', label: 'Tab 3' }] }, defaultStyle: { width: { value: 100, unit: '%' }, height: { value: 200, unit: 'px' } }, propertySchema: [], tags: ['layout', 'tabs'] }),
  def({ type: WidgetType.Divider, displayName: 'Divider', description: 'Separator line', category: WidgetCategory.Layout, icon: 'Minus', isContainer: false, acceptsChildren: false, defaultProps: {}, defaultStyle: { width: { value: 100, unit: '%' }, height: { value: 1, unit: 'px' } }, propertySchema: [], tags: ['layout', 'divider', 'hr'] }),
  def({ type: WidgetType.Spacer, displayName: 'Spacer', description: 'Empty spacing', category: WidgetCategory.Layout, icon: 'Space', isContainer: false, acceptsChildren: false, defaultProps: { size: 24 }, defaultStyle: { width: { value: 100, unit: '%' }, height: { value: 24, unit: 'px' } }, propertySchema: [{ key: 'size', label: 'Size', type: PropertyFieldType.Number, defaultValue: 24, required: false, group: 'Layout', min: 4, max: 200 }], tags: ['layout', 'spacer'] }),
];

/* ──────────────────────────────────────────────
 * DEFAULT WIDGETS — Display & Typography  (11)
 * ────────────────────────────────────────────── */

const DISPLAY_WIDGETS: ExtendedWidgetDefinition[] = [
  def({ type: WidgetType.Text, displayName: 'Text', description: 'Text content', category: WidgetCategory.Display, icon: 'Type', isContainer: false, acceptsChildren: false, defaultProps: { content: 'Text content' }, defaultStyle: { width: { value: 200, unit: 'px' }, height: { value: 24, unit: 'px' }, fontSize: 14, color: '#e2e8f0' }, propertySchema: [{ key: 'content', label: 'Content', type: PropertyFieldType.TextArea, defaultValue: 'Text content', required: true, group: 'Content' }], tags: ['display', 'text'] }),
  def({ type: WidgetType.Heading, displayName: 'Heading', description: 'Heading H1–H6', category: WidgetCategory.Display, icon: 'Heading', isContainer: false, acceptsChildren: false, defaultProps: { content: 'Heading', level: 2 }, defaultStyle: { width: { value: 300, unit: 'px' }, height: { value: 40, unit: 'px' }, fontSize: 24, fontWeight: FontWeight.Bold, color: '#e2e8f0' }, propertySchema: [{ key: 'content', label: 'Content', type: PropertyFieldType.Text, defaultValue: 'Heading', required: true, group: 'Content' }, { key: 'level', label: 'Level', type: PropertyFieldType.Select, defaultValue: 2, required: false, group: 'Appearance', options: [{ label: 'H1', value: '1' }, { label: 'H2', value: '2' }, { label: 'H3', value: '3' }, { label: 'H4', value: '4' }, { label: 'H5', value: '5' }, { label: 'H6', value: '6' }] }], tags: ['display', 'heading', 'title'] }),
  def({ type: WidgetType.Paragraph, displayName: 'Paragraph', description: 'Body paragraph text', category: WidgetCategory.Display, icon: 'AlignLeft', isContainer: false, acceptsChildren: false, defaultProps: { content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.' }, defaultStyle: { width: { value: 300, unit: 'px' }, height: { value: 60, unit: 'px' }, fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }, propertySchema: [{ key: 'content', label: 'Content', type: PropertyFieldType.TextArea, defaultValue: 'Lorem ipsum...', required: true, group: 'Content' }], tags: ['display', 'paragraph'] }),
  def({ type: WidgetType.Badge, displayName: 'Badge', description: 'Status badge', category: WidgetCategory.Display, icon: 'Tag', isContainer: false, acceptsChildren: false, defaultProps: { content: 'Badge', color: '#6366f1' }, defaultStyle: { width: { value: 60, unit: 'px' }, height: { value: 24, unit: 'px' } }, propertySchema: [{ key: 'content', label: 'Text', type: PropertyFieldType.Text, defaultValue: 'Badge', required: true, group: 'Content' }, { key: 'color', label: 'Color', type: PropertyFieldType.Color, defaultValue: '#6366f1', required: false, group: 'Appearance' }], tags: ['display', 'badge', 'tag'] }),
  def({ type: WidgetType.Tag, displayName: 'Tag', description: 'Removable tag', category: WidgetCategory.Display, icon: 'Hash', isContainer: false, acceptsChildren: false, defaultProps: { label: 'Tag', removable: true, color: '#6366f1' }, defaultStyle: { width: { value: 70, unit: 'px' }, height: { value: 28, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Tag', required: true, group: 'Content' }, { key: 'color', label: 'Color', type: PropertyFieldType.Color, defaultValue: '#6366f1', required: false, group: 'Appearance' }], tags: ['display', 'tag', 'chip'] }),
  def({ type: WidgetType.Chip, displayName: 'Chip', description: 'Interactive chip', category: WidgetCategory.Display, icon: 'Circle', isContainer: false, acceptsChildren: false, defaultProps: { label: 'Chip', selected: false }, defaultStyle: { width: { value: 80, unit: 'px' }, height: { value: 32, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Chip', required: true, group: 'Content' }], tags: ['display', 'chip'] }),
  def({ type: WidgetType.Avatar, displayName: 'Avatar', description: 'User avatar', category: WidgetCategory.Display, icon: 'User', isContainer: false, acceptsChildren: false, defaultProps: { name: 'John Doe', shape: 'circle', showStatus: false, status: 'online' }, defaultStyle: { width: { value: 40, unit: 'px' }, height: { value: 40, unit: 'px' } }, propertySchema: [{ key: 'name', label: 'Name', type: PropertyFieldType.Text, defaultValue: 'John Doe', required: true, group: 'Content' }, { key: 'shape', label: 'Shape', type: PropertyFieldType.Select, defaultValue: 'circle', required: false, group: 'Appearance', options: [{ label: 'Circle', value: 'circle' }, { label: 'Square', value: 'square' }, { label: 'Rounded', value: 'rounded' }] }], tags: ['display', 'avatar', 'user'] }),
  def({ type: WidgetType.Icon, displayName: 'Icon', description: 'SVG icon', category: WidgetCategory.Display, icon: 'Star', isContainer: false, acceptsChildren: false, defaultProps: { name: 'Star', size: 24, color: '#94a3b8', strokeWidth: 2 }, defaultStyle: { width: { value: 24, unit: 'px' }, height: { value: 24, unit: 'px' } }, propertySchema: [{ key: 'name', label: 'Icon', type: PropertyFieldType.Icon, defaultValue: 'Star', required: true, group: 'Content' }, { key: 'size', label: 'Size', type: PropertyFieldType.Number, defaultValue: 24, required: false, group: 'Appearance', min: 8, max: 128 }, { key: 'color', label: 'Color', type: PropertyFieldType.Color, defaultValue: '#94a3b8', required: false, group: 'Appearance' }], tags: ['display', 'icon'] }),
  def({ type: WidgetType.Tooltip, displayName: 'Tooltip', description: 'Hover tooltip', category: WidgetCategory.Display, icon: 'MessageCircle', isContainer: true, acceptsChildren: true, defaultProps: { text: 'Tooltip text', position: 'top' }, defaultStyle: { width: { value: 120, unit: 'px' }, height: { value: 32, unit: 'px' } }, propertySchema: [{ key: 'text', label: 'Text', type: PropertyFieldType.Text, defaultValue: 'Tooltip text', required: true, group: 'Content' }], tags: ['display', 'tooltip'] }),
  def({ type: WidgetType.ProgressBar, displayName: 'Progress Bar', description: 'Progress indicator', category: WidgetCategory.Display, icon: 'Loader', isContainer: false, acceptsChildren: false, defaultProps: { value: 60, max: 100, showLabel: true, color: '#6366f1' }, defaultStyle: { width: { value: 200, unit: 'px' }, height: { value: 24, unit: 'px' } }, propertySchema: [{ key: 'value', label: 'Value', type: PropertyFieldType.Slider, defaultValue: 60, required: false, group: 'Data', min: 0, max: 100 }, { key: 'showLabel', label: 'Show Label', type: PropertyFieldType.Boolean, defaultValue: true, required: false, group: 'Appearance' }, { key: 'color', label: 'Color', type: PropertyFieldType.Color, defaultValue: '#6366f1', required: false, group: 'Appearance' }], tags: ['display', 'progress'] }),
];

/* ──────────────────────────────────────────────
 * DEFAULT WIDGETS — Input & Forms  (12)
 * ────────────────────────────────────────────── */

const INPUT_WIDGETS: ExtendedWidgetDefinition[] = [
  def({ type: WidgetType.TextInput, displayName: 'Text Input', description: 'Single-line input', category: WidgetCategory.Input, icon: 'TextCursorInput', isContainer: false, acceptsChildren: false, defaultProps: { placeholder: 'Enter text...', label: 'Label', helperText: '', inputType: 'text', required: false, disabled: false }, defaultStyle: { width: { value: 250, unit: 'px' }, height: { value: 64, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Label', required: false, group: 'Content' }, { key: 'placeholder', label: 'Placeholder', type: PropertyFieldType.Text, defaultValue: 'Enter text...', required: false, group: 'Content' }, { key: 'inputType', label: 'Type', type: PropertyFieldType.Select, defaultValue: 'text', required: false, group: 'Behavior', options: [{ label: 'Text', value: 'text' }, { label: 'Email', value: 'email' }, { label: 'Password', value: 'password' }, { label: 'Phone', value: 'tel' }, { label: 'URL', value: 'url' }] }, { key: 'required', label: 'Required', type: PropertyFieldType.Boolean, defaultValue: false, required: false, group: 'Validation' }, { key: 'disabled', label: 'Disabled', type: PropertyFieldType.Boolean, defaultValue: false, required: false, group: 'State' }], tags: ['input', 'text', 'field'] }),
  def({ type: WidgetType.TextArea, displayName: 'Text Area', description: 'Multi-line input', category: WidgetCategory.Input, icon: 'AlignJustify', isContainer: false, acceptsChildren: false, defaultProps: { placeholder: 'Enter long text...', label: 'Description', rows: 4 }, defaultStyle: { width: { value: 300, unit: 'px' }, height: { value: 120, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Description', required: false, group: 'Content' }, { key: 'placeholder', label: 'Placeholder', type: PropertyFieldType.Text, defaultValue: 'Enter long text...', required: false, group: 'Content' }, { key: 'rows', label: 'Rows', type: PropertyFieldType.Number, defaultValue: 4, required: false, group: 'Layout', min: 2, max: 20 }], tags: ['input', 'textarea', 'multiline'] }),
  def({ type: WidgetType.NumberInput, displayName: 'Number Input', description: 'Numeric stepper', category: WidgetCategory.Input, icon: 'Hash', isContainer: false, acceptsChildren: false, defaultProps: { label: 'Quantity', value: 0, min: 0, max: 100, step: 1, placeholder: '0' }, defaultStyle: { width: { value: 180, unit: 'px' }, height: { value: 64, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Quantity', required: false, group: 'Content' }, { key: 'min', label: 'Min', type: PropertyFieldType.Number, defaultValue: 0, required: false, group: 'Validation' }, { key: 'max', label: 'Max', type: PropertyFieldType.Number, defaultValue: 100, required: false, group: 'Validation' }], tags: ['input', 'number', 'stepper'] }),
  def({ type: WidgetType.Checkbox, displayName: 'Checkbox', description: 'Checkbox input', category: WidgetCategory.Input, icon: 'CheckSquare', isContainer: false, acceptsChildren: false, defaultProps: { label: 'Checkbox', checked: false, disabled: false }, defaultStyle: { width: { value: 150, unit: 'px' }, height: { value: 24, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Checkbox', required: true, group: 'Content' }, { key: 'checked', label: 'Checked', type: PropertyFieldType.Boolean, defaultValue: false, required: false, group: 'State' }], tags: ['input', 'checkbox'] }),
  def({ type: WidgetType.Radio, displayName: 'Radio Button', description: 'Radio selection', category: WidgetCategory.Input, icon: 'CircleDot', isContainer: false, acceptsChildren: false, defaultProps: { label: 'Option 1', value: 'opt1', groupName: 'group1', checked: false }, defaultStyle: { width: { value: 150, unit: 'px' }, height: { value: 24, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Option 1', required: true, group: 'Content' }, { key: 'value', label: 'Value', type: PropertyFieldType.Text, defaultValue: 'opt1', required: true, group: 'Data' }], tags: ['input', 'radio'] }),
  def({ type: WidgetType.Toggle, displayName: 'Toggle Switch', description: 'On/off switch', category: WidgetCategory.Input, icon: 'ToggleLeft', isContainer: false, acceptsChildren: false, defaultProps: { label: 'Enable', checked: false }, defaultStyle: { width: { value: 150, unit: 'px' }, height: { value: 24, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Enable', required: true, group: 'Content' }, { key: 'checked', label: 'On', type: PropertyFieldType.Boolean, defaultValue: false, required: false, group: 'State' }], tags: ['input', 'toggle', 'switch'] }),
  def({ type: WidgetType.Dropdown, displayName: 'Dropdown', description: 'Select dropdown', category: WidgetCategory.Input, icon: 'ChevronsUpDown', isContainer: false, acceptsChildren: false, defaultProps: { label: 'Select', placeholder: 'Choose...', options: [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }, { label: 'Option 3', value: '3' }], multiple: false, searchable: false }, defaultStyle: { width: { value: 250, unit: 'px' }, height: { value: 64, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Select', required: false, group: 'Content' }, { key: 'placeholder', label: 'Placeholder', type: PropertyFieldType.Text, defaultValue: 'Choose...', required: false, group: 'Content' }], tags: ['input', 'dropdown', 'select'] }),
  def({ type: WidgetType.Slider, displayName: 'Slider', description: 'Range slider', category: WidgetCategory.Input, icon: 'SlidersHorizontal', isContainer: false, acceptsChildren: false, defaultProps: { min: 0, max: 100, step: 1, value: 50, label: 'Value', showValue: true }, defaultStyle: { width: { value: 200, unit: 'px' }, height: { value: 40, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Value', required: false, group: 'Content' }, { key: 'min', label: 'Min', type: PropertyFieldType.Number, defaultValue: 0, required: false, group: 'Range' }, { key: 'max', label: 'Max', type: PropertyFieldType.Number, defaultValue: 100, required: false, group: 'Range' }, { key: 'showValue', label: 'Show Value', type: PropertyFieldType.Boolean, defaultValue: true, required: false, group: 'Appearance' }], tags: ['input', 'slider', 'range'] }),
  def({ type: WidgetType.DatePicker, displayName: 'Date Picker', description: 'Date selection', category: WidgetCategory.Input, icon: 'Calendar', isContainer: false, acceptsChildren: false, defaultProps: { label: 'Date', placeholder: 'Select date...' }, defaultStyle: { width: { value: 220, unit: 'px' }, height: { value: 64, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Date', required: false, group: 'Content' }], tags: ['input', 'date', 'calendar', 'picker'] }),
  def({ type: WidgetType.TimePicker, displayName: 'Time Picker', description: 'Time selection', category: WidgetCategory.Input, icon: 'Clock', isContainer: false, acceptsChildren: false, defaultProps: { label: 'Time', placeholder: 'Select time...' }, defaultStyle: { width: { value: 200, unit: 'px' }, height: { value: 64, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Time', required: false, group: 'Content' }], tags: ['input', 'time', 'clock', 'picker'] }),
  def({ type: WidgetType.FilePicker, displayName: 'File Upload', description: 'File upload area', category: WidgetCategory.Input, icon: 'Upload', isContainer: false, acceptsChildren: false, defaultProps: { label: 'Upload File', accept: '*/*', multiple: false }, defaultStyle: { width: { value: 280, unit: 'px' }, height: { value: 100, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Upload File', required: false, group: 'Content' }], tags: ['input', 'file', 'upload'] }),
  def({ type: WidgetType.ColorPicker, displayName: 'Color Picker', description: 'Color selection', category: WidgetCategory.Input, icon: 'Palette', isContainer: false, acceptsChildren: false, defaultProps: { label: 'Color', value: '#6366f1' }, defaultStyle: { width: { value: 200, unit: 'px' }, height: { value: 64, unit: 'px' } }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Color', required: false, group: 'Content' }, { key: 'value', label: 'Default', type: PropertyFieldType.Color, defaultValue: '#6366f1', required: false, group: 'Data' }], tags: ['input', 'color', 'picker', 'palette'] }),
];

/* ──────────────────────────────────────────────
 * DEFAULT WIDGETS — Navigation & Actions  (10)
 * ────────────────────────────────────────────── */

const NAVIGATION_WIDGETS: ExtendedWidgetDefinition[] = [
  def({ type: WidgetType.Button, displayName: 'Button', description: 'Action button', category: WidgetCategory.Navigation, icon: 'MousePointerClick', isContainer: false, acceptsChildren: false, defaultProps: { label: 'Button', variant: ButtonVariant.Solid, size: SizeVariant.Medium, disabled: false, loading: false, fullWidth: false }, defaultStyle: { width: { value: 120, unit: 'px' }, height: { value: 40, unit: 'px' }, background: { type: 'solid', color: '#6366f1' }, color: '#ffffff', borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 }, fontSize: 14, fontWeight: FontWeight.Medium }, propertySchema: [{ key: 'label', label: 'Label', type: PropertyFieldType.Text, defaultValue: 'Button', required: true, group: 'Content' }, { key: 'variant', label: 'Variant', type: PropertyFieldType.Select, defaultValue: 'solid', required: false, group: 'Appearance', options: [{ label: 'Solid', value: 'solid' }, { label: 'Outline', value: 'outline' }, { label: 'Ghost', value: 'ghost' }, { label: 'Link', value: 'link' }] }, { key: 'disabled', label: 'Disabled', type: PropertyFieldType.Boolean, defaultValue: false, required: false, group: 'State' }, { key: 'loading', label: 'Loading', type: PropertyFieldType.Boolean, defaultValue: false, required: false, group: 'State' }, { key: 'fullWidth', label: 'Full Width', type: PropertyFieldType.Boolean, defaultValue: false, required: false, group: 'Layout' }], tags: ['navigation', 'button', 'action', 'cta'] }),
  def({ type: WidgetType.IconButton, displayName: 'Icon Button', description: 'Icon-only button', category: WidgetCategory.Navigation, icon: 'SquareMousePointer', isContainer: false, acceptsChildren: false, defaultProps: { icon: 'Heart', label: 'Like' }, defaultStyle: { width: { value: 40, unit: 'px' }, height: { value: 40, unit: 'px' }, borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } }, propertySchema: [{ key: 'icon', label: 'Icon', type: PropertyFieldType.Icon, defaultValue: 'Heart', required: true, group: 'Content' }], tags: ['navigation', 'icon-button'] }),
  def({ type: WidgetType.Link, displayName: 'Link', description: 'Hyperlink', category: WidgetCategory.Navigation, icon: 'Link', isContainer: false, acceptsChildren: false, defaultProps: { text: 'Click here', url: '#', openInNewTab: false }, defaultStyle: { width: { value: 100, unit: 'px' }, height: { value: 24, unit: 'px' }, color: '#6366f1', fontSize: 14 }, propertySchema: [{ key: 'text', label: 'Text', type: PropertyFieldType.Text, defaultValue: 'Click here', required: true, group: 'Content' }, { key: 'url', label: 'URL', type: PropertyFieldType.Text, defaultValue: '#', required: true, group: 'Content' }], tags: ['navigation', 'link', 'anchor'] }),
  def({ type: WidgetType.Navbar, displayName: 'Navbar', description: 'Top navigation bar', category: WidgetCategory.Navigation, icon: 'PanelTop', isContainer: true, acceptsChildren: true, defaultProps: { title: 'My App', variant: 'solid' }, defaultStyle: { width: { value: 100, unit: '%' }, height: { value: 56, unit: 'px' }, display: DisplayType.Flex, flexDirection: FlexDirection.Row, padding: { top: 0, right: 16, bottom: 0, left: 16 }, background: { type: 'solid', color: '#13131a' }, border: { width: 1, style: BorderStyle.Solid, color: 'rgba(255,255,255,0.06)' } }, propertySchema: [{ key: 'title', label: 'Title', type: PropertyFieldType.Text, defaultValue: 'My App', required: false, group: 'Content' }], tags: ['navigation', 'navbar', 'header'] }),
  def({ type: WidgetType.Sidebar, displayName: 'Sidebar', description: 'Side navigation', category: WidgetCategory.Navigation, icon: 'PanelLeft', isContainer: true, acceptsChildren: true, defaultProps: { collapsible: true }, defaultStyle: { width: { value: 250, unit: 'px' }, height: { value: 100, unit: '%' }, display: DisplayType.Flex, flexDirection: FlexDirection.Column, background: { type: 'solid', color: '#13131a' }, padding: { top: 16, right: 12, bottom: 16, left: 12 } }, propertySchema: [], tags: ['navigation', 'sidebar'] }),
  def({ type: WidgetType.Breadcrumb, displayName: 'Breadcrumb', description: 'Navigation trail', category: WidgetCategory.Navigation, icon: 'ChevronRight', isContainer: false, acceptsChildren: false, defaultProps: { items: [{ label: 'Home', url: '/' }, { label: 'Products', url: '/products' }, { label: 'Detail' }], separator: '/' }, defaultStyle: { width: { value: 300, unit: 'px' }, height: { value: 24, unit: 'px' } }, propertySchema: [], tags: ['navigation', 'breadcrumb'] }),
  def({ type: WidgetType.Pagination, displayName: 'Pagination', description: 'Page controls', category: WidgetCategory.Navigation, icon: 'ArrowLeftRight', isContainer: false, acceptsChildren: false, defaultProps: { totalPages: 10, currentPage: 1 }, defaultStyle: { width: { value: 300, unit: 'px' }, height: { value: 36, unit: 'px' } }, propertySchema: [{ key: 'totalPages', label: 'Total Pages', type: PropertyFieldType.Number, defaultValue: 10, required: true, group: 'Data', min: 1 }], tags: ['navigation', 'pagination'] }),
  def({ type: WidgetType.BottomNav, displayName: 'Bottom Nav', description: 'Mobile bottom bar', category: WidgetCategory.Navigation, icon: 'PanelBottom', isContainer: false, acceptsChildren: false, defaultProps: { items: [{ label: 'Home', icon: 'Home' }, { label: 'Search', icon: 'Search' }, { label: 'Profile', icon: 'User' }], activeIndex: 0 }, defaultStyle: { width: { value: 100, unit: '%' }, height: { value: 56, unit: 'px' }, display: DisplayType.Flex, background: { type: 'solid', color: '#13131a' } }, propertySchema: [], tags: ['navigation', 'bottom-nav', 'mobile'] }),
  def({ type: WidgetType.Drawer, displayName: 'Drawer', description: 'Slide-out panel', category: WidgetCategory.Navigation, icon: 'PanelRightOpen', isContainer: true, acceptsChildren: true, defaultProps: { position: 'right' }, defaultStyle: { width: { value: 320, unit: 'px' }, height: { value: 100, unit: '%' }, display: DisplayType.Flex, flexDirection: FlexDirection.Column, background: { type: 'solid', color: '#13131a' } }, propertySchema: [{ key: 'position', label: 'Position', type: PropertyFieldType.Select, defaultValue: 'right', required: false, group: 'Layout', options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }] }], tags: ['navigation', 'drawer'] }),
  def({ type: WidgetType.FloatingActionButton, displayName: 'FAB', description: 'Floating action button', category: WidgetCategory.Navigation, icon: 'Plus', isContainer: false, acceptsChildren: false, defaultProps: { icon: 'Plus', color: '#6366f1' }, defaultStyle: { width: { value: 56, unit: 'px' }, height: { value: 56, unit: 'px' }, borderRadius: { topLeft: 28, topRight: 28, bottomRight: 28, bottomLeft: 28 }, background: { type: 'solid', color: '#6366f1' } }, propertySchema: [{ key: 'icon', label: 'Icon', type: PropertyFieldType.Icon, defaultValue: 'Plus', required: true, group: 'Content' }, { key: 'color', label: 'Color', type: PropertyFieldType.Color, defaultValue: '#6366f1', required: false, group: 'Appearance' }], tags: ['navigation', 'fab', 'floating'] }),
];

/* ──────────────────────────────────────────────
 * DEFAULT WIDGETS — Media  (5)
 * ────────────────────────────────────────────── */

const MEDIA_WIDGETS: ExtendedWidgetDefinition[] = [
  def({ type: WidgetType.Image, displayName: 'Image', description: 'Image display', category: WidgetCategory.Media, icon: 'Image', isContainer: false, acceptsChildren: false, defaultProps: { src: '', alt: '', objectFit: 'cover', lazy: true }, defaultStyle: { width: { value: 200, unit: 'px' }, height: { value: 150, unit: 'px' }, borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } }, propertySchema: [{ key: 'src', label: 'Source', type: PropertyFieldType.Image, defaultValue: '', required: false, group: 'Content' }, { key: 'alt', label: 'Alt Text', type: PropertyFieldType.Text, defaultValue: '', required: false, group: 'Accessibility' }, { key: 'objectFit', label: 'Fit', type: PropertyFieldType.Select, defaultValue: 'cover', required: false, group: 'Appearance', options: [{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }, { label: 'Fill', value: 'fill' }] }], tags: ['media', 'image', 'photo'] }),
  def({ type: WidgetType.Video, displayName: 'Video', description: 'Video player', category: WidgetCategory.Media, icon: 'Video', isContainer: false, acceptsChildren: false, defaultProps: { src: '', autoplay: false, controls: true, loop: false }, defaultStyle: { width: { value: 320, unit: 'px' }, height: { value: 180, unit: 'px' }, borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } }, propertySchema: [{ key: 'src', label: 'Video URL', type: PropertyFieldType.Text, defaultValue: '', required: false, group: 'Content' }, { key: 'controls', label: 'Controls', type: PropertyFieldType.Boolean, defaultValue: true, required: false, group: 'Behavior' }], tags: ['media', 'video', 'player'] }),
  def({ type: WidgetType.Audio, displayName: 'Audio', description: 'Audio player', category: WidgetCategory.Media, icon: 'Music', isContainer: false, acceptsChildren: false, defaultProps: { src: '', controls: true }, defaultStyle: { width: { value: 300, unit: 'px' }, height: { value: 54, unit: 'px' } }, propertySchema: [{ key: 'src', label: 'Audio URL', type: PropertyFieldType.Text, defaultValue: '', required: false, group: 'Content' }], tags: ['media', 'audio', 'music'] }),
  def({ type: WidgetType.Carousel, displayName: 'Carousel', description: 'Image carousel', category: WidgetCategory.Media, icon: 'GalleryHorizontal', isContainer: true, acceptsChildren: true, defaultProps: { autoplay: true, interval: 3000, showArrows: true, showDots: true }, defaultStyle: { width: { value: 400, unit: 'px' }, height: { value: 250, unit: 'px' }, borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 } }, propertySchema: [{ key: 'autoplay', label: 'Autoplay', type: PropertyFieldType.Boolean, defaultValue: true, required: false, group: 'Behavior' }, { key: 'showArrows', label: 'Arrows', type: PropertyFieldType.Boolean, defaultValue: true, required: false, group: 'Appearance' }], tags: ['media', 'carousel', 'slider'] }),
  def({ type: WidgetType.Map, displayName: 'Map', description: 'Interactive map', category: WidgetCategory.Media, icon: 'MapPin', isContainer: false, acceptsChildren: false, defaultProps: { latitude: 40.7128, longitude: -74.006, zoom: 12 }, defaultStyle: { width: { value: 400, unit: 'px' }, height: { value: 300, unit: 'px' }, borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } }, propertySchema: [{ key: 'latitude', label: 'Lat', type: PropertyFieldType.Number, defaultValue: 40.7128, required: false, group: 'Location' }, { key: 'longitude', label: 'Lng', type: PropertyFieldType.Number, defaultValue: -74.006, required: false, group: 'Location' }, { key: 'zoom', label: 'Zoom', type: PropertyFieldType.Slider, defaultValue: 12, required: false, group: 'Location', min: 1, max: 20 }], tags: ['media', 'map', 'location'] }),
];

/* ──────────────────────────────────────────────
 * DEFAULT WIDGETS — Data  (4)
 * ────────────────────────────────────────────── */

const DATA_WIDGETS: ExtendedWidgetDefinition[] = [
  def({ type: WidgetType.Table, displayName: 'Table', description: 'Data table', category: WidgetCategory.Data, icon: 'Table', isContainer: false, acceptsChildren: false, defaultProps: { columns: [{ id: '1', header: 'Name', accessor: 'name' }, { id: '2', header: 'Email', accessor: 'email' }, { id: '3', header: 'Status', accessor: 'status' }], sortable: true, striped: true, bordered: true }, defaultStyle: { width: { value: 100, unit: '%' }, height: { value: 250, unit: 'px' } }, propertySchema: [{ key: 'sortable', label: 'Sortable', type: PropertyFieldType.Boolean, defaultValue: true, required: false, group: 'Behavior' }, { key: 'striped', label: 'Striped', type: PropertyFieldType.Boolean, defaultValue: true, required: false, group: 'Appearance' }], tags: ['data', 'table', 'grid'] }),
  def({ type: WidgetType.List, displayName: 'List', description: 'Data list', category: WidgetCategory.Data, icon: 'List', isContainer: true, acceptsChildren: true, defaultProps: { dividers: true, emptyMessage: 'No items' }, defaultStyle: { width: { value: 100, unit: '%' }, height: { value: 200, unit: 'px' }, display: DisplayType.Flex, flexDirection: FlexDirection.Column }, propertySchema: [{ key: 'dividers', label: 'Dividers', type: PropertyFieldType.Boolean, defaultValue: true, required: false, group: 'Appearance' }], tags: ['data', 'list'] }),
  def({ type: WidgetType.Chart, displayName: 'Chart', description: 'Data chart', category: WidgetCategory.Data, icon: 'BarChart3', isContainer: false, acceptsChildren: false, defaultProps: { chartType: 'bar', title: 'Sales Data', showLegend: true, colors: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef'] }, defaultStyle: { width: { value: 400, unit: 'px' }, height: { value: 250, unit: 'px' } }, propertySchema: [{ key: 'chartType', label: 'Type', type: PropertyFieldType.Select, defaultValue: 'bar', required: false, group: 'Appearance', options: [{ label: 'Line', value: 'line' }, { label: 'Bar', value: 'bar' }, { label: 'Pie', value: 'pie' }, { label: 'Doughnut', value: 'doughnut' }, { label: 'Area', value: 'area' }] }, { key: 'title', label: 'Title', type: PropertyFieldType.Text, defaultValue: 'Sales Data', required: false, group: 'Content' }], tags: ['data', 'chart', 'graph'] }),
  def({ type: WidgetType.Form, displayName: 'Form', description: 'Form container', category: WidgetCategory.Data, icon: 'FileText', isContainer: true, acceptsChildren: true, defaultProps: { submitOnEnter: true, validateOnBlur: true }, defaultStyle: { width: { value: 100, unit: '%' }, height: { value: 300, unit: 'px' }, display: DisplayType.Flex, flexDirection: FlexDirection.Column, gap: 16, padding: { top: 16, right: 16, bottom: 16, left: 16 } }, propertySchema: [{ key: 'submitOnEnter', label: 'Submit on Enter', type: PropertyFieldType.Boolean, defaultValue: true, required: false, group: 'Behavior' }], tags: ['data', 'form', 'submit'] }),
];

/* ──────────────────────────────────────────────
 * DEFAULT WIDGETS — Feedback & Overlays  (6)
 * ────────────────────────────────────────────── */

const FEEDBACK_WIDGETS: ExtendedWidgetDefinition[] = [
  def({ type: WidgetType.Alert, displayName: 'Alert', description: 'Alert banner', category: WidgetCategory.Feedback, icon: 'AlertTriangle', isContainer: false, acceptsChildren: false, defaultProps: { title: 'Alert', message: 'This is an alert message.', severity: 'info', closable: true }, defaultStyle: { width: { value: 100, unit: '%' }, height: { value: 60, unit: 'px' } }, propertySchema: [{ key: 'title', label: 'Title', type: PropertyFieldType.Text, defaultValue: 'Alert', required: false, group: 'Content' }, { key: 'message', label: 'Message', type: PropertyFieldType.TextArea, defaultValue: 'This is an alert message.', required: true, group: 'Content' }, { key: 'severity', label: 'Severity', type: PropertyFieldType.Select, defaultValue: 'info', required: false, group: 'Appearance', options: [{ label: 'Info', value: 'info' }, { label: 'Success', value: 'success' }, { label: 'Warning', value: 'warning' }, { label: 'Error', value: 'error' }] }], tags: ['feedback', 'alert', 'banner'] }),
  def({ type: WidgetType.Toast, displayName: 'Toast', description: 'Toast notification', category: WidgetCategory.Feedback, icon: 'Bell', isContainer: false, acceptsChildren: false, defaultProps: { message: 'Action completed!', type: 'success', duration: 3000 }, defaultStyle: { width: { value: 320, unit: 'px' }, height: { value: 48, unit: 'px' } }, propertySchema: [{ key: 'message', label: 'Message', type: PropertyFieldType.Text, defaultValue: 'Action completed!', required: true, group: 'Content' }, { key: 'type', label: 'Type', type: PropertyFieldType.Select, defaultValue: 'success', required: false, group: 'Appearance', options: [{ label: 'Success', value: 'success' }, { label: 'Error', value: 'error' }, { label: 'Warning', value: 'warning' }, { label: 'Info', value: 'info' }] }], tags: ['feedback', 'toast', 'notification'] }),
  def({ type: WidgetType.Modal, displayName: 'Modal', description: 'Modal overlay', category: WidgetCategory.Feedback, icon: 'Maximize2', isContainer: true, acceptsChildren: true, defaultProps: { title: 'Modal Title', closable: true }, defaultStyle: { width: { value: 480, unit: 'px' }, height: { value: 320, unit: 'px' }, borderRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 }, background: { type: 'solid', color: '#1a1a25' } }, propertySchema: [{ key: 'title', label: 'Title', type: PropertyFieldType.Text, defaultValue: 'Modal Title', required: false, group: 'Content' }], tags: ['feedback', 'modal', 'dialog'] }),
  def({ type: WidgetType.Dialog, displayName: 'Dialog', description: 'Confirm dialog', category: WidgetCategory.Feedback, icon: 'MessageSquare', isContainer: true, acceptsChildren: true, defaultProps: { title: 'Confirm', message: 'Are you sure?', confirmLabel: 'Yes', cancelLabel: 'Cancel' }, defaultStyle: { width: { value: 400, unit: 'px' }, height: { value: 200, unit: 'px' }, borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 }, background: { type: 'solid', color: '#1a1a25' } }, propertySchema: [{ key: 'title', label: 'Title', type: PropertyFieldType.Text, defaultValue: 'Confirm', required: false, group: 'Content' }, { key: 'message', label: 'Message', type: PropertyFieldType.TextArea, defaultValue: 'Are you sure?', required: true, group: 'Content' }], tags: ['feedback', 'dialog', 'confirm'] }),
  def({ type: WidgetType.Skeleton, displayName: 'Skeleton', description: 'Loading placeholder', category: WidgetCategory.Feedback, icon: 'BoxSelect', isContainer: false, acceptsChildren: false, defaultProps: { variant: 'rectangle' }, defaultStyle: { width: { value: 200, unit: 'px' }, height: { value: 20, unit: 'px' }, borderRadius: { topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4 } }, propertySchema: [], tags: ['feedback', 'skeleton', 'loading'] }),
  def({ type: WidgetType.Spinner, displayName: 'Spinner', description: 'Loading spinner', category: WidgetCategory.Feedback, icon: 'Loader2', isContainer: false, acceptsChildren: false, defaultProps: { size: 24, color: '#6366f1' }, defaultStyle: { width: { value: 24, unit: 'px' }, height: { value: 24, unit: 'px' } }, propertySchema: [{ key: 'size', label: 'Size', type: PropertyFieldType.Number, defaultValue: 24, required: false, group: 'Appearance', min: 12, max: 64 }, { key: 'color', label: 'Color', type: PropertyFieldType.Color, defaultValue: '#6366f1', required: false, group: 'Appearance' }], tags: ['feedback', 'spinner', 'loading'] }),
];

/* ──────────────────────────────────────────────
 * Combined DEFAULT widgets  (Total: 59)
 * ────────────────────────────────────────────── */

export const DEFAULT_WIDGETS: readonly ExtendedWidgetDefinition[] = [
  ...LAYOUT_WIDGETS,
  ...DISPLAY_WIDGETS,
  ...INPUT_WIDGETS,
  ...NAVIGATION_WIDGETS,
  ...MEDIA_WIDGETS,
  ...DATA_WIDGETS,
  ...FEEDBACK_WIDGETS,
];

/* ──────────────────────────────────────────────
 * USER-CREATED WIDGETS
 * ────────────────────────────────────────────── */

export let USER_CREATED_WIDGETS: ExtendedWidgetDefinition[] = [];

export function registerUserWidget(widget: ExtendedWidgetDefinition): void {
  USER_CREATED_WIDGETS = [...USER_CREATED_WIDGETS, { ...widget, source: 'user-created' }];
}

export function unregisterUserWidget(type: WidgetType): void {
  USER_CREATED_WIDGETS = USER_CREATED_WIDGETS.filter(w => w.type !== type);
}

/* ──────────────────────────────────────────────
 * Backward-compatible exports
 * ────────────────────────────────────────────── */

export const WIDGET_REGISTRY: readonly WidgetDefinition[] = DEFAULT_WIDGETS;

/* ──────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────── */

export function getDefaultWidgetsByCategory(): Map<WidgetCategory, ExtendedWidgetDefinition[]> {
  const m = new Map<WidgetCategory, ExtendedWidgetDefinition[]>();
  for (const w of DEFAULT_WIDGETS) { const l = m.get(w.category) ?? []; l.push(w); m.set(w.category, l); }
  return m;
}

export function getUserWidgetsByCategory(): Map<WidgetCategory, ExtendedWidgetDefinition[]> {
  const m = new Map<WidgetCategory, ExtendedWidgetDefinition[]>();
  for (const w of USER_CREATED_WIDGETS) { const l = m.get(w.category) ?? []; l.push(w); m.set(w.category, l); }
  return m;
}

export function getWidgetsByCategory(): Map<WidgetCategory, WidgetDefinition[]> {
  const m = new Map<WidgetCategory, WidgetDefinition[]>();
  for (const w of [...DEFAULT_WIDGETS, ...USER_CREATED_WIDGETS]) { const l = m.get(w.category) ?? []; l.push(w); m.set(w.category, l); }
  return m;
}

export function getWidgetDefinition(type: WidgetType): WidgetDefinition | undefined {
  return [...DEFAULT_WIDGETS, ...USER_CREATED_WIDGETS].find(w => w.type === type);
}

export function searchWidgets(query: string, source?: WidgetSourceType): ExtendedWidgetDefinition[] {
  const lower = query.toLowerCase().trim();
  const pool = source === 'default' ? DEFAULT_WIDGETS : source === 'user-created' ? USER_CREATED_WIDGETS : [...DEFAULT_WIDGETS, ...USER_CREATED_WIDGETS];
  if (!lower) return [...pool];
  return pool.filter(w => w.displayName.toLowerCase().includes(lower) || w.description.toLowerCase().includes(lower) || w.tags.some(t => t.includes(lower)));
}

export const CATEGORY_LABELS: Record<WidgetCategory, string> = {
  [WidgetCategory.Layout]: 'Layout',
  [WidgetCategory.Input]: 'Input & Forms',
  [WidgetCategory.Display]: 'Display & Typography',
  [WidgetCategory.Navigation]: 'Navigation & Actions',
  [WidgetCategory.Media]: 'Media',
  [WidgetCategory.Data]: 'Data & Lists',
  [WidgetCategory.Feedback]: 'Feedback & Overlays',
  [WidgetCategory.Advanced]: 'Advanced',
};

export const CATEGORY_ICONS: Record<WidgetCategory, string> = {
  [WidgetCategory.Layout]: 'LayoutDashboard',
  [WidgetCategory.Input]: 'FormInput',
  [WidgetCategory.Display]: 'Eye',
  [WidgetCategory.Navigation]: 'Navigation',
  [WidgetCategory.Media]: 'Image',
  [WidgetCategory.Data]: 'Database',
  [WidgetCategory.Feedback]: 'Bell',
  [WidgetCategory.Advanced]: 'Puzzle',
};
