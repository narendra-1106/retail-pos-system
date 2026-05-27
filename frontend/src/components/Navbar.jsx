function Navbar() {
  return (

    <div className="bg-white shadow p-4 flex justify-between items-center">

      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Admin
      </button>

    </div>
  );
}

export default Navbar;