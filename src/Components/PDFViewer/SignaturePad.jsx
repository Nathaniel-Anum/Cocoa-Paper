import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = ({ onSave, onClear }) => {
  const signatureRef = useRef(null);

  const handleSave = () => {
    if (signatureRef.current) {
      const data = signatureRef.current.toDataURL();
      onSave(data);
    }
  };

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
    onClear();
  };

  return (
    <div className="p-6">
      <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm mb-4">
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{
            className: 'signature-canvas',
            width: 400,
            height: 200,
          }}
          backgroundColor="rgb(255, 255, 255)"
          penColor="rgb(0, 0, 0)"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
};

SignaturePad.propTypes = {
  onSave: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default SignaturePad;
