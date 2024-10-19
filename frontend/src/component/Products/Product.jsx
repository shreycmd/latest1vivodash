import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Productdetails from './Productdetails';
import fetchwithauth from '../token';

const Product = () => {
  const [newProduct, setNewProduct] = useState({
    Name: '',
    Type: '',
    U_id: '', // For selecting IMEI or S.No
  });
  const [visible, setVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [bulkUploadVisible, setBulkUploadVisible] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [imeiOrSerial, setImeiOrSerial] = useState(''); // State for IMEI or Serial Number

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetchwithauth(import.meta.env.VITE_BACKEND_URL+`/product?limit=20&page=${currentPage}`);
        const data = await response.json();
        setProducts(data.data);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: name === "Name" ? value.trim() : value });
  };

  const addProduct = async (e) => {
    e.preventDefault();
    setVisible(false);
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL+'/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      const result = await response.json();
      alert(result.message);
      setProducts((prevProducts) => [...prevProducts, newProduct]);
      setNewProduct({ Name: '', Type: '', U_id: '' }); // Reset the new product state
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleImeiOrSerialChange = (e) => {
    setImeiOrSerial(e.target.value);
  };

  const submitBulkUpload = async () => {
    if (!csvFile || !imeiOrSerial) {
      alert('Please select a CSV file and enter IMEI or Serial Number.');
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('uniqueIdentifier', imeiOrSerial); // Append the IMEI or Serial Number

    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL+'/upload-products', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload products');
      }

      const result = await response.json();
      alert(result.message);
      setBulkUploadVisible(false);
      setCsvFile(null);
      setImeiOrSerial(''); // Reset the IMEI/Serial input field
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center text-3xl font-bold mb-4">PRODUCT DETAILS</div>

      <hr className="my-4 border-gray-400" />

      {/* Buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          className="bg-blue-500 text-black px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-150"
          onClick={() => setVisible(true)}
        >
          Add Product
        </button>
        <button
          className="bg-blue-500 text-black px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-150"
          onClick={() => setBulkUploadVisible(!bulkUploadVisible)}
        >
          Upload CSV
        </button>
      </div>

      {/* Form for adding a new product */}
      {visible && (
        <form onSubmit={addProduct} className="bg-black shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="Name"
              placeholder="Product Name"
              value={newProduct.Name}
              onChange={handleInputChange}
              className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {/* Product Type Dropdown */}
            <select
              name="Type"
              value={newProduct.Type}
              onChange={handleInputChange}
              className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>Select Product Type</option>
              <option value="Phone">Phone</option>
              <option value="Accessory">Accessory</option>
            </select>
            {/* Unique ID Type Dropdown */}
            <select
              name="U_id"
              value={newProduct.U_id}
              onChange={handleInputChange}
              className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>Select Unique ID Type</option>
              <option value="IMEI">IMEI</option>
              <option value="S.No">S.No</option>
            </select>
            <button
              type="submit"
              className="bg-blue-500 text-black px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-150"
            >
              Submit
            </button>
          </div>
        </form>
      )}

      {/* CSV Upload */}
      {bulkUploadVisible && (
        <div className="bg-gray-400 shadow-lg rounded-lg p-4 mb-6">
          <input type="file" accept=".csv" onChange={handleFileChange} className="mb-2" />
          <input
            type="text"
            placeholder="Enter IMEI or Serial Number"
            value={imeiOrSerial}
            onChange={handleImeiOrSerialChange}
            className="border p-2 rounded-md mb-2"
            required
          />
          <button
            onClick={submitBulkUpload}
            className="bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-600 transition duration-150"
          >
            Upload CSV
          </button>
        </div>
      )}

      {/* Error Handling */}
      {error && <div className="text-red-500">Error: {error}</div>}

      {/* Product List */}
      <div className="flex flex-col gap-4">
        <Productdetails products={products} totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>

      <div className="mt-6 text-center">
        <Link to="/app" className="text-blue-500 hover:underline">Go to Dashboard</Link>
      </div>
    </div>
  );
};

export default Product;
