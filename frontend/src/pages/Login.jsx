import { useNavigate } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/dashboard");
    };

    return (

        <div className="flex justify-center items-center h-screen bg-gray-900">

            <div className="bg-white p-10 rounded-xl w-96 shadow-2xl">

                <h1 className="text-3xl font-bold text-center mb-6">
                    Admin Login
                </h1>

                <input
                    type="email"
                    placeholder="Enter Email"
                    className="w-full border p-3 mb-4 rounded"
                />

                <input
                    type="password"
                    placeholder="Enter Password"
                    className="w-full border p-3 mb-4 rounded"
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white p-3 rounded"
                >
                    Login
                </button>

            </div>

        </div>
    );
}

export default Login;