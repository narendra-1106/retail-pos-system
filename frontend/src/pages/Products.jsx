import { useEffect, useState } from "react";

import api from "../api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";


function Products() {

  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");

  const [price, setPrice] = useState("");

  const [quantity, setQuantity] = useState("");

  const [category, setCategory] = useState("");

  const [editingId, setEditingId] = useState(null);


  // FETCH PRODUCTS

  const fetchProducts = async () => {

    try {

      const response = await api.get("/products");
      setProducts(response.data);

    } catch (error) {

      console.log(error);

    }
  };


  // ADD PRODUCT

  const addProduct = async () => {

    try {

      await api.post("/products/add", {
        name,
        price,
        quantity,
        category
      });

      fetchProducts();

      setName("");
      setPrice("");
      setQuantity("");
      setCategory("");

    } catch (error) {

      console.log(error);

    }
  };


  // DELETE PRODUCT

  const deleteProduct = async (id) => {

    try {

      await api.delete(`/products/${id}`);

      fetchProducts();

    } catch (error) {

      console.log(error);

    }
  };

  const editProduct = (product) => {

    setEditingId(product._id);

    setName(product.name);

    setPrice(product.price);

    setQuantity(product.quantity);

    setCategory(product.category);
  };

  

  const updateProduct = async () => {

    try {

      await api.put(`/products/${editingId}`, {
        name,
        price,
        quantity,
        category
      });

      fetchProducts();

      setEditingId(null);

      setName("");

      setPrice("");

      setQuantity("");

      setCategory("");

    } catch (error) {

      console.log(error);

    }
  };

  useEffect(() => {

    fetchProducts();

  }, []);


  return (

    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar />

      <div className="ml-64 w-full">

        <Navbar />

        <div className="p-6">

          <h1 className="text-3xl font-bold mb-6">
            Products
          </h1>


          {/* ADD PRODUCT FORM */}

          <div className="bg-white p-6 rounded shadow mb-6">

            <div className="grid grid-cols-4 gap-4">

              <input
                type="text"
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-3 rounded"
              />

              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border p-3 rounded"
              />

              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border p-3 rounded"
              />

              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border p-3 rounded"
              />

            </div>

            <button
              onClick={
                editingId ? updateProduct : addProduct
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded mt-4"
            >
              {editingId ? "Update Product" : "Add Product"}
            </button>

          </div>


          {/* PRODUCTS TABLE */}

          <table className="w-full bg-white rounded-xl shadow-lg">
            <thead className="bg-black text-white">

              <tr>

                <th className="p-4">Name</th>

                <th className="p-4">Price</th>

                <th className="p-4">Quantity</th>

                <th className="p-4">Category</th>

                <th className="p-4">Action</th>

              </tr>

            </thead>

            <tbody>

              {products.map((product) => (

                <tr
                  key={product._id}
                  className="text-center border-b"
                >

                  <td className="p-4">
                    {product.name}
                  </td>

                  <td className="p-4">
                    ₹{product.price}
                  </td>

                  <td className="p-4">
                    {product.quantity}
                  </td>

                  <td className="p-4">
                    {product.category}
                  </td>

                  <td className="p-4">

                      <div className="flex justify-center gap-2">
                      <button
                        onClick={() => editProduct(product)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      >
                        Delete
                      </button>
                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Products;