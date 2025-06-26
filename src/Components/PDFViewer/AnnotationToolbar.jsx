import {
  FaPen,
  FaUndo,
  FaRedo,
  FaStamp,
  FaEraser,
  FaHighlighter,
} from 'react-icons/fa';
import { Tooltip, Popover, Popconfirm } from 'antd';
import PropTypes from 'prop-types';
import { useState } from 'react';

import ColorPicker from './ColorPicker';
import { PiSelectionPlusDuotone } from 'react-icons/pi';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';

const AnnotationToolbar = ({
  selectedTool,
  onToolSelect,
  onUndo,
  onRedo,
  onSave,
  onDownload,
  currentColor,
  onColorChange,
  isSaving,
  isDownloading,
}) => {
  const [presetsVisible, setPresetsVisible] = useState(false);
  const auditPresets = [
    {
      id: 'cast',
      label: 'Cast',
      icon: <span className="tool-button">C</span>,
    },
    {
      id: 'trace',
      label: 'Trace',
      icon: (
        <span
          // className="tool-button"
          style={{
            display: 'inline-block',
            transform: 'rotate(-20deg)',
          }}
        >
          7
        </span>
      ),
    },
    {
      id: 'tick',
      label: 'Tick',
      icon: <span className="tool-button"> &#10003;</span>,
    },
  ];

  const tools = [
    { id: 'pen', label: 'Pen', icon: <FaPen /> },
    { id: 'select', label: 'Select', icon: <PiSelectionPlusDuotone /> },
    { id: 'highlighter', label: 'Highlighter', icon: <FaHighlighter /> },
    { id: 'eraser', label: 'Eraser', icon: <FaEraser /> },
    { id: 'stamp', label: 'Stamp', icon: <FaStamp /> },
    { id: 'text', label: 'Text', icon: <>T</> },
    {
      id: 'presets',
      label: 'Presets',
      icon: <span>★</span>,
    },
  ];

  return (
    <div className="annotation-toolbar overflow-auto ">
      {tools.map((tool) =>
        tool.id === 'presets' ? (
          <Popover
            key={tool.id}
            content={
              <div style={{ display: 'flex', gap: 12 }}>
                {auditPresets.map((preset) => (
                  <Tooltip key={preset.id} title={preset.label} placement="top">
                    <button
                      className={`tool-button${
                        selectedTool === preset.id ? ' active' : ''
                      }`}
                      style={{
                        border: '1px solid #d1d5db',
                        background: 'white',
                        fontSize: 18,
                      }}
                      onClick={() => {
                        onToolSelect(preset.id);
                        setPresetsVisible(false);
                      }}
                    >
                      {preset.icon}
                    </button>
                  </Tooltip>
                ))}
              </div>
            }
            trigger="click"
            open={presetsVisible}
            onOpenChange={setPresetsVisible}
            placement="top"
          >
            <button
              className={`tool-button${
                selectedTool === 'cast' ||
                selectedTool === 'trace' ||
                selectedTool === 'tick'
                  ? ' active'
                  : ''
              }`}
              type="button"
            >
              {tool.icon}
            </button>
          </Popover>
        ) : (
          <Tooltip
            key={tool.id}
            title={tool.label}
            mouseEnterDelay={0}
            mouseLeaveDelay={0}
            placement="top"
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
        )
      )}
      <div className="tool-separator" />
      <Tooltip
        title="Undo"
        mouseEnterDelay={0}
        mouseLeaveDelay={0}
        placement="top"
      >
        <button className="tool-button" onClick={onUndo} type="button">
          <FaUndo />
        </button>
      </Tooltip>
      <Tooltip
        title="Redo"
        mouseEnterDelay={0}
        mouseLeaveDelay={0}
        placement="top"
      >
        <button className="tool-button" onClick={onRedo} type="button">
          <FaRedo />
        </button>
      </Tooltip>
      <Tooltip
        title="Download"
        mouseEnterDelay={0}
        mouseLeaveDelay={0}
        placement="top"
      >
        <button
          className="tool-button"
          onClick={onDownload}
          type="button"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <LoadingOutlined spin style={{ fontSize: 18 }} />
          ) : (
            <DownloadOutlined style={{ fontSize: 18 }} />
          )}
        </button>
      </Tooltip>
      {selectedTool === 'pen' && (
        <ColorPicker
          currentColor={currentColor}
          onColorChange={onColorChange}
        />
      )}
      <Popconfirm onConfirm={onSave} title="Confirm saving edits">
        <button className="save-button" type="button" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </Popconfirm>
    </div>
  );
};

AnnotationToolbar.propTypes = {
  selectedTool: PropTypes.string.isRequired,
  onToolSelect: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  currentColor: PropTypes.string,
  onColorChange: PropTypes.func,
  isSaving: PropTypes.bool,
  isDownloading: PropTypes.bool,
};

export default AnnotationToolbar;
