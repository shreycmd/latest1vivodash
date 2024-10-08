import React, { useState } from 'react';

const Claimedproduct = ({ claimedProducts ,cmpname }) => {
  const [selectedImage, setSelectedImage] = useState(null);
console.log(cmpname ,"name is")
  const displayImg = (rl) => {
    setSelectedImage(`http://localhost:3000/${rl}`);
  };
  const handleDownload = async (cmpname) => {
    try {
      const response = await fetch(`http://localhost:3000/export-wcitems?condition=win_${cmpname}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob(); // Get the response as a blob
        const url = window.URL.createObjectURL(blob); // Create a URL for the blob
        const a = document.createElement('a'); // Create a link element
        a.href = url; // Set the href to the blob URL
        a.download = `${cmpname}-citems.csv`; // Set the default file name
        document.body.appendChild(a); // Append link to the body
        a.click(); // Programmatically click the link to trigger download
        a.remove(); // Remove the link from the document
        window.URL.revokeObjectURL(url); // Clean up URL object
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
          {claimedProducts.map((item, index) => (
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

      {/* Conditionally render the image in a modal or separate section */}
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
      <button onClick={()=>handleDownload(cmpname)}>Download</button>
    </div>
  );
};

export default Claimedproduct;
