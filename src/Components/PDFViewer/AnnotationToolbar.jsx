import PropTypes from 'prop-types';

// import './AnnotationToolbar.css';
import {
  FaPen,
  FaHighlighter,
  FaEraser,
  FaSignature,
  FaUndo,
  FaRedo,
  FaStamp,
} from 'react-icons/fa';
import { PiSelectionPlusDuotone } from 'react-icons/pi';
import ColorPicker from './ColorPicker';
import { Tooltip } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const AnnotationToolbar = ({
  selectedTool,
  onToolSelect,
  onUndo,
  onRedo,
  onSave,
  currentColor,
  onColorChange,
  isSaving,
}) => {
  const tools = [
    { id: 'pen', label: 'Pen', icon: <FaPen /> },
    { id: 'select', label: 'Select', icon: <PiSelectionPlusDuotone /> },
    { id: 'highlighter', label: 'Highlighter', icon: <FaHighlighter /> },
    { id: 'eraser', label: 'Eraser', icon: <FaEraser /> },
    { id: 'stamp', label: 'Stamp', icon: <FaStamp /> },
  ];

  return (
    <div className="annotation-toolbar">
      {tools.map((tool) => (
        <Tooltip
          key={tool.id}
          title={tool.label}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
          placement="right"
        >
          <button
            className={`tool-button ${
              selectedTool === tool.id ? 'active' : ''
            }`}
            onClick={() => onToolSelect(tool.id)}
            type="button"
          >
            {tool.icon}
          </button>
        </Tooltip>
      ))}
      <div className="tool-separator" />
      <Tooltip
        title="Undo"
        mouseEnterDelay={0}
        mouseLeaveDelay={0}
        placement="right"
      >
        <button className="tool-button" onClick={onUndo} type="button">
          <FaUndo />
        </button>
      </Tooltip>
      <Tooltip
        title="Redo"
        mouseEnterDelay={0}
        mouseLeaveDelay={0}
        placement="right"
      >
        <button className="tool-button" onClick={onRedo} type="button">
          <FaRedo />
        </button>
      </Tooltip>
      {selectedTool === 'pen' && (
        <ColorPicker
          currentColor={currentColor}
          onColorChange={onColorChange}
        />
      )}
      <button
        className="save-button"
        onClick={onSave}
        type="button"
        disabled={isSaving}
      >
        {isSaving ? (
          <LoadingOutlined spin style={{ fontSize: 18, marginRight: 8 }} />
        ) : null}
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

AnnotationToolbar.propTypes = {
  selectedTool: PropTypes.string.isRequired,
  onToolSelect: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  currentColor: PropTypes.string,
  onColorChange: PropTypes.func,
  isSaving: PropTypes.bool,
};

export default AnnotationToolbar;
