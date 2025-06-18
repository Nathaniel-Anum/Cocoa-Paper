import PropTypes from 'prop-types';
import React from 'react';
// import './AnnotationToolbar.css';
import {
  FaPen,
  FaHighlighter,
  FaEraser,
  FaSignature,
  FaUndo,
  FaRedo,
} from 'react-icons/fa';
import { PiSelectionPlusDuotone } from 'react-icons/pi';

const AnnotationToolbar = ({
  selectedTool,
  onToolSelect,
  onUndo,
  onRedo,
  onSave,
  onClear,
}) => {
  const tools = [
    { id: 'pen', label: 'Pen', icon: <FaPen /> },
    { id: 'select', label: 'Select', icon: <PiSelectionPlusDuotone /> },
    { id: 'highlighter', label: 'Highlighter', icon: <FaHighlighter /> },
    { id: 'eraser', label: 'Eraser', icon: <FaEraser /> },
    { id: 'signature', label: 'Signature', icon: <FaSignature /> },
  ];

  return (
    <div className="annotation-toolbar">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`tool-button ${selectedTool === tool.id ? 'active' : ''}`}
          onClick={() => onToolSelect(tool.id)}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
      <div className="tool-separator" />
      <button className="tool-button" onClick={onUndo} title="Undo">
        <FaUndo />
      </button>
      <button className="tool-button" onClick={onRedo} title="Redo">
        <FaRedo />
      </button>
      <button className="save-button" onClick={onSave}>
        Save
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
  onClear: PropTypes.func.isRequired,
};

export default AnnotationToolbar;
