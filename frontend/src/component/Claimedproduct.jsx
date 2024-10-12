import React, { useState } from 'react';

const Claimedproduct = ({ claimedProducts, cmpname }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [citems, setCitems] = useState(claimedProducts); // State for items to display
  const [searchImei, setSearchImei] = useState(''); // Search term state

  const displayImg = (rl) => {
    setSelectedImage(import.meta.env.VITE_BACKEND_URL+`/${rl}`);
  };

  const handleSearch = async () => {
    const searchTerm = searchImei.trim();

    if (searchTerm.length === 0) {
      // Reset to initial claimedProducts when search term is empty
      setCitems(claimedProducts);
    } else {
      try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL+`/search-wimei/${cmpname}/${searchTerm}`);
        const result = await response.json();

        if (response.ok) {
          setCitems(result.data);
        } else {
          console.error('No records found:', result.message);
          setCitems([]); // Clear items if no records found
        }
      } catch (error) {
        console.error('Search error:', error);
        setCitems([]); // Clear items in case of an error
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL+`/export-wcitems?condition=win_${cmpname}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cmpname}-citems.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download CSV: ' + (await response.json()).message);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file.');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter IMEI to search"
        value={searchImei}
        onChange={(e) => setSearchImei(e.target.value)}
        className="px-4 py-2 border rounded mr-2"
      />
      <button onClick={handleSearch} className="px-4 py-2 bg-blue-500 text-white rounded">
        Search
      </button>
      <button onClick={handleDownload} className="ml-2 px-4 py-2 bg-green-500 text-white rounded">
        Download
      </button>

      <table className="min-w-full table-auto border-collapse shadow-lg bg-white rounded-lg overflow-hidden mt-4">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="py-3 px-4 text-left">Winner Name</th>
            <th className="py-3 px-4 text-left">Winner IMEI</th>
            <th className="py-3 px-4 text-left">Claimed On</th>
            <th className="py-3 px-4 text-left">Location</th>
            <th className="py-3 px-4 text-left">Prize</th>
            <th className="py-3 px-4 text-left">Invoice</th>
          </tr>
        </thead>
        <tbody>
          {citems.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-3 px-4">{item.WinnerName}</td>
              <td className="py-3 px-4">{item.WinnerImei}</td>
              <td className="py-3 px-4">{new Date(item.Claimedon).toLocaleDateString()}</td>
              <td className="py-3 px-4">{item.location}</td>
              <td className="py-3 px-4">{item.Prize}</td>
              <td className="py-3 px-4">
                <button onClick={() => displayImg(item.invoice)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="relative bg-white p-4 rounded-lg max-w-screen-lg max-h-screen-lg">
            <img
              src={selectedImage}
              alt="Invoice"
              className="w-full h-full object-contain"
              style={{ maxWidth: '90vw', maxHeight: '90vh' }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-0 right-0 m-2 text-white bg-red-500 rounded-full px-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Claimedproduct;
