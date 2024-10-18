import React, { useState } from 'react';
import fetchwithauth from './token';

const BulkUpload = ({ visible, onFileChange, onClose, campaignName }) => {
  const [wheelPrizes, setWheelPrizes] = useState([{ name: '', quantity: '' }]);
  const [scratchPrizes, setScratchPrizes] = useState([{ name: '', quantity: '' }]);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state

  console.log("Name of the camp", campaignName);
  if (!visible) return null;

  const handleAddPrize = (type) => {
    if (type === 'wheel') {
      setWheelPrizes([...wheelPrizes, { name: '', quantity: '' }]);
    } else if (type === 'scratch') {
      setScratchPrizes([...scratchPrizes, { name: '', quantity: '' }]);
    }
  };

  const handleRemovePrize = (type, index) => {
    if (type === 'wheel') {
      const updatedWheelPrizes = [...wheelPrizes];
      updatedWheelPrizes.splice(index, 1);
      setWheelPrizes(updatedWheelPrizes);
    } else if (type === 'scratch') {
      const updatedScratchPrizes = [...scratchPrizes];
      updatedScratchPrizes.splice(index, 1);
      setScratchPrizes(updatedScratchPrizes);
    }
  };

  const handlePrizeChange = (type, index, field, value) => {
    if (type === 'wheel') {
      const updatedWheelPrizes = [...wheelPrizes];
      updatedWheelPrizes[index][field] = value;
      setWheelPrizes(updatedWheelPrizes);
    } else if (type === 'scratch') {
      const updatedScratchPrizes = [...scratchPrizes];
      updatedScratchPrizes[index][field] = value;
      setScratchPrizes(updatedScratchPrizes);
    }
  };

  const handleUpload = async () => {
    setLoading(true); // Set loading to true when upload starts
    const formData = new FormData();
    const data = {
      wheel: wheelPrizes.map(prize => ({
        name: prize.name,
        quantity: prize.quantity,
      })),
      scratch: scratchPrizes.map(prize => ({
        name: prize.name,
        quantity: prize.quantity,
      })),
    };

    // Append CSV file if it exists
    if (csvFile) {
      formData.append("file", csvFile);
    }
    // Append campaign data
    formData.append("Campaign_Name", JSON.stringify(campaignName));
    // Append prize data
    formData.append("prizes", JSON.stringify(data));

    // Make the POST request
    try {
      const response = await fetchwithauth(import.meta.env.VITE_BACKEND_URL + '/upload-citem', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        alert(`Total uploaded: ${result.totalRecordsProcessed}, Invalid rows: ${result.invalidRows}, Not uploaded: ${result.totalSkipped}`);
        onClose(); // Close the modal after successful upload
      } else {
        console.error('Upload failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setLoading(false); // Set loading to false after the upload completes
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-gray-400 border-2 border-black p-6 rounded-lg relative">
        <button
          className="absolute top-2 right-2 text-white"
          onClick={onClose}
          aria-label="Close Bulk Upload"
        >
          &times;
        </button>

        {/* Loader */}
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="loader border-t-4 border-blue-400 rounded-full w-16 h-16 animate-spin"></div>
            <span className="ml-4 text-lg">Uploading...</span>
          </div>
        ) : (
          <>
            {/* Wheel Prizes Input */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Wheel Prizes</h2>
              {wheelPrizes.map((prize, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="text"
                    value={prize.name}
                    onChange={(e) => handlePrizeChange('wheel', index, 'name', e.target.value)}
                    placeholder="Wheel Prize Name"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    value={prize.quantity}
                    onChange={(e) => handlePrizeChange('wheel', index, 'quantity', e.target.value)}
                    placeholder="Quantity"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => handleRemovePrize('wheel', index)}
                    className="text-red-500 font-bold px-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddPrize('wheel')}
                className="border-2 border-black bg-blue-300 text-black px-2 py-1 rounded-lg hover:scale-105 transition-transform duration-150"
              >
                Add Another Wheel Prize
              </button>
            </div>

            {/* Scratch Prizes Input */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Scratch Prizes</h2>
              {scratchPrizes.map((prize, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="text"
                    value={prize.name}
                    onChange={(e) => handlePrizeChange('scratch', index, 'name', e.target.value)}
                    placeholder="Scratch Prize Name"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    value={prize.quantity}
                    onChange={(e) => handlePrizeChange('scratch', index, 'quantity', e.target.value)}
                    placeholder="Quantity"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => handleRemovePrize('scratch', index)}
                    className="text-red-500 font-bold px-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddPrize('scratch')}
                className="border-2 border-black bg-blue-300 text-black px-2 py-1 rounded-lg hover:scale-105 transition-transform duration-150"
              >
                Add Another Scratch Prize
              </button>
            </div>

            {/* File Upload */}
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                setCsvFile(e.target.files[0]); // Set the selected file to state
                onFileChange(e); // Call the parent handler if needed
              }}
              className="mb-4"
            />

            <button
              onClick={handleUpload}
              className={`border-2 border-black bg-green-300 text-black px-4 py-2 rounded-lg transition-transform duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              disabled={loading} // Disable the button while loading
            >
              {loading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;
