import { useState, useEffect } from 'react';
import BulkUpload from './BulkUpload'
import useSessionStorage from './useSessionStorage';
import fetchwithauth from './token';

// Sub-component for listing campaigns

const CampaignList = ({ campaigns, onCreate, onDelete,onDown }) => (
  
  <ul className="list-disc ">
    {campaigns.map((campaign) => (
      <li key={campaign._id} className="flex gap-3  mb-2 list-disc">
        <span className="text-md ">{campaign.Name}</span>
        <div className="flex  gap-3">
          <button
            className="border-2 border-black bg-blue-300 text-black px-2 py-1 rounded-lg hover:scale-105 transition-transform duration-150"
            onClick={() => onCreate(campaign)}
            aria-label={`Create items for campaign ${campaign.Name}`}
          >
            Create
          </button>
          <button
            className="border-2 border-black bg-red-400 text-black px-2 py-1 rounded-lg hover:scale-105 transition-transform duration-150"
            onClick={() => onDelete(campaign.Name)}
            aria-label={`Delete campaign ${campaign.Name}`}
          >
            Delete
          </button>
          <button
            className="border-2 border-black bg-green-400 text-black px-2 py-1 rounded-lg hover:scale-105 transition-transform duration-150"
            onClick={() => onDown(campaign.Name)}
            aria-label={`Delete campaign ${campaign.Name}`}
          >
            Download
          </button>
        </div>
      </li>
    ))}
  </ul>
);

// Sub-component for bulk upload functionality








