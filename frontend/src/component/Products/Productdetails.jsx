import  { useState, useEffect } from 'react';
import { Pagination } from './Pagination';
const Productdetails = ({ products , totalPages , currentPage , setCurrentPage }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({
    Name: '',
    Type: '',
    U_id: ''
  });
  
  const [productList, setProductList] = useState(products);
  const productsPerPage = 20;

  // Update the local product list when products prop changes
  
  useEffect(() => {
    setProductList(products);
  }, [products]);

  // Function to handle input changes for the edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProduct({ ...updatedProduct, [name]: value });
  };

  // Function to handle the PUT request for updating the product
  const updateProduct = async (Name) => {
    try {
      const response = await fetch(`http://localhost:3000/product/${Name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const result = await response.json();
      alert(result.message); // Show success message

      // Update the local product list to reflect the changes
      setProductList((prevProducts) =>
        prevProducts.map((product) =>
          product.Name === Name ? { ...product, ...updatedProduct } : product
        )
      );

      // Clear the edit form and stop editing
      setEditingProduct(null);
    } catch (err) {
      console.error(err.message);
      alert('Error updating product');
    }
  };

  // Function to handle the Update button click
  const handleUpdateClick = (product) => {
    setEditingProduct(product.Name);
    setUpdatedProduct({
      Name: product.Name,
      Type: product.Type,
      U_id: product.U_id,
    });
  };

  // Function to handle the DELETE request
  const deleteProduct = async (Name) => {
    try {
      const response = await fetch(`http://localhost:3000/product/${Name}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      const result = await response.json();
      alert(result.message); // Show success message

      // Remove the deleted product from the local state
      setProductList((prevProducts) =>
        prevProducts.filter((product) => product.Name !== Name)
      );
    } catch (err) {
      console.error(err.message);
      alert('Error deleting product');
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="mt-2 mx-auto max-w-6xl">
  <table className="min-w-full table-auto border-collapse shadow-lg bg-white rounded-lg overflow-hidden">
    <thead>
      <tr className="bg-gray-800 text-white">
        <th className="py-3 px-4 text-left">ID</th>
        <th className="py-3 px-4 text-left">Name</th>
        <th className="py-3 px-4 text-left">Type</th>
        <th className="py-3 px-4 text-left">U_id</th>
        <th className="py-3 px-4 text-left">Addedon</th>
        <th className="py-3 px-4 text-left">Action</th>
      </tr>
    </thead>
    <tbody>

    {
      productList.map((product, index) => (
      <tr
        key={product._id}
        className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
      >
        <td className=" ">{((currentPage - 1)*productsPerPage)+(index + 1)}</td>
        <td className="">
          {editingProduct === product.Name ? (
            <input
              type="text"
              name="Name"
              value={updatedProduct.Name}
              onChange={handleInputChange}
              className="border rounded  w-full"
            />
          ) : (
            product.Name
          )}
        </td>
        <td className="">
          {editingProduct === product.Name ? (
            <input
              type="text"
              name="Type"
              value={updatedProduct.Type}
              onChange={handleInputChange}
              className="border rounded w-full"
            />
          ) : (
            product.Type
          )}
        </td>
        <td className="">
          {editingProduct === product.Name ? (
            <input
              type="text"
              name="U_id"
              value={updatedProduct.U_id}
              onChange={handleInputChange}
              className="border rounded  w-full"
            />
          ) : (
            product.U_id
          )}
        </td>
        <td className="">
          {new Date(product.Addedon).toLocaleDateString()}
        </td>
        <td className=" flex space-x-2">
          {editingProduct === product.Name ? (
            <button
              className=" bg-green-500 text-black rounded-md hover:bg-green-600"
              onClick={() => updateProduct(product.Name)}
            >
              Save
            </button>
          ) : (
            <button
              className=" bg-blue-500 text-black rounded-md hover:bg-blue-600"
              onClick={() => handleUpdateClick(product)}
            >
              Update
            </button>
          )}
          <button
            className=" bg-red-500 text-black rounded-md hover:bg-red-600"
            onClick={() => deleteProduct(product.Name)}
          >
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
  </table>

  {/* Pagination Component */}
  <Pagination
    productsPerPage={productsPerPage}
    totalProducts={totalPages}
    paginate={paginate}
    currentPage={currentPage}
  />
</div>

  );
};

export default Productdetails
