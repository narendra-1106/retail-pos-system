import { useCallback, useEffect, useState } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { HiOutlineSearch, HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlinePlusCircle } from "react-icons/hi";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [barcode, setBarcode] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("active");
  const [editingId, setEditingId] = useState(null);

  // Search/Filters states
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [role, setRole] = useState("user");

  // Inline Category creation
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCatForm, setShowCatForm] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role) setRole(user.role);
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const query = `/products?page=${page}&limit=10&search=${search}&category=${filterCategory}&status=${filterStatus}`;
      const response = await api.get(query);
      setProducts(response.data.data || []);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCategory, filterStatus]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !category) {
      alert("Name, category, and price are required");
      return;
    }

    try {
      await api.post("/products/add", {
        name,
        price: parseFloat(price),
        stock: parseInt(quantity, 10) || 0,
        category,
        barcode,
        image,
        status
      });

      fetchProducts();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product");
    }
  };

  // Update Product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${editingId}`, {
        name,
        price: parseFloat(price),
        stock: parseInt(quantity, 10) || 0,
        category,
        barcode,
        image,
        status
      });

      fetchProducts();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update product");
    }
  };

  // Create Category inline
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      await api.post("/categories", { name: newCategoryName });
      setNewCategoryName("");
      setShowCatForm(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Category creation failed");
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete product");
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setName(product.productName || product.name);
    setPrice(product.price);
    setQuantity(product.quantity !== undefined ? product.quantity : product.stock);
    setCategory(product.category?._id || product.category);
    setBarcode(product.barcode || "");
    setImage(product.image || "");
    setStatus(product.status || "active");
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setQuantity("");
    setCategory("");
    setBarcode("");
    setImage("");
    setStatus("active");
    setShowAddForm(false);
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar />
      <div className="ml-0 md:ml-72 w-full flex flex-col">
        <Navbar />

        <div className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">Inventory Catalog</p>
              <h1 className="text-3xl font-extrabold tracking-tight">Products Management</h1>
            </div>
            {role === "admin" && (
              <button
                onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition flex items-center gap-2"
              >
                <HiOutlinePlus className="h-5 w-5" />
                {showAddForm ? "Hide Form" : "Add Product"}
              </button>
            )}
          </div>

          {/* ADD / EDIT PRODUCT FORM */}
          {role === "admin" && showAddForm && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fadeIn">
              <h3 className="text-lg font-bold mb-4">{editingId ? "Edit Product Details" : "Register New Product"}</h3>
              <form onSubmit={editingId ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Product Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Wireless Mouse"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-sm"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Price (INR) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-sm"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Stock Quantity</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-bold text-slate-500 flex justify-between">
                      <span>Category *</span>
                      <button
                        type="button"
                        onClick={() => setShowCatForm(!showCatForm)}
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <HiOutlinePlusCircle className="h-3.5 w-3.5" /> Create
                      </button>
                    </label>
                    
                    {!showCatForm ? (
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-sm"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex gap-1.5 mt-0.5">
                        <input
                          type="text"
                          placeholder="New category name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="flex-1 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-2 rounded-xl"
                        />
                        <button type="button" onClick={handleCreateCategory} className="bg-blue-600 text-white rounded-xl px-3 text-xs font-bold">Add</button>
                        <button type="button" onClick={() => setShowCatForm(false)} className="text-[10px] text-slate-500">Back</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Barcode Identifier</label>
                    <input
                      type="text"
                      placeholder="e.g. 890123456789"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Product Image URL</label>
                    <input
                      type="url"
                      placeholder="e.g. https://domain.com/image.jpg"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {editingId ? "Update Product" : "Create Product"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SEARCH FILTERS */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <HiOutlineSearch className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder="Search product name or barcode..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 pl-11 pr-4 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* PRODUCTS LIST TABLE */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-2 text-xs text-slate-400">Loading catalog items...</p>
              </div>
            ) : products.length === 0 ? (
              <p className="py-20 text-center text-sm text-slate-400">No products found in system catalog</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Image</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Product Name</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Barcode</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Price</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Stock Qty</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                      {role === "admin" && (
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-6 py-4">
                          <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            {product.image ? (
                              <img src={product.image} alt={product.productName} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[8px] font-bold text-slate-400">NO IMG</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">{product.productName || product.name}</td>
                        <td className="px-6 py-4 text-sm font-mono text-slate-400">{product.barcode || "N/A"}</td>
                        <td className="px-6 py-4 text-sm font-black text-blue-600 dark:text-blue-400">₹{product.price.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${
                            product.quantity < 10 ? "bg-rose-100 text-rose-700 dark:bg-rose-950/20" : "bg-green-100 text-green-700 dark:bg-green-950/20"
                          }`}>
                            {product.quantity !== undefined ? product.quantity : product.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {product.category?.name || "Uncategorized"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            product.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        {role === "admin" && (
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => startEdit(product)}
                                className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl"
                                title="Edit"
                              >
                                <HiOutlinePencil className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => deleteProduct(product._id)}
                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl"
                                title="Delete"
                              >
                                <HiOutlineTrash className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-500">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Products;