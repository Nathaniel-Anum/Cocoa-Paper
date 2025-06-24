import { Popover } from 'antd';
import PropTypes from 'prop-types';
import { BgColorsOutlined } from '@ant-design/icons';

const ColorPicker = ({ currentColor, onColorChange }) => {
  const colors = [
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Black', value: '#000000' },
  ];

  const content = (
    <div className="color-picker-content" style={{ padding: '8px' }}>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          width: '120px',
        }}
      >
        {colors.map((color) => (
          <button
            key={color.value}
            onClick={() => onColorChange(color.value)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              border:
                currentColor === color.value
                  ? '2px solid #666'
                  : '1px solid #ddd',
              backgroundColor: color.value,
              cursor: 'pointer',
              padding: 0,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={color.name}
          >
            {currentColor === color.value && (
              <span style={{ color: '#fff', textShadow: '0 0 2px #000' }}>
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="right"
      title="Select Color"
    >
      <button
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          backgroundColor: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <BgColorsOutlined style={{ color: currentColor }} />
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            width: '16px',
            height: '4px',
            backgroundColor: currentColor,
            borderRadius: '2px',
          }}
        />
      </button>
    </Popover>
  );
};

ColorPicker.propTypes = {
  currentColor: PropTypes.string.isRequired,
  onColorChange: PropTypes.func.isRequired,
};

export default ColorPicker;