// Sub-component for the campaign item form
const CampaignForm = ({
  selectedCampaign,
  products,
  selectedProduct,
  setSelectedProduct,
  winnerImei,
  setWinnerImei,
  Scratchprize,
  setScratchprize,
  Wheelprize,
  setwheelprize,
  onSubmit,
  }) => (
  <div className="mt-6">
    <h2 className="text-xl font-bold">Create Item for Campaign: {selectedCampaign.Name}</h2>
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      {/* Campaign Name */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Campaign Name</label>
        <input
          type="text"
          value={selectedCampaign.Name}
          readOnly
          className="w-fit px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* Select Product */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Select Product:</label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          required
          className="w-fit px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a Product</option>
          {products.map((product, index) => (
            <option key={`${product}-${index}`} value={product}>
              {product}
            </option>
          ))}
        </select>
      </div>

      {/* Winner IMEI */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Winner IMEI:</label>
        <input
          type="text"
          value={winnerImei}
          onChange={(e) => setWinnerImei(e.target.value)}
          required
          className="w-fit px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Wheel Prize */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Wheel Prize:</label>
        <input
          type="text"
          value={Wheelprize}
          onChange={(e) => setwheelprize(e.target.value)}
          className="w-fit px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {/*scratch prize*/ }
      
      <div>
      <label className="block text-gray-700 font-medium mb-1">Scratchprize:</label>
      <input
        type="text"
        value={Scratchprize}
        onChange={(e) => setScratchprize(e.target.value)}
        className="w-fit px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
      <button
        type="submit"
        className="w-fit bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Submit
      </button>
    </form>
  </div>
);
// Sub-component for displaying campaign items

const CitemsTable = ({
  role,
  citems,
  onEdit,
  onDelete,
  editingItemImei,
  editWinnerImei,
  setEditWinnerImei,
  editwheelprize,
  Seteditwheelprize,
  editscratchprize,
  Seteditscratchprize,
  onUpdate,
  onCancelUpdate,
}) => (
 
  <div className="mt-6 overflow-x-auto">
    <h3 className="text-sm font-bold">Citems for {citems[0]?.Campaign_Name}</h3>
    <table className="min-w-[300px] mt-4 border-collapse border border-gray-300 bg-white shadow-lg">
      <thead className="bg-indigo-600 text-white">
        <tr>
          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Product</th>
          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Winner IMEI</th>
         {role=='main'? <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Wheel Prize</th>:null}
         {role=='main'? <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Scratch Prize</th>:null}
          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Claimed on</th>
          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">WinnerName</th>
          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Added on</th>
          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Action</th>
        
        </tr>
      </thead>
      <tbody>
        {citems.length > 0 ? (
          citems.map((item, index) => (
            <tr
              key={item.WinnerImei}
              className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} transition duration-200 hover:bg-gray-100`}
            >
              <td className="border border-gray-300 px-4 py-2">{item.Selectedproduct}</td>
              <td className="border border-gray-300 px-4 py-2">{item.WinnerImei}</td>
             {role=='main'?<td className="border border-gray-300 px-4 py-2">{item.Wheelprize}</td> :null} 
             {role=='main'?<td className="border border-gray-300 px-4 py-2">{item.Scratchprize}</td> :null} 
              <td className="border border-gray-300 px-4 py-2">{item.Claimedon? new Date(item.Claimedon).toLocaleDateString(): '-'}</td>
              <td className="border border-gray-300 px-4 py-2">{item.WinnerName? item.WinnerName:"-"}</td>
              <td className="border border-gray-300 px-4 py-2">
                {item.Addedon ? new Date(item.Addedon).toLocaleDateString() : '-'}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="flex space-x-2">{role=='main'?<button
                  className="border-2 border-black bg-green-500 text-white px-2 py-1 rounded-lg hover:scale-105 transition-transform duration-150"
                  onClick={() => onEdit(item)}
                  aria-label={`Edit item with IMEI ${item.WinnerImei}`}
                >
                  Update
                </button>:null}
                  
                  <button
                    className="border-2 border-black bg-red-500 text-white px-2 py-1 rounded-lg hover:scale-105 transition-transform duration-150"
                    onClick={() => onDelete(item.Campaign_Name,item.WinnerImei)}
                    aria-label={`Delete item with IMEI ${item.WinnerImei}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="border border-gray-300 px-4 py-2 text-center text-gray-500">
              No items available
            </td>
          </tr>
        )}

        {/* Edit Row */}
        {editingItemImei && (
          <tr className="bg-yellow-50">
            <td className="border border-gray-300 px-4 py-2">{citems[0]?.Campaign_Name || '-'}</td>
            <td className="border border-gray-300 px-4 py-2">
              <input
                type="text"
                value={editWinnerImei}
                onChange={(e) => setEditWinnerImei(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded"
              />
            </td>
            <td className="border border-gray-300 px-4 py-2">
              <input
                type="text"
                value={editwheelprize}
                onChange={(e) => Seteditwheelprize(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded"
              />
            </td> <td className="border border-gray-300 px-4 py-2">
              <input
                type="text"
                value={editscratchprize}
                onChange={(e) => Seteditscratchprize(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded"
              />
            </td>
            <td className="border border-gray-300 px-4 py-2">-</td>
            <td className="border border-gray-300 px-4 py-2">-</td>
            <td className="border border-gray-300 px-4 py-2">
              <div className="flex space-x-2">
                <button
                  className="border-2 border-black bg-blue-500 text-white px-2 py-1 rounded-lg hover:scale-105 transition-transform duration-150"
                  onClick={onUpdate}
                  aria-label="Save changes"
                >
                  Save
                </button>
                <button
                  className="border-2 border-black bg-gray-500 text-white px-2 py-1 rounded-lg hover:scale-105 transition-transform duration-150"
                  onClick={onCancelUpdate}
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const Citem = () => {
  const [role]=useSessionStorage('role')
  // Track if there's more data for "next" pagination
const [isFirstPage, setIsFirstPage] = useState(true); // Track if on the first page

  const [csvFile, setCsvFile] = useState(null);
  
  const [currentPage,setcurrentPage]=useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [winnerImei, setWinnerImei] = useState('');
  const [Scratchprize,setScratchprize]=useState('');
  const [Wheelprize, setwheelprize] = useState('');
  const [products, setProducts] = useState([]);
  const [citems, setCitems] = useState([]);
  const [error, setError] = useState(null);
  const [bulkUploadVisible, setBulkUploadVisible] = useState(false);
  const [lastId, setLastId] = useState(null); // For pagination cursor
const [hasMoreData, setHasMoreData] = useState(true);
  const [searchImei, setSearchImei] = useState('');
  // State for editing items
  const [editingItemImei, setEditingItemImei] = useState(null);
  const [editWinnerImei, setEditWinnerImei] = useState('');
  const [editwheelprize, Seteditwheelprize] = useState('');
  const [editscratchprize,seteditscratchprize]=useState('')

  // Fetch campaigns from the backend
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetchwithauth(import.meta.env.VITE_BACKEND_URL+'/campaign');
        const result = await response.json();
        console.log(result)
        if (response.ok) {
          setCampaigns(result.data);
        } else {
          console.error('Error fetching campaigns:', result.message);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchCampaigns();
  }, []);

  // Handle campaign selection and data fetching
  useEffect(() => {
    if (selectedCampaign) {
      handleCreateClick(selectedCampaign);
    }
  }, [selectedCampaign]);

  const handleSearch = async (searchTerm) => {
    if(searchTerm.length==0){
      setCitems(currentPage)
    }
    else{
    try {
      
      const response = await fetchwithauth(import.meta.env.VITE_BACKEND_URL+`/search-imei/${selectedCampaign.Name}/${searchTerm}`);
      const result = await response.json();
      
      if (response.ok) {
        setCitems(result.data); // Assuming you want to update your state with the search results
      } else {
        console.error('No records found:', result.message);
        setCitems([]); // Clear the items if no records found
      }
    } catch (error) {
      console.error('Search error:', error);
      setCitems([]); // Clear the iStems in case of an error
    }
  }};
const handleNext = async () => {
  await handleCreateClick(selectedCampaign, "next");
};

// Fetch previous set of data
const handlePrevious = async () => {
  await handleCreateClick(selectedCampaign, "previous");
};
const handleCreateClick = async (campaign, direction = "next") => {
  setSelectedCampaign(campaign);
  setProducts(campaign.Products);

  try {
      const response = await fetchwithauth(
          import.meta.env.VITE_BACKEND_URL+`/citemnew/${campaign.Name}?lastId=${lastId || ""}&direction=${direction}`
      );
      const result = await response.json();

      if (response.ok) {
          if (result.data.length > 0) {
              setCitems(result.data);
              setcurrentPage(result.data)
              

              // Update lastId and pagination states
              if (direction === "next") {
                  setLastId(result.data[result.data.length - 1]._id); // Set last item ID
                  setIsFirstPage(false); // Not the first page anymore
              } else if (direction === "previous") {
                  setLastId(result.data[0]._id); // Set first item ID
              }

              setHasMoreData(result.data.length === 10); // Assume a limit of 10 items per page
          } else {
              setHasMoreData(false);
          }
      } else {
          console.error("Error fetching Citem data:", result.message);
          setCitems([]);
      }
  } catch (error) {
      console.error("Fetch error:", error);
      setCitems([]);
  }
};

  // Handle form submission for creating a new item
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL+'/citems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Campaign_Name: selectedCampaign.Name,
          Selectedproduct: selectedProduct,
          WinnerImei: winnerImei,
          Wheelprize: Wheelprize,
          Scratchprize:Scratchprize,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Campaign item created successfully!');
        handleCreateClick(selectedCampaign);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  // Handle update initiation
  const handleInitiateUpdate = (item) => {
    setEditingItemImei(item.WinnerImei);
    setEditWinnerImei(item.WinnerImei);
    Seteditwheelprize(item.Wheelprize);
    setScratchprize(item.Scratchprize)
  };

  // Handle update submission
  const handleUpdate = async (e) => {
    console.log("edit wheel prize is",editwheelprize)
    console.log("edit scratch prize",)
    e.preventDefault();
    try {
      const response = await fetchwithauth(import.meta.env.VITE_BACKEND_URL+`/ncitems/${selectedCampaign.Name}/${editingItemImei}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          WinnerImei: editWinnerImei,
          Wheelprize: editwheelprize,
          Scratchprize:editscratchprize
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setEditingItemImei(null);
        setEditWinnerImei('');
        Seteditwheelprize('');
        setScratchprize('')
        handleCreateClick(selectedCampaign); // Refresh the items
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  // Handle canceling the update
  const handleCancelUpdate = () => {
    setEditingItemImei(null);
    setEditWinnerImei('');
    Seteditwheelprize('');
    setScratchprize('')
  };

  // Handle campaign deletion
  const handleDelc = async (cname) => {
    if (window.confirm(`Are you sure you want to delete the campaign "${cname}"?`)) {
      try {
        const response = await fetchwithauth(import.meta.env.VITE_BACKEND_URL+`/campaign/${cname}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (response.ok) {
          alert(result.message);
          // Optionally, refresh the campaigns list
          setCampaigns(campaigns.filter((campaign) => campaign.Name !== cname));
          if (selectedCampaign?.Name === cname) {
            setSelectedCampaign(null);
            setCitems([]);
          }
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };
  const handleDownload = async (campaignName) => {
    try {
      const response = await fetchwithauth(import.meta.env.VITE_BACKEND_URL+`/export-citems?condition=${campaignName}&role=${role}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob(); // Get the response as a blob
        const url = window.URL.createObjectURL(blob); // Create a URL for the blob
        const a = document.createElement('a'); // Create a link element
        a.href = url; // Set the href to the blob URL
        a.download = `${campaignName}-citems.csv`; // Set the default file name
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


  // Handle delete of a campaign item
  const handleDelete = async (campaignName,WinnerImei) => {
    if (window.confirm(`Are you sure you want to delete the item with IMEI "${WinnerImei}"?`)) {
      try {
        const response = await fetchwithauth(import.meta.env.VITE_BACKEND_URL+`/ncitems/${campaignName}/${WinnerImei}`, {
          method: 'DELETE',
        });

        const result = await response.json();
        if (response.ok) {
          alert(result.message);
          handleCreateClick(selectedCampaign); // Refresh the items
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };


  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]); // Set the selected file to state
  };
  return (
    <div className="p-6 flex flex-col lg:flex-row">
      {/* Campaigns List */}
      <div className="flex-1 mr-4">
        <div className="flex gap-5 items-center mb-4">
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <button
            className="border-2 border-black bg-green-500 px-2  text-black  rounded-lg hover:bg-green-600 transition-colors duration-150"
            onClick={() => setBulkUploadVisible(true)}
            aria-label="Bulk Upload Campaign Items"
          >
          Upload
          </button>
        </div>

        <CampaignList campaigns={campaigns} onCreate={handleCreateClick} onDelete={handleDelc} onDown={handleDownload}/>

        {/* Bulk Upload Modal */}
        <BulkUpload
          visible={bulkUploadVisible}
          onFileChange={handleFileChange}
        campaignName={selectedCampaign?.Name}
          onClose={() => setBulkUploadVisible(false)}
        />

        {error && <div className="text-red-500 mt-2">Error: {error}</div>}

        {/* Form for Creating Item */}
        {selectedCampaign && (
          <CampaignForm
            selectedCampaign={selectedCampaign}
            products={products}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            winnerImei={winnerImei}
            setWinnerImei={setWinnerImei}
            Wheelprize={Wheelprize}
            Scratchprize={Scratchprize}
            setScratchprize={setScratchprize}
            setwheelprize={setwheelprize}
            onSubmit={handleSubmit}
          />
        )}
      </div>
      
      {/* Citems Table */}
      <div className="flex-1">
        {selectedCampaign && (<div>
          <div className="search-bar">
            <input
              type="text"
              value={searchImei}
              onChange={(e) => setSearchImei(e.target.value)}
              placeholder="Search by IMEI"
              className="border p-2 rounded"
            />
            <button onClick={() => handleSearch(searchImei)} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
              Search
            </button>
          </div>
          <CitemsTable
          role={role}
            citems={citems}
            onEdit={handleInitiateUpdate}
            onDelete={handleDelete}
            editingItemImei={editingItemImei}
            editWinnerImei={editWinnerImei}
            setEditWinnerImei={setEditWinnerImei}
            editscratchprize={editscratchprize}
            Seteditscratchprize={seteditscratchprize}
            editwheelprize={editwheelprize}
            Seteditwheelprize={Seteditwheelprize}
            onUpdate={handleUpdate}
            onCancelUpdate={handleCancelUpdate}
          /> 
          <div className="pagination-controls mt-4 flex justify-between">
    <button 
        onClick={handlePrevious} 
        disabled={isFirstPage} // Disable on the first page
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
    >
        Previous
    </button>
    
    <button 
        onClick={handleNext} 
        disabled={!hasMoreData} // Disable if no more data
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
    >
        Next
    </button>
</div>

      
          </div>
          
        )}
      </div>
    </div>
  );
};

export default Citem;
